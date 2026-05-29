# IT-Buch-Bibliothek

## Einleitung

Der Kunde ist eine Bibliothek mit Schwerpunkt auf IT-Büchern in der fiktiven Stadt Foobar Town. Die Bibliothek möchte ihre Bücher online verfügbar machen, damit Kunden die Möglichkeit haben, ihre Lieblingsbücher in einer Liste zu speichern. Es ist deine Aufgabe, diese App für den Kunden zu erstellen.

---

## Voraussetzungen

### Starterdateien

Lade die Starterdateien für diese Aufgabe herunter mit:

```bash
npx ghcd@latest wd-bootcamp/asd-challenges/tree/main/challenges/recap-project-1 recap-project-1
```

### REST-API

Die REST-API ist unter https://www.npmjs.com/package/bookmonkey-api verfügbar. Folge den Anweisungen, um den API-Server auf deinem lokalen Rechner zu starten, oder verwende:

```bash
npx bookmonkey-api
```

### HTML-Templates

Die HTML-Seiten für das Projekt sind bereits vorgefertigt. Du findest sie im Verzeichnis `src` des Projekts. Verwende diese HTML-Dateien als Vorlagen und füge nur deinen TypeScript-Code hinzu.

---

## Aufgaben

Deine Aufgabe ist es, die folgenden Features in der App zu implementieren. Die Anforderungen an jedes Feature findest du in den Checklisten unten. Verwende ausschließlich reines TypeScript für die DOM-Manipulation und verzichte auf den Einsatz von Komponentenbibliotheken. Du darfst die HTML-Dateien anpassen.

---

### Einrichtung

- Erstelle die notwendigen Konfigurationsdateien für das Projekt, wie `tsconfig.json` und `package.json`.
- Erstelle Schritt für Schritt eine TypeScript-Datei für jede HTML-Seite und füge den notwendigen Code hinzu, um die geforderten Features zu implementieren.
- Rufe die Daten aller Bücher von der REST-API ab und verwende sie zur Umsetzung der folgenden Features.

---

### Filterbare Bücherliste hinzufügen

- Alle Bücher des Kunden müssen in einer Tabelle dargestellt werden.
    - Pro Zeile sollen folgende Informationen eines Buches angezeigt werden:
        - Titel
        - ISBN
        - Autor
        - Verlag
- Implementiere eine Suchfunktion nach Titel.
- Implementiere einen Filter, um nur Bücher eines bestimmten Verlags anzuzeigen.

---

### Detailseite hinzufügen

- Erstelle eine Detailseite für jedes Buch. Alle erforderlichen Informationen aus der Template-Datei `src/detail.html` sollen auf dieser Seite angezeigt werden.
- Die Detailseite jedes Buches soll aus der Listenansicht heraus erreichbar sein.

---

### Favoritenliste hinzufügen

- Es muss möglich sein, ein Buch in der Listenansicht als Favorit zu markieren.
- Die Favoritenliste soll über den Header der Anwendung erreichbar sein.
    - Die Anzahl der Favoritenbücher soll im Header angezeigt werden.
- Es soll möglich sein, einen Favoriten zu entfernen.
- Die Favoriten sollen dauerhaft im Browser des Nutzers gespeichert werden, sodass seine gespeicherten Bücher beim nächsten Besuch wieder angezeigt werden.