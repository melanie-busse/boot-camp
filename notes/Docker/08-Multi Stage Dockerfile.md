# Docker Fortgeschrittene Konzepte – Multi-Stage Dockerfile

In den Basics hast du ein einstufiges Dockerfile geschrieben: ein `FROM`, Abhängigkeiten installieren, Code kopieren, einen Startbefehl setzen. Das funktioniert – aber es bündelt zwei Jobs, die nichts miteinander zu tun haben, in dasselbe Image. Der eine Job ist das **Bauen** der App: alle Abhängigkeiten installieren, kompilieren, alles ausführen, was aus dem Source-Code etwas Lauffähiges macht. Der andere Job ist das **Ausführen**. Der Build-Job braucht Compiler, Typdefinitionen und Development-Dependencies. Der Run-Job braucht davon nichts. Wenn beides in einer Stufe passiert, landet der gesamte Build-Ballast im Image, das du auslieferst.

Das wird relevant, sobald der Scoreboard-Service in TypeScript geschrieben ist. TypeScript läuft nicht direkt mit Node; es muss zuerst zu JavaScript kompiliert werden – was bedeutet, dass das Image den TypeScript-Compiler und die dazugehörigen `devDependencies` braucht. Ein einstufiges Image würde den Compiler, die Type-Pakete und die originalen `.ts`-Quelldateien in die Produktion mitschleppen – obwohl die laufende App davon nichts anfasst. Das Image ist größer als nötig und legt mehr offen als nötig.

Ein **Multi-Stage Dockerfile** trennt diese beiden Jobs innerhalb einer einzigen Datei. Du schreibst mehr als eine `FROM`-Anweisung, und jedes `FROM` startet eine neue Stage mit einem eigenen, leeren Filesystem. Die erste Stage erledigt die aufwändige Build-Arbeit. Die zweite Stage startet frisch und kopiert nur das fertige Ergebnis – den kompilierten `dist`-Ordner – hinein, und lässt Compiler und Source-Code zurück. Docker führt während des Builds alle Stages aus, behält am Ende aber nur die letzte als finales Image. Alles aus früheren Stages wird verworfen, sobald ihre Ausgabe weiterkopiert wurde. Das Ergebnis ist ein kleineres Image, das die laufende App und ihre Production-Dependencies enthält – und nichts von der Werkbank, auf der sie gebaut wurde.

---

## Die Build-Stage

Hier ist ein Multi-Stage Dockerfile für die TypeScript-Version des Scoreboard-Service. Die erste Stage kompiliert die App:

```dockerfile
# Stage 1: build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
```

- `FROM node:22-alpine AS builder` startet die erste Stage und gibt ihr den Namen `builder`. Dieser Name wird von späteren Stages verwendet, um auf diese hier zu verweisen. `alpine` ist ein minimales Base-Image, kleiner als die `slim`-Variante aus den Basics – passend zu einem Kapitel über kleine Images.
- `WORKDIR /app` setzt das Arbeitsverzeichnis für diese Stage. Alle folgenden Pfade sind relativ zu `/app`, sodass die Build-Ausgabe in `/app/dist` landet.
- `COPY package*.json ./` und `RUN npm ci` installieren die Abhängigkeiten anhand der `package-lock.json`. Es ist ein reproduzierbares Install, das die Lock-Datei nicht verändert – und damit für die Produktion besser geeignet, weil es weniger unerwartetes Verhalten erzeugt.
- `COPY . .` kopiert den restlichen Source-Code in die Stage, und `RUN npm run build` kompiliert ihn. Beim Scoreboard-Service führt das Build-Script `tsc` aus, das den TypeScript-Code in `src/` in JavaScript in `dist/` umwandelt.

---

## Die Runtime-Stage

Die zweite Stage startet von einem frischen Base-Image und nimmt nur mit, was die laufende App braucht:

```dockerfile
# Stage 1: build
FROM node:22-alpine AS builder
...

# Stage 2: runtime
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
```

- Das zweite `FROM node:22-alpine` beginnt eine neue Stage mit einem leeren Filesystem. Nichts aus der Build-Stage existiert hier, es sei denn, es wird explizit hineinkopiert. Diese Stage hat keinen Namen, weil sie die letzte ist – und die letzte Stage wird zum finalen Image.
- `WORKDIR /app` setzt das Arbeitsverzeichnis erneut. Jede Stage ist unabhängig, das Arbeitsverzeichnis der Build-Stage wird nicht übernommen.
- `COPY --from=builder /app/dist ./dist` ist die Anweisung, die beide Stages verbindet. Statt aus dem Build-Kontext auf deiner Maschine zu kopieren, kopiert `--from=builder` aus dem Filesystem der `builder`-Stage. Hier wird der kompilierte `dist`-Ordner weitergezogen – und der TypeScript-Source-Code bleibt zurück.
- `COPY --from=builder /app/package*.json ./` holt das Dependency-Manifest herüber, damit der nächste Schritt weiß, was zu installieren ist.
- `RUN npm ci --omit=dev` installiert nur die Production-Dependencies. Der Flag `--omit=dev` überspringt `devDependencies` wie den TypeScript-Compiler, den die kompilierte App zur Laufzeit nicht braucht.
- `EXPOSE 3000` dokumentiert den Port, auf dem die App lauscht, `ENV NODE_ENV=production` setzt die Umgebung auf `production`, und `CMD ["npm", "start"]` startet die App, wenn ein Container gestartet wird.

---

## Das Image bauen

Der Build-Befehl ist derselbe wie in den Basics. Docker liest die gesamte Datei und führt die Stages der Reihe nach aus:

```bash
docker build -t scoreboard-service:v2 .
```

Docker führt die Build-Stage aus, dann die Runtime-Stage, und verwirft die Build-Stage, sobald ihre Ausgabe weiterkopiert wurde. Das Image, das in `docker images` erscheint, ist allein die Runtime-Stage – ohne Compiler, ohne `devDependencies`, ohne den originalen Source-Code.

---

## Einstufig vs. mehrstufig

Beide Ansätze paketieren dieselbe App, liefern aber sehr unterschiedliche Images aus:

| Aspekt | Einstufiges Dockerfile | Multi-Stage Dockerfile |
|---|---|---|
| Finale Image-Größe | Größer, enthält Build-Tools | Kleiner, nur Runtime-Dateien |
| Build-Artefakte | Source und `dist` beide vorhanden | Nur `dist` wird weiterkopiert |
| Dependencies | Production und Dev installiert | Nur Production im finalen Image |
| Build-Tools | Compiler landet in der Produktion | Compiler bleibt in der Build-Stage |

---

## Ressourcen

- [Multi-stage builds – Docker Docs](https://docs.docker.com/build/building/multi-stage/)
- [NestJS Deployment Guide](https://docs.nestjs.com/deployment)
- [Node.js Official Image on Docker Hub](https://hub.docker.com/_/node)

---

> **Denkanstoß:** Die Runtime-Stage startet mit einem komplett leeren Filesystem und kopiert gezielt nur herein, was sie braucht. Welches Sicherheitsprinzip steckt hinter diesem Ansatz – und wo begegnet dir dieses Prinzip noch in der Softwareentwicklung?