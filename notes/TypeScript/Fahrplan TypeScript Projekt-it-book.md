# 📚 Fahrplan: IT-Buch-Bibliothek (Frontend Recap Project)

Dieses Dokument dient als Schritt-für-Schritt-Leitfaden für die Strukturierung und Umsetzung der IT-Buch-Bibliothek. Das Projekt basiert auf reinem TypeScript (Vanilla DOM-Manipulation) und kommuniziert mit der lokalen Bookmonkey-API.

---

## 🛠️ Phase 1: Projekt-Setup & API-Inbetriebnahme

*Ziel: Die Entwicklungsumgebung läuft, TypeScript kompiliert fehlerfrei und die lokale API liefert Daten.*

### Schritt 1.1: Starter-Files & API starten

- [ ] Lade die Starterdateien über das Terminal herunter:

```bash
npx ghcd@latest wd-bootcamp/asd-challenges/tree/main/challenges/recap-project-1 recap-project-1
```

- [ ] Starte den lokalen REST-API-Server in einem separaten Terminal-Fenster:

```bash
npx bookmonkey-api
```

> **Hinweis:** Überprüfe im Terminal, auf welchem Port die API läuft (meistens `http://localhost:3000`) und teste den Endpunkt `/books` kurz im Browser.

### Schritt 1.2: Konfiguration & Bundler

- [ ] Initialisiere das npm-Projekt (`npm init -y`), falls noch keine `package.json` vorhanden ist.
- [ ] Erstelle eine `tsconfig.json` (via `npx tsc --init`) mit sauberen Einstellungen für DOM-Projekte:

```json
"target": "ES2022",
"lib": ["DOM", "DOM.Iterable", "ES2022"],
"moduleResolution": "node"
```

- [ ] Konfiguriere deinen Bundler (z. B. Vite), damit TS-Dateien kompiliert und automatisch in den HTML-Dateien eingebunden werden:

```html
<script type="module" src="./src/index.ts"></script>
```

---

## 💾 Phase 2: API-Service & Typen (Daten-Infrastruktur)

*Ziel: Ein zentraler Service holt die Buchdaten ab und stellt typsichere Objekte bereit.*

### Schritt 2.1: Interfaces definieren

- [ ] Erstelle die Datei `src/types/book.ts`.
- [ ] Definiere das Interface `Book` basierend auf den API-Daten (Titel, ISBN, Autor, Verlag, Beschreibung, Cover-URL etc.).

### Schritt 2.2: API-Fetch-Funktionen

- [ ] Erstelle die Datei `src/services/api.ts`.
- [ ] Schreibe eine asynchrone Funktion `fetchBooks(): Promise<Book[]>`, die alle Bücher von der REST-API abruft.
- [ ] Schreibe eine asynchrone Funktion `fetchBookByIsbn(isbn: string): Promise<Book | null>`, die ein einzelnes Buch für die Detailseite lädt.

---

## 📊 Phase 3: Filterbare Bücherliste (`index.html`)

*Ziel: Alle Bücher werden in einer Tabelle angezeigt und lassen sich in Echtzeit nach Titel und Verlag filtern.*

### Schritt 3.1: DOM-Rendering der Tabelle

- [ ] Erstelle `src/index.ts` und verknüpfe sie mit der `index.html`.
- [ ] Erfasse die benötigten DOM-Elemente (Tabelle/Tbody, Suchfeld, Verlags-Dropdown).
- [ ] Schreibe eine Funktion `renderBookTable(books: Book[])`, die den `tbody` leert und pro Buch eine Zeile (`<tr>`) mit Titel, ISBN, Autor und Verlag dynamisch generiert.
- [ ] Rufe beim Laden der Seite `fetchBooks()` auf und übergib die Daten an die Render-Funktion.

### Schritt 3.2: Filter- und Suchlogik

- [ ] **Verlags-Dropdown dynamisch füllen:** Extrahiere aus allen Büchern die einzigartigen Verlage (z. B. per `Set`) und befülle das `<select>`-Feld im HTML.
- [ ] **Such-Event:** Hänge einen `input`-Event-Listener an das Suchfeld für die Titelsuche.
- [ ] **Filter-Event:** Hänge einen `change`-Event-Listener an das Verlags-Dropdown.
- [ ] Schreibe eine Kombi-Filter-Funktion, die den aktuellen Zustand von Suche und Verlagsfilter nimmt, das originale Buch-Array filtert und `renderBookTable()` mit den gefilterten Daten neu aufruft.

---

## 🔍 Phase 4: Detailansicht (`detail.html`)

*Ziel: Beim Klick auf ein Buch gelangt man zur Detailseite, die ihre Daten anhand der ISBN aus der URL lädt.*

### Schritt 4.1: Dynamische Links in der Tabelle

- [ ] Passe die Tabellen-Generierung aus Phase 3 an: Der Buchtitel (oder ein Button) soll als Link zur Detailseite führen und die ISBN als Query-Parameter mitgeben:

```html
<a href="detail.html?isbn=${book.isbn}">
```

### Schritt 4.2: Detail-Logik umsetzen

- [ ] Erstelle `src/detail.ts` und verknüpfe sie mit der `detail.html`.
- [ ] Lies beim Laden der Seite den Query-Parameter aus der URL aus:

```typescript
const urlParams = new URLSearchParams(window.location.search);
const isbn = urlParams.get('isbn');
```

- [ ] Wenn eine ISBN vorhanden ist, rufe `fetchBookByIsbn(isbn)` auf.
- [ ] Befülle die vorgefertigten HTML-Elemente (Titel, Beschreibung, Cover etc.) mit den geladenen Buchdetails via `textContent` oder `src`.
- [ ] Baue einen „Zurück zur Übersicht"-Button ein.

---

## ⭐ Phase 5: Favoritenliste & LocalStorage (Zusatz-Feature)

*Ziel: Bücher können persistent als Favoriten markiert werden. Die Anzahl wird im Header synchronisiert.*

### Schritt 5.1: LocalStorage-Service

- [ ] Erstelle die Datei `src/services/favorites.ts`.
- [ ] Schreibe folgende Hilfsfunktionen:

| Funktion | Rückgabe | Beschreibung |
| --- | --- | --- |
| `getFavorites()` | `string[]` | Holt gespeicherte ISBNs aus dem LocalStorage |
| `addFavorite(isbn: string)` | `void` | Fügt eine ISBN hinzu und speichert sie |
| `removeFavorite(isbn: string)` | `void` | Entfernt eine ISBN aus dem Speicher |
| `isFavorite(isbn: string)` | `boolean` | Prüft, ob ein Buch ein Favorit ist |

### Schritt 5.2: Header-Anzeige & UI-Integration

- [ ] Schreibe eine Funktion `updateFavoritesHeader()`, die die Anzahl der gespeicherten ISBNs ermittelt und die Zahl im Header-Element aller Seiten aktualisiert.
- [ ] Erweitere die Tabellenzeilen in `index.ts` um eine Spalte mit einem Favoriten-Button (z. B. ein Stern-Icon ⭐).
- [ ] Wenn das Buch bereits ein Favorit ist, färbe den Stern ein.
- [ ] Setze einen Event-Listener auf die Favoriten-Buttons: Beim Klick wird die ISBN hinzugefügt oder entfernt, der LocalStorage aktualisiert und `updateFavoritesHeader()` neu aufgerufen.

---

## 🎨 Phase 6: Code-Review & Clean-Up

- [ ] **XSS-Schutz:** Überprüfe, dass bei der DOM-Manipulation überall `textContent` statt `innerHTML` verwendet wird, es sei denn, die Daten sind absolut sicher.
- [ ] **Deployment-Check:** Funktionieren alle Links und Filter ohne Konsolenfehler?
- [ ] **Kommentare:** Dokumentiere komplexe DOM-Selektoren für deine Bootcamp-Unterlagen.