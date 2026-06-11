# Software-Designparadigmen – Funktionale Programmierung in TypeScript

Funktionale Programmierung ist ein weites Feld, findet in TypeScript-Projekten aber oft praktische Anwendung: Funktionen empfangen Werte, transformieren diese und geben neue Werte zurück, ohne dabei andere Zustände zu verändern. Dieser Stil sorgt für einen transparenten Datenfluss und ermöglicht es, die Transformationslogik isoliert von Seiteneffekten wie Datenbankzugriffen oder HTTP-Antworten zu testen.

---

## Reine Funktionen

Eine reine Funktion liefert bei gleicher Eingabe immer denselben Wert und verändert nichts außerhalb ihrer selbst. Das vereinfacht das Testen, da man nur den Rückgabewert prüfen muss.

Diese Funktion verletzt die Reinheit, indem sie zusätzliche Daten aus der Datenbank abruft:

```typescript
async function toUserResponse(userId: number): Promise<UserResponse> {
  const row = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
  const role = await db.query("SELECT name FROM roles WHERE user_id = $1", [
    userId,
  ]);

  return {
    id: row.id,
    fullName: `${row.first_name} ${row.last_name}`,
    email: row.email,
    role: role.name,
  };
}
```

Sie ist unrein, da die Ausgabe nicht nur von den Argumenten, sondern auch vom aktuellen Datenbankinhalt abhängt. Zwei Aufrufe mit denselben Argumenten `userId` können unterschiedliche Ergebnisse liefern, wenn sich die Datenbank zwischenzeitlich ändert. Außerdem ist sie schwieriger zu testen – man benötigt eine reale oder simulierte Datenbank, nur um die Struktur der Antwort zu überprüfen.

Dies ist hingegen ein gängiges Muster im Servicecode:

```typescript
type UserRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};

type UserResponse = {
  id: number;
  fullName: string;
  email: string;
};

function toUserResponse(row: UserRow): UserResponse {
  return {
    id: row.id,
    fullName: `${row.first_name} ${row.last_name}`,
    email: row.email,
  };
}
```

Die obige Funktion ist nützlich, weil:

- sie ausschließlich von ihrem Input abhängt,
- sie weder von Express, SQL noch vom Dateisystem liest,
- sie eine Datenform auf vorhersagbare Weise in eine andere umwandelt.

Das macht sie zu einem guten Baustein innerhalb einer größeren MVC-Anwendung.

---

## Unveränderlichkeit

Bei einem veränderlichen Stil erhält eine Funktion ein Objekt und verändert es direkt. Das kann die Fehlersuche erschweren, da der Aufrufer möglicherweise weiterhin eine Referenz auf dasselbe Objekt besitzt.

```typescript
type Order = {
  id: number;
  status: "open" | "paid";
};

function markAsPaid(order: Order): void {
  order.status = "paid";
}

const order = { id: 1, status: "open" };
markAsPaid(order);
console.log(order.status); // "paid" — the original was silently changed
```

Der Aufrufer `order` erwartete, dass das Objekt unverändert bleibt, doch die Funktion veränderte es direkt. Sollte eine andere Stelle im Quellcode noch eine Referenz auf dieses Objekt halten, wird diese nun als `"paid"` erkannt, ohne dass der Grund dafür bekannt ist.

Diese Version gibt ein neues Objekt zurück, anstatt das alte zu verändern:

```typescript
type Order = {
  id: number;
  status: "open" | "paid";
};

function markAsPaid(order: Order): Order {
  return {
    ...order,
    status: "paid",
  };
}

const order = { id: 1, status: "open" };
const paidOrder = markAsPaid(order);
console.log(order);     // not paid
console.log(paidOrder); // paid
```

Die Änderung ist an der Aufrufstelle sichtbar und nicht innerhalb der Funktion verborgen.

Unveränderlichkeit ist ein sehr wichtiges Konzept in TypeScript, weil:

- Funktionseingaben vertrauenswürdiger bleiben,
- Tests einfacher werden, da der Zustand nicht zwischen den Schritten weitergegeben wird,
- Transformationen zusammengesetzt werden können, ohne sich fragen zu müssen, welche Funktion das ursprüngliche Objekt verändert hat.

---

## Array- und Werttransformationen

Der Großteil der alltäglichen funktionalen Programmierung in TypeScript besteht aus Array-Operationen und Werttransformationen.

```typescript
type Product = {
  id: number;
  name: string;
  priceInCents: number;
  isActive: boolean;
};

const products: Product[] = [
  { id: 1, name: "Keyboard", priceInCents: 9900, isActive: true },
  { id: 2, name: "Mouse",    priceInCents: 4900, isActive: false },
  { id: 3, name: "Monitor",  priceInCents: 19900, isActive: true },
];

const activeProductNames = products
  .filter((product) => product.isActive)
  .map((product) => product.name);
```

Man kann dies oft mit einer `for`-Schleife vergleichen, die Filterung, Transformation und Mutation an einer Stelle kombiniert. Die Schleife ist nicht falsch, aber die Pipeline ist oft leichter verständlich, sobald man das Muster kennt.

---

## Nebenwirkungen an den Rändern

Funktionaler Code bedeutet nicht, dass eine Anwendung keine Nebenwirkungen verursacht. Ein Webserver muss in die Datenbank schreiben, Antworten senden und Fehler protokollieren. Ziel ist es, diese Nebenwirkungen in einer klar definierten und isolierten Umgebung oder einem Modul zu halten. Dadurch sind Nebenwirkungen handhabbar und nachvollziehbar.

```typescript
type CreateUserInput = {
  firstName: string;
  lastName: string;
};

function buildUserInsert(input: CreateUserInput) {
  return {
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
  };
}

async function createUserHandler(req: Request, res: Response) {
  const userInsert = buildUserInsert(req.body);
  const savedUser = await userRepository.create(userInsert);

  res.status(201).json(savedUser);
}
```

Der reine Anteil und die Nebenwirkungen werden wie folgt getrennt:

- `buildUserInsert` enthält reine Transformationslogik,
- `createUserHandler` behandelt die Nebenwirkungen (Schreiben in die Datenbank und Beantworten von Anfragen).

Dies ist einer der Gründe, warum funktionale Konzepte gut in MVC-Codebasen passen.

---

## Vermischung funktionaler und objektorientierter Stile

In JavaScript und TypeScript kombinieren die meisten realen Anwendungen beide Stile. Funktionale Programmierung eignet sich gut für Transformationen, Validierungen und vorhersehbare Geschäftslogik. Objektorientierte Programmierung ist oft besser geeignet, wenn Daten und Verhalten an dasselbe Modell gebunden bleiben müssen. Die Kunst besteht darin, den passenden Stil für das jeweilige Problem zu finden, anstatt sich dauerhaft auf einen der beiden festzulegen.

---

## Ressourcen

- [TypeScript-Handbuch: Mehr zu Funktionen](https://www.typescriptlang.org/docs/handbook/2/functions.html)
- [MDN: Array.prototype.map()](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/map)