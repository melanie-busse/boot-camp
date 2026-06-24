# React Refresher - State and Hooks

Während Props unveränderlich sind, müssen UIs häufig Daten verfolgen, die sich über die Zeit verändern, etwa Eingabewerte, aktive Auswahlen oder Task-Status.

Normale JavaScript-Variablen versagen hier aus zwei Gründen:

* Sie werden bei jedem erneuten Ausführen der Komponente auf ihren Ausgangswert zurückgesetzt.
* Ihre Veränderung löst kein UI-Update aus.

React löst dieses Problem mit State. State bleibt über Renders hinweg erhalten, und eine Aktualisierung signalisiert React, die Komponente mit den neuen Daten neu zu rendern.

Du fügst einer Komponente State über `useState` hinzu, einen sogenannten Hook. Hooks sind spezielle Funktionen, mit denen deine Komponenten auf zentrale React-Features zugreifen können. Als Nächstes schauen wir uns die Implementierung von `useState` genauer an.

## React Hooks

Hooks sind Funktionen mit dem Präfix `use` (wie zum Beispiel `useState`), die funktionalen Komponenten den Zugriff auf React-Features ermöglichen. Hooks müssen zwei strikten Regeln folgen:

* Rufe Hooks nur auf der obersten Ebene auf: Platziere Hooks niemals innerhalb von Loops, Bedingungen oder verschachtelten Funktionen. React verlässt sich darauf, dass die Aufrufreihenfolge bei jedem Render identisch bleibt, um den State korrekt zu verfolgen.
* Rufe Hooks nur aus React-Funktionen auf: Verwende Hooks ausschließlich innerhalb von React-Komponenten oder Custom Hooks, niemals innerhalb regulärer JavaScript-Funktionen.

## `useState`

Der `useState`-Hook fügt einer Komponente ein einzelnes Stück State hinzu. Er akzeptiert einen Initialwert und gibt ein Array mit zwei Elementen zurück: den aktuellen State-Wert und eine Updater-Funktion. Mit Array-Destructuring erfasst du beide.

```
import { useState } from "react";

function DeliveryCard({ item }) {
  const [delivered, setDelivered] = useState(false);

  return (
    <article>
      <h3>{item}</h3>
      <p>{delivered ? "Delivered" : "On the way"}</p>
      <button onClick={() => setDelivered(true)}>Mark as delivered</button>
    </article>
  );
}
```

So funktioniert das:

* `useState(false)` setzt den initialen State-Wert auf `false`.
* `delivered` enthält den aktuellen State-Wert für den aktuellen Render.
* `setDelivered` ist die Updater-Funktion, mit der du den State änderst.
* `onClick={() => setDelivered(true)}` löst die Updater-Funktion aus, wenn der Button geklickt wird.
* Der ternäre Operator rendert dynamisch den Statustext basierend auf dem Wert von `delivered`.

Die Komponente erhält weiterhin `item` als externe Prop, verwaltet aber jetzt zusätzlich ihren eigenen internen `delivered`-State als Reaktion auf Nutzerinteraktionen.

## State aktualisieren

Den Re-Render löst der Aufruf der Setter-Funktion aus, nicht die direkte Neuzuweisung der Variable (`delivered = true`). Der Setter informiert React über die Änderung und veranlasst React dazu, die Komponentenfunktion erneut auszuführen. Bei dieser nächsten Ausführung gibt `useState` den aktualisierten Wert zurück, und die UI aktualisiert sich. Eine direkte Neuzuweisung lässt die Anzeige eingefroren, weil React von der Änderung nichts weiß.

Wenn dein neuer State vom vorherigen State abhängt, übergib dem Updater eine Funktion statt eines rohen Werts. React ruft diese Funktion mit dem aktuellsten State auf.

```
const [count, setCount] = useState(0);
// ...
<button onClick={() => setCount((current) => current + 1)}>
  {count} packages
</button>;
```

Mit `setCount((current) => current + 1)` stellst du sicher, dass du immer den absolut aktuellsten State-Wert liest, was der sicherste Weg ist, um inkrementelle Updates zu handhaben.

## State ist privat für die jeweilige Komponente

State gehört strikt der jeweiligen Komponenteninstanz, die ihn erzeugt.

Wenn `App` zwei `<DeliveryCard />`-Komponenten rendert, verfolgt jede ihren eigenen, unabhängigen `delivered`-Wert. Markierst du die erste Card als `delivered`, hat das keine Auswirkung auf die zweite.

Diese Isolation ermöglicht es dir, Komponenten gefahrlos über eine Seite hinweg wiederzuverwenden, ohne dass sich ihre Daten gegenseitig beeinflussen.

## Denkanstoß

Stell dir vor, `DeliveryCard` soll zusätzlich zählen, wie oft der Status zwischen „Delivered" und „On the way" gewechselt wurde. Warum würde eine normale JavaScript-Variable für diesen Zähler nicht funktionieren, und welchen Updater-Ansatz würdest du wählen, damit der Zähler auch bei schnell aufeinanderfolgenden Klicks korrekt bleibt?

## Resources
[State: a component’s memory](https://react.dev/learn/state-a-components-memory)
[Responding to events](https://react.dev/learn/responding-to-events)