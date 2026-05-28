# NestJS TypeORM – Setup und Konfiguration

Die Integration von TypeORM in eine NestJS-Codebase umfasst zwei verschiedene Schichten. Zum einen gibt es `typeorm` selbst, das den Datenbanktreiber, die Query-Generierung und das Entity-Mapping übernimmt. Zum anderen gibt es `@nestjs/typeorm`, einen Integrations-Wrapper. Dieser verbindet den ORM mit dem NestJS Dependency-Injection-Container (DI) und verwandelt Datenbankverbindungen und Repositories in injizierbare Provider.

Die Konfiguration gliedert sich bewusst in zwei Phasen. Die Datenbankverbindung wird einmalig im Anwendungs-Root konfiguriert, und es wird explizit festgelegt, auf welche Tabellen innerhalb jedes Feature-Moduls zugegriffen werden darf. Das erzwingt strikte Domain-Grenzen.

## Erforderliche Pakete

Ein Standard-NestJS-Setup mit SQLite benötigt vier spezifische Pakete:

```bash
npm install @nestjs/typeorm typeorm better-sqlite3
npm install -D @types/better-sqlite3
```

- `@nestjs/typeorm`: Das NestJS-Integrationsmodul.
- `typeorm`: Die eigentliche ORM-Bibliothek.
- `better-sqlite3`: Der moderne, hochperformante, synchrone SQLite-Treiber für Node.js. Er vermeidet den Event-Loop-Overhead älterer asynchroner Treiber.

## Root-Konfiguration: Die Verbindung aufbauen

Die Anwendung benötigt einen einzigen Connection Pool zu SQLite. Dieser wird im Root-`AppModule` über `TypeOrmModule.forRoot()` definiert. Diese Methode wird beim Anwendungsstart genau einmal ausgeführt.

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Boardgame } from "./boardgame/boardgame.entity";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "better-sqlite3",
      database: "/data/boardgames.sqlite",
      entities: [Boardgame],
      synchronize: true,
      logging: false,
      enableWAL: true,
      statementCacheSize: 100,
    }),
  ],
})
export class AppModule {}
```

Erklärung der einzelnen Optionen:

- **`entities`**: Ein Array von Klassenreferenzen (wie im vorherigen Beispiel). TypeORM leitet daraus seine interne Schema-Darstellung ab. Ist eine Entity hier nicht aufgeführt, ist die entsprechende Tabelle für TypeORM unsichtbar.
- **`synchronize`**: Bei `true` vergleicht TypeORM beim Start deine TypeScript-Entities mit dem tatsächlichen Datenbankschema und führt automatisch `CREATE TABLE`- oder `ALTER TABLE`-Anweisungen aus, um die Datenbank an den Code anzupassen. **Im Produktivbetrieb unbedingt deaktivieren.** Wenn du eine Property umbenennst, kann TypeORM Spalten still und leise löschen – mit katastrophalem Datenverlust als Folge. Für Produktions-Schema-Änderungen verwenden wir Migrationen.
- **`logging`**: Gibt die generierten SQL-Abfragen in der Konsole aus. Nützlich, wenn eine Abfrage langsam ist und du die erzeugten JOINs prüfen möchtest.
- **`enableWAL` & `statementCacheSize`**: Aktivieren Write-Ahead Logging und Query-Caching. Damit kann SQLite mehrere gleichzeitige Lese- und Schreibzugriffe verwalten, ohne die Datenbank zu sperren – eine wichtige Einstellung für Webserver.

## Feature-Scoping: Domain-Grenzen

Das Öffnen eines Connection Pools macht die Datenbank nicht automatisch für alle Services zugänglich. NestJS erzwingt Modul-Kapselung. Ein Service innerhalb des `BoardgameModule` kann nicht ohne Weiteres auf die `Boardgame`-Tabelle zugreifen – der Zugriff muss explizit gewährt werden.

Dieser Zugriff wird über `TypeOrmModule.forFeature()` erteilt:

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Boardgame } from "./boardgame.entity";
import { BoardgameService } from "./boardgame.service";

@Module({
  imports: [TypeOrmModule.forFeature([Boardgame])],
  providers: [BoardgameService],
})
export class BoardgameModule {}
```

Dieser Aufruf registriert ein `Repository<Boardgame>` ausschließlich im Scope des `BoardgameModule`. Durch diese Aufteilung stellt NestJS sicher, dass ein später erstelltes Modul – etwa ein `InvoicingModule` – nicht versehentlich `Boardgame`-Datensätze verändern kann, solange die Entity nicht explizit in dessen Scope importiert wird.

## Exkurs: Asynchrone Konfiguration für Remote-Datenbanken

Während SQLite nur einen lokalen Dateipfad benötigt, verbinden sich Produktionsanwendungen häufig mit entfernten Datenbankclustern wie PostgreSQL. Zugangsdaten direkt im `AppModule` zu hinterlegen, ist ein kritisches Sicherheitsproblem. Anwendungen müssen Credentials aus Umgebungsvariablen beziehen.

NestJS stellt dafür das Paket `@nestjs/config` bereit. Da die `.env`-Datei eingelesen sein muss, bevor eine Netzwerkverbindung zur Datenbank hergestellt wird, ersetzen wir `forRoot` durch `forRootAsync`:

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Boardgame } from "./boardgame/boardgame.entity";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("DB_HOST"),
        port: config.get<number>("DB_PORT"),
        username: config.get<string>("DB_USER"),
        password: config.get<string>("DB_PASSWORD"),
        database: config.get<string>("DB_NAME"),
        entities: [Boardgame],
        synchronize: false,
      }),
    }),
  ],
})
export class AppModule {}
```

Die `useFactory`-Funktion stellt sicher, dass der DI-Container den `ConfigService` vollständig auflöst, bevor TypeORM versucht, den Postgres-Connection-Pool aufzubauen.

> Vergiss nicht, den passenden Treiber zu installieren (z. B. `npm install pg`), wenn du mit PostgreSQL arbeitest.

## Ressourcen

- [TypeORM-Dokumentation](https://typeorm.io)