# Next.js, Tailwind und shadcn – shadcn/ui Components

Mit initialisiertem shadcn fügst du Components nach und nach hinzu, immer nur die, die du tatsächlich brauchst. Jeder `add`-Command kopiert den Source-Code einer Component nach `components/ui`, von wo aus du sie wie jede lokale Component importierst und mit dem Tailwind stylst, das du bereits kennst.

## Components hinzufügen

Du holst eine Component mit der CLI herein, indem du die gewünschte Component benennst:

```bash
npx shadcn@latest add button
```

Du findest die neue Component anschließend in `components/ui/button.tsx`, und shadcn installiert alle benötigten Dependencies. Ab jetzt ist diese Component einfach eine Datei, die du mit dem `@/`-Alias importierst:

```ts
import { Button } from "@/components/ui/button";
```

Du fügst Components also genau dann hinzu, wenn du sie brauchst, sodass der Ordner nur das enthält, was die App tatsächlich nutzt. Schauen wir uns ein paar gängige Components an, die in praktisch jeder App vorkommen.

## Button

Der Button rendert einen gestylten, accessible Button und akzeptiert eine `variant`-Prop, die sein Erscheinungsbild ändert. Die Variants sind in der Component-Datei vordefiniert: `default`, `secondary`, `outline`, `ghost` und `destructive`. Eine Delete-Action liest sich gut als `destructive`, was ihr die Danger-Farbe verleiht:

```tsx
import { Button } from "@/components/ui/button";

<Button>Accept</Button>
<Button variant="outline">Details</Button>
<Button variant="destructive">Cancel delivery</Button>
```

Es gibt eine Prop, die du früh kennen solltest. `asChild` gibt die Styles des Buttons an sein Child-Element weiter, anstatt das eigentliche `<button>`-Element zu rendern. Im Kontext von Next.js ist das die Art, wie du einen `<Link>` wie einen Button aussehen lässt, während er ein echter Link bleibt – was für Navigation und Accessibility wichtig ist:

```tsx
import Link from "next/link";

<Button asChild>
  <Link href="/deliveries/new">New delivery</Link>
</Button>;
```

## Card

Card ist eine Sammlung von Layout-Components für einen umrahmten, gepaddeten Container – genau die richtige Form für eine einzelne Delivery in einer Liste. Sie kommt als Familie: Card ist der Wrapper, mit CardHeader, CardTitle, CardContent und CardFooter für die einzelnen Bereiche darin.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Bakery to Clock Tower</CardTitle>
  </CardHeader>
  <CardContent>Status: active</CardContent>
</Card>;
```

Du setzt die Teile zusammen, die du brauchst, und lässt die anderen weg. Die Card bringt Border, Padding und Background-Color bereits aus den Theme-Tokens mit, sodass sie ohne zusätzliche Klassen korrekt aussieht – du fügst Tailwind-Utilities hinzu, wenn du sie anpassen möchtest.

## Select

Das native `<select>` im Deliveries-Filter funktioniert, lässt sich aber nicht so stylen, dass es zum Rest der App passt, und sieht in jedem Browser anders aus. shadcns Select ersetzt es durch ein vollständig gestyltes Dropdown, das sich für Keyboard- und Screenreader-User weiterhin korrekt verhält. Es ist aus mehreren Teilen aufgebaut, die widerspiegeln, wie ein Dropdown strukturiert ist:

```tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

<Select value={status} onValueChange={setStatus}>
  <SelectTrigger>
    <SelectValue placeholder="Filter by status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All</SelectItem>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="fulfilled">Fulfilled</SelectItem>
  </SelectContent>
</Select>;
```

Die Teile entsprechen den Bestandteilen eines Dropdowns:

- `SelectTrigger` ist die Box, auf die der User klickt, mit `SelectValue`, die die aktuelle Auswahl oder einen Placeholder anzeigt
- `SelectContent` ist das Panel, das sich öffnet und ein `SelectItem` pro Option enthält
- `value` und `onValueChange` am äußeren `Select` kontrollieren die Auswahl und ersetzen das native `value` und `onChange`

Eine Sache übernimmt sich aus der vorherigen Session: Select arbeitet mit State und Click-Handling, weshalb es nur innerhalb einer Client Component funktioniert. Der `DeliveryFilter` von vorher hat bereits `"use client"` am Anfang stehen – genau dort gehört das hin. Das native `<select>` gegen dieses auszutauschen ist innerhalb dieser bestehenden Client Component ein direkter Drop-in-Ersatz.

## Inputs für das Formular

Das New-Delivery-Formular hat bisher einfache `<input>`-Elemente verwendet. Input und Label geben ihnen ein konsistentes Styling und verknüpfen das Label mit seinem Field für Accessibility:

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="grid gap-2">
  <Label htmlFor="pickup">Pickup</Label>
  <Input id="pickup" name="pickup" placeholder="Bakery" />
</div>;
```

## Eine Component bearbeiten

Wenn du einen Blick in eine Component wirfst, kann der Anblick anfangs etwas überwältigend sein. Schaust du genauer hin, erkennst du aber alle Tailwind-Klassen, die die Elemente stylen, sowie den `cn`-Helper und die `cva`-Variants. Der Inhalt der Button-Component sollte zum Beispiel etwa so aussehen:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center (... and so on)",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline: "border-border bg-background hover:bg-muted (...)",
        secondary: "bg-secondary text-secondary-foreground (...)",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted (...)",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 (...)",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "(...)",
        xs: "(...)",
        sm: "(...)",
        lg: "(...)",
        "icon-xs": "(...)",
        "icon-sm": "(...)",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
```

Als Beispiel können wir die `buttonVariants` um ein neues Token für die `brand`-Variant erweitern:

```tsx
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center (... and so on)",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        brand: "bg-brand text-brand-foreground hover:bg-brand/80",
        ...
      }
  });
```

Jetzt funktioniert `<Button variant="brand">` überall in der App (denk daran, die `brand`-Farbvariablen wieder in die `globals.css` einzufügen, falls sie überschrieben wurden).

## Ressourcen

- [Button](https://ui.shadcn.com/docs/components/button)
- [Card](https://ui.shadcn.com/docs/components/card)
- [Select](https://ui.shadcn.com/docs/components/select)
- [Input](https://ui.shadcn.com/docs/components/input)

---

**Denkanstoß:** shadcn-Components liegen als Source-Code direkt in deinem Repository, statt als versionierte Library aus `node_modules` importiert zu werden. Welche Vor- und Nachteile bringt das mit sich, wenn shadcn selbst ein Update für eine Component veröffentlicht, die du bereits angepasst hast?