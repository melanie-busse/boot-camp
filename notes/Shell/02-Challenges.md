# Aufgaben: Shell-Grundlagen

## Computer-Setup

Lass uns die Software installieren und konfigurieren, die du während dieses Bootcamps verwenden wirst.

Folge dem [Setup-Leitfaden](https://github.com/wd-bootcamp/web-setup/blob/main/computer-setup.md) im web-setup-Repository.

---

## Bootcamp-Ordner

(Schwierigkeit: 🔥)

Um alles, was für das Bootcamp benötigt wird, an einem Ort zu haben, erstellen wir eine allgemeine Ordnerstruktur, die wir in den kommenden Monaten verwenden werden!

- Öffne dein iTerm/Git Bash und navigiere in dein Home-Verzeichnis (es heißt `~` und sollte dein Standardspeicherort beim Öffnen eines neuen Terminalfensters sein).
- Erstelle einen neuen Ordner namens `web-bootcamp`.
- Wechsle in diesen Ordner und erstelle zwei weitere Ordner namens `web-challenges` und `session-notebook`.

Die Ordnerstruktur sollte nun ungefähr so aussehen:

```
~
|- Downloads
|- Pictures
|- web-bootcamp
   |- web-challenges
   |- session-notebook
|- ...
```

Der Ordner `web-bootcamp` wird das Zuhause für alle Projekte sein, die du während des Bootcamps erstellst. `web-challenges` enthält alle Aufgaben, an denen du während der Sessions arbeitest. In `session-notebook` kannst du deine Notizen zu bestimmten Sessions sammeln. Jetzt bist du bereit, die ersten Aufgaben anzugehen. 💪

---

## Schatzsuche

(Schwierigkeit: 🔥🔥)

Öffne dein Terminal und navigiere in den Ordner `web-challenges`. Verwende den folgenden Befehl, um die Aufgabendateien herunterzuladen:

> 💡 Dieser Befehl wird dich um Erlaubnis bitten, `ghcd` herunterzuladen. Das ist ein Tool, das wir verwenden, um Aufgaben von GitHub auf deinen Computer zu laden. Drücke Enter, um den Download zu bestätigen.

```
npx ghcd@latest wd-bootcamp/web-exercises/tree/main/sessions/shell-basics/treasure-hunt
```

Sobald der Download abgeschlossen ist, navigiere mit dem Befehl `cd` in den Ordner `shell-basics_treasure-hunt`. Jetzt beginnt die eigentliche Herausforderung.

Finde den verlorenen Diamanten des alten Monarchen von Treasure Island! Navigiere durch Treasure Island nur mithilfe des Terminals und finde den Schatz.

Verwende folgende Befehle:

- `cd` – Verzeichnis wechseln
- `cd ..` – einen Ordner nach oben wechseln
- `ls` – Dateien im aktuellen Ordner auflisten
- `cat <dateiname>` – Inhalt einer Datei anzeigen
- `pwd` – aktuellen Verzeichnispfad anzeigen

Viel Erfolg! 💎

---

## Notizen-Projekt

(Schwierigkeit: 🔥🔥)

Erstelle die folgende Dateistruktur in einem neuen Ordner innerhalb deines `web-challenges`-Ordners (mit `mkdir`, `touch` und `cd`):

```
notes
├── released
│   └── public
│   │   └── trash.txt
│   ├── announcement1.txt
│   └── announcement2.txt
└── unreleased
    ├── announcement3.txt
    └── private
        ├── notes1.txt
        └── notes2.txt
```

Aktualisiere die Struktur auf folgende (mit `mv`, `rm` und `cd`):

```
notes
├── private
│   ├── notes1.txt
│   └── notes2.txt
└── public
    ├── released
    │   ├── announcement1.txt
    │   └── announcement2.txt
    └── unreleased
        └── announcement3.txt
```

> 💡 (Nur für Mac-Nutzer): Du kannst den Befehl `tree` verwenden, um die Dateistruktur im Terminal anzuzeigen. Das `tree`-Kommandozeilentool wurde mit dem `web-setup`-Skript installiert.