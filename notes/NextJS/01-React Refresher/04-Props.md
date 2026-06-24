# React Refresher - Props

Die aktuelle `DeliveryCard` zeigt immer denselben hartcodierten Text an. Damit sie für jede beliebige Lieferung wiederverwendbar wird, muss sie dynamische Daten über Props entgegennehmen.

Props (kurz für Properties) sind Werte, die von einer Parent-Komponente an eine Child-Komponente übergeben werden, ähnlich wie Funktionsargumente oder HTML-Attribute. Sie sind der zentrale Mechanismus, um Daten in React zu bewegen, und fließen dabei immer in eine Richtung: von Parent zu Child.

Als Nächstes schauen wir uns an, wie du Props übergibst, wie du die gängige Destructuring-Kurzschreibweise nutzt, und warum Props für die empfangende Komponente unveränderlich (immutable) bleiben müssen.

## Props übergeben und auslesen

Du übergibst Props, indem du dem JSX-Tag der Komponente Attribute hinzufügst. Die Child-Komponente erhält diese Attribute gebündelt in einem einzigen Objekt, das üblicherweise `props` genannt wird.

```
function DeliveryCard(props) {
  return (
    <article>
      <h3>{props.item}</h3>
      <p>
        {props.from} to {props.to}
      </p>
    </article>
  );
}

function App() {
  return <DeliveryCard item="Bread" from="Bakery" to="Clock tower" />;
}
```

Hier übergibt `App` `item`, `from` und `to` an `<DeliveryCard>`. React sammelt diese im `props`-Objekt und ermöglicht der Child-Komponente den Zugriff über `props.item`, `props.from` und `props.to`. Wenn du dieselbe Komponente mit unterschiedlichen Attributwerten wiederverwendest, aktualisiert sich die Ausgabe dynamisch.

## Props destrukturieren

Wiederholtes `props.` kann deinen Code unübersichtlich machen. Da `props` ein ganz normales JavaScript-Objekt ist, kannst du es direkt in der Parameterliste der Funktion destrukturieren, um die Variablen sauberer zu nutzen.

```
function DeliveryCard({ item, from, to }) {
  return (
    <article>
      <h3>{item}</h3>
      <p>
        {from} to {to}
      </p>
    </article>
  );
}
```

Das funktioniert genau wie die vorherige Version, verbessert aber die Lesbarkeit. Dieses Destructuring-Pattern ist in den meisten React-Codebasen die Standardkonvention.

Props akzeptieren jeden beliebigen JavaScript-Datentyp. Die Syntaxregeln entsprechen dem normalen JSX: Strings werden in Anführungszeichen gesetzt, alle anderen Typen in geschweifte Klammern.

```
<DeliveryCard item="Bread" distance={3} urgent={true} />
```

* `item="Bread"` verwendet Anführungszeichen für einen literalen String.
* `distance={3}` verwendet geschweifte Klammern für eine Zahl.
* `urgent={true}` verwendet geschweifte Klammern für einen Boolean.

## Props sind read-only

Props sind strikt read-only. Eine Komponente darf die Props, die sie empfängt, niemals verändern. Innerhalb von `DeliveryCard` kannst du `item` zum Beispiel lesen, aber eine Neuzuweisung aktualisiert die UI nicht.

Das erzwingt den One-Way-Data-Flow von React: Der Parent besitzt die Daten, das Child rendert sie lediglich.

Wenn eine Komponente Daten verfolgen muss, die sich über die Zeit verändern (zum Beispiel um eine Lieferung als abgeschlossen zu markieren), können diese Daten nicht in Props leben. Dafür braucht es State, den wir uns als Nächstes ansehen.

## Denkanstoß

Stell dir vor, du müsstest `DeliveryCard` so anpassen, dass sie zusätzlich anzeigt, ob eine Lieferung dringend ist. Welche Props würdest du dafür ergänzen, und warum würde es nicht ausreichen, den `urgent`-Status direkt in der Komponente zu verändern, wenn sich die Dringlichkeit später ändert?

## Resources
[Passing props to a component](https://react.dev/learn/passing-props-to-a-component)