CommandGate
# 🚀 Projektantrag / -beschreibung: **DevDeck – Das ultimative Developer Workspace Dashboard**

### 📝 Projektübersicht
Als Softwareentwickler startet man jeden Morgen mit denselben manuellen Abläufen: IDE öffnen, Docker-Container und Datenbanken hochfahren, Termine checken, Zoom-Links heraussuchen und die meistgenutzten Code-Snippets aus ungeordneten Textdateien kramen.

**DevDeck** setzt genau hier an und bündelt den gesamten Entwickler-Alltag in einer zentralen, geschützten Web-Applikation. Es ist ein maßgeschneidertes Command-Center, das nicht nur wichtige Informationen (Termine, E-Mails, Wetter) aggregiert, sondern über eine innovative Backend-Schnittstelle auch die **lokale Entwicklungsumgebung automatisiert steuert** (z. B. Projektstart in PhpStorm, Browser-Tabs und Datenbanken mit nur einem Klick). Zudem löst es das klassische "Notizzettel-Chaos" durch einen integrierten, durchsuchbaren Code-Snippet- und Notiz-Speicher ab.

---

### 🛠️ Technischer Stack
Um eine skalierbare Architektur mit hoher Performance und Typsicherheit zu garantieren, wird das Projekt als moderne Full-Stack-Anwendung umgesetzt:
* **Frontend:** Angular, Tailwind CSS (für ein cleanes, responsives Dashboard-Layout), RxJS (für reaktives State-Management)
* **Backend:** NestJS (REST API), TypeScript
* **Datenbank & ORM:** MariaDB, Prisma ORM
* **Sicherheit:** JWT-basierte Authentifizierung (JSON Web Tokens) & Passport.js zur Absicherung des Dashboards
* **Testing:** Vitest (Unit Tests für die Service-Schicht)

---

### 🎯 Kernfunktionen (Features)

1. **Workspace Automation (Das Highlight):** Über eine Integration des Node.js `child_process`-Moduls im NestJS-Backend können vordefinierte Entwicklungsumgebungen direkt aus dem Browser heraus gestartet werden (z. B. Öffnen eines bestimmten Projektordners in PhpStorm inklusive lokalem DB-Start).
2. **Meeting & Link-Manager:** Ein zentraler Hub für wichtige URLs. Zoom- oder Teams-Meetings können direkt per Klick nativ gestartet werden.
3. **Smart Code-Snippets (Quick-Snip):** Ein persönlicher, durchsuchbarer Speicher für häufig genutzte Code-Fragmente inklusive Syntax-Highlighting und einem "Click-to-Copy"-Feature in die Windows-Zwischenablage.
4. **Agiles Notiz- & Aufgaben-Modul:** Ein kachelbasiertes Notizsystem mit Tagging-Funktion (z. B. Sortierung nach Projekten) gekoppelt mit einer interaktiven ToDo-Liste zum produktiven Abhaken.
5. **Information Aggregation Widgets:** Anzeige von Echtzeit-Daten wie Uhrzeit, aktuellen Wetterdaten (via OpenWeatherMap-API) und einer Übersicht der neuesten E-Mails/Termine.
6. **Secure Gate (Auth):** Eine vorgeschaltete Login-Komponente (geschützt durch Guards im Frontend und JWT-Validierung im Backend), um den Zugriff auf die internen Skripte und Daten zu blockieren.

---

### 🏁 Lernziele für das Juli-Recap
* Vertiefung der **Angular-Architektur** (Komponenten-Kommunikation, Services, HTTP-Interceptor, RxJS-Datenströme).
* Beherrschung von fortgeschrittenen **NestJS-Konzepten** (Custom Guards, Ausführung von Systembefehlen, saubere Modul-Strukturierung).
* Sicheres relationales **Datenbankdesign** mit MariaDB und Prisma.
* Implementierung einer robusten **Sicherheits-Infrastruktur** (Passwort-Hashing mit bcrypt, tokenbasierte Sessions).
* Konsequentes Schreiben von **Unit Tests mit Vitest** zur Absicherung der Business-Logik.