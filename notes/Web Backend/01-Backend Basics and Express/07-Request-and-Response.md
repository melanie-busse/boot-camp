# Backend-Grundlagen und Express – Request und Response

Jeder Route-Handler in Express empfängt zwei Objekte. Das erste ist `req`, das die eingehende HTTP-Anfrage repräsentiert. Es enthält alles, was der Client gesendet hat: den URL-Pfad, Routenparameter, Query-String-Werte, Header und den Request-Body. Das zweite ist `res`, das die ausgehende HTTP-Antwort repräsentiert. Es stellt Methoden bereit, um Daten an den Client zurückzusenden, Statuscodes zu setzen und Header zu steuern.

Diese beiden Objekte sind die primäre Schnittstelle zwischen der Anwendungslogik und der HTTP-Schicht. Das Lesen von Daten aus `req` sagt, was der Client möchte. Das Aufrufen von Methoden auf `res` bestimmt, was der Client zurückbekommt. Der größte Teil des Codes innerhalb von Route-Handlern ist eine Kombination aus dem Lesen aus dem einen und dem Schreiben in das andere.

Express erweitert die Standard-Request- und Response-Objekte von Node.js um Hilfsmethoden, die häufige Aufgaben automatisch erledigen. `res.json()` serialisiert ein Objekt als JSON und setzt den korrekten `Content-Type`-Header. `res.status()` setzt den HTTP-Statuscode und gibt das Response-Objekt zurück, sodass ein weiterer Methodenaufruf angekettet werden kann. Auf der Request-Seite sind `req.params` und `req.query` bereits geparst und als einfache Objekte nutzbar. Diese Ergänzungen beseitigen das manuelle String-Parsing und Header-Management, das reines Node.js erfordern würde.

Eines liefert `req` nicht automatisch: `req.body`. Wenn ein Client Daten im Request-Body sendet (typischerweise bei POST-, PUT- oder PATCH-Anfragen), parst Express diesen nicht standardmäßig. Die Eigenschaft `req.body` ist `undefined`, bis Middleware hinzugefügt wird, die den rohen Body-Stream liest und in ein nutzbares JavaScript-Objekt umwandelt. Die gebräuchlichste Middleware dafür ist `express.json()`.

## Das Request-Objekt

Das Request-Objekt enthält drei Hauptquellen für eingehende Daten. Jede entspricht einem anderen Teil der HTTP-Anfrage.

`req.params` enthält Routenparameter – die benannten Segmente, die mit einem Doppelpunkt im Routenpfad definiert werden.

`req.query` enthält Query-String-Parameter – die Schlüssel-Wert-Paare nach dem `?` in der URL. Eine Anfrage an `/books?genre=fiction&limit=10` ergibt:

```typescript
app.get("/books", (req, res) => {
  console.log(req.query.genre); // "fiction"
  console.log(req.query.limit); // "10"
});
```

`req.body` enthält Daten, die im Request-Body gesendet werden. Hier landen POST- und PUT-Nutzdaten, nachdem sie von Middleware geparst wurden. Ohne `express.json()` oder einen ähnlichen Parser ist `req.body` `undefined`.

```typescript
app.use(express.json()); // Body-Parser-Middleware hinzufügen

app.post("/books", (req, res) => {
  console.log(req.body);
});
```

Wichtig ist, dass `req.body` nicht typisiert ist. Da nicht bekannt ist, was der Client sendet, ist das beabsichtigt. Der Inhalt des Bodys muss validiert werden – entweder manuell durch Prüfen der Objekteinträge oder durch einen Schema-Validator wie [zod](https://github.com/colinhacks/zod).

## Antworten senden

Das Response-Objekt stellt mehrere Methoden bereit, um Daten an den Client zurückzusenden. Jede behandelt Serialisierung und Header unterschiedlich.

`res.send()` sendet eine Antwort mit automatischer Erkennung des Content-Types. Wird ein String übergeben, erhält die Antwort `Content-Type: text/html`. Wird ein Objekt oder Array übergeben, serialisiert Express es als JSON. Für die API-Entwicklung ist `res.json()` die explizitere Wahl.

```typescript
app.get("/health", (req, res) => {
  res.send("OK");
});
```

`res.json()` serialisiert das Argument als JSON und setzt `Content-Type: application/json`. Das ist die Standardmethode für API-Antworten.

```typescript
app.get("/books", (req, res) => {
  res.json(books);
});
```

`res.status()` setzt den HTTP-Statuscode. Es gibt das Response-Objekt selbst zurück, sodass es mit `json()` oder `send()` verkettet werden kann:

```typescript
app.post("/books", (req, res) => {
  const newBook = req.body;
  books.push(newBook);
  res.status(201).json(newBook);
});
```

Ohne einen expliziten `res.status()`-Aufruf verwendet Express standardmäßig `200`. Das explizite Setzen des Statuscodes macht die Bedeutung der Antwort für den Client klar und entspricht den HTTP-Konventionen.

## Häufige Antwortmuster

Einige Muster tauchen in fast jeder Express-API auf.

**Eine erstellte Ressource zurückgeben** verwendet Status 201, um zu signalisieren, dass eine neue Ressource erfolgreich erstellt wurde. Der Response-Body enthält typischerweise das erstellte Element:

```typescript
app.post("/books", (req, res) => {
  const book = { id: nextId++, ...req.body };
  books.push(book);
  res.status(201).json(book);
});
```

**Einen „Nicht gefunden"-Fehler zurückgeben** verwendet Status 404, wenn die angeforderte Ressource nicht existiert. Eine Fehlermeldung im Body hilft dem Client zu verstehen, was schiefgelaufen ist:

```typescript
app.get("/books/:id", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));

  if (!book) {
    res.status(404).json({ error: "Buch nicht gefunden" });
    return;
  }

  res.json(book);
});
```

Das `return` nach dem Senden der 404-Antwort ist notwendig. Ohne es läuft die Ausführung weiter bis zur Zeile `res.json(book)`, und Express wirft einen Fehler, weil nicht zwei Antworten auf dieselbe Anfrage gesendet werden können.

**Eine Löschung bestätigen** verwendet Status 204, was bedeutet „Erfolg, aber kein Inhalt zurückzugeben." Der Response-Body ist leer:

```typescript
app.delete("/books/:id", (req, res) => {
  books = books.filter((b) => b.id !== Number(req.params.id));
  res.status(204).send();
});
```

> **Achtung:** Das Vergessen des `return` nach dem Senden einer frühen Antwort (wie einer 404) ist ein häufiger Fehler. Express stoppt den Handler nicht automatisch, nachdem `res.json()` oder `res.send()` aufgerufen wurde. Wenn die Funktion weiterläuft und einen weiteren Antwortaufruf trifft, erscheint der Fehler „Cannot set headers after they are sent to the client."

## Ressourcen

- [Express Response API](https://expressjs.com/en/api.html#res)
- [Express Request API](https://expressjs.com/en/api.html#req)