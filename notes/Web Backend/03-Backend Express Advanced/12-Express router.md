# Backend Express Advanced – Express Router

Routen in einer Express-Anwendung gehören immer zu irgendetwas. Eine `GET /books`-Route gehört zu Books. Eine `POST /users`-Route gehört zu Users. Diese Zugehörigkeit ist real und bedeutsam – wenn aber alle Routen direkt am `app`-Objekt in einer einzigen Datei registriert werden, spiegelt der Code das nicht wider. Eine Books-Route und eine Users-Route sind dann nur zwei benachbarte Zeilen. Nichts in der Dateistruktur signalisiert, dass es sich um unterschiedliche Zuständigkeiten handelt, und alles zu einer Ressource zu finden bedeutet, die gesamte Datei zu durchsuchen.

Der Express Router macht diese Zugehörigkeit explizit. `express.Router()` erstellt ein eigenständiges Routing-Objekt, das sich wie eine Mini-Express-App verhält. Routen werden darauf genauso registriert wie auf `app`, anschließend wird der gesamte Router unter einem Pfad-Präfix in die Hauptanwendung eingebunden. Jede Anfrage, die zu diesem Präfix passt, wird an den Router übergeben, der den Rest des Pfades gegen seine eigenen Routen auflöst.

Das praktische Ergebnis ist ein `routes/`-Ordner, in dem jede Datei genau eine Ressource abdeckt. `routes/books.ts` enthält alle Routen für Books. `routes/users.ts` enthält alle Routen für Users. Die `index.ts` importiert diese Router und bindet sie in wenigen Zeilen ein. Die Ressourcengrenze, die konzeptionell bereits existierte, existiert nun auch im Dateisystem.

---

## Einen Router erstellen

Ein Router wird durch den Aufruf von `express.Router()` erstellt, auf dem anschließend Routen registriert werden:

```typescript
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json(books);
});

router.post("/", (req, res) => {
  books.push(req.body);
  res.status(201).json(req.body);
});

export default router;
```

Die Pfade hier sind relativ. Sie enthalten nicht das Präfix, unter dem der Router eingebunden wird. Dieses Präfix wird erst beim Einbinden des Routers in die App definiert.

---

## Ordnerstruktur

Per Konvention liegen Router in einem `routes/`-Verzeichnis neben dem Haupt-Einstiegspunkt:

```
src/
  index.ts
  routes/
    books.ts
    users.ts
```

Jede Datei in `routes/` deckt eine Ressource ab. Sie erstellt einen Router, definiert die Routen für diese Ressource und exportiert den Router als Default-Export.

---

## Einen Router einbinden

Ein fertig definierter Router wird mit `app.use()` in die App eingebunden. Das erste Argument ist das Pfad-Präfix, das zweite der Router:

```typescript
import express from "express";
import booksRouter from "./routes/books";
import usersRouter from "./routes/users";

const app = express();

app.use(express.json());
app.use("/books", booksRouter);
app.use("/users", usersRouter);
```

Wenn eine Anfrage für `GET /books` eintrifft, entfernt Express das Präfix `/books` und übergibt den Rest (`/`) an den `booksRouter`. Der Router gleicht diesen Pfad dann gegen seine eigenen Routen ab.

Das bedeutet: Pfade innerhalb einer Router-Datei wiederholen das Präfix nicht. `router.get("/")` in `books.ts` verarbeitet `GET /books`, und `router.get("/:id")` verarbeitet `GET /books/:id`. Präfix und Routenpfad werden erst zur Laufzeit zusammengesetzt.

---

## Öffentliche und geschützte Routen

Nicht jede Route in einer Anwendung soll für jeden zugänglich sein. Routen, die öffentliche Daten zurückgeben, können offen bleiben. Routen, die Daten erstellen, aktualisieren oder löschen, erfordern typischerweise eine authentifizierte Anfrage.

Da jeder Router eigenständig ist, kann ein Router, der Schutz benötigt, seine Authentifizierungsprüfung intern mit `router.use()` registrieren. Die Zugriffskontrolle bleibt damit in der Router-Datei, direkt neben den Routen, die sie schützt. Die `index.ts` muss nicht wissen, welche Routen öffentlich oder geschützt sind.

Eine Authentifizierungs-Middleware prüft, ob die Anfrage gültige Credentials enthält. Die Implementierungsdetails spielen hier noch keine Rolle. Wichtig ist die Form: Die Middleware ruft entweder `next()` auf, um die Anfrage durchzulassen, oder sendet eine `401`-Antwort, um sie zu stoppen.

```typescript
import type { NextFunction, Request, Response } from "express";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Credentials hier prüfen
  const isAuthenticated = false;

  if (!isAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}
```

Ein Router, der vollständig geschützt sein soll, registriert `authenticate` vor seinen Routen:

```typescript
// routes/users.ts
import { Router } from "express";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

router.get("/", (req, res) => {
  res.json(users);
});

router.post("/", (req, res) => {
  users.push(req.body);
  res.status(201).json(req.body);
});

export default router;
```

Ein Router, der teilweise öffentlich ist, registriert `authenticate` nach seinen öffentlichen Routen:

```typescript
// routes/books.ts
import { Router } from "express";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// Öffentliche Routen vor der Middleware
router.get("/", (req, res) => {
  res.json(books);
});

router.use(authenticate);

// Geschützte Routen nach der Middleware
router.put("/:id", (req, res) => {
  // Buch aktualisieren
});
router.delete("/:id", (req, res) => {
  // Buch löschen
});

export default router;
```

In der `index.ts` werden beide Router auf dieselbe Weise eingebunden. Der Unterschied in der Zugriffskontrolle ist vollständig in den jeweiligen Router-Dateien gekapselt:

```typescript
app.use("/books", booksRouter);
app.use("/users", usersRouter);
```

---

## Weiterführende Links

- [Express Router – Dokumentation](https://expressjs.com/en/api.html#router)
- [Express Routing Guide](https://expressjs.com/en/guide/routing.html)