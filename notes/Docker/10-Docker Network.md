# Docker Fortgeschrittene Konzepte – Docker Networks

Bisher hat jeder Container für sich allein gelaufen. Der Scoreboard-Service hat in seine Logs geschrieben, der Postgres-Container hat seine Daten gespeichert – und keiner musste wissen, dass der andere existiert. Das ändert sich in dem Moment, wo der Scoreboard-Service Punkte lesen und schreiben muss: Er muss eine Verbindung zum Datenbank-Container aufbauen. Dafür braucht er eine Adresse – und diese Adresse zu finden ist schwieriger, als es zunächst aussieht.

Container sind standardmäßig isoliert. Jeder bekommt seinen eigenen Netzwerk-Namespace, was bedeutet, dass er einen anderen Container nicht einfach über einen Namen wie `localhost` erreichen kann – und die IP-Adresse, die Docker vergibt, ist nicht fest. Starte einen Container neu, kann sich seine IP ändern; eine fest eingetragene Adresse ist also fragil. Was der Scoreboard-Service wirklich braucht, ist die Möglichkeit, „verbinde dich mit der Datenbank" über einen stabilen Namen zu sagen – und dass dieser Name auflöst, wo die Datenbank gerade läuft. Genau das liefert Docker Networking.

Ein **Docker Network** ist ein virtuelles Netzwerk, dem Container beitreten können. Container im selben Netzwerk können miteinander kommunizieren; Container in verschiedenen Netzwerken können das nicht, es sei denn, du verbindest sie bewusst. Das gibt dir zwei Dinge gleichzeitig: **Kommunikation** – Scoreboard-Service und Datenbank können sich gegenseitig erreichen – und **Isolation** – du kannst unzusammenhängende Gruppen von Containern voneinander trennen, ähnlich wie du Frontend- und Backend-Services auseinanderhältst.

Was das Ganze angenehm macht, ist eingebautes DNS. Wenn du Container in ein selbst erstelltes Netzwerk einträgst, betreibt Docker einen kleinen DNS-Dienst, der Container-Namen automatisch zu deren aktuellen IP-Adressen auflöst. Der Scoreboard-Service verbindet sich mit dem Host `arcade-db`, und Docker übersetzt das in die aktuelle IP des Datenbank-Containers. Du hantierst nie direkt mit der IP, und die Verbindung funktioniert auch über Neustarts hinaus.

---

## Die Standard-Netzwerke

Jede Docker-Installation startet mit drei Netzwerken. Liste sie auf mit:

```bash
docker network ls
```

| Netzwerk | Driver | Was es tut |
|---|---|---|
| `bridge` | bridge | Der Standard für eigenständige Container |
| `host` | host | Teilt das Netzwerk des Hosts direkt (nur Linux) |
| `none` | null | Kein Networking |

Wenn du nichts anderes angibst, tritt ein Container dem Standard-`bridge`-Netzwerk bei. Es gibt einen wichtigen Haken: Das Standard-Bridge-Netzwerk bietet **kein DNS nach Container-Namen**. Container darin können sich gegenseitig über IP-Adressen erreichen, aber nicht über Namen. Das ist der Hauptgrund, ein eigenes Netzwerk zu erstellen, statt auf das Standard-Netzwerk zu vertrauen.

---

## User-defined Networks und Service Discovery

Ein eigenes Netzwerk zu erstellen ist ein einziger Befehl:

```bash
docker network create arcade-net
```

Das erstellt ein user-defined Bridge-Netzwerk. Der wichtige Unterschied zum Standard-Bridge ist der DNS-Dienst: In einem selbst erstellten Netzwerk löst Docker Container-Namen automatisch auf. Starte zwei Container darin, und jeder kann den anderen beim Namen erreichen.

```bash
docker run -d --name arcade-db --network arcade-net \
  -e POSTGRES_PASSWORD=arcade-password \
  -e POSTGRES_USER=arcade-master \
  postgres

docker run -d --name scoreboard --network arcade-net \
  scoreboard-service:v2
```

- `--network arcade-net` hängt jeden Container beim Start an das Netzwerk.
- `--name` ist hier wichtiger als sonst, weil der Name gleichzeitig der Hostname ist, den andere Container verwenden. `arcade-db` ist sowohl der Container-Name als auch die Adresse, mit der sich der Scoreboard-Service verbindet.

Im Scoreboard-Service zeigt die Datenbankverbindung auf den Container-Namen, nicht auf eine IP-Adresse:

```typescript
const databaseUrl =
  "postgresql://arcade-master:arcade-password@arcade-db:5432/postgres";
```

Die URL setzt sich aus folgenden Teilen zusammen: `postgresql://<user>:<password>@<host>:<port>/<database>`. Docker löst den Host `arcade-db` zur aktuellen IP des Datenbank-Containers auf. Wenn die Datenbank neu startet und eine neue IP bekommt, löst der Name trotzdem weiterhin korrekt auf – am Scoreboard-Service muss nichts geändert werden.

Isolation ist die andere Seite davon. Ein Container in `arcade-net` kann keinen Container erreichen, der nicht in `arcade-net` ist. Wenn du eine zweite, unabhängige Gruppe von Containern in ihr eigenes Netzwerk steckst, bleiben die beiden Gruppen füreinander unsichtbar – bis du sie bewusst verbindest.

---

## Einen Container mit mehr als einem Netzwerk verbinden

Ein Container ist nicht auf ein einziges Netzwerk beschränkt. Du kannst ihn nachträglich mit einem zweiten Netzwerk verbinden, während er bereits läuft:

```bash
docker network connect other-net scoreboard
```

Danach gehört `scoreboard` sowohl zu `arcade-net` als auch zu `other-net` und kann Container in beiden erreichen. So kann ein Service als Brücke zwischen zwei sonst isolierten Container-Gruppen fungieren.

---

## Netzwerke inspizieren und entfernen

Um zu sehen, welche Container an einem Netzwerk hängen – samt Subnet und Konfiguration – inspiziere das Netzwerk:

```bash
docker network inspect arcade-net
```

Um die Netzwerk-Einstellungen aus der Perspektive eines einzelnen Containers zu sehen, inspiziere stattdessen den Container:

```bash
docker inspect scoreboard
```

Wenn du ein Netzwerk nicht mehr brauchst, entferne es:

```bash
docker network rm arcade-net
```

Das funktioniert nur, wenn keine Container mehr angehängt sind. Trenne oder entferne die Container zuerst, sonst schlägt der Befehl fehl.

---

## Ressourcen

- [Networking overview – Docker Docs](https://docs.docker.com/network/)
- [Bridge networks – Docker Docs](https://docs.docker.com/network/bridge/)
- [Container networking – Docker Docs](https://docs.docker.com/config/containers/container-networking/)

---

> **Denkanstoß:** Das Standard-`bridge`-Netzwerk und ein user-defined Bridge-Netzwerk klingen ähnlich – aber der entscheidende Unterschied ist DNS. Warum reicht DNS-Auflösung nach Container-Namen aus, um auf hartcodierte IP-Adressen vollständig zu verzichten? Und welches Software-Prinzip steckt dahinter, Verbindungen über Namen statt über Adressen aufzubauen?