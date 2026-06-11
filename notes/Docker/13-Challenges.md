# Docker Fortgeschrittene Konzepte – Challenges

## Code-Along

Night Shift Arcade hat das Launch-Wochenende überstanden. Jetzt muss der Scoreboard-Service erwachsen werden: Er soll Punkte in einer echten Datenbank speichern, sie über Neustarts hinaus behalten, die Datenbank zuverlässig finden und als schlankes Image ausgeliefert werden. Du nimmst den Scoreboard-Service aus der Basics-Session und erweiterst ihn durch alle vier Advanced-Themen – eine Fähigkeit nach der anderen.

Jede Challenge baut auf der vorherigen auf. Führe einen Befehl aus, bestätige ein Ergebnis, dann weiter.

---

## Challenge 1: Den Scoreboard-Service mit einem Multi-Stage Build verkleinern

Schreibe das Dockerfile des Scoreboard-Service als Multi-Stage Build um und bestätige, dass das finale Image kleiner ist.

- Starte von einer TypeScript-Version des Scoreboard-Service, die ein Build-Script hat, das `src/` nach `dist/` kompiliert.
- Schreibe zuerst ein einstufiges Dockerfile (alle Dependencies installieren, bauen, starten), baue es und notiere die Größe mit `docker images`.
- Schreibe es als Multi-Stage Dockerfile um: eine `builder`-Stage, die alle Dependencies installiert und den Build ausführt, und eine Runtime-Stage, die nur `dist` und die Package-Dateien kopiert und Production-Dependencies mit `npm install --omit=dev` installiert.
- Baue das Multi-Stage Image:

```bash
docker build -t scoreboard-service:v2 .
```

### Checkpoint

- `docker images` zeigt `scoreboard-service:v2`.
- Das Multi-Stage Image ist merklich kleiner als das einstufige.

---

## Challenge 2: Die Arcade-Datenbank persistieren

Starte Postgres mit einem Named Volume und beweise, dass die Daten überleben, nachdem der Container entfernt wurde.

Erstelle ein Volume:

```bash
docker volume create pgdata
```

Starte Postgres mit dem Volume, das an seinem Datenverzeichnis gemountet ist:

```bash
docker run -d --name arcade-db \
  -e POSTGRES_PASSWORD=arcade \
  -v pgdata:/var/lib/postgresql/data \
  postgres
```

Verbinde dich und schreibe etwas. Öffne eine Shell im Container und erstelle eine Tabelle mit einer Zeile:

```bash
docker exec -it arcade-db psql -U postgres -c "CREATE TABLE scores (name text, points int); INSERT INTO scores VALUES ('PAC', 9001);"
```

Entferne den Container vollständig:

```bash
docker rm -f arcade-db
```

Starte einen neuen Container mit demselben Volume und lese die Zeile zurück:

```bash
docker run -d --name arcade-db \
  -e POSTGRES_PASSWORD=arcade \
  -v pgdata:/var/lib/postgresql/data \
  postgres
docker exec -it arcade-db psql -U postgres -c "SELECT * FROM scores;"
```

### Checkpoint

- Der `SELECT` gibt die Zeile `PAC, 9001` zurück, obwohl der ursprüngliche Container weg ist.

### Bonus: Bind Mount

Mounte einen Host-Ordner in einen Container und beobachte, wie Änderungen live synchronisiert werden.

```bash
mkdir local-data
echo "initial" > local-data/example.txt
docker run -it -v "$(pwd)/local-data:/data" ubuntu bash
```

Hänge im Container etwas an `/data/example.txt` an, verlasse den Container und prüfe die Datei auf dem Host. Unter Windows in Git Bash muss der Host-Pfad möglicherweise angepasst werden (siehe das Volumes-Kapitel zur Pfad-Übersetzung).

---

## Challenge 3: Den Scoreboard-Service über den Namen mit der Datenbank verbinden

Bringe beide Services in ein selbst erstelltes Netzwerk und erreiche die Datenbank über den Namen statt über eine IP.

Erstelle ein Netzwerk:

```bash
docker network create arcade-net
```

Starte die Datenbank darin:

```bash
docker run -d --name arcade-db --network arcade-net \
  -e POSTGRES_PASSWORD=arcade \
  -v pgdata:/var/lib/postgresql/data \
  postgres
```

Bestätige die Namensauflösung von einem anderen Container im selben Netzwerk:

```bash
docker run --rm --network arcade-net postgres \
  psql "postgresql://postgres:arcade@arcade-db:5432/postgres" -c "SELECT 1;"
```

### Checkpoint

- Die Abfrage verbindet sich über den Hostnamen `arcade-db` und gibt `1` zurück.

### Bonus: Isolation beweisen

Erstelle ein zweites Netzwerk, starte einen Container darin und bestätige, dass er `arcade-db` nicht erreichen kann:

```bash
docker network create lobby-net
docker run --rm --network lobby-net postgres \
  psql "postgresql://postgres:arcade@arcade-db:5432/postgres" -c "SELECT 1;"
```

Das sollte fehlschlagen, weil der Container in einem anderen Netzwerk als `arcade-db` ist.

---

## Challenge 4: Den gesamten Stack mit Compose hochfahren

Ersetze die manuellen Befehle durch eine einzige Compose-Datei, die Scoreboard-Service und Datenbank gemeinsam startet.

- Erstelle im Scoreboard-Projekt eine `compose.yaml` mit zwei Services: `scoreboard` (aus dem lokalen Dockerfile gebaut) und `db` (das `postgres:17`-Image mit dem `pgdata`-Volume). Zeige die `DATABASE_URL` des Scoreboard-Service auf den Service-Namen `db`.
- Verschiebe das Passwort und den Port in eine `.env`-Datei und referenziere sie in der Compose-Datei mit `${...}`.
- Validiere die aufgelöste Konfiguration:

```bash
docker compose config
```

- Baue und starte alles im Hintergrund:

```bash
docker compose up -d --build
```

- Öffne den Scoreboard-Service im Browser unter `http://localhost:3000` und bestätige, dass er sich mit der Datenbank verbindet.

### Checkpoint

- `docker compose ps` zeigt sowohl `scoreboard` als auch `db` als laufend.
- Der Scoreboard-Service erreicht die Datenbank über den Service-Namen `db` – ohne manuell eingetippte Netzwerk- oder `docker run`-Befehle.

Fahre den Stack herunter, starte ihn wieder hoch und bestätige, dass die Punkte noch vorhanden sind:

```bash
docker compose down
docker compose up -d
```

### Checkpoint

- Nach `down` und `up` bleiben die Daten erhalten, weil `down` ohne `-v` das Named Volume behält.