# 🎭 Fahrplan: Backend Template Engines (Event Hub & Blog)

Dieses Dokument führt dich Schritt für Schritt durch das Template-Engine-Modul. Du lernst das Zusammenspiel von Express, TypeScript und Nunjucks kennen – Vererbung, Schleifen, Conditions und wiederverwendbare Makros.

---

## 🏗️ Teil 1: Code Along – Event Hub

*Ziel: Ein kleines Event-Verzeichnis aufbauen und die Kernfeatures von Nunjucks (Blöcke, Schleifen, Makros) verstehen.*

### Schritt 1.1: Setup & Tooling

- [ ] Initialisiere ein neues npm-Projekt (`npm init -y`).
- [ ] Installiere die Produktiv-Packages: `npm i express nunjucks`.
- [ ] Installiere die Dev-Dependencies: `npm i -D typescript @types/express @types/nunjucks tsx prettier prettier-plugin-jinja-template`.
- [ ] Erstelle eine `.prettierrc` im Root-Verzeichnis mit dem Jinja-Plugin für saubere Nunjucks-Formatierung:

```json
{
  "plugins": ["prettier-plugin-jinja-template"]
}
```

- [ ] **Editor-Tipp:** Installiere die Extension „Better Nunjucks" in VS Code für Syntax-Highlighting.

### Schritt 1.2: Basis-Layout (Template Inheritance)

- [ ] Erstelle den Ordner `views/` und darin die Datei `base.html`.
- [ ] Baue das HTML-Skelett in `base.html` mit einem Header („Event Hub"), einer Navigation (Home, Events) und einem Footer.
- [ ] Definiere zwei Nunjucks-Blöcke: `{% block title %}{% endblock %}` und `{% block content %}{% endblock %}`.
- [ ] Erstelle `views/index.html`, die von `base.html` erbt (`{% extends "base.html" %}`), und fülle den Content-Block mit „Welcome to Event Hub".
- [ ] Setze in `src/index.ts` den Express-Server auf, konfiguriere Nunjucks (`nunjucks.configure('views', { ... })`) und erstelle die Route `GET /`, die `index.html` rendert.

### Schritt 1.3: Event-Listing & Sold-Out Badge

- [ ] Hinterlege das vorgegebene `events`-Array in deinem Server-Code.
- [ ] Erstelle die Route `GET /events` und übergib das Array beim Rendern der neuen Datei `views/events.html`.
- [ ] Baue in `events.html` eine `{% for event in events %}`-Schleife, um Name, Datum und Location anzuzeigen.
- [ ] Füge die `{% else %}`-Klausel in die Schleife ein, die „No events scheduled" anzeigt, falls das Array leer ist.
- [ ] **Badge-Logik:** Nutze `{% if event.soldOut %}`, um bei ausverkauften Events ein optisches Badge anzuzeigen.

### Schritt 1.4: Event-Card-Makro

- [ ] Erstelle den Ordner `views/macros/` und darin die Datei `events.html`.
- [ ] Definiere dort das Makro: `{% macro eventCard(name, date, location, soldOut=false) %}`.
- [ ] Verschiebe das HTML-Layout der Event-Karte in dieses Makro.
- [ ] Importiere das Makro in `events.html` via `{% from "macros/events.html" import eventCard %}` und rufe es innerhalb der Schleife auf.

---

## 📝 Teil 2: Hauptprojekt – Blog bauen

*Ziel: Ein vollfunktionaler Blog auf Basis des „Clean Blog"-Themes von Start Bootstrap mit dynamischen Inhalten aus einer JSON-Datei.*

### Schritt 2.1: Vorbereitung & Datenimport

- [ ] Lade das Clean Blog-Theme von Start Bootstrap herunter und integriere die CSS/JS-Assets in den `public/`-Ordner. Stelle sicher, dass `express.static('public')` aktiv ist.
- [ ] Speichere die bereitgestellten Blog-JSON-Daten in einer Datei (z. B. `data/posts.json`).
- [ ] Lade die drei benötigten Bilder (`colorful-umbrella.jpg`, `flowers.jpg`, `sailing.jpg`) herunter und lege sie im statischen Ordner ab.
- [ ] Schreibe Logik in deiner App, um die JSON-Datei direkt beim Server-Start einzulesen (`fs.readFileSync`).

### Schritt 2.2: Startseite (Timestamp-Konvertierung)

- [ ] Erstelle die Route `GET /` für den Blog.
- [ ] **Wichtig:** Das Feld `createdAt` ist ein Unix-Timestamp in Sekunden – konvertiere ihn vor dem Rendern in ein lesbares Datum:

```typescript
new Date(post.createdAt * 1000).toLocaleDateString('de-DE')
```

- [ ] Übergib die aufbereiteten Posts an das Index-Layout und rendere Titel, Teaser, Autor und das formatierte Datum.

### Schritt 2.3: Beitrags-Detailseite (Dynamische Slugs)

- [ ] **Slug-Generierung:** Füge jedem Post-Objekt beim Server-Start dynamisch eine `slug`-Eigenschaft hinzu, die aus dem Titel generiert wird (Kleinbuchstaben, Leerzeichen durch Bindestriche ersetzen, Sonderzeichen entfernen).
- [ ] Erstelle die Route `GET /post/:slug`.
- [ ] Suche den passenden Post anhand des Slugs aus `req.params.slug`. Wenn keiner existiert → Status `404`.
- [ ] Rendere die Detailseite mit dem vollständigen Inhalt und dem Beitragsbild.

> **Achtung:** Der Inhalt enthält HTML-Tags. Nutze den Nunjucks-Filter `{{ post.content | safe }}`, damit die Tags gerendert und nicht als Text ausgegeben werden.

### Schritt 2.4: Kontaktseite (Flexibles Formular-Makro)

- [ ] Erstelle die Route `GET /contact` für das Kontaktformular (Verarbeitung der Formulardaten ist nicht gefordert).
- [ ] Erstelle ein Formular-Makro im Ordner `views/macros/`.
- [ ] Das Makro akzeptiert folgende Parameter: `label`, `placeholder`, `type`.
- [ ] **Bedingtes Rendern im Makro:** Wenn `type == "textarea"`, wird ein `<textarea>`-Element gerendert, andernfalls ein `<input type="{{ type }}">`.
- [ ] Ersetze alle Formularfelder auf der Kontaktseite durch Aufrufe des Makros, um HTML-Redundanz zu vermeiden.

---

## 🧪 Teil 3: Qualitäts- und Integrations-Check

- [ ] Funktioniert die CSS-Verlinkung des Clean Blog-Themes auf allen Seiten – auch auf der tiefen `/post/:slug`-Route?
- [ ] Werden die HTML-Absätze (`<p>`) auf der Detailseite dank des `| safe`-Filters korrekt dargestellt?
- [ ] Wechselt das Textfeld auf der Kontaktseite sauber zu einer `<textarea>`, wenn das Makro mit `type="textarea"` aufgerufen wird?