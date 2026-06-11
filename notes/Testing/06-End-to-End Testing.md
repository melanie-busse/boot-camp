# DevOps Testing – End-to-End-Tests

Integrationstests prüfen Schichtgrenzen – aber sie mocken weiterhin die Ränder. Ein bestandener Integrationstest garantiert nicht, dass die Anwendung erfolgreich startet, globale Pipes korrekt funktionieren oder das Modul-Wiring vollständig ist.

**End-to-End-Tests (E2E)** schließen diese Lücke. Sie starten die vollständig zusammengesetzte NestJS-Anwendung und simulieren echten HTTP-Traffic. Fehlt ein erforderlicher Provider im `AppModule` oder lehnt eine globale Validation Pipe einen Payload ab, deckt der E2E-Test den Fehler auf – weil er exakt denselben Request-Lifecycle durchläuft, den auch die Nutzerinnen und Nutzer erleben.

---

## Der Kompromiss

Den gesamten Stack zu betreiben ist ressourcenintensiv. E2E-Tests dauern länger und reagieren empfindlich auf kleinere strukturelle Änderungen. Ein geänderter Routenpfad oder ein neu hinzugefügtes Pflichtfeld im DTO kann Tests beschädigen, die mit der aktuellen Aufgabe nichts zu tun haben.

E2E-Suites sollten daher gezielt eingesetzt werden. Im Fokus stehen die kritischen Nutzer-Journeys – die primären Routen und schwerwiegendsten Fehlerzustände – anstatt zu versuchen, jeden denkbaren Grenzfall abzudecken.

---

## Vollständiger Application-Bootstrap

Anstatt einzelne Controller anzusprechen, importieren E2E-Tests das root `AppModule`. Die Test-Datenbank wird mit einer In-Memory-SQLite-Instanz konfiguriert, um lokale Entwicklungsdaten nicht zu verunreinigen.

```typescript
// test/app.e2e-spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { describe, beforeAll, afterAll, it, expect } from "vitest";
import { AppModule } from "../src/app.module";

describe("App (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Zieht den gesamten Anwendungsbaum hinein
    }).compile();

    app = module.createNestApplication();

    // main.ts-Konfiguration hier spiegeln
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });
});
```

Der Aufruf von `app.useGlobalPipes(new ValidationPipe())` ist entscheidend. Registriert die produktive `main.ts` globale Middleware, Interceptors oder Pipes, muss diese Konfiguration im E2E-Setup exakt dupliziert werden – andernfalls wird eine grundlegend andere Anwendung getestet.

`beforeAll` und `afterAll` stellen sicher, dass der Server pro Suite genau einmal gestartet wird, was die Ausführungszeiten überschaubar hält.

---

## HTTP-Assertions mit Supertest

Supertest sendet simulierten Traffic gegen die aktive Server-Instanz. HTTP-Methoden, Pfade und Payloads werden verkettet und mit `.expect()`-Assertions abgeschlossen, um das Ergebnis zu validieren.

Aufbauend auf dem Bootstrap oben sieht ein Test für das Anlegen und Abrufen eines Nutzers so aus:

```typescript
it("erstellt einen Nutzer und ruft ihn erfolgreich ab", async () => {
  // POST-Anfrage simulieren, um die Ressource anzulegen
  const response = await request(app.getHttpServer())
    .post("/users")
    .send({ name: "Alice", email: "alice@example.com" })
    .expect(201);

  // Dynamische Response-Struktur prüfen
  expect(response.body).toMatchObject({
    id: expect.any(Number),
    name: "Alice",
    email: "alice@example.com",
  });

  const createdId = response.body.id;

  // GET-Anfrage simulieren, um die Persistenz zu verifizieren
  return request(app.getHttpServer())
    .get(`/users/${createdId}`)
    .expect(200)
    .expect({ id: createdId, name: "Alice", email: "alice@example.com" });
});

it("gibt bei einer unbekannten Nutzer-ID den Status 404 zurück", () => {
  return request(app.getHttpServer()).get("/users/99999").expect(404);
});
```

`toMatchObject` ist hier besonders wertvoll: Es prüft, ob die Response die relevanten Felder enthält, ohne eine exakte Übereinstimmung bei dynamisch generierten Daten wie Datenbank-IDs oder Erstellungszeitstempeln zu verlangen.

---

## Umfang und Ausführung

Komplexe Logikpfade und Grenzfälle gehören in Unit Tests. Die E2E-Suite fungiert als übergeordneter Sanity-Check und deckt folgende Bereiche ab:

| Kategorie | Beispiel |
|---|---|
| **Happy Paths** | Anlegen, Abrufen, Aktualisieren, Löschen der primären Ressourcen |
| **Authentifizierungsbarrieren** | Zugriff auf geschützte Route ohne Token → 401 |
| **Validierungsablehnungen** | Fehlerhafter Payload → 400 |

Da die gesamte Testreihe auf Vitest standardisiert ist, lässt sich die E2E-Suite durch direktes Ansprechen des `test/`-Verzeichnisses über die Vitest-CLI ausführen:

```bash
npx vitest run ./test
```

Viele Teams legen diesen Befehl als eigenes NPM-Skript in der `package.json` an, um die langsameren E2E-Tests sauber von den blitzschnellen Unit-Test-Läufen zu trennen.

---

## Weiterführende Ressourcen

- [NestJS E2E Testing – Dokumentation](https://docs.nestjs.com/fundamentals/testing#end-to-end-testing)
- [Supertest auf GitHub](https://github.com/ladjs/supertest)

---

> **Denkanstoß:** Die E2E-Suite importiert das echte `AppModule` – inklusive aller Datenbankverbindungen, die darin konfiguriert sind. Wie lässt sich verhindern, dass E2E-Tests auf die produktive oder lokale Entwicklungsdatenbank schreiben? Und wo genau würde diese Konfiguration überschrieben werden?