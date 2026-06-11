# Docker Basics – Die Docker CLI

Den Unterschied zwischen einem Dockerfile, einem Image und einem Container zu kennen, sagt noch nichts darüber aus, was ins Terminal getippt werden muss. Um Docker praktisch zu nutzen, braucht es eine konkrete Abfolge von CLI-Befehlen.

Die Reihenfolge der Operationen ist geradlinig: Docker wird angewiesen, ein Image aus den vorhandenen Anweisungen zu bauen, dieses Image als Hintergrundprozess zu starten, bei unvermeidlichen Fehlern die Logs zu prüfen und das fertige Artefakt in eine Registry zu pushen. Diese Befehle zu beherrschen bedeutet, die volle Kontrolle über die lokale Entwicklungsumgebung zu haben.

---

## Das Image bauen

Der Build-Schritt übersetzt das Dockerfile in einen eingefrorenen, ausführbaren Snapshot.

```bash
docker build -t <image-name> .
```

- **`-t`** gibt dem Image einen Namen, optional mit einem Tag (z. B. `myapp:1.0`; wird kein Tag angegeben, verwendet Docker `latest`). Ohne `-t` vergibt Docker nur einen zufälligen ID-Hash – alle folgenden Schritte wie Starten und Pushen müssen sich dann über den Namen auf das Image beziehen. Besser jetzt benennen, als später Hashes kopieren zu müssen.
- **`.`** setzt den Build-Kontext auf den aktuellen Ordner. Der Build-Kontext ist die Menge der Dateien, auf die Docker während des Builds zugreifen darf – eine `COPY`-Anweisung im Dockerfile kann also nur Dateien aus diesem Verzeichnis kopieren. Liegt dort ein Dockerfile, wird es automatisch verwendet.

Ein Punkt, der die meisten Einsteiger überrascht: Das Image ist ein Snapshot. Wird der Code nach dem Build geändert, enthält das Image noch den alten Stand. Ein Rebuild ist nötig, um Änderungen zu übernehmen.

**Hinweis zu Namenskonventionen:** Lokal kann ein Image technisch beliebig benannt werden (z. B. `my-nestjs-app:1.0`). Soll das Image jedoch auf Docker Hub gepusht werden, verlangt die Registry ein striktes Format: `<benutzername>/<image-name>:<version>`. Fehlt der Benutzername, geht Docker Hub davon aus, dass ein offizielles öffentliches Image überschrieben werden soll, und lehnt den Push sofort mit einem Berechtigungsfehler ab. Um einen späteren Umbenennen-Schritt zu sparen, integrieren viele Entwicklerinnen und Entwickler den Registry-Benutzernamen direkt in den initialen Build-Befehl:

```bash
docker build -t benutzername/my-nestjs-app:1.0 .
```

---

## Einen Container starten

Ein Image tut für sich genommen nichts. Um die darin enthaltene Anwendung auszuführen, erstellt Docker aus dem Image einen Container – eine laufende, isolierte Instanz.

```bash
docker run --name <container-name> -d <image-name>
```

- **`--name`** gibt dem Container einen selbst gewählten Namen. Ohne ihn vergibt Docker einen zufälligen Namen, und alle späteren Befehle – Logs lesen, stoppen, entfernen – benötigen eine Möglichkeit, genau diesen Container zu referenzieren.
- **`-d`** startet den Container im Hintergrund (detached). Die meisten containerisierten Anwendungen sind Server, die laufen, bis sie gestoppt werden. Ohne `-d` übernimmt der Container das Terminal – ein weiteres Eintippen ist erst möglich, wenn er beendet wird.

---

## Der Container-Lebenszyklus

Detached Container haben einen Haken: Sie sind unsichtbar. Es gibt kein Fenster, keine Terminal-Ausgabe, nichts auf dem Bildschirm, das anzeigt, ob die Anwendung läuft oder zwei Sekunden nach dem Start abgestürzt ist.

Ein zweiter Haken folgt daraus: Ein Container, der stoppt, wird nicht gelöscht. Er bleibt auf der Festplatte im gestoppten Zustand und hält seinen Namen reserviert – weshalb ein zweiter `docker run --name` mit demselben Namen fehlschlägt. Beim iterativen Entwickeln – bauen, starten, fixen, erneut starten – sammeln sich gestoppte Container und alte Images an. Die folgenden Befehle ermöglichen es, diesen Zustand zu überblicken und aufzuräumen:

| Befehl | Bedeutung |
|---|---|
| `docker ps` | Listet laufende Container auf. So lässt sich prüfen, ob ein Container tatsächlich aktiv ist. |
| `docker ps --all` | Listet auch gestoppte Container auf, einschließlich solcher, die beim Start abgestürzt sind. Erscheint ein Container nicht bei `docker ps`, hilft dieser Befehl weiter. |
| `docker stop <container_id>` | Stoppt einen laufenden Container. |
| `docker start <container_id>` | Startet einen gestoppten Container erneut, ohne einen neuen zu erstellen. |
| `docker rm <container_id>` | Entfernt einen gestoppten Container und gibt seinen Namen frei. |
| `docker images` | Listet alle lokalen Images auf. |
| `docker image rm <image_name>` | Entfernt ein nicht mehr benötigtes Image. Images häufen sich bei jedem Rebuild an und belegen echten Festplattenplatz. |
| `docker inspect <object_id>` | Gibt die vollständigen Metadaten eines Containers oder anderen Docker-Objekts aus – nützlich für Details wie Netzwerkeinstellungen. |
| `docker image inspect <image_name>` | Dasselbe für ein Image. |

---

## Images pushen und pullen

Bislang existiert das Image nur auf dem eigenen Rechner – damit endet das zentrale Versprechen von Docker, dass dasselbe Artefakt überall läuft, an der eigenen Laptop-Grenze. Docker Hub ist die Registry, die diese Lücke schließt. Das Image wird dort gepusht; Teammitglieder und Server pullen es von dort.

```bash
docker push <dockerhub-benutzername>/<image-name>
```

Der Image-Name muss mit dem Docker-Hub-Benutzernamen beginnen, da die Registry Images nach Accounts organisiert – genau wie GitHub Repositories.

Pullen funktioniert nach demselben Prinzip, nur auf der Empfängerseite:

```bash
docker pull postgres
```

Dieser Befehl lädt das offizielle Postgres-Image von Docker Hub herunter. Das ist ein gängiger Weg, eine lokale Datenbank während der Entwicklung bereitzustellen: eine vollständig laufende Postgres-Datenbank, ohne Postgres direkt auf dem Rechner zu installieren.

```bash
docker run --name local-db -d -p 5432:5432 postgres
```

- **`-p 5432:5432`** mappt einen Port im Format `host:container`. Container sind isoliert – eine Anwendung, die innerhalb des Containers auf einem Port lauscht, ist vom eigenen Rechner aus nicht erreichbar, solange kein Port-Mapping definiert ist. Mit diesem Mapping können lokale Anwendungen über `localhost:5432` eine Verbindung herstellen.

> **Denkanstoß:** Der Build-Cache sorgt dafür, dass unveränderte Layer wiederverwendet werden – aber das Image selbst ist ein Snapshot und wird nicht automatisch aktualisiert. Welche Konsequenzen hat das für einen CI/CD-Pipeline-Workflow, bei dem nach jedem Merge in den Hauptbranch ein neues Image gebaut und gepusht werden soll?

---

## Weiterführende Ressourcen

- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
- [Docker CLI reference](https://docs.docker.com/reference/cli/docker/)