# Backend Architectures – Models

Nachdem Routen und Controller in eigene Dateien gewandert sind, greifen die Controller immer noch direkt auf das Dateisystem zu. Sie rufen `fs.readFileSync` auf, parsen das JSON, filtern durch das Ergebnis und schreiben das Array manchmal zurück. Jeder Controller, der Daten benötigt, wiederholt dieses Muster. Der Pfad zur JSON-Datei ist an mehreren Stellen hartcodiert, und die Form der Daten wird überall dort vorausgesetzt, wo sie gelesen werden. Verschiebt sich die Datei, oder ändert sich der Speicher später auf eine Datenbank, muss jeder Controller, der Daten anfasst, neu geschrieben werden.

Ein **Model** ist ein Modul, das den Datenzugriff und die Regeln rund um die Daten besitzt. Es exportiert Funktionen wie `getAllPosts`, `getPostBySlug` und `writePosts`. Code, der Daten benötigt, ruft diese Funktionen auf und erhält einfache JavaScript-Werte zurück. Wo die Daten tatsächlich gespeichert sind, ist die Angelegenheit des Models.

Der Gewinn zeigt sich an zwei Stellen. Controller werden einfacher, weil sie keinen Dateisystem-Code mehr enthalten und sich stattdessen wie eine Liste von Entscheidungen über Requests lesen. Und die Datenquelle zu wechseln wird zur Änderung in einer einzigen Datei: Dieselbe Model-Schnittstelle kann heute durch eine JSON-Datei und morgen durch eine Datenbank gestützt werden – nichts außerhalb des Models muss davon wissen.

Das Model ist auch der richtige Ort für Datentransformations-Regeln. Einen Slug aus einem Titel generieren, Posts nach Datum sortieren, einen Post anhand eines Felds finden: Das beschreibt, was die Daten tun – nicht was ein bestimmter Request braucht. Diese Logik lebt im Model, damit jeder Controller dieselbe Antwort erhält.

---

## Datenzugriff kapseln

Ein Model-Modul stellt eine kleine Menge benannter Funktionen bereit. Jede Funktion tut eine Sache. Intern hält das Modul alles, was es für seine Aufgabe benötigt: Dateipfade, Hilfsfunktionen, Typdefinitionen. Nichts davon dringt nach außen.

```typescript
import fs from "fs";
import path from "path";

export interface Post {
  title: string;
  image: string;
  author: string;
  createdAt: number;
  teaser: string;
  content: string;
}

const postsFilePath = path.join(__dirname, "..", "data", "posts.json");
```

Zwei Designentscheidungen sind hervorzuheben:

- Das `Post`-Interface wird exportiert, damit Controller und Templates auf dieselbe Datenform verweisen können. Es gibt eine einzige Quelle der Wahrheit dafür, wie ein Post aussieht.
- Der Dateipfad ist eine Konstante auf Modulebene. Controller wissen nichts davon – und den Speicherort später zu ändern bedeutet, eine einzige Zeile zu bearbeiten.

---

## JSON-Datei lesen und schreiben

Das Model stellt eine Funktion bereit, um alle Posts zu lesen, und eine, um die Datei mit einer neuen Liste zu überschreiben. Alle anderen Operationen bauen auf diesen beiden auf.

```typescript
export function getAllPosts(): Post[] {
  const raw = fs.readFileSync(postsFilePath, "utf8");
  return JSON.parse(raw) as Post[];
}

export function writePosts(posts: Post[]): void {
  fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2), "utf8");
}
```

`getAllPosts` liest die Datei synchron, parst das JSON und gibt ein typisiertes Array zurück. Synchrones I/O ist hier akzeptabel, weil der Datensatz klein ist und der Kompromiss einfacherer Code ist. In einer Anwendung mit hohem Traffic wären die asynchronen Varianten die bessere Wahl.

`writePosts` nimmt ein vollständiges Array und schreibt es zurück. Endpunkte, die Posts anlegen, aktualisieren oder löschen, lesen das Array, modifizieren es und rufen `writePosts` auf, um die Änderung zu persistieren. Die Schreiboperation als einfaches „Ersetze-die-ganze-Datei" zu halten ist für die kleine JSON-Datei hier vollkommen in Ordnung.

---

## Slug-Suche

Die meisten Blog-Operationen müssen einen Post anhand seines URL-Slugs finden. Ein Slug ist eine URL-sichere Version des Post-Titels – erzeugt durch Kleinschreibung und Ersetzen nicht-alphanumerischer Zeichenfolgen durch Bindestriche. Das Model besitzt Regeln wie diese, damit jeder Teil der App Slugs auf dieselbe Weise ableitet.

```typescript
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((post) => slugify(post.title) === slug);
}
```

`slugify` wird exportiert, weil Templates und Controller sie ebenfalls benötigen können – eine Listenseite muss zum Beispiel den Link für jeden Post aufbauen. `getPostBySlug` liest alle Posts und gibt denjenigen zurück, dessen Slug übereinstimmt – oder `undefined`, wenn kein Post passt. Der Controller, der die Funktion verwendet, entscheidet, was bei `undefined` zu tun ist – in der Regel gibt er eine 404-Antwort zurück.

---

## Weiterführende Ressourcen

- [Node.js fs-Modul](https://nodejs.org/api/fs.html)