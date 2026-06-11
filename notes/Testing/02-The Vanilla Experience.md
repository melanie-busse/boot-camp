# DevOps Testing – Der klassische Einstieg

## Jenseits von Console Logs

Jede Entwicklerin und jeder Entwickler beginnt das „Testen" auf dieselbe Weise: mit einem Dutzend `console.log()`-Aufrufen, die kreuz und quer durch die Codebasis verstreut sind. Das Ergebnis wird im Terminal ausgegeben, mit dem verglichen, was man im Kopf erwartet hat – und dann hofft man das Beste.

Für kurze Skripte mag das noch funktionieren. Sobald eine Anwendung jedoch wächst, werden manuelle Terminal-Checks schnell zeitaufwendig. Automatisiertes Testen nimmt genau diese mentale Last – „stimmt die Ausgabe mit meiner Erwartung überein?" – und überführt sie in formalen Code.

---

## Vitest

Um automatisierte Prüfungen zu schreiben und auszuführen, brauchen wir ein Testing-Framework. Während Jest jahrelang die Branche dominiert hat, hat sich Vitest rasch zum modernen Standard entwickelt. Es ist außergewöhnlich schnell, unterstützt TypeScript direkt ohne zusätzliche Konfiguration und teilt exakt dieselbe API wie Jest. Wer eines kennt, kann sofort auch das andere verwenden.

Statt nur darüber zu lesen, bauen wir schnell eine kleine Sandbox. Öffne das Terminal in einem neuen, leeren Ordner und initialisiere ein Basisprojekt:

```bash
npm init -y
npm install -D vitest typescript
```

Testing-Frameworks stellen drei Kernhilfsmittel bereit, um Tests zu strukturieren:

| Funktion | Bedeutung |
|---|---|
| `describe` | Fasst verwandte Tests unter einem gemeinsamen Kontext zusammen. |
| `it` (oder `test`) | Definiert ein einzelnes, konkretes Test-Szenario. |
| `expect` | Formuliert eine Behauptung über die Ausgabe des Codes. |

---

## Den ersten Test schreiben

Wir verlassen das NestJS-Ökosystem kurz und testen eine einfache TypeScript-Funktion. Erstelle eine Datei namens `cart.ts` mit einer Hilfsfunktion, die den Endpreis eines Warenkorbs nach Abzug eines prozentualen Rabatts berechnet:

```typescript
// cart.ts
export function calculateDiscount(price: number, percentage: number): number {
  if (price < 0 || percentage < 0) {
    throw new Error("Values cannot be negative");
  }
  return price - price * (percentage / 100);
}
```

Erstelle anschließend direkt daneben die Testdatei `cart.spec.ts`. Sie importiert die Funktion und ruft sie mit verschiedenen Eingaben auf, um ihr Verhalten zu verifizieren:

```typescript
// cart.spec.ts
import { describe, it, expect } from "vitest";
import { calculateDiscount } from "./cart";

describe("calculateDiscount", () => {
  it("wendet einen Standard-Rabatt von 10 % korrekt an", () => {
    const result = calculateDiscount(100, 10);
    expect(result).toBe(90);
  });

  it("gibt bei 0 % Rabatt den ursprünglichen Preis zurück", () => {
    const result = calculateDiscount(50, 0);
    expect(result).toBe(50);
  });

  it("wirft einen Fehler bei negativem Preis", () => {
    expect(() => calculateDiscount(-10, 20)).toThrow(
      "Values cannot be negative",
    );
  });
});
```

Das Muster ist klar erkennbar: Zunächst werden die Ausgangsbedingungen festgelegt und die Funktion aufgerufen. Anschließend wird eine strenge Erwartung formuliert, die das Verhalten einfriert. Gibt `calculateDiscount(100, 10)` jemals etwas anderes als `90` zurück, schlägt die Test-Suite sofort fehl.

---

## Tests ausführen

Starte die Tests im Watch-Modus mit folgendem Befehl:

```bash
vitest
```

Vitest beobachtet dann alle Dateien und führt betroffene Tests bei jeder Änderung automatisch erneut aus.

Soll die Test-Suite nur einmal durchlaufen werden – etwa in einer CI/CD-Pipeline – füge das Schlüsselwort `run` hinzu:

```bash
vitest run
```

---

> **Denkanstoß:** Welche Eingaben hat `calculateDiscount` noch gar nicht getestet? Was passiert bei `percentage > 100` – also einem „Rabatt", der den Preis ins Negative treibt?