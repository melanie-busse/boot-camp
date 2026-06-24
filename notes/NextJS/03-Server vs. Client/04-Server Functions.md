# Next.js Server vs. Client – Server Functions

Bisher haben sich Daten nur in eine Richtung bewegt: Der Server liest sie, der Client zeigt sie an. Eine Änderung zu speichern geht den umgekehrten Weg. Wenn ein Kunde eine neue Lieferanfrage einreicht, hat der Browser die Formularwerte – aber die Datenbank liegt auf dem Server, und eine Client-Komponente kann nicht auf sie zugreifen. Sie hat keine Datenbankverbindung und keinen Zugriff auf Secrets, und das ist auch gut so, denn alles im Browser ist für den Benutzer sichtbar.

In einer klassischen Anwendung würdest du einen Backend-Endpunkt schreiben, der die Formulardaten entgegennimmt, und einen `fetch`-Aufruf auf der Client-Seite, der dorthin sendet:

**Backend:**

```ts
// API Route
app.post("/api/user", (req, res) => {
  // Daten schreiben
});
```

**Frontend:**

```ts
async function handleSubmit(data) {
  await fetch("/api/user", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
```

Next.js bietet für dieses Szenario einen Mechanismus, der fast magisch wirkt: **Server Functions**. Statt API-Endpunkte zu erstellen und manuell Anfragen dorthin zu senden, definierst du eine Server Function, die die serverseitige Logik enthält. Wenn du sie aus deinem Client-Code heraus aufrufst, als wäre sie eine lokale Funktion, erstellt Next.js automatisch die Netzwerkanfrage und den Endpunkt im Hintergrund.

## Die `"use server"`-Direktive

Eine Server Function wird mit der `"use server"`-Direktive markiert. Sie ist das Spiegelbild von `"use client"`: Während diese Direktive eine Komponente in den Browser zieht, pinnt jene eine Funktion an den Server. Wenn Client-Code eine Server Function aufruft, führt Next.js die Funktion nicht im Browser aus. Es sendet die Argumente an den Server, führt die Funktion dort aus und schickt das Ergebnis zurück. Du siehst einen normalen Funktionsaufruf; der Netzwerk-Roundtrip wird darunter generiert.

Da die Funktion tatsächlich auf dem Server läuft, kann sie das tun, was ein Server tun kann: die Datenbank lesen und schreiben, Secret Keys verwenden und auf das Dateisystem zugreifen. Nichts davon wird jemals an den Browser gesendet.

## Inline-Server-Functions und Form Actions

Du kannst eine Server Function direkt innerhalb einer Server-Komponente definieren, indem du `"use server"` als erste Zeile des Funktionsrumpfs schreibst. Das passt gut zu einem Formular, denn ein `<form>` akzeptiert eine Server Function als `action` – beim Absenden ruft Next.js diese Funktion mit den Formulardaten als `FormData`-Objekt auf.

```tsx
import { createDelivery } from "@/lib/services/deliveriesService";
import { revalidatePath } from "next/cache";

export default function NewDeliveryPage() {
  async function addDelivery(formData: FormData) {
    "use server";

    const pickup = formData.get("pickup") as string;
    const destination = formData.get("destination") as string;

    await createDelivery({ pickup, destination });
    revalidatePath("/deliveries");
  }

  return (
    <form action={addDelivery}>
      <input name="pickup" placeholder="Pickup" />
      <input name="destination" placeholder="Destination" />
      <button type="submit">Create request</button>
    </form>
  );
}
```

Was die einzelnen Teile bewirken:

- `addDelivery` ist mit `"use server"` markiert und läuft deshalb auf dem Server, obwohl das Formular, das sie auslöst, im Browser gerendert wird.
- `createDelivery` schreibt die neue Anfrage in die Datenbank – das ist nur möglich, weil dieser Code auf dem Server läuft.
- Dieses Formular benötigt keinen `onSubmit`-Handler und kein `useState`. Die Seite kann eine Server-Komponente bleiben, denn das einzige browserseitige Verhalten – das Absenden des Formulars – wird über `action` gehandhabt, ein Browser-Feature, das kein JavaScript benötigt.

## Daten aktualisieren mit `revalidatePath`

Nachdem eine Server Function Daten verändert hat, sind die Seiten, die diese Daten anzeigen, veraltet. Next.js cached gerenderte Seiten, sodass die Lieferliste weiterhin den alten Stand anzeigen würde, bis etwas sie zum Neuaufbau veranlasst. `revalidatePath` ist dieses Signal. Der Aufruf `revalidatePath("/deliveries")` markiert die gecachte `/deliveries`-Seite als veraltet, sodass Next.js sie beim nächsten Aufruf mit den neuen Daten neu rendert.

Du rufst es innerhalb der Server Function auf, nachdem der Schreibvorgang erfolgreich war, und gibst dabei die Route an, deren Daten sich gerade geändert haben. Ohne diesen Aufruf könnte ein Kunde eine neue Anfrage einreichen und dann eine Liste sehen, die sie nicht enthält – einfach weil er eine gecachte Kopie aus der Zeit vor der Änderung betrachtet.

## Dateibasierte Server Functions

Wenn eine Client-Komponente eine Server Function aufrufen muss, funktioniert eine Inline-Funktion nicht, da eine Client-Komponente keinen Server-Code enthalten kann. Stattdessen legst du die Funktion in eine eigene Datei, die mit `"use server"` beginnt. Jede aus dieser Datei exportierte Funktion wird zu einer Server Function, die eine Client-Komponente importieren und aufrufen kann.

```ts
"use server";

import { createDelivery } from "@/lib/services/deliveriesService";
import { revalidatePath } from "next/cache";

export async function addDelivery(formData: FormData) {
  const pickup = formData.get("pickup") as string;
  const destination = formData.get("destination") as string;

  await createDelivery({ pickup, destination });
  revalidatePath("/deliveries");
}
```

Mit der Direktive am Anfang der Datei musst du sie nicht in jeder einzelnen Funktion wiederholen. Eine Client-Komponente importiert `addDelivery` wie jede andere Funktion:

```tsx
"use client";

import { addDelivery } from "@/app/actions";

export default function NewDeliveryForm() {
  return (
    <form action={addDelivery}>
      <input name="pickup" placeholder="Pickup" />
      <input name="destination" placeholder="Destination" />
      <button type="submit">Create request</button>
    </form>
  );
}
```

Das ist die Ausnahme von der Prop-Serialisierungsregel aus dem vorherigen Kapitel. Eine normale Funktion kann die Grenze nicht passieren – eine Server Function schon, weil Next.js eine Referenz auf die serverseitige Funktion überträgt, nicht die Funktion selbst. Wenn der Client sie aufruft, wandert der Aufruf zum Server.

## Parameter und Rückgabewerte bei Server Functions

Eine Server Function kann beliebige Argumente entgegennehmen und beliebige Werte zurückgeben – genau wie eine reguläre Funktion –, solange die Werte serialisierbar sind.

```ts
"use server";

import { createDelivery } from "@/lib/services/deliveriesService";

type CreateInput = { pickup: string; destination: string; priority?: number };
type CreateResult = { ok: true; id: string } | { ok: false; error: string };

export async function addDelivery(input: CreateInput): Promise<CreateResult> {
  try {
    const delivery = await createDelivery(input);
    return { ok: true, id: delivery.id };
  } catch (error) {
    return { ok: false, error: "Could not create delivery" };
  }
}
```

Diese Funktion kann nun auf dem Client aufgerufen werden, als wäre sie eine normale Funktion:

```tsx
"use client";
import { addDelivery } from "@/lib/actions/deliveries";

export function CreateButton() {
  async function onClick() {
    const result = await addDelivery({ pickup: "A", destination: "B" });
    if (result.ok) console.log(result.id);
  }
  return <button onClick={onClick}>Create</button>;
}
```

Serialisierte Props in Kombination mit Server Functions ermöglichen es dir, Server- und Client-Code zu vermischen und dich auf das Wesentliche zu konzentrieren: Wie du deinen Code als Komponenten strukturierst.

## Ressourcen

- [`"use server"`-Direktive](https://nextjs.org/docs/app/api-reference/directives/use-server)
- [Server Functions](https://nextjs.org/docs/app/getting-started/updating-data)
- [`revalidatePath`](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)

---

> **Denkanstoß:** Eine Server Function sieht im Client-Code aus wie ein normaler Funktionsaufruf – aber im Hintergrund findet ein Netzwerk-Roundtrip statt. Welche Auswirkungen hat das auf Fehlerbehandlung und Ladezeiten, und wie würdest du damit umgehen?