# Backend-Grundlagen und Express – Routing

Eine API ist eine Sammlung von Endpunkten, und jeder Endpunkt benötigt Code, der ihn verarbeitet. Routing ist die Art und Weise, wie Express eine eingehende Anfrage mit dem richtigen Code verbindet. Jede Route besteht aus drei Dingen: einer HTTP-Methode (GET, POST, PUT, DELETE und andere), einem URL-Pfad und einer Handler-Funktion, die ausgeführt wird, wenn eine Anfrage auf beides zutrifft.

Wenn der Server eine Anfrage empfängt, geht Express die registrierten Routen in der Reihenfolge durch, in der sie definiert wurden. Es vergleicht Methode und URL der Anfrage mit jeder Route. Der erste Treffer gewinnt: Express ruft den Handler dieser Route auf und sucht nicht weiter. Wenn nichts übereinstimmt, antwortet Express mit dem Status 404 und einer Standard-„Not Found"-Meldung.

Dieses Abgleichsystem macht Express nützlich. Anstatt selbst eine lange `if`/`else`-Kette zu schreiben, die URL und Methode prüft, deklariert man jede Route separat und lässt Express die Weiterleitung übernehmen. Das Ergebnis ist Code, der nach dem organisiert ist, was jeder Endpunkt tut – nicht nach Parsing-Logik.

Routen können auch variable Segmente enthalten. Ein Pfad wie `/books/:id` trifft auf jede URL zu, die mit `/books/` gefolgt von einem beliebigen Wert beginnt. Express erfasst diesen Wert und stellt ihn über das Request-Objekt bereit. Query-Strings funktionieren ähnlich: Schlüssel-Wert-Paare, die nach einem `?` an die URL angehängt werden, werden automatisch geparst und über `req.query` zugänglich gemacht. Beide Mechanismen ermöglichen es, mit einer einzelnen Routendefinition viele verschiedene Anfragen zu verarbeiten.

## Routendefinitionen

Express stellt für jedes HTTP-Verb eine Methode bereit. Diese wird auf dem App-Objekt aufgerufen, wobei der Pfad als erstes Argument und die Handler-Funktion als zweites übergeben wird:

```typescript
app.get("/books", (req, res) => {
  res.json(books);
});

app.post("/books", (req, res) => {
  const newBook = req.body;
  books.push(newBook);
  res.status(201).json(newBook);
});

app.delete("/books/:id", (req, res) => {
  const id = req.params.id;
  books = books.filter((book) => book.id !== id);
  // ... den Fall behandeln, wenn kein Buch gefunden wurde
  res.status(204).send();
});
```

Die Methodennamen entsprechen direkt den HTTP-Verben: `app.get()`, `app.post()`, `app.put()`, `app.patch()`, `app.delete()`. Mehrere Routen können denselben Pfad teilen, solange ihre Methoden verschieden sind. Ein GET auf `/books` und ein POST auf `/books` sind zwei separate Routen, jede mit eigenem Handler.

## Routenparameter

Ein Routenparameter ist ein benanntes Segment im URL-Pfad, dem ein Doppelpunkt vorangestellt wird. Es dient als Platzhalter, der jeden Wert an dieser Position trifft. Express erfasst den tatsächlichen Wert aus der URL und speichert ihn in `req.params` als Schlüssel-Wert-Paar.

```typescript
app.get("/books/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books.find((b) => b.isbn === isbn);

  if (!book) {
    res.status(404).json({ error: "Buch nicht gefunden" });
    return;
  }

  res.json(book);
});
```

Der Pfad `/books/:isbn` trifft auf URLs wie `/books/978-3-16-148410-0` oder `/books/42` zu. Was auch immer an der `:isbn`-Position steht, wird zum Wert von `req.params.isbn`.

Eine Route kann mehrere Parameter haben. Der Pfad `/authors/:authorId/books/:bookId` erzeugt `req.params.authorId` und `req.params.bookId`.

> **Hinweis:** Routenparameter-Werte (`req.params.id`) sind immer Strings. Wenn beispielsweise `book.id` eine Zahl sein soll, würde das Programm zwar laufen, aber jede Anfrage nach Büchern würde lautlos fehlschlagen. Wenn eine Zahl benötigt wird, muss explizit mit `Number()` oder `parseInt()` konvertiert werden.

> **Gut zu wissen:** Beim Prüfen des Typs von `req.params` fällt auf, dass die Parameterteile der URL automatisch erkannt werden und `req.params` korrekt typisiert ist. Das ist etwas TypeScript-Magie, die vom Express-Types-Paket bereitgestellt wird – ein Beispiel dafür, wie mächtig das Typsystem von TypeScript sein kann.

## Query-Strings

Query-Strings sind Schlüssel-Wert-Paare, die nach einem Fragezeichen an die URL angehängt werden. Sie werden häufig zum Filtern, Sortieren oder für die Paginierung verwendet. Express parst sie automatisch und stellt sie über `req.query` bereit.

```
http://localhost:3000/books?author=Fitzgerald
```

```typescript
app.get("/books", (req, res) => {
  const author = req.query.author;

  if (author) {
    const filtered = books.filter((b) => b.author === author);
    res.json(filtered);
    return;
  }

  res.json(books);
});
```

Eine Anfrage an `/books?author=Fitzgerald` setzt `req.query.author` auf `"Fitzgerald"`. Mehrere Query-Parameter werden durch `&` getrennt: `/books?author=Fitzgerald&year=1925` erzeugt `req.query.author` und `req.query.year`.

Der Unterschied zwischen Routenparametern und Query-Strings ist struktureller Natur. Routenparameter sind Teil des Pfads und identifizieren eine bestimmte Ressource (`/books/42`). Query-Strings sind optionale Modifikatoren, die eine Anfrage verfeinern oder filtern (`/books?author=Fitzgerald`). Die URL funktioniert auch ohne Query-Strings – sie gibt dann alle Ergebnisse statt einer gefilterten Teilmenge zurück.

## Reihenfolge der Routen

Express wertet Routen in der Reihenfolge aus, in der sie registriert wurden. Die erste Route, deren Methode und Pfad zur Anfrage passen, wird aufgerufen. Das spielt eine Rolle, wenn zwei Routen auf dieselbe URL zutreffen könnten.

```typescript
app.get("/books/featured", (req, res) => {
  res.json(featuredBooks);
});

app.get("/books/:id", (req, res) => {
  const book = books.find((b) => b.id === req.params.id);
  res.json(book);
});
```

Wäre die Route mit `:id` zuerst registriert, würde eine Anfrage an `/books/featured` auf sie zutreffen, mit `req.params.id` gleich `"featured"`. Der Handler für `/books/featured` würde nie ausgeführt. Indem die spezifischere Route oberhalb der parametrisierten platziert wird, lässt sich dieses Problem vermeiden.

> **Achtung:** Eine häufige Fehlerquelle ist das Registrieren einer parametrisierten Route wie `/books/:id` vor einer festen Route wie `/books/featured`. Die parametrisierte Route „schluckt" die Anfrage, weil `featured` ein gültiger Wert für `:id` ist. Feste Pfade sollten immer oberhalb parametrisierter stehen.

## Ressourcen

- [Express-Routing-Guide](https://expressjs.com/en/guide/routing.html)