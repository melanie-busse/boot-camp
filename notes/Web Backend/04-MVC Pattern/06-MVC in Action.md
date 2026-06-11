# Backend MVC Pattern – MVC in der Praxis

Nachdem jeder Teil der MVC-Architektur einzeln betrachtet wurde, sehen wir uns an, wie sie miteinander interagieren. Das Muster wird viel klarer, wenn man einen einzelnen Request durch jede Schicht verfolgt und sieht, was jede Schicht tatsächlich damit macht.

Das folgende Beispiel verfolgt den Lebenszyklus eines HTTP-Requests – von der URL, die den Server trifft, bis zum gerenderten HTML, das ihn verlässt. Die App verwendet eine JSON-Datei als Datenspeicher und Nunjucks als Template-Engine. Derselbe Ablauf gilt jedoch für jedes MVC-Backend, unabhängig davon, wo die Daten gespeichert sind oder wie das HTML erzeugt wird.

---

## Blog-Post-Beispiel

Indem wir den Lebenszyklus eines Requests verfolgen, erhalten wir ein grundlegendes Verständnis dafür, wie die Schichten miteinander interagieren.

Verfolgen wir die genaue Reihenfolge, wenn ein Nutzer einen bestimmten Blog-Post anfragt. Die strikten Grenzen bei jedem Schritt sind dabei entscheidend:

**1. Die App (`app.ts`):** Der Request trifft in der Hauptserver-Datei ein. Express erkennt, dass die URL mit `/posts` beginnt, und leitet den Request an den Post-Router weiter.

```typescript
import express from "express";
import postRoutes from "./routes/postRoutes";

const app = express();
app.set("view engine", "njk");
app.use("/posts", postRoutes);

app.listen(3000);
```

**2. Der Router (`routes/postRoutes.ts`):** Der Router gleicht den genauen Pfad ab (z. B. `/:slug`) und übergibt den Request an die Controller-Funktion `showPost`.

```typescript
import { Router } from "express";
import * as postController from "../controllers/postController";

const router = Router();

router.get("/", postController.listPosts);
router.get("/:slug", postController.showPost);

export default router;
```

**3. Der Controller (`controllers/postController.ts`):** Extrahiert den `slug` aus den URL-Parametern und fragt das Model nach dem entsprechenden Post.

```typescript
import { Request, Response } from "express";
import * as postModel from "../models/postModel";

export function showPost(req: Request, res: Response) {
  const post = postModel.getPostBySlug(req.params.slug);
  if (!post) {
    res.status(404).send("Post not found");
    return;
  }
  res.render("post", { post });
}
```

**4. Das Model (`models/postModel.ts`):** Führt die Datenzugriffslogik aus. Es liest die JSON-Datei (oder fragt eine Datenbank ab), findet den passenden Post und gibt das rohe TypeScript-Objekt an den Controller zurück.

```typescript
import fs from "node:fs";
import path from "node:path";

const postsFilePath = path.join(__dirname, "../data/posts.json");

export function getPostBySlug(slug: string): Post | null {
  const raw = fs.readFileSync(postsFilePath, "utf8");
  const posts: Post[] = JSON.parse(raw);
  return posts.find((post) => post.slug === slug) ?? null;
}
```

**5. Der Controller (erneut):** Der Controller wertet die zurückgegebenen Daten aus. Existiert kein Post, gibt er einen 404-Fehler zurück. Andernfalls übergibt er die Daten an die View: `res.render("post", { post });`

**6. Die View (`views/post.html`):** Das Nunjucks-Template nimmt die Rohdaten, fügt sie in die HTML-Struktur ein und erzeugt die fertige Webseite.

```html
<article>
  <h1>{{ post.title }}</h1>
  <time datetime="{{ post.createdAt }}">{{ post.createdAt }}</time>
  <p>{{ post.content }}</p>
</article>
```

**7. Die Response:** Express sendet das fertig gerenderte HTML zurück an den Browser des Nutzers.

---

## Resultierende Ordnerstruktur

Die Anwendung dieses Musters verwandelt das unübersichtliche Single-File-Express-Skript in eine saubere, vorhersehbare Verzeichnisstruktur.

```
project-root/
  ├── app.ts                  # App-Setup und Router-Einbindung
  ├── routes/
  │   └── postRoutes.ts       # URL-zu-Controller-Zuordnung
  ├── controllers/
  │   └── postController.ts   # HTTP-Logik (req, res)
  ├── models/
  │   └── postModel.ts        # Datenlogik (Dateien, Datenbanken)
  ├── views/
  │   └── post.html           # Darstellungslogik (Nunjucks)
  └── data/
      └── posts.json          # Die aktuelle „Datenbank"
```