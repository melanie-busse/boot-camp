# Überblick: Model-View-Controller

Eine kleine Express-App passt problemlos in eine einzige Datei. Ein paar Routen deklarieren, die Handler-Logik inline schreiben, Daten aus einer JSON-Datei lesen – und schon läuft ein Server. Aber genau das ist eine Falle.

Sobald die Anwendung wächst, dehnen sich diese einzeiligen Handler aus. Plötzlich übernimmt die „eine Datei" das Parsen von Dateien, das Formatieren von Daten, die Template-Auswahl und HTTP-Statuscodes. Am Ende entsteht eine riesige, verworrene Datei, in der die Suche nach einem Bug bedeutet, durch tausende Zeilen Code zu scrollen. Und stellt man sich vor, dass ein ganzes Entwicklungsteam an einer solchen Anwendung arbeitet und sich gegenseitig ständig den Code überschreibt – das Ergebnis ist ein technischer Albtraum.

---

## Separation of Concerns

Eine Lösung für dieses Chaos – und ein fundamentales Prinzip der Softwareentwicklung – heißt **Separation of Concerns** (Trennung der Zuständigkeiten). Im Backend-Bereich ist das **Model-View-Controller-Muster (MVC)** der verbreitetste Weg, dieses Prinzip umzusetzen, da es Datenverwaltung und Benutzeroberfläche voneinander entkoppelt.

Interessanterweise ist MVC kein neues Konzept, das für das moderne Web erfunden wurde. Es entstand in den späten 1970er-Jahren für grafische Desktop-Oberflächen – konkret für die Programmiersprache Smalltalk. Jahrzehnte später erkannten Entwicklerinnen und Entwickler, dass genau dieses mentale Modell das Chaos des Web-Server-Routings perfekt löst.

---

## Die drei Schichten

MVC zwingt dazu, klare Grenzen zu ziehen:

| Schicht | Verantwortung |
|---|---|
| **Model** | Besitzt die Daten und die Geschäftsregeln |
| **View** | Ist das, was die Nutzerin oder der Nutzer letztlich sieht |
| **Controller** | Vermittelt zwischen beiden: empfängt den eingehenden Request (delegiert vom Router), holt die nötigen Daten vom Model und übergibt sie an die View |