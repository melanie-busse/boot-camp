# Next.js Server vs. Client – Client-Komponenten

Nicht alle Komponenten können auf dem Server laufen, wenn wir sie interaktiv gestalten wollen. Es gibt keine Möglichkeit, zu verfolgen, was der Benutzer tippt, auf einen Klick zu reagieren oder einen Effekt auszuführen – denn die React-Mechanismen, die das ermöglichen, wie `useState`, `useEffect` und Event-Handler wie `onClick`, existieren nur im Browser. Eine Client-Komponente ist der Weg, einen Teil des Komponentenbaums zurück in den Browser zu bringen, wo React den vollständigen Lebenszyklus ausführt und State sowie Events wie gewohnt funktionieren. Du greifst darauf zurück, wann immer ein UI-Element sich etwas merken oder auf den Benutzer reagieren muss.

## Die `"use client"`-Direktive

Du wandelst eine Komponente in eine Client-Komponente um, indem du `"use client"` als allererste Zeile der Datei schreibst – noch vor den Imports. Ab diesem Punkt läuft die Komponente im Browser und kann State, Effekte und Event-Handler verwenden.

Ein Statusfilter für die Lieferliste ist ein gutes Beispiel. Er hält den ausgewählten Status im State und aktualisiert die angezeigte Liste, wenn der Benutzer ein Dropdown ändert:

```tsx
"use client";

import { useState } from "react";
import type { DeliveryRequest } from "@/lib/services/deliveriesService";

export default function DeliveryFilter({
  deliveries,
}: {
  deliveries: DeliveryRequest[];
}) {
  const [status, setStatus] = useState("all");

  const visible =
    status === "all"
      ? deliveries
      : deliveries.filter((delivery) => delivery.status === status);

  return (
    <div>
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="accepted">Accepted</option>
        <option value="fulfilled">Fulfilled</option>
      </select>
      <ul>
        {visible.map((delivery) => (
          <li key={delivery.id}>
            {delivery.pickup} to {delivery.destination} ({delivery.status})
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Die Teile, die den Browser benötigen und deshalb `"use client"` voraussetzen:

- `useState` hält den aktuell ausgewählten Status zwischen den Renders.
- `onChange` ist ein Event-Handler, der ausgeführt wird, wenn der Benutzer eine Option auswählt.
- Die Liste wird bei jeder Änderung neu gerendert, weil State-Updates ein Re-Render auslösen.

Die Daten kommen weiterhin vom Server. `DeliveryFilter` erhält die vollständige Lieferliste als Prop von der Server-Komponente, die sie rendert, und filtert diese Liste dann im Browser, während der Benutzer klickt.

## Alles innerhalb einer Client-Komponente läuft im Browser

Es ist verlockend, `"use client"` als ein Label zu lesen, das man auf jede Komponente klebt, die den Browser benötigt. Es ist mehr als das. Die Direktive markiert den Punkt, an dem der Komponentenbaum vom Server auf den Client wechselt – und alles, was ab dort in eine Client-Komponente importiert wird, ist ebenfalls Client-Code. Wenn `DeliveryFilter` eine `<StatusBadge>`-Komponente importiert, läuft `StatusBadge` ebenfalls im Browser, obwohl sie keine eigene `"use client"`-Zeile hat. Sie befindet sich auf der Client-Seite der Grenze und ist damit eine Client-Komponente.

Das bedeutet: Du setzt die Direktive an den Anfang der Grenze, nicht auf jede Komponente darunter. Du markierst `DeliveryFilter` – die Komponente, die als erste State benötigt – und die kleineren Komponenten, die sie verwendet, kommen automatisch mit. Ein häufiger Fehler ist es, `"use client"` aus Vorsicht über ein ganzes Feature zu verteilen. Das Gegenteil ist das Ziel: Halte die Direktive so tief im Baum wie möglich, damit nur der interaktive Teil im Browser läuft und so viel wie möglich darüber auf dem Server bleibt.

Beachte dabei: Wenn Kind-Komponenten selbst einen Hook verwenden oder einem Element Interaktivität hinzufügen, müssen sie trotzdem explizit mit `"use client"` markiert werden.

## Props über die Grenze serialisieren

Props fließen aus der Server-Komponente in eine Client-Komponente hinein – so wie `deliveries` in `DeliveryFilter` fließt. Diese Props werden nicht als Objekte im Arbeitsspeicher übergeben. Wie im vorherigen Kapitel beschrieben, sendet der Server die Daten der Client-Komponente über das Netzwerk – und alles, was über das Netzwerk gesendet wird, muss zunächst in einen Textstrom umgewandelt und auf der anderen Seite wieder aufgebaut werden. Dieser Vorgang heißt Serialisierung und funktioniert nur für bestimmte Arten von Werten.

**Werte, die serialisiert werden können und deshalb als Props übergeben werden dürfen:**

- Strings, Numbers, Booleans, `null` und `undefined`
- Einfache Objekte und Arrays aus diesen Werten, wie das `deliveries`-Array
- `Date`-Objekte, `Map` und `Set`

**Werte, die nicht serialisiert werden können und deshalb nicht übergeben werden dürfen:**

- Normale Funktionen, einschließlich Callbacks, die du möglicherweise nach unten reichen möchtest
- Klassen-Instanzen, da ihre Methoden und ihr Prototype die Umwandlung nicht überstehen

Deshalb müssen wir sorgfältig abwägen, wo wir die `"use client"`-Grenze setzen und welche Props wir vom Server an den Client übergeben.

## Ressourcen

- [`"use client"`-Direktive](https://nextjs.org/docs/app/api-reference/directives/use-client)
- [Props von Server- an Client-Komponenten übergeben](https://nextjs.org/docs/app/getting-started/server-and-client-components#passing-props-from-server-to-client-components)

---

> **Denkanstoß:** Warum ist es sinnvoll, die `"use client"`-Grenze so tief wie möglich im Komponentenbaum zu halten? Was würde passieren, wenn du sie ganz oben in der Hierarchie setzt?