# NestJS TypeORM – Entities

Eine Entity ist der verbindliche Bauplan für eine Datenbanktabelle. Sie ist eine einfache TypeScript-Klasse, die mit TypeORM-Decorators versehen wird.

Da diese einzelne Klasse mehrere Rollen übernimmt, haben deine Designentscheidungen hier weitreichende Konsequenzen. Die Entity legt fest:

- **Das physische Datenbankschema**: TypeORM liest die Decorators, um `CREATE TABLE`- und `ALTER TABLE`-Anweisungen in SQL zu generieren.
- **Typsicherheit zur Kompilierzeit**: Die Klasseneigenschaften definieren die TypeScript-Typen, die deine Services beim Umgang mit den Daten verwenden.
- **Hydration zur Laufzeit**: Wenn der Datenbanktreiber eine flache Datenzeile zurückgibt, fängt TypeORM diese Rohantwort ab. Anhand der Metadaten aus deinen Decorators (z. B. `@Column`) und der Klassenstruktur werden die rohen SQL-Werte in ein vollständig typisiertes JavaScript-Objekt überführt.

Ein falsch konfigurierter Spaltentyp pflanzt sich als `any`-Typ oder falsche Typannahme durch die gesamte Service-Schicht fort.

## Tabellendefinition: `@Entity`

Der `@Entity()`-Decorator markiert eine Klasse als verwaltete Datenbanktabelle. Eine einfache Klasse ohne diesen Decorator ist für TypeORM vollständig unsichtbar.

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("boardgames")
export class Boardgame {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
```

Standardmäßig verwendet TypeORM den kleingeschriebenen Klassennamen als Tabellenname (z. B. `boardgame`). Übergibt man dem Decorator einen String wie `@Entity("boardgames")`, wird der SQL-Tabellenname explizit gesetzt. Diese Entkopplung ermöglicht es, im TypeScript-Code singuläre Klassennamen (`Boardgame`) zu verwenden und gleichzeitig die Konvention pluralisierter Tabellennamen in der Datenbank einzuhalten.

## Primärschlüssel

Jede relationale Datenbanktabelle benötigt einen Primärschlüssel zur eindeutigen Identifikation von Zeilen. TypeORM stellt dafür spezifische Decorators bereit:

- **`@PrimaryGeneratedColumn()`**: Standard – auto-inkrementierender Integer.
- **`@PrimaryGeneratedColumn("uuid")`**: Weist den Treiber an, für neue Zeilen eine UUID (Universally Unique Identifier) zu generieren. UUIDs sind sehr empfehlenswert, wenn IDs über eine API nach außen gegeben werden, da sie verhindern, dass böswillige Nutzer sequenzielle IDs erraten oder die Datenbankgröße abschätzen können.
- **`@PrimaryColumn()`**: Definiert eine Primärschlüsselspalte, deaktiviert aber die automatische Generierung. Der Anwendungscode ist vollständig dafür verantwortlich, beim `INSERT`-Vorgang einen eindeutigen Wert bereitzustellen.

## Spaltentypen und SQL-Inferenz

Der `@Column()`-Decorator ordnet eine Klasseneigenschaft einer SQL-Spalte zu. Ohne Argumente leitet TypeORM den SQL-Typ aus dem TypeScript-Typ ab: Ein TS-`string` wird zu `varchar` (oder `text`), `number` zu `integer`, `boolean` zu `boolean` und `Date` zu `datetime` oder `timestamp`.

TypeScript-Typen sind jedoch breit gefasst, während SQL-Typen sehr spezifisch sind. Eine TypeScript-`number` könnte ein Integer, ein Float oder ein präziser Geldwert sein. Wenn die Inferenz zu ungenau ist, muss die Spalte explizit konfiguriert werden:

```typescript
@Column({ type: "numeric", precision: 5, scale: 2, nullable: true })
price?: number;
```

Häufig verwendete Konfigurationsoptionen:

- **`type`**: Erzwingt einen bestimmten Datenbankdatentyp, z. B. `numeric` oder `text` statt des Standard-Integers.
- **`length`**: Setzt ein festes Limit für die Stringlänge (z. B. `varchar(100)`). Ohne Angabe verwendet TypeORM eine Standardlänge oder `text`, je nach Datenbanktreiber.
- **`nullable`**: Legt fest, ob die Datenbank `NULL` akzeptiert. Standardmäßig `false`. Bei `nullable: true` muss die TypeScript-Eigenschaft als optional markiert werden (`?`), damit der Compiler erzwingt, mögliche `null`-Werte zu behandeln.
- **`unique`**: Erzwingt eine eindeutige Einschränkung auf Datenbankebene. Die Datenbank lehnt jeden `INSERT` oder `UPDATE` ab, der einen Wert in dieser Spalte dupliziert.
- **`default`**: Gibt einen Fallback-Wert auf Datenbankebene an, falls das Feld beim Einfügen weggelassen wird.

Für Auditing und Nachverfolgung bietet TypeORM zwei Lifecycle-Decorators: `@CreateDateColumn()` und `@UpdateDateColumn()`. Diese verwalten Zeitstempel automatisch. TypeORM setzt beim `INSERT` den aktuellen Zeitstempel für Ersteres und aktualisiert ihn bei jedem `UPDATE` für Letzteres. Diese Felder werden im Anwendungscode niemals manuell gesetzt.

## Die Boardgame-Entity

Hier ist die vollständige `Boardgame`-Entity, die wir im Folgenden verwenden werden:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("boardgames")
export class Boardgame {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 120 })
  name: string;

  @Column({ type: "integer" })
  minPlayers: number;

  @Column({ type: "integer" })
  maxPlayers: number;

  @Column({ type: "integer" })
  playtimeMinutes: number;

  @Column({ type: "numeric", precision: 3, scale: 1 })
  complexity: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt: Date;
}
```

Die bewussten Designentscheidungen im Überblick:

- **UUIDs als Identität**: Die `id` ist ein UUID-String, der das Datenbankvolumen verschleiert und das Erraten sequenzieller IDs über API-Endpunkte verhindert.
- **Defensive Einschränkungen**: `name` ist auf 120 Zeichen begrenzt, um zu verhindern, dass bösartige Eingaben die Datenbank aufblähen.
- **Präzise Typisierung**: `complexity` verwendet den `numeric`-Typ (3 Gesamtstellen, 1 Nachkommastelle). Eine BoardGameGeek-Gewichtungsbewertung wie „3.4" als Standard-Gleitkommazahl zu speichern, birgt das Risiko binärer Rundungsfehler. `numeric` garantiert exakte Präzision.
- **Zeitzonenbewusstsein**: `createdAt` fordert vom Datenbanksystem explizit einen `timestamp with time zone` an, was schmerzhafte Lokalisierungsfehler beim Deployment auf Servern in verschiedenen Regionen verhindert.