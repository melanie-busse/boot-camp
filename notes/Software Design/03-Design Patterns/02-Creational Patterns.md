# Software Design – Entwurfsmuster: Erzeugungsmuster

Ein Objekt zu erstellen wirkt zunächst einfach. Man ruft `new IrgendEineKlasse(...)` auf und ist fertig. Erzeugungsmuster helfen dabei, dieses grundlegende Prinzip zu verbessern. Sie teilen die Aufgabe in zwei Teile auf. Ein Teil des Programms sagt: „Ich brauche diese Art von Ding." Ein anderer Teil entscheidet, welche konkrete Klasse gebaut und wie sie verdrahtet wird. Diese Trennung hat drei praktische Vorteile:

- Die Entscheidung, welche Version eines Objekts verwendet werden soll, kann bis zur Laufzeit warten – dann, wenn das Programm die nötige Information zur Auswahl hat.
- Komplizierte Einrichtungsschritte leben an einer Stelle, anstatt überall wiederholt zu werden, wo das Objekt benötigt wird.
- Gemeinsame oder begrenzte Ressourcen (Datenbankpools, Hardware-Handles) können wiederverwendet werden, anstatt immer wieder neu erstellt zu werden.

Diese Datei behandelt die drei Erzeugungsmuster, denen man am häufigsten begegnet:

| Muster | Löst | Gedankenmodell |
|---|---|---|
| **Factory** | Zur Laufzeit zwischen mehreren konkreten Klassen wählen | Aus einer Speisekarte bestellen |
| **Builder** | Ein Objekt mit vielen optionalen Teilen zusammenbauen | Ein Sandwich Zutat für Zutat zusammenstellen |
| **Singleton** | Genau eine Instanz von etwas garantieren | Ein Schlüssel für ein Schloss |

---

## Factory

Eine Factory ist eine Funktion oder Klasse, deren einzige Aufgabe es ist, andere Objekte zu erstellen. Der Code, der das Objekt benötigt, fragt die Factory, und die Factory entscheidet, welche konkrete Klasse zurückgegeben wird.

Der Nutzen dieses Musters wird deutlich, wenn man sieht, was ohne es passiert. Stell dir einen Musikplayer vor, der verschiedene Audioformate dekodieren muss. Jedes Format (`mp3`, `flac`, `wav`) benötigt eine andere Decoder-Klasse:

```ts
class Player {
  load(file: AudioFile) {
    let decoder: Decoder;
    if (file.format === "mp3") decoder = new Mp3Decoder();
    else if (file.format === "flac") decoder = new FlacDecoder();
    else if (file.format === "wav") decoder = new WavDecoder();
    else throw new Error(`Nicht unterstütztes Format: ${file.format}`);

    decoder.decode(file.buffer);
  }
}
```

Die `Player`-Klasse möchte eigentlich nur Audio abspielen. Sie ist jetzt aber auch dafür verantwortlich, jede existierende Decoder-Klasse zu kennen. Sobald jemand Unterstützung für `.ogg`-Dateien hinzufügt, muss die `Player`-Klasse geändert werden. Das verstößt gegen das **Open/Closed-Prinzip**, das besagt, dass Klassen offen für neue Funktionen (wie ein neues Audioformat) sein sollen, ohne dass bestehender Code geändert werden muss.

Die Entscheidung in eine Factory-Funktion auszulagern behebt das. Die Factory nimmt das Format entgegen und gibt einen `Decoder` zurück. `Decoder` ist ein Interface – ein Vertrag, der beschreibt, welche Methoden ein Decoder haben muss. Jede konkrete Decoder-Klasse implementiert genau dieses Interface, sodass der `Player` nur das Interface kennen muss.

```ts
export interface Decoder {
  decode(buffer: Buffer): AudioFrame[];
}

export function createDecoder(format: AudioFormat): Decoder {
  switch (format) {
    case "mp3":
      return new Mp3Decoder();
    case "flac":
      return new FlacDecoder();
    case "wav":
      return new WavDecoder();
    default:
      throw new Error(`Nicht unterstütztes Format: ${format}`);
  }
}

class Player {
  load(file: AudioFile) {
    const decoder = createDecoder(file.format);
    decoder.decode(file.buffer);
  }
}
```

`.ogg`-Unterstützung hinzuzufügen erfordert jetzt genau zwei Änderungen: eine `OggDecoder`-Klasse schreiben und einen `case` zur Factory hinzufügen. Die `Player`-Klasse bleibt exakt wie sie war.

---

## Builder

Ein Builder ist ein separates Objekt, dessen Aufgabe es ist, ein anderes Objekt Schritt für Schritt zusammenzubauen. Man ruft Methoden auf dem Builder auf, um jedes Teil zu setzen, und eine abschließende `build()`-Methode liefert das fertige Ergebnis.

Das Problem, das Builder lösen, ist der **Teleskop-Konstruktor** – ein Konstruktor, der eine lange Liste optionaler Argumente entgegennimmt, wobei die meisten Aufrufe `undefined` für die Werte übergeben, die sie nicht benötigen:

```ts
const query = new PlaylistQuery(
  undefined,    // year
  "Daft Punk",  // artist
  undefined,    // minDuration
  240,          // maxDuration
  true,         // shuffle
);
```

Diesen Aufruf zu lesen bedeutet, Kommas zu zählen. Was bedeutet `240`? Was bedeutet `true`? Man muss die Konstruktordefinition nachschlagen, um das herauszufinden.

Ein Builder ersetzt die lange Argumentliste durch eine Reihe von gut benannten Methodenaufrufen. Jede Methode speichert ein Stück Zustand und gibt den Builder selbst zurück. Dadurch können diese Aufrufe verkettet werden, was den Code lesbarer macht.

```ts
export class PlaylistQueryBuilder {
  private filters: Partial<QueryFilters> = {};

  releasedAfter(year: number): this {
    this.filters.year = year;
    return this;
  }

  byArtist(name: string): this {
    this.filters.artist = name;
    return this;
  }

  shorterThan(seconds: number): this {
    this.filters.maxDuration = seconds;
    return this;
  }

  shuffled(): this {
    this.filters.shuffle = true;
    return this;
  }

  build(): PlaylistQuery {
    if (this.filters.minDuration && this.filters.maxDuration) {
      if (this.filters.minDuration > this.filters.maxDuration) {
        throw new Error("Ungültiger Dauerbereich");
      }
    }
    return new PlaylistQuery(this.filters);
  }
}

const query = new PlaylistQueryBuilder()
  .byArtist("Daft Punk")
  .shorterThan(240)
  .shuffled()
  .build();
```

Drei Dinge sind im obigen Builder bemerkenswert:

- Jeder Setter gibt `this` zurück, was die Methodenverkettung ermöglicht. Der Rückgabetyp `this` sorgt dafür, dass die verketteten Aufrufe korrekt typisiert werden.
- `build()` ist der einzige Ort, an dem ein `PlaylistQuery` tatsächlich erstellt wird. Das macht es zum richtigen Ort für Validierungen, die von mehr als einem Feld abhängen – zum Beispiel zu prüfen, ob `minDuration` nicht größer als `maxDuration` ist.
- Das fertige `PlaylistQuery` kann unveränderlich sein. Jeder unordentliche Teilzustand bleibt im Builder.

> **Hinweis:** TypeScript bietet für dieses Problem bereits eine leichtgewichtigere Option. Ein einzelnes Konfigurationsobjekt zu übergeben – z. B. `new PlaylistQuery({ artist: "Daft Punk", shuffle: true })` – ermöglicht benannte Argumente und optionale Felder, ohne eine Builder-Klasse zu schreiben. Greife auf einen echten Builder zurück, wenn die Konstruktion in sequenziellen Schritten erfolgen muss, wenn Validierungsregeln mehrere Felder betreffen oder wenn ein halb fertiges Objekt an andere Funktionen weitergegeben werden muss, bevor es abgeschlossen wird.

---

## Singleton

Ein Singleton ist eine Klasse, die nur eine einzige Instanz für das gesamte Programm erlaubt. Code kann von überall diese Instanz über eine statische Methode abrufen, üblicherweise `getInstance()` genannt.

Ein echter Anwendungsfall ist etwas, das eine reale Ressource besitzt, die nicht geteilt werden kann. Eine Soundkarte beispielsweise kann von jeweils nur einem Prozess geöffnet werden. Wenn zwei verschiedene Programmteile sie gleichzeitig beanspruchen würden, würde die Audioausgabe abstürzen oder unbrauchbares Signal ausgeben. Die Audio-Engine, die mit der Soundkarte kommuniziert, ist ein guter Kandidat für ein Singleton:

```ts
export class AudioEngine {
  private static instance: AudioEngine | null = null;

  private constructor(private readonly sampleRate: number) {}

  static initialize(sampleRate: number): AudioEngine {
    if (this.instance) {
      throw new Error("AudioEngine ist bereits initialisiert");
    }
    this.instance = new AudioEngine(sampleRate);
    return this.instance;
  }

  static getInstance(): AudioEngine {
    if (!this.instance) {
      throw new Error("AudioEngine muss zuerst initialisiert werden");
    }
    return this.instance;
  }

  play(buffer: AudioFrame[]): void {
    // kommuniziert mit der Soundkarte
  }
}
```

Einige Details im Beispiel:

- Der Konstruktor ist `private`, sodass niemand außerhalb der Klasse `new AudioEngine()` aufrufen kann. Die Klasse kontrolliert selbst, wie ihre Instanz erstellt wird.
- Das statische `instance`-Feld hält die einzige Kopie. Der erste Aufruf von `initialize` füllt es. Jeder spätere Aufruf von `getInstance` gibt dasselbe Objekt zurück.
- Die statischen Hilfsmethoden werfen klare Fehler, wenn die Engine vor der Initialisierung verwendet oder zweimal initialisiert wird.

Jeder Programmteil kann nun `AudioEngine.getInstance().play(...)` aufrufen – und jeder Aufruf landet bei derselben Engine.

### Wo Singleton schiefläuft

Die Falle liegt darin, Singleton für Dinge zu verwenden, die lediglich bequem global zugänglich sein sollen. Ein häufiger Übeltäter ist ein Logger:

```ts
class TrackService {
  play(track: Track) {
    Logger.getInstance().info(`Abgespielt: ${track.title}`);
    // ...
  }
}
```

Von außen betrachtet sieht man `TrackService` nicht an, dass er von einem Logger abhängt. Sein Konstruktor nimmt nichts entgegen. Die Abhängigkeit ist im Methodenrumpf versteckt. Wenn ein Unit-Test für `TrackService` geschrieben wird, läuft der echte Logger im Hintergrund mit – und er könnte dabei auf Disk schreiben oder Netzwerkanfragen senden.

**Der bessere Standard ist es, Abhängigkeiten über den Konstruktor hereinzureichen** (das nächste Kapitel behandelt genau das unter dem Stichwort *Dependency Injection*). Behalte Singleton für Fälle, in denen zwei Instanzen tatsächlich etwas kaputtmachen würden.

---

## Ressourcen

- [Erzeugungsmuster auf Refactoring Guru](https://refactoring.guru/design-patterns/creational-patterns)