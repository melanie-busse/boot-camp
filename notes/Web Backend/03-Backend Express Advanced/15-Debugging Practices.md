# Backend Express Advanced – Debugging-Praktiken

Wenn ein Logger nicht die erwartete Ausgabe schreibt, ist das Problem meistens klein, aber versteckt: Die Middleware ist nicht registriert, die Request-Daten sind nicht das, was erwartet wurde, der Dateipfad zeigt woanders hin, oder eine asynchrone Datei-Operation wirft einen Fehler, der still verschluckt wird. Debugging ist der Prozess, diese verborgenen Details sichtbar zu machen.

Das praktische Ziel dieser Einheit ist nicht, jeden Debugger-Befehl abzudecken. Es geht darum, zwei pragmatische Debugging-Ebenen zu erlernen: schnelle Überprüfungen mit `console.log()` und tiefere Inspektion mit dem eingebauten Node.js-Inspector.

---

## `console.log()` gezielt einsetzen

`console.log()` ist der schnellste Weg, kleine Fragen beim Bauen des Loggers zu beantworten:

- Läuft die Middleware überhaupt?
- Was enthält `req.originalUrl` für diese Route?
- Welchen Dateipfad hat `path.join()` erzeugt?
- Ist der `catch`-Block ausgeführt worden?

```typescript
export async function logger(req: Request, res: Response, next: NextFunction) {
  console.log("logger ran for", req.method, req.originalUrl);
  next();
}
```

Das ist ein guter erster Schritt, weil es einfach ist. Der Nachteil: Console-Logs können schnell unübersichtlich werden, besonders wenn temporäre Debug-Ausgaben an mehreren Stellen zurückbleiben.

---

## Der Node.js-Inspector

Wenn Logs nicht ausreichen, wird die App im Inspect-Modus gestartet:

```bash
node --inspect dist/index.js
```

Wird während der Entwicklung ein Watcher verwendet, sollte dieser mit demselben Flag gestartet werden, damit der Debugger nach Neustarts automatisch wieder verbindet.

Der Inspector ermöglicht:

- Ausführung mit Breakpoints pausieren
- `req`, `res` und lokale Variablen inspizieren
- Durch asynchronen Code schrittweise navigieren
- Sehen, wo ein Fehler geworfen wurde

Das ist besonders nützlich bei Dateisystem-Code: Die Ausführung lässt sich vor `appendFile()` oder `writeFile()` anhalten, um Pfad und Nachricht zu prüfen, bevor etwas auf die Festplatte geschrieben wird.

---

## Debugging in VS Code

Da viele mit VS Code arbeiten, ist es hilfreich zu wissen, dass der Editor sich mit demselben Node.js-Debugger verbinden kann – ohne die IDE verlassen zu müssen. Eine einfache Launch-Konfiguration verweist auf die App-Einstiegsdatei und startet Node im Debug-Modus:

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Express App",
      "program": "${workspaceFolder}/dist/index.js",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

Der genaue Dateipfad für `program` hängt davon ab, wie das Projekt gestartet wird. Läuft die App direkt aus TypeScript heraus – z. B. mit einem Tool wie `tsx` – wäre die Einstiegsdatei stattdessen `src/index.ts`.

---

## Eine Debugging-Gewohnheit, die bleibt

Ein Fehler in der ursprünglichen Logger-Lösung ist wichtiger als jeder Debugger-Befehl: Abgefangene Fehler werden manchmal ignoriert. Bleibt ein `catch`-Block leer, wird das Debugging erheblich schwieriger – weil Fehler still verschwinden.

Stattdessen gilt einer dieser drei Ansätze:

- Den Fehler klar loggen
- Gezielt einen Fallback-Wert zurückgeben
- Den Fehler weiterwerfen, wenn die App anhalten soll

Diese Gewohnheit ist wichtiger als jedes Tool – denn sie hält echte Fehler sichtbar.

---

## Weiterführende Ressourcen

- [Node.js Debugging Guide](https://nodejs.org/en/learn/getting-started/debugging)
- [VS Code Node.js Debugging](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)