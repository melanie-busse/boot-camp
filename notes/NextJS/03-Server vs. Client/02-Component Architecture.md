# Next.js Server vs. Client – Komponentenarchitektur

## Die klassische Trennung

Die meisten Webanwendungen, die du bisher kennengelernt hast, bestehen aus zwei separaten Projekten: einem Frontend – oft mit React.js geschrieben – und einem Backend, häufig eine Express.js-Anwendung. Dazwischen liegt das Netzwerk. Wenn das Frontend Daten benötigt, sendet es einen `fetch`-Aufruf an eine URL, die das Backend bereitstellt. Das Backend liest seine Datenbank und schickt JSON zurück, das Frontend rendert die Daten. Beide Seiten und die Kommunikation dazwischen schreibst du von Hand – inklusive eines Endpunkts auf der einen Seite, eines `fetch`-Aufrufs auf der anderen und einer vereinbarten JSON-Struktur in der Mitte.

Next.js abstrahiert einen Großteil dieser Komplexität und bietet dabei gleichzeitig Typsicherheit von der Datenbank bis hin zu den Komponenten, die die Daten verwenden.

## Import über die Grenze hinweg

Mit dem App Router behandelt Next.js Frontend und Backend nicht mehr als separate Teile der Anwendung. Stattdessen liegt die Server/Client-Grenze innerhalb des Komponentenbaums selbst. Komponenten laufen standardmäßig auf dem Server und wechseln nur dann in den Browser, wenn sie mit `"use client"` markiert sind.

Hier liegt das Entscheidende, das Next.js verbirgt: Eine Server-Komponente rendert eine Client-Komponente, indem sie sie einfach importiert und wie jede andere Komponente verwendet. Es gibt keinen `fetch`-Aufruf und keinen Endpunkt zwischen ihnen.

```tsx
import { getAllDeliveries } from "@/lib/services/deliveriesService";
import DeliveryFilter from "./DeliveryFilter";

export default async function DeliveriesPage() {
  const deliveries = await getAllDeliveries();

  return (
    <main>
      <h1>All Deliveries</h1>
      <DeliveryFilter deliveries={deliveries} />
    </main>
  );
}
```

`DeliveriesPage` läuft auf dem Server. Sie liest die Lieferungen direkt aus – genauso wie Seiten in der letzten Session. `DeliveryFilter` ist eine Client-Komponente und läuft damit im Browser. Trotzdem bindet die Seite sie mit einem normalen `import` ein und übergibt Daten über eine normale Prop.

In einem klassischen Aufbau würde es einen Endpunkt erfordern, der die Liste zurückgibt, und einen `fetch`-Aufruf auf der anderen Seite, der sie anfordert, um `deliveries` vom Server an eine Browser-Komponente zu übergeben. Hier schreibst du beides nicht. Next.js rendert die Server-Komponente, stößt auf die Client-Komponente und hinterlässt im HTML eine markierte Stelle, an der der Browser übernimmt. Zusammen mit dem HTML schickt es die Daten, die die Client-Komponente benötigt – einschließlich der `deliveries`-Prop – in einem Format, das React auf der anderen Seite einlesen kann. Die Netzwerkübertragung findet weiterhin statt, aber Next.js generiert sie. Das ist der Sinn, in dem das Framework die Trennung verbirgt: Die Server/Client-Grenze sieht in deinem Code wie ein Import und eine Prop aus.

Das erklärt auch, warum an dieser Grenze eine Regel hängt. Da die `deliveries`-Prop über das Netzwerk übertragen wird und nicht einfach im Speicher übergeben werden kann, muss sie etwas sein, das diesen Weg übersteht. Wie das einschränkt, welche Props die Grenze passieren dürfen, behandelt das nächste Kapitel.

## Ressourcen

- [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [How Server and Client Components work together](https://nextjs.org/docs/app/getting-started/server-and-client-components#examples)

---

> **Denkanstoß:** Die Server/Client-Grenze sieht im Code wie ein normaler Import aus – aber im Hintergrund überquert eine Prop das Netzwerk. Welche Arten von Daten könnten dabei problematisch sein, und warum?