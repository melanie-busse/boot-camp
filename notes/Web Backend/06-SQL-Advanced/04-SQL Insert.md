# Backend SQL Vertiefung – SQL INSERT

Daten lesen ist nur eine Hälfte einer Anwendung. Irgendwann müssen Nutzer neue Einträge hinzufügen: einen Kommentar posten, ein Konto erstellen, ein Formular absenden. SQL erledigt das mit dem `INSERT`-Statement, das eine neue Zeile in eine Tabelle einfügt. In einer Express-App mit einer Model-Schicht läuft jedes neue Datenstück, das ein Nutzer einreicht, durch `INSERT`, bevor es in der Datenbank landet.

---

## INSERT-Statement

`INSERT` nennt die Zieltabelle, listet die Spalten auf, die Werte erhalten, und liefert die Werte in derselben Reihenfolge:

```sql
INSERT INTO blog_entries (title, teaser, author, createdAt, image, content)
VALUES ('My First Post', 'A short intro', 'Anna', '2024-01-15', 'cover.jpg', 'Full content here.');
```

Für die Spaltenliste gelten einige Regeln:

- Spalten mit `AUTOINCREMENT` (wie `id`) werden weggelassen. Die Datenbank generiert diesen Wert automatisch.
- Spalten, die mit `NOT NULL` markiert sind, müssen angegeben werden. Werden sie weggelassen, entsteht ein Fehler.
- Nicht aufgeführte Spalten erhalten ihren Standardwert, in der Regel `NULL`.

---

## POST-Route

Wir müssen eine POST-Route in unserer Express-App erstellen, um Einträge anzulegen. Die Route empfängt die vom Nutzer eingegebenen Daten im Request-Body. Die Daten werden dann an die Model-Funktion übergeben, die das SQL-Statement ausführt.

```typescript
// Route-Handler
router.post("/blog/entries", async (req, res) => {
  await createBlogEntry(req.body);
});
```

In der vorherigen Einheit wurde `db.all()` für `SELECT`-Abfragen verwendet. Für Mutationen wird eine andere Methode benötigt: `db.run()`. Der Grund ist, dass Mutationen keine Zeilen zurückgeben. Stattdessen löst `db.run()` mit einem `RunResult`-Objekt auf, das zwei nützliche Eigenschaften hat:

- `lastID` ist die automatisch generierte `id` der soeben eingefügten Zeile.
- `changes` ist die Anzahl der Zeilen, die das Statement verändert hat.

Bei `INSERT` ist `lastID` der Wert, der an den Client zurückgesendet wird, damit er weiß, welche Ressource erstellt wurde.

```typescript
// Model-Funktion
export async function createBlogEntry(
  entry: Omit<BlogEntry, "id">,
): Promise<number> {
  const db = getDB();
  const result = await db.run(
    `INSERT INTO blog_entries (title, teaser, author, createdAt, image, content)
     VALUES (@title, @teaser, @author, @createdAt, @image, @content)`,
    {
      "@title": entry.title,
      "@teaser": entry.teaser,
      "@author": entry.author,
      "@createdAt": entry.createdAt,
      "@image": entry.image,
      "@content": entry.content,
    },
  );
  return result.lastID!;
}
```

In der vorherigen Einheit wurden `?`-Platzhalter verwendet, die der Reihe nach durch ein Werte-Array befüllt werden. Das `sqlite`-Paket unterstützt auch benannte Platzhalter mit einem `@`-Präfix. Statt eines Arrays kommen die Werte als Objekt, dessen Schlüssel zu den Platzhalternamen passen. Bei vielen Spalten sind benannte Platzhalter leichter zu lesen und weniger fehleranfällig, weil keine Positionsreihenfolge zwischen dem SQL-String und den Werten synchron gehalten werden muss.

Beide Varianten verhindern SQL-Injection: Der Datenbanktreiber bindet die Werte, anstatt sie in den Abfrage-String zu interpolieren.

Abschließend wird der Route-Handler so aktualisiert, dass er `result.lastID` mit dem Status `201 Created` zurückgibt – die übliche Antwort auf einen erfolgreichen POST, der eine neue Ressource anlegt. Eine Fehlerbehandlung ermöglicht es, dem Client bei einem Problem eine passende Meldung mit `500 Internal Server Error` zu senden.

```typescript
// Route-Handler
router.post("/blog/entries", async (req, res) => {
  try {
    const newId = await createBlogEntry(req.body);
    res.status(201).json({ id: newId });
  } catch (err) {
    res.status(500).json({ error: "Failed to create blog entry" });
  }
});
```

---

## Weiterführende Links

- [SQLite INSERT](https://www.sqlite.org/lang_insert.html)
- [sqlite npm-Paket](https://www.npmjs.com/package/sqlite)
- [Über SQL-Injections](https://owasp.org/www-community/attacks/SQL_Injection)