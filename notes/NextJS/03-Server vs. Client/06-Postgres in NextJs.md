# Next.js Server vs. Client – Postgres in Next.js

Bisher haben die deliveries in einem Array innerhalb des Mock-`deliveriesService` gelebt. Das war ausreichend, um Seiten dagegen zu bauen, hat aber einen entscheidenden Schwachpunkt: Das Array wird bei jedem Neustart des Servers zurückgesetzt. Ein neuer Eintrag, der über das Formular hinzugefügt wurde, ist in dem Moment weg, in dem du neu deployst oder der Server neu startet, weil die Daten nur im Arbeitsspeicher existieren.

Eine echte Anwendung speichert ihre Daten in einer Datenbank, wo sie Neustarts überlebt und über mehrere Server-Instanzen hinweg geteilt werden kann. PostgreSQL ist eine weit verbreitete relationale Datenbank, und in diesem Kapitel verbinden wir uns mit ihr über die `postgres`-Client-Library und ein paar einfache SQL-Queries.

Du kennst bereits ORMs wie TypeORM, und ein ORM zu verwenden wäre eine durchaus valide Wahl. TypeORM passt jedoch nicht gut zur Design-Philosophie von Next.js, und ein weiteres ORM einzuführen würde von den Konzepten ablenken, auf die wir uns konzentrieren wollen. Da das Curriculum bereits voll ist, haben wir uns entschieden, direkt mit SQL zu arbeiten. Das hält das Setup klein und lässt uns darauf fokussieren, wie Server Components, Server Functions und Route Handlers mit der Datenbank zusammenspielen.

## Verbindung mit dem postgres-Client herstellen

Nachdem du das `postgres`-Package installiert hast, erstellst du einen Client aus einem Connection String. Der Connection String enthält die Datenbankadresse, den Benutzernamen und das Passwort – er ist also ein Secret und gehört in eine Umgebungsvariable, nicht in deinen Code. Next.js liest Variablen aus einer `.env`-Datei, also fügst du die Datenbank-URL dort hinzu:

```env
DATABASE_URL=postgres://user:password@localhost:5432/kikis
```

Anschließend erstellst du den Client einmal in einem eigenen Modul und exportierst ihn, sodass sich die gesamte App einen einzigen Connection Pool teilt, statt bei jeder Query eine neue Verbindung zu öffnen:

```typescript
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

export default sql;
```

`process.env.DATABASE_URL` liest die Variable aus der `.env`-Datei. Das nachgestellte `!` ist eine TypeScript Non-Null Assertion: Es sagt dem Compiler, dass der Wert definitiv gesetzt ist, da `process.env`-Werte als möglicherweise `undefined` typisiert sind. Dieses Modul läuft ausschließlich auf dem Server, sodass der Connection String niemals im Browser-Bundle landet und das Passwort nie offengelegt wird.

## Die Datenbank initialisieren

Beim ersten Verbindungsaufbau ist unsere Datenbank vollständig leer und besitzt noch keine Tabellen. Damit die Datenbank initialisiert wird, führen wir ein Skript aus, das die `deliveries`-Tabelle anlegt. Dieses Skript wird in einer speziellen Datei direkt im Root unseres Projekts platziert, genannt `instrumentation.ts`. Die exportierte Funktion wird von Next.js erkannt und genau einmal beim Server-Start ausgeführt:

```typescript
// instrumentation.ts

import { sql } from "./lib/db";

export async function register() {
  await sql`
    CREATE TABLE IF NOT EXISTS deliveries (
      id SERIAL PRIMARY KEY,
      pickup TEXT NOT NULL,
      destination TEXT NOT NULL,
      status TEXT NOT NULL
    )
  `;
}
```

## Queries mit Tagged Templates

Das exportierte `sql` ist eine Tagged-Template-Funktion. Du rufst sie auf, indem du eine Query in Backticks schreibst, und sie gibt die passenden Zeilen zurück. Das ersetzt den Mock-Service aus der letzten Session: Die Funktionsnamen und Typen bleiben gleich, aber die Funktionskörper lesen jetzt aus Postgres.

```typescript
import sql from "@/lib/db";

export type DeliveryStatus = "active" | "accepted" | "denied" | "fulfilled";

export type DeliveryRequest = {
  id: string;
  pickup: string;
  destination: string;
  status: DeliveryStatus;
};

export async function getAllDeliveries(): Promise<DeliveryRequest[]> {
  return sql<DeliveryRequest[]>`SELECT * FROM deliveries`;
}

export async function getDeliveryById(
  id: string,
): Promise<DeliveryRequest | null> {
  const [delivery] = await sql<DeliveryRequest[]>`
    SELECT * FROM deliveries WHERE id = ${id}
  `;
  return delivery ?? null;
}
```

Ein paar Dinge, die es wert sind, festgehalten zu werden:

- Die Query läuft asynchron und gibt ein Array von Zeilen zurück, sodass `getAllDeliveries` den Aufruf direkt zurückgeben kann, während die Seiten, die die Funktion nutzen, das Ergebnis awaiten – genau wie beim Mock
- `sql<DeliveryRequest[]>` ist das Generic, das TypeScript mitteilt, welche Form jede Zeile hat, sodass der Rest deines Codes seine Typen behält
- `getDeliveryById` destrukturiert die erste Zeile mit `const [delivery]`, da eine Suche nach `id` höchstens eine Zeile liefert, und fällt auf `null` zurück, wenn das Array leer ist

## Werte in Tagged Templates sind sicher vor Injection

Das `${id}` in der Query sieht aus wie gewöhnliche String-Interpolation, ist es aber nicht – und der Unterschied ist sicherheitsrelevant. Wenn du eine Query durch das Zusammenkleben von Strings bauen würdest, etwa `"SELECT * FROM deliveries WHERE id = " + id`, könnte ein Aufrufer eine `id` übergeben, die deine Query abschließt und eigenes SQL anhängt. Dieser Angriff heißt SQL Injection, und er kann deine gesamte Datenbank auslesen oder zerstören.

Das Tagged Template verhindert das. Der `postgres`-Client fügt `${id}` nicht in den Query-Text ein. Er sendet das SQL und den Wert getrennt an die Datenbank: die Query mit einem Platzhalter an der Stelle, an der der Wert stehen soll, und den Wert selbst, markiert als Daten. Die Datenbank behandelt diesen Wert strikt als Wert und niemals als auszuführendes SQL, sodass eine bösartige `id` nirgendwo ausbrechen kann. Du bekommst die Bequemlichkeit, den Wert inline zu schreiben, mit der Sicherheit, ihn aus dem Query-Text herauszuhalten.

## Daten einfügen

Das Schreiben folgt demselben Muster. `createDelivery`, die Funktion, die die Server Function des Formulars aufruft, fügt eine Zeile ein und gibt den erstellten Datensatz zurück:

```typescript
export async function createDelivery(
  delivery: Pick<DeliveryRequest, "pickup" | "destination">,
): Promise<DeliveryRequest> {
  const [created] = await sql<
    DeliveryRequest[]
  >`     INSERT INTO deliveries (pickup, destination, status)
    VALUES (${delivery.pickup}, ${delivery.destination}, 'active')
    RETURNING *
  `;
  return created;
}
```

So ist der Insert aufgebaut:

- Das Argument ist als `Pick<DeliveryRequest, "pickup" | "destination">` typisiert, weil der Aufrufer nur diese beiden Felder liefert; die Datenbank generiert die `id`, und die Funktion setzt den Start-`status`
- `${delivery.pickup}` und `${delivery.destination}` werden als separate Werte gesendet, sodass dieselbe Injection-Sicherheit auch beim Schreiben gilt wie beim Lesen
- `RETURNING *` weist Postgres an, die komplette gerade erstellte Zeile zurückzugeben, einschließlich der generierten `id` – deshalb kann die Funktion eine vollständige `DeliveryRequest` zurückgeben

Damit überlebt eine über das Formular erstellte Delivery in der Datenbank, und die Deliveries-Liste liest sie beim nächsten Rendern zurück.

## Ressourcen

- [postgres (npm)](https://www.npmjs.com/package/postgres)
- [Environment Variables in Next.js](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

**Denkanstoß:** Stell dir vor, `getDeliveryById` würde die `id` nicht über ein Tagged Template, sondern über klassische String-Konkatenation in die Query einbauen. Was müsste ein Angreifer in das `id`-Feld eingeben, um zusätzliche SQL-Befehle auszuführen – und warum verhindert der Mechanismus aus diesem Kapitel genau das?

Der code snippet zum Aufsetzen der Datenbank. Die initiale Funktion, die beim Starten der App ausgeführt wird, heißt register und muss in der Datei instrumentation.ts liegen.

```typescript
//instrumentation.ts
import sql from "./lib/db";

export async function register() {
await sql`CREATE TABLE IF NOT EXISTS deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
  )`;
}
```

Darin könnt ihr dann mit sql die Datenbank initialisieren. Diese Funktion wird genau 1x ausgeführt bevor der Server ganz gestartet ist.

Ideal ist es natürlich, wenn ihr das sql statement in eine Funktion namens bootstrap oder setupDb packt unter lib/db, aber für den Anfang reicht das auch aus.