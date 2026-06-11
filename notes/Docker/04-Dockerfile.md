# Docker Basics – Das Dockerfile

Jedes Projekt braucht eine initiale Einrichtung:

- Eine bestimmte Laufzeitumgebung installieren
- Konfigurationsdateien kopieren
- Paketmanager ausführen
- Den Server starten

Traditionell stehen diese Schritte in einer README-Datei. Eine Entwicklerin oder ein Entwickler liest sie, tippt sie ins Terminal – und hofft auf das Beste. Wird eine Zeile übersprungen, ein global installiertes Paket verwendet, das Konflikte verursacht, oder werden Befehle in falscher Reihenfolge ausgeführt, entsteht genau das „works on my machine"-Problem.

Ein Dockerfile ersetzt den Setup-Abschnitt der README durch etwas, das eine Maschine ausführen kann. Es ist eine reine Textdatei namens `Dockerfile` – ohne Dateiendung – die üblicherweise im Projektstamm liegt. Jede Zeile ist eine Anweisung, die Docker Engine liest sie von oben nach unten und erzeugt daraus ein Image. Weil die Anweisungen von Docker ausgeführt statt von einer Person befolgt werden, ist das Ergebnis auf jeder Maschine, jedes Mal gleich.

---

## Die wichtigsten Anweisungen

Die Syntax ist bewusst einfach gehalten. Eine Anweisung beginnt mit einem Schlüsselwort in Großbuchstaben (`FROM`, `COPY`, `RUN`), gefolgt von ihren Argumenten. Eine Handvoll dieser Schlüsselwörter deckt fast alles ab, was in frühen Projekten benötigt wird. Ein komplettes Betriebssystem muss dabei nicht von Grund auf beschrieben werden. Fast jedes Dockerfile startet von einem vorhandenen **Base Image**, das bereits ein Betriebssystem und eine Laufzeitumgebung enthält – und ergänzt nur das, was für die eigene Anwendung spezifisch ist: den Code, die Abhängigkeiten und den Startbefehl.

Das folgende Dockerfile ist auf eine typische Node.js-Anwendung zugeschnitten. Sechs Befehle genügen, um die App zu containerisieren:

```dockerfile
FROM node:26-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
ENV DB_PASSWORD=password123456
EXPOSE 3030:3000
CMD ["npm", "start"]
```

- **`FROM node:26-alpine`** wählt das Base Image aus, auf dem alles weitere aufbaut.
- **`WORKDIR /app`** legt den Arbeitsordner innerhalb des Images fest, in dem die folgenden Anweisungen ausgeführt werden. Der Ordner wird erstellt, falls er noch nicht existiert. Ohne diese Anweisung würden Dateien unkontrolliert im Root-Dateisystem des Images landen.
- **`COPY package*.json ./`** kopiert `package.json` (und dank des `*`-Wildcards auch `package-lock.json`) aus dem Projekt in das Arbeitsverzeichnis des Images. `COPY` kopiert immer aus dem Build-Kontext – dem Ordner, der `docker build` übergeben wurde – in das Image.
- **`RUN npm install --only=production`** führt einen Befehl innerhalb des Images während des Builds aus und installiert die in `package.json` gelisteten Abhängigkeiten. Das Flag `--only=production` überspringt Entwicklungsabhängigkeiten wie Test-Runner, die die laufende Anwendung nicht benötigt.
- **`COPY . .`** kopiert den Rest des Projekts – den eigentlichen Anwendungscode – in das Image.
- **`ENV DB_PASSWORD=password123456`** setzt eine Standard-Umgebungsvariable im Image. Anwendungen können sie zur Laufzeit auslesen, genau wie eine lokale `.env`-Datei. Dieser Wert kann beim Starten des Containers überschrieben werden.
- **`EXPOSE 3030:3000`** weist Docker an, Port 3030 des Hosts auf Port 3000 des Containers weiterzuleiten.
- **`CMD ["npm", "start"]`** definiert den Befehl, den ein Container beim Start ausführt. Die eckige-Klammer-Schreibweise ist ein JSON-Array: das erste Element ist das Programm, die weiteren sind seine Argumente.

Um zu verhindern, dass der `node_modules`-Ordner oder `.env`-Dateien vom Host in das Image kopiert werden, kann eine `.dockerignore`-Datei verwendet werden – sie funktioniert genau wie eine `.gitignore`-Datei.

---

## Base Images

Die `FROM`-Zeile steht immer an erster Stelle, denn jede weitere Anweisung modifiziert das dort genannte Image. Von einem leeren Image zu starten ist selten sinnvoll: Ein Betriebssystem und eine Node.js-Laufzeit von Hand zu installieren würde Dutzende von Anweisungen erfordern – ein längst gelöstes Problem. Stattdessen wird von einem offiziellen Image gestartet, das diese Arbeit bereits erledigt hat.

Der Name `node:26-alpine` besteht aus zwei Teilen:

- **`node`** ist der Image-Name – hier das offizielle Node.js-Image von Docker Hub.
- **`26-alpine`** ist der Tag. `26` fixiert die Node-Hauptversion, sodass ein Rebuild im nächsten Jahr weiterhin Node 26 verwendet, anstatt still auf eine neuere Version zu wechseln. `alpine` bezeichnet Alpine Linux, eine extrem schlanke, sicherheitsorientierte Linux-Distribution. Während Standard-Node.js-Docker-Images auf schwergewichtigeren Distributionen wie Debian basieren und 50–100 MB oder mehr wiegen können, ist die Alpine-Variante lediglich rund 5 MB groß – das macht Builds schnell und Images leichtgewichtig.

Eine Version im Tag zu fixieren ist wichtiger, als es auf den ersten Blick wirkt. `FROM node` ohne Tag bedeutet `node:latest`, und `latest` ändert sich mit der Zeit. Der eigentliche Sinn des Dockerfiles ist Reproduzierbarkeit – ein ungepinntes Base Image untergräbt sie still und heimlich.

---

## Build-Zeit vs. Start-Zeit

`RUN` und `CMD` sehen sich ähnlich – beide enthalten einen Befehl – und sie zu verwechseln ist der häufigste Anfängerfehler bei Dockerfiles.

- **`RUN`** wird ausgeführt, während das Image gebaut wird. Das Ergebnis – etwa der installierte `node_modules`-Ordner – ist fest im Image eingebacken. Eine `RUN`-Anweisung läuft einmal pro Build, nicht beim Start von Containern.
- **`CMD`** wird ausgeführt, wenn ein Container startet. Es läuft gar nicht während des Builds; es wird im Image als Standard-Startbefehl hinterlegt und bei jedem Container-Start ausgeführt.

Ein hilfreicher Test: Erzeugt der Schritt Dateien, die die App benötigt (installieren, kompilieren, herunterladen)? Dann gehört er in `RUN`. Ist es der Akt des Anwendungsstarts selbst? Dann ist es `CMD`. Ein Dockerfile kann viele `RUN`-Anweisungen enthalten, aber nur ein wirksames `CMD` – sind mehrere vorhanden, zählt nur das letzte.

---

## Build-Cache

`package.json` wird bewusst kopiert und `npm install` ausgeführt, bevor der restliche Anwendungscode kopiert wird. Das ist eine gezielte Strategie zur Beschleunigung von Builds.

Jede Anweisung in einem Dockerfile erzeugt einen eigenen **Layer**. Docker cached diese Layer. Bei einem Rebuild werden gecachte Layer von oben nach unten wiederverwendet, bis eine Änderung erkannt wird. Anwendungscode ändert sich ständig; Abhängigkeiten ändern sich selten. Indem der `npm install`-Schritt vor dem `COPY . .`-Schritt platziert wird, bleibt die aufwendige Abhängigkeitsinstallation sicher im Cache. Docker führt beim täglichen Entwickeln nur das schnelle Kopieren des Quellcodes neu aus. Würde alles in Zeile 3 kopiert, würde ein einzelner Tippfehler in einem Controller beim nächsten Build ein vollständiges, langsames `npm install` auslösen.

Diesen Cache muss man nicht aktiv verwalten. Anweisungen von „ändert sich selten" nach „ändert sich häufig" zu sortieren reicht aus, um davon zu profitieren.

> **Denkanstoß:** Die Layer-Reihenfolge im Dockerfile hat direkten Einfluss auf die Build-Performance. Welche anderen Setup-Schritte in einem typischen NestJS-Projekt würden ebenfalls von einer bewussten Positionierung weit oben im Dockerfile profitieren?

---

## Weiterführende Ressourcen

- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
- [Node.js official image on Docker Hub](https://hub.docker.com/_/node)
- [Docker build cache](https://docs.docker.com/build/cache/)