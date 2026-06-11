# Software Design – Entwurfsmuster: Strukturmuster

Die Erzeugungsmuster befassten sich mit dem Erstellen von Objekten. Strukturmuster befassen sich mit dem Verbinden dieser Objekte. Die Probleme treten in dem Moment auf, in dem eine Klasse fest verdrahtet, mit welcher anderen Klasse sie arbeitet: ein Service, der seinen eigenen Datenbank-Client erstellt, eine Methode, die einen bestimmten Logger aufruft, eine Klasse, die umgeschrieben werden muss, um ein Teil gegen ein anderes auszutauschen. Die Klasse funktioniert – aber sie kann nur in genau einer Konfiguration funktionieren. Manche Codebasen sehen aus wie eine Schublade voller verwirrter Kabel: Zieht man an einem, zieht man das gesamte Bündel mit. Strukturmuster helfen dabei, alles ordentlich zu sortieren und die einzelnen beweglichen Teile voneinander zu entkoppeln.

Ohne Strukturmuster entstehen zwei Hauptprobleme:

- **Die Klasse ist schwer zu testen.** Um eine Methode zu testen, die ihren eigenen Datenbank-Client erstellt, muss eine echte Datenbank bereitgestellt werden. Es gibt keine Naht im Code, an der ein Fake eingeschleust werden kann.
- **Die Klasse ist schwer zu ändern.** Die Datenbank, den Logger oder den Formatter auszutauschen bedeutet, die Klasse selbst zu bearbeiten – obwohl die Änderung nichts mit dem zu tun hat, was die Klasse eigentlich tun soll.

Strukturmuster führen kleine Verbindungspunkte zwischen Objekten ein, sodass Teile einzeln ausgetauscht werden können. Die hier behandelten Muster sind:

| Muster | Löst | Gedankenmodell |
|---|---|---|
| **Repository** | Die Details der Datenspeicherung hinter einer sauberen Methodenoberfläche verbergen | Ein Bibliothekar: Man fragt nach einem Buch, nicht nach einer Regalkoordinate |
| **Dependency Injection** | Außenstehenden Code entscheiden lassen, mit welchen konkreten Teilen eine Klasse arbeiten wird | Das Tagesmenü bestellen: Der Koch entscheidet, welches Gericht serviert wird |
| **Decorator** | Einem Methode zusätzliches Verhalten hinzufügen, ohne sie zu verändern | Toppings auf einer Pizza: die Basis bleibt gleich |

---

## Repository

Ein Repository ist ein Objekt, das die Details der Datenspeicherung verbirgt. Der Rest des Programms fragt es nach Dingen in der Sprache der Fachdomäne (`findById`, `findByArtist`), und das Repository kümmert sich darum, wie sie abgerufen werden.

Ohne ein Repository sickert der Datenzugriffscode direkt in die Geschäftslogik. Die folgende Klasse spricht direkt mit PostgreSQL, kennt das benötigte SQL und setzt ein bestimmtes Tabellenschema voraus:

```ts
class PlayerService {
  async play(trackId: number) {
    const { rows } = await pgPool.query(
      "SELECT id, title, artist, format FROM tracks WHERE id = $1",
      [trackId],
    );

    const track = rows[0];
    if (!track) throw new Error(`Track ${trackId} nicht gefunden`);
    AudioEngine.getInstance().play(track);
  }
}
```

Darin stecken einige Probleme:

- `PlayerService` ist an PostgreSQL gebunden. Der Wechsel zu einer anderen Datenbank bedeutet, jede solche Methode umzuschreiben.
- Das Testen dieser Methode erfordert eine echte PostgreSQL-Instanz.
- Die SQL-Abfrage vermischt eine Daten-Zuständigkeit mit der Player-Zuständigkeit an einem Ort.

Das Repository-Muster beginnt damit, den Datenzugriffsvertrag als TypeScript-Interface zu definieren:

```ts
export interface Track {
  id: number;
  title: string;
  artist: string;
  format: AudioFormat;
}

export interface TrackRepository {
  findById(id: number): Promise<Track | null>;
  findByArtist(artist: string): Promise<Track[]>;
  save(track: Track): Promise<void>;
}
```

Das Interface listet auf, was der Rest des Programms von der Datenschicht benötigt – in Domänenbegriffen. Kein SQL taucht darin auf.

Anschließend wird eine oder mehrere konkrete Implementierungen dieses Interface geschrieben. Eine echte für die Produktion und üblicherweise eine einfache In-Memory-Implementierung für Tests:

```ts
export class PostgresTrackRepository implements TrackRepository {
  constructor(private readonly pg: Pool) {}

  async findById(id: number) {
    const { rows } = await this.pg.query(
      "SELECT id, title, artist, format FROM tracks WHERE id = $1",
      [id],
    );
    return rows[0] ?? null;
  }
  // ... weitere Methoden
}

export class InMemoryTrackRepository implements TrackRepository {
  private tracks = new Map<number, Track>();

  async findById(id: number) {
    return this.tracks.get(id) ?? null;
  }
  // ... weitere Methoden
}
```

Code, der nur vom `TrackRepository`-Interface abhängt, interessiert sich nicht dafür, welche Implementierung er bekommt. In der Produktion erhält er die PostgreSQL-Implementierung. In Tests erhält er die In-Memory-Implementierung, die in einem frischen, bekannten Zustand startet und in Mikrosekunden antwortet.

> **Repository vs. Model:** Ein Modell-Objekt ist die Daten und die Regeln selbst (was ein Nutzer *ist*), während ein Repository verwaltet, wie diese Daten gespeichert und abgerufen werden (wie man einen Nutzer *findet*). Das Repository könnte von SQL auf eine API umgestellt werden, ohne das Model zu berühren.

---

## Dependency Injection

Repositories lösen eine Hälfte des Kopplungsproblems. Die andere Hälfte ist, wie die aufrufende Klasse an eines gelangt. Wenn `PlayerService` seinen eigenen `PostgresTrackRepository` intern erstellt, ist die Klasse immer noch an PostgreSQL gebunden:

```ts
class PlayerService {
  private repo = new PostgresTrackRepository(pgPool);
  private engine = AudioEngine.getInstance();

  async play(trackId: number) {
    const track = await this.repo.findById(trackId);
    if (track) this.engine.play(track);
  }
}
```

**Dependency Injection (DI)** ist die Regel, dass eine Klasse ihre eigenen Abhängigkeiten niemals selbst erstellen sollte. Sie werden von außen hereingereicht – fast immer über den Konstruktor. Die Klasse deklariert, was sie nach Typ benötigt, und jemand anderes entscheidet, welches konkrete Objekt bereitgestellt wird. In einfachen Fällen kann das der Entwickler manuell tun, in komplexen Fällen übernimmt ein sogenanntes **DI-Framework** die automatische Zuweisung der richtigen Abhängigkeiten.

```ts
class PlayerService {
  constructor(
    private readonly tracks: TrackRepository,
    private readonly engine: AudioEngine,
  ) {}

  async play(trackId: number) {
    const track = await this.tracks.findById(trackId);
    if (track) this.engine.play(track);
  }
}
```

Die Parametertypen sind Interfaces (`TrackRepository`) statt konkreter Klassen. `PlayerService` kennt den Vertrag, von dem er abhängt – und nichts weiter.

Die Entscheidung, welche konkreten Klassen tatsächlich verwendet werden, wird an eine einzige Stelle am Programmstart verschoben – üblicherweise als **Composition Root** bezeichnet. Das ist der Punkt, an dem das Programm seine Hauptobjekte erstellt und verdrahtet, bevor der restliche Code läuft.

```ts
// Produktion
const service = new PlayerService(
  new PostgresTrackRepository(pgPool),
  AudioEngine.getInstance(),
);

// Test
const fakeEngine = { play: () => {} } as AudioEngine;
const testService = new PlayerService(
  new InMemoryTrackRepository(),
  fakeEngine,
);
```

Die Produktionsverdrahtung verwendet echte Implementierungen. Die Testverdrahtung verwendet günstige, isolierte. Die Klasse selbst ändert sich zwischen den beiden nicht.

---

## Decorators

Ein Decorator umhüllt eine bestehende Methode oder ein bestehendes Objekt und fügt Verhalten drum herum hinzu. Die umhüllte Methode erledigt weiterhin ihre ursprüngliche Arbeit, mit zusätzlichem Verhalten darübergelegt.

Das ist nützlich für Belange, die für viele Methoden gelten, aber in keine von ihnen gehören: Logging, Zeitmessung, Caching, Wiederholungsversuche, Berechtigungsprüfungen. Diese inline einzubauen vergräbt die eigentliche Geschäftslogik unter Boilerplate-Code. Ein Decorator hält die ursprüngliche Methode sauber und fügt das zusätzliche Verhalten als separates, wiederverwendbares Stück hinzu. Ein weiterer wichtiger Anwendungsfall sind DI-Frameworks, die Decorators häufig nutzen, um die richtigen Abhängigkeiten automatisch hinzuzufügen.

TypeScript hat eingebaute Syntax für Klassen-Methoden-Decorators. Ein Decorator ist eine Funktion, die die ursprüngliche Methode entgegennimmt und eine Ersatzmethode zurückgibt. Der Ersatz kann vor oder nach dem Aufruf des Originals beliebige Dinge tun. Der folgende Code zeigt die innere Funktionsweise eines Decorators. In der Praxis würde man Decorators in der Regel nur _verwenden_, nicht selbst schreiben:

```ts
function measure(originalMethod: any, context: ClassMethodDecoratorContext) {
  const name = String(context.name);
  return function (this: any, ...args: any[]) {
    const start = performance.now();
    const result = originalMethod.call(this, ...args);
    const elapsed = performance.now() - start;
    console.log(`[measure] ${name} dauerte ${elapsed.toFixed(2)}ms`);
    return result;
  };
}

@measure
function countToMillion() {
  let count = 0;
  console.log("startet.");
  while (count < 1000000) {
    count++;
  }
  console.log("fertig.");
}

countToMillion(); // gibt "startet.", "fertig." und "[measure] countToMillion dauerte x ms" aus
```

Die Funktion von oben nach unten gelesen: `measure` wird einmal aufgerufen, wenn die Klasse oder Funktion definiert wird. Sie gibt eine neue Funktion zurück, die dieselben Argumente wie das Original entgegennimmt. Diese zurückgegebene Funktion erfasst die Zeit, ruft das Original mit `originalMethod.call(this, ...args)` auf und protokolliert dann, wie lange der Aufruf gedauert hat.

So würde ein `@measure`-Decorator auf eine Methode angewendet:

```ts
class PostgresTrackRepository implements TrackRepository {
  constructor(private readonly pg: Pool) {}

  @measure
  async findById(id: number) {
    const { rows } = await this.pg.query(
      "SELECT id, title, artist, format FROM tracks WHERE id = $1",
      [id],
    );
    return rows[0] ?? null;
  }
}
```

Das Ergebnis ist, dass `findById` nur die Datenbankabfrage enthält. Das Zeitmessungsverhalten lebt in einer separaten, wiederverwendbaren Funktion, die an jede andere Methode angehängt werden kann, die sie benötigt.

---

## Ressourcen

- [Strukturmuster auf Refactoring Guru](https://refactoring.guru/design-patterns/structural-patterns)
- [Inversion of Control Containers and the Dependency Injection Pattern (Martin Fowler)](https://martinfowler.com/articles/injection.html)