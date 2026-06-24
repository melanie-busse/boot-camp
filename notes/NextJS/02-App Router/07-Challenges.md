# Next.js App Router – Herausforderungen

## Code Along

Diese Aufgaben bauen die Kiki's Delivery Service App Route für Route auf. Beginnen Sie mit einem neuen Next.js 16-Projekt, das mit dem App Router und TypeScript erstellt wurde, und verwenden Sie die unten stehenden Startdaten, damit jede Aufgabe mit denselben Lieferanfragen funktioniert.

## Projektgerüst

Erstelle ein neues Next-App-Projekt:

```bash
npx create-next-app kikis-delivery-service
```

Sie werden mehrmals aufgefordert, Ihre Präferenzen auszuwählen. Wählen Sie Folgendes:

- Typoskript
- Kein Rückenwind
- Kein `src`-Verzeichnis
- App Router verwenden
- Kein ESLint
- Turbopack verwenden
- Benutzerdefinierter Importalias: `@/*`

Entfernen Sie anschließend den unnötigen Standardtext sowohl aus `page.tsx` als auch aus `layout.tsx`.

## Starterdaten

Erstellen Sie einen simulierten Lieferdienst in der `lib/services/deliveriesService.ts`-Datei:

```ts
export type DeliveryStatus = "active" | "accepted" | "denied" | "fulfilled";

export type DeliveryRequest = {
  id: string;
  pickup: string;
  destination: string;
  status: DeliveryStatus;
};

const deliveries: DeliveryRequest[] = [
  { id: "1", pickup: "Bakery", destination: "Clock Tower", status: "active" },
  {
    id: "2",
    pickup: "Harbour",
    destination: "Hillside Cafe",
    status: "accepted",
  },
  { id: "3", pickup: "Bookshop", destination: "Lighthouse", status: "denied" },
  {
    id: "4",
    pickup: "Market Square",
    destination: "Train Station",
    status: "fulfilled",
  },
];

export function getAllDeliveries(): DeliveryRequest[] {
  return deliveries;
}

export function getDeliveryById(id: string): DeliveryRequest | null {
  return deliveries.find((d) => d.id === id) || null;
}
```

## Die Willkommensseite

Erstellen Sie die `/`-Route. Fügen Sie eine Datei `page.tsx` zu einem `pages`-Ordner hinzu, der die Liste importiert `deliveries` und die erste Anfrage rendert, wobei Abholort und Zielort angezeigt werden.

## Die Lieferliste

Erstellen Sie die `/deliveries`-Route. Fügen Sie einen Ordner `page.tsx` hinzu `deliveries`, der die Liste importiert `deliveries` und jede Anfrage mit Abholort, Ziel und Status anzeigt. Stellen Sie sicher, dass beim Aufruf `/deliveries` alle vier Anfragen angezeigt werden.

## Lieferdetails mit dynamischer Route

Fügen Sie eine dynamische Route hinzu, sodass jede Anfrage ihre eigene Seite unter `/deliveries/<id>` hat.

Erstellen Sie darin einen Ordner `[id]` unter `deliveries` mit eigenem `page.tsx`.

Lesen Sie den `id`-Brief sorgfältig durch `params` und denken Sie daran, dass `params` ein Versprechen ist, das abgewartet werden muss.

Suchen Sie die passende Anfrage in der `deliveries`-Liste und zeigen Sie deren Details an.

## Fügen Sie dem Stammlayout Inhalte hinzu

Fügen Sie dem Root-Layout eine Titelleiste mit dem Titel „Kikis Lieferservice“ hinzu.

Fügen Sie dem Root-Layout-Komponente ein `header`-Element mit einer verschachtelten `h1`-Überschrift hinzu, die „Kikis Lieferservice“ enthält.

## Lade- und Fehlerzustände

Fügen Sie die beiden speziellen Dateien zum `deliveries`-Segment hinzu.

Fügen Sie ein Element hinzu `loading.tsx`, das eine Ladeanzeige anzeigt, während die Seite vorbereitet wird.

Fügen Sie eine `error.tsx`-Schaltfläche hinzu, die bei einem Renderfehler eine Ausweichoption anzeigt und `reset` einen erneuten Versuch ermöglicht.

Um die Funktionsweise der Fehlergrenze zu sehen, lösen Sie einen Fehler auf der Detailseite aus (z. B. wenn keine Anfrage mit der ID übereinstimmt) und besuchen Sie eine Seite, `/deliveries/<id>`, die nicht existiert.

## Verlinken Sie die Lieferungen mit ihrer Detailseite

Fügen Sie für jede Anfrage in der Liste einen Link zur Detailseite hinzu.

Füge `<Link>` dem Listenelement ein `a` hinzu, das auf `/deliveries/<id>` verlinkt.

Fügen Sie einen `<Link>`-Link zur Detailseite hinzu, der zurück zu dieser Seite führt: `/deliveries`.

## Verwenden Sie eine benutzerdefinierte Schriftart

Fügen Sie der Root-Layout-Komponente mithilfe des `next/font`-Pakets eine benutzerdefinierte Schriftart hinzu.

Importieren Sie die `Cherry_Bomb_One`-Schriftart von `next/font/google`.

Fügen Sie dem Root-Layout-Komponente `font-family` ein Element hinzu, indem Sie die `variable`-Eigenschaft verwenden.

Verwenden Sie die Schriftart in der Root-Layout-Komponente, indem Sie die `fontFamily`-entsprechende Eigenschaft verwenden und sie dem `h1`-Element hinzufügen.

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