# Next.js Tailwind und shadcn – Tailwind Custom Styles

Tailwind kommt mit einer großen Farbpalette, aber was, wenn z. B. `blue-500` nicht deine Brand-Farbe ist? Der naive Ansatz wäre, ein spezifischeres, aber kryptisches `bg-[#f4a261]` im gesamten Projekt zu schreiben. Das ist unpraktisch, gerade weil sich die Brand-Farbe irgendwann ändern könnte. Tailwind lässt dich stattdessen eigene Namen registrieren.

## Tokens definieren

Der praktische Ansatz ist, eigene Werte innerhalb eines `@theme`-Blocks in `globals.css` direkt nach dem Import hinzuzufügen. Eine Theme-Variable ist eine CSS Custom Property nach Tailwinds Namenskonvention. Im folgenden Beispiel definieren wir einmal ein Token wie `--color-brand`, das Tailwind liest, um passende Utilities zu generieren:

```css
@import "tailwindcss";

@theme {
  --color-brand: #f4a261;
  --color-brand-muted: #f7c59f;
}
```

Das Präfix im Variablennamen sagt Tailwind, welche Art von Utility generiert werden soll. Weil diese mit `--color-` beginnen, erstellt Tailwind dafür jede Color-Utility: `bg-brand`, `text-brand`, `border-brand` und so weiter. Der Teil nach `--color-` wird der Name, den du in der Class schreibst.

Jetzt nutzt du sie wie jede andere Tailwind-Farbe:

```jsx
<button className="bg-brand text-white hover:bg-brand-muted">
  New delivery
</button>
```

Dieselbe Namensidee lässt sich auf andere Kategorien anwenden. `--spacing-*` fügt Spacing-Stufen hinzu, `--font-*` fügt Font-Families hinzu, `--radius-*` fügt Border-Radius-Größen hinzu. Das Muster ist immer dasselbe: Benenne die Variable mit dem richtigen Präfix, und die Utilities erscheinen.

Es lohnt sich zu verstehen, was `@theme` tatsächlich erzeugt. Wenn Tailwind `--color-brand` liest, tut es zwei Dinge: Es generiert die Utilities im Stil `<color-kategorie>-brand`, und es gibt die Variable selbst auch als echte CSS Custom Property auf der Seite aus. `--color-brand` existiert also im Browser als lebender Wert, den du zur Laufzeit lesen oder ändern könntest.

Dieser zweite Teil ist der interessante. Eine Utility wie `bg-brand` enthält den Hex-Code nicht direkt; sie verweist auf die Variable. Änderst du den Wert der Variable, aktualisiert sich jedes Element, das `bg-brand` nutzt, sofort, ohne dass irgendetwas neu gebaut werden muss. Genau so werden wir später Dark Mode implementieren: Die Utility-Namen bleiben gleich, nur die Variablenwerte tauschen.

## Arbitrary Values

Tailwinds Namenssystem deckt sehr viele Anwendungsfälle ab, aber manchmal haben sie nicht ganz das, was du brauchst. Ein häufiges Beispiel ist ein spezifisches Grid-Layout, das sich mit den Standard-Tailwind-Utilities nicht nachbilden lässt. Ein anderes Beispiel ist eine Farbe, die du nur einmal brauchst. Dafür ein Token zu registrieren, würde deinen Theme-Namespace überladen. Tailwind hat für solche Situationen ein Hintertürchen namens Arbitrary Values, geschrieben, indem du den Wert in eckigen Klammern direkt nach dem Utility-Präfix angibst.

Du behältst den normalen Utility-Namen und liefert deinen eigenen Wert innerhalb der Klammern. Dieser Wert kann beliebiges gültiges CSS sein, das zur Property passt, die du ansprichst:

```jsx
<div className="h-[117px] bg-[#1da1f2] text-[15px]">
  Pinned to an exact size
</div>
```

Jede dieser Classes betrifft dieselbe Property, die das Präfix steuert, nur mit einem Wert, den Tailwind nicht von sich aus generieren würde. `h-[117px]` setzt genau diese Höhe, `bg-[#1da1f2]` nutzt genau diese Farbe, und `text-[15px]` setzt genau diese Schriftgröße. Die Klammer-Syntax funktioniert bei fast jeder Utility, auch bei solchen mit komplexeren Werten:

- `grid-cols-[1fr_500px_2fr]` definiert Grid-Spalten von Hand, wobei Unterstriche für die Leerzeichen stehen, die CSS verwenden würde, da ein Class-Name kein wörtliches Leerzeichen enthalten kann
- `top-[117px]` und andere Position-Utilities nehmen einen einmaligen Offset entgegen
- `bg-[var(--some-color)]` lässt eine Utility direkt auf eine CSS-Variable zeigen, was gelegentlich praktisch ist für einen Wert, der erst zur Laufzeit existiert

Denk daran, dass ein Arbitrary Value per Definition eine Einmal-Lösung ist. Wenn du `bg-[#f4a261]` auf ein zweites Element kopierst, hast du wahrscheinlich wieder das Duplikationsproblem, und das kann ein Signal dafür sein, statt dessen ein `@theme`-Token zu nutzen. Setze Klammern für echte Ausnahmen ein; nutze Tokens für alles, was du mehr als einmal schreiben wirst.

## Custom Variants

Erinnerst du dich: Eine Variant ist z. B. der `hover:`- oder `md:`-Teil, der entscheidet, wann eine Utility greift. Tailwind erlaubt dir, mit `@custom-variant` eigene Variant-Präfixe zu erfinden. Ein häufiger Fall ist ein Theme, das über eine Class auf einem Parent-Element umgeschaltet wird:

```css
@custom-variant theme-dark (&:where(.theme-dark *));
```

Das registriert ein `theme-dark:`-Präfix, das du auf jede Utility setzen kannst, sodass `theme-dark:bg-black` nur greift, wenn das Element innerhalb eines Elements mit der Class `theme-dark` sitzt. Du wirst das anfangs selten von Hand schreiben müssen, aber es hilft zu wissen, dass du das Set an Präfixen sogar um eigene erweitern kannst.

## Ressourcen

- [Theme variables](https://tailwindcss.com/docs/theme)
- [Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles)
- [Functions and directives](https://tailwindcss.com/docs/functions-and-directives)

---

**Denkanstoß:** Ein Arbitrary Value wie `bg-[#f4a261]` und ein Theme-Token wie `bg-brand` erzeugen am Ende dieselbe Farbe auf dem Bildschirm. Überlege: Was unterscheidet die beiden technisch (Stichwort CSS Custom Property), und warum macht genau dieser Unterschied das Token zur besseren Wahl, sobald die Farbe an mehr als einer Stelle im Projekt auftaucht?