# Backend Architectures – Aufgaben

Diese Session umfasst drei Aufgaben. Die erste ist ein geführtes Code-Along, das eine monolithische Blog-App in MVC refaktoriert. Die zweite baut ein Admin-Panel auf dem refaktorisierten Projekt auf. Die dritte ist optional und fügt einen einfachen Auth-Mechanismus hinzu.

Bearbeite die Aufgaben der Reihe nach. Jede Aufgabe baut auf der Struktur der vorherigen auf.

---

## 1 Code-Along: Den Blog in MVC refaktorieren

Die Starter-App unten ist ein funktionierender Blog-Server. Er rendert eine Liste von Posts auf der Startseite und eine Detailseite für jeden Post unter `/posts/:slug`. Außerdem unterstützt er einfaches Filtern, Sortieren und Paginieren über Query-Parameter. Routing, Datenzugriff, Slug-Logik, Query-Parsing und Datumsformatierung leben alle in einer einzigen Datei. Deine Aufgabe ist es, die App in eine Model-View-Controller-Struktur zu refaktorieren – ohne zu verändern, was der Nutzer sieht.

Nach jedem Schritt soll die App noch dieselben Seiten mit demselben Inhalt ausliefern. Bricht etwas, ist der Schritt noch nicht fertig.

### Setup

Klone das Starter-Projekt, installiere die Abhängigkeiten und verifiziere, dass die App wie vorgesehen funktioniert:

```bash
npx ghcd@latest wd-bootcamp/asd-challenges/tree/main/challenges/mvc-pattern-challenge mvc-pattern-challenge

npm install

npm start
```

Überprüfe den Starter:

- Starte mit `npx tsx app.ts`
- Öffne `http://localhost:3000`
- Klicke einen Post an und bestätige, dass das Datum menschenlesbar ist
- Teste `/?sort=oldest&page=1`
- Teste `/?page=2`

### Schritt 1: Routen in ein Router-Modul auslagern

Verschiebe die Routendefinitionen aus der Haupt-App-Datei in ein dediziertes Router-Modul. Verwende Expresss eingebaute Router-Fähigkeiten, um diese Routen zu gruppieren, und binde den Router dann in der Haupt-Entry-Datei wieder ein. In diesem Schritt bleibt die eigentliche Request-Handler-Logik (die Inhalte der Routen) inline, wo sie ist. Das Ziel ist hier allein, die Routing-Verdrahtung vom Server-Setup zu trennen.

Wenn du fertig bist, enthält deine Haupt-App-Datei keine direkten Routendeklarationen mehr (wie `app.get`). Template-Engine-Setup, statische Dateien und der Server-Listener bleiben dort.

**Prüfen:** Startseite, Detailseiten und Kontaktseite sollten identisch wie zuvor funktionieren.

### Schritt 2: Handler in einen Controller auslagern

Erstelle ein Controller-Modul und extrahiere die inline Handler-Inhalte aus dem Router. Jeder Handler wird zu einer klar benannten, exportierten Funktion im neuen Controller. Vergiss nicht, Request- und Response-Parameter mit Expresss eingebauten Typen korrekt zu typisieren. Aktualisiere die Router-Datei so, dass sie diese Controller-Funktionen importiert und sie den entsprechenden Routen zuordnet.

Die Router-Datei liest sich jetzt als saubere, einfache Liste von Routen-zu-Funktion-Zuordnungen; der Controller enthält die eigentliche Logik (Dateien lesen, Hilfsfunktionen aufrufen, Templates rendern).

**Prüfen:** Teste die Anwendung erneut. Alle drei Seiten müssen ohne Verhaltensänderung weiterhin korrekt ausgeliefert werden.

### Schritt 3: Datenzugriff in ein Model auslagern

Um die Trennung der Zuständigkeiten abzuschließen, erstelle ein Daten-Model. Verschiebe alle Datenabruf- und Datenmanipulations-Logik aus dem Controller in dieses neue Model-Modul. Das schließt ein:

- Daten-Interfaces und -Typen
- Konstanten bezüglich der Datenquelle (z. B. Dateipfade)
- Hilfsfunktionen speziell für das Datenparsing (z. B. Slug-Generierung)
- Eine Funktion zum Abrufen aller Posts
- Eine Funktion zum Abrufen eines einzelnen Posts anhand seines Bezeichners
- Eine Funktion zum Überschreiben der Datendatei mit neuen Daten (wird für die nächste Aufgabe benötigt)

Aktualisiere den Controller so, dass er diese Model-Funktionen importiert und verwendet, anstatt direkt mit dem Dateisystem zu interagieren. Die einzige Aufgabe des Controllers ist jetzt: das Model nach Daten fragen, entscheiden, was damit zu tun ist, und die passende Response rendern.

**Prüfen:** Die Projektstruktur sollte Routen, Controller und Models jetzt klar trennen. Die Anwendung soll sich noch genau so verhalten wie in Schritt 1.

---

## 2 Admin-Panel (CRUD)

Baue einen Admin-Bereich auf dem refaktorisierten Projekt auf, der es einem Content-Editor ermöglicht, Posts zu erstellen, zu bearbeiten und zu löschen. Das Admin-Panel benötigt für die Hauptaufgabe keine Authentifizierung.

### Routen

Implementiere folgende Endpunkte:

| Methode & Pfad | Beschreibung |
|---|---|
| `GET /admin` | Rendert eine Liste aller Posts mit Bearbeiten- und Löschen-Buttons |
| `GET /admin/posts/new` | Rendert ein leeres Formular zum Anlegen eines neuen Posts |
| `POST /admin/posts` | Erstellt einen neuen Post aus der Formular-Übermittlung und leitet zu `/admin` weiter |
| `GET /admin/posts/:slug/edit` | Rendert ein Formular, das mit den vorhandenen Post-Daten vorausgefüllt ist |
| `POST /admin/posts/:slug` | Speichert den bearbeiteten Post und leitet zu `/admin` weiter |
| `POST /admin/posts/:slug/delete` | Entfernt den Post und leitet zu `/admin` weiter |

Denk daran, das MVC-Muster konsequent weiterzuführen!

### Formular-Parsing

HTML-Formulare senden Daten als `application/x-www-form-urlencoded`, nicht als JSON. Express parst dieses Format nicht, außer man weist es explizit an. Füge die eingebaute Parser-Middleware in `app.ts` hinzu:

```typescript
app.use(express.urlencoded({ extended: true }));
```

Ohne diese Middleware ist `req.body` bei Formular-Übermittlungen `undefined`.

### HTML-Sanitization

Der Post-Inhalt ist HTML. Wird der rohe Formular-Input direkt in `posts.json` gespeichert und auf der öffentlichen Detailseite gerendert, kann jeder, der das Admin-Panel nutzt, `<script>`-Tags oder anderen schädlichen Markup einfügen, der im Browser der Leser ausgeführt wird. Das ist eine **Stored Cross-Site-Scripting-Schwachstelle**.

Installiere das Paket `sanitize-html`:

```bash
npm install sanitize-html
npm install --save-dev @types/sanitize-html
```

Führe jedes übermittelte Content-Feld durch `sanitizeHtml`, bevor es an das Model übergeben wird. Konfiguriere eine Allowlist von Tags und Attributen, die dem tatsächlichen Bedarf des Blogs entspricht (Absätze, Überschriften, Links, Listen, Bilder). Alles andere wird herausgefiltert.

### Neue Model-Funktionen

Der Admin-Controller benötigt neue Funktionen in `postModel.ts`:

- `addPost(post)` – hängt einen neuen Post an das Array an und schreibt die Datei
- `updatePost(slug, changes)` – findet den Post anhand des Slugs, ersetzt seine Felder und schreibt die Datei
- `deletePost(slug)` – entfernt den Post anhand des Slugs und schreibt die Datei

Alle drei bauen auf `getAllPosts` und `writePosts` auf, die aus dem Code-Along bereits vorhanden sind.

### Bonus-Aufgaben

- Füge ein Suchfeld auf `/admin` hinzu, das Posts nach Titel filtert.
- Füge Paginierung sowohl für die öffentliche Startseite als auch für die Admin-Liste hinzu.
- Ersetze das einfache Content-Textarea durch einen WYSIWYG-Editor wie Quill oder Editor.js. Stelle sicher, dass der Sanitization-Schritt weiterhin serverseitig läuft – unabhängig davon, was der Editor clientseitig erzeugt.

---

## 3 Bonus: Öffentliche REST-API-Endpunkte

Bisher ist unsere Blog-Anwendung eine klassische serverseitig gerenderte (SSR) App: Express holt die Daten, kombiniert sie mit Nunjucks-Templates und schickt das fertige HTML an den Browser (`res.render()`).

In der Praxis machen viele Webanwendungen ihre Daten jedoch auch in einem maschinenlesbaren Format verfügbar – etwa für mobile Apps, Single-Page-Applications (React/Vue) oder Widgets auf externen Websites.

Erweitere die Express-Anwendung um eine kleine, öffentliche REST-API. Definiere dazu neue Routen unter dem Pfad `/api/...`, die keine Nunjucks-Templates rendern, sondern Rohdaten im JSON-Format zurückgeben (`res.json()`):

- `GET /api/posts/random` – gibt einen zufälligen Blog-Post als JSON-Objekt zurück
- `GET /api/posts/latest` – gibt die drei neuesten Blog-Posts als JSON-Array zurück
- `GET /api/stats` – gibt ein JSON-Objekt mit Blog-Statistiken zurück (z. B. `{ "totalPosts": 15, "newestPostDate": "2026-04-30" }`)

---

## 4 Bonus: Rudimentäre Authentifizierung

Diese Aufgabe ist optional und als Bonus gedacht. Richtige Authentifizierung wird in einer späteren Session behandelt. Das Ziel hier ist allein zu verstehen, wie man eine Gruppe von Routen hinter einer Prüfung absichert.

Wähle einen der zwei Ansätze:

### HTTP Basic Auth Middleware

Schreibe eine kleine Middleware-Funktion, die den `Authorization`-Header liest, den Base64-kodierten `user:password`-String dekodiert und ihn gegen einen hartcodierten Wert (oder einen Wert aus einer Umgebungsvariable) vergleicht. Stimmen die Credentials überein, wird `next()` aufgerufen. Andernfalls wird der `WWW-Authenticate: Basic`-Response-Header gesetzt und ein `401`-Status zurückgegeben.

Wende diese Middleware nur auf den Admin-Router an:

```typescript
app.use("/admin", basicAuth, adminRoutes);
```

Der Browser fordert beim ersten Besuch einer Admin-Seite die Eingabe von Zugangsdaten.

### Session-Cookie

Füge eine `GET /login`-Seite mit einem Formular hinzu, einen `POST /login`-Handler, der ein hartcodiertes Passwort prüft und bei Erfolg ein Cookie wie `admin=true` setzt, sowie eine Middleware, die vor jeder Admin-Route auf dieses Cookie prüft. Fehlt das Cookie oder ist es falsch, wird zu `/login` weitergeleitet.

Verwende das Paket `cookie-parser`, um Cookies aus `req.cookies` zu lesen.

> ⚠️ **Hinweis:** Keiner der beiden Ansätze ist produktionsreif. Hartcodierte Passwörter, einfache Cookies ohne Signatur und fehlender CSRF-Schutz sind reale Probleme. Der Zweck dieser Aufgabe ist, zu spüren, wo die Auth-Naht in einer MVC-App sitzt – nicht ein sicheres System zu bauen.