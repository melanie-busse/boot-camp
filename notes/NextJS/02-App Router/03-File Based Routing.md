# Next.js App Router – Dateibasiertes Routing

In den meisten React-Setups richtest du das Routing selbst ein: Du installierst einen Router, schreibst eine Liste von Pfaden und ordnest jedem Pfad eine Komponente zu. Next.js erspart dir diesen Schritt. Im App Router sind die Ordner innerhalb des `app`-Verzeichnisses die Routen, und die URL, die ein Nutzer aufruft, ist einfach der Pfad der Ordner, der zu einer Seite führt. Es gibt keine Routenliste, die du mit deinen Dateien synchron halten musst, denn die Dateien sind die Routenliste. Das wird als dateibasiertes Routing bezeichnet, und sich damit vertraut zu machen, ist der größte Teil dessen, was nötig ist, um sich in einem Next.js-Projekt zurechtzufinden.

## Ordner als Routensegmente

Jeder Ordner innerhalb von `app` fügt ein Stück zur URL hinzu. Ein Ordner mit dem Namen `deliveries` entspricht dem Teil `/deliveries` der Adresse. Verschachtelte Ordner verschachteln die URL auf die gleiche Weise: Ein `deliveries`-Ordner, der einen `new`-Ordner enthält, beschreibt den Pfad `/deliveries/new`. Der `app`-Ordner selbst ist die Wurzel der Website und steht somit für `/`.

Ein Ordner allein erzeugt noch keine besuchbare Seite. Er benennt lediglich ein Segment einer möglichen URL. Damit ein Segment zu etwas wird, das ein Nutzer tatsächlich öffnen kann, fügst du eine `page.tsx`-Datei hinzu.

## `page.tsx`

Eine `page.tsx`-Datei macht aus einem Ordner eine echte, erreichbare Seite. Die Datei muss einen Default-Export besitzen, und dieser Export ist eine React-Komponente. Next.js rendert sie, wenn ein Nutzer die passende URL aufruft.

Für die Startseite von Kikis Lieferservice übernimmt `app/page.tsx` die Route `/`:

```
export default function HomePage() {
  return (
    <div>
      <h1>Kiki's Delivery Service</h1>
      <p>Fast, reliable deliveries across the city.</p>
    </div>
  );
}

```

Hier gibt es ein paar Dinge zu beachten:

* Die Datei liegt direkt in `app`, daher beantwortet sie die `/`-URL
* Die Komponente ist eine einfache Funktion, die JSX zurückgibt, ohne irgendeine Router-Konfiguration

## Verschachtelte Ordner für verschachtelte URLs

Um eine Seite hinzuzufügen, die alle Lieferanfragen aufzählt, erstelle einen `deliveries`-Ordner mit eigener `page.tsx`. Seine Position im Ordnerbaum definiert seine URL:

```
app/
  page.tsx              ->  /
  deliveries/
    page.tsx            ->  /deliveries

```

Die Listenseite ist wiederum eine Komponente mit Default-Export. Da es sich um eine Server Component handelt, kann sie die Lieferdaten direkt beim Rendern lesen, ohne einen separaten Fetch vom Browser aus:

```
import { getAllDeliveries } from "@/lib/services/deliveriesService";

export default async function DeliveriesPage() {
  const deliveries = await getAllDeliveries(); // calls separate Backend API or makes a direct database query

  return (
    <div>
      <h1>All Deliveries</h1>
      <ul>
        {deliveries.map((delivery) => (
          <li key={delivery.id}>
            {delivery.pickup} to {delivery.destination} ({delivery.status})
          </li>
        ))}
      </ul>
    </div>
  );
}

```

Auf die `deliveries`-Daten wird direkt über den Deliveries-Service zugegriffen und sie werden gelesen, während die Komponente auf dem Server rendert. Der Browser erhält eine fertige Liste als HTML. Eine weitere interessante Eigenschaft von Server Components ist, dass sie async sein können, sodass Promises direkt in der Komponente awaited werden können.

## Ressourcen

[Defining routes](https://nextjs.org/docs/app/getting-started/project-structure)
[Pages and layouts](https://nextjs.org/docs/app/getting-started/layouts-and-pages)