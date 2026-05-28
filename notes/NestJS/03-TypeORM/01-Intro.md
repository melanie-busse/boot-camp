# Übersicht

Im Jahr 1970 veröffentlichte der IBM-Informatiker Edgar F. Codd ein Papier, das die Softwareentwicklung für immer verändern sollte. Er stellte das Relationale Modell vor – einen mathematischen Ansatz zur Organisation von Daten in Tabellen, Zeilen und Spalten. Jahrzehnte später sind relationale Datenbanken wie PostgreSQL das unangefochtene Rückgrat des modernen Webs.

Gleichzeitig entwickelte sich die Welt der Softwareanwendungen in eine völlig andere Richtung. Sprachen wie Java, C# und TypeScript übernahmen die Objektorientierte Programmierung (OOP) und strukturierten die Logik rund um tief verschachtelte, verhaltensreiche Objekte.

Dies führte zu einem massiven historischen Konflikt: Zustände werden in flachen Rastern gespeichert, während Anwendungen auf komplexen Objektgraphen laufen.

Diese Lücke zu überbrücken ist bekanntermaßen schwierig. Die Übersetzungsschicht zwischen Objekten und relationalen Tabellen zu schreiben ist so komplex und fehleranfällig, dass der Softwarearchitekt Ted Neward sie einst mit einer sehr drastischen Analogie beschrieb. Eine Debatte, die sich in [Martin Fowlers Artikel „ORM Hate"](https://martinfowler.com/bliki/OrmHate.html) weiter erkunden lässt.

Dieses Modul befasst sich damit, wie moderne Backend-Entwickler mit dieser Herausforderung umgehen.

Anstatt Tausende von Zeilen fragilen Übersetzungscodes zu schreiben, verwenden wir einen **Object-Relational Mapper (ORM)**. Du lernst, wie du TypeORM – die Standard-Datenbankabstraktion von NestJS – einsetzt, um deine TypeScript-Klassen nahtlos in robuste SQL-Tabellen zu überführen. Noch wichtiger: Du lernst nicht nur die Syntax, sondern auch, wie du saubere Architekturgrenzen einziehst, damit Datenbankoperationen niemals mit den Geschäftsregeln deiner Anwendung vermischt werden.

## Ressourcen

- [IBM, Die relationale Datenbank](https://www.ibm.com/history/relational-database)