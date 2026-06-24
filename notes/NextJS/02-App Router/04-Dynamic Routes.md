# Next.js App Router – Dynamic Routes

Die Liste der Lieferungen zeigt jede Anfrage an, aber jede Anfrage benötigt auch eine eigene Detailseite unter einer URL wie `/deliveries/42`. Du kannst nicht für jede Lieferung einen Ordner anlegen, da die Anfragen von Nutzern hinzugefügt werden und es Tausende davon geben könnte. Was die Ordnernamen gemeinsam haben, ist die Form `/deliveries/<irgendeine id>`, wobei die id der einzige Teil ist, der sich ändert. Eine dynamische Route erfasst genau das: ein Ordner, der jeden Wert in einem Segment der URL erfasst und dir diesen Wert zur Verfügung stellt.

## Der Ordner mit eckigen Klammern

Du markierst ein Segment als dynamisch, indem du den Ordnernamen in eckige Klammern setzt. Ein Ordner mit dem Namen `[id]` erfasst jeden beliebigen Wert an dieser Position des Pfads. Für die Lieferungs-Detailseite sieht die Struktur so aus:

```
app/
  deliveries/
    page.tsx          ->  /deliveries
    [myAmazingId]/
      page.tsx        ->  /deliveries/42, /deliveries/7, /deliveries/anything

```

Der Name innerhalb der Klammern, `id`, ist der, den du selbst wählst, und er wird zum Schlüssel, unter dem Next.js dir den erfassten Wert übergibt. Eine Anfrage für `/deliveries/42` rendert `app/deliveries/[id]/page.tsx` mit der id `"42"`.

## Params lesen

Next.js übergibt die erfassten URL-Werte an die Seite über eine `params`-Prop. Diese Prop ist ein Promise, daher wird die Page-Komponente als `async`-Funktion geschrieben, und du musst `params` mit `await` auflösen, bevor du sie liest. Das Awaiten liefert dir ein Objekt, dessen Schlüssel mit deinen Klammer-Ordnernamen übereinstimmen. `PageProps` ist ein Utility-Typ von Next.js, der die Form des `params`-Objekts aus der über das Generic übergebenen URL ableitet.

```
import { getDeliveryById } from "@/lib/services/deliveriesService";

export default async function DeliveryDetailPage({
  params,
}: PageProps<"/deliveries/[myAmazingId]">) {
  const { myAmazingId } = await params;
  const delivery = await getDeliveryById(myAmazingId);

  if (!delivery) {
    return (
      <div>
        <h1>Delivery {id} not found</h1>
      </div>
    );
  }

  return (
    <div>
      <h1>Delivery {id}</h1>
      <p>
        From {delivery.pickup} to {delivery.destination}
      </p>
      <p>Status: {delivery.status}</p>
    </div>
  );
}

```

Den `await` für `params` zu vergessen ist hier der häufigste Fehler. Wenn du `params.myAmazingId` direkt liest, ohne zu awaiten, liest du eine Eigenschaft eines Promise und nicht der aufgelösten Werte, und sie wird nicht die erwartete id enthalten.

## Seiten im Voraus generieren

Standardmäßig wird eine dynamische Route on demand gerendert: Die Seite für `/deliveries/42` wird gebaut, wenn jemand sie anfragt. Wenn du die vollständige Menge der ids bereits zur Build-Zeit kennst, kannst du sie über eine Funktion namens `generateStaticParams` auflisten, und Next.js wird diese Seiten im Voraus bauen, sodass sie sofort ausgeliefert werden können.

```
export async function generateStaticParams() {
  const deliveries = await getDeliveries();
  return deliveries.map((delivery) => ({ myAmazingId: delivery.id }));
}

```

Jedes Objekt im zurückgegebenen Array entspricht der Form der `params` der Route, mit einem Eintrag pro vorab zu bauender Seite. Das ist eine optionale Optimierung für Routen, deren Werte bereits im Voraus bekannt sind, wie z. B. eine feste Menge an Datensätzen.

## Ressourcen

[Dynamic routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes)
[generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)