# Backend SQL Vertiefung – SQL UPDATE

Sobald Daten in einer Tabelle vorhanden sind, müssen Nutzer sie auch ändern können. Ein Artikel muss korrigiert werden, ein Profilname ändert sich oder ein Status wechselt von Entwurf zu veröffentlicht. SQL erledigt Änderungen mit dem `UPDATE`-Statement, das bestimmte Zeilen anspricht und einen oder mehrere ihrer Spaltenwerte überschreibt. In einer Webanwendung läuft `UPDATE` typischerweise hinter einem `PUT`-Endpunkt, bei dem der Client Ersatzdaten für eine bestehende Ressource sendet.

---

## UPDATE-Statement

`UPDATE` nennt die Tabelle, listet mit `SET` jede Spalte und ihren neuen Wert auf und filtert mit `WHERE`, welche Zeilen geändert werden:

```sql
UPDATE blog_entries SET title = 'Updated Title', teaser = 'New teaser' WHERE id = 3;
```

Mehrere Spalten werden in der `SET`-Klausel durch Kommas getrennt. Die `WHERE`-Klausel schränkt das Statement auf die Zeilen ein, die der Bedingung entsprechen.

Ohne `WHERE` wird `UPDATE` auf jede Zeile der Tabelle angewendet. Das ist selten beabsichtigt und schwer rückgängig zu machen. Die `WHERE`-Bedingung sollte immer zuerst geschrieben und getestet werden, bevor `UPDATE` in der Produktionsumgebung ausgeführt wird.

---

## PUT-Route

Wir benötigen eine PUT-Route in unserer Express-App, um einen bestehenden Eintrag zu aktualisieren. Die Route liest die Eintrags-ID aus dem URL-Parameter und die Ersatzdaten aus dem Request-Body. Beides wird an die Model-Funktion übergeben.

```typescript
// Route-Handler
router.put("/:id", async (req, res) => {
  await updateBlogEntry(Number(req.params.id), req.body);
});
```

Die Model-Funktion folgt demselben Aufbau wie `createBlogEntry`. Die Unterschiede sind das SQL-Statement selbst und das zusätzliche `id`-Argument, das von der `WHERE`-Klausel verwendet wird.

```typescript
// Model-Funktion
export async function updateBlogEntry(
  id: number,
  entry: Omit<BlogEntry, "id">,
): Promise<void> {
  const db = getDB();
  await db.run(
    `UPDATE blog_entries
     SET title = @title, teaser = @teaser, author = @author, createdAt = @createdAt, image = @image, content = @content
     WHERE id = @id`,
    {
      "@title": entry.title,
      "@teaser": entry.teaser,
      "@author": entry.author,
      "@createdAt": entry.createdAt,
      "@image": entry.image,
      "@content": entry.content,
      "@id": id,
    },
  );
}
```

Dank der benannten Platzhalter kann die Reihenfolge der Schlüssel im Werte-Objekt beliebig sein – der Datenbanktreiber ordnet sie anhand der Namen zu. `req.params.id` kommt als String an, daher wandelt `Number()` ihn um, bevor er die Model-Funktion erreicht.

Der vollständige Route-Handler kapselt den Aufruf in einem `try/catch` und gibt bei Erfolg `200 OK` zurück.

```typescript
// Route-Handler
router.put("/:id", async (req, res) => {
  try {
    await updateBlogEntry(Number(req.params.id), req.body);
    res.status(200).json({ message: "Blog entry updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update blog entry" });
  }
});
```

---

## Weiterführende Links

- [SQLite UPDATE](https://www.sqlite.org/lang_update.html)
- [Express Routing](https://expressjs.com/en/guide/routing.html)