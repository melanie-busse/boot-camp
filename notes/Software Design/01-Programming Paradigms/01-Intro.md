# Übersicht

Viele TypeScript-Anwendungen bestehen aus kleinen Funktionen, die Eingaben validieren, Daten transformieren und Ergebnisse von einer Schicht zur nächsten weitergeben. Dieser Stil funktioniert gut, weil Funktionen leicht zu testen und wiederzuverwenden sind, wenn jede von ihnen eine einzige, klar definierte Aufgabe erfüllt.

Funktionale Programmierung in JavaScript und TypeScript bedeutet oft, kleine Funktionen zu schreiben, Datentransformationen explizit zu halten und auf Nebenwirkungen wie Datenbankzugriffe, Logging oder HTTP-Antworten zu achten. Man braucht keine fortgeschrittene Theorie, um von diesem Ansatz zu profitieren. In den meisten Codebasen geht es bei der praktischen funktionalen Programmierung um Vorhersagbarkeit und einen klaren Datenfluss.

Objektorientierte Programmierung löst eine andere Art von Problem. Wenn ein System Entitäten mit Zustand und Verhalten enthält, die zusammengehören (Konten, Bestellungen, Warenkörbe, Spielfiguren), kann es umständlich werden, einfache Objekte durch nicht verwandte Funktionen zu reichen. OOP ermöglicht es, Regeln direkt auf einer Klasse zu modellieren und zu steuern, wie sich ihr Zustand ändert, wodurch zusammengehörige Daten und Logik an einem Ort bleiben.

Die Sitzung beginnt mit funktionaler Programmierung, da dieser Stil bereits in TypeScript-MVC-Projekten verwendet wurde. Danach geht es über zu OOP: zunächst zum JavaScript-Laufzeitmodell, auf dem die Klassensyntax aufbaut, einschließlich Prototypen und Vererbung, und anschließend zu den TypeScript-Funktionen, die Klassen in größeren Codebasen nützlicher machen. Die Sitzung schließt mit drei Designprinzipien (Single Responsibility, DRY und Separation of Concerns), die unabhängig davon gelten, in welchem Stil man programmiert.
