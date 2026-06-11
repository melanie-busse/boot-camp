# Backend SQL Basics – SQLite

Die meisten relationalen Datenbanken laufen als eigenständiger Server-Prozess: Die Anwendung verbindet sich über einen Netzwerk-Socket mit ihm, authentifiziert sich mit Zugangsdaten und sendet Abfragen über diese Verbindung. Eine solche Datenbank einzurichten erfordert Installation, Konfiguration, Benutzerverwaltung und einen laufenden Server-Daemon. Für Produktionsanwendungen, die viele gleichzeitige Nutzer bedienen müssen, macht diese Architektur Sinn. Für das Erlernen von SQL und den Aufbau eines ersten Backends bedeutet sie erheblichen Mehraufwand, bevor man eine einzige Abfrage schreiben kann.

SQLite geht einen anderen Weg. Die gesamte Datenbank lebt in einer einzigen Datei auf der Festplatte, und die Datenbank-Engine ist eine Bibliothek, die die Anwendung direkt einbindet. Kein Server-Prozess, keine Netzwerkkonfiguration, keine Benutzerkonten. Man gibt einen Dateipfad an – und SQLite erledigt den Rest.

---

## Was SQLite anders macht

SQLite ist **serverlos**: Es läuft kein separater Prozess im Hintergrund. Die Anwendung liest und schreibt die Datenbankdatei direkt über die SQLite-Bibliothek. Die Datenbankdatei ist außerdem vollständig **portabel**: Auf eine andere Maschine kopiert, öffnet sie sich sofort.

SQLite ist **selbstständig und erfordert keinerlei Konfiguration** – über das Einbinden der Bibliothek hinaus sind keine Installationsschritte nötig. Außerdem unterstützt SQLite **ACID-Transaktionen**: Datenänderungen sind atomar, konsistent, isoliert und dauerhaft – auch nach Abstürzen.

Der Kompromiss liegt bei der **Schreib-Nebenläufigkeit**. Nur ein Prozess kann gleichzeitig in eine SQLite-Datenbank schreiben. Für ein lokales Einzelentwickler-Projekt oder ein internes Tool mit wenig Traffic ist das kein Problem. Für eine Produktionsanwendung, die Tausende gleichzeitiger Schreibanfragen verarbeitet, ist eine Client-Server-Datenbank wie PostgreSQL oder MySQL die richtige Wahl.

SQLite ist trotz dieser Einschränkungen weit verbreitet. Es ist die Standard-Einbettungsdatenbank auf Android und iOS und wird in Chrome, Firefox und macOS-Systemanwendungen ausgeliefert.

---

## Installation

**macOS:** SQLite ist vorinstalliert. Führe `sqlite3 --version` im Terminal aus, um das zu bestätigen. Für eine neuere Version kann SQLite mit Homebrew installiert werden:

```bash
brew install sqlite
```

**Windows:** Lade die vorkompilierten Binärdateien von der offiziellen SQLite-Download-Seite herunter. Entpacke das `sqlite-tools`-Zip, verschiebe den Inhalt in einen Ordner wie `C:\sqlite` und füge diesen Ordner zu deinem System-PATH hinzu. Öffne ein neues Terminal und führe `sqlite3 --version` aus, um die Einrichtung zu überprüfen.

---

## DB Browser

**DB Browser for SQLite** ist eine grafische Anwendung zum Inspizieren und Bearbeiten von SQLite-Datenbankdateien. Sie ermöglicht das Anzeigen von Tabellen, Durchsuchen von Zeilen, Ausführen von SQL-Abfragen und Untersuchen des Schemas – ohne eine Zeile Code zu schreiben. Das ist während der Entwicklung nützlich, um zu prüfen, ob die Anwendung tatsächlich korrekt in die Datenbank schreibt.

Lade DB Browser von der offiziellen Website herunter und installiere es. Sobald eine SQLite-Datenbankdatei erstellt wurde, kann sie direkt mit DB Browser geöffnet werden.

---

## Weiterführende Ressourcen

- [SQLite Download-Seite](https://www.sqlite.org/download.html)
- [DB Browser for SQLite](https://sqlitebrowser.org/dl/)