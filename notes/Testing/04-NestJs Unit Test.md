# DevOps Testing – Unit Testing mit NestJS

## Das Abhängigkeitsproblem

Reine Funktionen wie `calculateDiscount` oder `calculateLateFee` lassen sich unkompliziert testen, weil sie ausschließlich von ihren Eingaben abhängen. NestJS-Services bieten uns diesen Luxus selten. Ein typischer Service benötigt eine Datenbankverbindung, externe APIs oder andere injizierte Provider, um zu funktionieren.

Wer einen Service manuell mit `new UserService()` instanziiert, muss dem Konstruktor eine echte Datenbankverbindung übergeben. Eine Live-Datenbank zerstört die Isolation eines Unit Tests: Die Test-Suite verlangsamt sich drastisch – und ein Testfehler könnte schlicht bedeuten, dass der Datenbankserver offline ist, anstatt auf einen logischen Bug hinzuweisen.

Die Lösung besteht darin, den Service in einer kontrollierten Sandbox mit **gefälschten Abhängigkeiten** zu testen.

---

## Die Test-Sandbox

NestJS stellt ein dediziertes Paket namens `@nestjs/testing` bereit, das das Dependency-Injection-(DI-)System nachbildet, ohne einen Webserver zu starten. Es wird ein minimales Modul konfiguriert, nur die zu testenden Teile werden registriert, und die gefährlichen Abhängigkeiten werden durch harmlose Ersatzobjekte ausgetauscht.

Betrachten wir einen `UserService`, der mit einer Datenbank interagiert, um Nutzerinformationen abzurufen:

```typescript
// user.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  isAdult(age: number): boolean {
    return age >= 18;
  }

  async getUserName(id: number): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user.name;
  }
}
```

---

## Mock-Injektion und Zustandsisolation

Da dieser Service ein TypeORM-Repository injiziert, müssen wir die echte Datenbank beim Testen umgehen. Dazu verwenden wir Vitest, um einen **Mock** zu erstellen – ein Ersatzobjekt, das die Form des Repositorys nachahmt, aber keinerlei echte Logik ausführt.

Anstatt eine komplexe Fake-Klasse von Grund auf zu bauen, bietet Vitest `vi.fn()`. Dieses Hilfsmittel erzeugt eine nachverfolgbare Funktion, bei der wir den genauen Rückgabewert steuern und die Ausführungshistorie prüfen können.

So wird ein Mock anstelle des echten Repositorys injiziert:

```typescript
// user.service.spec.ts
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { UserService } from "./user.service";
import { User } from "./user.entity";

const mockUserRepository = {
  findOne: vi.fn(),
  save: vi.fn(),
};

describe("UserService", () => {
  let service: UserService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = moduleRef.get<UserService>(UserService);
  });
});
```

Der `beforeEach`-Block läuft vor jedem einzelnen Testfall. Das Testing-Modul wird jedes Mal frisch kompiliert, um absolute Zustandsisolation zu gewährleisten. Verändert ein Test das Verhalten des Mocks, startet der nächste Test mit einem sauberen Ausgangszustand – unkontrollierte Abhängigkeiten zwischen Tests werden so verhindert.

Besonders wichtig ist die DI-Konfiguration: `getRepositoryToken(User)` fragt NestJS nach dem internen Bezeichner, den es für das User-Repository verwendet. Die Eigenschaft `useValue` zwingt das Modul dazu, immer dann unser `mockUserRepository` zu injizieren, wenn dieser Bezeichner angefordert wird.

---

## Den Mock steuern: Happy Path und Unhappy Path

Mit der fertig kompilierten Sandbox können wir die eigentlichen Testfälle schreiben.

Datenbankabfragen sind asynchron. Wenn wir eine Repository-Methode wie `findOne` mocken, können wir nicht einfach ein statisches Objekt zurückgeben – wir müssen ein `Promise` zurückgeben. Mit `.mockResolvedValue(fakeUser)` programmieren wir unsere Fake-Funktion so, dass sie unsere Dummy-Daten sofort als aufgelöstes Promise zurückgibt. Das simuliert eine erfolgreiche Datenbankabfrage perfekt, ohne eine Festplatte anzufassen.

So testen wir sowohl einen erfolgreichen Abruf (Happy Path) als auch einen fehlenden Datensatz (Unhappy Path):

```typescript
// user.service.spec.ts
describe("UserService", () => {
  // ...
  beforeEach(async () => {
    // ...
  });

  it("gibt den Namen eines Nutzers erfolgreich zurück", async () => {
    // Arrange: Mock so programmieren, dass ein bestimmter Nutzer zurückgegeben wird
    const testUser = { id: 1, name: "Alice", email: "alice@example.com" };
    mockUserRepository.findOne.mockResolvedValue(testUser);

    // Act: Die Service-Methode aufrufen
    const result = await service.getUserName(1);

    // Assert: Prüfen, ob der Mock korrekt aufgerufen wurde und die Ausgabe stimmt
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe("Alice");
  });

  it("wirft eine NotFoundException, wenn der Nutzer nicht existiert", async () => {
    // Arrange: Mock so programmieren, dass ein fehlender Datenbankdatensatz simuliert wird
    mockUserRepository.findOne.mockResolvedValue(null);

    // Act & Assert: Erwarten, dass das Promise mit einem bestimmten Fehler ablehnt
    await expect(service.getUserName(99)).rejects.toThrow(NotFoundException);
  });
});
```

Services verbringen einen erheblichen Teil ihrer Ausführungszeit damit, fehlende Daten, ungültige Zustände oder unberechtigte Zugriffe zu behandeln. Eine robuste Test-Suite validiert diese Fehlerzustände genauso sorgfältig wie die Erfolgspfade.

---

## Wichtige Vitest-Mock-Hilfsmittel

Im Umgang mit Abhängigkeiten in Test-Suites wird man immer wieder auf dieselben Kernfunktionen zurückgreifen. Bei Bedarf lohnt sich ein Blick in die Dokumentation. Hier eine kurze Übersicht:

| Methode | Zweck |
|---|---|
| `vi.fn()` | Erstellt eine Mock-Funktion, die alle Aufrufe und Argumente aufzeichnet |
| `.mockResolvedValue(value)` | Lässt den Mock ein aufgelöstes Promise zurückgeben (für async-Methoden) |
| `.mockReturnValue(value)` | Lässt den Mock einen synchronen Wert zurückgeben |
| `vi.spyOn(object, 'method')` | Umhüllt eine bestehende Methode, um Aufrufe zu verfolgen, ohne die Originallogik zu ersetzen |
| `.toHaveBeenCalledWith(...args)` | Prüft, ob der Mock mit den angegebenen Argumenten aufgerufen wurde |

---

## Weiterführende Ressourcen

- [NestJS Testing – Dokumentation](https://docs.nestjs.com/fundamentals/testing)
- [Vitest Mock Functions – Dokumentation](https://vitest.dev/api/mock.html)

---

> **Denkanstoß:** Der Mock wird als Modulkonstante außerhalb von `beforeEach` definiert. Was passiert, wenn `findOne` in einem Test mit `.mockResolvedValue(null)` programmiert wird – hat das Auswirkungen auf den nächsten Test? Und wie ließe sich das verhindern?