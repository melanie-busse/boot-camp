# Docker Fortgeschrittene Konzepte – Docker Volumes

In den Basics wurden Container als wegwerfbar behandelt – und das war der Punkt. Du konntest einen Container stoppen, entfernen, einen neuen aus demselben Image starten und jedes Mal ein identisches Ergebnis bekommen. Das funktioniert, solange der Container nur Code ausführt. Es funktioniert nicht mehr, sobald der Container Daten enthält, die du behalten möchtest.

Der Scoreboard-Service stößt gleich an genau diese Grenze. Sobald er Spielerpunkte in einer Datenbank speichert, leben diese Punkte im Filesystem des Containers. Das Filesystem eines Containers gehört zum Container: wenn du `docker rm` ausführst, verschwindet es mit. Starte den Datenbank-Container nach einem Absturz neu, und alle Punkte sind weg – weil der neue Container vom originalen Image startet, das nie irgendwelche Punkte enthielt. Das ist so gewollt: Ein Container soll ersetzbar sein, und „ersetzbar" und „merkt sich Dinge" ziehen in entgegengesetzte Richtungen.

Docker löst das, indem die Daten **außerhalb** des Containers aufbewahrt werden. Statt ins eigene Filesystem des Containers zu schreiben, zeigst du einen Pfad im Container auf einen separaten Speicher, den Docker unabhängig verwaltet. Der Container kann kommen und gehen – der Speicher bleibt. Wenn ein neuer Container denselben Speicher einbindet, liegen die Daten genau dort, wo der alte sie gelassen hat. Diese Trennung übersteht nicht nur Neustarts. Sie erlaubt es dir, die Daten zu sichern, indem du einen einzigen bekannten Ort sicherst – und sie erlaubt es zwei Containern, dieselben Dateien zu teilen, wenn das gewünscht ist.

Docker bietet drei Wege, externen Speicher an einen Container anzuhängen. Der Unterschied liegt hauptsächlich darin, wo die Daten physisch liegen und wer sie kontrolliert. Meistens willst du den ersten – einen **Named Volume** – aber es hilft, alle drei zu kennen, damit du sie erkennst, wenn du `docker run`-Befehle und Compose-Dateien anderer liest.

---

## Die drei Storage-Typen

| Typ | Wo die Daten liegen | Typischer Einsatz |
|---|---|---|
| Named Volume | Ein von Docker verwalteter Ort unter `/var/lib/docker` | Datenbanken und alle Daten, die die App behalten muss |
| Bind Mount | Ein Ordner deiner Wahl auf der Host-Maschine | Source-Code oder lokale Dateien während der Entwicklung teilen |
| tmpfs | Der Arbeitsspeicher des Hosts, nie auf Disk geschrieben | Temporäre oder sensible Daten, die beim Stoppen verschwinden sollen |

Ein **Named Volume** ist Speicher, den Docker erstellt und unter einem Namen verwaltet. Es ist egal, wo auf der Disk er liegt; du referenzierst ihn über seinen Namen, und Docker kümmert sich um den Rest. Das ist die Standardwahl für Anwendungsdaten wie eine Datenbank.

Ein **Bind Mount** mappt einen bestimmten Ordner von der Host-Maschine direkt in den Container. Beide Seiten sehen dieselben Dateien in Echtzeit – eine Änderung auf dem Host erscheint sofort im Container und umgekehrt. Das ist nützlich während der Entwicklung, wenn der Container Code-Änderungen aufnehmen soll, ohne einen neuen Build zu erfordern.

Ein **tmpfs-Mount** speichert Daten im Arbeitsspeicher des Hosts statt auf Disk. Er ist schnell – und verschwindet vollständig, wenn der Container stoppt, da Arbeitsspeicher nicht persistent ist. Das macht ihn zum Gegenteil eines Volumes: Du greifst zu `tmpfs`, wenn du die Daten gerade *nicht* behalten willst – zum Beispiel ein Scratch-Bereich für temporäre Dateien oder ein Secret, das nie auf Disk landen soll.

---

## Mit Named Volumes arbeiten

Ein Named Volume hat seinen eigenen Lebenszyklus, unabhängig von jedem Container. Diese Befehle erstellen und inspizieren einen:

```bash
docker volume create pgdata
docker volume ls
docker volume inspect pgdata
docker volume rm pgdata
```

- `docker volume create pgdata` erstellt ein Volume namens `pgdata`. Docker erstellt ein Volume auch automatisch, wenn du zum ersten Mal eines einbindest, das noch nicht existiert – dieser Befehl ist also optional.
- `docker volume ls` listet alle Volumes auf deiner Maschine auf.
- `docker volume inspect pgdata` gibt die Details des Volumes aus, einschließlich des Speicherorts auf der Disk.
- `docker volume rm pgdata` löscht das Volume und die Daten darin. Das ist der einzige Befehl hier, der Daten vernichtet – und er funktioniert nur, wenn kein Container das Volume gerade verwendet.

Um ein Volume an einen Container anzuhängen, verwendest du den Flag `-v` in der Form `volume-name:/pfad/im/container`:

```bash
docker run -v pgdata:/var/lib/postgresql/data postgres
```

- `pgdata` ist der Volume-Name links vom Doppelpunkt.
- `/var/lib/postgresql/data` ist der Pfad im Container rechts davon.

Alles, was der Container unter `/var/lib/postgresql/data` schreibt, wird im Volume `pgdata` gespeichert statt im eigenen Filesystem des Containers. Entferne den Container – das Volume bleibt. Starte einen neuen Container mit demselben `-v pgdata:/var/lib/postgresql/data`, und er sieht dieselben Daten.

---

## Bind Mounts und Host-Pfade

Ein Bind Mount verwendet denselben `-v`-Flag, aber die linke Seite ist ein Pfad auf dem Host statt eines Volume-Namens:

```bash
docker run -v "$(pwd)/local-data:/data" ubuntu bash
```

Docker unterscheidet zwischen Volume und Bind Mount anhand der linken Seite: ein einfacher Name bedeutet Named Volume, ein Pfad bedeutet Bind Mount. Der Host-Pfad muss absolut sein, weshalb das Beispiel `$(pwd)` verwendet, um das aktuelle Verzeichnis auf seinen vollen Pfad zu expandieren, statt einen relativen Pfad wie `./local-data` zu schreiben.

Host-Pfade sind der Punkt, an dem plattformübergreifende Unterschiede auftauchen. Unter macOS und Linux reicht `$(pwd)`. Unter Windows in Git Bash kann die Shell Unix-artige Pfade umschreiben und den Mount beschädigen; du siehst manchmal Beispiele, die einen Slash voranstellen (`/$(pwd)/local-data`) oder `MSYS_NO_PATHCONV=1` setzen, um dieses Umschreiben zu verhindern. Wenn sich ein Bind Mount unter Windows seltsam verhält, ist die Pfad-Übersetzung die erste Sache, die du prüfen solltest.

---

## tmpfs-Mounts

Ein tmpfs-Mount verwendet seinen eigenen Flag `--tmpfs` mit nur einem Pfad im Container. Auf der Host-Seite gibt es nichts, weil die Daten nie die Host-Disk erreichen – sie leben im Speicher:

```bash
docker run --tmpfs /app/cache scoreboard-service:v2
```

- `--tmpfs /app/cache` mountet ein In-Memory-Filesystem unter `/app/cache` im Container.

Alles, was der Scoreboard-Service in `/app/cache` schreibt, lässt sich schnell lesen und schreiben – und ist in dem Moment weg, wenn der Container stoppt. Das ist der Sinn: Ein tmpfs-Mount ist für Daten, die du nicht behalten willst. Ein Scratch-Verzeichnis für temporäre Dateien passt genau, und ebenso ein Secret, das nie auf Disk landen soll. Anders als bei einem Named Volume gibt es kein separates Objekt, das erstellt, aufgelistet oder entfernt werden muss – weil nichts davon bestehen bleibt.

---

## Die Arcade-Datenbank persistieren

Alles zusammen für Night Shift Arcade: Der Scoreboard-Service braucht eine Postgres-Datenbank, deren Daten Neustarts überstehen. Starte Postgres mit einem Named Volume, der an dem Verzeichnis gemountet wird, das Postgres für seine Dateien verwendet:

```bash
docker run -d \
  --name arcade-db \
  -e POSTGRES_PASSWORD=arcade \
  -v pgdata:/var/lib/postgresql/data \
  postgres
```

- `-d` führt den Container im Hintergrund aus, wie in den Basics.
- `--name arcade-db` gibt dem Container einen Namen, auf den du später verweisen kannst.
- `-e POSTGRES_PASSWORD=arcade` setzt das Datenbank-Passwort über eine Umgebungsvariable, die das offizielle Postgres-Image erfordert.
- `-v pgdata:/var/lib/postgresql/data` mountet das Volume `pgdata` an dem Pfad, wo Postgres seine Datenbank-Dateien ablegt.

Mit diesem Setup bleiben die Datenbank-Daten über Container-Neustarts hinaus erhalten.

---

## Ressourcen

- [Storage overview – Docker Docs](https://docs.docker.com/storage/)
- [Volumes – Docker Docs](https://docs.docker.com/storage/volumes/)
- [Bind mounts – Docker Docs](https://docs.docker.com/storage/bind-mounts/)

---

> **Denkanstoß:** Named Volume, Bind Mount und tmpfs lösen scheinbar dasselbe Problem – Daten außerhalb des Containers halten – verfolgen dabei aber gegensätzliche Ziele. Woran erkennst du in einem neuen Projekt, welcher der drei Typen der richtige ist? Und wann wäre es ein Fehler, einen Named Volume zu wählen, obwohl er der "Default" ist?