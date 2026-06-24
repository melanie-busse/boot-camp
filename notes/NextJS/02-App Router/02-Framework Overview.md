# Next.js App Router – Framework-Überblick

Eine mit einem Tool wie Vite erstellte React-Anwendung setzt typischerweise auf Client-Side Rendering. Der Server sendet ein minimales HTML-Dokument, und der Browser muss JavaScript herunterladen und ausführen, bevor die UI gerendert werden kann. In vielen Fällen erfolgt der Datenabruf erst nach dem initialen Rendering, was bedeutet, dass Nutzer möglicherweise Lade-Zustände sehen, bevor sie den vollständigen Inhalt zu Gesicht bekommen. Mit wachsender Anwendung wachsen auch die JavaScript-Bundles, wodurch sich die Menge an Code erhöht, die auf dem Client heruntergeladen, geparst und ausgeführt werden muss. Ein weiterer Nachteil von Client-Side Rendering betrifft schließlich die SEO und kann diese erschweren, da das initiale HTML nahezu eine leere Seite enthält.

Next.js ist ein Framework, das auf React aufbaut und dieses Paradigma verändert. Statt die UI vollständig im Browser zu rendern, können Komponenten auf dem Server gerendert und als fertiges HTML an den Client gesendet werden. Da der Server auch mit Datenbanken kommunizieren und Backend-Logik ausführen kann, kann dasselbe Projekt die UI, den Datenabruf und das Routing übernehmen. Diese Front- und Backend-Fähigkeiten positionieren Next.js als Full-Stack-Framework.

## Server-first by Default

In der Welt von Next.js gibt es zwei Arten von React-Komponenten, abhängig davon, wo sie ausgeführt werden. Wir unterscheiden zwischen Client- und Server-Komponenten. Konzentrieren wir uns zunächst auf Server Components, da diese die Standardeinstellung sind. Das bedeutet, dass jede Komponente, die du schreibst, auf dem Server läuft, sofern du nicht explizit etwas anderes angibst.

Es ist wichtig zu verstehen und im Hinterkopf zu behalten: Der serverseitige Code wird niemals an den Client-Browser gesendet. Der Code wird einmal ausgeführt, und die resultierende HTML-Seite kommt bereits fertig gerendert an, sodass der Nutzer den Inhalt früher sieht und Suchmaschinen echtes HTML erhalten. Da Server Components auf dem Server laufen, können sie serverseitige Aufgaben direkt erledigen (z. B. aus einer Datenbank lesen oder eine API mit einem geheimen Schlüssel aufrufen). Es gibt keinen separaten Roundtrip, um relevante Daten abzurufen. Die Komponente kann alles, was sie benötigt, direkt aus der Datenbank holen und diese Daten direkt in das HTML einbetten.

Server Components haben ihre Grenzen, die sich aus der Umgebung ergeben, in der sie laufen. Sie werden einmal gerendert und sind danach „verschwunden“, weshalb sie keine reinen Browser-Funktionen wie Click-Handler, `useState` oder `useEffect` verwenden können. Alles Interaktive benötigt eine Client Component – das Thema der nächsten Session.

## Komponenten entscheiden, wo sie laufen

Auch wenn Next.js ein Full-Stack-Framework ist, hilft es, eine Annahme früh fallen zu lassen. Ein Next.js-Projekt ist nicht in einen Frontend- und einen Backend-Ordner unterteilt, die durch eine Netzwerkgrenze getrennt sind. Es ist um Komponenten herum organisiert. Du baust die App aus Komponenten auf, genau wie in jedem anderen React-Projekt. Wo eine bestimmte Komponente läuft (auf dem Server oder im Browser), ist eine Eigenschaft dieser Komponente und keine Aufteilung, die sich durch deine gesamte Codebasis zieht.

Die „magische“ Codezeile, die eine Server Component in eine Client Component verwandelt, ist `"use client"`. Indem du diese Direktive als erste Zeile der Datei hinzufügst, entscheidest du dich explizit für den Browser. Du wirst diese Direktive in dieser Lektion einmal sehen, in der Datei `error.tsx`, wo sie erforderlich ist. Davon abgesehen ist das mentale Modell für den Rest dieser Session einfach: Du schreibst Komponenten, und die meisten davon laufen auf dem Server. Was Client Components tatsächlich tun und wie Server- und Client-Komponenten Daten aneinander übergeben, wird in der kommenden Session behandelt.

## Ressourcen

[Next.js Dokumentation](https://nextjs.org/docs)
[Server Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)