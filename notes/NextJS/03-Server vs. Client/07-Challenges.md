# Next.js Server vs. Client – Challenges

## Code Along

Diese Challenges setzen die Kiki's Delivery Service App aus der vorherigen Session fort. Starte dort, wo diese Session aufgehört hat: ein Next.js-16-Projekt mit dem App Router und TypeScript, dem `deliveriesService` sowie den Routes `/`, `/deliveries` und `/deliveries/[id]`. Jede Challenge fügt diesem App ein weiteres Puzzleteil des Server/Client-Bilds hinzu.

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

## Code Snippet Library

Dies setzt die Code Snippet Library aus der vorherigen Session fort: ein Next.js-Projekt mit dem `snippetsService`, einer `/snippets`-Liste und einer `/snippets/[id]`-Detail-Page. Füge Interaktivität, eine Möglichkeit zum Erstellen von Snippets, einen Endpoint und eine Datenbank hinzu, analog zu den Kiki's-Challenges.

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
