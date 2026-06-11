# Backend SQL Vertiefung – SQL DELETE

Manche Daten müssen irgendwann entfernt werden. Ein Nutzer löscht sein Konto, ein veröffentlichter Beitrag wird zurückgezogen oder ein veralteter Datensatz muss bereinigt werden. SQL erledigt das Entfernen mit dem `DELETE`-Statement, das Zeilen aus einer Tabelle löscht, ohne deren Struktur zu verändern. In einer Webanwendung läuft `DELETE` typischerweise hinter einem HTTP-`DELETE`-Endpunkt, bei dem der Client die ID der zu entfernenden Ressource sendet.

---

## DELETE-Statement

`DELETE` nennt die Tabelle und eine `WHERE`-Klausel, die bestimmt, welche Zeilen entfernt werden:

```sql
DELETE FROM blog_entries WHERE id = 3;
```

Ohne `WHERE` entfernt `DELETE` alle Zeilen der Tabelle. Anders als beim Löschen der Tabelle selbst bleibt das Schema dabei erhalten, wird aber vollständig geleert. Die `WHERE`-Klausel sollte immer zuerst geschrieben und überprüft werden, bevor `DELETE` in der Produktionsumgebung ausgeführt wird.

---

## DELETE-Route

Wir benötigen eine DELETE-Route in unserer Express-App, um einen bestehenden Eintrag zu entfernen. Die Route liest die Eintrags-ID aus dem URL-Parameter und übergibt sie an die Model-Funktion. Es gibt keinen Request-Body, da für ein Löschen nur bekannt sein muss, welche Zeile entfernt werden soll.

```typescript
// Route-Handler
router.delete("/:id", async (req, res) => {
  await deleteBlogEntry(Number(req.params.id));
});
```

Die Model-Funktion ist die einfachste der drei Mutationen, da sie nur die `id` entgegennimmt.

```typescript
// Model-Funktion
export async function deleteBlogEntry(id: number): Promise<void> {
  const db = getDB();
  await db.run(`DELETE FROM blog_entries WHERE id = @id`, { "@id": id });
}
```

Der vollständige Route-Handler kapselt den Aufruf in einem `try/catch` und gibt bei Erfolg `200 OK` zurück.

```typescript
// Route-Handler
router.delete("/:id", async (req, res) => {
  try {
    await deleteBlogEntry(Number(req.params.id));
    res.status(200).json({ message: "Blog entry deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete blog entry" });
  }
});
```

---

## Weiterführende Links

- [SQLite DELETE](https://www.sqlite.org/lang_delete.html)
- [Express Routing](https://expressjs.com/en/guide/routing.html)