# Software Design – CS Grundlagen: Aufgaben

---

## 1. Big-O-Analyse

Jedes der folgenden Snippets nimmt ein Array `arr` der Länge `n`. Ordne jedem eine Big-O-Komplexitätsklasse zu und begründe die Antwort in einem Satz.

### Snippet 1
```js
function first(arr) {
  return arr[0];
}
```
**O(1)** — Direkter Indexzugriff: unabhängig von der Array-Länge ist es immer eine einzige Operation.

---

### Snippet 2
```js
function second(arr) {
  let total = 0;
  for (const value of arr) {
    total += value;
  }
  return total;
}
```
**O(n)** — Eine einzige Schleife über alle n Elemente: die Laufzeit wächst linear mit der Eingabegröße.

---

### Snippet 3
```js
function third(arr) {
  for (const a of arr) {
    for (const b of arr) {
      if (a === b) console.log(a);
    }
  }
}
```
**O(n²)** — Zwei verschachtelte Schleifen, die beide n-mal laufen: jedes Paar im Array wird verglichen.

---

### Snippet 4
```js
function fourth(arr) {
  for (const value of arr) {
    for (let i = 0; i < 10; i++) {
      console.log(value, i);
    }
  }
}
```
**O(n)** — Die innere Schleife läuft immer genau 10-mal (konstant), nur die äußere wächst mit n, weshalb das Produkt O(10n) = O(n) ergibt.

---

### Snippet 5
```js
function fifth(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  return [...fifth(arr.slice(0, mid)), ...fifth(arr.slice(mid))];
}
```
**O(n log n)** — Rekursives Halbieren erzeugt log n Ebenen; das Zusammenführen mit dem Spread-Operator kostet auf jeder Ebene O(n), was insgesamt n log n ergibt.

---

## 2. Insertion Sort implementieren

Schreibe eine `insertionSort`-Funktion, die ein Array von Zahlen entgegennimmt und es aufsteigend sortiert zurückgibt. Orientiere dich am Algorithmus aus der Algorithmen-Datei: Durchlaufe das Array ab dem zweiten Element, und schiebe für jedes Element dieses nach links an jedem größeren Wert vorbei, bis es an der richtigen Stelle landet.

```ts
function insertionSort(arr: number[]): { sorted: number[]; comparisons: number } {
  const a = [...arr]; // Kopie anlegen, Original unberührt lassen
  let comparisons = 0;

  for (let i = 1; i < a.length; i++) {
    const current = a[i];
    let j = i - 1;

    // current nach links schieben, solange größere Werte links stehen
    while (j >= 0 && (++comparisons, a[j] > current)) {
      a[j + 1] = a[j];
      j--;
    }

    a[j + 1] = current;
  }

  return { sorted: a, comparisons };
}

// ── Testfälle ──────────────────────────────────────────────────────────────

const cases: [string, number[]][] = [
  ["unsortiert      [5,2,4,6,1,3]", [5, 2, 4, 6, 1, 3]],
  ["bereits sortiert [1,2,3,4,5] ", [1, 2, 3, 4, 5]],
  ["umgekehrt sortiert [5,4,3,2,1]", [5, 4, 3, 2, 1]],
  ["einzelnes Element [42]        ", [42]],
];

for (const [label, input] of cases) {
  const { sorted, comparisons } = insertionSort(input);
  console.log(`${label}  →  ${JSON.stringify(sorted)}  (${comparisons} Vergleiche)`);
}
```

### Entwurfsentscheidungen

- **Kopie statt Mutation** — `[...arr]` schützt den Aufrufer vor unerwarteten Seiteneffekten.
- **Abbruchbedingung der inneren Schleife** — `j >= 0 && a[j] > current` stoppt, sobald kein größeres Element mehr links steht.
- **Leeres Array / Länge 1** — die äußere `for`-Schleife beginnt bei Index 1 und läuft gar nicht an; kein Sonderfall nötig.

### Vergleichszahlen der Testfälle

| Eingabe | Vergleiche | Erklärung |
|---|---|---|
| `[1, 2, 3, 4, 5]` | 4 | Innere Schleife bricht sofort ab — **O(n) bester Fall** |
| `[5, 4, 3, 2, 1]` | 10 | Jedes Element muss bis ganz nach vorne — **O(n²) schlechtester Fall** |
| `[42]` | 0 | Keine Iteration überhaupt |

Der Unterschied zwischen dem bereits sortierten und dem umgekehrt sortierten Fall macht in der Praxis sichtbar, was die Algorithmen-Datei mit „O(n²) schlechtester Fall, aber O(n) bester Fall" meint.

---

## 3. Undo / Redo

Baue eine kleine UI mit einem Texteingabefeld und zwei Buttons — *Undo* und *Redo* — die zwei Stacks nutzt, um den Bearbeitungsverlauf zu verfolgen. Verwende Vanilla TypeScript und HTML.

### Zu verfolgender Zustand

- `current` — der aktuelle Wert des Eingabefelds
- `back`-Stack — frühere Werte des Eingabefelds
- `forward`-Stack — Werte, die rückgängig gemacht wurden

### Verhalten bei jeder Aktion

- **Änderung im Eingabefeld:** Lege den vorherigen Wert auf `back`, aktualisiere `current` auf den neuen Wert und leere `forward`.
- **Undo** (wenn `back` nicht leer ist): Lege `current` auf `forward`, pop das oberste Element von `back` und setze es als `current`.
- **Redo** (wenn `forward` nicht leer ist): Lege `current` auf `back`, pop das oberste Element von `forward` und setze es als `current`.
- Deaktiviere den *Undo*-Button, wenn `back` leer ist, und den *Redo*-Button, wenn `forward` leer ist.

### Implementierung

```ts
// ── Zustand ────────────────────────────────────────────────────────────────
let current = "";
const back:    string[] = [];   // frühere Werte
const forward: string[] = [];   // rückgängig gemachte Werte

// ── DOM-Referenzen ─────────────────────────────────────────────────────────
const editor  = document.getElementById("editor")  as HTMLInputElement;
const btnUndo = document.getElementById("btn-undo") as HTMLButtonElement;
const btnRedo = document.getElementById("btn-redo") as HTMLButtonElement;

// ── Render ─────────────────────────────────────────────────────────────────
function render(): void {
  if (editor.value !== current) editor.value = current;
  btnUndo.disabled = back.length === 0;
  btnRedo.disabled = forward.length === 0;
}

// ── Aktionen ───────────────────────────────────────────────────────────────
editor.addEventListener("input", () => {
  back.push(current);       // vorherigen Wert sichern
  current = editor.value;   // aktuellen Wert aktualisieren
  forward.length = 0;       // Redo-Verlauf leeren
  render();
});

btnUndo.addEventListener("click", () => {
  if (back.length === 0) return;
  forward.push(current);
  current = back.pop()!;
  render();
});

btnRedo.addEventListener("click", () => {
  if (forward.length === 0) return;
  back.push(current);
  current = forward.pop()!;
  render();
});

render(); // Initialzustand
```

### Warum zwei Stacks?

Der `back`-Stack und der `forward`-Stack spiegeln genau das LIFO-Prinzip wider, das einen Stack auszeichnet. `push` und `pop` sind beide O(1) — der gesamte Undo/Redo-Mechanismus läuft in konstanter Zeit, unabhängig davon, wie lang der Verlauf ist. Das Leeren von `forward` bei jeder neuen Eingabe stellt sicher, dass kein „verwaister" Redo-Verlauf nach einem echten Bearbeitungsschritt erhalten bleibt.