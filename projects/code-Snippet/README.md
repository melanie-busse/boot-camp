## Code-Snippet-Bibliothek

Sie erstellen eine einfache Code-Snippet-Bibliothek, um all Ihre Code-Snippets an einem Ort zu verwalten. Die Snippets werden vorerst in einem Array auf dem Server gespeichert. In dieser Aufgabe entwickeln Sie sowohl die Snippet-Übersichtsseite als auch die Detailseite für jedes Snippet.

Erstellen Sie ein neues Next.js-Projekt mit denselben Setup-Antworten wie zuvor und speichern Sie die Code-Snippets anschließend in einer Service-Datei unter `lib/services/snippetsService.ts`:

```ts
export type Snippet = {
  id: number;
  title: string;
  language: string;
  description: string;
  code: string;
};

const snippets: Snippet[] = [
  {
    id: 1,
    title: "CSS Grid Areas",
    language: "CSS",
    description: "Create a grid with named areas.",
    code: ".grid-container {\n  display: grid;\n  grid-template-areas:\n    'header header header'\n    'sidebar content content'\n    'footer footer footer'; \n  grid-gap: 10px;\n  background-color: #2196F3;\n  padding: 10px;\n}",
  },
  {
    id: 2,
    title: "Range of numbers",
    language: "JavaScript",
    description: "Build an array from a start value up to an end value.",
    code: "const range = (start, end) =>\n  Array.from({ length: end - start }, (_, i) => start + i);",
  },
  {
    id: 3,
    title: "Group by key",
    language: "TypeScript",
    description: "Turn a list into buckets keyed by one of its fields.",
    code: "function groupBy(items, key) {\n  return items.reduce((acc, item) => {\n    (acc[item[key]] ??= []).push(item);\n    return acc;\n  }, {});\n}",
  },
];

export function getAllSnippets(): Snippet[] {
  return snippets;
}

export function getSnippetById(id: string): Snippet | null {
  return snippets.find((snippet) => snippet.id === id) || null;
}
```

Nachdem die Daten vorliegen, kann der Rest des Projekts aufgebaut werden:

Erstelle eine Liste aller Code-Snippets unter `/snippets`, die jeweils Titel, Sprache und Beschreibung anzeigt. Platziere den Code in einem `<span>`, `<pre>`- und `<code>`-Element sowie einem `<h1>`-Element, damit Zeilenumbrüche und Einrückungen erhalten bleiben.

Fügen Sie eine dynamische Route `/snippets/<id>` für die Detailseite eines einzelnen Snippets hinzu. Lesen Sie den `id`-Inhalt von `params`, suchen Sie das Snippet mit `getSnippetById` und zeigen Sie dessen vollständige Details an.

Verwenden Sie die `Link`-Komponente, um die Seiten zu verbinden: Jeder Abschnitt in der Liste verlinkt auf seine Detailseite, und die Detailseite verlinkt zurück zur Liste.

Laden Sie eine nichtproportionale Schriftart wie z. B. `JetBrains_Mono` für den Code und eine separate Schriftart wie z. B. `Inter` für alles andere, beide aus der Bibliothek `next/font/google`.

Die gesamte Formatierung sollte in einem einzigen `<style>`-Tag innerhalb des Root-Layouts erfolgen. Legen Sie dort die Typografie für Body und Überschriften fest und verwenden Sie die Monospace-Schriftart, `pre`, damit `code` die Code-Snippets wie Code aussehen. (Die eigentliche Gestaltung des Frontends wird in einer späteren Sitzung behandelt.)

### Snippets nach Sprache filtern

- Erstelle eine Client Component mit `"use client"`, die die Snippets als Prop entgegennimmt und die ausgewählte Sprache im State hält
- Render ein `<select>`, das jede Sprache auflistet, die in den Daten vorkommt, plus eine „All"-Option, und zeige nur die Snippets an, die zur Auswahl passen
- Übergib die Snippets von der `/snippets`-Page aus, die eine Server Component bleibt

### Ein „New Snippet"-Formular hinzufügen

- Füge dem `snippetsService` eine `createSnippet`-Funktion hinzu, die einen Titel, eine Sprache, eine Beschreibung und Code entgegennimmt, eine `id` zuweist, das Snippet hinzufügt und es zurückgibt
- Erstelle eine `/snippets/new`-Route mit einem Formular, dessen `action` eine Server Function ist
- Lies die vier Felder aus `FormData`, rufe `createSnippet` auf und rufe `revalidatePath("/snippets")` auf
- Verschiebe die Server Function in eine `app/actions.ts`-Datei, sobald sie inline funktioniert

### Eine Snippets-API-Route hinzufügen

- Erstelle `app/api/snippets/route.ts` mit einem `GET`, das jedes Snippet als JSON zurückgibt
- Erstelle `app/api/snippets/[id]/route.ts` mit einem `GET`, das ein Snippet anhand der `id` zurückgibt, oder einen 404, wenn es fehlt
- Füge `app/api/snippets/route.ts` ein `POST` hinzu, das ein Snippet aus dem Request-Body liest, es erstellt und mit Status 201 zurückgibt

### Die Library mit Postgres ausstatten

- Erstelle und befülle eine `snippets`-Tabelle:

```sql
CREATE TABLE snippets (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  language TEXT NOT NULL,
  description TEXT NOT NULL,
  code TEXT NOT NULL
);
```

- Füge eine `DATABASE_URL` zur `.env` hinzu und erstelle den `sql`-Client in `lib/db.ts`
- Schreibe die Funktionen des `snippetsService` so um, dass sie Postgres mit Tagged Templates abfragen
- Bestätige, dass die Liste, die Detail-Pages, der Filter, das Formular und die API-Routes alle gegen die Datenbank funktionieren und dass Snippets einen Neustart überleben

* Richte Tailwind genau wie in der Kiki's-Challenge ein: installiere die Packages, füge `postcss.config.mjs` hinzu und ersetze `globals.css` durch den Tailwind-Import
* Führe `npx shadcn@latest init` aus und füge anschließend `button card select input label` hinzu
* Rendere jedes Snippet in einer `Card`
* Ersetze den Link zum neuen Snippet durch einen `Button` mit `asChild` und einem `<Link>`
* Ersetze das native Language-`<select>` in der Filter-Client-Component durch shadcns `Select`
* Ersetze die Formularfelder durch `Input` und `Label`, behalte die `name`-Attribute unverändert bei
* Durchstöbere den Component-Katalog und schau, was du sonst noch hinzufügen kannst, um deine App zu stylen

Füge eine Favoriten-Seite hinzu, die die Lieblings-Snippets des Nutzers anzeigt.

* Erstelle einen globalen `favoritesStore`, der ein Array von Favoriten-Snippet-IDs sowie Update-Funktionen enthält.
* Erstelle einen Favoriten-Button, der den Store nutzt, um ein Snippet zu den Favoriten hinzuzufügen oder daraus zu entfernen. Verwende die Komponente sowohl auf der Snippet-Detailseite als auch in der Snippet-Liste.
* Erstelle eine `FavoritesList`-Seite, die den Store nutzt, um die Liste der Lieblings-Snippets zu lesen.
* Erstelle eine Server-Funktion, die eine Liste von Snippet-IDs entgegennimmt und die entsprechenden Snippets zurückgibt.
* Füge dem Snippets-Service eine `getSnippetsByIds`-Funktion hinzu, die die Datenbank nach einer Liste von Snippets anhand der ID abfragt. (Postgres hat ein Schlüsselwort namens `ANY`, das hier nützlich sein wird.)
* Verwende entweder ein `useEffect` oder eine Suspense-Boundary, um die asynchrone Server-Funktion in deiner `FavoritesList`-Seite aufzurufen.
* Persistiere die Favoritenliste in `localStorage`. Achte darauf, einen Hydration Mismatch zu vermeiden.

## Code Snippet Library – Interaktiver Code-Editor

Füge den Monaco Editor zur Snippet-Detailseite hinzu, um den Code-Snippet zu bearbeiten. Füge einen Button hinzu, um zwischen der Code-Block-Anzeige und dem Code-Editor zu wechseln.