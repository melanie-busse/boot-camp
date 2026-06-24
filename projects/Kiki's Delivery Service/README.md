## Kiki's Delivery Service

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

### Die Deliveries mit einer Client Component filtern

Die Deliveries-Liste ist eine Server Component, kann sich also nicht selbst auf einen Klick hin filtern. Füge eine Client Component hinzu, die das kann.

- Erstelle eine `DeliveryFilter`-Component mit `"use client"` am Anfang der Datei
- Gib ihr eine `deliveries`-Prop vom Typ `DeliveryRequest[]` sowie einen State für den ausgewählten Status
- Render ein `<select>` mit einer Option pro Status plus einer „All"-Option, und zeige nur die Deliveries an, die zum ausgewählten Status passen
- Lies in der `/deliveries`-Page die Deliveries wie bisher auf dem Server, und übergib sie dann als Prop an `<DeliveryFilter>`
- Bestätige, dass das Ändern des Dropdowns die Liste filtert, ohne dass die Seite neu geladen wird

### Ein „New Delivery"-Formular mit einer Server Function hinzufügen

Kunden brauchen einen Weg, eine Anfrage zu erstellen. Füge ein Formular hinzu, dessen Submit-Handler auf dem Server läuft.

- Füge dem `deliveriesService` eine `createDelivery`-Funktion hinzu, die ein `pickup` und eine `destination` entgegennimmt, der neuen Anfrage eine generierte `id` und den Status `"active"` gibt, sie ins Array pusht und sie zurückgibt
- Erstelle eine `/deliveries/new`-Route mit einer `page.tsx`
- Definiere in dieser Page eine inline Server Function (`"use server"` als erste Zeile im Funktionskörper), die `pickup` und `destination` aus ihren `FormData` liest, `createDelivery` aufruft und anschließend `revalidatePath("/deliveries")` aufruft
- Render ein `<form>`, dessen `action` diese Server Function ist, mit Text-Inputs namens `pickup` und `destination` sowie einem Submit-Button
- Sende das Formular ab, besuche dann `/deliveries` und bestätige, dass die neue Anfrage erscheint

### Die Server Function in eine eigene Datei verschieben

Refaktoriere das Formular so, dass sein Submit-Handler in einer gemeinsam genutzten Datei liegt – so, wie du es tun würdest, wenn eine Client Component ihn aufrufen müsste.

- Erstelle `app/actions.ts` mit `"use server"` am Anfang, und verschiebe die `addDelivery`-Funktion dorthin als named export
- Importiere `addDelivery` in die Page und übergib sie an die `action` des Formulars
- Bestätige, dass das Formular weiterhin genau wie vorher funktioniert

### Die Deliveries als API-Route bereitstellen

Füge einen HTTP-Endpoint hinzu, damit ein Client außerhalb deiner UI die Deliveries lesen könnte.

- Erstelle `app/api/deliveries/route.ts` mit einer exportierten `GET`-Funktion, die alle Deliveries liest und sie mit `Response.json` zurückgibt
- Erstelle `app/api/deliveries/[id]/route.ts` mit einer `GET`-Funktion, die `params` awaitet, die Delivery anhand der `id` nachschlägt, sie als JSON zurückgibt und einen 404 zurückgibt, wenn keine Delivery passt
- Besuche `/api/deliveries` und `/api/deliveries/1` im Browser und bestätige, dass du JSON zurückbekommst, besuche dann `/api/deliveries/999` und bestätige, dass du einen 404 bekommst

### Die App mit Postgres ausstatten

Ersetze das In-Memory-Array durch eine echte Datenbank, damit Anfragen einen Neustart überleben.

- Richte eine PostgreSQL-Datenbank ein. Eine lokal dockerisierte oder eine kostenlos gehostete – beide funktionieren, solange du einen Connection String erhältst
- Erstelle die Tabelle und befülle sie mit den Startdaten:

```sql
CREATE TABLE deliveries (
  id SERIAL PRIMARY KEY,
  pickup TEXT NOT NULL,
  destination TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
);

INSERT INTO deliveries (pickup, destination, status) VALUES
  ('Bakery', 'Clock Tower', 'active'),
  ('Harbour', 'Hillside Cafe', 'accepted'),
  ('Bookshop', 'Lighthouse', 'denied'),
  ('Market Square', 'Train Station', 'fulfilled');
```

- Installiere das `postgres`-Package und füge deinen Connection String als `DATABASE_URL` zur `.env` hinzu
- Erstelle `lib/db.ts`, das den `sql`-Client aus `process.env.DATABASE_URL` baut und ihn exportiert
- Schreibe `getAllDeliveries`, `getDeliveryById` und `createDelivery` im `deliveriesService` so um, dass sie Postgres mit Tagged Templates abfragen statt das Array
- Bestätige, dass die Liste, die Detail-Pages, der Filter und das Formular weiterhin funktionieren, starte dann den Dev-Server neu und bestätige, dass eine von dir erstellte Delivery noch vorhanden ist

### Tailwind zum Projekt hinzufügen

Die App hat noch kein Styling-Tool eingerichtet. Füge Tailwind hinzu, damit Utility-Klassen überall funktionieren.

* Installiere `tailwindcss`, `@tailwindcss/postcss` und `postcss`
* Erstelle `postcss.config.mjs` im Root und registriere das `@tailwindcss/postcss`-Plugin
* Ersetze den Inhalt von `app/globals.css` durch eine einzelne Zeile `@import "tailwindcss";`
* Füge einer Heading `className="text-3xl text-red-500"` hinzu und bestätige im Browser, dass sich die Darstellung ändert

### shadcn/ui einrichten

Bring shadcn ins Projekt, damit du dessen Components nutzen kannst.

* Führe `npx shadcn@latest init` vom Projekt-Root aus und beantworte die Prompts
* Schau dir an, was sich geändert hat: die neue `components.json`, die CSS-Variablen, die zu `globals.css` hinzugefügt wurden, und `lib/utils.ts` mit dem `cn`-Helper
* Bestätige, dass die App weiterhin läuft und gleich aussieht, da bisher noch nichts zu einer Page hinzugefügt wurde

### Bare Elements durch shadcn-Components ersetzen

Tausche die einfachen HTML-Elemente gegen shadcn-Components aus und style die App damit richtig.

* Füge die benötigten Components hinzu: `npx shadcn@latest add button card select input label`
* Rendere jede Delivery innerhalb einer `Card`, mit `CardHeader`, `CardTitle` und `CardContent`
* Ersetze den Link zu `/deliveries/new` durch einen `Button` mit `asChild` um einen Next.js-`<Link>`
* Ersetze in der `DeliveryFilter`-Client-Component das native `<select>` durch shadcns `Select`, wobei du `value` und `onValueChange` mit dem bestehenden State verdrahtest
* Ersetze im New-Delivery-Formular die Inputs durch `Input` und `Label`, behalte dabei die `name`-Attribute bei, die die Server Function ausliest
* Bestätige, dass der Filter weiterhin filtert und das Formular weiterhin eine Delivery erstellt

### Eine eigene Button-Variant hinzufügen

Nutze die Tatsache, dass du den Component-Code selbst besitzt, um eine `brand`-Variant hinzuzufügen.

* Öffne `components/ui/button.tsx` und finde die Liste der Variants
* Füge eine `brand`-Variant hinzu, die deine Tokens `bg-brand` und `hover:bg-brand-muted` nutzt
* Verwende `<Button variant="brand">` irgendwo in der App und bestätige, dass sie mit deiner Farbe gerendert wird

### Dark Mode hinzufügen

Schließe ab, indem du der App ermöglichst, zwischen Light und Dark zu wechseln. shadcn hat die Dark-Farbwerte bereits während des `init` geschrieben, hier geht es also darum, einen Weg hinzuzufügen, sie einzuschalten.

* Installiere `next-themes` und umschließe die App in `app/layout.tsx` mit dessen `ThemeProvider`
* Füge irgendwo im Layout einen Button hinzu, der mit dem `useTheme`-Hook zwischen Light und Dark umschaltet
* Bestätige, dass jede shadcn-Component, die Cards und deine Brand-Elemente beim Umschalten alle mitwechseln – ohne zusätzlichen Styling-Aufwand

Füge `react-hook-form` zum Projekt hinzu und nutze es, um ein Formular zum Erstellen neuer Snippets zu bauen.

* Verwende die `register`-Funktion auf deinen Inputs.
* Verwende die `handleSubmit`-Funktion auf deinem Formular.
* Verwende das `formState`-Objekt, um Validierungsfehler anzuzeigen.
* Füge deinen Inputs Validierungsregeln hinzu.