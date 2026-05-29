# Backend Grundlagen und Express – Aufgabe: API-Clients

## Eine API mit einem API-Client deiner Wahl erkunden

In dieser Aufgabe richtest du einen API-Client deiner Wahl ein, startest einen lokalen API-Server und sendest Anfragen daran. Am Ende sollst du in der Lage sein, jeden Typ von `HTTP`-Anfrage in deinem API-Client zu erstellen und die zurückkommenden Antworten zu lesen.

## Setup

Einen API-Client auswählen und installieren:

- **Postman**: [Download](https://www.postman.com/downloads/)
- **Bruno**: [Download](https://www.usebruno.com/downloads)

Je nach Wahl können zusätzliche Einrichtungsschritte notwendig sein. Bitte die Dokumentation des gewählten Clients zu Rate ziehen.

Die BookMonkey-API starten. Das ist eine vorgefertigte Übungs-API, die als `npm`-Paket bereitgestellt wird. Sie muss nicht dauerhaft installiert werden. Direkt ausführen mit:

```bash
npx bookmonkey-api
```

Der Server startet unter `http://localhost:4730`. Diese URL im Browser öffnen, um die API-Dokumentation zu sehen. Sie listet die verfügbaren Endpunkte auf und beschreibt, welche Daten sie erwarten.

> ✎ **Hinweis:** Das Terminal-Fenster während der Arbeit geöffnet lassen. Wird es geschlossen, stoppt der API-Server. Falls das Terminal anderweitig benötigt wird, einen zweiten Tab oder ein zweites Fenster öffnen.

## Teil 1: Deine erste GET-Anfrage

Den API-Client öffnen und eine neue Collection namens „BookMonkey" erstellen.

Die erste Anfrage innerhalb der Collection erstellen:

- Methode auf `GET` setzen
- URL `http://localhost:4730/books` eingeben
- Auf „Send" klicken

Das Antwort-Panel sollte ein JSON-Array mit Büchern anzeigen. Den Statuscode oben rechts im Antwortbereich prüfen. Er sollte `200 OK` lauten.

Diese Anfrage in der Collection als „Get all books" speichern.

## Teil 2: Ein einzelnes Buch abrufen

Die Antwort aus Teil 1 ansehen. Jedes Buch hat ein `isbn`-Feld. Eine ISBN auswählen und eine neue GET-Anfrage erstellen, die nur dieses spezifische Buch abruft.

> ✎ **Hinweis:** Die API-Dokumentation unter `http://localhost:4730` aufrufen, um den korrekten Endpunkt zum Abrufen eines einzelnen Buches zu finden.

Diese Anfrage als „Get book by ISBN" speichern.

## Teil 3: Ein neues Buch erstellen

Eine Anfrage erstellen, die ein neues Buch zur Collection hinzufügt:

- Methode auf `POST` setzen
- URL auf den Bücher-Endpunkt setzen
- Den „Body"-Tab öffnen, „raw" auswählen und „JSON" aus dem Format-Dropdown wählen
- Ein JSON-Objekt mit den Feldern schreiben, die die API erwartet (Dokumentation für die erforderliche Struktur prüfen)

Wenn die Anfrage erfolgreich ist, sollte der Statuscode `201 Created` lauten. Die Anfrage „Get all books" erneut senden, um zu bestätigen, dass das neue Buch in der Liste erscheint.

Diese Anfrage als „Create a book" speichern.

## Teil 4: Aktualisieren und löschen

Anhand der API-Dokumentation zwei weitere Anfragen zur Collection hinzufügen:

- Eine Anfrage, die ein bestehendes Buch aktualisiert (basierend auf dem Gelernten über HTTP-Methoden entscheiden, ob `PUT` oder `PATCH` passend ist)
- Eine Anfrage, die ein Buch löscht

Nach dem Löschen eine GET-Anfrage senden, um zu überprüfen, dass das Buch verschwunden ist.

## Ergebnis

Die fertige Collection sollte mindestens fünf gespeicherte Anfragen enthalten, die alle CRUD-Operationen abdecken.