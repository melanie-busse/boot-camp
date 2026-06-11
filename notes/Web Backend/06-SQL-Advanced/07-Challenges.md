# Backend SQL Vertiefung – Aufgaben

## Express-Projekt um vollständiges CRUD erweitern

Füge dem Express-Projekt aus der vorherigen Einheit Erstell-, Aktualisierungs- und Löschoperationen hinzu.

**Anforderungen:**

- Füge eine Model-Funktion `createBlogEntry` hinzu, die ein `INSERT` ausführt und die ID des neuen Eintrags über `this.lastID` zurückgibt
- Füge eine Model-Funktion `updateBlogEntry` hinzu, die ein `UPDATE` auf eine bestimmte ID beschränkt ausführt
- Füge eine Model-Funktion `deleteBlogEntry` hinzu, die ein `DELETE` auf eine bestimmte ID beschränkt ausführt
- Füge `POST`-, `PUT`- und `DELETE`-Route-Handler hinzu, die die entsprechenden Model-Funktionen aufrufen
- Verwende parametrisierte Abfragen (`?`-Platzhalter) für alle Werte – interpoliere Werte niemals direkt in den SQL-String
- Teste jede Route mit einem REST-Client (z. B. Bruno oder curl) und überprüfe die Änderungen in DB Browser

---

## Optional: Autoren-Tabelle und JOIN

- Erstelle eine separate `authors`-Tabelle mit mindestens den Spalten `id` und `name`
- Füge der `blog_entries`-Tabelle eine Fremdschlüsselspalte `author_id` hinzu
- Befülle beide Tabellen mit Beispieldaten
- Schreibe eine `SELECT`-Abfrage mit einem `JOIN`, die jeden Blog-Eintrag zusammen mit dem Autorennamen zurückgibt
- Erstelle eine neue `GET`-Route, die das Join-Ergebnis zurückgibt
- (Optional) Füge eine Benutzeroberfläche zur Verwaltung von Autoren hinzu – Autoren anlegen, bearbeiten und löschen