# Next.js, Tailwind und shadcn – Challenges

## Code Along

Diese Challenges setzen die Kiki's-Delivery-Service-App aus der vorherigen Session fort. Starte dort, wo diese Session aufgehört hat.

### Tailwind zum Projekt hinzufügen

Die App hat noch kein Styling-Tool eingerichtet. Füge Tailwind hinzu, damit Utility-Klassen überall funktionieren.

* Installiere `tailwindcss`, `@tailwindcss/postcss` und `postcss`
* Erstelle `postcss.config.mjs` im Root und registriere das `@tailwindcss/postcss`-Plugin
* Ersetze den Inhalt von `app/globals.css` durch eine einzelne Zeile `@import "tailwindcss";`
* Füge einer Heading `className="text-3xl text-red-500"` hinzu und bestätige im Browser, dass sich die Darstellung ändert

### shadcn/ui einrichten

Bring shadcn ins Projekt, damit du dessen Components nutzen kannst.

* Führe `npx shadcn@latest init` vom Projekt-Root aus und beantworte die Prompts
* Schau dir an, was sich geändert hat: die neue `components.json`, die CSS-Variablen, die zu `globals.css` hinzugefügt wurden, und `lib/utils.ts` mit dem `cn`-Helper
* Bestätige, dass die App weiterhin läuft und gleich aussieht, da bisher noch nichts zu einer Page hinzugefügt wurde

### Bare Elements durch shadcn-Components ersetzen

Tausche die einfachen HTML-Elemente gegen shadcn-Components aus und style die App damit richtig.

* Füge die benötigten Components hinzu: `npx shadcn@latest add button card select input label`
* Rendere jede Delivery innerhalb einer `Card`, mit `CardHeader`, `CardTitle` und `CardContent`
* Ersetze den Link zu `/deliveries/new` durch einen `Button` mit `asChild` um einen Next.js-`<Link>`
* Ersetze in der `DeliveryFilter`-Client-Component das native `<select>` durch shadcns `Select`, wobei du `value` und `onValueChange` mit dem bestehenden State verdrahtest
* Ersetze im New-Delivery-Formular die Inputs durch `Input` und `Label`, behalte dabei die `name`-Attribute bei, die die Server Function ausliest
* Bestätige, dass der Filter weiterhin filtert und das Formular weiterhin eine Delivery erstellt

### Eine eigene Button-Variant hinzufügen

Nutze die Tatsache, dass du den Component-Code selbst besitzt, um eine `brand`-Variant hinzuzufügen.

* Öffne `components/ui/button.tsx` und finde die Liste der Variants
* Füge eine `brand`-Variant hinzu, die deine Tokens `bg-brand` und `hover:bg-brand-muted` nutzt
* Verwende `<Button variant="brand">` irgendwo in der App und bestätige, dass sie mit deiner Farbe gerendert wird

### Dark Mode hinzufügen

Schließe ab, indem du der App ermöglichst, zwischen Light und Dark zu wechseln. shadcn hat die Dark-Farbwerte bereits während des `init` geschrieben, hier geht es also darum, einen Weg hinzuzufügen, sie einzuschalten.

* Installiere `next-themes` und umschließe die App in `app/layout.tsx` mit dessen `ThemeProvider`
* Füge irgendwo im Layout einen Button hinzu, der mit dem `useTheme`-Hook zwischen Light und Dark umschaltet
* Bestätige, dass jede shadcn-Component, die Cards und deine Brand-Elemente beim Umschalten alle mitwechseln – ohne zusätzlichen Styling-Aufwand

## Code Snippet Library

Dies setzt die Code Snippet Library aus der vorherigen Session fort: ein Next.js-Projekt mit dem `snippetsService`, das auf Postgres aufsetzt, einer `/snippets`-Liste, einer `/snippets/[id]`-Detailseite, einem `/snippets/new`-Formular und einer Client Component, die nach Language filtert.

* Richte Tailwind genau wie in der Kiki's-Challenge ein: installiere die Packages, füge `postcss.config.mjs` hinzu und ersetze `globals.css` durch den Tailwind-Import
* Führe `npx shadcn@latest init` aus und füge anschließend `button card select input label` hinzu
* Rendere jedes Snippet in einer `Card`
* Ersetze den Link zum neuen Snippet durch einen `Button` mit `asChild` und einem `<Link>`
* Ersetze das native Language-`<select>` in der Filter-Client-Component durch shadcns `Select`
* Ersetze die Formularfelder durch `Input` und `Label`, behalte die `name`-Attribute unverändert bei
* Durchstöbere den Component-Katalog und schau, was du sonst noch hinzufügen kannst, um deine App zu stylen

---

**Denkanstoß:** Du hast in dieser Session sowohl die Kiki's-Delivery-Service-App als auch die Code Snippet Library auf dieselbe Tailwind- und shadcn-Basis gebracht. Welche Schritte des Setups würdest du dir für ein zukünftiges Projekt als eigenes Starter-Template zurechtlegen, damit du sie nicht jedes Mal wiederholen musst?