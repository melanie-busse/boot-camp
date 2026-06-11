# DevOps Testing – Aufgaben

## Aufgabe 1: Unit Testing der Service-Schicht

Schreibe Unit Tests für deinen `ThreadService` und `CommentService`. Da Unit Tests in vollständiger Isolation laufen müssen, darf keine echte Datenbankverbindung verwendet werden.

Injiziere stattdessen ein gemocktes TypeORM-Repository. Das Mock-Objekt (`const mockThreadRepository = { ... }`) muss nur die Methoden enthalten, die der Service tatsächlich aufruft. Diese spezifischen Methoden werden auf `vi.fn()` gemappt – es ist nicht nötig, das gesamte Repository-Interface zu stubben.

Implementiere mindestens die folgenden Testfälle (du kannst natürlich beliebig viele weitere schreiben):

- `findAll` gibt ein Array von Threads zurück, das vom Mock-Repository bereitgestellt wurde.
- `findOne` mit einer gültigen ID gibt das korrekte Thread-Objekt zurück.
- `findOne` mit einer ID, die nicht existiert, wirft eine `NotFoundException`.
- `create` übergibt das DTO korrekt an die `save`-Methode des Repositorys und gibt den neuen Thread zurück.
- `remove` ruft die `delete`-Methode des Repositorys mit der richtigen ID auf.
- Das Erstellen eines `Comment` verknüpft diesen korrekt mit einer `Thread`-ID, bevor er im Repository gespeichert wird.

> Es ist möglich, dass deine Methoden andere Namen haben – passe die Testfälle entsprechend an.

---

## Aufgabe 2: Integrationstests der Controller

Gehe eine Schicht höher. Schreibe Integrationstests für den `ThreadController`.

Verwende dabei den echten Controller und den echten Service, halte aber das Datenbank-Repository weiterhin gemockt. Nutze Supertest, um simulierte HTTP-Anfragen gegen dieses hybride Setup zu senden. Damit wird bewiesen, dass Routing, Validierung und Statuscodes korrekt funktionieren – ohne die Festplatte anzufassen.

Implementiere mindestens die folgenden Testfälle (du kannst natürlich beliebig viele weitere schreiben):

- `POST /threads` mit einem gültigen Body → Statuscode `201 Created`.
- `POST /threads` mit fehlenden Pflichtfeldern (z. B. kein Titel) → Statuscode `400 Bad Request`.
- `GET /threads/:id` mit einer gültigen ID → Statuscode `200 OK` zusammen mit dem gemockten Thread-Payload.
- `GET /threads/:id` für einen nicht existierenden Thread → der Controller gibt dem Client korrekt `404 Not Found` zurück.

> Es ist möglich, dass deine Routen andere Namen haben – passe die Testfälle entsprechend an.

---

## Aufgabe 3: End-to-End-Tests (E2E)

E2E-Tests beweisen, dass das gesamte System – vom HTTP-Router bis zur SQLite-Datei – harmonisch zusammenarbeitet.

Erstelle eine dedizierte E2E-Testumgebung. Konfiguriere `TypeOrmModule` im Test-Setup so, dass eine vollständig separate Datenbank verwendet wird (z. B. eine In-Memory-SQLite-Datenbank), damit die Tests die Entwicklungsdaten nicht verunreinigen.

Implementiere die folgenden Testfälle:

### Der vollständige Lebenszyklus

Schreibe einen Test, der:
1. einen `POST`-Request sendet, um einen Thread zu erstellen,
2. die generierte UUID aus der Response extrahiert,
3. einen weiteren `POST`-Request sendet, um einen Comment zu diesem Thread hinzuzufügen,
4. und abschließend einen `GET`-Request sendet, um den Thread abzurufen.

Prüfe, dass sowohl die Thread-Daten als auch der zugehörige Comment gemeinsam zurückgegeben werden.

### Der Fehlerpfad

Sende einen `GET`-Request mit einer zufällig generierten UUID, die definitiv nicht in der Test-Datenbank existiert. Verifiziere, dass die Anwendung sauber `404` zurückgibt, ohne abzustürzen.

---

## Aufgabe 4: Optional

Wer die Kernaufgaben früh abschließt, kann die Test-Suite durch gezielte Prüfung auf böswillige Eingaben und unerwartete Datenbankfehler weiter stärken:

### Repository-Fehlerzustände

Füge einen Unit Test hinzu, der prüft, was passiert, wenn `repository.save()` einen unerwarteten Fehler wirft – zum Beispiel einen Datenbank-Lock. Zwinge den Mock dazu, fehlzuschlagen:

```typescript
mockRepository.save.mockRejectedValue(new Error('DB Offline'));
```

Stelle sicher, dass der Service diesen Fehler kontrolliert behandelt.

### Böswillige Payloads

Sende in den E2E-Tests einen `POST /threads`-Request, bei dem:
- der `title` 50.000 Zeichen lang ist, oder
- die `id` explizit im Payload mitgeschickt wird, um zu versuchen, einen bestehenden Datensatz zu überschreiben.

Verifiziere, dass die Anwendung solche Anfragen sauber ablehnt.