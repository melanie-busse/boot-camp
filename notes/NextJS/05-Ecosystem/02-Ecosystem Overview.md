# Next.js Ecosystem – Ecosystem Overview

React ist eine Rendering-Bibliothek und nicht viel mehr. Sie gibt dir Komponenten, State und eine Möglichkeit zu beschreiben, wie der Bildschirm aussehen soll, und hört dann auf. Sie hat keine Meinung dazu, wie du Daten abrufst, wie du eine Komponente stylst, wie du State über entfernte Teile des Baums teilst, oder wie du ein Formular handhabst. Next.js fügt darüber Routing, Server-Rendering und eine Build-Pipeline hinzu, bleibt aber genauso zurückhaltend in Bezug auf den Rest. Diese Lücke wird durch ein großes Ökosystem an Drittanbieter-Bibliotheken gefüllt, und für die meisten Aufgaben gibt es mehr als eine populäre Option.

## Beispiel-Bibliotheken

Diese Liste enthält einige der populärsten Drittanbieter-Bibliotheken für Next.js sowie einige spezialisierte Beispiel-Bibliotheken wie react-leaflet oder den Monaco Editor. Wenn du ein UI-Element benötigst, gibt es sehr wahrscheinlich eine Library bzw. ein Package dafür.

| Bereich | Library | Was sie macht |
|---|---|---|
| Data Fetching | SWR | React-Hooks zum Abrufen, Cachen und Revalidieren von Server-Daten. Der wichtigste Hook ist `useSWR`. |
| Data Fetching | TanStack Query | Eine umfangreichere Alternative zu SWR mit mehr Kontrolle über Caching, Mutations und Background-Refetching. |
| Globaler State | Redux Toolkit | Die heute übliche Art, Redux zu verwenden: ein zentraler Store mit vorhersehbaren, typisierten Updates. |
| Globaler State | Zustand | Ein kleiner Store, den du über einen Hook auslesen kannst, ohne dass deine App von einem Provider umhüllt werden muss. |
| Formulare | react-hook-form | Form-State und Validierung, aufgebaut auf Refs, sodass das Formular nicht bei jedem Tastendruck neu rendert. |
| Validierung | Zod | Schema-Validierung für Formulareingaben und API-Antworten, mit TypeScript-Typen, die aus dem Schema abgeleitet werden. |
| Authentifizierung | Better Auth | Framework-unabhängige Authentifizierung für TypeScript: Sessions, E-Mail und Passwort sowie Social-Login-Provider. |
| Animation | Motion | Deklarative Animationen, Übergänge und Gesten für React (ehemals Framer Motion). |
| 3D-Rendering | React Three Fiber | Ein React-Renderer für Three.js, sodass du 3D-Szenen mit Komponenten statt mit imperativen Aufrufen beschreibst. |
| Karten | React Leaflet | React-Komponenten für Leaflet, für interaktive Karten mit Markern, Layern und Kacheln. |
| Code-Editor | Monaco Editor | Der Editor, der VS Code antreibt, einbettbar im Browser für In-App-Code-Bearbeitung. |

Wir werden uns zwei Bibliotheken etwas genauer ansehen: `react-hook-form` zum Sammeln und Validieren von Formulareingaben, und Zustand zum Teilen von Daten in der gesamten App.

## Ressourcen

[Next.js documentation](https://nextjs.org/docs)

[React documentation](https://react.dev/)