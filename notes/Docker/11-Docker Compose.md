# Docker Fortgeschrittene Konzepte – Docker Compose

Du kannst jetzt einen Container starten, ihm ein Volume geben, damit seine Daten überleben, und ihn in ein Netzwerk einbinden, damit er andere Container beim Namen erreicht. Der Arcade-Stack nutzt alle drei: den Scoreboard-Service, eine Postgres-Datenbank mit einem `pgdata`-Volume und ein Netzwerk, das beide verbindet. Diesen Stack von Hand zu starten ist eine Abfolge von Befehlen, die in der richtigen Reihenfolge mit den richtigen Flags ausgeführt werden muss. Netzwerk erstellen, Datenbank mit Volume und Passwort starten, dann den Scoreboard-Service im selben Netzwerk mit seinem Connection-String starten. Stoppen ist derselbe Tanz in umgekehrter Reihenfolge. Ein einziger falscher Flag – und der Scoreboard-Service findet die Datenbank nicht.

Das ist mühsam, und es ist auch leicht, dabei subtile Fehler zu machen – besonders für Teammitglieder, die die Befehle nicht selbst geschrieben haben. Das Setup lebt in deiner Shell-History oder einem README, was genau das „befolge diese Schritte manuell"-Problem ist, das Dockerfiles für den Image-Build gelöst haben. Compose löst es eine Ebene höher. Statt eines Dockerfiles, das ein einzelnes Image beschreibt, schreibst du eine **Docker Compose-Datei**, die einen ganzen Stack beschreibt: welche Services laufen, welche Images oder Build-Kontexte sie verwenden, welche Volumes sie einbinden, welche Umgebungsvariablen sie brauchen und wie sie voneinander abhängen.

Mit dieser Datei liest `docker compose up` sie aus und bringt alles in einem Schritt hoch. Compose erstellt ein Netzwerk für den Stack, startet die Container, mountet die Volumes und richtet die Umgebung ein – alles aus der Beschreibung in der Datei. `docker compose down` baut es genauso sauber wieder ab. Das gesamte Setup wird zu einer einzigen Datei, die du ins Repository committest – sodass jedes Teammitglied mit einem einzigen Befehl denselben Stack ausführt. Compose ist für die lokale Entwicklung gebaut, wo Frontend, Backend und Datenbank gemeinsam hochkommen müssen. Es ist kein Produktions-Orchestrator, aber für das Starten einer Multi-Container-App auf deiner Maschine beseitigt es fast das gesamte manuelle Verkabeln.

---

## Die Compose-Datei

Eine Compose-Datei ist YAML, benannt `compose.yaml` (oder `docker-compose.yml`, was noch akzeptiert wird). Sie beschreibt den Arcade-Stack so:

```yaml
services:
  scoreboard:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://arcade-master:arcade-password@db:5432/postgres
    depends_on:
      - db

  db:
    image: postgres:18
    environment:
      POSTGRES_USER: arcade-master
      POSTGRES_PASSWORD: arcade-password
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

Die Datei hat zwei Top-Level-Services – `scoreboard` und `db` – plus einen `volumes`-Block, der das Named Volume deklariert:

- `services` listet die Container auf, die den Stack bilden. Jeder Schlüssel darunter (`scoreboard`, `db`) ist ein Service, und sein Name ist später für das Networking relevant.
- `build: .` weist Compose an, das Scoreboard-Image aus dem Dockerfile im aktuellen Verzeichnis zu bauen – derselbe Build, den du im Multi-Stage-Kapitel manuell ausgeführt hast.
- `image: postgres:18` weist Compose an, für den `db`-Service ein fertiges Image zu pullen, statt eines zu bauen.
- `ports: - "3000:3000"` mappt einen Container-Port auf einen Host-Port, im `host:container`-Format aus den Basics. Der `db`-Service hat keinen `ports`-Eintrag, weil nichts auf deiner Maschine ihn direkt erreichen muss – der Scoreboard-Service erreicht ihn über das interne Netzwerk. Füge `- "5432:5432"` zum `db`-Service nur dann hinzu, wenn du dich von einem Host-Tool wie DBeaver aus verbinden möchtest.
- `environment` setzt Umgebungsvariablen im Service. Der Scoreboard-Service bekommt seine `DATABASE_URL`; Postgres bekommt `POSTGRES_PASSWORD` und `POSTGRES_USER`, die es benötigt.
- `depends_on: - db` weist Compose an, `db` vor `scoreboard` zu starten.
- `volumes: - pgdata:/var/lib/postgresql/data` mountet das Named Volume in die Datenbank, genau wie im Volumes-Kapitel. Der untergeordnete `volumes: pgdata:`-Block am Ende der Datei deklariert dieses Volume, damit Compose es erstellt und verwaltet.

Ein Detail bei `depends_on` sorgt häufig für Verwirrung: Es wartet darauf, dass der Datenbank-**Container** startet – nicht darauf, dass die Datenbank darin bereit ist, Verbindungen anzunehmen. Postgres braucht einen Moment zur Initialisierung, nachdem sein Container hochgefahren ist. Wenn der Scoreboard-Service sich im selben Moment verbindet, in dem der Container läuft, kann das noch fehlschlagen. Für echte Readiness füge dem `db`-Service einen Health Check hinzu und lass `scoreboard` von dieser Bedingung abhängen.

---

## Service-Namen und das Standard-Netzwerk

Compose erstellt automatisch ein Netzwerk für den Stack und hängt jeden Service daran. Das ist dasselbe User-defined-Network-Verhalten aus dem Networks-Kapitel – nur automatisch eingerichtet. Der Hostname, über den ein Service einen anderen erreicht, ist der **Service-Name** – der Schlüssel unter `services`.

Deshalb zeigt der Connection-String des Scoreboard-Service auf `db` (nicht auf `arcade-db` wie im Networks-Kapitel):

```
postgresql://arcade-master:arcade-password@db:5432/postgres
```

Im Networks-Kapitel hast du die Datenbank über den Container-Namen in einem manuell erstellten Netzwerk erreicht. Compose macht dasselbe, aber die Adresse ist der Service-Name aus der Datei. Benenne den Service um, und du änderst den Hostname.

---

## Den Stack verwalten

Führe diese Befehle aus dem Verzeichnis aus, das die Compose-Datei enthält:

| Befehl | Was er tut |
|---|---|
| `docker compose up` | Startet alle Services und streamt ihre Logs |
| `docker compose up -d` | Startet Services im Hintergrund (detached) |
| `docker compose up --build` | Baut Images neu, dann startet er |
| `docker compose down` | Stoppt und entfernt Container und Netzwerk |
| `docker compose down -v` | Entfernt auch die Named Volumes (löscht die Daten) |
| `docker compose ps` | Listet die laufenden Services auf |
| `docker compose logs -f` | Zeigt und folgt den Logs aller Services |
| `docker compose exec <service> <cmd>` | Führt einen Befehl in einem laufenden Service aus |
| `docker compose stop` | Stoppt Services ohne sie zu entfernen |

Beachte: `docker compose down` lässt deine Named Volumes in Ruhe – die Datenbank-Daten überstehen also ein `down` gefolgt von einem `up`. Nur `down -v` löscht die Volumes.

---

## Umgebungsvariablen und `.env`-Dateien

Das Passwort fest in die Compose-Datei zu schreiben ist für ein lokales Wegwerf-Setup in Ordnung, aber normalerweise willst du konfigurierbare Werte aus der versionierten Datei heraushalten. Compose liest eine Datei namens `.env` im Projektverzeichnis und ersetzt ihre Werte in der Compose-Datei über die `${VAR}`-Syntax.

Eine `.env`-Datei enthält einfache `KEY=value`-Zeilen:

```
POSTGRES_USER=arcade-master
POSTGRES_PASSWORD=arcade-password
PORT=3000
```

Die Compose-Datei referenziert dann diese Werte, statt sie auszuschreiben:

```yaml
environment:
  - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
  - PORT=${PORT}
```

Halte echte Secrets aus der Versionskontrolle heraus, indem du `.env` zu `.gitignore` hinzufügst – genauso wie du es für eine Anwendungs-Umgebungsdatei tun würdest. Um zu prüfen, ob die Ersetzung korrekt funktioniert hat, bevor du irgendetwas startest, führe `docker compose config` aus – das gibt die finale Compose-Datei mit allen aufgelösten Variablen aus.

---

## Ressourcen

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Compose File Reference](https://docs.docker.com/compose/compose-file/)
- [Awesome Compose Examples](https://github.com/docker/awesome-compose)

---

> **Denkanstoß:** `depends_on` sorgt dafür, dass Container in der richtigen Reihenfolge starten – aber nicht dafür, dass der Service darin wirklich bereit ist. Dieses Problem – „der Prozess läuft, aber der Service ist noch nicht ready" – taucht nicht nur bei Docker auf. Wo begegnet dir dasselbe Muster noch, und welche allgemeinen Lösungsansätze gibt es dafür?