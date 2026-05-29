# Backend Grundlagen und Express – Aufgaben

## Lesezeichen-Manager-API

Eine REST-API erstellen, die eine Sammlung von Lesezeichen verwaltet. Jedes Lesezeichen hat eine `id`, eine `url`, einen `title` und ein optionales `tag`. Alle Daten werden in einer einfachen Array-Variable gespeichert – keine Datenbank erforderlich.

## Setup

Ein neues Node.js-Projekt mit Express und TypeScript erstellen. Die `express.json()`-Middleware verwenden, damit der Server JSON-Request-Bodies parsen kann. Ein Dev-Skript konfigurieren, das bei Dateiänderungen neu startet.

## Datenstruktur

Jedes Lesezeichen folgt dieser Form:

```typescript
interface Bookmark {
  id: number;
  url: string;
  title: string;
  tag?: string;
}
```

Mit einem vorbefüllten Array starten, damit sofort Testdaten vorhanden sind:

```typescript
let bookmarks: Bookmark[] = [
  { id: 1, url: "https://expressjs.com", title: "Express.js", tag: "node" },
  {
    id: 2,
    url: "https://typescriptlang.org",
    title: "TypeScript",
    tag: "typescript",
  },
  { id: 3, url: "https://developer.mozilla.org", title: "MDN Web Docs" },
];
```

## Endpunkte

Folgende vier Endpunkte implementieren:

**`GET /bookmarks`** gibt die vollständige Liste der Lesezeichen als JSON-Array mit Status `200` zurück.

**`GET /bookmarks/:id`** gibt ein einzelnes Lesezeichen anhand seiner `id` zurück. Existiert kein Lesezeichen mit dieser `id`, mit Status `404` und einem Fehlerobjekt wie `{ "error": "Bookmark not found" }` antworten.

**`POST /bookmarks`** erstellt ein neues Lesezeichen aus dem JSON-Request-Body. Eine `id` automatisch vergeben (ein einfacher Zähler reicht). Mit dem erstellten Lesezeichen und Status `201` antworten.

**`DELETE /bookmarks/:id`** entfernt das Lesezeichen mit der angegebenen `id` aus dem Array. Mit Status `204` und leerem Body antworten.

## Testen

Den API-Client verwenden, um Anfragen an jeden Endpunkt zu senden. Folgendes überprüfen:

- `GET /bookmarks` gibt das vollständige Array zurück.
- `GET /bookmarks/1` gibt das erste Lesezeichen zurück.
- `GET /bookmarks/999` gibt einen `404`-Fehler zurück.
- `POST /bookmarks` mit einem JSON-Body fügt einen neuen Eintrag hinzu.
- `GET /bookmarks` nach dem Erstellen zeigt den neuen Eintrag.
- `DELETE /bookmarks/1` entfernt das Lesezeichen.
- `GET /bookmarks/1` nach dem Löschen gibt `404` zurück.

## Nach Tag filtern

`GET /bookmarks` um einen optionalen Query-Parameter `tag` erweitern. Wenn vorhanden, nur Lesezeichen zurückgeben, deren `tag` dem Wert entspricht. Wenn nicht vorhanden, alle Lesezeichen zurückgeben.

Beispiel: `GET /bookmarks?tag=node` gibt nur Lesezeichen zurück, die mit „node" getaggt sind.

## Teilweise Aktualisierungen

Einen `PATCH /bookmarks/:id`-Endpunkt hinzufügen, der einzelne Felder eines bestehenden Lesezeichens aktualisiert. Der Request-Body enthält nur die zu ändernden Felder. Felder, die nicht im Body enthalten sind, bleiben unverändert. Das aktualisierte Lesezeichen mit Status `200` zurückgeben, oder `404`, wenn die `id` nicht existiert.

## Eingabevalidierung

Eingehende Daten am `POST /bookmarks`-Endpunkt validieren. Sowohl `url` als auch `title` sind Pflichtfelder. Fehlt eines davon im Request-Body, mit Status `400` und einer Fehlermeldung antworten, die dem Client mitteilt, welches Feld fehlt. Beispiel: `{ "error": "Missing required field: title" }`.