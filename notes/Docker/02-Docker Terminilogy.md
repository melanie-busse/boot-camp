# Docker Basics – Docker-Terminologie

Wenn Entwicklerinnen und Entwickler zum ersten Mal mit Docker in Berührung kommen, wirkt die Fachsprache oft wie eine unmittelbare Hürde. Es ist keine Seltenheit, Sätze wie „Lauf das Dockerfile" oder „Push den Container" zu hören – obwohl sich diese Aktionen auf völlig unterschiedliche Objekte beziehen. Diese Verwechslung verlangsamt das Debugging direkt: Taucht eine Fehlermeldung im Terminal auf, muss schnell klar sein, ob das Problem in den Build-Anweisungen, im erzeugten Artefakt oder in der laufenden Instanz liegt.

Wer diese Konzepte frühzeitig voneinander trennt, dem erschließt sich der gesamte Docker-Workflow fast von selbst. Als Analogie eignet sich die klassische Softwareentwicklung: Man schreibt Quellcode, kompiliert ihn zu einer ausführbaren Datei und startet diese Datei als Prozess. Docker folgt exakt demselben Prinzip.

---

## Dockerfile (Der Quellcode)

Ein Dockerfile ist eine reine Textdatei mit der Build-Definition. Es enthält eine geordnete Liste von Anweisungen: Basisimage auswählen, Anwendungsdateien kopieren, Abhängigkeiten installieren, den Standard-Startbefehl festlegen. Es wird hier nichts ausgeführt – das Dockerfile ist ausschließlich das Rezept.

## Image (Die ausführbare Datei)

Ein Image ist das Build-Artefakt, das entsteht, wenn Docker ein Dockerfile einliest und verarbeitet. Es repräsentiert einen eingefrorenen, schreibgeschützten Snapshot, der den Anwendungscode, alle Abhängigkeiten und die Laufzeitkonfiguration enthält. Da ein Image unveränderlich ist, kann es auf beliebige Maschinen verteilt werden – mit der Garantie, dass es überall identisch bleibt.

## Container (Der Prozess)

Ein Container ist eine aktive, laufende Instanz eines Images. Er führt die gepackte Anwendung in einer isolierten Umgebung aus. Container können unabhängig voneinander gestartet, gestoppt, neu gestartet und gelöscht werden, ohne das zugrunde liegende Image jemals zu verändern.

## Docker Engine (Die lokale Laufzeitumgebung)

Die Docker Engine ist der Hintergrunddienst auf dem eigenen Rechner, der die eigentliche Arbeit übernimmt. Wird ein Befehl zum Bauen eines Images oder Starten eines Containers eingegeben, führt die Docker Engine diesen Befehl aus. Sie verwaltet den lokalen Speicher für Images und den Lebenszyklus aller Container.

## Docker Hub (Die Registry)

Docker Hub ist eine öffentliche Registry, in der Entwicklerinnen und Entwickler Images ablegen und teilen. Die Funktion entspricht exakt der von npm für JavaScript-Pakete oder GitHub für Quellcode. Wer seiner Anwendung eine Postgres-Datenbank hinzufügen möchte, lädt das offizielle Postgres-Image von Docker Hub herunter – anstatt es von Grund auf selbst zu bauen.

---

> **Denkanstoß:** Welchen der fünf Begriffe würdest du intuitiv am häufigsten verwechseln – und warum? Überlege, wie du dir die Abgrenzung zwischen Image und Container dauerhaft merken kannst.

---

## Weiterführende Ressourcen

- [Docker overview](https://docs.docker.com/get-started/docker-overview/)
- [Docker Hub](https://hub.docker.com/)