# Shell-Grundlagen

## Lernziele

- Verstehen, was Terminal und Shell sind
- Das Dateisystem mithilfe der Shell und des Terminals navigieren
- Dateien und Ordner im Dateisystem erstellen, umbenennen, entfernen und verschieben

---

## Shell und Terminal

Wahrscheinlich bist du es gewohnt, mit GUIs (grafischen Benutzeroberflächen) mit Computern zu interagieren.

Entwickler interagieren häufig mit Computern über CLIs (Command Line Interfaces), also textbasierte Benutzeroberflächen. Das bedeutet, dass Befehle eingetippt werden, um mit dem Computer zu interagieren (Dateien erstellen / verschieben / löschen / bearbeiten, Software installieren, Systemeinstellungen ändern …).

Das hat folgende Gründe und Vorteile:

- Viele Tools haben keine GUI und können nur als CLI genutzt werden.
- Es lassen sich Skripte (bestehend aus einer Reihe von Befehlen) schreiben, um Prozesse und wiederkehrende Aufgaben zu automatisieren und sicherzustellen, dass sie bei jeder Ausführung auf genau dieselbe Weise ablaufen.

Auf macOS wird **zsh** (Z Shell) als Befehlsinterpreter verwendet. Standardmäßig läuft er in der Terminal-App. Für diesen Kurs verwenden wir iTerm und Visual Studio Code als alternative Terminal-Emulatoren.

Eine **Shell** (wie zsh) ist der Befehlsinterpreter, der Befehle auf dem Computer ausführt und Ergebnisse ausgibt.

Ein **Terminal** (wie Terminal, iTerm oder Visual Studio Code) ist eine Texteingabe- und -ausgabeumgebung (die ein Hardware-Computerterminal emuliert), die Befehle an die Shell sendet und deren Ausgabe anzeigt.

---

## Grundlegende Shell-Befehle

| Befehl | Funktion |
|---|---|
| `ls` | Inhalt des aktuellen Verzeichnisses auflisten |
| `cd <Ordnername>` | In einen Ordner wechseln |
| `cd ..` | In den übergeordneten Ordner wechseln |
| `cd ~` | In das Home-Verzeichnis wechseln |
| `pwd` | Den aktuellen Verzeichnispfad ausgeben |
| `touch beispiel.md` | Eine Datei namens „beispiel.md" erstellen |
| `mkdir neuerOrdner` | Einen Ordner namens „neuerOrdner" erstellen |
| `mv <altername> <neuername>` | Eine Datei verschieben oder umbenennen |
| `rm <dateiname>` | Eine Datei dauerhaft löschen (es gibt keinen Papierkorb zum Wiederherstellen!) |
| `open .` | Den aktuellen Ordner im Finder öffnen |
| `cat <dateiname>` | Den Inhalt einer bestimmten Datei ausgeben |
| `curl <url>` | Den empfangenen Inhalt der angegebenen URL ausgeben (probiere `curl ipinfo.io`) |

> 💡 Es gibt sehr viele Befehle für alle möglichen Aktionen. Schau dir dieses [Cheat Sheet](https://github.com/RehanSaeed/Bash-Cheat-Sheet) an, um wichtige Befehle nachzuschlagen.

---

## Weiterführende Links

- [Terminal-Grundlagen](https://support.apple.com/de-de/guide/terminal/welcome/mac)
- [Command Line Cheat Sheet](https://github.com/RehanSaeed/Bash-Cheat-Sheet)