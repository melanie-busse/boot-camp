# NestJS TypeORM – Aufgaben

## Cyber Chat – Persistente Datenspeicherung hinzufügen

Bisher hat Cyber Chat auf In-Memory-Arrays gesetzt. Jedes Mal, wenn du den Entwicklungsserver neu startest, verschwinden alle Threads und Kommentare. In dieser Aufgabe entfernst du diese flüchtigen Repositories und verbindest die Anwendung mit einer echten, persistenten SQLite-Datenbank.

### 1 Das Fundament

- Füge den SQLite-Treiber und die TypeORM-Abhängigkeiten in dein bestehendes Cyber-Chat-Projekt ein.
- Konfiguriere die Verbindung in deinem Root-`AppModule`.
- Erstelle eine neue SQLite-Datenbankdatei.

### 2 Die Domain modellieren

- Übersetze deine Domain in TypeORM-Entities. Du benötigst eine `Thread`- und eine `Comment`-Entity. Die Anforderungen an die `Thread`-Entity könnten sein:
    - Ein UUID-Primärschlüssel.
    - Ein Standard-String `title` und ein `text`-Feld `body`.
    - Ein automatisch verwalteter `createdAt`-Zeitstempel.
    - Ein einfacher String `author` (Platzhalter für ein zukünftiges Nutzersystem).
- Entwirf die `Comment`-Entity.

> **Hinweis:** Sie benötigt mindestens eine ID, einen `body`, einen Zeitstempel und einen `author`. Am wichtigsten ist ein [relationaler Decorator](https://typeorm.io/docs/relations/many-to-one-one-to-many-relations/), der auf den zugehörigen `Thread` zurückverweist.

### 3 Der Repository-Austausch

- Lösche deine eigenen In-Memory-Repository-Klassen. Sie sind überholt.
- Aktualisiere deinen `ThreadService` und `CommentService`, um das generische `Repository` von TypeORM zu injizieren.
- Refaktoriere deine Geschäftslogik, sodass sie die Datenbankmethoden statt Array-Manipulation verwendet.

### 4 Die erste Migration (Optional)

- Deaktiviere `synchronize`.
- Erstelle deine `src/data-source.ts`-Datei und füge die TypeORM-CLI-Skripte zu deiner `package.json` hinzu.
- Generiere deine erste Schema-Migration, prüfe das generierte SQL und führe den Run-Befehl aus, um deine Datenbanktabellen zu erstellen.

---

## Abnahmekriterien

- **Persistenz:** Du kannst einen Thread per `POST`-Request erstellen, den NestJS-Server neu starten, einen `GET`-Request ausführen – und der Thread ist noch vorhanden.
- **Referenzielle Integrität:** Das Abrufen eines Threads anhand seiner ID gibt den Thread zusammen mit dem zugehörigen Array an Kommentaren zurück.
- **Saubere Services:** Deine Service-Klassen enthalten keine rohen SQL-Strings und keine manuelle Array-Filterlogik (`.filter`, `.push`). Die gesamte Datenmanipulation ist an den ORM delegiert.
- **Migrations-Verifikation:** Eine generierte Migrationsdatei existiert in `src/migrations`, und die CLI meldet sie als erfolgreich angewendet.