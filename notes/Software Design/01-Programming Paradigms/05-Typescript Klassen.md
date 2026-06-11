# Software-Designparadigmen – TypeScript-Klassen

JavaScript liefert das Laufzeitmodell für Klassen. TypeScript ergänzt dieses Modell um Typen und Designvorgaben. Zugriffsmodifizierer, Schnittstellen und abstrakte Klassen helfen dabei, dem Compiler und anderen Entwicklern die gewünschte Funktionalität zu vermitteln. Doch die Kenntnis der Syntax allein genügt nicht. Die Funktionen sind erst dann nützlich, wenn sie eine konkrete Designentscheidung widerspiegeln: Wer darf diesen Wert lesen? Wie soll sich dieser Zustand ändern? Was muss jede Unterklasse bereitstellen?

Diese Lektion behandelt beide Seiten: die TypeScript-Syntax für Klassen und die Entwurfsmuster, die diesen Merkmalen Bedeutung verleihen.

Das `BankAccount`-Beispiel aus den vorherigen Kapiteln wird hier in TypeScript korrekt umgesetzt. Zugriffsmodifikatoren und private Felder ermöglichen es, die Deposit-Regel auf Sprachebene durchzusetzen – nicht nur durch Konvention.

In einem TypeScript-Backend sind Klassen dann nützlich, wenn sie Domänenregeln verständlicher machen, nicht einfach nur, weil das Feature existiert. Man sollte erklären können, warum eine Klasse hilfreich ist, bevor man sie hinzufügt.

---

## Typisierte Eigenschaften und Konstruktoren

Mit TypeScript lässt sich die Struktur einer Klasse direkt beschreiben, indem ihre Felder am Anfang der Klasse ähnlich wie bei einer Schnittstelle typisiert werden.

```typescript
class User {
  id: number;
  email: string;
  isActive: boolean;

  constructor(id: number, email: string) {
    this.id = id;
    this.email = email;
    this.isActive = true;
  }
}
```

---

## Zugriffsmodifikatoren

TypeScript fügt `public`, `private` und `protected` hinzu, um zu steuern, wie Member im Code verwendet werden dürfen.

```typescript
class UserAccount {
  public email: string;
  private failedLoginAttempts: number;
  protected role: "user" | "admin";

  constructor(email: string, role: "user" | "admin") {
    this.email = email;
    this.role = role;
    this.failedLoginAttempts = 0;
  }

  registerFailedLogin(): void {
    this.failedLoginAttempts += 1;
  }
}
```

Diese sollten mit klarer Absicht eingesetzt werden:

- `public` ist die Standard-API der Klasse.
- `private` ist für Member, auf die nur die Klasse selbst zugreifen sollte.
- `protected` ist für Member, die die Klasse und ihre Unterklassen verwenden dürfen.

Der `protected`-Modifikator ist nützlich, wenn eine Basisklasse gemeinsames Verhalten oder Zustand hat, den Unterklassen verwenden müssen, der aber nicht Teil der öffentlichen API jeder Instanz sein soll:

```typescript
class Employee {
  protected department: string;

  constructor(department: string) {
    this.department = department;
  }
}

class Manager extends Employee {
  describeDepartment(): string {
    return `Manages the ${this.department} department.`;
  }
}

const manager = new Manager("Engineering");
console.log(manager.department);          // Error: 'department' is protected
console.log(manager.describeDepartment()); // "Manages the Engineering department."
```

Vorsicht ist bei `protected` geboten: Es kann in einer stabilen Vererbungshierarchie gut funktionieren, erhöht aber auch die Kopplung zwischen Eltern- und Kindklassen. Benötigen Unterklassen lediglich gemeinsames Verhalten, ist Komposition oft einfacher.

---

## TypeScript `private` versus JavaScript `#private`

TypeScript `private` wird vom TypeScript-Compiler geprüft. JavaScript `#private` wird von der JavaScript-Laufzeitumgebung erzwungen.

```typescript
class Wallet {
  private ownerId: string;
  #balance: number;

  constructor(ownerId: string, initialBalance: number) {
    this.ownerId = ownerId;
    this.#balance = initialBalance;
  }

  getBalance(): number {
    return this.#balance;
  }
}
```

Die praktische Auswirkung ist unterschiedlich:

- `private ownerId` drückt die Designabsicht gegenüber TypeScript aus; der Compiler lehnt Zugriffe außerhalb der Klasse ab.
- `#balance` erzeugt ein echtes privates Feld im generierten JavaScript; Code, der TypeScript umgeht, kann es zur Laufzeit weder lesen noch ändern.
- Eine `private`-Eigenschaft existiert im generierten JavaScript weiterhin als normale Eigenschaft.
- Der Versuch, von außerhalb des Klassenrumpfs auf ein `#private`-Feld zuzugreifen, ist ein echter JavaScript-Fehler – und nicht nur eine TypeScript-Beschwerde.

Das bedeutet: `private` schützt hauptsächlich während der Entwicklung, `#private` schützt das Feld auch im laufenden Programm.

---

## Kurzschreibweise für Felder

TypeScript prüft, ob die Daten, die einer Instanz zugewiesen werden, der deklarierten Struktur der Klasse entsprechen. In der Klasse `UserAccount` mussten die Typannotationen für `email` und `role` dupliziert werden, da TypeScript nicht automatisch erkennt, dass der Konstruktorparameter `role` zu einem internen Feld `role` wird.

Es gibt jedoch eine Kurzschreibweise, mit der sich genau diese Verbindung angeben lässt. Durch Angabe des Zugriffsmodifizierers (`private`, `public` oder `protected`) vor dem Konstruktorparameter fügt TypeScript den Wert automatisch als Feld gleichen Namens zur Klasse hinzu:

```typescript
class UserAccount {
  private failedLoginAttempts: number = 0;

  constructor(
    public email: string,
    protected role: string,
  ) {}
}
```

Durch das Verschieben des Anfangswerts für `failedLoginAttempts` in die Felddeklaration ist der Konstruktorrumpf nun leer. Dies mag zunächst etwas ungewöhnlich erscheinen, ist aber recht üblich – insbesondere bei NestJS.

Ein Nachteil dieser Kurzschreibweise: Sie kann nicht mit `#private`-Feldern verwendet werden.

---

## Kapselung und kontrollierte Zustandsänderungen

Kapselung bedeutet, dass nur eine Klasse entscheiden kann, wie sich ihr interner Zustand ändern darf. Anstatt anderen Teilen des Programms zu erlauben, Werte direkt zu überschreiben, stellt die Klasse Methoden bereit, die ihre Regeln schützen.

```typescript
class BankAccount {
  #balance: number;

  constructor(initialBalance: number) {
    this.#balance = initialBalance;
  }

  deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error("Deposit amount must be greater than zero.");
    }

    this.#balance += amount;
  }

  getBalance(): number {
    return this.#balance;
  }
}
```

Diese Klasse ist robuster als ein einfaches Objekt mit einer öffentlichen `balance`-Eigenschaft, da sie die Regel schützt, dass eine Einzahlung positiv sein muss. Das `#balance`-Feld ist von außerhalb der Klasse weder auf Sprachebene noch zur Laufzeit erreichbar.

---

## Getter und Setter

Getter und Setter unterstützen zwar die Kapselung, sind aber nicht automatisch besser als einfache Eigenschaften. Man sollte sie verwenden, wenn Logik beim Lesen oder Schreiben benötigt wird.

```typescript
class Employee {
  #salary = 0;

  get salary(): number {
    return this.#salary;
  }

  set salary(newSalary: number) {
    if (newSalary < this.#salary) {
      throw new Error("Salary cannot be decreased.");
    }

    this.#salary = newSalary;
  }
}
```

Dieser Setter ist sinnvoll, weil er eine Regel durchsetzt. Ein Getter oder Setter, der Daten lediglich weiterleitet ohne ihnen Bedeutung zu verleihen, ist in der Regel unnötiger Ballast.

---

## Schnittstellen

Schnittstellen dienen typischerweise dazu, „Verträge" zu definieren, an die sich Klassen halten müssen. Anders ausgedrückt: Die Struktur der Klasse wird zuerst definiert, die Implementierung kommt später.

```typescript
interface Entity {
  id: number;
}

interface Activatable {
  activate(): void;
}

class User implements Entity, Activatable {
  id: number;
  isActive: boolean;

  constructor(id: number) {
    this.id = id;
    this.isActive = false;
  }

  activate(): void {
    this.isActive = true;
  }
}
```

Schnittstellen sind nützlich, wenn man beschreiben möchte, was eine Klasse bereitstellen muss, ohne eine gemeinsame Implementierung zu erzwingen.

Das ist etwas anderes als Vererbung:

- `implements` bedeutet, dass die Klasse einem Vertrag entspricht.
- `extends` bedeutet, dass die Klasse Verhalten von einer Oberklasse wiederverwendet.

Schnittstellen eignen sich für öffentliche APIs, DTO-ähnliche Strukturen oder Funktionen wie `Serializable`. Eine abstrakte Klasse ist dann die bessere Wahl, wenn Unterklassen echten Code erben und derselben Basisstruktur folgen sollen.

---

## Abstrakte Klassen, Polymorphismus und Methodenüberschreibung

Polymorphismus bedeutet, dass verwandte Objekte auf dieselbe Methode unterschiedlich reagieren können. Dies wird häufig mit abstrakten Klassen und deren mehreren Implementierungen realisiert. Eine abstrakte Klasse kann nicht direkt instanziiert werden, sondern muss von anderen Klassen erweitert werden. Auf der Ebene der abstrakten Klasse wird die Funktionalität definiert, die alle Unterklassen implementieren müssen.

```typescript
abstract class NotificationChannel {
  abstract send(message: string): void;
}

class EmailChannel extends NotificationChannel {
  send(message: string): void {
    console.log(`Email: ${message}`);
  }
}

class SmsChannel extends NotificationChannel {
  send(message: string): void {
    console.log(`SMS: ${message}`);
  }
}
```

Code, der von `NotificationChannel` abhängt, kann mit beiden Unterklassen funktionieren, ohne darauf achten zu müssen, welche Unterklasse er erhalten hat.

Abstrakte Klassen sind dann sinnvoll, wenn sowohl gemeinsame Logik für eine Familie verwandter Klassen als auch eine vorgegebene Struktur benötigt werden, die alle Unterklassen einhalten müssen. Wird lediglich ein Vertrag benötigt, ist in der Regel ein Interface ausreichend.

---

## Ressourcen

- [TypeScript-Handbuch: Klassen](https://www.typescriptlang.org/docs/handbook/classes.html)
- [TypeScript-Handbuch: Schnittstellen](https://www.typescriptlang.org/docs/handbook/interfaces.html)
- [MDN: extends](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Classes/extends)
- [Refactoring Guru: Kapselung](https://refactoring.guru/encapsulation)