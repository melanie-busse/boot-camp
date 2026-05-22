# NestJS – Überblick

NestJS ist ein TypeScript-first-Framework für die Entwicklung serverseitiger Node.js-Anwendungen. Es läuft standardmäßig auf Express, sodass die bereits bekannte HTTP-Schicht weiterhin vorhanden ist – aber NestJS fügt eine definierte Anwendungsstruktur, ein eingebautes Dependency-Injection-System und eine Reihe von Konventionen hinzu, die durch TypeScript-Decorators durchgesetzt werden. Diese Konventionen sorgen für vorhersehbare Skalierbarkeit: Die Muster, die in einem kleinen Projekt verwendet werden, lassen sich direkt auf größere übertragen.

Express überlässt fast jede strukturelle Entscheidung dem Entwickler. Wo kommt die Routing-Logik hin? Wie erhalten Komponenten Zugriff auf gemeinsame Services? Wie wird die Anwendung initialisiert? Auf diese Fragen gibt es keine eingebauten Antworten. NestJS beantwortet sie alle – und tut das konsistent in jedem Projekt, das es verwendet. Deshalb greifen Teams typischerweise auf NestJS zurück, sobald eine Express-Codebasis schwer zu navigieren wird.

---

## Kernbausteine

NestJS organisiert jede Anwendung um drei Klassentypen. Alle drei sind im minimalen Beispiel gegen Ende dieser Einheit zu sehen.

**Module** sind Organisationseinheiten. Jede NestJS-Anwendung hat mindestens eines: das Root-Module. Ein Module deklariert, welche Controller und Provider dazu gehören. Wenn das Framework startet, liest es das Module, um zu wissen, was instanziiert und wie alles verdrahtet werden soll.

**Controller** verarbeiten eingehende HTTP-Anfragen. Dieses Muster ist bereits aus der MVC-Architektur der Express-Projekte bekannt. In NestJS ist ein Controller eine Klasse, die mit `@Controller()` dekoriert ist. Seine Methoden werden mit Routen-Decorators wie `@Get()` oder `@Post()` dekoriert, die HTTP-Anfragen auf Handler-Funktionen abbilden.

**Provider** sind Klassen, die das Framework verwaltet und in andere Komponenten injizieren kann. Services sind die häufigste Art von Provider. Eine Klasse wird zum Provider, wenn sie mit `@Injectable()` dekoriert und in einem Module registriert ist.

---

## Architekturphilosophie

Eine verbreitete Methode, ein Backend zu strukturieren, ist die Aufteilung nach technischer Rolle: ein Ordner für alle Controller, einer für alle Services, einer für alle Repositories. Das wird manchmal als **Layered Architecture** bezeichnet, weil die Trennung quer durch die Anwendung nach Schicht verläuft – statt durch sie hindurch nach Feature.

NestJS empfiehlt einen anderen Ansatz. Jedes Module gruppiert alles, was zu einem Feature gehört: seinen Controller, seinen Service und seinen Datenzugriff. Die Module lassen sich als **vertikale Schnitte** der Anwendung verstehen, die intern in Schichten aufgebaut sind.

Eine geschichtete Struktur für ein Projekt mit Nutzern und Produkten sieht so aus:

```
src/
  controllers/
    user.controller.ts
    product.controller.ts
  services/
    user.service.ts
    product.service.ts
  repositories/
    user.repository.ts
    product.repository.ts
```

Dasselbe Projekt mit NestJS-Modulen organisiert:

```
src/
  users/
    users.controller.ts
    users.service.ts
    users.module.ts
  products/
    products.controller.ts
    products.service.ts
    products.module.ts
  app.module.ts
```

Beim geschichteten Ansatz bedeutet das Nachverfolgen eines einzelnen Features das Lesen über mehrere Ordner hinweg. Mit vertikalen Schnitten befinden sich alle Dateien eines Features an einem Ort. Eine Funktion hinzuzufügen oder zu ändern berührt ein Module – nicht drei Schichten.

Module setzen diese Grenze explizit durch. Ein NestJS-Module deklariert, was es exportiert und was es von anderen Modulen importiert. Andere Module können nicht in es hineingreifen, es sei denn, es erlaubt das. Das ist bei einer einfachen Ordnerstruktur schwerer zu garantieren, wo jede Datei jede andere importieren kann.

Zusammenfassend lässt sich sagen: Die Designphilosophie von NestJS fördert eine **modulare Monolith-Architektur** mit vertikalen Schnitten und expliziten Modulgrenzen.

---

## Ressourcen

- [NestJS Dokumentation](https://docs.nestjs.com/)