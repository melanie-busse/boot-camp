# Software-Designparadigmen – Objektorientierte Programmierung

Funktionaler Code eignet sich gut, wenn es hauptsächlich darum geht, Daten durch ein System zu bewegen. Ab einem gewissen Punkt wirken manche Anwendungsfälle jedoch unpraktisch, wenn sie nur aus einzelnen Funktionen und einfachen Objekten bestehen. Wenn beispielsweise ein Prozess wissen muss, ob eine `Order` abgebrochen werden kann oder wie ein `BankAccount` sein Guthaben verändert, ist es sinnvoll, Daten und Verhalten zusammenzuhalten.

Das ist der Grundgedanke der objektorientierten Programmierung (OOP). OOP modelliert ein Programm als eine Reihe von Objekten, die jeweils ihren eigenen Zustand und das darauf wirkende Verhalten besitzen.

---

## Objekte, Klassen und Instanzen

Ein **Objekt** ist ein Wert, der Daten und Funktionen gleichzeitig speichern kann. Eine **Klasse** ist eine Vorlage zur Erstellung von Objekten mit derselben Struktur und demselben Verhalten. Jedes Objekt, das anhand dieser Vorlage erstellt wird, wird als **Instanz** dieser Klasse bezeichnet.

```typescript
class BankAccount {
  ownerName: string;
  balance: number;

  constructor(ownerName: string, balance: number) {
    this.ownerName = ownerName;
    this.balance = balance;
  }

  deposit(amount: number): void {
    this.balance += amount;
  }
}

const account = new BankAccount("Aylin", 1000);
account.deposit(250);
```

Dieses Beispiel fasst die Kontodaten und das Kontoverhalten an einem Ort zusammen. Das ist oft einfacher nachzuvollziehen, als das Konto als einfaches Objekt zu speichern und es über unabhängige Hilfsfunktionen zu aktualisieren.

---

## Die vier Säulen der OOP

Man sieht oft vier Begriffe, die zur Beschreibung der objektorientierten Programmierung verwendet werden:

- **Kapselung** bedeutet die Kontrolle darüber, wie interne Zustände gelesen oder verändert werden.
- **Abstraktion** bedeutet, die Bedürfnisse eines anderen Programmteils offenzulegen, ohne jedes interne Detail preiszugeben.
- **Vererbung** bedeutet, eine Klasse von einer anderen Klasse abzuleiten, damit diese Verhalten wiederverwenden oder erweitern kann.
- **Polymorphismus** bedeutet, dass verschiedene Objekte auf denselben Methodennamen auf unterschiedliche Weise reagieren können.

Diese Ideen sind nützlich, aber sie stellen keine Checkliste dar, die man in jeder Situation abarbeiten muss. In der Praxis sind die wichtigsten Fragen einfacher:

- Besitzt dieses Objekt einen Zustand, der gesteuert werden sollte?
- Gehört dieses Verhalten von Natur aus zu diesem Objekt?
- Würde es den Code verständlicher machen, wenn man sie in einer Klasse zusammenfasst?

---

## Wann eignet sich OOP?

OOP ist oft gut geeignet, wenn:

- das Projekt langlebige Elemente wie Benutzer, Bestellungen, Warenkörbe oder Rechnungen enthält,
- diese Elemente Regeln darüber haben, wie sich ihr Zustand ändern kann,
- mehrere Verhaltensweisen auf denselben internen Daten basieren.

Ein Bestellobjekt könnte beispielsweise Aktionen wie `pay()` nur dann zulassen, wenn der aktuelle Status `"open"` ist. Diese Regel gehört zur Bestellung selbst und nicht zu einer beliebigen Hilfsfunktion an anderer Stelle im Quellcode.

---

## TypeScript und das Klassenmodell

TypeScript erfindet keine Klassen. Es baut auf dem Klassensystem von JavaScript auf und fügt Typen, Zugriffsmodifizierer, Schnittstellen und abstrakte Klassen hinzu. Diese Kombination erleichtert die klare Modellierung von Domänenregeln und das frühzeitige Erkennen von Fehlern während der Entwicklung.

---

## Ressourcen

- [MDN: Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- [TypeScript-Handbuch: Klassen](https://www.typescriptlang.org/docs/handbook/classes.html)