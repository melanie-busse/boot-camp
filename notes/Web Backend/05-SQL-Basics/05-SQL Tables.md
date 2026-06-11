# Backend SQL Grundlagen – SQL-Tabellen

Eine `SELECT`-Abfrage setzt voraus, dass die Tabelle, aus der sie liest, bereits existiert. Bevor Daten eingefügt, abgefragt oder gelöscht werden können, muss die Tabelle selbst definiert sein: ihr Name, die enthaltenen Spalten, der Typ jeder Spalte und die geltenden Constraints. Genau dafür ist die Data Definition Language (DDL) zuständig. `CREATE TABLE` definiert eine neue Tabelle, `ALTER TABLE` ändert das Schema einer bestehenden Tabelle, und `DROP TABLE` entfernt eine Tabelle vollständig aus der Datenbank.

Die Struktur der Daten, die wir in unserer Datenbank speichern möchten, verändert sich sehr wahrscheinlich im Laufe eines Projekts. Ein neues Feature benötigt eine neue Spalte. Eine ältere Spalte wird umbenannt, wenn ihr Name nicht mehr zu ihrem Zweck passt, oder eine Prototyp-Tabelle wird entfernt, sobald ihre Daten anderswo gespeichert sind. Jede relationale Datenbank unterstützt dieselben Operationen für diese Änderungen, mit geringen Dialektunterschieden zwischen den Systemen.

Diese Anweisungen werden weit seltener ausgeführt als `SELECT` oder `INSERT`. Tabellen werden einmalig bei der Einrichtung der Anwendung erstellt, gelegentlich bei sich ändernden Anforderungen angepasst und nur dann gelöscht, wenn ihre Daten nicht mehr benötigt werden. Die Syntax lohnt sich dennoch zu kennen, denn jedes Projekt beginnt mit mindestens einer `CREATE TABLE`-Anweisung – und die Struktur dieser Anweisung ist die Struktur, an der sich alle Abfragen orientieren müssen.

---

## Eine Tabelle erstellen

`CREATE TABLE` definiert eine neue Tabelle mit einer Liste von Spalten. Jede Spalte hat einen Namen und einen Datentyp sowie optional einen oder mehrere Constraints.

```sql
CREATE TABLE blog_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  teaser TEXT NOT NULL,
  author TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  image TEXT NOT NULL,
  content TEXT NOT NULL
);
```

Die obigen Spalten verwenden zwei SQLite-Typen und drei Constraints:

- `INTEGER` speichert ganze Zahlen
- `TEXT` speichert Zeichenketten beliebiger Länge
- `PRIMARY KEY` kennzeichnet die Spalte als eindeutigen Bezeichner jeder Zeile
- `AUTOINCREMENT` weist SQLite an, bei jedem Insert die nächste freie Ganzzahl zuzuweisen – die `id` muss also nicht manuell gesetzt werden
- `NOT NULL` weist jeden Insert zurück, bei dem die Spalte leer bleibt

SQLite verfügt über eine kleine Auswahl eingebauter Typen: `INTEGER`, `TEXT`, `REAL` (Gleitkommazahlen), `BLOB` (Binärdaten) und `NUMERIC`. Andere Datenbanken verwenden mehr Typen (PostgreSQL kennt z. B. `VARCHAR(n)`, `BOOLEAN`, `TIMESTAMP` und weitere), aber die grundlegende `CREATE TABLE`-Syntax ist in allen Dialekten gleich.

Eine Spalte ohne `NOT NULL` darf leer sein. Inserts, die diese Spalte weglassen, speichern `NULL` für die entsprechende Zeile. `NOT NULL` sollte für Felder verwendet werden, die die Anwendung immer benötigt; für wirklich optionale Felder wird es weggelassen.

---

## Existenz prüfen

`CREATE TABLE blog_entries (...)` zweimal auszuführen erzeugt beim zweiten Mal einen Fehler, weil die Tabelle bereits existiert. Das ist relevant, wenn die Datenbankinitialisierung bei jedem Serverstart ausgeführt wird. Ohne Schutzmaßnahme würde der zweite Start abstürzen.

`IF NOT EXISTS` überspringt die Erstellung, wenn die Tabelle bereits vorhanden ist:

```sql
CREATE TABLE IF NOT EXISTS blog_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ...
);
```

Der erste Aufruf erstellt die Tabelle. Jeder weitere Aufruf hat keine Wirkung.

`IF NOT EXISTS` prüft nur den Tabellennamen. Existiert eine Tabelle mit diesem Namen, aber mit anderen Spalten, überspringt die Anweisung die Erstellung dennoch – das Schema wird nicht aktualisiert. Um die Spalten einer bestehenden Tabelle zu ändern, muss `ALTER TABLE` verwendet werden.

---

## Eine Tabelle ändern

`ALTER TABLE` ändert das Schema einer bestehenden Tabelle. Die häufigsten Operationen sind das Umbenennen der Tabelle, das Umbenennen einer Spalte und das Hinzufügen einer Spalte.

Tabelle umbenennen:

```sql
ALTER TABLE blog_entries RENAME TO posts;
```

Spalte umbenennen:

```sql
ALTER TABLE blog_entries RENAME COLUMN createdAt TO created_at;
```

Spalte hinzufügen:

```sql
ALTER TABLE blog_entries ADD COLUMN updatedAt TEXT;
```

Eine mit `ADD COLUMN` hinzugefügte Spalte wird für alle bestehenden Zeilen mit `NULL` befüllt. Soll die Spalte `NOT NULL` sein, muss außerdem ein `DEFAULT`-Wert angegeben werden, damit bestehende Zeilen beim Erstellen einen Wert erhalten:

```sql
ALTER TABLE blog_entries ADD COLUMN updatedAt TEXT NOT NULL DEFAULT '';
```

SQLite unterstützt einen kleineren Satz an `ALTER TABLE`-Operationen als die meisten anderen Datenbanken. Das Löschen einer Spalte wird ab SQLite 3.35.0 unterstützt:

```sql
ALTER TABLE blog_entries DROP COLUMN teaser;
```

Für ältere SQLite-Versionen oder Änderungen, die SQLite nicht direkt unterstützt (z. B. der Wechsel des Spaltentyps), lautet die Standardlösung: eine neue Tabelle mit dem gewünschten Schema anlegen, die Daten mit `INSERT INTO ... SELECT FROM` übertragen, die alte Tabelle löschen und die neue umbenennen.

---

## Eine Tabelle löschen

`DROP TABLE` entfernt eine Tabelle und alle ihre Zeilen dauerhaft aus der Datenbank. Die Operation ist endgültig: Es gibt kein Soft-Delete und kein automatisches Backup.

```sql
DROP TABLE blog_entries;
```

Die Anweisung gibt einen Fehler aus, wenn die Tabelle nicht existiert. `IF EXISTS` unterdrückt diesen Fehler:

```sql
DROP TABLE IF EXISTS blog_entries;
```

Da die Änderung nicht rückgängig gemacht werden kann, sollte `DROP TABLE` zunächst gegen eine Entwicklungsdatenbank ausgeführt werden – nicht gegen eine Produktionsdatenbank – und der Tabellenname vor der Ausführung sorgfältig geprüft werden.

---

## Express-Beispiel: Tabellen beim Serverstart erstellen

Die `connectDB`-Funktion aus dem SQLite-Setup-Kapitel öffnet die Verbindung, tut aber sonst nichts weiter. Beim ersten Start des Servers gegen eine neue Datenbankdatei existiert die Tabelle `blog_entries` noch nicht, und jede Abfrage dagegen schlägt fehl. Das Ausführen von `CREATE TABLE IF NOT EXISTS` innerhalb von `connectDB` löst dieses Problem: Die Tabelle wird beim ersten Start erstellt, und jeder spätere Start lässt sie unverändert.

Das `sqlite`-Paket stellt `db.run()` bereit. Mit dieser Methode können SQL-Anweisungen ausgeführt werden, die auf der aktuell verbundenen Datenbank wirken. Wichtig: `db.run()` gibt keine Werte zurück. Für den Datenzugriff wird eine andere Methode benötigt.

```typescript
export async function connectDB(): Promise<Database> {
  db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database,
  });

  await db.run(`
    CREATE TABLE IF NOT EXISTS blog_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      teaser TEXT NOT NULL,
      author TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      image TEXT NOT NULL,
      content TEXT NOT NULL
    )
  `);

  return db;
}
```

Die SQL-Anweisung wird als Template-String übergeben, damit sie für bessere Lesbarkeit über mehrere Zeilen verteilt werden kann. `await` blockiert, bis die Anweisung abgeschlossen ist – wenn `connectDB` zurückkehrt, ist die Tabelle also garantiert vorhanden.

Die Schema-Definition neben der Verbindungslogik zu platzieren hält das Datenbank-Setup an einem zentralen Ort. Ändert sich das Schema später, findet die Änderung im selben Modul statt, das auch die Verbindung öffnet. Jeder Entwickler, der das Repository klont, erhält beim ersten Serverstart sofort eine funktionierende Datenbank.

---

## Weiterführende Links

- [SQLite CREATE TABLE](https://www.sqlite.org/lang_createtable.html)
- [SQLite ALTER TABLE](https://www.sqlite.org/lang_altertable.html)
- [SQLite DROP TABLE](https://www.sqlite.org/lang_droptable.html)
- [SQLite Datentypen](https://www.sqlite.org/datatype3.html)