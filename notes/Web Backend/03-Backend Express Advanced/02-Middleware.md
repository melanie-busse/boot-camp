# Backend Express.js – Middleware

Wenn eine Anfrage bei einem Express-Server eintrifft, gelangt sie nicht direkt zum Route-Handler. Sie durchläuft zuerst eine Kette von Funktionen. Jede Funktion in dieser Kette wird Middleware genannt. Eine Middleware-Funktion kann die Anfrage inspizieren, sie verändern, frühzeitig eine Antwort senden oder die Kontrolle an die nächste Funktion in der Kette weitergeben. So behandelt Express Aufgaben, die für viele oder alle Routen relevant sind, ohne Code in jedem Handler zu duplizieren.

Das Parsen eines JSON-Request-Bodys ist ein gutes Beispiel. POST- und PUT-Anfragen übertragen häufig Daten im Body – Express parst diese Daten jedoch nicht automatisch. Wird ohne Middleware auf `req.body` zugegriffen, ist es `undefined`. Eine Middleware-Funktion muss vor den Route-Handlern sitzen, den rohen Body-Stream lesen, ihn als JSON parsen und das Ergebnis an `req.body` anhängen, damit die Handler damit arbeiten können. Express liefert `express.json()` genau für diesen Zweck.

Weitere typische Middleware-Aufgaben sind das Loggen jeder eingehenden Anfrage, das Prüfen von Authentifizierungs-Tokens, das Setzen von Sicherheits-Headern oder das Komprimieren von Antworten. Für die meisten davon gibt es Drittanbieter-Pakete. Der entscheidende Punkt ist: Middleware hält diese Art von Arbeit aus den Route-Handlern heraus. Ein Route-Handler konzentriert sich darauf, was mit einer bestimmten Anfrage zu tun ist. Middleware kümmert sich um alles, was unabhängig von der aufgerufenen Route ausgeführt werden muss.

Middleware wird in der Reihenfolge ausgeführt, in der sie registriert wird. Die Reihenfolge der `app.use()`-Aufrufe ist daher entscheidend. Wenn eine Body-Parsing-Middleware nach einer Route registriert wird, hat diese Route keinen Zugriff auf `req.body`. Die Kette ist sequenziell, und jede Middleware entscheidet, ob die Anfrage zum nächsten Schritt weitergeleitet wird oder stoppt.

---

## Die Middleware-Signatur

Eine Middleware-Funktion nimmt drei Parameter entgegen: `req`, `res` und `next`.

```typescript
import type { NextFunction, Request, Response } from "express";

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method} ${req.url}`);
  next();
}
```

`req` und `res` sind dieselben Request- und Response-Objekte, die auch Route-Handler erhalten. Der dritte Parameter, `next`, ist eine Funktion. Der Aufruf von `next()` übergibt die Kontrolle an die nächste Middleware oder den nächsten Route-Handler in der Kette. Wenn eine Middleware weder `next()` aufruft noch eine Antwort sendet, hängt die Anfrage. Der Client wartet unbegrenzt, weil nichts antwortet und die Anfrage nicht weitergeführt wird – probiere es selbst aus!

Eine Middleware-Funktion hat genau zwei Möglichkeiten:

- `next()` aufrufen, um die Kontrolle an die nächste Funktion in der Kette weiterzugeben
- Eine Antwort mit `res.json()`, `res.send()` oder ähnlichen Methoden senden, was den Zyklus beendet

Beides gleichzeitig sollte sie niemals tun. Eine Antwort zu senden und danach `next()` aufzurufen verursacht Fehler, weil Express versucht, dieselbe Anfrage zweimal zu verarbeiten.

---

## Middleware anwenden

Als Beispiel betrachten wir erneut die `express.json()`-Middleware aus der vorherigen Session. Zur Erinnerung: `express.json()` ist eine eingebaute Middleware, die eingehende Request-Bodys im JSON-Format parst. Sie liest den rohen Body-Stream, parst ihn und weist das Ergebnis `req.body` zu. Ohne sie findet jede Route, die Daten vom Client erwartet, in `req.body` den Wert `undefined`.

Eine Middleware wie `express.json()` anzuwenden ist einfach – mit `app.use()` zur Express-App hinzufügen:

```typescript
const app = express();

app.use(express.json());
```

---

## Application-Level Middleware

`app.use()` registriert Middleware, die bei jeder eingehenden Anfrage ausgeführt wird – unabhängig von Pfad oder HTTP-Methode. Das nennt sich Application-Level Middleware.

```typescript
const app = express();

app.use(express.json());

app.get("/books", (req, res) => {
  res.json(books);
});

app.post("/books", (req, res) => {
  books.push(req.body);
  res.status(201).json(req.body);
});
```

In diesem Beispiel wird `express.json()` vor beiden Handlern ausgeführt – sowohl vor GET als auch vor POST. Der GET-Handler nutzt `req.body` nicht, die Middleware läuft aber trotzdem. Das ist unproblematisch: Die Middleware parst den Body nur, wenn die Anfrage einen JSON-Content-Type hat. Bei GET-Anfragen, die typischerweise keinen Body haben, tut sie nichts und ruft intern `next()` auf.

Die Reihenfolge der `app.use()`-Aufrufe relativ zu den Route-Definitionen bestimmt, ob die Middleware vor oder nach einer bestimmten Route läuft. Oben in der Datei registrierte Middleware läuft zuerst. Middleware, die nach einer Route-Definition registriert wird, hat keinen Einfluss auf frühere Routen.

```typescript
app.post("/early", (req, res) => {
  console.log(req.body); // undefined – express.json() wurde noch nicht ausgeführt
  res.json({ received: req.body });
});

app.use(express.json());

app.post("/late", (req, res) => {
  console.log(req.body); // geparste JSON-Objekt
  res.json({ received: req.body });
});
```

Die Route `/early` ist vor `express.json()` registriert – `req.body` ist im Handler daher noch `undefined`. Die Route `/late` ist danach registriert, sodass die Middleware den Body bereits geparst hat.

---

## Weiterführende Links

- [Express Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)
- [Express Built-in Middleware](https://expressjs.com/en/4x/api.html#express.json)