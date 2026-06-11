# Docker Basics – Setup

Docker ist kein einzelnes Programm, das einfach im Terminal gestartet wird. Der `docker`-Befehl ist lediglich ein schlanker Client. Die eigentliche Arbeit – Images bauen, Container starten, deren Zustand verwalten – übernimmt ein Hintergrunddienst namens **Docker Daemon**.

Ist dieser Hintergrunddienst offline, wirft das Terminal unweigerlich den Fehler `Cannot connect to the Docker daemon`. Damit das gesamte Ökosystem auf dem eigenen Rechner reibungslos läuft, wird **Docker Desktop** verwendet. Es bündelt das Kommandozeilenwerkzeug, den Daemon und eine schlanke Linux-VM in einer einzigen Anwendung. Da Container stark auf spezifische Linux-Kernel-Features angewiesen sind, benötigen sowohl macOS als auch Windows diese versteckte VM, um Container korrekt ausführen zu können.

---

## Der Docker Daemon

Ein Daemon ist ein Programm, das dauerhaft im Hintergrund läuft und auf Anfragen wartet – dasselbe Prinzip wie bei einem Webserver. Der Docker Daemon (der Prozess heißt `dockerd`) ist der Teil von Docker, der den gesamten Zustand hält: Er speichert Images, erstellt und überwacht Container und kommuniziert mit Registries wie Docker Hub.

Das `docker`-Kommandozeilenwerkzeug erledigt davon selbst nichts. Wenn `docker run` eingegeben wird, schickt der Client eine Anfrage über eine API an den Daemon – und der Daemon führt die Arbeit aus. Die Ausgabe im Terminal ist die Antwort des Daemons, die der Client nur weiterleitet.

---

## Installation

Den Installer gibt es direkt auf der offiziellen Docker-Desktop-Seite:

- [macOS](https://docs.docker.com/desktop/setup/install/mac-install/)
- [Windows](https://docs.docker.com/desktop/setup/install/windows-install/)

### Docker Desktop auf macOS

Es gibt zwei Builds: einen für Apple Silicon (M-Serie) und einen für Intel-Chips. Den passenden Build findet man über das Apple-Menü unter **Über diesen Mac**. Nach der Installation Docker aus dem Programme-Ordner starten. Beim ersten Start wird nach dem Passwort gefragt, da Docker erhöhte Rechte benötigt, um sein Netzwerk und die Linux-VM einzurichten.

### Docker Desktop auf Windows

Unter Windows stellt **WSL 2** (Windows Subsystem for Linux) die Linux-Umgebung für den Daemon bereit – ein Microsoft-Feature, das einen echten Linux-Kernel innerhalb von Windows ausführt. Der Docker-Desktop-Installer aktiviert WSL 2 automatisch, falls es noch nicht aktiv ist. Die Option **„Use WSL 2 instead of Hyper-V"** während der Installation bestätigen. Nach Abschluss der Installation kann ein Neustart von Windows erforderlich sein.

Zwei Dinge bereiten unter Windows häufig Probleme:

- **Virtualisierung im BIOS/UEFI:** Auf den meisten modernen Rechnern ist sie bereits aktiviert. Meldet Docker Desktop einen Fehler zur Virtualisierung, ist diese Einstellung die erste Anlaufstelle.
- **WSL 2-Update auf älteren Windows-Installationen:** Der Befehl `wsl --update` im Terminal bringt WSL 2 auf den aktuellen Stand.

Nach der Installation Docker Desktop über das Startmenü öffnen. Wie auf macOS gilt: Der Daemon ist nur verfügbar, solange Docker Desktop läuft.

---

## Verbindung prüfen

Sobald Docker Desktop geöffnet ist und im Hintergrund läuft, lässt sich im Terminal prüfen, ob der Client mit dem Daemon kommunizieren kann:

```bash
docker version
```

Die Ausgabe besteht aus zwei Abschnitten: **Client** und **Server**. Der Client-Abschnitt erscheint, sobald das Kommandozeilenwerkzeug installiert ist. Der Server-Abschnitt ist die Antwort des Daemons. Sind beide vorhanden, funktioniert die gesamte Kette. Erscheint der Client-Abschnitt, aber der Server-Abschnitt wird durch einen Verbindungsfehler ersetzt, ist die Installation in Ordnung – der Daemon läuft schlicht nicht. In diesem Fall Docker Desktop starten.

Um sicherzustellen, dass die Engine tatsächlich ein Image herunterladen und ausführen kann, den offiziellen Test-Container starten:

```bash
docker run hello-world
```

Der Daemon ruft Docker Hub auf, lädt ein winziges Test-Image herunter und führt es aus. Erscheint im Terminal die Ausgabe **„Hello from Docker!"**, funktioniert die gesamte Kette einwandfrei: Client, Daemon, Linux-VM und Netzwerkzugriff sind betriebsbereit.

> **Denkanstoß:** Der `docker`-Befehl ist nur ein Client, der Anfragen weiterleitet – die eigentliche Logik liegt im Daemon. Welche Vor- und Nachteile siehst du in dieser Client-Server-Architektur im Vergleich zu einem monolithischen Werkzeug, das alles selbst erledigt?

---

## Weiterführende Ressourcen

- [Install Docker Desktop on Mac](https://docs.docker.com/desktop/setup/install/mac-install/)
- [Install Docker Desktop on Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
- [Docker Desktop overview](https://docs.docker.com/desktop/)
- [WSL 2 documentation](https://learn.microsoft.com/en-us/windows/wsl/)