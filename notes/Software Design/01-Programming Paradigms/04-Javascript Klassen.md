# Software-Designparadigmen – JavaScript-Klassen

Bevor wir uns eingehender mit der TypeScript-spezifischen Klassensyntax befassen, werfen wir einen Blick auf das native Klassenmodell von JavaScript. Die JavaScript-Klassensyntax bietet Entwicklern eine vertraute Struktur und einen bekannten Prozess zur Erstellung von Klassen. Im Hintergrund verwendet sie jedoch ältere Konzepte, die bereits vor der Einführung der Klassensyntax in JavaScript zum Aufbau klassenähnlicher Strukturen dienten.

Am wichtigsten ist es zu verstehen, welcher Teil der Klassensyntax zu JavaScript bzw. TypeScript gehört, da JavaScript-Syntaxmerkmale zur Laufzeit gültig bleiben – im Gegensatz zu TypeScript-Merkmalen, die zur Kompilierzeit aus der Codebasis entfernt werden.

---

## Eine Klasse definieren

JavaScript verwendet das Schlüsselwort `class`, um eine Vorlage für die Erstellung von Objekten zu definieren.

```javascript
class Book {
  constructor(title, author) {
    this.title = title;
    this.author = author;
  }

  describe() {
    return `${this.title} by ${this.author}`;
  }
}

const dune = new Book("Dune", "Frank Herbert");
console.log(dune.describe()); // "Dune by Frank Herbert"
```

Diese Teile bilden die Klasse:

- `class Book` definiert den Entwurf.
- `constructor(...)` wird ausgeführt, wenn eine neue Instanz mit `new` erstellt wird.
- `describe()` definiert das Verhalten, das von jeder Instanz geteilt wird.

Das Schlüsselwort `this` ist ein Platzhalter für das Klasseninstanzobjekt. Es ermöglicht den Zugriff auf alle anderen Werte, Zustände und Methoden, die für diese Instanz definiert sind. Beim Aufruf von `dune.describe()` bezieht sich `this` innerhalb der Methode auf das Objekt `dune`.

---

## Öffentliche, private und statische Felder

JavaScript-Klassen unterstützen standardmäßig öffentliche Member, `static`-Member in der Klasse selbst und `#private`-Felder für echte Laufzeit-Privatsphäre.

```javascript
class Counter {
  static description = "Counts things";
  #count = 0;

  increment() {
    this.#count += 1;
  }

  getCount() {
    return this.#count;
  }
}
```

TypeScript hat zwar ein eigenes `private`-Schlüsselwort, aber es funktioniert anders als `#private`. Dieser Unterschied wird in einem späteren Kapitel erläutert.

---

## Getter und Setter

JavaScript-Klassen können Getter und Setter definieren, um zu steuern, wie eine Eigenschaft gelesen oder geschrieben wird. Sie sehen bei der Verwendung wie Eigenschaften aus, führen aber im Hintergrund Methoden aus.

```javascript
class BankAccount {
  #balance = 0;

  constructor(initialBalance) {
    this.balance = initialBalance;
  }

  get balance() {
    return this.#balance;
  }

  set balance(newBalance) {
    if (newBalance < 0) {
      throw new Error("Balance cannot be negative.");
    }

    this.#balance = newBalance;
  }
}

const account = new BankAccount(100);
console.log(account.balance); // calls the getter
account.balance = 250;        // calls the setter
account.balance = -100;       // throws an Error, since newBalance is smaller than 0
```

Getter und Setter sind nützlich, wenn eine Klasse einen Wert validieren, einen Wert berechnen oder einen internen Zustand hinter einer eigenschaftsähnlichen API schützen muss.

---

## Vererbung in JavaScript

JavaScript-Klassen verwenden `extends`, um von einer anderen Klasse zu erben, und `super(...)`, um den Konstruktor der Elternklasse aufzurufen.

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} makes a noise.`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }

  speak() {
    return `${this.name} barks.`;
  }
}
```

`Dog` erbt von `Animal`: Der Konstruktor der Elternklasse wird über `super(...)` aufgerufen, und `speak` wird überschrieben. Mit diesem Hintergrundwissen werden die TypeScript-spezifischen Klassenfunktionen im nächsten Kapitel leichter verständlich sein.

---

## Optional: JavaScript-Klassen vor ES6

Bevor die `class`-Syntax hinzugefügt wurde, erlaubte JavaScript bereits, dass Objekte Funktionen als Eigenschaften (auch Methoden genannt) speichern konnten. Methoden sind nicht auf Klassen beschränkt:

```javascript
const book = {
  title: "Dune",
  describe() {
    return this.title;
  },
};
console.log(book.describe());
```

Wenn man Methoden definieren möchte, die von vielen Objekten geerbt werden, benötigt man einen strukturierteren Ansatz. Vor ES6-Klassen verwendeten Entwickler Konstruktorfunktionen zusammen mit `new`, um gemeinsam genutzte Methoden an ein `prototype`-Objekt anzuhängen:

```javascript
function Book(title, author) {
  this.title = title;
  this.author = author;
}

Book.prototype.describe = function () {
  return `${this.title} by ${this.author}`;
};

const dune = new Book("Dune", "Frank Herbert");
console.log(dune.describe()); // "Dune by Frank Herbert"
```

Der Mechanismus, der dies ermöglicht, ist das **Prototypensystem** von JavaScript. Jedes Objekt besitzt eine interne Verknüpfung zu einem anderen Objekt, seinem Prototyp. Beim Zugriff auf eine Eigenschaft oder Methode prüft JavaScript zunächst das Objekt selbst. Ist die Eigenschaft dort nicht vorhanden, folgt es der Prototypenverknüpfung und prüft das nächste Objekt, bis die Eigenschaft gefunden wird oder die Kette endet. Ein Prototyp ist somit der Ort, an dem gemeinsam genutztes Verhalten gespeichert werden kann: Anstatt dieselbe Methode in jedem Objekt zu speichern, speichert JavaScript sie einmalig im Prototyp und ermöglicht so die Wiederverwendung durch mehrere Objekte.

Die moderne `class`-Syntax löst dasselbe Problem, ist aber leichter lesbar. Intern verwendet sie weiterhin Prototypen – die Definition einer Methode in einer Klasse speichert diese im Klassenprototyp, anstatt sie in jede Instanz zu kopieren, sodass alle `Book`-Instanzen dieselbe `describe()`-Methode verwenden:

```javascript
class Book {
  constructor(title) {
    this.title = title;
  }
  describe() {
    return this.title;
  }
}
const duneBook = new Book("Dune");
console.log(Object.getPrototypeOf(duneBook) === Book.prototype); // true
```

Bei genauerer Betrachtung ergeben sich zwei zusammenhängende Konzepte: `Book.prototype` ist das Objekt, in dem die gemeinsam genutzten Methoden für `Book`-Instanzen definiert sind; der interne Link einer Instanz verweist auf dasselbe Objekt. In Entwicklertools und älteren Erklärungen wird dieser Link als `__proto__` dargestellt:

```javascript
console.log(duneBook.__proto__ === Book.prototype); // true
```

Beide beziehen sich auf dasselbe Objekt aus unterschiedlichen Richtungen. `Object.getPrototypeOf(...)` ist heutzutage die Standardmethode, um den Prototyp eines Objekts zu untersuchen, aber `__proto__` lohnt sich dennoch zu kennen, da es in Debugging-Ausgaben und älterem Material auftaucht.

Die Prototypensuche ist nicht unendlich. Die meisten Ketten erreichen irgendwann `Object.prototype`, und darüber hinaus kommt `null`:

```javascript
console.log(Object.getPrototypeOf(Book.prototype) === Object.prototype); // true
console.log(Object.getPrototypeOf(Object.prototype)); // null
```

Deshalb sind Methoden wie `toString()` für so viele Objekte verfügbar: Sie stammen von `Object.prototype`.

---

## Ressourcen

- [MDN: Vererbung und die Prototypenkette](https://developer.mozilla.org/de/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [MDN: Private Class Features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties)