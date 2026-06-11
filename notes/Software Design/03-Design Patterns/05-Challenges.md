# Software Design – Entwurfsmuster: Aufgaben

Diese Übungen testen die Fähigkeit, Entwurfsmuster in realistischen Szenarien anzuwenden. Die ersten drei bitten darum, eine Lösung von Grund auf zu entwerfen. Die letzte liefert bestehenden, eng gekoppelten Code, der mit den Konzepten aus dieser Einheit refaktoriert werden soll.

---

## 1. Beschwörungskreis

Implementiere ein Feature zur Kreaturenbeschwörung für ein Fantasy-Spiel. Der Spieler kann mit einem Beschwörungskreis interagieren, Zutaten eines bestimmten Typs einsetzen, und der Beschwörungskreis erschafft daraus eine magische Kreatur dieses Typs.

Implementiere den `SummoningCircle` mit dem Factory-Muster:

1. Definiere ein Interface `Creature` mit dem Attribut `name: string` und einer Methode `useAbility()`, die eine Nachricht ausgibt, was die Kreatur tut.
2. Erstelle mehrere Klassen, die das `Creature`-Interface implementieren. Vorschläge: eine `Dragon`-Klasse mit der Fähigkeit Feuer zu speien, eine `Phoenix`-Klasse mit der Fähigkeit `Wiedergeburt`, eine `Unicorn`-Klasse mit der Fähigkeit `Auf Regenbogen tanzen`.
3. Erstelle die Factory-Klasse `SummoningCircle` mit einer Methode `summon(ingredientType: string)`. Abhängig vom Zutatentyp (`fire`, `air`, `sparkles` usw.) wird eine andere Kreaturenklasse erstellt und zurückgegeben.
4. Verwende den Beschwörungskreis mit verschiedenen Zutaten.

### Lösung

```ts
interface Creature {
  name: string;
  useAbility(): void;
}

class Dragon implements Creature {
  name = "Drache";
  useAbility() { console.log("Der Drache atmet vernichtendes Feuer!"); }
}

class Phoenix implements Creature {
  name = "Phönix";
  useAbility() { console.log("Der Phönix erhebt sich aus der Asche – wiedergeboren!"); }
}

class Unicorn implements Creature {
  name = "Einhorn";
  useAbility() { console.log("Das Einhorn tanzt anmutig auf einem Regenbogen!"); }
}

class SummoningCircle {
  summon(ingredientType: string): Creature {
    switch (ingredientType) {
      case "fire":     return new Dragon();
      case "air":      return new Phoenix();
      case "sparkles": return new Unicorn();
      default: throw new Error(`Unbekannte Zutat: ${ingredientType}`);
    }
  }
}

// Verwendung
const circle = new SummoningCircle();
["fire", "air", "sparkles"].map(i => circle.summon(i)).forEach(c => {
  console.log(`Beschworen: ${c.name}`);
  c.useAbility();
});

// Ausgabe:
// Beschworen: Drache
// Der Drache atmet vernichtendes Feuer!
// Beschworen: Phönix
// Der Phönix erhebt sich aus der Asche – wiedergeboren!
// Beschworen: Einhorn
// Das Einhorn tanzt anmutig auf einem Regenbogen!
```

**Warum Factory?** `SummoningCircle.summon()` zentralisiert die Entscheidung, welche konkrete Kreaturenklasse erstellt wird. Der aufrufende Code muss nur das `Creature`-Interface kennen – nicht `Dragon`, `Phoenix` oder `Unicorn` direkt. Eine neue Kreatur hinzuzufügen bedeutet: eine neue Klasse schreiben und einen `case` ergänzen. Sonst nichts ändert sich.

---

## 2. Der API-Request-Builder

Entwirf einen flexiblen Weg, HTTP-Anfragen zu konstruieren, ohne ein einzelnes, optionslastiges Konfigurationsobjekt.

1. Implementiere eine `RequestBuilder`-Klasse, die Method-Chaining für das Setzen der HTTP-Methode, der URL, der Header, der Query-Parameter und eines JSON-Bodys ermöglicht.
2. Die `build()`-Methode muss die Konfiguration validieren, bevor sie das finale, unveränderliche `Request`-Objekt zurückgibt. Sie soll einen Fehler werfen, wenn die Methode `POST` ist, aber kein Body angegeben wurde, oder wenn keine URL gesetzt wurde.

### Lösung

```ts
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface HttpRequest {
  readonly method: HttpMethod;
  readonly url: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly queryParams: Readonly<Record<string, string>>;
  readonly body?: unknown;
}

class RequestBuilder {
  private _method?: HttpMethod;
  private _url?: string;
  private _headers: Record<string, string> = {};
  private _queryParams: Record<string, string> = {};
  private _body?: unknown;

  method(method: HttpMethod): this { this._method = method; return this; }
  url(url: string): this { this._url = url; return this; }
  header(key: string, value: string): this { this._headers[key] = value; return this; }
  queryParam(key: string, value: string): this { this._queryParams[key] = value; return this; }
  body(body: unknown): this { this._body = body; return this; }

  build(): HttpRequest {
    if (!this._url)    throw new Error("URL ist erforderlich");
    if (!this._method) throw new Error("HTTP-Methode ist erforderlich");
    if (this._method === "POST" && this._body === undefined)
      throw new Error("POST-Anfragen erfordern einen Body");

    return Object.freeze({
      method: this._method,
      url: this._url,
      headers: Object.freeze({ ...this._headers }),
      queryParams: Object.freeze({ ...this._queryParams }),
      body: this._body,
    });
  }
}

// Verwendung
const req = new RequestBuilder()
  .method("POST")
  .url("https://api.example.com/tracks")
  .header("Authorization", "Bearer token123")
  .queryParam("version", "2")
  .body({ title: "Bohemian Rhapsody", artist: "Queen" })
  .build();

console.log("Anfrage erstellt:", JSON.stringify(req, null, 2));
// Ausgabe:
// {
//   "method": "POST",
//   "url": "https://api.example.com/tracks",
//   "headers": { "Authorization": "Bearer token123" },
//   "queryParams": { "version": "2" },
//   "body": { "title": "Bohemian Rhapsody", "artist": "Queen" }
// }
```

**Warum Builder?** Der Teleskop-Konstruktor `new HttpRequest(method, url, headers, params, body)` ist unleserlich und fehleranfällig. Der Builder benennt jeden Schritt explizit und macht `build()` zum einzigen Ort, an dem plattformübergreifende Validierungsregeln geprüft werden – z. B. dass `POST` einen Body benötigt. `Object.freeze()` stellt sicher, dass das fertige Objekt unveränderlich ist.

---

## 3. E-Commerce State Machine

Baue eine `Order`-Klasse, die ihren Lebenszyklus mit einer State Machine verwaltet.

1. Definiere die genauen Zustände: `Draft`, `Paid`, `Shipped`, `Delivered`, `Cancelled`.
2. Definiere die zulässigen Ereignisse: `checkout`, `payment_received`, `dispatch`, `confirm_delivery`, `cancel`.
3. Implementiere folgende mögliche Zustandsübergänge:
    - `Draft` kann zu `Paid` und `Cancelled` wechseln
    - `Paid` kann zu `Shipped` und `Cancelled` wechseln
    - `Shipped` kann zu `Delivered` wechseln

### Lösung

```ts
type OrderState = "Draft" | "Paid" | "Shipped" | "Delivered" | "Cancelled";
type OrderEvent =
  | "checkout" | "payment_received" | "dispatch"
  | "confirm_delivery" | "cancel";

const orderTransitions: Record<OrderState, Partial<Record<OrderEvent, OrderState>>> = {
  Draft:     { payment_received: "Paid",     cancel: "Cancelled" },
  Paid:      { dispatch: "Shipped",          cancel: "Cancelled" },
  Shipped:   { confirm_delivery: "Delivered" },
  Delivered: {},
  Cancelled: {},
};

class Order {
  private state: OrderState = "Draft";
  readonly id: string;

  constructor(id: string) { this.id = id; }

  transition(event: OrderEvent): void {
    const next = orderTransitions[this.state][event];
    if (!next)
      throw new Error(`Ungültiger Übergang: '${event}' aus Zustand '${this.state}'`);
    console.log(`Bestellung ${this.id}: ${this.state} → ${next}`);
    this.state = next;
  }

  getState(): OrderState       { return this.state; }
  payment_received()           { this.transition("payment_received"); }
  dispatch()                   { this.transition("dispatch"); }
  confirm_delivery()           { this.transition("confirm_delivery"); }
  cancel()                     { this.transition("cancel"); }
}

// Verwendung – Normalablauf
const order = new Order("ORD-001");
order.payment_received(); // Draft → Paid
order.dispatch();         // Paid  → Shipped
order.confirm_delivery(); // Shipped → Delivered
console.log("Endzustand:", order.getState()); // Delivered

// Ungültiger Übergang
try {
  const order2 = new Order("ORD-002");
  order2.confirm_delivery(); // wirft Fehler: Ungültiger Übergang aus 'Draft'
} catch (e) {
  console.log((e as Error).message);
}

// Ausgabe:
// Bestellung ORD-001: Draft → Paid
// Bestellung ORD-001: Paid → Shipped
// Bestellung ORD-001: Shipped → Delivered
// Endzustand: Delivered
// Ungültiger Übergang: 'confirm_delivery' aus Zustand 'Draft'
```

**Warum State Machine?** Drei Boolean-Felder (`isDraft`, `isPaid`, `isShipped`) beschreiben 8 Kombinationen – die meisten davon sind unsinnig. Die Übergangstabelle lässt sich wie eine Spezifikation lesen und macht unmögliche Zustände zur Compilezeit und zur Laufzeit unmöglich, anstatt sie still zu korrumpieren.

---

## 4. Der monolithische Log-Exporter

Die folgende Klasse verletzt das **Single-Responsibility-Prinzip**, indem sie ihre eigene Datenbankverbindung verwaltet, und das **Open/Closed-Prinzip**, indem sie eine hartcodierte `if/else`-Kette zur Formatwahl verwendet.

```ts
function getMockDB() {
  return {
    query(select: string): string[] {
      return ["lorem", "ipsum", "dolor"];
    },
  };
}

class LogExporter {
  async exportLogs(format: "json" | "csv" | "xml") {
    const db = getMockDB();
    const logs = await db.query("SELECT * FROM system_logs");

    if (format === "json") {
      return JSON.stringify(logs);
    } else if (format === "csv") {
      return logs
        .map((l) => `${l.timestamp},${l.level},${l.message}`)
        .join("\n");
    } else if (format === "xml") {
      return `<logs>${logs.map((l) => `<log>${l.message}</log>`).join("")}</logs>`;
    } else {
      throw new Error("Unbekanntes Format");
    }
  }
}
```

Refaktoriere in zwei Schritten:

1. **Repository und DI:** Extrahiere ein `LogRepository`-Interface. Injiziere es in `LogExporter`, sodass die Klasse nichts mehr über die Datenbankverbindung weiß.
2. **Factory:** Extrahiere die Formatierungslogik in eine `ExporterFactory`-Funktion oder -Klasse. Sie soll den `format`-String entgegennehmen und eine konkrete Formatter-Instanz zurückgeben (`JsonFormatter`, `CsvFormatter`, `XmlFormatter`). Aktualisiere `LogExporter`, um die Factory statt inline-Conditionals zu verwenden.

### Lösung

```ts
// ── Schritt 1: Repository-Interface und Implementierung ───────────────────
function getMockDB() {
  return { query(_select: string): string[] { return ["lorem", "ipsum", "dolor"]; } };
}

interface LogRepository {
  getLogs(): Promise<string[]>;
}

class DbLogRepository implements LogRepository {
  async getLogs(): Promise<string[]> {
    return getMockDB().query("SELECT * FROM system_logs");
  }
}

// Für Tests: kein Datenbankzugriff nötig
class InMemoryLogRepository implements LogRepository {
  constructor(private readonly logs: string[]) {}
  async getLogs(): Promise<string[]> { return this.logs; }
}

// ── Schritt 2: Formatter-Interface und Factory ────────────────────────────
interface LogFormatter {
  format(logs: string[]): string;
}

class JsonFormatter implements LogFormatter {
  format(logs: string[]): string { return JSON.stringify(logs); }
}

class CsvFormatter implements LogFormatter {
  format(logs: string[]): string { return logs.join("\n"); }
}

class XmlFormatter implements LogFormatter {
  format(logs: string[]): string {
    return `<logs>${logs.map(l => `<log>${l}</log>`).join("")}</logs>`;
  }
}

function createFormatter(format: string): LogFormatter {
  switch (format) {
    case "json": return new JsonFormatter();
    case "csv":  return new CsvFormatter();
    case "xml":  return new XmlFormatter();
    default: throw new Error(`Unbekanntes Format: ${format}`);
  }
}

// ── Refaktorierter LogExporter ────────────────────────────────────────────
class LogExporter {
  constructor(private readonly repository: LogRepository) {}

  async exportLogs(format: string): Promise<string> {
    const logs = await this.repository.getLogs();
    return createFormatter(format).format(logs);
  }
}

// ── Verwendung ─────────────────────────────────────────────────────────────
const exporter = new LogExporter(new DbLogRepository());
console.log("JSON:", await exporter.exportLogs("json"));
// → JSON: ["lorem","ipsum","dolor"]
console.log("CSV:",  await exporter.exportLogs("csv"));
// → CSV: lorem
//        ipsum
//        dolor
console.log("XML:",  await exporter.exportLogs("xml"));
// → XML: <logs><log>lorem</log><log>ipsum</log><log>dolor</log></logs>

// ── Test-Verdrahtung (keine echte Datenbank) ───────────────────────────────
const testExporter = new LogExporter(new InMemoryLogRepository(["a", "b"]));
console.log("Test-JSON:", await testExporter.exportLogs("json"));
// → Test-JSON: ["a","b"]
```

**Was hat sich verbessert?**

- `LogExporter` weiß nichts mehr über Datenbanken – es hängt nur vom `LogRepository`-Interface ab. In Tests wird `InMemoryLogRepository` eingesetzt: keine echte Datenbank nötig.
- Das Hinzufügen eines neuen Formats bedeutet: eine neue Formatter-Klasse schreiben und einen `case` in `createFormatter` ergänzen. `LogExporter` selbst bleibt unverändert – das Open/Closed-Prinzip ist erfüllt.
- Jede Klasse hat jetzt genau eine Verantwortlichkeit: Datenabruf, Formatierung oder Export-Orchestrierung.