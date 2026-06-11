# Backend SQL Grundlagen – SQL SELECT

Daten lesen ist in den meisten Anwendungen die häufigste Operation. Ein Seitenaufruf löst typischerweise mehrere Lesezugriffe aus: den aktuellen Nutzer abrufen, seine Beiträge laden, die Kommentare zu jedem Beitrag holen. Das `SELECT`-Statement von SQL übernimmt all das. Es legt fest, welche Spalten abgerufen werden, aus welcher Tabelle gelesen wird und welche optionalen Bedingungen die Ergebnisse filtern, sortieren oder begrenzen. Die hier gezeigten Muster lassen sich direkt auf die Mutations-Statements der nächsten Einheit übertragen.

---

## SELECT und FROM

Das minimale `SELECT`-Statement nennt eine oder mehrere Spalten sowie eine Tabelle:

```sql
SELECT title, author FROM blog_entries;
```

Das Ergebnis enthält jede Zeile aus `blog_entries`, aber nur die Spalten `title` und `author`. Um alle Spalten abzurufen, wird `*` anstelle von Spaltennamen verwendet:

```sql
SELECT * FROM blog_entries;
```

SQL-Schlüsselwörter wie `SELECT` und `FROM` sind nicht case-sensitiv, aber die Konvention ist, sie in Großbuchstaben zu schreiben, um sie von Tabellen- und Spaltennamen zu unterscheiden.

---

## WHERE

Ohne eine `WHERE`-Klausel gibt eine Abfrage jede Zeile der Tabelle zurück. `WHERE` fügt eine Bedingung hinzu, die jede Zeile erfüllen muss, um eingeschlossen zu werden:

```sql
SELECT * FROM blog_entries WHERE author = 'Anna';
```

Mehrere Bedingungen können mit logischen Operatoren kombiniert werden:

- `AND` – beide Bedingungen müssen wahr sein
- `OR` – mindestens eine Bedingung muss wahr sein
- `NOT` – kehrt die Bedingung um

```sql
SELECT * FROM blog_entries WHERE author = 'Anna' AND title LIKE '%coffee%';
```

Der `LIKE`-Operator passt auf Muster. `%` steht für eine beliebige Zeichenfolge, `_` für ein einzelnes beliebiges Zeichen. `LIKE '%coffee%'` passt auf jeden Titel, der das Wort „coffee" irgendwo enthält.

Weitere nützliche `WHERE`-Operatoren:

- `IN` – passt auf jeden Wert aus einer Liste: `WHERE author IN ('Anna', 'Ben', 'Clara')`
- `BETWEEN` – passt auf einen Bereich, inklusive beider Grenzen: `WHERE id BETWEEN 10 AND 20`
- `IS NULL` – passt auf Zeilen, bei denen die Spalte keinen Wert hat: `WHERE image IS NULL`
- `NOT` – negiert eine Bedingung: `WHERE NOT image IS NULL`

Vergleichsoperatoren funktionieren wie in den meisten Programmiersprachen: `=`, `!=` (oder `<>`), `>`, `<`, `>=`, `<=`.

---

## ORDER BY und LIMIT

Standardmäßig gibt eine `SELECT`-Abfrage Zeilen in unbestimmter Reihenfolge zurück. `ORDER BY` legt eine Spalte fest, nach der sortiert wird:

```sql
SELECT * FROM blog_entries ORDER BY createdAt DESC;
```

`ASC` sortiert aufsteigend (kleinster oder frühester Wert zuerst; das ist der Standard). `DESC` sortiert absteigend (größter oder neuester Wert zuerst).

`LIMIT` begrenzt die Anzahl der zurückgegebenen Zeilen:

```sql
SELECT * FROM blog_entries ORDER BY createdAt DESC LIMIT 5;
```

Diese Abfrage gibt die fünf zuletzt erstellten Blog-Einträge zurück. Die Kombination aus `ORDER BY` und `LIMIT` ist der Standardweg, um die neuesten oder am höchsten bewerteten Einträge abzurufen.

---

## GET-Route: alle Blog-Einträge

Wir benötigen eine GET-Route in unserer Express-App, um alle Blog-Einträge abzurufen. Die Route liest nichts aus dem Request, da sie die gesamte Sammlung zurückgibt. Sie ruft die Model-Funktion auf und sendet das Ergebnis zurück.

```typescript
// Route-Handler
router.get("/", async (req, res) => {
  const entries = await getAllBlogEntries();
  res.json(entries);
});
```

Die Model-Funktion verwendet `db.all()`, die Methode des `sqlite`-Pakets für Abfragen, die mehrere Zeilen zurückgeben. Sie löst mit einem Array aus allen Zeilen auf, die die Abfrage liefert. Ein generischer Typ-Parameter teilt TypeScript mit, welche Form jede Zeile hat.

```typescript
// Model-Funktion
import { getDB } from "../db/database";
import { BlogEntry } from "../types";

export async function getAllBlogEntries(): Promise<BlogEntry[]> {
  const db = getDB();
  return await db.all<BlogEntry[]>("SELECT * FROM blog_entries");
}
```

`getDB()` gibt die offene Datenbankverbindung aus dem Datenbankmodul zurück. Da das `SELECT`-Statement keine Parameter hat, wird nur der SQL-String an `db.all()` übergeben.

Der vollständige Route-Handler kapselt den Aufruf in einem `try/catch` und gibt bei Erfolg `200 OK` zurück.

```typescript
// Route-Handler
router.get("/", async (req, res) => {
  try {
    const entries = await getAllBlogEntries();
    res.status(200).json(entries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blog entries" });
  }
});
```

---

## GET-Route: Blog-Eintrag nach ID

Wir benötigen außerdem eine GET-Route, um einen einzelnen Blog-Eintrag anhand seiner `id` abzurufen. Die `id` kommt als URL-Parameter an, wird in eine Zahl umgewandelt und an die Model-Funktion übergeben.

```typescript
// Route-Handler
router.get("/blog/entries/:id", async (req, res) => {
  const entry = await getBlogEntryById(Number(req.params.id));
});
```

Die Model-Funktion verwendet `db.get()` statt `db.all()`. Während `db.all()` alle passenden Zeilen zurückgibt, gibt `db.get()` nur die erste zurück (oder `undefined`, wenn es keine Übereinstimmung gibt). Für eine Abfrage, die nach einer eindeutigen Spalte wie `id` filtert, ist `db.get()` die richtige Wahl.

```typescript
// Model-Funktion
import { getDB } from "../db/database";
import { BlogEntry } from "../types";

export async function getBlogEntryById(
  id: number,
): Promise<BlogEntry | undefined> {
  const db = getDB();
  return await db.get<BlogEntry>("SELECT * FROM blog_entries WHERE id = ?", [
    id,
  ]);
}
```

> ⚠️ Man könnte meinen, die `id` lässt sich einfach per Template-String in den SQL-String interpolieren (`SELECT * FROM blog_entries WHERE id = ${id}`), aber das würde die App einer der häufigsten Sicherheitslücken von Webanwendungen aussetzen: SQL-Injection-Angriffen. Stattdessen überlässt man der SQL-Bibliothek die Interpolation und Eingabebereinigung. Das `?` ist ein Platzhalter, der durch den Wert aus dem Array ersetzt wird – in diesem Fall `id`.

Der vollständige Route-Handler gibt `404 Not Found` zurück, wenn kein Eintrag zur angegebenen ID passt, und `500` bei unerwarteten Fehlern.

```typescript
// Route-Handler
router.get("/blog/entries/:id", async (req, res) => {
  try {
    const entry = await getBlogEntryById(Number(req.params.id));

    if (!entry) {
      res.status(404).json({ error: "Blog entry not found" });
      return;
    }

    res.status(200).json(entry);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blog entry" });
  }
});
```

---

## Weiterführende Links

- [SELECT in der SQLite-Dokumentation](https://www.sqlite.org/lang_select.html)
- [SQL WHERE-Klausel auf MDN](https://developer.mozilla.org/en-US/docs/Web/SQL/Reference/Statements/SELECT)
- [W3Schools SQL-Referenz](https://www.w3schools.com/sql/)
- [sqlite npm-Paket](https://www.npmjs.com/package/sqlite)
- [Über SQL-Injections](https://owasp.org/www-community/attacks/SQL_Injection)