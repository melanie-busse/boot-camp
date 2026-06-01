# 🔖 Fahrplan: Bookmark Manager API (Backend Basics & Express)

Dieses Dokument dient als Schritt-für-Schritt-Leitfaden für die Strukturierung und Umsetzung der Bookmark Manager REST-API. Das Projekt wird mit Node.js, Express und TypeScript aufgebaut und verwaltet die Daten temporär in einem In-Memory-Array.

---

## 🛠️ Phase 1: Projekt-Setup & Infrastruktur

*Ziel: Die Entwicklungsumgebung ist aufgesetzt, TypeScript kompiliert und der Express-Server startet mit automatischem Reload bei Dateiänderungen.*

- [ ] **Projekt initialisieren:** Erstelle einen neuen Ordner und führe `npm init -y` aus.
- [ ] **Dependencies installieren:**

```bash
npm i express
npm i -D typescript tsx @types/express @types/node
```

- [ ] **TypeScript konfigurieren:** Erstelle die `tsconfig.json` (via `npx tsc --init`) und setze sinnvolle Standardwerte (z. B. `rootDir: "./src"`, `outDir: "./dist"`).
- [ ] **Projektstruktur anlegen:** Erstelle einen `src/`-Ordner mit einer `server.ts` (oder `app.ts`).
- [ ] **Dev-Script einrichten:** Füge in der `package.json` ein Start-Script für die Entwicklung hinzu:

```json
"scripts": {
  "dev": "tsx watch src/server.ts"
}
```

- [ ] **Express-Skelett aufsetzen:** Initialisiere Express in `src/server.ts`, binde das `express.json()`-Middleware-Parsing ein und starte den Server auf einem Port (z. B. `3000`).

---

## 💾 Phase 2: Datenstruktur & In-Memory-State

*Ziel: Die Typen sind definiert und der Server startet mit einsatzbereiten Testdaten.*

- [ ] **Interface anlegen:** Definiere das `Bookmark`-Interface (direkt in der Server-Datei oder unter `src/types/bookmark.ts`):

```typescript
interface Bookmark {
  id: number;
  url: string;
  title: string;
  tag?: string;
}
```

- [ ] **Mock-Daten & Counter:** Erstelle das globale, veränderbare `bookmarks`-Array (`let bookmarks: Bookmark[] = [...]`) mit den drei vorgegebenen Test-Einträgen.
- [ ] **ID-Zähler:** Lege eine globale Variable für die ID-Zuweisung an (z. B. `let nextId = 4;`), damit neue Bookmarks automatisch eine eindeutige ID bekommen.

---

## ⚡ Phase 3: Core-Endpoints (Die Basis-Routen)

*Ziel: Die grundlegenden CRUD-Operationen (ohne Filter/Validierung) funktionieren über deinen API-Client.*

- [ ] **`GET /bookmarks`** – Alles abrufen: Gibt das gesamte Array mit Status `200 OK` als JSON zurück.

- [ ] **`GET /bookmarks/:id`** – Einzelnes abrufen:
    - Lies die `id` aus `req.params` aus (Achtung: in `number` umwandeln!).
    - Wenn gefunden: Sende das Objekt mit `200`.
    - Wenn nicht gefunden: Sende `404` mit `{ "error": "Bookmark not found" }`.

- [ ] **`POST /bookmarks`** – Erstellen:
    - Nimm `url`, `title` und optional `tag` aus `req.body`.
    - Baue das neue Bookmark-Objekt mit `nextId` zusammen.
    - Erhöhe `nextId++`, pushe das Objekt ins Array und antworte mit Status `201 Created` und dem neuen Objekt.

- [ ] **`DELETE /bookmarks/:id`** – Löschen:
    - Finde den Index des Bookmarks anhand der ID aus `req.params`.
    - Wenn er existiert, entferne ihn aus dem Array (z. B. via `.splice()` oder `.filter()`) und antworte mit Status `204 No Content` (leerer Body).

---

## 🛡️ Phase 4: Validierung, Query-Filter & Partial Updates

*Ziel: Die API wird intelligent – sie validiert Inputs, filtert Ergebnisse und erlaubt Teil-Updates.*

- [ ] **Input-Validierung (`POST`):**
    - Erweitere den `POST /bookmarks`-Endpoint.
    - Prüfe vor dem Speichern, ob `url` oder `title` im Body fehlen oder leere Strings sind.
    - Wenn etwas fehlt: Antworte sofort mit Status `400 Bad Request` und der passenden Fehlermeldung (z. B. `{ "error": "Missing required field: title" }`).

- [ ] **Filter nach Tag (`GET`-Erweiterung):**
    - Modifiziere `GET /bookmarks` so, dass er `req.query.tag` ausliest.
    - Wenn ein Tag übergeben wurde (z. B. `/bookmarks?tag=node`), filtere das Array vor dem Senden. Andernfalls alle Daten zurückgeben.

- [ ] **`PATCH /bookmarks/:id`** – Teilweise Aktualisierung:
    - Finde das bestehende Bookmark anhand der ID (`404` wenn nicht gefunden).
    - Überschreibe gezielt nur die Felder (`title`, `url`, `tag`), die in `req.body` mitgeliefert wurden. Felder, die fehlen, bleiben unberührt.
    - Antworte mit dem aktualisierten Objekt und Status `200 OK`.

---

## 🧪 Phase 5: Testing-Protokoll

Führe diese Schritte in deinem API-Client (z. B. Postman, Thunder Client oder Bruno) aus:

| # | Request | Erwartetes Ergebnis |
| - | ------- | ------------------- |
| 1 | `GET /bookmarks` | 3 Einträge, Status `200` |
| 2 | `GET /bookmarks/1` | Das Express.js-Bookmark, Status `200` |
| 3 | `GET /bookmarks/999` | Status `404` mit Fehlermeldung |
| 4 | `POST /bookmarks` (ohne `title`) | Status `400` – `"Missing required field: title"` |
| 5 | `POST /bookmarks` (vollständig) | Status `201`, neues Objekt mit ID `4` |
| 6 | `GET /bookmarks?tag=node` | Nur mit `"node"` getaggte Bookmarks |
| 7 | `PATCH /bookmarks/2` mit `{ "title": "TS Rocks" }` | Nur Titel geändert, URL und Tag unverändert |
| 8 | `DELETE /bookmarks/1` | Status `204` |
| 9 | `GET /bookmarks/1` | Status `404` |