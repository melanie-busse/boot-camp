# NestJS TypeORM – Datenbankmigrationen

In der frühen Prototyp-Phase fühlt sich `synchronize: true` wie Magie an. Du fügst deiner TypeScript-Klasse eine Property hinzu, speicherst die Datei – und die Spalte erscheint sofort in der Datenbank.

In einer Produktionsumgebung ist `synchronize: true` eine ernste Gefahr für deine persönlichen oder unternehmenseigenen Daten. Wenn du eine Property von `firstName` in `givenName` umbenennst, versteht TypeORM deine Absicht nicht. Es sieht lediglich, dass `firstName` fehlt und `givenName` neu ist. Die Reaktion: ein `DROP COLUMN`, gefolgt von einem `ADD COLUMN`. Sobald das gegen eine Live-Datenbank ausgeführt wird, sind die Namen aller Nutzer dauerhaft gelöscht.

Eine Datenbank kann nicht sicher erraten, wie sich ihr Schema entwickeln soll. Diese Entwicklung steuern wir bewusst mit **Migrationen**.

Eine Migration ist eine versionierte TypeScript-Datei mit expliziten Anweisungen, wie das Datenbankschema verändert werden soll (die `up`-Methode) und wie genau diese Änderung rückgängig gemacht wird (die `down`-Methode). Statt eines beweglichen Ziels wird dein Datenbankschema zu einer streng geordneten, reproduzierbaren Abfolge angewendeter Skripte.

## Die CLI-Lücke: `data-source.ts`

Um Migrationen zu generieren und auszuführen, verwenden wir die TypeORM CLI. Es gibt jedoch ein grundlegendes architektonisches Problem: Die CLI ist ein eigenständiges Node-Skript. Es weiß nichts von NestJS, deinem `AppModule` oder dem zuvor eingerichteten `@nestjs/config`-DI-Container.

Du musst der CLI eine eigene Konfigurationsdatei bereitstellen, typischerweise im Projektstamm unter `src/data-source.ts`:

```typescript
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Boardgame } from "./boardgame/boardgame.entity";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: "/data/boardgames.sqlite",
  entities: [Boardgame],
  migrations: ["src/migrations/*.ts"],
  synchronize: false, // Hier absolut zwingend zu deaktivieren
});
```

Da deine laufende NestJS-App und die TypeORM CLI nun dieselben Entities teilen, Zugangsdaten aber unterschiedlich laden, musst du sicherstellen, dass beide auf exakt dieselbe SQLite-Datenbankdatei zeigen.

> Wenn du das Remote-Postgres-Setup aus dem Exkurs verwendest, würdest du hier `dotenv.config()` nutzen, um deine Verbindungsdaten zu laden.

## Die CLI in `package.json` einbinden

Die rohe TypeORM CLI erfordert verschachtelte Flags und die direkte Ausführung über `ts-node`, um deine TypeScript-Dateien zu lesen. Füge diese Kurzskripte zu deiner `package.json` hinzu, um den Workflow zu vereinfachen:

```json
{
  "scripts": {
    "typeorm": "ts-node ./node_modules/typeorm/cli.js -d ./src/data-source.ts",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert"
  }
}
```

> Hinweis: Das `--` leitet alle nachfolgenden Argumente direkt an das zugrunde liegende `typeorm`-Skript weiter und umgeht npms eigenen Argument-Parser.

## Migrationen generieren und prüfen

Wenn du deine `Boardgame`-Entity veränderst – etwa durch das Hinzufügen einer `publishedYear`-Spalte – lässt du TypeORM die Differenz zwischen deinem Code und dem aktuellen Datenbankschema berechnen:

```bash
npm run migration:generate -- src/migrations/AddPublishedYear
```

TypeORM verbindet sich mit der Datenbank, prüft das aktive Schema, vergleicht es mit deinen Entity-Dateien und generiert eine Datei mit Zeitstempel wie `1716000000000-AddPublishedYear.ts`:

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPublishedYear1716000000000 implements MigrationInterface {
  name = "AddPublishedYear1716000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "boardgames" ADD "publishedYear" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "boardgames" DROP COLUMN "publishedYear"`,
    );
  }
}
```

**Führe eine automatisch generierte Migration niemals blind aus. Die CLI ist ein Rechner, kein Ingenieur.**

Wenn du eine Spalte in deiner Entity umbenennst, gibt die generierte Migration fast immer ein `DROP COLUMN` und ein `ADD COLUMN` aus. Du musst manuell eingreifen, die generierte Datei öffnen und diese beiden destruktiven Anweisungen durch ein einziges, sicheres `ALTER TABLE "boardgames" RENAME COLUMN "alterName" TO "neuerName"` ersetzen.

## Ausführen und Zurückrollen

Ausstehende Migrationen anwenden:

```bash
npm run migration:run
```

Im Hintergrund erstellt TypeORM eine Tracking-Tabelle namens `migrations`. Sie gleicht die Dateien in deinem `src/migrations`-Ordner mit dieser Tabelle ab und führt die `up`-Methode jedes Skripts aus, das noch nicht ausgeführt wurde.

SQLite hat hier einen großen Vorteil gegenüber Datenbanken wie MySQL: Es unterstützt vollständig DDL-Transaktionen (Data Definition Language). Schlägt eine Migration auf halbem Weg fehl – etwa durch einen Syntaxfehler –, rollt SQLite automatisch die gesamte Transaktion zurück. Die Datenbank wird nie in einem korrumpierten, halb migrierten Zustand hinterlassen.

Wenn du unmittelbar nach der Ausführung feststellst, dass eine Migration fehlerhaft war, kannst du sie zurückrollen:

```bash
npm run migration:revert
```

Dies löst die `down`-Methode der zuletzt angewendeten Migration aus und löscht deren Eintrag aus der Tracking-Tabelle.