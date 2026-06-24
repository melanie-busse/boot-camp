# Next.js Tailwind und shadcn – shadcn/ui Setup

Tailwind stylt deine eigenen Elemente sehr gut, aber manche Komponenten sind wirklich schwierig zu bauen. Ein zugängliches Dropdown mit Tastaturnavigation, Fokus-Falle und Screenreader-Unterstützung ist Hunderte von Zeilen sorgfältiger Arbeit — Arbeit, die bereits von hochwertigen Bibliotheken wie Base UI oder Radix UI erledigt wurde.

Statt diese Arbeit neu zu erfinden, führen wir eine sehr beliebte, quelloffene Sammlung wiederverwendbarer UI-Komponenten namens shadcn/ui ein. Vielleicht hast du schon einmal von Komponentenbibliotheken gehört und sie sogar benutzt. Interessanterweise schreiben die Entwickler hinter shadcn darüber: „Das ist keine Komponentenbibliothek. Es ist die Art, wie du deine [eigene] Komponentenbibliothek baust.“ Schauen wir es uns an.

## Den Code besitzen statt ihn zu importieren

Traditionelle UI-Bibliotheken liefern dir vordefinierte Komponenten, die du in dein Projekt einfügst und nutzt, ohne dich um das zugrunde liegende CSS zu kümmern. Die meisten Bibliotheken implementieren die gängigsten Muster, etwa Buttons, Eingabefelder und Dropdowns oder sogar Datentabellen und Diagramme. Eine bekannte Bibliothek wie Material UI liegt zum Beispiel in `node_modules` und erlaubt dir, einen `<Button>` zu importieren. Aber das Styling und das Verhalten dieser Komponente sind im Paket fest eingeschlossen.

Shadcn-Komponenten sind eher wie eine hoch entwickelte Vorlage, die du so lange anpasst, bis sie perfekt zu deinem Anwendungsfall passt. Jede Komponente wird zu einer `.tsx`-Datei in deinem `components/ui`-Ordner und ist damit Teil deines Repositories. Die Zugänglichkeit und das Verhalten kommen von kleinen, spezialisierten Bibliotheken darunter (Radix UI / Base UI für die interaktiven Teile), aber die Komponenten-Datei darüber gehört dir und kann von dir verändert werden. Du bekommst die schwierigen Teile gelöst und behältst das Styling offen, mit einem soliden Standard-Design.

Sieh dir die Liste der von shadcn bereitgestellten [Komponenten](https://ui.shadcn.com/docs/components) an. Falls das nicht reicht, kannst du auch das [Verzeichnis](https://ui.shadcn.com/docs/directory) mit über 200 von der Community gepflegten Komponentenpaketen durchstöbern, die alle derselben „kopieren und anpassen“-Philosophie folgen.

## Shadcn initialisieren

Shadcn bringt ein eigenes CLI mit, mit dem du es in ein bestehendes Projekt einbindest. Wechsle im Projektstammverzeichnis und führe den Init-Befehl aus:

```bash
npx shadcn@latest init
```

Das CLI stellt dir einige Optionen bereit (zum Beispiel, welche Basisfarbe du verwenden willst) und richtet das Projekt dann entsprechend ein. Hier ist, was dabei geändert wird, damit die neuen Dateien kein Rätsel bleiben:

- `components.json` erscheint im Root. Darin werden deine Entscheidungen festgehalten, etwa wohin Komponenten geschrieben werden sollen, damit spätere `add`-Befehle wissen, was zu tun ist.
- `app/globals.css` wird um einen Block mit CSS-Variablen für Farben erweitert, plus einen Dark-Mode-Block. Das sind Theme-Tokens in derselben Form wie die `@theme`-Werte aus dem vorherigen File.
- `lib/utils.ts` wird angelegt und exportiert einen Helfer namens `cn`.
- Einige kleine Abhängigkeiten werden installiert, darunter `clsx`, `cva` und `tailwind-merge`.

Nach dem Init sieht das Projekt im Browser noch genauso aus. Auf einer Seite wurde noch nichts ergänzt. Du hast nur die Grundlage geschaffen, um Komponenten später einzubauen.

## Theming mit CSS-Variablen

Die Variablen, die shadcn in `globals.css` schreibt, sind sein komplettes Farbsystem und funktionieren genauso wie die `@theme`-Tokens aus dem vorherigen Kapitel. Jedes Token ist eine CSS-Variable, die zweimal definiert wird: einmal für den Light Mode und einmal innerhalb eines `.dark`-Blocks für den Dark Mode.

```css
:root {
  --primary: oklch(0.21 0.006 285.885);
  --primary-foreground: oklch(0.985 0 0);
}

.dark {
  --primary: oklch(0.92 0.004 286.32);
  --primary-foreground: oklch(0.21 0.006 285.885);
}
```

Weil jede Komponente auf diese Variablen verweist, gestaltest du die ganze App neu, indem du die Werte an einer Stelle änderst. Wenn du `--primary` änderst, aktualisieren sich alle Buttons, Links und Akzente, die diese Variable nutzen. Fügst du der Seite die Klasse `dark` hinzu, wechseln alle Variablen auf einmal zu ihren dunklen Werten.

💡 Die Bezeichnung `foreground` ist eine shadcn-Konvention: `--primary` ist eine Hintergrundfarbe, und `--primary-foreground` ist die Textfarbe, die darauf liegen soll.

Shadcn hat eine praktische [Theme Creator Web App](https://ui.shadcn.com/create?preset=b1z30o0hGK), mit der du dein eigenes Farbsystem erstellen kannst. Du kannst die CSS-Variablen von dort kopieren und in `globals.css` einfügen.

## Der cn-Helper

Jede shadcn-Komponente verwendet einen Helfer namens `cn`. Er liegt in `lib/utils.ts` und sieht so aus:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Er kombiniert zwei Bibliotheken, die jeweils ein eigenes Problem beim Erstellen von Klassenstrings lösen.

`clsx` baut einen Klassenstring aus Bedingungen zusammen. Statt Strings von Hand aneinanderzureihen, gibst du Werte hinein, und es behält die wahrheitswertigen. So wendet eine Komponente eine Klasse nur dann an, wenn eine Prop gesetzt ist:

```ts
cn("rounded-md px-4", isActive && "bg-brand", isDisabled && "opacity-50");
```

Wenn `isActive` wahr ist und `isDisabled` falsch, ist das Ergebnis `"rounded-md px-4 bg-brand"`. Die falsche Bedingung wird entfernt.

`tailwind-merge` löst Konflikte zwischen Tailwind-Klassen. Zwei Klassen, die dieselbe CSS-Eigenschaft setzen, landen beide im HTML, und die normalen CSS-Regeln — nicht unbedingt die Reihenfolge, in der du sie geschrieben hast — entscheiden, welche gewinnt. Das ist selten das, was du willst. Wenn eine Komponente intern `px-4` hat und du `px-8` zum Überschreiben übergibst, ist der String `"px-4 px-8"` mehrdeutig. `tailwind-merge` weiß, dass beide horizontales Padding setzen, behält nur die letzte Klasse und macht daraus `px-8`.

## Varianten mit cva

`cn` setzt einen Klassenstring zusammen, entscheidet aber nicht, welche Klassen eine Komponente überhaupt verwenden soll. Ein `Button` hat mehrere Varianten (default, outline, destructive) und mehrere Größen, und jede Variante besteht aus einem eigenen Satz Tailwind-Klassen. Shadcn verwendet dafür eine kleine Bibliothek namens `class-variance-authority`, importiert als `cva`.

`cva` erlaubt dir, die Klassensätze einmal als Daten zu deklarieren und gibt dir eine Funktion zurück, die eine Variantenwahl in den passenden Klassenstring umwandelt:

```ts
import { cva } from "class-variance-authority";

const badge = cva("rounded-full px-2 py-1 text-sm font-medium", {
  variants: {
    tone: {
      neutral: "bg-gray-100 text-gray-800",
      success: "bg-green-100 text-green-800",
      danger: "bg-red-100 text-red-800",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});
```

Der Aufruf hat drei Teile:

- Das erste Argument ist der Basis-String, also die Klassen, die immer gelten.
- `variants` enthält benannte Gruppen von Optionen. Hier mappt eine einzelne Gruppe `tone` jede Option auf ihre eigenen Klassen; eine Komponente kann mehrere Gruppen haben, etwa eine `variant`-Gruppe und eine `size`-Gruppe.
- `defaultVariants` wählt die Option, die verwendet wird, wenn der Aufrufer nichts übergibt, sodass `badge()` auch ohne Argument einen gestylten Inhalt erzeugt.

Dann rufst du die zurückgegebene Funktion mit der gewünschten Variante auf, und sie liefert dir den vollständigen Klassenstring:

```ts
badge({ tone: "success" });
// "rounded-full px-2 py-1 text-sm font-medium bg-green-100 text-green-800"
```

## Ressourcen

- [shadcn/ui installation for Next.js](https://ui.shadcn.com/docs/installation/next)
- [shadcn components](https://ui.shadcn.com/docs/components)
- [community project directory](https://ui.shadcn.com/docs/directory)
- [Theming](https://ui.shadcn.com/create?preset=b1z30o0hGK)