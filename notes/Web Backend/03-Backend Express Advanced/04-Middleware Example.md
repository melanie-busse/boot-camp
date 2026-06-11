# Backend Express Advanced – Middleware-Beispiel: Logger

Wenn ein Server Hunderte oder Tausende von Anfragen empfängt, geben Route-Handler allein kein klares Bild davon, was passiert ist. Es wird eine zentrale Stelle benötigt, die jede eingehende Anfrage sieht und nützliche Informationen darüber aufzeichnen kann. In Express ist Middleware das richtige Werkzeug dafür. Eine Logger-Middleware läuft für jede Anfrage, die die App durchläuft – die Logging-Logik bleibt damit an einer einzigen Stelle, statt in jedem Route-Handler wiederholt zu werden.

Ein Access-Log zeichnet üblicherweise Anfrage-Metadaten auf, keine Geschäftsdaten. Sinnvolle Startfelder sind Zeitstempel, HTTP-Methode, angefragte URL, Client-IP-Adresse und der Response-Status-Code. Diese Werte zusammen beantworten praktische Fragen: Welche Route wurde aufgerufen, wann ist es passiert, wer hat die Anfrage gesendet und hat der Server erfolgreich geantwortet?

---

## Warum Middleware zum Logging passt

Middleware sitzt im Request-Response-Zyklus zwischen der eingehenden Anfrage und der abschließenden Antwort. Das macht sie nützlich für Aufgaben, die für die gesamte App relevant sind:

- Authentifizierung
- Parsen von Request-Bodys
- Fehlerbehandlung
- Request-Logging

Für einen Logger ist der Hauptvorteil die Konsistenz: Jede Anfrage durchläuft dieselbe Funktion, sodass jeder Log-Eintrag demselben Format folgt.

---

## Was geloggt werden soll

Das Request-Objekt liefert bereits die meisten Werte, die ein einfaches Access-Log benötigt:

- `req.method` – die HTTP-Methode, z. B. `GET` oder `POST`
- `req.originalUrl` – der angefragte Pfad
- `req.ip` – die Client-IP-Adresse
- `new Date().toISOString()` – ein standardisierter Zeitstempel

`toISOString()` ist eine starke Standardwahl für Logs, weil das Format eindeutig und sortierbar ist. Es ist immer UTC und folgt stets derselben Reihenfolge – Log-Einträge von verschiedenen Maschinen lassen sich so problemlos vergleichen.

```typescript
const timestamp = new Date().toISOString();
const method = req.method;
const url = req.originalUrl;
const ip = req.ip;
```

Diese Werte reichen für einen ersten Logger. Viele Teams ergänzen später auch Response-Status-Codes oder Response-Zeiten.

---

## Nach der Antwort loggen

Wenn der Log-Eintrag den finalen Response-Status-Code enthalten soll, sollte nach dem Senden der Antwort geloggt werden. Erst zu diesem Zeitpunkt enthält `res.statusCode` den Wert, den der Client tatsächlich erhalten hat.

```typescript
import type { NextFunction, Request, Response } from "express";

export function logger(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    const logEntry = [
      new Date().toISOString(),
      req.method,
      req.ip,
      req.originalUrl,
      res.statusCode,
    ].join(" ");

    console.log(logEntry);
  });

  next();
}
```

`res.on("finish", ...)` registriert einen Callback, der ausgeführt wird, sobald die Antwort vollständig geschrieben wurde. Dieser Zeitpunkt ist entscheidend: Zu früh geloggt, kann der finale Status-Code fehlen oder eine Anfrage aufgezeichnet werden, die später noch auf andere Weise fehlschlägt.

---

## Einen Log-Eintrag pro Zeile formatieren

Logs lassen sich leichter lesen und verarbeiten, wenn jede Anfrage genau eine Zeile ergibt. Deshalb sind Zeilenumbruchzeichen wichtig:

```typescript
const logEntry =
  [new Date().toISOString(), req.method, req.ip, req.originalUrl].join(" ") +
  "\n";
```

`\n` bedeutet „neue Zeile beginnen". Wird dieser String an eine Datei angehängt, wird die nächste Anfrage in der darauffolgenden Zeile geschrieben, statt direkt an den vorherigen Eintrag zu kleben.

---

## Weiterführende Links

- [Express Middleware Guide](https://expressjs.com/en/guide/writing-middleware.html)
- [Express Request API](https://expressjs.com/en/api.html#req)