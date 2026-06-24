# Next.js Tailwind und shadcn – Tailwind Basics

Wenn du eine Component auf die traditionelle Art stylst, leben die Regeln in einer separaten CSS-Datei, und du verbindest sie über einen Class-Namen, den du dir selbst ausgedacht hast, wie `.delivery-card`. Zwei Dateien beschreiben jetzt eine Component, und du springst zwischen ihnen hin und her, um sie zu lesen. Tailwind geht einen anderen Weg. Du stylst ein Element, indem du viele kleine, einzweckige Classes direkt darauf setzt, und öffnest dafür nie eine CSS-Datei.

## Utility-First Styling

Die Idee hinter Utility-First Styling, das Tailwind nutzt, ist es, viele kleine Classes zu erstellen, die jeweils nur eine Sache tun. `p-4` setzt Padding, `flex` setzt `display: flex`, `text-center` zentriert Text. Du baust ein Design, indem du sie direkt am Element kombinierst:

```jsx
<div className="flex gap-4 rounded-lg border p-4">
  <h2 className="text-lg font-semibold">Bakery to Clock Tower</h2>
</div>
```

Dieses `<div>` zu lesen, verrät dir alles darüber, wie es aussieht, ohne dass du eine weitere Datei öffnen musst. Die Styles reisen mit dem Markup, sodass sie mit verschwinden, wenn du die Component löschst.

Tailwinds Namenskonventionen für Classes wirken auf den ersten Blick kryptisch, folgen aber einem konsistenten System. `p` steht für Padding, `m` für Margin, `text` deckt Schriftgröße und -farbe ab, und die Zahl nach dem Bindestrich ist eine Stufe auf einer festen Spacing-Scale statt eines Pixelwerts. Sobald du das Muster für eine Property gelernt hast, lesen sich die restlichen genauso.

All diese Classes von Hand zu erstellen, wäre extrem mühsam, und ein riesiges Stylesheet mit allen möglichen Kombinationen, die Tailwind anbietet, wäre unpraktikabel. Stattdessen generiert Tailwind diese Classes aus dem CSS, das du schreibst, indem es alle Dateien in deinem Projekt nach den Class-Namen durchsucht, die es erkennt. Aus diesem Scan wird ein minimales, aber flexibles Stylesheet generiert und in dein HTML injiziert.

## Tailwind zum Projekt hinzufügen

Tailwinds Konfiguration zum bestehenden Next.js-Projekt hinzuzufügen, braucht drei Schritte.

Erstens installierst du Tailwind und sein PostCSS-Plugin. PostCSS ist das Tool, das Next.js bereits nutzt, um dein CSS zu verarbeiten, und das Plugin sorgt dafür, dass es Tailwind versteht:

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

Zweitens registrierst du das Plugin, damit Next.js Tailwind über deine Styles laufen lässt. Erstelle `postcss.config.mjs` im Projekt-Root:

```javascript
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
```

Drittens ziehst du Tailwind in dein globales Stylesheet. Öffne `app/globals.css`, entferne die alten Starter-Styles und ersetze die gesamte Datei durch einen einzigen Import:

```css
@import "tailwindcss";
```

Diese eine Zeile generiert jede Utility Class. Da `globals.css` bereits in `app/layout.tsx` aus den vorherigen Sessions importiert wird, stehen die Classes jetzt in jeder Component zur Verfügung. Starte den Dev-Server und füge einer Heading ein `className="text-3xl font-bold"` hinzu, um zu bestätigen, dass es funktioniert.

## Wichtige Utility Classes

Tailwind hat eine Utility für fast jede CSS-Property, weit mehr, als sich irgendjemand merkt. Du lernst die Handvoll, zu der du täglich greifst, und schaust den Rest in den Docs nach, die durchsuchbar sind nach der CSS-Property, die du im Kopf hast. Das sind die Gruppen, die es sich zu merken lohnt:

| Gruppe | Beispiele | Was sie tun |
|---|---|---|
| Layout | `flex`, `grid`, `block`, `hidden` | Setzen den Display-Modus |
| Grid-Spalten | `grid-cols-3`, `grid-cols-1` | Formen ein Grid in entsprechend viele Spalten |
| Padding und Margin | `p-4`, `m-4` | Padding (`p`) oder Margin (`m`) auf allen vier Seiten |
| Seiten-Modifikatoren | `px-4`, `py-2`, `pt-4`, `mb-2` | Füge `x` für links und rechts, `y` für oben und unten, oder `t`/`b`/`l`/`r` für eine einzelne Seite hinzu |
| Negative Werte | `-mt-3`, `-top-3` | Stelle einem Wert ein `-` voran, um ihn negativ zu machen, um ein Element in die andere Richtung zu ziehen |
| Gap | `gap-4` | Abstand zwischen Children in einem Flex- oder Grid-Container |
| Sizing | `w-full`, `h-screen`, `max-w-md` | Breite und Höhe; benannte Größen wie `md` (28rem) und `lg` (32rem) stammen aus einer Scale |
| Farbe | `bg-blue-500`, `text-gray-700`, `border-gray-200` | Hintergrund-, Text- und Border-Farbe; die Zahl ist ein Farbton von 50 (am hellsten) bis 950 (am dunkelsten) |
| Typografie | `text-lg`, `font-semibold`, `text-center` | Schriftgröße, -gewicht und Ausrichtung |
| Borders und Ecken | `border`, `border-2`, `rounded-lg`, `shadow-sm` | Border-Vorhandensein und -Breite, abgerundete Ecken und Schatten |

Tailwind hat großartige Docs, die dir den Einstieg erleichtern. Halte sie offen und suche nach der Property; die Class-Namen bilden CSS eng genug ab, dass sie schnell vorhersehbar werden.

## State- und Responsive-Variants

Eine Utility für sich allein wirkt immer. Aber was ist mit optionalem Styling wie Hover und Media Queries für unterschiedliche Bildschirmgrößen? Tailwind löst das mit einem Präfix vor der Utility, genannt Variant.

State-Variants wenden eine Utility als Reaktion auf Interaktion an. `hover:bg-blue-600` ändert den Hintergrund nur, während sich der Pointer über dem Element befindet, und `focus:ring-2` fügt einen Ring nur hinzu, während ein Input fokussiert ist:

```jsx
<button className="bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
  Accept delivery
</button>
```

Responsive-Variants wenden eine Utility nur ab einer bestimmten Bildschirmbreite an. Tailwind ist Mobile-First, eine Utility ohne Präfix gilt also überall, und eine mit Präfix übernimmt erst auf größeren Bildschirmen. Hier ist die Liste standardmäßig einspaltig und wird ab dem `md`-Breakpoint dreispaltig:

```jsx
<ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
```

Die Breakpoint-Präfixe sind `sm:`, `md:`, `lg:`, `xl:`. Es gibt außerdem eine `dark:`-Variant, die eine Utility nur im Dark Mode anwendet – die nutzen wir am Ende der Session, sobald das Theming eingerichtet ist.

> 💡 Variants lassen sich kombinieren. `md:hover:bg-blue-600` wendet den Hover-Hintergrund nur ab mittleren Bildschirmgrößen an.

## Ressourcen

- [Styling with utility classes](https://tailwindcss.com/docs/styling-with-utility-classes)
- [Hover, focus, and other states](https://tailwindcss.com/docs/hover-focus-and-other-states)
- [Responsive design](https://tailwindcss.com/docs/responsive-design)

---

**Denkanstoß:** `md:hover:bg-blue-600` kombiniert eine Responsive- mit einer State-Variant. Überlege: Warum steht der Breakpoint-Präfix (`md:`) hier vor dem State-Präfix (`hover:`) und nicht umgekehrt – ändert die Reihenfolge der Präfixe etwas am Verhalten, oder ist sie reine Konvention?