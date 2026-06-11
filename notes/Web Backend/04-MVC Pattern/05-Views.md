# Backend MVC Pattern – Views

Die View ist die Schicht, die der Nutzer tatsächlich empfängt. In dieser Session war die View bisher ein Nunjucks-Template: Der Controller ruft `res.render("post", { post })` auf, die Template-Engine baut das HTML zusammen, und der Response-Body ist das Ergebnis.

Wichtig zu betonen: „View" ist kein Synonym für „HTML-Template". Eine View ist jede Darstellung der Daten, die den Server verlässt. Bei einer klassischen Webseite ist das ein gerendertes Template. Bei einer JSON-API ist die View die JSON-Struktur, die der Controller in den Response-Body schreibt. Dasselbe Model kann hinter beiden stehen – mit unterschiedlichen Views über dieselben Daten.

---

## HTML-Views mit Nunjucks

Für HTML-Responses lebt die View in einer Template-Datei unter `views/`. Nunjucks liest das Template, fügt die vom Controller übergebenen Daten ein und gibt das fertige HTML zurück. Der Controller baut niemals selbst HTML – er wählt einen Template-Namen und die einzufügenden Daten:

```typescript
res.render("post", { post });
```

Die Template-Datei ist die View.

---

## JSON-Views

Wenn die Response JSON ist, entspricht das Äquivalent eines Templates einer Funktion, die ein Model-Objekt entgegennimmt und die Form zurückgibt, die der Client sehen soll. Diese Funktion in ein eigenes Modul auszulagern hält die Datenformung aus dem Controller heraus und gibt jedem Endpunkt, der einen Post zurückgibt, eine einzige Quelle der Wahrheit dafür, wie ein Post in der API aussieht.

```typescript
// views/postView.ts
import { Post } from "../models/postModel";

export function postAsJson(post: Post) {
  return {
    title: post.title,
    author: post.author,
    body: post.content,
  };
}
```

Der Controller importiert diese View-Funktion und übergibt ihr Ergebnis an `res.json` anstelle von `res.render`:

```typescript
import { postAsJson } from "../views/postView";

export function showPost(req: Request<{ slug: string }>, res: Response) {
  const post = postModel.getPostBySlug(req.params.slug);
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(postAsJson(post));
}
```

Das von `postAsJson` zurückgegebene Objekt ist die View. Es entscheidet, welche Felder exponiert werden, welche umbenannt werden und welche verborgen bleiben – ein interner `createdAt`-Zeitstempel im Model kann in der API-Response einfach fehlen. Eine andere View-Funktion (`postAsListItem`, `postAsSummary`) kann aus demselben `Post` eine andere Form für einen anderen Endpunkt erzeugen.

---

## Die Grenze bleibt dieselbe

Die Grenze ist unabhängig vom Format dieselbe. Die View greift niemals auf den Speicher zu und entscheidet niemals, ob ein Request gültig ist. Sie empfängt bereits vom Controller aufbereitete Daten und erzeugt die Bytes, die der Nutzer empfängt.

---

## Weiterführende Ressourcen

- [Express Response API](https://expressjs.com/en/4x/api.html#res)