# DevOps Testing – Test-Driven Development

## Eine verbreitete Gewohnheit

Eine besonders häufige Angewohnheit unter (~~angehenden~~) Entwicklerinnen und Entwicklern ist es, Tests als nachträglichen Gedanken zu behandeln: Feature bauen, manuell prüfen, ob es funktioniert – und irgendwann einen Test schreiben, um das Verhalten zu fixieren. **Test-Driven Development (TDD)** kehrt diesen Ablauf vollständig um.

Das Prinzip ist leicht zu verstehen, aber schwer zu meistern. Anstatt Code zu schreiben, der ein Problem löst, schreibt man zuerst einen Test, der das erwartete Ergebnis definiert. Danach schreibt man genau die Menge an Code, die nötig ist, um diesen Test zum Bestehen zu bringen. Dieser Ansatz legt fest, wie Funktionen verwendet werden, welche Eingaben sie erwarten und welche Ausgaben sie liefern – anstatt sich in der internen Logik zu verlieren.

---

## Der Red-Green-Refactor-Zyklus

TDD basiert auf einem strengen, kontinuierlichen Rhythmus. Produktionscode wird nur geschrieben, wenn ein fehlschlagender Test es verlangt.

### 🔴 Red – Einen fehlschlagenden Test schreiben

Übersetze eine einzelne fachliche Anforderung in Code. Starte die Test-Suite. Sie wird fehlschlagen – und das soll sie auch, denn die zugrundeliegende Funktion existiert noch nicht oder besitzt die notwendige Logik noch nicht. Den Fehler zu sehen bestätigt, dass der Test tatsächlich etwas überprüft.

### 🟢 Green – Den Test zum Bestehen bringen

Schreibe den einfachsten, direktesten Code, um den Test grün zu machen. Eleganz oder Skalierbarkeit spielen hier noch keine Rolle. Hardcodierte Werte sind ausdrücklich erlaubt. Das einzige Ziel ist, die Testbedingung zu erfüllen.

### 🔵 Refactor – Aufräumen

Jetzt, wo das Sicherheitsnetz aktiv ist, kann die Codestruktur verbessert werden: Duplikate entfernen, Hilfsfunktionen auslagern, bessere Bezeichnungen wählen. Da die Tests im Watch-Modus ständig laufen, merkt man sofort, ob das Aufräumen die Logik beschädigt.

Durch die ständige Wiederholung dieses Zyklus folgt man dem TDD-Paradigma.

---

## TDD in der Praxis: Die Bibliotheks-Mahngebühr

Wir bauen eine Funktion `calculateLateFee`, die Mahngebühren für überfällige Bibliotheksbücher berechnet. Die fachlichen Regeln lauten: **2 € pro Überfälligkeitstag**, maximal jedoch **10 €**.

### Schritt 1 – Red: Die erste Erwartung definieren

Erstelle eine Datei `library.spec.ts` (im vorherigen Verzeichnis oder einem neuen):

```typescript
// library.spec.ts
import { describe, it, expect } from "vitest";
import { calculateLateFee } from "./library";

describe("calculateLateFee", () => {
  it("berechnet 2 € pro Überfälligkeitstag", () => {
    const fee = calculateLateFee(3);
    expect(fee).toBe(6);
  });
});
```

Das Ausführen wirft sofort einen Fehler, weil `calculateLateFee` noch nicht existiert.

### Schritt 2 – Green: Den Test zum Bestehen bringen

Erstelle `library.ts` mit der direktesten möglichen Logik:

```typescript
// library.ts
export function calculateLateFee(daysOverdue: number): number {
  return daysOverdue * 2;
}
```

Der Test besteht. Noch gibt es keine komplexe Logik zum Refaktorieren – also geht es weiter zur nächsten Anforderung: der Gebührenobergrenze.

### Schritt 3 – Red: Neue Anforderung, neuer Test

Füge einen weiteren Test in die Testdatei ein:

```typescript
// library.spec.ts
import { expect, it } from "vitest";
import { calculateLateFee } from "./library";

it("begrenzt die maximale Mahngebühr auf 10 €", () => {
  const fee = calculateLateFee(7);
  expect(fee).toBe(10);
});
```

Vitest meldet einen Fehler. Sieben Überfälligkeitstage ergeben aktuell 14, nicht 10.

### Schritt 4 – Green: Beide Tests erfüllen

Die Funktion wird um die Obergrenze erweitert:

```typescript
// library.ts
export function calculateLateFee(daysOverdue: number): number {
  const fee = daysOverdue * 2;
  if (fee > 10) {
    return 10;
  }
  return fee;
}
```

Die Suite ist wieder grün.

### Schritt 5 – Refactor: Struktur verbessern

Die Logik funktioniert, lässt sich aber mit JavaScript-Bordmitteln kompakter ausdrücken – ohne das Verhalten zu verändern:

```typescript
// library.ts
export function calculateLateFee(daysOverdue: number): number {
  return Math.min(daysOverdue * 2, 10);
}
```

Die Tests bestätigen, dass der refaktorierte Code die fachlichen Anforderungen weiterhin vollständig erfüllt.

---

## Fazit

Wenn Tests die Implementierung vorgeben, entsteht naturgemäß eine hohe Testabdeckung – und man wird davon abgehalten, zu viel auf Vorrat zu entwickeln. Letztlich wird die Test-Suite zur **lebendigen Dokumentation der fachlichen Logik**.

> **Denkanstoß:** Was passiert bei `calculateLateFee(0)`? Und was bei negativen Werten? Sollte die Funktion solche Eingaben stillschweigend akzeptieren – oder mit einem Fehler reagieren?