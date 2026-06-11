# Backend Architectures – Controllers

Ein Controller ist eine Datei, Klasse oder benannte Funktion, die die Logik zur Verarbeitung von Requests enthält. Er lebt in einem eigenen Modul, getrennt von den Routen, die URLs mit ihm verdrahten. Dadurch wird die Routen-Datei zu einer kurzen, übersichtlichen Liste von Zuordnungen zwischen URL und konkreter Controller-Funktion. Der Controller selbst enthält die eigentlichen Handler – jeder benannt nach dem, was er tut, nicht nach der URL, die ihn auslöst.

Allein die Benennung macht einen Unterschied. Ein Handler namens `listPosts` sagt, was er ist. Ein inline definierter Handler als `(req, res) => { ... }` sagt gar nichts – bis man seinen Inhalt liest. Und wenn zwei Routen dieselbe Logik benötigen, kann eine benannte Funktion in beide eingebunden werden, ohne Code zu duplizieren.

Controller ziehen außerdem eine klare architektonische Linie: Die Routen-Datei verdrahtet, der Controller verarbeitet Requests, und alles andere wird weiter nach unten verschoben – ins Model oder ins Template. Wenn eine Änderung nötig ist, passt sie meistens genau an eine dieser Stellen.

---

## Controller-Funktionen in Express

Ein Controller ist eine einfache TypeScript-Funktion mit derselben Signatur, die Express von einem Route-Handler erwartet: Sie nimmt einen `Request` und einen `Response` entgegen und gibt nichts zurück. Die Typen stammen aus dem `express`-Paket.

```typescript
import { Request, Response } from "express";
import * as postModel from "../models/postModel";

export function listPosts(req: Request, res: Response) {
  const posts = postModel.getAllPosts();
  res.render("index", { posts });
}

export function showPost(req: Request, res: Response) {
  const post = postModel.getPostBySlug(req.params.slug);
  if (!post) {
    res.status(404).send("Post not found");
    return;
  }
  res.render("post", { post });
}
```

Ein paar wichtige Punkte:

- Jede Controller-Funktion hat einen Namen, der beschreibt, was sie tut. Die Namen lesen sich wie Verben, weil jede Funktion eine Aktion ausführt: auflisten, anzeigen, erstellen, löschen.
- Der Controller importiert das Model und ruft dessen Funktionen auf, anstatt selbst auf Dateien zuzugreifen. Das Model entscheidet, wie die Daten gespeichert werden.
- Der Controller wählt das Template und den Response-Statuscode. Das ist seine Aufgabe. Er generiert kein HTML und parst keine URLs von Hand.
- Fehlt etwas, antwortet der Controller mit dem passenden Statuscode und bricht ab. Ein `else`-Zweig ist nicht nötig, weil die Funktion nach der 404-Antwort zurückkehrt.
- Die Typisierung von `req` und `res` mit den Express-Typen ermöglicht Editor-Autocomplete für `req.params`, `req.query`, `req.body` und die Response-Methoden – und fängt Tippfehler zur Kompilierzeit ab.

---

## Routenparameter typisieren

Wenn der Handler inline in der Routendefinition lebte, konnte die Express-Routenmethode die Parameter aus der URL ableiten und diesen Kontext an den Handler weitergeben. Sobald der Handler in ein Controller-Modul verschoben wird, ist dieser Kontext und die Typinferenz weg.

Expresss `Request`-Typ akzeptiert ein Generic, das die Parameter benennt, die dieser Controller erwartet:

```typescript
export function showPost(req: Request<{ slug: string }>, res: Response) {
  const post = postModel.getPostBySlug(req.params.slug);
  if (!post) {
    res.status(404).send("Post not found");
    return;
  }
  res.render("post", { post });
}
```

Das Generic `{ slug: string }` beschränkt `req.params` auf die Parameter, die dieser Handler tatsächlich benötigt. Ein Tippfehler wie `req.params.slugg` schlägt jetzt zur Kompilierzeit fehl, und der Editor schlägt `slug` direkt vor. Wird die Route später auf einen anderen Parameternamen geändert, kompiliert der Controller nicht mehr, bis er entsprechend angepasst wurde.

---

## Controller mit Routen verdrahten

Sobald Handler in einem Controller-Modul leben, schrumpft die Router-Datei zu einer Liste von Zuordnungen. Jede Routendeklaration importiert die benannte Funktion und übergibt sie als Handler.

```typescript
import { Router } from "express";
import { listPosts, showPost } from "../controllers/postController";

const router = Router();

router.get("/", listPosts);
router.get("/:slug", showPost);

export default router;
```

Die Router-Datei liest sich jetzt wie ein Inhaltsverzeichnis für einen Teil der App. Ein Request an die Wurzel dieses Routers führt `listPosts` aus. Ein Request an `/:slug` führt `showPost` aus. Die Implementierungsdetails dieser Funktionen sind hier nicht sichtbar – und genau das ist der Punkt. Wer die Datei überfliegt, erkennt die URL-Struktur, ohne von Handler-Inhalten abgelenkt zu werden.

---

## Weiterführende Ressourcen

- [Express Request und Response API](https://expressjs.com/en/api.html)