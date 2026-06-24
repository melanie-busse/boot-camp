# DevOps CI/CD – Continuous Deployment

**Continuous Deployment** automatisiert den Release-Prozess. Sobald Continuous Integration bestätigt hat, dass ein Branch sicher zu mergen ist, übernimmt die CD-Pipeline und bringt den Code zu den Nutzern. Anstatt dass ein Entwickler Code manuell auf einen Live-Server zieht, orchestriert die Pipeline den Release deterministisch: Sie baut ein Docker-Image, pusht es in eine zentrale Registry und weist den Hosting-Provider an, es zu deployen.

Ein typischer CD-Workflow für eine containerisierte Node.js-Anwendung führt die folgende Sequenz in einer GitHub-Actions-Datei (`cd.yml`) aus:

1. Automatisch auslösen, wenn Code in `main` gemergt wird.
2. Code auschecken und die Docker-Build-Umgebung einrichten.
3. Bei der Image-Registry authentifizieren.
4. Das Image bauen und in die Registry pushen.
5. Einen Netzwerk-Request an den Hosting-Provider senden, um einen Neustart auszulösen.

---

## Die externen Akteure: Docker Hub und Render

Der GitHub-Actions-Workflow koordiniert zwei externe Plattformen, um das Deployment durchzuführen — beide sind austauschbar.

### Image-Registry (Docker Hub)

Docker Hub speichert die gebauten Images. Der CI-Runner baut das Image und pusht es dorthin; der Host zieht es von dort. Um den Push von einem automatisierten Runner zu autorisieren, muss ein **Personal Access Token (PAT)** mit Read-&-Write-Berechtigungen im Docker-Hub-Account generiert werden. Dieser Token wird als GitHub-Repository-Secret gespeichert (z. B. `DOCKERHUB_TOKEN`). Ein gewöhnliches Account-Passwort in CI zu verwenden ist ein Sicherheitsrisiko und schlägt fehl, wenn der Account Multi-Faktor-Authentifizierung verwendet.

### Hosting-Provider

Der Hosting-Provider führt den Container aus und macht ihn über das öffentliche Internet erreichbar. In diesem Bootcamp verwenden wir **Render** als Provider. Einen Render Web Service auf „Existing image from a registry" zu konfigurieren trennt bewusst die Build-Pipeline von der Runtime. GitHub Actions übernimmt die rechenintensive Arbeit: Dependencies installieren, TypeScript kompilieren. Render zieht das fertige, leichtgewichtige Docker-Image und führt den Node-Prozess aus.

---

## Image-Registry vorbereiten

Bevor auf Render deployed werden kann, wird ein Docker-Hub-Account benötigt (falls noch nicht vorhanden) sowie ein **Private Access Token (PAT)**. Dieser Token wird im GitHub-Repository als Secret `DOCKERHUB_TOKEN` gespeichert. Mit ihm pusht GitHub Actions automatisch neue Images zu Docker Hub.

---

## Hosting-Provider vorbereiten

Es wird ein bestehendes Projekt auf dem Hosting-Provider benötigt, das die CD-Pipeline als Ziel ansteuern kann. Dafür braucht es einen Render-Account sowie einen Web Service vom Typ „Existing image from a registry". Die **Deploy-Hook-URL** findet sich in den Web-Service-Einstellungen und wird als GitHub-Secret `RENDER_DEPLOY_HOOK_URL` gespeichert. Ein POST-Request an diese URL weist Render an, das neueste Image zu ziehen und den Container neu zu starten.

Der Hosting-Provider führt den Docker-Container aus. Er benötigt die korrekten Umgebungsvariablen — diese werden im Projekt unter dem Tab „Environment Variables" hinterlegt und beim Start mit dem `--env`-Flag in den Container eingebracht.

---

## Den CD-Workflow aufbauen

Die Datei `cd.yml` liegt in `.github/workflows/` zusammen mit der CI-Pipeline. Da das Deployen von untested Code den Sinn der Automatisierung unterläuft, wird der CD-Trigger strikt auf den `main`-Branch beschränkt:

```yaml
on:
  push:
    branches: [main]
```

Innerhalb des Deployment-Jobs übernimmt eine spezifische Abfolge von Actions das Kompilieren und Authentifizieren:

```yaml
steps:
  - uses: actions/checkout@v6
  - uses: docker/setup-buildx-action@v4
  - uses: docker/login-action@v4
    with:
      username: ${{ secrets.DOCKERHUB_USERNAME }}
      password: ${{ secrets.DOCKERHUB_TOKEN }}
  - uses: docker/build-push-action@v7
    with:
      context: .
      push: true
      platforms: linux/amd64
      tags: <username>/myapp:latest
```

Die Reihenfolge dieser Steps ist entscheidend. Der Runner checkt das Repository aus, um das Dockerfile zu erhalten. `setup-buildx-action` installiert anschließend die moderne Docker-Build-Engine, die für die nachfolgenden Steps benötigt wird. `login-action` authentifiziert den Runner bei Docker Hub mithilfe der gespeicherten Secrets. Schließlich verwendet `build-push-action` das aktuelle Verzeichnis als Build-Kontext, baut das Image für Renders Architektur (`linux/amd64`), versieht es mit dem `latest`-Tag und pusht es in die Registry.

---

## Redeployment beim Hosting-Provider auslösen

An diesem Punkt im Workflow hat Docker Hub das neue Image — Render ist jedoch noch nicht informiert. Die Deploy-Hook-URL wird verwendet, um Render anzuweisen, das neue Image zu ziehen und den Container neu zu starten.

Da allein der Besitz dieser URL ausreicht, um ein Redeployment auszulösen, wird sie als GitHub-Secret (`RENDER_DEPLOY_HOOK_URL`) gespeichert und als letzter Step der Pipeline via `curl` aufgerufen:

```yaml
- run: curl -fsSL -X POST "${{ secrets.RENDER_DEPLOY_HOOK_URL }}"
```

Die genauen `curl`-Flags steuern, wie der Runner mit dem Netzwerk-Request umgeht:

- **`-f`** erzwingt einen Fehler-Exit-Code, wenn Render einen fehlgeschlagenen HTTP-Status zurückgibt. Ohne dieses Flag würde der Workflow fälschlicherweise Erfolg melden, selbst wenn der Deploy-Hook defekt ist.
- **`-s`** unterdrückt den Fortschrittsbalken und andere Ausgaben, damit die Workflow-Logs sauber bleiben.
- **`-S`** aktiviert Fehlermeldungen explizit wieder, wenn der Request fehlschlägt — so gibt es verwertbares Feedback, falls Render den POST-Request ablehnt.
- **`-L`** folgt HTTP-Redirects und stellt sicher, dass der Trigger funktioniert, falls Render seine Routing-Infrastruktur aktualisiert.

Sobald dieser Step erfolgreich abgeschlossen ist, hat die CD-Pipeline ihre Arbeit getan. Render übernimmt und startet den neuen Container.

---

## Ressourcen

- [Render Web Services mit bestehenden Images](https://docs.render.com/deploy-an-image)
- [docker/build-push-action – Dokumentation](https://github.com/docker/build-push-action)
- [Docker Hub Access Tokens](https://docs.docker.com/security/for-developers/access-tokens/)

---

> **Denkanstoß:** Die CD-Pipeline deployt automatisch alles, was in `main` landet — vorausgesetzt, die CI-Checks sind grün. Welche Arten von Problemen könnten trotzdem erst in der Produktion sichtbar werden, und wie verändert das die Verantwortung beim Code-Review und beim Mergen in `main`?