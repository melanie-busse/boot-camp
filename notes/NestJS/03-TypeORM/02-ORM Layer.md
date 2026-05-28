# NestJS TypeORM – Die ORM-Schicht

Relationale Datenbanken strukturieren Daten in flachen, zweidimensionalen Rastern, die über Fremdschlüssel miteinander verknüpft sind. Anwendungscode hingegen arbeitet mit tief verschachtelten, miteinander verbundenen Objektgraphen im Arbeitsspeicher. Der Datenaustausch zwischen diesen beiden Welten erfordert einen ständigen Übersetzungsschritt.

Diese Reibung nennt sich **Object-Relational Impedance Mismatch**. Wenn du eine Datenbank über einen Raw-Driver wie `pg` (Postgres) oder `better-sqlite3` (SQLite) abfragst, sendest du einen SQL-String und erhältst ein Array untypisiierter Zeilen zurück. Im nächsten Schritt müsstest du dann Boilerplate-Code schreiben, der Klassen instanziiert, Typen castet und Fremdschlüssel in verschachtelte Arrays überführt. Der TypeScript-Compiler kann diese SQL-Strings nicht überprüfen, was bedeutet, dass Schema-Änderungen zu Laufzeitfehlern führen würden – statt zu Warnungen zur Kompilierzeit.

Ein **Object-Relational Mapper (ORM)** abstrahiert diese Übersetzungsarbeit. Wir definieren die Datenstruktur einmalig mithilfe einer Klasse, und der ORM leitet daraus das Datenbankschema ab, generiert die notwendigen SQL-Abfragen und befüllt die zurückgegebenen Zeilen automatisch zu vollständig typisierten Objekten. Das folgende Beispiel zeigt die Definition einer einfachen Entity mit TypeORMs Decorators:

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Boardgame {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: "int" })
  minPlayers: number;
}
```

Auf diese Decorators gehen wir gleich noch genauer ein. Zunächst das Wichtigste zum Paradigma: Die Klasse ist die einzige Quelle der Wahrheit. TypeORM liest die Metadaten dieser Klasse, um Tabellen zu erstellen, Einfügevorgänge zu validieren und dir beim Abfragen Autovervollständigung zu bieten.

> 💡 Wenn du aus dem Web-Grundkurs kommst, hast du bereits einen ORM – genauer gesagt einen ODM – verwendet. Mongoose ist ein „Object Document Mapper" für MongoDB und erfüllt dieselbe Aufgabe wie ein ORM für SQL-Datenbanken. Bei MongoDB ist die Lücke zwischen Datenmodell und Datenbank jedoch deutlich kleiner.

## Die Datenbankwerkzeug-Landschaft

ORMs sind nicht der einzige Weg, mit einer Datenbank zu kommunizieren. Engineering-Teams wählen beim Aufbau einer Datenschicht in der Regel zwischen drei Abstraktionsebenen:

### 1. Raw Drivers (`pg`, `sqlite3`)
Du schreibst reines SQL.

**Vorteile:** Maximale Performance, volle Kontrolle über Ausführungspläne, kein Abstraktions-Overhead.

**Nachteile:** Keine Typsicherheit für Abfragen, viel Boilerplate beim Mappen von Ergebnissen, anfällig für SQL-Injection, wenn Parameter nicht korrekt gebunden werden.

### 2. Query Builder (Knex, Kysely)
Du schreibst Abfragen mit JavaScript/TypeScript-Funktionen statt mit reinen Strings.

**Vorteile:** Standardmäßiger Schutz vor SQL-Injection, programmierbare Abfragen (z. B. bedingtes Hinzufügen von WHERE-Klauseln), solide Typsicherheit mit modernen Tools wie Kysely.

**Nachteile:** Die flachen Ergebnismengen müssen weiterhin manuell in die Objektstrukturen der Anwendung überführt werden.

### 3. ORMs (TypeORM, Prisma, MikroORM, Drizzle)
Du arbeitest mit Methoden eines Objektmodells, und das Framework generiert das SQL.

**Vorteile:** Beschleunigt die Entwicklung bei Standard-CRUD-Operationen erheblich, verwaltet komplexe Tabellenverknüpfungen automatisch, bietet vollständige Typsicherheit vom Datenbankaufruf bis zur API-Antwort.

**Nachteile:** Das generierte SQL kann ineffizient sein. Komplexe Aggregationen oder Massenoperationen schneiden im Vergleich zu handgeschriebenen Abfragen oft schlechter ab.

## Warum TypeORM für NestJS?

Prisma mag im JavaScript-Ökosystem derzeit der beliebteste ORM sein – doch warum behandelt NestJS TypeORM als Standard? Die Antwort liegt in der architektonischen Übereinstimmung.

NestJS ist stark von Angular inspiriert. Die gemeinsame Philosophie rund um Decorators, Dependency Injection und Architektur findet sich auch in TypeORM wieder. Datenmodelle sind schlichte TypeScript-Klassen, die mit Decorators versehen werden – passend zur Ästhetik und dem mentalen Modell des restlichen NestJS-Codebases.

Darüber hinaus implementiert TypeORM zwei verschiedene ORM-Muster: **Active Record** (bei dem die Entity selbst Methoden wie `User.save()` besitzt) und **Data Mapper**. NestJS setzt dabei auf das Data-Mapper-Muster.

Beim Data-Mapper-Muster ist die Entity ein reiner Datencontainer ohne eigene Logik. Ein separates Objekt – ein **Repository** – übernimmt die eigentlichen Datenbankoperationen (z. B. `repository.save(user)`). Das passt perfekt zu NestJS, da das Repository über den Dependency-Injection-Container des Frameworks in jeden Service eingebunden werden kann. So bleibt die Geschäftslogik strikt von der Datenbankverbindung getrennt.

## Ressourcen

- [TypeORM-Dokumentation](https://typeorm.io)
- [NestJS-Datenbankkapitel](https://docs.nestjs.com/techniques/database)