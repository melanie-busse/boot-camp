# Next.js App Router – File Conventions

`page.tsx` ist einer von mehreren Dateinamen, die der App Router besonders behandelt.

* `layout.tsx`
* `loading.tsx`
* `error.tsx`

Die anderen erlauben es dir, ein Routensegment mit zusätzlichem Verhalten zu umhüllen, ohne irgendeinen Verbindungscode zu schreiben. Zum Beispiel kannst du das Seitenlayout teilen, einen Platzhalter anzeigen, während die Seite lädt, oder einen Fallback zeigen, falls ein Fehler auftritt. Um eines dieser Features zu nutzen, fügst du einem Routensegment-Ordner eine Datei mit dem entsprechenden reservierten Namen hinzu. Next.js erkennt sie automatisch anhand des Namens und wendet ihr Verhalten auf dieses Routensegment und alle verschachtelten Segmente an.

## `layout.tsx`

Ein Layout definiert UI, die über mehrere Seiten hinweg geteilt wird. Im Gegensatz zu Pages bleiben Layouts zwischen Navigationen bestehen, sodass geteilte Elemente wie Navigationsleisten, Sidebars und Footer nicht jedes Mal neu gerendert werden, wenn der Nutzer zwischen Seiten wechselt. Eine `layout.tsx`-Datei erhält die Seite, die sie umhüllt, als `children`-Prop und rendert sie irgendwo innerhalb ihres eigenen Markups.

Jede Next.js-App benötigt ein Root-Layout unter `app/layout.tsx`. Es ist der äußerste Wrapper für die gesamte Website, und es ist der einzige Ort, an dem die `<html>`- und `<body>`-Tags geschrieben werden, da Next.js diese nicht automatisch für dich hinzufügt.

```
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header>
          <h1>Kiki's Delivery Service</h1>
        </header>
        {children}
      </body>
    </html>
  );
}
```

Die wichtigen Teile dieser Datei:

* `children` ist als `React.ReactNode` typisiert, der Typ für alles, was React rendern kann, da das Layout vorher nicht weiß, welche Seite darin platziert wird
* Die `<html>`- und `<body>`-Tags erscheinen hier und nur hier in der gesamten App
* `{children}` markiert die Stelle, an der die aktive Seite gerendert wird, sodass der darüber liegende Header über Navigationen hinweg bestehen bleibt

Mehrere Layouts können auf dieselbe Weise verschachtelt werden wie Ordner. Eine `layout.tsx` innerhalb von `app/deliveries/` umhüllt jede Seite unter `/deliveries`, und sie wird innerhalb des Root-Layouts gerendert, statt es zu ersetzen. Dadurch kann ein Bereich der Website seine eigene geteilte UI hinzufügen, wie z. B. eine Deliveries-Sidebar, zusätzlich zum websiteweiten Header.

Lass uns ein kleines Modell der internen Komponentenstruktur einer Route aufbauen, die Next für uns erstellt. Mit dem Layout an Ort und Stelle sieht das so aus:

```
import Layout from "./layout";
import Page from "./page";

function Route() {
  return (
    <Layout>
      <Page params={params} />
    </Layout>
  );
}
```

Wichtig zu beachten ist, dass wir das nicht selbst schreiben. Next.js findet die Layout- und Page-Komponenten eigenständig und wendet sie auf das Rendern der Seite an.

## `loading.tsx`

Wenn eine Server Component Daten abruft, während sie rendert, kann die Seite nicht erscheinen, bis diese Daten fertig sind. Ohne Platzhalter starrt der Nutzer auf den vorherigen Bildschirm, bis alles fertig ist. Eine `loading.tsx` füllt diese Lücke, indem sie Next.js etwas gibt, das es in der Zwischenzeit anzeigen kann. Welche Komponente sie auch exportiert, wird sofort angezeigt, während die Seite im selben Ordner noch vorbereitet wird.

```
export default function Loading() {
  return <p>Loading deliveries...</p>;
}
```

Der Mechanismus dahinter ist React Suspense. Suspense ist ein React-Feature, das es einer Komponente erlaubt, auf etwas zu „warten“, das sie benötigt, während React an ihrer Stelle einen Fallback anzeigt, bis sie fertig ist. Wenn du eine `loading.tsx` hinzufügst, umhüllt Next.js automatisch die passende Seite mit einer Suspense-Boundary und verwendet deine Loading-Komponente als diesen Fallback. Du schreibst das `<Suspense>`-Tag nicht selbst; das Vorhandensein der Datei richtet es ein.

Das hängt mit einem Verhalten namens Streaming zusammen. Statt die gesamte HTML-Antwort zurückzuhalten, bis der langsamste Datenabruf abgeschlossen ist, kann der Server das Layout und den Loading-Fallback sofort senden und dann den fertigen Seiteninhalt senden, sobald er bereit ist, und ihn austauschen. Der Nutzer sieht die Hülle der Seite und einen Lade-Indikator fast augenblicklich, statt eines leeren Bildschirms.

Lass uns unser Modell der internen Komponentenstruktur um die Loading-Suspense-Boundary erweitern:

```
import Layout from "./layout";
import Page from "./page";
import Loading from "./loading";

function Route() {
  return (
    <Layout>
      <Suspense fallback={<Loading />}>
        <Page params={params} />
      </Suspense>
    </Layout>
  );
}
```

## `error.tsx`

Wenn eine Seite beim Rendern einen Fehler wirft, muss etwas diesen abfangen, damit nicht die gesamte App kaputtgeht. Eine `error.tsx`-Datei definiert diesen Fallback für ihr Segment. Wenn die Seite oder eine Komponente darin einen Fehler wirft, rendert Next.js stattdessen die Error-Komponente und hält den Rest der Website, einschließlich des umgebenden Layouts, intakt.

```
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Could not load this delivery.</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

Was dir die Error-Datei gibt:

* `error` ist der geworfene Fehler, sodass du seine Nachricht anzeigen oder loggen kannst
* `reset` ist eine Funktion, die versucht, das Segment erneut zu rendern, nützlich, um sich von einem temporären Fehler zu erholen, ohne die ganze Seite neu zu laden
* Die erste Zeile ist die `"use client"`-Direktive, die hier erforderlich ist

Dieser letzte Punkt ist die eine Ausnahme zum reinen Server-Fokus dieser Session. Eine Error-Boundary muss im Browser laufen, um Fehler abzufangen und auf einen Klick des Nutzers auf einen Button zu reagieren, daher muss `error.tsx` eine Client Component sein. Behandle `"use client"` für diese Datei vorerst als erforderliche Zeile.

Lass uns die Error-Boundary auch zu unserem kleinen Modell hinzufügen:

```
import Layout from "./layout";
import Page from "./page";
import Loading from "./loading";
import Error from "./error";

function Route() {
  return (
    <Layout>
      <ErrorBoundary fallback={<Error />}>
        <Suspense fallback={<Loading />}>
          <Page params={params} />
        </Suspense>
      </ErrorBoundary>
    </Layout>
  );
}
```

## Ressourcen

[Layouts and pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages)

[Loading UI and streaming](https://nextjs.org/docs/app/api-reference/file-conventions/loading)

[Error handling](https://nextjs.org/docs/app/getting-started/error-handling)