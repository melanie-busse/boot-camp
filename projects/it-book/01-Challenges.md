# IT-Buchbibliothek

## Einführung

Der Kunde ist eine Bibliothek mit Schwerpunkt auf IT-Büchern in der fiktiven Stadt Foobar Town. Die Bibliothek möchte ihre Bücher online verfügbar machen, damit Kunden die Möglichkeit haben, ihre Lieblingsbücher in einer Liste zu speichern. Es ist deine Aufgabe, diese App für den Kunden zu erstellen.

## Voraussetzungen

### Starter-Dateien

Die Starter-Dateien für diese Aufgabe herunterladen mit:

```bash
npx ghcd@latest wd-bootcamp/asd-challenges/tree/main/challenges/recap-project-1 recap-project-1
```

### REST-API

Die REST-API ist unter https://www.npmjs.com/package/bookmonkey-api verfügbar. Den Anweisungen folgen, um den API-Server auf dem lokalen Rechner zu starten. Alternativ: `npx bookmonkey-api`

### HTML-Templates

Die HTML-Seiten des Projekts sind bereits fertig gestaltet. Sie befinden sich im `src`-Verzeichnis des Projekts. Diese HTML-Dateien als Vorlagen verwenden und nur TypeScript hinzufügen.

## Aufgaben

Folgende Features in der App implementieren. Die Anforderungen für jedes Feature sind in der Checkliste unten aufgeführt. Ausschließlich reines TypeScript für DOM-Manipulation verwenden und keine Komponentenbibliothek zur Lösung der Aufgaben einsetzen. Die HTML-Dateien dürfen verändert werden.

### Setup

- Die notwendigen Konfigurationsdateien für das Projekt erstellen, wie `tsconfig.json` und `package.json`.
- Schrittweise eine TypeScript-Datei für jede HTML-Seite erstellen und den notwendigen Code zur Implementierung der geforderten Features hinzufügen.
- Die Daten aller Bücher von der REST-API abrufen und zur Implementierung der folgenden Features verwenden.

### Eine filterbare Bücherliste hinzufügen

- Alle Bücher des Kunden müssen in einer Tabelle dargestellt werden.
    - Folgende Informationen eines Buches sollen pro Zeile angezeigt werden:
        - Titel
        - ISBN
        - Autor
        - Verlag
- Eine Suche nach Titel implementieren.
- Einen Filter implementieren, um nur Bücher eines bestimmten Verlags anzuzeigen.

### Detailseite hinzufügen

- Eine Detailseite für jedes Buch erstellen. Alle erforderlichen Informationen in der Template-Datei `src/detail.html` sollen auf dieser Seite angezeigt werden.
- Die Detailseite jedes Buches soll aus der Listenansicht heraus erreichbar sein.

### Favoritenliste hinzufügen

- Es muss möglich sein, ein Buch in der Listenansicht als Favorit hinzuzufügen.
- Die Favoritenliste soll im Header der Anwendung zugänglich sein.
    - Die Anzahl der Favoritenbücher soll im Header angezeigt werden.
- Es soll möglich sein, einen Favoriten zu entfernen.
- Die Favoriten sollen dauerhaft im Client des Nutzers gespeichert werden, sodass seine gespeicherten Bücher beim nächsten Besuch wieder angezeigt werden.