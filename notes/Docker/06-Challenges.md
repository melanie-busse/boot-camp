# Docker Basics – Aufgaben

## Code Along

Du bist der neue Platform Engineer bei **Night Shift Arcade**, einem Retro-Gaming-Studio, das sich auf ein globales Launch-Wochenende vorbereitet.

Dein Team hat drei Launch-Aufgaben:

- Den Scoreboard-Service verpacken, damit jede Entwicklermaschine dasselbe Setup ausführt
- Das öffentliche Leaderboard-Image auf Docker Hub veröffentlichen
- Einen lokalen MongoDB-Container für Spielerprofile starten

Deine Mission: Jedes dieser Teile containerisieren, damit der Launch-Tag nicht an Unterschieden zwischen Maschinen scheitert. Führe bei jedem Schritt einen Befehl aus und bestätige ein Ergebnis, bevor du weitermachst.

---

## Docker installieren

Installiere Docker Desktop auf deinem Rechner, wie im Setup-Kapitel beschrieben.

---

## Launch-Vorbereitung

Workspace erstellen und hineinwechseln:

```bash
mkdir scoreboard-service
cd scoreboard-service
```

---

## Teil 1: Scoreboard-Service (Dockerfile → Image → Container)

### Minimalistische Node-App erstellen

Erstelle eine Datei namens `package.json` und füge folgenden Inhalt ein:

```json
{
  "name": "scoreboard-service",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  }
}
```

Erstelle eine Datei namens `index.js` und füge folgenden Inhalt ein:

```js
console.log("Arcade scoreboard online: player queue synced.");
setInterval(() => {
  console.log("Heartbeat: scoreboard service still running.");
}, 30000);
```

### Dockerfile erstellen

Erstelle eine Datei namens `Dockerfile` und füge folgenden Inhalt ein:

```dockerfile
FROM node:26-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
CMD ["npm", "start"]
```

### Image bauen

```bash
docker build -t scoreboard-service:v1 .
```

Was dieser Befehl bedeutet:

- `build` weist Docker an, ein Image aus dem Dockerfile zu erstellen.
- `-t` steht für „tag" (gibt dem Image einen Namen).
- `scoreboard-service:v1` ist der Tag-Wert im Format `name:version`.
- `.` bedeutet „verwende den aktuellen Ordner als Build-Kontext" – also die Dateien, auf die Docker während des Builds zugreifen darf.

**Checkpoint**

- Der Build wird erfolgreich abgeschlossen
- `docker images` zeigt `scoreboard-service` mit dem Tag `v1`

### Container starten

```bash
docker run --name scoreboard-c1 -d scoreboard-service:v1
```

**Checkpoint**

- `docker ps` zeigt `scoreboard-c1` im laufenden Zustand
- Beendet sich der Container sofort, `index.js` speichern und das Image neu bauen: `docker build -t scoreboard-service:v1 .`

### Logs lesen

```bash
docker logs scoreboard-c1
```

Wenn bereits 30+ Sekunden vergangen sind und die Heartbeat-Meldung ohne ältere Ausgaben angezeigt werden soll:

```bash
docker logs --tail 5 scoreboard-c1
```

**Checkpoint**

- Die Logs enthalten `Arcade scoreboard online`
- Nach ca. 30 Sekunden enthalten die Logs `Heartbeat: scoreboard service still running.`

### Container stoppen und entfernen

```bash
docker stop scoreboard-c1
docker rm scoreboard-c1
```

**Checkpoint**

- `docker ps --all` listet `scoreboard-c1` nicht mehr auf

---

## Teil 2: Workflow-Drill (build, run, pull, push)

### Öffentliches Image pullen

```bash
docker pull postgres
```

Was dieser Befehl bedeutet:

- `pull` lädt ein Image aus einer Registry herunter (standardmäßig Docker Hub).
- `postgres` ist der Name des herunterzuladenden Images.

**Checkpoint**

- `docker images` listet `postgres` auf

### Postgres lokal starten

```bash
docker run --name arcade-postgres -d -p 5432:5432 postgres
```

**Checkpoint**

- `docker ps` zeigt `arcade-postgres`
- Das Port-Mapping enthält `5432->5432`

### Container inspizieren

```bash
docker inspect arcade-postgres
```

**Checkpoint**

- Die Ausgabe enthält `"Name": "/arcade-postgres"`

### Stoppen und entfernen

```bash
docker stop arcade-postgres
docker rm arcade-postgres
```

---

## Teil 3: Leaderboard-Release (Docker-Hub-Roundtrip)

Das gleiche Projekt wird als öffentlicher Leaderboard-Service wiederverwendet und veröffentlicht.

### Lokales Image für Docker Hub taggen

```bash
docker tag scoreboard-service:v1 <dein-dockerhub-benutzername>/arcade-leaderboard:v1
```

Was dieser Befehl bedeutet:

- `tag` erstellt einen weiteren Namen für ein vorhandenes lokales Image.
- `scoreboard-service:v1` ist das Quell-Image.
- `<dein-dockerhub-benutzername>/arcade-leaderboard:v1` ist das Format `repository/tag`, das Docker Hub erwartet.

### Image pushen

```bash
docker push <dein-dockerhub-benutzername>/arcade-leaderboard:v1
```

**Checkpoint**

- Der Push wird ohne Fehler abgeschlossen

### Eine frische Maschine simulieren

```bash
docker image rm <dein-dockerhub-benutzername>/arcade-leaderboard:v1
docker pull <dein-dockerhub-benutzername>/arcade-leaderboard:v1
docker rm -f leaderboard-c1
docker run --name leaderboard-c1 -d <dein-dockerhub-benutzername>/arcade-leaderboard:v1
```

**Checkpoint**

- `docker ps` zeigt `leaderboard-c1`

### Aufräumen

```bash
docker stop leaderboard-c1
docker rm leaderboard-c1
```

---

## Bonus: Deine Cyber-Chat-App containerisieren

Erstelle ein Docker-Image für deine Cyber-Chat-App. Achte dabei darauf, alle erforderlichen Abhängigkeiten einzubeziehen.

Zwei weiterführende Fragen zum Nachdenken:

- Wie lassen sich die Umgebungsvariablen aus der `.env`-Datei herauslösen und stattdessen beim Starten des Containers übergeben?
- Wie kannst du sicherstellen, dass die API von außerhalb des Containers erreichbar ist?