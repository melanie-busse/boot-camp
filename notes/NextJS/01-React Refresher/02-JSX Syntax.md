# React Refresher – JSX

React-Komponenten verwenden JSX (oder TSX für TypeScript), um die UI zu definieren. Obwohl es wie HTML aussieht, ist JSX tatsächlich eine Syntaxerweiterung für JavaScript. Bevor es den Browser erreicht, kompiliert ein Build-Tool JSX-Tags zu einfachen JavaScript-Funktionsaufrufen (wie `React.createElement`). JSX existiert ausschließlich aus Gründen der Lesbarkeit. Ohne JSX würde der Bau komplexer UIs das Schreiben tief verschachtelter, unübersichtlicher Funktionsaufrufe erfordern. Es hält den Code so, dass er wie das finale Layout aussieht, während es dem Entwickler erlaubt, mit geschweiften Klammern `{}` reguläres JavaScript (oder TypeScript) einzufügen. Schauen wir uns einige häufige Fallstricke an, bei denen sich JSX von Standard-HTML unterscheidet.

## JavaScript einbetten

Um JavaScript innerhalb von JSX auszuwerten, umschließt du es mit geschweiften Klammern `{}`. Alles zwischen den Klammern wird als JavaScript-Ausdruck behandelt, und dessen Ergebnis wird direkt in das Markup gerendert.

```
const customer = "Tombo";
const element = <p>Delivery for {customer}</p>;

```

Du kannst Variablen, mathematische Operationen (`{2 + 2}`), Objekt-Properties (`{delivery.pickup}`) oder Funktionsaufrufe übergeben.

Die entscheidende Einschränkung ist, dass geschweifte Klammern nur Ausdrücke akzeptieren (Code, der zu einem Wert evaluiert). JavaScript-Statements wie `if`- oder `for`-Schleifen funktionieren dort nicht. Für bedingte Logik innerhalb von JSX verwendest du stattdessen einen ternären Operator:

```
<p>Priority: {isUrgent ? "Urgent" : "Standard"}</p>

```

## Attribute

Da JSX im Kern JavaScript ist, verwenden Attribute camelCase-Benennung statt der üblichen HTML-Konventionen. Da zum Beispiel `class` ein reserviertes Schlüsselwort in JavaScript ist, verwendet JSX stattdessen `className`. Mehrwort-Attribute folgen camelCase (z. B. `onClick`, `htmlFor`).

Werte werden Attributen auf zwei Arten übergeben:

* Statische Strings stehen in Anführungszeichen (`""`).
* JavaScript-Ausdrücke stehen in geschweiften Klammern (`{}`).

```
<img className="avatar" src={kiki.photo} alt="Kiki" />

```

* `className="avatar"` und `alt="Kiki"` verwenden Anführungszeichen, weil es sich um feste Strings handelt.
* `src={kiki.photo}` verwendet geschweifte Klammern, um dynamisch eine Property aus einem JavaScript-Objekt zu lesen.

## JSX zurückgeben

Jeder JSX-Ausdruck muss ein einziges Wurzelelement zurückgeben. Geschwister-Tags nebeneinander zurückzugeben, verursacht einen Syntaxfehler, da JSX zu einem einzigen JavaScript-Funktionsaufruf kompiliert wird, der nur einen einzigen Wert zurückgeben kann.

Um mehrere Elemente zu gruppieren, ohne unnötige `<div>`-Knoten zum DOM hinzuzufügen, umschließt du sie mit einem Fragment (`<>` und `</>`).

```
return (
  <>
    <h2>Today's deliveries</h2>
    <p>Three packages ready for pickup</p>
  </>
);

```

Fragments erfüllen die Anforderung von JSX nach einem einzigen Element, während sie das gerenderte HTML sauber halten.

## Ressourcen

[Writing markup with JSX](https://react.dev/learn/writing-markup-with-jsx)

[JavaScript in JSX with curly braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces)