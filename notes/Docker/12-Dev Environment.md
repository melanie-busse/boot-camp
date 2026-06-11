# Docker Fortgeschrittene Konzepte – Dev Environment

Bisher haben wir eine Container-Komposition erstellt, die für den Produktionseinsatz gedacht ist. Aber du willst auch, dass deine Entwicklungsumgebung für alle im Team identisch ist. Dafür brauchen wir ein zweites Setup: eine Docker Compose-Datei, die eine einheitliche Entwicklungsumgebung definiert.

Was du während der Entwicklung willst, ist eine Trennung zwischen dem Ort, an dem der Code geschrieben wird, und dem Ort, an dem er läuft. Der Editor, die Dateien und die Versionskontrolle bleiben auf deiner Maschine – dort sind sie schnell und vertraut. Die Runtime lebt im Container, wo sie für alle im Team identisch ist. Niemand installiert die richtige Node-Version oder ein lokales Postgres von Hand; alle teilen die im Docker-Setup definierten. Ein neues Teammitglied klont das Repository, startet den Stack und hat in Minuten statt einem Tag Setup eine funktionierende Umgebung.

---

## Den Service für die Entwicklung überschreiben

Um die Compose-Datei für die Entwicklung anzupassen, müssen wir nur einige wenige Einträge ändern. Die Compose-Datei zu duplizieren ist keine gute Idee. Stattdessen können wir beim Start des Stacks zwei Dateien referenzieren, wobei die Einträge der zweiten die der ersten überschreiben. So kannst du den produktionsnahen Stack in `compose.yaml` belassen und die Entwicklungsänderungen in einer separaten Datei `compose.dev.yaml` ablegen. Ein Development-Override für den Scoreboard-Service sieht so aus:

```yaml
# compose.dev.yaml
services:
  scoreboard:
    build:
      context: .
      target: builder
    command: npm run dev
    volumes:
      - .:/app
      - /app/node_modules
```

- `build.target: builder` stoppt den Build bei der `builder`-Stage aus dem Multi-Stage Dockerfile. Diese Stage hat noch die Dev-Dependencies und den TypeScript-Source-Code – genau das, was die Entwicklung braucht und was die Produktions-Runtime-Stage bewusst weggeworfen hat.
- `command: npm run dev` ersetzt das `CMD` des Images für die Produktion durch einen Watch-Befehl. Ein Watch-Befehl (zum Beispiel `tsx watch` oder `nodemon` hinter dem Dev-Script) kompiliert die App neu und startet sie neu, wenn sich eine Source-Datei ändert.
- `volumes: - .:/app` bind-mountet dein Projektverzeichnis in den Container – derselbe Bind-Mount-Mechanismus aus dem Volumes-Kapitel. Jetzt liest der Container die Dateien, die du bearbeitest: Ein Speichern auf deiner Maschine ist sofort im Container sichtbar, und der Watch-Befehl reagiert darauf.

Den Dev-Stack startest du mit folgendem Befehl, der sowohl die Basis-Compose-Datei als auch das Dev-Override angibt:

```bash
docker compose -f compose.yaml -f compose.dev.yaml up
```

Da die Basis-Datei bereits `ports`, `environment` und `depends_on` definiert, wiederholt das Override sie nicht. Port 3000 wird weiterhin veröffentlicht, `DATABASE_URL` gesetzt und die Datenbank zuerst gestartet.

---

## Die `node_modules` des Containers behalten

Die zweite Volume-Zeile – `- /app/node_modules` – sieht seltsam aus, weil sie keinen Host-Pfad hat. Sie ist dort, um ein Problem zu lösen, das der erste Bind-Mount erzeugt.

Wenn du dein gesamtes Projektverzeichnis über `/app` bind-mountest, wird `/app` im Container zu deinem Host-Ordner – einschließlich des `node_modules` deines Hosts (oder gar keinem `node_modules`, wenn du lokal nie `npm install` ausgeführt hast). Das verdeckt das `node_modules`, das das Image während des Builds installiert hat. Dependencies, die für die Linux-Umgebung des Containers kompiliert wurden, verschwinden und werden durch die des Hosts ersetzt, die möglicherweise fehlen oder für eine andere Plattform gebaut wurden.

Die Zeile `- /app/node_modules` ist ein anonymes Volume, das genau an diesem Pfad gemountet wird. Da es spezifischer ist als der `/app`-Bind-Mount, schichtet Compose es darüber – sodass `/app/node_modules` die eigenen installierten Module des Containers behält, während alles andere in `/app` von deiner Maschine kommt. Das Ergebnis: Dein Source-Code ist live gemountet, aber die Dependencies bleiben die, mit denen der Container gebaut wurde. Beachte: Wenn du jetzt eine Dependency auf deiner Maschine installierst, ist sie während des Builds oder der Runtime nicht verfügbar.

---

## Eine Dev-Datenbank verwenden

In der Produktion willst du ein Named Volume, das Daten zuverlässig über Neustarts hinweg persistiert und explizit verwaltet wird. In der Entwicklung willst du normalerweise das Gegenteil: eine Datenbank, die sauber startet, leicht zurückgesetzt werden kann und zwischen Sessions keinen Zustand ansammelt. Oft willst du auch andere Zugangsdaten, damit kein Risiko besteht, ein Dev-Tool versehentlich auf Produktionsdaten zu richten.

Das Datenbank-Service-Override sieht so aus:

```yaml
# compose.dev.yaml
services:
  scoreboard:
    build:
      context: .
      target: builder
    command: npm run dev
    volumes:
      - .:/app
      - /app/node_modules

  db:
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: devpassword
      POSTGRES_USER: devuser
      POSTGRES_DB: scoreboard_dev

volumes:
  postgres_dev_data:
```

Ein paar Dinge sind hier nennenswert:

**Der Volume-Tausch.** Die Basis-Datei `compose.yaml` deklariert ein Volume wie `postgres_data:/var/lib/postgresql/data`. Das Override ersetzt das durch `postgres_dev_data` – ein völlig separates Named Volume. Die beiden Umgebungen teilen nie Datenbankzustand, auch wenn du auf derselben Maschine zwischen ihnen wechselst.

**Das Volume auf oberster Ebene deklarieren.** Genau wie in der Basis-Datei muss jedes Named Volume, das unter einem Service referenziert wird, auch im Top-Level-`volumes:`-Block deklariert werden. Ohne diese Deklaration verweigert Compose den Start.

**Umgebungsvariablen überschreiben.** Der `environment`-Block in einem Override wird Key für Key mit der Basis zusammengeführt, anstatt den gesamten Block zu ersetzen. Du musst also nur die Keys auflisten, die du ändern möchtest. Die Basis-Datei setzt möglicherweise `POSTGRES_USER: postgres`, und das Override ändert es auf `devuser`; alle Keys, die das Override nicht erwähnt, bleiben wie in der Basis definiert.

Um die Datenbank zurückzusetzen, entferne einfach das Dev-Volume:

```bash
docker volume rm postgres_dev_data
```

---

## Die Compose-Befehle zu `package.json` hinzufügen

Die Compose-Befehle jedes Mal manuell einzutippen, wenn du deine Dev-Umgebung starten willst, ist lästig. Stattdessen kannst du sie zum `scripts`-Abschnitt der `package.json` hinzufügen:

```json
"scripts": {
  "docker:dev": "docker compose -f compose.yaml -f compose.dev.yaml up",
  "docker:dev:down": "docker compose -f compose.yaml -f compose.dev.yaml down",
  "docker:dev:reset": "docker volume rm postgres_dev_data",
  "docker:prod": "docker compose up",
  "docker:prod:down": "docker compose down"
}
```

Jetzt kann das gesamte Team einfach `npm run docker:dev` ausführen, um die Dev-Umgebung zu starten – ohne sich alle Docker-Befehle merken zu müssen.

---

## Ressourcen

- [Merge Compose files – Docker Docs](https://docs.docker.com/compose/multiple-compose-files/merge/)
- [Development Containers Specification](https://containers.dev/)
- [Dev Containers in VS Code](https://code.visualstudio.com/docs/devcontainers/containers)

---

> **Denkanstoß:** Das Override-Muster – eine Basis-Datei plus eine Erweiterungsdatei, die nur die Unterschiede enthält – taucht in vielen Bereichen der Softwareentwicklung auf. Wo begegnet dir dieses Prinzip noch? Und welchen Vorteil hat es gegenüber dem Ansatz, einfach zwei vollständige, separate Dateien zu pflegen?