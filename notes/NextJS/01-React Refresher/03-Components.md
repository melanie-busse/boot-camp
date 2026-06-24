# React Refresher – Komponenten

Um dem DRY-Prinzip (Don't Repeat Yourself) zu folgen, vermeide es, JSX zu duplizieren. Definiere ein UI-Stück stattdessen einmal als wiederverwendbare JavaScript-Funktion, die JSX zurückgibt. Diese werden als Komponenten bezeichnet.

React-Apps sind als Komponentenbaum strukturiert. Eine einzelne Root-Komponente rendert Kind-Komponenten, die sich bis zu granularen Stücken wie einem einzelnen Button oder einer Karte verschachteln. React zu schreiben bedeutet größtenteils, „in Komponenten zu denken“: ein Layout in isolierte, benannte Funktionen aufzubrechen und diese zusammenzusetzen.

Als Nächstes behandeln wir, wie man Komponenten definiert, rendert und dynamisch Listen aus Daten-Arrays rendert.

## Eine Komponente definieren

Eine React-Komponente ist eine JavaScript-Funktion, die JSX zurückgibt. Ihr Name muss mit einem Großbuchstaben beginnen, denn so unterscheidet React eigene Komponenten von nativen HTML-Tags. Zum Beispiel rendert `<article>` ein Standard-HTML-Element, während `<DeliveryCard>` deine eigene Komponente rendert.

```
function DeliveryCard() {
  return (
    <article>
      <h3>Bread delivery</h3>
      <p>From the bakery to the clock tower</p>
    </article>
  );
}

```

In diesem Stadium ist `DeliveryCard` lediglich eine normale Funktion, die eine Element-Struktur zurückgibt. Eine Komponente zu definieren rendert sie nicht automatisch auf dem Bildschirm: Es registriert die Komponente lediglich zur Verwendung.

## Eine Komponente rendern

Um eine Komponente zu rendern, verwendest du sie als JSX-Tag, genau wie ein HTML-Tag. Wenn die Komponente keine Kinder hat, verwendest du ein selbstschließendes Tag.

```
function App() {
  return (
    <main>
      <DeliveryCard />
      <DeliveryCard />
    </main>
  );
}

```

Hier rendert `App` zwei `<DeliveryCard />`-Instanzen innerhalb eines `<main>`-Elements. Jedes Tag führt die `DeliveryCard`-Funktion aus und fügt ihr JSX in die Seite ein.

Das verdeutlicht den primären Vorteil von Komponenten: Du definierst das Markup einmal und verwendest es über seinen Namen wiederholt. Im Moment sind beide Karten identisch, da die Komponente noch keine individuellen Daten entgegennehmen kann. Damit befassen wir uns im nächsten Abschnitt mithilfe von Props.

## Eine Liste rendern

Statt Komponenten einzeln hartzukodieren, verwendest du die JavaScript-Methode `map()`, um für jedes Element in einem Array ein JSX-Element zu erzeugen. Das resultierende Array bettest du dann direkt mithilfe geschweifter Klammern in dein Markup ein.

```
const deliveries = [
  { id: 1, item: "Bread" },
  { id: 2, item: "Herring pie" },
];

function DeliveryList() {
  return (
    <ul>
      {deliveries.map((delivery) => (
        <li key={delivery.id}>{delivery.item}</li>
      ))}
    </ul>
  );
}

```

Drei Elemente sorgen dafür, dass das funktioniert:

* `deliveries.map()` läuft durch die Daten, um für jedes Element ein `<li>` zurückzugeben.
* Geschweifte Klammern betten das erzeugte Array von Elementen innerhalb des `<ul>` ein.
* `key={delivery.id}` liefert einen eindeutigen Identifikator für jedes Element.

React benötigt die `key`-Prop, um Elemente über Renders hinweg zu verfolgen. Wenn sich die Liste ändert, nutzt React diese Keys, um gezielt nur die geänderten oder verschobenen Elemente zu aktualisieren, statt die gesamte Liste neu aufzubauen. Verwende immer eine stabile ID aus deiner Datenquelle statt des Array-Index.

## Ressourcen

[Your first component](https://react.dev/learn/your-first-component)

[Rendering lists](https://react.dev/learn/rendering-lists)