# Backend SQL Basics – SQLite Setup

Eine Datenbank in eine Express-Anwendung einzubinden erfordert drei Dinge: eine Verbindung öffnen, wenn der Server startet, dem Rest der Anwendung Zugriff auf diese Verbindung verschaffen und Model-Funktionen schreiben, die Abfragen ausführen und typisierte Ergebnisse zurückgeben. Ein dediziertes Modul hält diese Zuständigkeiten an einem Ort und erleichtert die Verwaltung des Verbindungs-Lebenszyklus.

---

## Das Datenbank-Modul

Das Paket `sqlite` ist ein Promise-basierter Wrapper um die `sqlite3`-Bindings. Beide werden zusammen mit den TypeScript-Typen für den zugrundeliegenden Treiber installiert:

```bash
npm install sqlite sqlite3
npm install --save-dev @types/sqlite3
```

Ein Datenbank-Modul in `src/db/database.ts` zentralisiert alles, was mit der Verbindung zusammenhängt. Es hält die Datenbankinstanz, stellt Funktionen zum Öffnen und Schließen bereit und ist die einzige Stelle, aus der andere Module importieren, wenn sie Abfragen ausführen müssen.

```typescript
import { open, Database } from "sqlite";
import sqlite3 from "sqlite3";
import path from "path";

const DB_FILE = path.join(process.cwd(), "db", "blog.db");

let db: Database | null = null;

export async function connectDB(): Promise<Database> {
  db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database,
  });

  return db;
}

export function getDB(): Database {
  if (!db) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return db;
}

export async function closeDB(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}
```

Wichtige Punkte zu diesem Modul:

- `open()` akzeptiert einen Dateinamen und einen Treiber – der Treiber ist `sqlite3.Database`, der `sqlite` mitteilt, welche zugrundeliegende Engine verwendet werden soll.
- `path.join(process.cwd(), "db", "blog.db")` legt die Datenbankdatei im `db`-Verzeichnis des Projekt-Arbeitsverzeichnisses ab.
- `connectDB()` ist async und gibt die geöffnete Datenbank direkt nach dem Verbindungsaufbau zurück.
- `getDB()` wird verwendet, um in anderen Modulen auf die Datenbank zuzugreifen. Es schützt davor, Model-Funktionen aufzurufen, bevor `connectDB()` aufgelöst hat – es wirft einen beschreibenden Fehler, anstatt still zu versagen.

`connectDB()` wird in `src/index.ts` aufgerufen, bevor der Express-Server zu lauschen beginnt, damit die Datenbank bereit ist, wenn der erste Request eintrifft:

```typescript
// src/index.ts

await connectDB();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

---

## Kontrolliertes Herunterfahren

Wenn der Server-Prozess stoppt, sollten offene Datenbankverbindungen sauber geschlossen werden, um Datenbeschädigungen und Ressourcen-Leaks zu vermeiden. Node.js erlaubt das Lauschen auf OS-Signale, die ankündigen, dass der Prozess gleich beendet wird.

`SIGINT` wird gesendet, wenn der Nutzer `Ctrl+C` im Terminal drückt. `SIGTERM` wird von Prozess-Managern (Docker, PM2, systemd) gesendet, wenn sie die Anwendung stoppen. Handler für beide zu registrieren stellt sicher, dass die Datenbank korrekt geschlossen wird – unabhängig davon, wie der Server gestoppt wird.

Diese Event-Listener kommen ans Ende von `src/index.ts`:

```typescript
// src/index.ts
process.on("SIGINT", async () => {
  console.log("SIGINT received. Closing database connection...");
  await closeDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing database connection...");
  await closeDB();
  process.exit(0);
});
```

Beide Handler awaiten `closeDB()`, bevor sie `process.exit(0)` aufrufen. Der Exit-Code `0` signalisiert, dass der Prozess fehlerfrei beendet wurde.

---

## Seed-Daten

Da eine neue Datenbank leer ist, würde die Anwendung bei einem Start ohne Daten keinen Inhalt zurückgeben. Anstatt Daten manuell über einen POST-Endpunkt oder eine GUI hinzuzufügen, kann eine sogenannte **Seed-Datei** verwendet werden, um initialen Inhalt bereitzustellen. Sie fasst Schema und erste Zeilen in einer einzigen `.sql`-Datei zusammen, die das SQLite-CLI in einem Befehl gegen die Datenbank anwendet. Die Datei erneut auszuführen setzt die Datenbank jederzeit auf einen bekannten Ausgangszustand zurück.

Die Seed-Datei liegt unter `db/seeddb.sql` und enthält einfache SQL-Statements, die das CLI von oben nach unten liest.

Die einzelnen SQL-Statements werden in den nächsten Kapiteln erklärt – für jetzt reicht ein grober Überblick, was `seeddb.sql` tut:

```sql
-- seeddb.sql
DROP TABLE IF EXISTS posts;

CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL
);

INSERT INTO posts (title, content) VALUES
  ('First post', 'Hello world'),
  ('Second post', 'More content');
```

Die Datei besteht aus drei Teilen:

- `DROP TABLE IF EXISTS posts` entfernt eine ältere Version der Tabelle, falls vorhanden. Das macht das Skript **idempotent**: Zweimaliges Ausführen erzeugt dasselbe Ergebnis wie einmaliges.
- `CREATE TABLE posts (...)` definiert das Schema der Post-Tabelle.
- `INSERT INTO posts ... VALUES (...)` fügt die initialen Zeilen ein. Mehrere Werte-Tupel in einem Statement fügen mehrere Zeilen mit einem einzigen Befehl ein.

Um die Datei anzuwenden, wird sie an das SQLite-CLI weitergeleitet:

```bash
sqlite3 db/blog.db < db/seeddb.sql
```

Der `<`-Operator leitet den Inhalt von `seeddb.sql` an `sqlite3` weiter, als wäre jede Zeile direkt am Prompt eingegeben worden. Die Shell führt jedes Statement gegen `db/blog.db` aus und beendet sich, wenn die Datei endet. Das SQLite-CLI wird mit macOS ausgeliefert und ist über die meisten Linux-Paketmanager verfügbar; unter Windows kann es von der offiziellen SQLite-Website heruntergeladen werden.

Ein Eintrag in `package.json` verpackt den Befehl der Bequemlichkeit halber:

```json
// package.json
{
  "scripts": {
    "db:seed": "sqlite3 db/blog.db < db/seeddb.sql"
  }
}
```

`npm run db:seed` setzt die Datenbank jederzeit auf den Ausgangszustand zurück – wenn Entwicklungsdaten inkonsistent geworden sind oder vor einem manuellen Test ein sauberer Start benötigt wird.

---

## Weiterführende Ressourcen

- [sqlite npm-Paket](https://www.npmjs.com/package/sqlite)
- [Node.js Prozess-Signale](https://nodejs.org/api/process.html#signal-events)