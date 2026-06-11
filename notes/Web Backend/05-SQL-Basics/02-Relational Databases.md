# Backend SQL Basics – Relationale Datenbanken

Anwendungen erzeugen Daten: Nutzerkonten, Blog-Posts, Bestellungen, Nachrichten. Diese Daten müssen irgendwo zuverlässig und abfragbar gespeichert sein. Man muss bestimmte Datensätze finden, nach Bedingungen filtern und verwandte Informationen miteinander verknüpfen können. Eine relationale Datenbank erledigt all das, indem sie Daten in Tabellen organisiert und eine Standardsprache für deren Abfrage bereitstellt. Die Struktur zu verstehen, bevor man irgendwelche Abfragen schreibt, macht die folgende SQL-Syntax erheblich leichter verständlich.

---

## Tabellen, Zeilen und Spalten

Eine relationale Datenbank speichert Daten in **Tabellen** (auch *Relations* genannt). Jede Tabelle repräsentiert eine einzelne Art von Entität: Kunden, Produkte, Blog-Posts. Innerhalb einer Tabelle ist jede **Zeile** eine Instanz dieser Entität (ein Kunde, ein Blog-Post), und jede **Spalte** ist ein Attribut, das alle Instanzen teilen (der Name eines Kunden, der Titel eines Blog-Posts).

Das ähnelt einer Tabellenkalkulation – mit einem entscheidenden Unterschied: Eine Datenbank erzwingt Struktur. Jede Zeile in einer Tabelle hat exakt dieselben Spalten, und die Datenbank kann prüfen, ob Werte den erwarteten Typen und Constraints entsprechen.

Eine Datenbank enthält typischerweise mehrere Tabellen. Eine Blog-Anwendung könnte eine Tabelle `blog_entries` und eine separate Tabelle `authors` haben. Verwandte, aber eigenständige Daten in getrennten Tabellen zu halten nennt sich **Normalisierung**. Das vermeidet Duplikate und stellt sicher, dass jede Information nur an einem Ort gespeichert ist.

---

## Primär- und Fremdschlüssel

Damit Tabellen miteinander in Beziehung stehen können, braucht jede Zeile einen eindeutigen Bezeichner. Ein **Primärschlüssel** ist eine Spalte – oder eine Kombination von Spalten –, die jede Zeile in einer Tabelle eindeutig identifiziert. In der Praxis ist das entweder eine automatisch inkrementierende Integer-Spalte oder eine `UUID`-Spalte namens `id`.

Ein **Fremdschlüssel** ist eine Spalte in einer Tabelle, die den Primärschlüssel einer Zeile in einer anderen Tabelle speichert. Hat die Tabelle `blog_entries` eine Spalte `author_id`, die auf die Spalte `id` in der Tabelle `authors` verweist, ist diese Spalte ein Fremdschlüssel. Genau das verbindet einen Blog-Post mit seinem Autor – ohne die Autor-Daten in den Blog-Eintrag zu kopieren.

Fremdschlüssel sind das, was eine Datenbank „relational" macht: Sie stellen Verknüpfungen zwischen Tabellen her, die man zur Abfragezeit traversieren kann.

---

## SQL

**SQL** – ausgesprochen „Sequel" – steht für *Structured Query Language*. Es ist die Standardsprache für die Interaktion mit relationalen Datenbanken. Dasselbe SQL, das gegen SQLite geschrieben wird, funktioniert – mit kleineren Variationen – auch gegen PostgreSQL, MySQL und die meisten anderen relationalen Systeme.

SQL deckt zwei breite Bereiche ab:

| Bereich | Beschreibung | Wichtige Statements |
|---|---|---|
| **DML** – Data Manipulation Language | Liest und verändert Daten | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| **DDL** – Data Definition Language | Definiert oder verändert die Datenbankstruktur | `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE` |

Wenn eine Anwendung Daten lesen oder schreiben muss, sendet sie SQL-Statements an das **Datenbankmanagementsystem (DBMS)**. Das DBMS parst das Statement, führt es gegen die gespeicherten Daten aus und gibt das Ergebnis zurück.

Diese Session konzentriert sich auf `SELECT` zum Lesen. Das Schreiben von Daten mit `INSERT`, `UPDATE` und `DELETE` wird in der nächsten Session behandelt.

---

## Weiterführende Ressourcen

- [SQL auf MDN](https://developer.mozilla.org/en-US/docs/Glossary/SQL)
- [Relationale Datenbank auf Wikipedia](https://en.wikipedia.org/wiki/Relational_database)
- [UUIDs](https://en.wikipedia.org/wiki/Universally_unique_identifier)