# DevOps CI/CD – Continuous Integration

Eine **Continuous-Integration-Pipeline** führt Tests automatisch aus, sobald Code-Änderungen eingebracht werden. Anstatt die Tests lokal auszuführen, laufen sie auf einer sauberen, isolierten virtuellen Maschine auf der CI-Plattform — in unserem Fall GitHub.

Indem der Verifikationsschritt bei jedem Push auf eine saubere, isolierte virtuelle Maschine verlagert wird, garantiert Continuous Integration eine neutrale Umgebung und stellt sicher, dass die Tests tatsächlich ausgeführt wurden. Die CI-Pipeline beantwortet eine einzige, eindeutige Frage: **Ist diese konkrete Code-Änderung sicher zu mergen?** Das Ergebnis — Pass oder Fail — ist direkt am Pull Request sichtbar und macht es dem Team unmöglich, fehlerhaften Code zu ignorieren.

---

## Die Verifikationsstufen

Eine typische Node.js-Pipeline führt drei verschiedene Prüfungen gegen die Codebase aus:

### Linting

Statische Analysetools wie **ESLint** parsen den Code, ohne ihn auszuführen. Sie erkennen Syntaxfehler, unbenutzte Variablen, verbotene Coding-Muster und Formatierungsabweichungen — Dinge, die ein menschlicher Reviewer irgendwann finden würde, aber nicht finden müsste.

### Testing

Die automatisierte Test-Suite (z. B. mit **Vitest**) führt Unit- und Integrationstests aus. Ziel ist eine reproduzierbare Verifikation gegen einen sauberen Checkout: neue Logik muss korrekt funktionieren, alte Logik darf nicht regressiert sein.

### Building

Der Produktions-Kompilierungsschritt (`npm run build`). In TypeScript-Projekten prüft der Compiler die Typsicherheit unabhängig von der Testausführung. Ein Build kann problemlos scheitern, weil ein Typ-Mismatch vorliegt — selbst wenn alle Runtime-Tests grün sind.

Das Bestehen dieser Prüfungen garantiert nicht, dass die Anwendung unter hoher Last in der Produktion einwandfrei läuft. Sie wirken stattdessen als Filter, der die häufigsten Fehler und Syntaxprobleme abfängt, bevor sie die Zeit eines menschlichen Reviewers verschwenden.

Diese Stufen lassen sich mit GitHub Actions wie folgt umsetzen:

```yaml
name: CI Pipeline
on:
  push:
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version: 26
          cache: "npm"

      - name: Install
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm run test

      - name: Build
        run: npm run build
```

Diese Pipeline führt Install, Linting, Testing und Building sequenziell in einem einzigen Job aus.

---

## Die Strenge von `npm ci`

Eine häufige Falle für Einsteiger ist die Verwendung von `npm install` in einer Workflow-Datei. Die CI-Umgebung benötigt eine vollständig vorhersagbare Installation — und genau das ist `npm install` nicht darauf ausgelegt zu liefern.

**`npm install`** ist für die lokale Entwicklung optimiert. Es liest `package.json`, löst den Dependency-Tree dynamisch auf, aktualisiert `node_modules` inkrementell und schreibt `package-lock.json` stillschweigend um, wenn es eine andere Dependency-Version für sinnvoller hält.

**`npm ci`** (Clean Install) ist ausschließlich für automatisierte Umgebungen gedacht. Es ignoriert `package.json` vollständig und liest direkt aus der `package-lock.json`. Es löscht jeden vorhandenen `node_modules`-Ordner, installiert den im Lockfile festgelegten exakten Dependency-Tree von Grund auf und schlägt sofort fehl, wenn Lockfile und `package.json` nicht synchron sind. Es verändert keine Dateien.

Ein CI-Runner muss immer exakt denselben Dependency-Tree bauen, gegen den der Entwickler lokal getestet hat. `npm ci` erzwingt genau diese Anforderung.

---

## Caching von Dependencies

Das Herunterladen und Installieren von Node-Modulen bei jedem einzelnen Push kostet erheblich Zeit. Mit dem Caching-Mechanismus der Standard-Setup-Actions lässt sich diese Strafe vermeiden.

Wenn der Node-Setup-Step mit `cache: 'npm'` konfiguriert wird, generiert der Runner einen eindeutigen Hash basierend auf dem Inhalt der `package-lock.json`. Beim ersten Run führt die Pipeline die vollständige Installation durch und speichert den resultierenden `~/.npm`-Ordner unter diesem Hash im Cache.

Bei nachfolgenden Runs — solange sich die `package-lock.json` nicht verändert hat — bleibt der Hash identisch. Der Runner lädt den gecachten Ordner nahezu sofort herunter und reduziert den `npm ci`-Schritt von einem minutenlangen Download auf ein sekundenbruchteillang dauerndes lokales Kopieren. Sobald ein Entwickler ein neues Paket installiert und den Lockfile aktualisiert, ändert sich der Hash, der Cache verfehlt, und das System legt automatisch einen frischen Cache an.

---

## Jobs parallel ausführen

Linting, Testing und Building lassen sich sequenziell innerhalb eines einzigen Jobs ausführen. Dauert Linting jedoch eine Minute und Testing zwei Minuten, beträgt die Gesamtwartezeit drei Minuten. Werden sie in parallele Jobs aufgeteilt, sinkt die Wartezeit auf die Dauer des langsamsten Einzeltasks.

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 26
          cache: "npm"
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 26
          cache: "npm"
      - run: npm ci
      - run: npm run test
```

Diese Konfiguration dupliziert absichtlich die Checkout-, Setup- und Install-Schritte. Das mag ineffizient wirken, ist es aber nicht: Ein vorhandener `npm ci`-Cache macht diese Schritte schnell. Zwei parallele Runner, die jeweils 15 Sekunden Setup durchlaufen, schließen ihre jeweiligen Aufgaben weit früher ab als ein einzelner Runner, der alles nacheinander abarbeitet.

---

## Ressourcen

- [npm ci – Referenz](https://docs.npmjs.com/cli/v10/commands/npm-ci)
- [Caching von Dependencies in GitHub Actions](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [ESLint – Dokumentation](https://eslint.org/docs/latest/)

---

> **Denkanstoß:** Eine CI-Pipeline ist kein Qualitätsgarant, sondern ein Filter. Welche Arten von Fehlern würde eine Pipeline mit Linting, Testing und Build-Check *nicht* erkennen — und was sagt das darüber aus, welche Verantwortung beim menschlichen Code-Review verbleibt?