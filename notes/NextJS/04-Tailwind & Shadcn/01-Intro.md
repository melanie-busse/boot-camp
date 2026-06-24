# Overview

Die App aus der vorherigen Session wird auf dem Server gerendert und besitzt clientseitige Interaktivität. Sie sieht allerdings aus wie ein einfaches HTML-Dokument aus dem Jahr 1995, weil noch nicht ein einziger Style geschrieben wurde. Das beheben wir in dieser Session.

Wir schauen uns zwei Tools an. Das erste ist Tailwind, eine Art zu stylen, bei der du kleine Classes direkt auf deine Elemente setzt, wie `flex`, `gap-4` und `text-lg`, statt CSS in einer separaten Datei zu schreiben und dir Class-Namen dafür auszudenken. Das zweite ist shadcn/ui, eine Sammlung fertiger Components wie Buttons, Cards und Dropdowns, die du in dein eigenes Projekt kopierst und nach Belieben anpassen kannst. shadcn baut auf Tailwind auf, daher legt die erste Hälfte der Session das Fundament, auf dem die zweite Hälfte steht.

Wir starten mit Tailwind für sich allein: die Idee hinter Utility Classes, wie du es zum bestehenden Next.js-Projekt hinzufügst, und die Utilities, zu denen du am häufigsten greifen wirst. Danach erweiterst du Tailwind um eigene Color Tokens – derselbe Mechanismus, den shadcn fürs Theming nutzt. Anschließend bringen wir shadcn/ui ins Spiel, richten es ein und ersetzen die nackten HTML-Elemente in der Kiki's Delivery Service App durch richtige Components. Die Session schließt mit Dark Mode, den das Token-System fast zum Nulltarif ermöglicht, sobald es einmal eingerichtet ist.

## Ressourcen

- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)