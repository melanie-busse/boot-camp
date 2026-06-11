# Backend Express.js – Dateisystem-Operationen

Wenn eine Express-Anwendung auf das lokale Dateisystem schreibt – sei es für Logs, hochgeladene Dateien oder einfache Datenpersistenz – stößt sie auf eine Reihe typischer Praxisprobleme. Ein Dateipfad, der auf einem Rechner funktioniert, kann auf einem anderen scheitern. Eine Datei, die noch nicht existiert, lässt einen Schreibvorgang fehlschlagen. Eine Datei zu überschreiben, wenn eigentlich angehängt werden sollte, vernichtet Daten stillschweigend. Node.js liefert ein eingebautes Modul für all das: `node:fs` – und seine Promise-basierte Variante `fs/promises`.

Dieses Material behandelt die Dateisystem-Patterns, die beim Aufbau eines Request-Loggers verwendet werden: stabile Pfade konstruieren, eine Datei beim Start anlegen, damit sie vor den ersten Anfragen existiert, und zeilenweise anhängen ohne vorherige Einträge zu verlieren. Diese Patterns gelten für jede Datei-Schreib-Aufgabe, nicht nur für Logging.

> 🧠 **Gut zu wissen:** In dieser Übung speichern wir Logs in einer Datei, um uns mit Express-Middleware vertraut zu machen und das Logging besser zu visualisieren. In der Praxis kann das unerwünschte Folgen haben. Kannst du dir Gründe vorstellen, warum das für große Anwendungen nicht ideal ist?

---

## Dateipfade mit `path.join()` aufbauen

Pfade als Strings hartzucodieren ist fehleranfällig. `"logs/logs.txt"` funktioniert vielleicht von einem Ordner aus, schlägt von einem anderen fehl. `path.join()` löst das, indem es Pfadsegmente mit dem für das aktuelle Betriebssystem korrekten Trennzeichen kombiniert.

Der einfachste Weg, einen Pfad zum Projekt-Root zu erstellen, ist `process.cwd()`. Es gibt das Verzeichnis zurück, aus dem der Node-Prozess gestartet wurde – bei `npm start` oder `nodemon` ist das typischerweise der Projekt-Root:

```typescript
import path from "node:path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "logs.txt");
```

Eine Alternative ist `__dirname`, das immer zum Verzeichnis der aktuell ausgeführten JavaScript-Datei auflöst. Das ist unabhängig davon, wo der Prozess gestartet wurde, erfordert aber die Navigation zurück zum Projekt-Root aus dem `dist/`-Ordner heraus:

```typescript
const LOG_DIR = path.join(__dirname, "..", "..", "logs");
```

Der Kompromiss: `process.cwd()` ergibt saubereren Code ohne Pfad-Traversierung, schlägt aber fehl, wenn jemand den Prozess aus einem anderen Verzeichnis als dem Projekt-Root startet. `__dirname` ist unabhängig vom Arbeitsverzeichnis, aber die Anzahl der `..`-Segmente hängt davon ab, wie tief die kompilierte Datei in `dist/` liegt – das ändert sich bei Strukturänderungen.

In einem Projekt, dessen Einstiegspunkt immer vom Root aus gestartet wird, ist `process.cwd()` die einfachere Wahl.

---

## `fs/promises` verwenden

Node.js bietet sowohl callback-basierte als auch Promise-basierte Dateisystem-APIs. `fs/promises` ist die klarere Wahl, wenn der umgebende Code bereits `async` und `await` verwendet.

```typescript
import { appendFile, writeFile } from "node:fs/promises";
```

Promise-basierte Funktionen passen natürlich zu `async` und `await`:

- Der Code lässt sich von oben nach unten lesen
- Fehler können mit `try` und `catch` behandelt werden
- Mehrere asynchrone Schritte lassen sich einfacher kombinieren

---

## Datei erstellen und Existenz prüfen

Die erste Anfrage sollte die Log-Datei nicht als Nebeneffekt erstellen müssen. Ein saubererer Ansatz ist sicherzustellen, dass die Datei beim Server-Start bereits existiert.

```typescript
import { access, constants, writeFile } from "node:fs/promises";

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

async function ensureLogFile(filePath: string): Promise<void> {
  const exists = await fileExists(filePath);

  if (!exists) {
    await writeFile(filePath, "", { encoding: "utf-8" });
  }
}
```

Diese Funktion erfüllt zwei separate Aufgaben:

- `access()` prüft, ob die Datei erreichbar ist
- `writeFile()` erstellt die Datei, wenn sie fehlt

Diese Trennung hält die Absicht klar: Man sieht den Unterschied zwischen „zuerst prüfen" und „bei Bedarf erstellen".

---

## An eine Datei anhängen

Sobald die Datei existiert, soll jede Anfrage eine neue Zeile hinzufügen, ohne den vorherigen Inhalt zu ersetzen. `appendFile()` ist genau dafür gedacht:

```typescript
import { appendFile } from "node:fs/promises";

async function addLogMessage(message: string): Promise<void> {
  await appendFile(LOG_FILE, message + "\n", { encoding: "utf-8" });
}
```

`writeFile()` würde die gesamte Datei überschreiben, außer man übergibt spezielle Optionen. `appendFile()` macht die Absicht explizit: vorhandenen Inhalt behalten und eine weitere Zeile am Ende anfügen.

---

## Den Datei-Helper mit dem Logger verbinden

Die einzelnen Teile werden erst nützlich, wenn sie mit der Middleware aus der vorherigen Lektion verknüpft werden.

Der Ablauf sieht so aus:

1. Die App startet
2. `ensureLogFile(LOG_FILE)` bereitet die Datei einmalig vor
3. Express registriert die Logger-Middleware
4. Jede Anfrage erreicht `logger`
5. `logger` baut einen Log-Eintrag und übergibt ihn an `addLogMessage()`

Diese Verbindung ist der fehlende Schritt zwischen „Ich kann an eine Datei anhängen" und „Ich habe einen funktionierenden Access-Logger".

```typescript
import type { NextFunction, Request, Response } from "express";
import { appendFile } from "node:fs/promises";
import path from "node:path";

const LOG_FILE = path.join(process.cwd(), "logs", "logs.txt");

async function addLogMessage(message: string): Promise<void> {
  await appendFile(LOG_FILE, message + "\n", { encoding: "utf-8" });
}

export function logger(req: Request, res: Response, next: NextFunction) {
  res.on("finish", async () => {
    const logEntry = [
      new Date().toISOString(),
      req.method,
      req.ip,
      req.originalUrl,
      res.statusCode,
    ].join(" ");

    await addLogMessage(logEntry);
  });

  next();
}
```

Die Middleware muss nicht wissen, wie die Datei erstellt wurde. Sie hängt nur von zwei Dingen ab:

- `LOG_FILE` zeigt auf einen stabilen Speicherort
- Die Datei existiert bereits, bevor Anfragen eintreffen

---

## Startup-Ablauf und asynchrones Setup

Der Server sollte seine Log-Datei vorbereiten, bevor Anfragen eintreffen. Das Setup läuft beim Start, dann wird die Middleware registriert, dann beginnt das Lauschen auf Anfragen:

```typescript
await ensureLogFile(LOG_FILE);
app.use(logger);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
```

Die Reihenfolge ist damit explizit:

1. Zuerst die Datei vorbereiten
2. Dann die Middleware registrieren
3. Zuletzt Anfragen akzeptieren

---

## Weiterführende Links

- [Node.js fs/promises – Dokumentation](https://nodejs.org/api/fs.html#promises-api)
- [Node.js path.join() – Dokumentation](https://nodejs.org/api/path.html#pathjoinpaths)