# DevOps CI/CD – Postgres in Production

Das Dateisystem eines Containers ist temporär und steht nach einem Neustart nicht mehr zur Verfügung. Mit anderen Worten: Jedes Redeploy erzeugt ein frisches Dateisystem und löscht alle Dateien, die von der vorherigen Version gespeichert wurden. Deshalb ist eine dateibasierte Datenbank wie SQLite für diese Architektur nicht mehr geeignet — das muss geklärt sein, bevor die CD-Pipeline eingerichtet wird.

---

## Datenbankoptionen

Beim Wechsel von einer lokalen, dateibasierten Datenbank gibt es grundsätzlich drei Möglichkeiten:

- **Persistent Volume anhängen:** Ein persistentes Volume kann bezahlt und dem Container zugeordnet werden, um SQLite beizubehalten. Der Nachteil wird deutlich, sobald zwei Instanzen der Anwendung gleichzeitig laufen — sie können nicht dieselbe Datei teilen. Backups und Recovery liegen vollständig in der eigenen Verantwortung.

- **Datenbank-Container betreiben:** Ein zweiter Docker-Container speziell für Postgres kann gestartet werden, wie in der vorherigen Session. Damit wird man zum Datenbankadministrator: Software patchen, Storage konfigurieren, Verbindungen überwachen und im Fehlerfall Snapshots wiederherstellen.

- **Managed Service nutzen:** Ein Provider betreibt die Datenbank. Er übernimmt Patches, Nightly-Backups und Uptime-Monitoring. Die eigene Anwendung wird betrieben — der Provider betreibt die Infrastruktur.

Für ein erstes Deployment entfernt ein Managed Service den Großteil des operativen Aufwands. Render ist einer von vielen Cloud-Providern, die einen Managed-Postgres-Service anbieten. Da wir unsere App ebenfalls auf Render deployen, ist es naheliegend, dieselbe Plattform auch für die Postgres-Datenbank zu nutzen.

---

## Mit Render Postgres verbinden

Wenn eine neue PostgreSQL-Instanz auf Render bereitgestellt wird, generiert das Dashboard Credentials und stellt zwei verschiedene Connection-URLs zur Verfügung:

- **External URL:** Diese Adresse ist öffentlich über das Internet auflösbar. Sie wird auf dem eigenen Laptop verwendet, um Datenbankmigrationen auszuführen oder den lokalen Entwicklungsserver gegen die Live-Cloud-Datenbank zu testen. Da Queries über das öffentliche Internet geroutet werden, ist sie geringfügig langsamer.

- **Internal URL:** Diese Adresse ist nur innerhalb von Renders privatem Netzwerk erreichbar. Der deployed Web Service muss diese URL verwenden. Sie umgeht das öffentliche Internet vollständig — mit dem Ergebnis: keine Egress-Gebühren, extrem niedrige Latenz und eine deutlich kleinere Angriffsfläche.

Beide URLs zeigen auf exakt dieselben Daten. Die Route wird danach gewählt, von wo die Query stammt.

---

## Die Environment-Grenze

Da der Anwendungscode selbst nicht weiß, ob er lokal oder in der Cloud läuft, wird die Lücke über Umgebungsvariablen überbrückt.

Das Standardformat für die Übergabe von Datenbank-Credentials ist ein einzelner String:

```
postgresql://username:password@host:port/database
```

Lokal wird die External URL in der `.env`-Datei unter dem Key `DATABASE_URL` gespeichert. In der Produktion wird die Internal URL im Render-Environment-Variable-Dashboard unter demselben Key `DATABASE_URL` hinterlegt. Die Anwendung liest `process.env.DATABASE_URL` (oder den `ConfigModule`) beim Start und verbindet sich mit der Datenbank, auf die die Variable zeigt — ohne eine einzige Zeile Code zu ändern.

---

## Ressourcen

- [Render PostgreSQL – Dokumentation](https://render.com/docs/databases)

---

> **Denkanstoß:** Die Internal URL funktioniert nur innerhalb von Renders Netzwerk, die External URL nur von außen — beide zeigen auf dieselben Daten. Welche Probleme könnten entstehen, wenn versehentlich die External URL als `DATABASE_URL` in den Render-Environment-Variablen gesetzt wird, und wie würde man das debuggen?