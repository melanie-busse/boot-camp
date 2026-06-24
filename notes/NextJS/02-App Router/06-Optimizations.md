# Next.js App Router – Optimizations

Ein großer Vorteil von Next.js sind die eingebauten Optimierungen. Das Framework liefert für gängige Aufgaben Optimierungen direkt von Haus aus mit. Wir wollen uns drei davon ansehen: Routing, Bilder und Schriftarten. Next.js stellt für jede davon Komponenten und APIs bereit: `next/link` für die Navigation, `next/image` für Bilder und `next/font` für Schriftarten.

## Navigation mit next/link

Ein normales `<a>`-Tag löst einen vollständigen Seitenneuladen aus. Der Browser verwirft die aktuelle Seite, fordert die nächste komplett neu an und baut alles neu auf, einschließlich der Teile, die sich nicht geändert haben, wie z. B. den Header in deinem Layout. Next.js stellt eine `Link`-Komponente bereit, die stattdessen clientseitig navigiert: Sie tauscht die neue Seite ein, ohne den Rest zu verwerfen, und prefetcht außerdem die Seite, auf die sie verweist, sodass sich die Navigation sofort anfühlt und das Layout erhalten bleibt.

```
import Link from "next/link";

export default function DeliveriesPage() {
  return (
    <ul>
      {deliveries.map((delivery) => (
        <li key={delivery.id}>
          <Link href={`/deliveries/${delivery.id}`}>
            {delivery.pickup} to {delivery.destination}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

Was `Link` unter der Haube macht:

* `href` funktioniert wie das `href` auf einem `<a>`, es zeigt auf eine deiner Routen, hier die dynamische Seite `/deliveries/[id]`
* Die Navigation erfolgt ohne vollständigen Reload, sodass das geteilte Layout nicht neu gerendert wird
* Links werden vorab geladen (prefetched): Wenn ein `Link` auf dem Bildschirm sichtbar ist, lädt Next.js die Ziel-Route still im Hintergrund, sodass die Seite oft schon bereit ist, bevor der Nutzer klickt

## Bilder mit next/image

Das `<img>`-Tag hat zwei Probleme. Es lädt jedes Bild in voller Dateigröße, selbst wenn es klein angezeigt wird, und der Browser kennt die Abmessungen des Bildes erst, wenn es ankommt, sodass die Seite springt, während jedes Bild lädt. Dieser Sprung wird als Layout Shift bezeichnet und ist eines der nervigsten Dinge, die eine Seite tun kann. Die `Image`-Komponente aus `next/image` liefert eine korrekt dimensionierte Version des Bildes in einem modernen Format und reserviert deren Platz im Voraus, sodass sich nichts verschiebt.

```
import Image from "next/image";

export default function DeliveryPhoto() {
  return (
    <Image
      src="/kiki.png"
      alt="A courier on a delivery"
      width={320}
      height={240}
    />
  );
}
```

Ein kurzer Überblick über die benötigten Properties:

* `src` und `alt` sind dasselbe wie bei einem normalen `<img>`, die Quelle und der Accessibility-Text
* `width` und `height` teilen Next.js das Seitenverhältnis des Bildes mit, damit der richtige Platz reserviert werden kann, bevor das Bild lädt, was Layout Shifts verhindert
* Next.js liefert automatisch eine verkleinerte, optimierte Version statt der Originaldatei aus und wartet mit dem Laden von Bildern außerhalb des Bildschirms, bis sie benötigt werden

Wenn du die Abmessungen eines Bildes im Voraus nicht kennst, etwa bei einem Foto mit variabler Größe, kannst du statt `width` und `height` die Property `fill` verwenden, damit das Bild seinen übergeordneten Container vollständig ausfüllt.

## Schriftarten mit next/font

Eine eigene Schriftart von einem Drittanbieter zu laden bedeutet normalerweise, dass der Browser sie anfordert, nachdem die Seite bereits mit dem Rendern begonnen hat. Bis sie ankommt, wird der Text in einer Ersatzschrift angezeigt und springt dann, wenn die echte Schrift eingetauscht wird, und die Anfrage selbst fügt einen Roundtrip zu einem weiteren Server hinzu. Das `next/font`-Tool beseitigt beide Probleme, indem es die Schriftart zur Build-Zeit herunterlädt, sie von deiner eigenen Website aus hostet und so einrichtet, dass sich der Text beim Laden nicht verschiebt.

```
import { Cherry_Bomb_One } from "next/font/google";

const cherryBomb = Cherry_Bomb_One({
  weight: "400",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cherryBomb.className}>
      <body>{children}</body>
    </html>
  );
}
```

Weitere Details zu diesem Codeblock:

* Inter wird aus `next/font/google` importiert, was dir Google Fonts ohne eine Laufzeit-Anfrage an Google ermöglicht
* Der Aufruf von `Cherry_Bomb_One({ weight: "400", subsets: ["latin"] })` wählt die einzubindenden Zeichensätze und Schriftstärken aus und hält die Schriftdatei klein, indem nicht verwendete Alphabete weggelassen werden
* Die `className` des zurückgegebenen Objekts wird auf ein Element angewendet, hier das Root-`<html>`, sodass jedes Element darin die Schriftart verwendet
* Alternativ kannst du `cherryBomb.variable` verwenden, um die Schriftart manuell per CSS auf Elemente anzuwenden, mit `font-family: var(--font-cherry-bomb-one);`
* Die Schriftart wird beim Build der App herunterladen und selbst gehostet, daher gibt es keine zusätzliche Netzwerkanfrage und keinen Schrift-Wechsel beim Laden der Seite

## Weitere Optimierungen

Next.js hört hier nicht auf. Es enthält eine Reihe von Optimierungen, um deine App schnell und performant zu machen. Weitere Details findest du in der Next.js-Dokumentation.

## Ressourcen

[next/link](https://nextjs.org/docs/app/api-reference/components/link)

[next/image](https://nextjs.org/docs/app/api-reference/components/image)

[next/font](https://nextjs.org/docs/app/api-reference/components/font)