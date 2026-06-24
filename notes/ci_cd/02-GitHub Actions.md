# DevOps CI/CD – GitHub Actions

Aktuell führen wir Tests manuell aus. Wenn jemand eine Änderung committet und pusht, müssen wir darauf vertrauen, dass die Tests vorher lokal gelaufen sind. Mit **GitHub Actions** lassen sich Arbeitsabläufe automatisch auslösen — zum Beispiel das Ausführen von Tests direkt auf den GitHub-Servern. Es gibt viele weitere CI/CD-Tools für diesen Zweck (Jenkins, CircleCI, Travis CI). Wir wollen uns auf die Grundprinzipien konzentrieren, wie eine Continuous-Integration-Pipeline aussieht. Bei GitHub Actions liegt der gesamte Workflow direkt im Repository:

- **Definieren:** Eine YAML-Datei schreiben, die die Pipeline beschreibt.
- **Auslösen:** Die Datei in einen bestimmten Ordner im Repository committen.
- **Ausführen:** Die Plattform stellt automatisch eine frische virtuelle Maschine bereit, um die Anweisungen auszuführen.

Dieser minimalistische Ansatz erlaubt es uns, uns vollständig darauf zu konzentrieren, wie man CI/CD-Workflows entwirft und schreibt.

---

## Workflow-Datei

Jede GitHub Action wird durch eine **Workflow-Datei** definiert. Diese YAML-Datei legt fest, welche Schritte ausgeführt werden und welche Events die Action auslösen. Eine Workflow-Datei enthält drei Top-Level-Keys: `name`, `on` und `jobs`:

```yaml
name: CI
on:
  push:
    branches: [main, dev]
    paths-ignore: ["**.md", "docs/**"]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version: 26

      - name: Install and Test
        run: npm ci && npm test
```

`name` legt fest, wie der Workflow in der GitHub-Oberfläche angezeigt wird. Der `on`-Block definiert die Trigger, die die Pipeline starten. Die `jobs`-Map beschreibt die eigentliche Arbeit und weist jeden Job einer bestimmten virtuellen Maschine auf den GitHub-Servern zu.

GitHub erkennt Automatisierungs-Pipelines, indem es genau an einem Ort sucht: dem Verzeichnis `.github/workflows/` im Root des Repositories. Jede Datei mit der Endung `.yml` oder `.yaml` in diesem Ordner wird zu einem aktiven Workflow. Üblicherweise werden separate Prozesse in separate Dateien aufgeteilt — z. B. `ci.yml` für Tests und `cd.yml` für das Deployment — damit eine fehlgeschlagene Test-Suite im Actions-Dashboard kein erfolgreiches Deployment visuell verdeckt.

---

## Triggers

Der `on`-Key teilt GitHub mit, wann der Workflow gestartet werden soll. In der Praxis gibt es vier wesentliche Trigger-Typen:

- **`push`** feuert, wenn Commits auf einem Branch landen, den der Workflow beobachtet. CI-Workflows wollen das typischerweise auf jedem Branch; CD-Workflows schränken es meist auf `main` ein. Mit `paths-ignore` lässt sich filtern, welche Dateien den Workflow auslösen.
- **`pull_request`** feuert, wenn ein PR geöffnet, erneut geöffnet oder aktualisiert wird. Der Workflow läuft gegen das simulierte Merge-Ergebnis, nicht gegen den PR-Branch in seinem aktuellen Zustand. Ein erfolgreicher `pull_request`-Run beantwortet also die Frage „Wäre der Stand nach dem Merge noch grün?" — was ein `push`-Run auf dem Quell-Branch allein nicht leisten kann.
- **`schedule`** akzeptiert einen Cron-Ausdruck. Nützlich für Nightly Builds oder geplante Cleanups. Geplante Runs blockieren keinen PR oder Push, daher eignen sie sich nicht als Gating-Mechanismus.
- **`workflow_dispatch`** fügt im Actions-UI einen „Run workflow"-Button hinzu, um den Workflow manuell auszulösen. Nützlich für einmalige Deploys oder Backfills, die nicht automatisch ausgelöst werden sollen.

---

## Runner und Ausführungszustand

Ein **Job** ist die primäre Einheit eines Workflows in GitHub Actions. Die Direktive `runs-on` teilt GitHub mit, welches Betriebssystem-Image bereitgestellt werden soll. Das Image `ubuntu-latest` ist die Standardwahl für Node.js-Backends.

Ein häufiges Missverständnis betrifft den Ausgangszustand dieser Runner: Wenn ein Job startet, ist das Dateisystem **vollständig leer**. Der Repository-Code existiert auf der Maschine erst, nachdem ein Step ihn explizit geklont hat. Jobs teilen auch keinen Zustand miteinander. Wenn in derselben Datei ein `build`-Job und ein `deploy`-Job definiert sind, laufen sie auf zwei voneinander unabhängigen virtuellen Maschinen. Kompilierter Code, der im ersten Job erzeugt wurde, ist weg, sobald dieser Runner heruntergefahren wird — es sei denn, er wird bewusst als Artifact hochgeladen und im zweiten Job heruntergeladen.

---

## Steps und Actions

Innerhalb eines Jobs definiert das `steps`-Array, was in welcher Reihenfolge ausgeführt wird. Ein Step führt entweder einen Shell-Befehl via `run` aus oder ruft eine wiederverwendbare Action via `uses` auf. Jeder Step kann einen optionalen `name` haben, der im Actions-UI sichtbar ist.

```yaml
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

  - name: Test
    run: npm test
```

- **`uses: <repo>@<ref>`** referenziert eine Action anhand von Repository und Version. `@v6` ist ein bewegliches Tag, das der Maintainer bei neuen v6.x-Patches aktualisiert. Dieser Ansatz ist Standard und für die meisten gängigen Anwendungsfälle völlig in Ordnung. Das `actions`-Repository ist die offizielle Quelle für von GitHub veröffentlichte Actions.
- **`with:`** übergibt Inputs an die Action. Jede Action dokumentiert ihr eigenes Input-Schema.
- **`run:`** ist ein Shell-Befehl auf dem Runner. Die Standard-Shell auf Ubuntu-Runnern ist Bash.

Actions sind selbst Repositories. `actions/checkout` liegt unter `github.com/actions/checkout` — der Quellcode lässt sich genau wie jede andere Abhängigkeit lesen. Es empfiehlt sich, bevorzugt den kleinen Satz offizieller, von GitHub gepflegter Actions (`actions/*`) zu verwenden, wenn eine davon zum Anwendungsfall passt.

---

## Secrets Management

Registry-Tokens, Deploy-Hooks, API-Keys und alles andere, was nicht im Repository erscheinen sollte, kommen in **Repository Secrets**. Der Pfad dorthin: Settings → Secrets and variables → Actions → New repository secret. Der Name wird per Konvention in Großbuchstaben geschrieben; der Wert ist nach der Erstellung nur noch schreibbar, nicht mehr lesbar.

Im Workflow werden Secrets mit der `$`-Syntax referenziert:

```yaml
- uses: docker/login-action@v4
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
```

GitHub maskiert jeden Secret-Wert, der in der Step-Ausgabe erscheint — ein versehentliches `echo ${{ secrets.TOKEN }}` erscheint im Log als `***`. Wer Schreibzugriff auf das Repository hat, kann jedoch einen Workflow schreiben, der Secrets auf weniger offensichtlichen Wegen abgreift. Die Liste der Personen mit Schreibzugriff ist damit faktisch die Liste der Personen, die jeden Secret kennen.

> ❗ **Achtung:** Niemals ein Account-Passwort direkt in einen Workflow eintragen. Stattdessen einen **Personal Access Token** (oder das plattformspezifische Äquivalent) verwenden. Tokens lassen sich einzeln widerrufen, auf bestimmte Berechtigungen beschränken und erfordern keine MFA-Eingaben, die der CI-Runner nicht beantworten kann.

---

## Ressourcen

- [GitHub Actions – Dokumentation](https://docs.github.com/en/actions)
- [Workflow-Syntax-Referenz](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Security Hardening für GitHub Actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

---

> **Denkanstoß:** Ein Runner startet mit einem leeren Dateisystem und keinem gemeinsamen Zustand zwischen Jobs. Welche Konsequenzen hat das für den Aufbau einer Pipeline, die erst testet und dann deployed — und wie würdet ihr sicherstellen, dass das gebaute Artefakt sicher von einem Job zum nächsten weitergegeben wird?