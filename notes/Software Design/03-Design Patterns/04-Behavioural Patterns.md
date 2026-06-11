# Software Design – Entwurfsmuster: Verhaltensmuster

Nachdem betrachtet wurde, wie Klasseninstanzen auf saubere und wartbare Weise erstellt werden können, befassen sich Verhaltensmuster damit, was diese Teile zur Laufzeit tun und wie sie sich koordinieren. Die typischen Symptome, die Verhaltensmuster adressieren, sind aus jeder wachsenden Codebasis bekannt:

- Eine Kernklasse sammelt immer mehr Referenzen auf andere Systeme, weil jedes neue Feature benachrichtigt werden möchte, wenn etwas passiert.
- Eine Methode wählt zwischen mehreren Algorithmen anhand eines Flags und bekommt bei jeder neuen Option eine längere if/else-Kette.
- Eine Klasse verfolgt ihren aktuellen Zustand mit mehreren Boolean-Feldern – und nichts verhindert, dass diese Felder in unsinnigen Kombinationen enden.

Jedes der drei Muster in dieser Datei zielt auf eines dieser Symptome ab.

| Muster | Löst | Gedankenmodell |
|---|---|---|
| **Observer** | Mehrere Systeme über ein Ereignis benachrichtigen, ohne sie direkt zu benennen | Ein Radiosender: Jeder kann einstimmen |
| **Strategy** | Den Algorithmus einer Klasse zur Laufzeit austauschen | Ein Elektrowerkzeug mit verschiedenen Bohraufsätzen |
| **State Machine** | Die verfügbaren Methoden vom aktuellen Zustand des Objekts abhängig machen | Ein Buchreservierungssystem: Ein Buch kann nur reserviert werden, wenn es verfügbar ist, und nur zurückgegeben werden, wenn es ausgeliehen ist |

---

## Observer

Eine Analogie für das Observer-Muster wäre ein Newsletter oder ein YouTube-Kanal.

Ein Objekt (das „Subject") pflegt eine Liste interessierter Parteien (die „Observer"). Wenn etwas passiert, sendet das Subject eine Benachrichtigung an alle auf dieser Liste. Das Subject kümmert sich nicht darum, was die Observer mit den Informationen tatsächlich machen – es sendet einfach das Update. Das Observer-Muster ermöglicht es einem Objekt, das Eintreten eines Ereignisses anzukündigen, und beliebig vielen anderen Objekten – den Beobachtern – darauf zu reagieren, ohne dass der Ankündiger weiß, wer sie sind.

Das Muster verdient seinen Platz in dem Moment, in dem eine Klasse beginnt, unzusammenhängende Abhängigkeiten zu sammeln, nur um sie informiert zu halten. Im Folgenden kennt `Player` den Scrobbler, die Empfehlungs-Engine und Analytics – obwohl seine eigentliche Aufgabe das Abspielen von Musik ist:

```ts
class Player {
  constructor(
    private readonly scrobbler: Scrobbler,
    private readonly recommender: RecommendationEngine,
    private readonly analytics: Analytics,
  ) {}

  play(track: Track) {
    AudioEngine.getInstance().play(track);
    this.scrobbler.recordPlay(track);
    this.recommender.update(track);
    this.analytics.track("track.played", { id: track.id });
  }
}
```

Jedes neue Feature, das auf Wiedergabe reagieren möchte (Hintergrund-Downloads pausieren, Bildschirmschoner dimmen usw.), bedeutet ein neues Konstruktorargument und einen neuen Methodenaufruf in `play`. Der `Player` verwandelt sich langsam in ein Bedienfeld für die halbe Anwendung.

Das Observer-Muster dreht die Beziehung um. Der `Player` ruft die anderen Systeme nicht auf. Er kündigt lediglich an, was passiert ist, an einen Pool von Abonnenten. Die anderen Systeme abonnieren die Ereignisse, die sie interessieren. In der Informatik wird ein solcher gemeinsamer Kommunikationsweg als **Bus** bezeichnet.

```ts
type PlayerEvent =
  | { type: "track.played"; track: string }
  | { type: "track.finished"; track: string };

type Listener = (event: PlayerEvent) => void;

class MusicPlayer {
  private listeners: Listener[] = [];

  subscribe(listener: Listener) {
    this.listeners.push(listener);
  }

  emit(event: PlayerEvent) {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

// Verwendung
const player = new MusicPlayer();

player.subscribe((event: PlayerEvent) => {
  if (event.type === "track.played") {
    console.log("Spielt jetzt:", event.track);
  } else if (event.type === "track.finished") {
    console.log("Track beendet:", event.track);
  }
});

player.emit({ type: "track.played", track: "Bohemian Rhapsody" });
```

Die zwei Methoden dieses Bus sind:

- `subscribe(handler)` registriert eine Funktion, die immer dann aufgerufen wird, wenn ein Ereignis ausgesendet wird.
- `emit(event)` ruft alle registrierten Listener mit dem gegebenen Ereignis auf.

Die Verdrahtung der Abonnenten geschieht einmalig im Composition Root. Einen Listener hinzuzufügen oder zu entfernen ist nun eine Änderung im Verdrahtungscode – nicht im `Player`.

---

## Strategy

Das Strategy-Muster speichert einen Algorithmus in einem Objekt, sodass der Aufrufer zur Laufzeit einen Algorithmus gegen einen anderen austauschen kann.

Das Muster zielt auf den Fall ab, in dem eine Methode anhand eines Mode-Flags zwischen mehreren Verhaltensweisen wählt. Jeder neue Modus bedeutet einen weiteren Zweig in derselben Methode:

```ts
class Player {
  mode: "sequential" | "shuffle" | "repeat-one" = "sequential";

  nextTrack(currentIndex: number, playlistLength: number): number {
    if (this.mode === "sequential") {
      return currentIndex + 1 < playlistLength ? currentIndex + 1 : -1;
    } else if (this.mode === "shuffle") {
      return Math.floor(Math.random() * playlistLength);
    } else {
      return currentIndex;
    }
  }
}
```

Strategy verschiebt jeden Zweig in eine eigene kleine Klasse, die ein gemeinsames Interface implementiert. Das Interface legt fest, was jede Strategy können muss:

```ts
export interface PlaybackStrategy {
  next(currentIndex: number, playlistLength: number): number;
}

export class Sequential implements PlaybackStrategy {
  next(currentIndex: number, playlistLength: number) {
    return currentIndex + 1 < playlistLength ? currentIndex + 1 : -1;
  }
}

export class Shuffle implements PlaybackStrategy {
  next(_currentIndex: number, playlistLength: number) {
    return Math.floor(Math.random() * playlistLength);
  }
}
```

Der `Player` hält eine Referenz auf die aktuell aktive Strategy und delegiert die Berechnung an sie:

```ts
class Player {
  constructor(private strategy: PlaybackStrategy) {}

  setStrategy(strategy: PlaybackStrategy) {
    this.strategy = strategy;
  }

  nextTrack(currentIndex: number, playlistLength: number): number {
    return this.strategy.next(currentIndex, playlistLength);
  }
}
```

Shuffle über die UI umzuschalten ist nun eine einzige Zeile: `player.setStrategy(new Shuffle())`. Einen neuen Wiedergabemodus hinzuzufügen bedeutet, eine neue Klasse zu schreiben. Der `Player` ändert sich nicht.

---

## State Machine

Eine State Machine fixiert ein Objekt zu jedem Zeitpunkt auf genau einen Zustand aus einer festen Liste erlaubter Zustände und legt fest, welche Übergänge zwischen diesen Zuständen zulässig sind. Alles andere wird abgelehnt.

Die State Machine lässt sich grob als Ampel vorstellen. Sie kann nur eine Farbe gleichzeitig haben (Rot, Gelb oder Grün), und man kann nicht direkt von Rot zu Grün springen, ohne die Verkehrsregeln zu befolgen. Im Code verhindert dieses Muster, dass ein Objekt Dinge tut, die es in seinem aktuellen Zustand nicht tun sollte.

Die Motivation ist, dass lose Boolean-Flags Kombinationen ermöglichen, die der Code nie beabsichtigt hat:

```ts
class Player {
  isLoading = false;
  isPlaying = false;
  isPaused = false;

  pause() {
    this.isPlaying = false;
    this.isPaused = true;
  }
}
```

Drei Booleans beschreiben acht Kombinationen, aber nur wenige davon ergeben Sinn. Es gibt keine Regel, die verhindert, dass `isPlaying` und `isPaused` gleichzeitig `true` sind. `pause()` aufzurufen, während der Player noch lädt, setzt lautlos `isPaused = true` – obwohl die Wiedergabe noch gar nicht begonnen hat.

Eine State Machine ersetzt diese Booleans durch ein einziges Feld, das nur einen von wenigen Werten halten kann, sowie eine Tabelle, die beschreibt, welche Ereignisse in jedem Zustand zulässig sind:

```ts
type PlayerState = "idle" | "loading" | "playing" | "paused";
type PlayerEvent = "load" | "ready" | "pause" | "resume" | "stop" | "error";

const transitions: Record<
  PlayerState,
  Partial<Record<PlayerEvent, PlayerState>>
> = {
  idle:    { load: "loading" },
  loading: { ready: "playing", error: "idle" },
  playing: { pause: "paused", stop: "idle" },
  paused:  { resume: "playing", stop: "idle" },
};

class Player {
  private state: PlayerState = "idle";

  transition(event: PlayerEvent) {
    const next = transitions[this.state][event];
    if (!next)
      throw new Error(`Ungültiger Übergang: ${event} aus ${this.state}`);
    this.state = next;
  }

  pause() {
    this.transition("pause");
  }
}
```

Die Übergangstabelle liest sich wie eine kleine Spezifikation. Aus `idle` ist das einzige erlaubte Ereignis `load`, das den Player in `loading` überführt. Aus `loading` sind nur `ready` oder `error` erlaubt usw. Jedes Ereignis, das in der aktuellen Zeile nicht erscheint, wirft einen Fehler.

`pause()` aufzurufen, während der Player sich im Zustand `idle` befindet, korrumpiert den Zustand nicht mehr lautlos. Es wirft einen klaren Laufzeitfehler, der genau den unzulässigen Übergang benennt. Die Menge unmöglicher Zustände hört auf, etwas zu sein, das das Team im Kopf behalten muss – und wird zu etwas, das der Code selbst erzwingt.

---

## Abschließende Gedanken zu Entwurfsmustern

Das Erlernen von Mustern birgt ein echtes Risiko: Sobald man das Vokabular kennt, sieht jedes Problem so aus, als würde es ein Muster benötigen. Drei Faustregeln, um dem entgegenzuwirken:

**Nicht für eine imaginäre Zukunft abstrahieren.** Ein 30-Zeilen-Skript, das mit einer SQLite-Datei spricht, braucht kein Repository. Zwei eng gekoppelte Konsumenten brauchen keinen Observer. Warte, bis der Code zeigt, dass er die Abstraktion braucht. Den Kurs zu korrigieren ist meist günstig; eine falsche Abstraktion zu entfernen ist es nicht.

**Den tatsächlichen Schmerz lösen.** Es ist verlockend, zum Muster zu greifen, das man gerade gelernt hat. Sechs neue Decorators beheben selten eine Methode, die niemand mehr versteht. Wenn man das konkrete Problem nicht in einem Satz benennen kann, ist das Muster wahrscheinlich der falsche Ansatz.

**Komplexität um der Komplexität willen vermeiden.** Struktur zum Code hinzuzufügen kann sich sicher anfühlen, aber jede hinzugefügte Komplexität hat ihren eigenen Preis. Wenn keine guten Gründe für die Abstraktion gefunden werden können, hat sie ihren Platz in der Codebasis nicht verdient.

---

## Ressourcen

- [Verhaltensmuster auf Refactoring Guru](https://refactoring.guru/design-patterns/behavioral-patterns)