# Überblick

Die Web-Entwicklungslandschaft hat sich in den letzten Jahren grundlegend verändert. Von klassischen serverseitig gerenderten Anwendungen mit PHP oder Ruby on Rails bis hin zu Single Page Applications (SPAs) mit Angular oder React – nun ist eine neue Welle von Frameworks entstanden, die versuchen, mehr Rendering-Last zurück auf den Server zu verlagern, ohne dabei die interaktive Erfahrung einer clientseitigen App zu verlieren.

Wenn wir über das Rendern von Seiten sprechen, können wir 3 verschiedene Modelle unterscheiden:

* **Client-side Rendering (CSR):** Die Seite wird auf dem Client gerendert, der Client erhält den vollständigen JS-App-Code.
* **Server-side Rendering (SSR):** Die statischen Teile der Seite werden auf dem Server gerendert, und die UI durchläuft auf dem Client einen Hydration-Schritt.
* **Server Components:** Die UI-Elemente werden auf dem Server gerendert, und nur das fertige HTML wird an den Client gesendet.

Eine reine React-App läuft vollständig im Browser. Der Server sendet eine fast leere HTML-Datei und ein JavaScript-Bundle, und erst nachdem dieses JavaScript heruntergeladen wurde und ausgeführt wird, wird die Seite gerendert. Die Daten, die die Seite benötigt, werden anschließend in einem zweiten Roundtrip abgerufen. Das funktioniert, hat aber seinen Preis: Der erste Paint ist langsam, und Suchmaschinen sehen eine leere Seite.

Next.js ist in den letzten Jahren von einem SSR- zu einem auf Server Components zentrierten Modell gewechselt. Komponenten werden zuerst auf dem Server gerendert, und der Browser erhält fertiges HTML. Das ist die Idee hinter einem server-first Full-Stack-Framework: Die UI, der Code, der Daten abruft, und das Routing leben alle in einem Projekt, und der Großteil der Arbeit passiert auf dem Server, bevor überhaupt etwas beim Nutzer ankommt.

Ältere Versionen von Next.js verwendeten den Pages Router, der standardmäßig auf SSR setzte. Wir konzentrieren uns auf den neuen App Router, der stattdessen standardmäßig Server Components verwendet. Für interaktive Komponenten werden klassische Client Components benötigt, die in der nächsten Session behandelt werden.

Der App Router basiert auf einer einzigen Idee: Die Ordnerstruktur innerhalb eines `app`-Verzeichnisses definiert die URLs deiner Anwendung. Ein Ordner ist eine Route, eine `page.tsx`-Datei macht sie sichtbar, und eine kleine Anzahl speziell benannter Dateien fügt Layouts, Lade-Zustände und Fehlerbehandlung hinzu.

Wir arbeiten uns durch diese Konzepte, indem wir während der gesamten Session eine Beispiel-App entwickeln: die Website für Kikis kleinen Lieferservice, auf der Kunden Lieferanfragen erstellen können. Jedes Konzept erweitert dieselbe App, sodass die Routen und Daten, denen du früh begegnest, später wieder auftauchen.

## Ressourcen

[Kikis kleiner Lieferservice](https://www.themoviedb.org/movie/16859) [Next.js](https://nextjs.org/)