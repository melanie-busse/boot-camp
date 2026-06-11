# Software-Designparadigmen – OOP-Designprinzipien

Das Erlernen der Klassensyntax allein genügt nicht. Eine Codebasis wird nicht automatisch gut gestaltet, nur weil sie `class`, `private` oder `extends` verwendet. Designprinzipien helfen dabei zu überprüfen, ob Verantwortlichkeiten sinnvoll verteilt sind.

Die drei Prinzipien dieses Kapitels sind eng miteinander verwandt, wirken aber auf leicht unterschiedlichen Ebenen. Das **Single-Responsibility-Prinzip (SRP)** konzentriert sich auf eine einzelne Codeeinheit. Das **Don't-Repeat-Yourself-Prinzip (DRY)** konzentriert sich auf wiederkehrendes Wissen. Das **Prinzip der Trennung von Belangen (Separation of Concerns)** konzentriert sich auf die Systemstruktur.

---

## Single-Responsibility-Prinzip

Das Single-Responsibility-Prinzip besagt, dass eine Codeeinheit nur einen einzigen Grund für eine Änderung haben sollte. Diese Einheit kann eine Funktion, eine Klasse oder ein Modul sein.

```typescript
function registerUser(username: string, email: string) {
  if (!email.includes("@")) {
    throw new Error("Invalid email.");
  }

  const userRecord = {
    id: crypto.randomUUID(),
    username,
    email,
  };

  return saveToDatabase(userRecord);
}
```

Diese Funktion vereint Validierung, Datensatzerstellung und Persistenz. Das führt nicht zwangsläufig zu Fehlern, bedeutet aber, dass sich die Funktion aus verschiedenen Gründen ändern kann.

Eine deutlichere Aufteilung sieht folgendermaßen aus:

```typescript
function validateEmail(email: string): void {
  if (!email.includes("@")) {
    throw new Error("Invalid email.");
  }
}

function buildUserRecord(username: string, email: string) {
  return {
    id: crypto.randomUUID(),
    username,
    email,
  };
}

function registerUser(username: string, email: string) {
  validateEmail(email);
  const userRecord = buildUserRecord(username, email);

  return saveToDatabase(userRecord);
}
```

Durch die Aufteilung von Teilaufgaben in verschiedene Funktionen wird jede Codeeinheit vorhersehbarer und einfacher zu warten.

---

## Don't Repeat Yourself (DRY)

DRY bedeutet, dass dasselbe Wissen nicht manuell an mehreren Stellen gepflegt werden sollte.

```typescript
interface ProductRecord {
  id: number;
  name: string;
  price: number;
  inventory: number;
  supplierId: string;
}

type ProductCard = Pick<ProductRecord, "id" | "name" | "price">;
type ProductCreatePayload = Omit<ProductRecord, "id" | "supplierId">;
```

Dies ist besser, als dieselben Produktfelder in mehreren Schnittstellen neu zu definieren. Ändert sich die Quellstruktur, ändern sich auch die abgeleiteten Typen.

DRY bedeutet nicht „niemals Codestrukturen wiederholen". Manchmal ist es besser, zwei einfache Zeilen zu wiederholen, als zu viele Abstraktionen zu erzeugen. Das eigentliche Problem ist wiederholtes Wissen, das auseinanderlaufen kann.

---

## Trennung der Belangen (Separation of Concerns)

Die Trennung der Belangen wirkt auf einer übergeordneten Ebene als das SRP. Es geht darum, ein System in Teile mit unterschiedlichen Verantwortlichkeiten zu unterteilen.

In einer Express-Anwendung sieht eine typische Aufteilung folgendermaßen aus:

- **Controller** verarbeiten HTTP-Ein- und -Ausgabe.
- **Services** enthalten Geschäftslogik.
- **Repositories** verwalten den Datenbankzugriff.

```typescript
async function createUserController(req: Request, res: Response) {
  const newUser = await userService.createUser(req.body);
  res.status(201).json(newUser);
}
```

Der Controller sollte keine SQL-Abfragen erstellen. Das Repository sollte keine HTTP-Statuscodes festlegen. Das ist die Trennung der Zuständigkeiten.

TypeScript kann diese Grenzen verdeutlichen, indem es einer Schicht ermöglicht, von einem Vertrag anstatt von einer konkreten Implementierung abzuhängen.

```typescript
interface UserService {
  createUser(username: string): Promise<User>;
}

class SqlUserService implements UserService {
  async createUser(username: string): Promise<User> {
    return userRepository.save({ username });
  }
}

async function createUserController(
  req: Request,
  res: Response,
  userService: UserService,
) {
  const newUser = await userService.createUser(req.body.username);
  res.status(201).json(newUser);
}
```

In dieser Konfiguration ist der Controller vom `UserService`-Vertrag abhängig. Er muss nicht wissen, ob die eigentliche Implementierung mit SQL, einer API oder einem Test-Double kommuniziert. Das ist eine Möglichkeit, wie TypeScript die Trennung der Belangen unterstützt.

---

## SRP versus Trennung der Belangen

Die beiden lassen sich leicht verwechseln:

- **SRP** fragt, ob eine Einheit zu viele Aufgaben übernimmt.
- **Trennung der Belangen** fragt, ob das System in sinnvolle Teile unterteilt ist.

Eine Serviceklasse kann die Trennung der Zuständigkeiten respektieren, indem sie sich vom HTTP-Code fernhält, aber dennoch gegen das SRP verstoßen, wenn eine Methode innerhalb der Klasse Validierung, Abrechnung, E-Mail-Versand und Audit-Protokollierung gleichzeitig übernimmt.

---

## Prinzipien als Diagnosewerkzeuge

Diese Prinzipien helfen dabei, bessere Fragen zu stellen. Es handelt sich nicht um Gesetze, die ein bestimmtes Design vorschreiben.

Nützliche Fragen zur Überprüfung des eigenen Codes:

- Ist diese Verantwortung am richtigen Ort?
- Wiederhole ich Wissen oder nur Syntax?
- Wird ein Junior-Entwickler verstehen, wo er nachsehen muss, wenn sich das Verhalten ändert?

---

## Ressourcen

- [Martin Fowler: Code Smell](https://martinfowler.com/bliki/CodeSmell.html)
- [Refactoring Guru: DRY](https://refactoring.guru/dry)