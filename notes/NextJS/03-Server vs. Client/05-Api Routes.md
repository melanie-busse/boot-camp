# Next.js Server vs. Client – API Routes

Server Functions decken den Fall ab, dass deine eigene UI den Server aufrufen muss. Aber nicht jeder Aufrufer ist deine UI. Eine mobile App benötigt möglicherweise die Lieferdaten, ein Zahlungsanbieter schickt einen Webhook, wenn eine Zahlung erfolgreich war, oder der Service eines anderen Teams möchte deine Lieferungen als JSON lesen. Nichts davon ist eine React-Komponente, die ein Formular rendert – eine Server Function passt also nicht. Was all diese Aufrufer verstehen, ist einfaches HTTP: eine Anfrage an eine URL mit einer Methode wie `GET` oder `POST` und eine Antwort mit einem Statuscode und einem Body. Ein API Route, den Next.js **Route Handler** nennt, ist der Weg, genau das bereitzustellen. Es ist ein Endpunkt unter einer URL, die du kontrollierst, geschrieben im selben Projekt wie der Rest der App.

## Die `route.ts`-Datei

Ein Route Handler liegt in einer Datei namens `route.ts`. Er funktioniert wie `page.tsx`, gibt aber statt UI eine HTTP-Antwort zurück. Der Ordner, in dem er liegt, bestimmt die URL – genauso wie Ordner die URLs von Seiten bestimmen. `app/api/deliveries/route.ts` beantwortet also Anfragen an `/api/deliveries`. Innerhalb der Datei exportierst du für jede HTTP-Methode, die du unterstützen möchtest, eine `async`-Funktion, benannt nach der Methode in Großbuchstaben.

```ts
import { getAllDeliveries } from "@/lib/services/deliveriesService";

export async function GET() {
  const deliveries = await getAllDeliveries();
  return Response.json(deliveries);
}
```

Folgende Punkte sind dabei wichtig:

- Die Funktion heißt `GET`, also wird sie ausgeführt, wenn jemand eine GET-Anfrage an `/api/deliveries` stellt.
- Sie gibt ein `Response`-Objekt zurück, kein JSX – hier erstellt mit `Response.json`, das den Wert zu JSON serialisiert und den `Content-Type`-Header automatisch setzt.
- Ein Ordner kann nicht gleichzeitig eine `page.tsx` und eine `route.ts` enthalten, da eine URL nicht gleichzeitig Seite und Endpunkt sein kann.

Per Konvention liegen diese Dateien in einem `api`-Ordner, aber das ist nur eine Namensgewohnheit. Jeder Ordner ohne `page.tsx` kann eine `route.ts` enthalten.

## Die Request lesen und dynamische Segmente

Jede Methoden-Funktion erhält die eingehende Anfrage als erstes Argument – ein Standard-`Request`-Objekt. Für ein `POST`, das eine Lieferung erstellt, liest du den JSON-Body mit `await request.json()` aus:

```ts
import { createDelivery } from "@/lib/services/deliveriesService";

export async function POST(request: Request) {
  const body = await request.json();
  const delivery = await createDelivery(body);

  return Response.json(delivery, { status: 201 });
}
```

Das zweite Argument an `Response.json` setzt den Statuscode. Der Statuscode `201` teilt dem Aufrufer mit, dass die Anfrage erfolgreich war und etwas erstellt wurde – das ist der konventionelle Code für ein `POST`, das einen Datensatz anlegt.

Dynamische Segmente funktionieren in Route Handlers genauso wie in Seiten. Ein `[id]`-Ordner matcht jeden Wert an dieser Position der URL, und der gematchte Wert kommt über eine `params`-Prop an. Wie bei Seiten in Next.js ist `params` ein Promise und muss daher mit `await` aufgelöst werden:

```ts
import { getDeliveryById } from "@/lib/services/deliveriesService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const delivery = await getDeliveryById(id);

  if (!delivery) {
    return Response.json({ error: "Delivery not found" }, { status: 404 });
  }

  return Response.json(delivery);
}
```

Eine Anfrage an `/api/deliveries/2` führt diesen Handler mit `id` gleich `"2"` aus. Wenn kein Datensatz gefunden wird, gibt der Handler den Statuscode `404` mit einer Fehlermeldung zurück, sodass der Aufrufer den Unterschied zwischen einer fehlenden Lieferung und einer erfolgreichen Antwort erkennen kann.

## Route Handler oder Server Functions?

Sowohl Server Functions als auch Route Handler führen Server-Code als Reaktion auf eine Client-Aktion aus. Es lohnt sich daher, klar zu unterscheiden, wann welches Mittel das richtige ist.

Eine **Server Function** ist die bessere Wahl, wenn deine eigene Next.js-UI der Aufrufer ist. Das Formular zum Erstellen einer Lieferung ist der klarste Fall: Du möchtest beim Absenden Server-Code ausführen, es interessiert dich weder die URL noch die HTTP-Methode, und du schreibst lieber einen Funktionsaufruf als einen `fetch`. Server Functions lassen sich außerdem in Next.js-Features wie `revalidatePath` einbinden, sodass die Seite nach der Änderung aktualisiert wird.

Ein **Route Handler** ist die bessere Wahl, wenn der Aufrufer nicht deine UI ist. Eine öffentliche API, ein Webhook eines Zahlungsanbieters, eine mobile App oder ein beliebiger Client, der HTTP spricht und eine URL, eine Methode und einen Statuscode erwartet. Du greifst zu einem Route Handler, wenn der Endpunkt selbst – der Vertrag, auf den andere Systeme sich verlassen – das ist, was du baust.

## Ressourcen

- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [`route.ts`-Dateikonventionen](https://nextjs.org/docs/app/api-reference/file-conventions/route)

---

> **Denkanstoß:** Wann würdest du für einen Endpunkt einen Route Handler einem Server Function vorziehen – und gibt es Fälle, in denen beide gleichzeitig sinnvoll sein könnten?