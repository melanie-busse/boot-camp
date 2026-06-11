# DevOps Testing – Integrationstests

Unit Tests validieren isolierte Logik. Eine Anwendung ist jedoch ein Geflecht miteinander verbundener Komponenten. Eine einwandfrei funktionierende Service-Methode hat keinen Wert, wenn der HTTP-Controller den Payload falsch interpretiert, einen Routenparameter missdeutet oder einen falschen Statuscode zurückliefert. Genau an diesen Grenzen zwischen den Schichten entstehen Fehler.

Integrationstests prüfen, ob mehrere Komponenten korrekt zusammenspielen. In einer NestJS-Umgebung bedeutet das: eine echte `INestApplication`-Instanz hochfahren, einen echten Controller mit seinem zugrundeliegenden Service verdrahten und simulierte HTTP-Anfragen mithilfe der Bibliothek **Supertest** durch den Stack schicken.

> **Hinweis:** Die Repository-Schicht wird auf dieser Ebene in der Regel weiterhin gemockt – der Fokus liegt jetzt auf der Interaktion zwischen HTTP- und Service-Schicht, nicht auf dem Datenbankverhalten. Soll die Datenbankinteraktion selbst geprüft werden, kann das Testing-Modul mit einer echten ORM-Verbindung konfiguriert werden, die durch eine In-Memory-SQLite-Datenbank gesichert ist. Mocks entfallen dann vollständig; die tatsächlichen Repository-Abfragen laufen gegen ein echtes Schema.

---

## Controller-Service-Interaktion

Der Aufbau basiert auf demselben `Test.createTestingModule`, das auch für Unit Tests verwendet wird. Der Unterschied liegt im Umfang: Sowohl Controller als auch Service werden als echte Provider registriert, die Ausführungskette wird aber an der Datenbankschicht gestoppt, indem ein Mock-Repository injiziert wird.

```typescript
// user.integration-spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as request from "supertest";
import { describe, beforeAll, afterAll, it, vi } from "vitest";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { User } from "./user.entity";

const mockUserRepository = {
  find: vi.fn().mockResolvedValue([{ id: 1, name: "Alice" }]),
};

describe("UserController (integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it("GET /users gibt erfolgreich ein Array von Nutzern zurück", async () => {
    return request(app.getHttpServer())
      .get("/users")
      .expect(200)
      .expect([{ id: 1, name: "Alice" }]);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

Nach dem Kompilieren des Moduls erzeugt `createNestApplication()` eine laufende NestJS-Anwendungsinstanz.

Auffällig ist der Wechsel bei den Lifecycle-Hooks. Das Hochfahren einer vollständigen NestJS-Anwendung ist mit einem spürbaren Performance-Aufwand verbunden. Anstatt jeden einzelnen Testlauf mit `beforeEach` zu isolieren, wird `beforeAll` verwendet, um die Anwendung einmal für die gesamte Suite zu starten – und `afterAll`, um sie sauber wieder herunterzufahren.

`request(app.getHttpServer())` verbindet Supertest direkt mit dem zugrundeliegenden Node-HTTP-Server. Die Anfragen laufen dabei nicht über einen echten Netzwerk-Port, was sie extrem schnell macht – bei gleichzeitiger vollständiger Durchführung aller Routing- und Validierungsschichten. Die `.expect()`-Methoden lassen sich anschließend verketten, um HTTP-Statuscode und Response-Payload gleichzeitig zu prüfen.

---

## Datenbankintegration mit In-Memory-Datenbank

Manchmal ist die zu prüfende Grenze die Datenbank selbst. Dabei soll sichergestellt werden, dass TypeORM-Entities korrekt abgebildet werden, benutzerdefinierte Abfragen die erwarteten Zeilen zurückliefern und Constraints die richtigen Fehler auslösen.

Mocks können keine Schema-Integrität validieren. Stattdessen wird die produktive Datenbankverbindung gegen eine flüchtige In-Memory-SQLite-Datenbank ausgetauscht. Da die tatsächlichen TypeORM-Abfragen gegen ein echtes Schema ausgeführt werden, entfällt der `useValue`-Mock vollständig.

```typescript
// user.db-integration-spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as request from "supertest";
import { describe, beforeAll, afterAll, it } from "vitest";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { User } from "./user.entity";

describe("UserService (Datenbankintegration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
      ],
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it("erstellt einen Nutzer und ruft ihn anschließend per ID ab", async () => {
    const newUser = { name: "Alice", email: "alice@example.com" };

    const createResponse = await request(app.getHttpServer())
      .post("/users")
      .send(newUser)
      .expect(201);

    const createdId = createResponse.body.id;

    return request(app.getHttpServer())
      .get(`/users/${createdId}`)
      .expect(200)
      .expect({ id: createdId, name: "Alice", email: "alice@example.com" });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

Die Kombination `type: 'sqlite'` mit `database: ':memory:'` weist TypeORM an, eine temporäre Datenbank im RAM aufzubauen. Sie existiert ausschließlich für die Dauer der Testausführung und hinterlässt keine Artefakte.

Das Flag `synchronize: true` zwingt TypeORM dazu, die SQL-Tabellen automatisch anhand der Entity-Definitionen zu generieren. **Dieses Setting darf niemals in einer Produktionsumgebung oder gegen eine persistente, gemeinsam genutzte Datenbank aktiviert werden**, da es bestehende Datenstrukturen aggressiv überschreibt.

---

## Authentifizierte Routen testen

Integrationstests müssen die Anwendungssicherheit berücksichtigen. Setzt ein Controller auf einen JWT-Guard, werden Anfragen ohne gültiges Token sofort abgelehnt. Die Test-Suite muss daher den Login-Flow simulieren, um einen Autorisierungs-Token zu erhalten, bevor geschützte Endpunkte aufgerufen werden.

```typescript
it("authentifiziert einen Nutzer und greift auf eine geschützte Route zu", async () => {
  // Anmelden, um den Token zu erhalten
  const loginResponse = await request(app.getHttpServer())
    .post("/auth/login")
    .send({ username: "alice", password: "secret" })
    .expect(200);

  const token = loginResponse.body.access_token;

  // Token an die nachfolgende Anfrage anhängen
  return request(app.getHttpServer())
    .get("/auth/profile")
    .set("Authorization", `Bearer ${token}`)
    .expect(200);
});
```

Supertest ermöglicht die Manipulation von Request-Headern über die `.set()`-Methode. Den Token aus der initialen Login-Antwort zu extrahieren und ihn in den Authorization-Header der nachfolgenden Anfrage einzufügen, repliziert den Authentifizierungsablauf eines echten Clients exakt.

---

## Weiterführende Ressourcen

- [NestJS Testing – Dokumentation](https://docs.nestjs.com/fundamentals/testing)
- [Supertest auf GitHub](https://github.com/ladjs/supertest)
- [TypeORM In-Memory Testing](https://typeorm.io/)

---

> **Denkanstoß:** `beforeAll` startet die Anwendung einmal für die gesamte Suite – im Gegensatz zu `beforeEach`, das vor jedem Test neu aufruft. Welche Konsequenz hat das, wenn ein Test Daten in der In-Memory-Datenbank anlegt? Beeinflusst das den nächsten Test in derselben Suite?