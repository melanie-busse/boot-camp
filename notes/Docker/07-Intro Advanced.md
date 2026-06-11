# Docker Fortgeschrittene Konzepte – Übersicht

## Wo wir stehen

Die Basics-Session hat dich mit jeweils einem Container arbeiten lassen. Du hast ein Dockerfile geschrieben, es zu einem Image gebaut, das Image gestartet und auf Docker Hub gepusht, damit dasselbe Artefakt überall läuft. Das deckt einen einzelnen Service ab, der hochfährt, seine Aufgabe erledigt und von außen nichts braucht.

## Warum das nicht reicht

Echte Anwendungen bleiben selten so einfach. Der Scoreboard-Service aus dem Basics-Code-Along braucht eine Datenbank, um Spielerpunkte zu speichern – und diese Datenbank muss ihre Daten über einen Neustart hinaus behalten. Service und Datenbank müssen sich finden und miteinander kommunizieren. Das Image, das du auslieferst, sollte weder Compiler noch Test-Runner mitschleppen, die nur während des Builds gebraucht wurden. Und sobald zwei, drei oder vier Container zusammengehören, ist es nicht mehr praktikabel, sie einzeln per `docker run` von Hand zu starten – in der richtigen Reihenfolge, mit den richtigen Flags.

## Was diese Session abdeckt

Diese Session fügt die Bausteine hinzu, die aus einem einzelnen Container einen funktionierenden Stack machen:

- **Multi-Stage Builds** verkleinern das Image, indem alles weggeworfen wird, was die laufende Anwendung nicht braucht.
- **Volumes** geben einem Container einen Ort, um Daten zu speichern, die ihn überleben.
- **Networks** erlauben es Containern, sich gegenseitig beim Namen zu finden, statt IP-Adressen zu erraten.
- **Docker Compose** bündelt all das in einer einzigen Datei, sodass der gesamte Stack mit einem einzigen Befehl startet.
- Das letzte Kapitel verwandelt diesen Stack in eine **Entwicklungsumgebung**, in der du Code auf deiner Maschine bearbeitest, ihn aber im Container ausführst.

Jedes Kapitel greift das Night Shift Arcade-Projekt aus den Basics auf und erweitert es – die Beispiele bauen also auf einem Image auf, das du bereits kennst.

---

> **Denkanstoß:** Ein Multi-Stage Build und ein Volume lösen scheinbar sehr unterschiedliche Probleme – das eine verkleinert ein Image, das andere bewahrt Daten. Welches gemeinsame Grundprinzip steckt dahinter, und warum ist dieses Prinzip für produktionsreife Container so wichtig?