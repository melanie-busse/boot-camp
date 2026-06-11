# 🌐 Backend Express Advanced: Umgebungsvariablen (Environment Variables)

Selbst in kleinen Express-Projekten gibt es Werte, die sich je nach Umgebung (Environment) ändern sollten, ohne dass du dafür den Quellcode bearbeiten musst. Der Server-Port ist dafür das klassische erste Beispiel. Während der Entwicklung nutzt du vielleicht Port 3000, während eine Hosting-Plattform in der Produktionsumgebung (Production) einen ganz anderen Port injiziert. API-Keys, Database-URLs und Feature-Flags folgen demselben Muster. Tatsächlich solltest du deine Geheimnisse (Secrets) niemals mit deinem Quellcode in die Versionsverwaltung einchecken. Umgebungsvariablen lösen dieses Problem, indem sie die Konfiguration außerhalb des Anwendungscodes verlagern.

Die wichtigste Grundidee lautet: Der Code bleibt exakt derselbe, aber die Umgebung um ihn herum ändert sich. Deine App liest die Konfiguration zur Laufzeit über process.env aus. Dadurch kannst du dasselbe Projekt lokal, in Tests und in der Produktion mit jeweils unterschiedlichen Werten ausführen.

---

## 📥 Werte aus process.env auslesen

In Node.js sind Umgebungsvariablen über das globale Objekt process.env verfügbar. Jeder ausgelesene Wert kommt entweder als string oder als undefined zurück.

Beispiel-Code:
--------------------------------------------------
import express from "express";
const app = express();

const port = process.env.PORT || "3000";

app.listen(Number(port), () => {
console.log(`Server is listening on port ${port}`);
});
--------------------------------------------------

Dieses Beispiel erledigt zwei Dinge:
1. Es versucht, den Wert PORT aus der Umgebung zu lesen.
2. Es fällt auf den Standardwert "3000" zurück (Fallback), falls PORT nicht definiert ist.

Hinweis: Die Konvertierung des Wertes mit Number(...) ist nützlich, da app.listen() einen numerischen Port als Datentyp erwartet.

---

## 💾 Laden einer lokalen .env-Datei

Technisch gesehen können wir ein Skript starten, indem wir die Umgebungsvariablen direkt an den Anfang des Terminal-Befehls stellen:

Befehl: PORT=4000 node dist/index.js

Das Eintippen von Umgebungsvariablen in das Terminal bei jedem einzelnen Start wird jedoch schnell anstrengend – erst recht, wenn viele Variablen dazukommen. Eine .env-Datei bietet dir einen lokalen Platz, um diese Variablen während der Entwicklung bequem zu speichern:

Inhalt der .env:
--------------------------------------------------
PORT=3000
API_KEY=your-very-secret-key-here
DATABASE_URL=mongodb://localhost:27017/myapp
--------------------------------------------------

Es gibt zwei gängige Wege, diese Datei in deine Anwendung zu laden:

### Ansatz A: Der native Node.js Weg (empfohlen ab Node.js 20.6)
Wenn dein Projekt auf Node.js Version 20.6 oder neuer läuft, bringt Node ein eingebautes Flag mit:

Befehl: node --env-file=.env dist/index.js

Das funktioniert genauso mit dem TypeScript-Runner tsx:

Befehl: tsx --env-file=.env src/index.ts

In deiner package.json sehen die Skripte dann wie folgt aus:

--------------------------------------------------
{
"scripts": {
"start": "node --env-file=.env dist/index.js",
"dev": "tsx watch --env-file=.env src/index.ts"
}
}
--------------------------------------------------

---

### Ansatz B: Das dotenv-Paket (für ältere Setups)
Bevor Node.js das --env-file-Flag hinzugefügt hat, war das npm-Paket dotenv der absolute Standard. Es erfüllt genau denselben Zweck: Es liest eine .env-Datei aus und befüllt damit process.env. Du wirst diesem Paket in vielen bestehenden Codebasen begegnen, die vor der nativen Integration entstanden sind oder ältere Node.js-Versionen unterstützen müssen.

Installiere es als reguläre Dependency:
Befehl: npm install dotenv

Importiere und aktiviere es dann ganz oben in deiner Einstiegsdatei (Entry File), noch bevor irgendein anderer Code auf process.env zugreift:

--------------------------------------------------
import "dotenv/config"; // Lädt und injiziert die Variablen sofort!
import express from "express";

const app = express();
const port = process.env.PORT || 3000;
--------------------------------------------------

Wichtig: Die Zeile import "dotenv/config" muss zwingend vor jedem Code stehen, der process.env ausliest. Andernfalls sind die Variablen zu dem Zeitpunkt, an dem du sie abfragst, noch undefined.

---

## ⚖️ Wann nutzt man native --env-file und wann dotenv?

In realen Projekten wirst du beide Ansätze sehen:
* Nutze --env-file, wenn deine Laufzeitumgebung (Runtime) modern genug ist und du die Anzahl externer Dependencies minimieren möchtest.
* Nutze dotenv, wenn die Codebasis bereits darauf aufbaut oder du ältere Node.js-Versionen unterstützen musst. Auch wenn der native Parameter der neue Standard ist, bleibt dotenv extrem populär.

---

## 🛡️ Geheimnisse (Secrets) aus Git heraushalten

Eine .env-Datei enthält oft sensible Daten (Passwörter, API-Keys). Diese Datei darf NIEMALS in dein Git-Repository eingecheckt werden.

Füge sie daher zwingend zu deiner .gitignore hinzu:

--------------------------------------------------
# .gitignore
node_modules/
dist/
.env
--------------------------------------------------

### Die .env.example-Datei als Lösung
Damit andere Teammitglieder wissen, welche Variablen die App benötigt, erstellst du eine .env.example-Datei mit Platzhaltern und checkst diese ein:

--------------------------------------------------
# .env.example
PORT=3000
API_KEY=
DATABASE_URL=
--------------------------------------------------

Diese Datei kann sicher committet werden. Sie dokumentiert die erwarteten Variablen, ohne echte Geheimnisse zu verraten. Wenn ein neues Teammitglied das Repository klont, kopiert es einfach die .env.example zu einer neuen .env-Datei, trägt die echten Werte ein und kann die Anwendung sofort starten.

Achtung: Wenn du versehentlich eine .env-Datei mit echten Secrets committet hast, reicht es nicht aus, sie nachträglich in die .gitignore einzutragen. Die Datei existiert weiterhin in deiner Git-Historie! Sofern du den Fehler nicht bemerkst, bevor du pushst, musst du die betroffenen Anmeldedaten zwingend austauschen (neue API-Keys generieren, Passwörter ändern) und die alten Daten als kompromittiert betrachten.

---

## 🔗 Ressourcen
* Node.js process.env Dokumentation: https://nodejs.org/api/process.html#processenv
* Node.js --env-file Dokumentation: https://nodejs.org/api/cli.html#--env-filefile
* dotenv auf npm: https://www.npmjs.com/package/dotenv