# 🏔️ Fahrplan: Trail Guide (Backend Recap Project)

Dieses Dokument dient als Schritt-für-Schritt-Leitfaden für die Umsetzung der Trail Guide-Anwendung. Jede Phase baut auf der vorherigen auf.

---

## 🛠️ Phase 1: Fundament & Projekt-Setup

*Ziel: Die App läuft fehlerfrei hoch, die SQLite-Datenbank steht und Verbindungen werden bei Server-Shutdown sauber geschlossen.*

### Schritt 1.1: Init & Packages

- [ ] Erstelle einen neuen Projektordner und initialisiere ihn (`npm init -y`).
- [ ] Installiere die Dependencies: `npm i express nunjucks sqlite sqlite3 sanitize-html`.
- [ ] Installiere die Dev-Dependencies: `npm i -D typescript tsx @types/express @types/nunjucks @types/sanitize-html`.
- [ ] Erstelle die `tsconfig.json` (via `npx tsc --init`) und konfiguriere `rootDir: "./src"` und `outDir: "./dist"`.

### Schritt 1.2: Ordnerstruktur & Environment

- [ ] Lege die Verzeichnisstruktur an:

```text
├── data/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── app.ts
├── views/
│   └── macros/
├── public/
└── .env
```

- [ ] Erstelle die `.env` mit folgenden Variablen:

```text
PORT=3000
DB_PATH=./data/trail-guide.db
API_KEY=dein_super_sicherer_api_key
```

- [ ] Füge in der `package.json` die benötigten Skripte hinzu:

```json
"scripts": {
  "dev": "tsx --env-file=.env watch src/app.ts",
  "db:seed": "sqlite3 data/trail-guide.db < data/seed.sql"
}
```

### Schritt 1.3: Datenbank & Lifecycle

- [ ] Platziere die SQL-Seed-Daten in den Ordner `data/` und führe `npm run db:seed` aus.
- [ ] Schreibe `src/models/db.ts`: Implementiere die Funktionen `connectDB`, `getDB` und `closeDB` (nutze das `sqlite`-Package für Promise-Support).
- [ ] Rufe `connectDB()` beim App-Start in `src/app.ts` auf.
- [ ] Prozess-Signale abfangen: Höre in `app.ts` auf `SIGINT` und `SIGTERM`, um `closeDB()` aufzurufen und die DB-Verbindung sicher zu trennen.

---

## 🌲 Phase 2: Die öffentliche Website (Read-Only)

*Ziel: Die Routen für Besucher funktionieren, Daten werden per INNER JOIN gezogen und über Nunjucks + Pico.css angezeigt.*

### Schritt 2.1: Die Read-Only-Modelle

- [ ] `regionModel.ts`: Implementiere `getAllRegions()` und `getRegionBySlug(slug)`.
- [ ] `trailModel.ts`: Implementiere `getAllTrails()`, `getTrailBySlug(slug)` und `getTrailsByRegionId(id)`.
- [ ] Sicherheit: Nutze für alle SQL-Abfragen parameterisierte Queries (`?`), um SQL-Injections zu verhindern. Verwende `INNER JOIN`, um Trail- und Regionsdaten zusammenzuführen.

### Schritt 2.2: Middleware & Controller-Logik

- [ ] Schreibe `middleware/logger.ts`, die jeden Request formatiert in `logs/access.log` mitschreibt (`fs.appendFileSync`).
- [ ] Erstelle die Controller für folgende Routen:
    - `GET /` & `GET /trails/:slug`
    - `GET /regions` & `GET /regions/:slug`
- [ ] Verknüpfe die Controller in `src/routes/siteRoutes.ts` und binde sie in `app.ts` ein.

### Schritt 2.3: Nunjucks-Frontend (Pico.css)

- [ ] Initialisiere Nunjucks in `app.ts` und binde Pico.css via CDN in `views/base.html` ein.
- [ ] Erstelle das Makro `views/macros/trailCard.html` für eine konsistente Darstellung der Wanderwege.
- [ ] Baue die Views (`index.html`, `trail.html`, `regions.html`, `region.html`), die alle von `base.html` erben.

---

## 🔑 Phase 3: Das Admin-Panel (HTML-CRUD)

*Ziel: Ein geschütztes Admin-Interface unter `/admin`, um Wege zu erstellen, zu bearbeiten und zu löschen.*

### Schritt 3.1: Modell-Erweiterung & Formular-Parser

- [ ] Aktiviere URL-Encoding in `app.ts`: `app.use(express.urlencoded({ extended: true }))`.
- [ ] Erweitere `trailModel.ts` um: `getTrailById(id)`, `addTrail(data)`, `updateTrail(id, data)` und `deleteTrail(id)`.
- [ ] Slug-Automatik: Schreibe eine Hilfsfunktion, die vor dem Speichern aus dem Titel automatisch einen URL-konformen Slug generiert.

### Schritt 3.2: Admin-Controller & Routen

- [ ] Erstelle `src/routes/adminRoutes.ts` für folgende Endpunkte:

| Methode      | Route                        | Zweck                                        |
| ------------ | ---------------------------- | -------------------------------------------- |
| `GET`        | `/admin`                     | Tabellarische Übersicht mit Action-Buttons   |
| `GET / POST` | `/admin/trails/new`          | Formular für neue Einträge                   |
| `GET / POST` | `/admin/trails/:id/edit`     | Bearbeitungsmodus                            |
| `POST`       | `/admin/trails/:id/delete`   | Löschfunktion                                |

- [ ] Dropdown-Logik: Lade die verfügbaren Regionen dynamisch aus der DB, um sie im `<select>`-Feld des Formulars anzuzeigen.

### Schritt 3.3: UI & XSS-Schutz

- [ ] Erstelle die passenden HTML-Views im Ordner `views/admin/`.
- [ ] Sicherheit: Nutze das Paket `sanitize-html` bei POST-Requests, um Benutzereingaben vor dem DB-Eintrag zu bereinigen.

---

## 🌐 Phase 4: Die öffentliche REST-API

*Ziel: Eine JSON-Schnittstelle unter `/api`. Lesezugriff für alle, Schreibzugriff streng limitiert per API-Key.*

### Schritt 4.1: API-Key-Middleware

- [ ] Aktiviere JSON-Parsing in `app.ts`: `app.use(express.json())`.
- [ ] Schreibe die Middleware `src/middleware/apiKey.ts`. Sie prüft den Header `x-api-key` gegen die `.env`.
- [ ] Schlägt die Prüfung fehl → Antworte sofort mit Status `401` und einer JSON-Fehlermeldung.

### Schritt 4.2: Endpunkte & Status-Codes

- [ ] Erstelle `src/routes/apiRoutes.ts` mit folgenden Endpunkten:

| Methode   | Route               | Zugriff     | Status          |
| --------- | ------------------- | ----------- | --------------- |
| `GET`     | `/api/trails`       | Öffentlich  | `200`           |
| `GET`     | `/api/trails/:slug` | Öffentlich  | `200`           |
| `POST`    | `/api/trails`       | Geschützt   | `201`           |
| `PATCH`   | `/api/trails/:id`   | Geschützt   | `200` / `204`   |
| `DELETE`  | `/api/trails/:id`   | Geschützt   | `204`           |

- [ ] Validierung implementieren: Antworte mit `400` bei ungültigen Daten und mit `404`, wenn der gesuchte Trail nicht existiert.

---

## 🏆 Phase 5: Bonus-Herausforderungen (Optional)

- [ ] **Suche:** Erweitere `GET /api/trails` um den Parameter `?q=` (SQL `LIKE`).
- [ ] **Erweiterte Filter:** Support für `?region=...` und `?difficulty=...` in der API einbauen.
- [ ] **Pagination:** Implementiere `?page=` und `?pageSize=` mithilfe von SQL `LIMIT` und `OFFSET`.
- [ ] **Many-to-Many (Tags):** Erstelle Tabellen für Tags, um Wege mit Attributen (z. B. `#Rundweg`) zu verknüpfen.
- [ ] **Rate Limiting:** Schreibzugriffe pro API-Key limitieren (Status `429`).