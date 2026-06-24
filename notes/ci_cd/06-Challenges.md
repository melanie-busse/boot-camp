# DevOps CI/CD – Challenges

## CyberChat Goes Live

CyberChat ist zu einer echten Anwendung herangewachsen: typisierte API, getestete Service-Schicht und ein TypeORM-gestütztes Datenmodell, das nun mit Postgres spricht — aber die App läuft noch nur auf dem eigenen Laptop. Am Ende dieser Challenges wird sie unter einer öffentlichen URL erreichbar sein, sich bei jedem Push auf `main` selbst redeployen und Daten in einer Managed-Postgres-Instanz persistieren, die Container-Neustarts überlebt.

Arbeite im selben CyberChat-Repository, das du bisher verwendet hast.

---

### Challenge 1 – Ein erster CI-Workflow

Erstelle die Workflow-Datei an dem einzigen Ort, an dem GitHub nach ihr sucht.

**Designfrage:** Welche zwei Trigger-Events zusammen decken sowohl „ein Branch in aktiver Entwicklung" als auch „ein Feature-Branch kurz vor dem Merge" ab? Konfiguriere den Workflow so, dass er auf beide hört.

Definiere einen einzigen Job auf `ubuntu-latest`, mit Node 26, dem gecachten npm-Downloadverzeichnis (keyed auf `package-lock.json`). Führe innerhalb des Jobs das Test-Script und den Production Build nacheinander aus.

Push den Workflow. Beobachte den Run im Actions-Tab und notiere, wie lange der gesamte Job von Anfang bis Ende dauert. Diese Zahl ist dein Ausgangswert für die nächste Aufgabe.

📖 Ressource: [Workflow syntax for GitHub Actions](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---

### Challenge 2 – CI für Parallelität refactorn

Der Single-Job-CI funktioniert, aber die zwei Stages verschwenden gegenseitig Zeit. Ersetze sie durch zwei parallel laufende Jobs.

Ersetze den einen Job aus Challenge 1 durch zwei unabhängige Jobs, die parallel auf `ubuntu-latest` laufen.

Jeder Job benötigt seinen eigenen Checkout, sein eigenes Node-Setup mit npm-Cache und sein eigenes `npm ci`, bevor das eigentliche Script ausgeführt wird.

📖 Ressource: [Using jobs in a workflow](https://docs.github.com/en/actions/using-workflows/about-workflows#creating-dependent-jobs)

---

### Challenge 3 – Erstes manuelles Deployment auf Render

Falls noch nicht geschehen, erstelle einen Render-Account und melde dich im Dashboard an. Erstelle außerdem einen Docker-Hub-Account, falls du noch keinen hast.

- Bestätige, dass das Dockerfile das Anwendungs-Image noch lokal baut.
- Tagge das Image für deinen Docker-Hub-Account und push es.
- Erstelle auf Render einen neuen Web Service vom Typ „Existing image from a registry" und verweise ihn auf das eben gepushte Image. Wähle den kostenlosen Instance-Typ und die Region Frankfurt.
- Erstelle im Render-Dashboard eine neue PostgreSQL-Instanz im Free-Plan, ebenfalls in der Region Frankfurt.
- Nach der Bereitstellung zeigt die Datenbankseite zwei Connection-URLs an.
- Bevor Render den Container startet, konfiguriere eine Umgebungsvariable `DATABASE_URL` am Web Service. Verwende die Postgres-URL, die in diesem Kontext die richtige ist.
- Warte, bis Render das Image gezogen und den Container gestartet hat, öffne dann die öffentliche URL und bestätige, dass CyberChat antwortet.

📖 Ressource: [Render PostgreSQL documentation](https://render.com/docs/databases)
📖 Ressource: [Deploy an image from a registry on Render](https://render.com/docs/deploy-an-image)

---

### Challenge 4 – Der CD-Workflow

Automatisiere alles, was du gerade manuell gemacht hast. Der CD-Workflow baut und pusht bei jedem Push auf `main` ein frisches Image und weist Render anschließend an, neu zu deployen.

- Trigger nur auf Push auf `main`. Übernimm dieselben Concurrency- und Permissions-Einstellungen (`contents: read`) aus dem CI-Workflow.
- Der Build-Job benötigt vier wiederverwendbare Actions in dieser Reihenfolge: einen Checkout, das Buildx-Setup, einen Docker-Hub-Login und den Build-and-Push-Step mit dem Target `linux/amd64`.
- **Sicherheitshinweis:** Der Docker-Hub-Login benötigt einen **Personal Access Token**, kein Passwort. Generiere den Token in deinem Docker-Hub-Account mit dem Scope Read & Write.
- Feuere nach dem Push des Images ein einzelnes `curl` gegen Renders Deploy-Hook-URL, um das Redeploy auszulösen.
- Speichere die drei Secrets (`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `RENDER_DEPLOY_HOOK_URL`) unter Settings → Secrets and variables → Actions im Repository und referenziere sie mit der `$`-Syntax im Workflow.
- Push eine kleine Änderung auf `main`. Der CD-Workflow sollte grün werden, und das Render-Dashboard sollte kurz darauf ein frisches Deployment melden.

📖 Ressource: [docker/build-push-action](https://github.com/docker/build-push-action)

---

### Challenge 5 (Optional) – E2E-Tests in CI ausführen

Bisher liefen im Test-Job nur Unit- und Integrationstests. Die E2E-Suite wurde ausgelassen, weil sie die vollständige NestJS-Anwendung bootet — die jetzt beim Start eine Live-Postgres benötigt — und der CI-Runner eine saubere Ubuntu-VM ohne installierte Datenbank ist. Füge eine Postgres für die Dauer des Runs neben dem Test-Job hinzu und erweitere die Suite um E2E.

- GitHub Actions kann Hilfscontainer neben einem Job hochfahren. Füge einen Postgres-Container nur zum Test-Job hinzu — Lint und Build berühren die Datenbank nicht.
- Fixiere die Postgres-Hauptversion, damit das CI-Image nicht von der Produktion abweicht. Renders kostenloser Postgres läuft auf Postgres 18 — verwende dieselbe Version.
- Übergib eine `DATABASE_URL` an die Umgebung des Jobs, die auf den Hilfscontainer zeigt. Der Hostname ist nicht `localhost`; GitHub Actions löst den Container über den Namen auf, den du ihm im Workflow gibst.
- Führe die E2E-Suite als Teil des (oder zusätzlich zum) Test-Job-Scripts aus und push die Änderung.

> **Hinweis zum Bootstrap:** Das Test-Setup ist dafür verantwortlich, das Schema auf der frischen Datenbank bereitzustellen, mit der der Service-Container startet. Falls deine Tests bisher auf einem bereits vorhandenen Schema aufgebaut haben, gilt diese Annahme nicht mehr — die Testumgebung muss die Tabellen nun selbst anlegen, bevor die erste Query läuft.

📖 Ressource: [About service containers (GitHub Actions)](https://docs.github.com/en/actions/using-containerized-services/about-service-containers)

---

> **Denkanstoß:** Der CD-Workflow deployt automatisch alles, was in `main` landet — vorausgesetzt, der CI-Workflow ist grün. Überlege: Welche Rolle spielt das Code-Review jetzt noch, wenn Linting, Tests und Build bereits automatisch prüfen? Was kann ein Mensch im Review erkennen, was die Pipeline nicht erkennt?