# Real-Time Communication – Frontend Integration & State

Ein Socket ist eine einzelne Verbindung, die über einen langen Zeitraum offen bleiben soll. Eine React-Komponente ist das Gegenteil: Sie rendert ständig neu und wird gemountet und unmountet, während der User sich durch die App bewegt. Wenn du den Socket direkt in die Komponente legst, öffnest du bei jedem Render eine neue Verbindung, oder du registrierst denselben Event-Handler mehrfach, sodass ein einzelnes Event deinen Code mehr als einmal ausführt. Schauen wir uns an, wie man das vermeidet.

## Der Socket.io-Client in React

Die erste Entscheidung ist, wo der Socket lebt. Wenn du `io(...)` im Body der Komponente aufrufst, öffnest du bei jedem Render eine neue Verbindung, was so gut wie nie das ist, was du willst. Die Verbindung sollte einmal erstellt und geteilt werden. Der einfachste Weg ist, sie einmal im Module Scope zu erstellen, sodass jeder Render der Komponente denselben Socket wiederverwendet.

```javascript
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", { autoConnect: false });

export function Poll({ pollId }: { pollId: string }) {
  const [results, setResults] = useState<Record<string, number>>({});

  useEffect(() => {
    socket.connect();
    socket.emit("joinPoll", pollId);

    const onResults = (data: Record<string, number>) => setResults(data);
    socket.on("results", onResults);

    return () => {
      socket.off("results", onResults);
      socket.disconnect();
    };
  }, [pollId]);

  const vote = (option: string) => socket.emit("vote", { pollId, option });

  return (
    <div>
      <button onClick={() => vote("pizza")}>Pizza</button>
      <button onClick={() => vote("pasta")}>Pasta</button>
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
}
```

Der Socket wird einmal erstellt, außerhalb der Komponente, sodass Re-Renders nie einen zweiten erzeugen. `autoConnect: false` zu übergeben verhindert, dass er sich verbindet, sobald das Modul lädt. Stattdessen öffnet der Effect die Verbindung, sodass sie daran gekoppelt ist, wann die Komponente auf dem Bildschirm ist. Innerhalb des Effects verbindet sich der Socket, tritt der Room des Polls bei und beginnt, auf `results` zu hören; jedes Update geht in den State, sodass React mit dem neuen Ergebnis neu rendert. Einen Vote zu senden ist nur ein Event auf demselben geteilten Socket.

In einer größeren App würdest du dieses Setup nicht in jeder Komponente wiederholen. Eine Option wäre, den Socket in einen kleinen Zustand-Store zu verschieben, ähnlich wie wir es vorher in diesem Kurs mit Shared States gemacht haben.

## useEffect und Memory Leaks

Die Cleanup-Funktion in diesem Effect ist nicht optional. Jeder Aufruf von `socket.on("results", ...)` fügt einen weiteren Handler hinzu; er ersetzt nicht den vorherigen. Wenn die Komponente mountet, unmountet, und wieder mountet, oder der Effect erneut läuft, weil sich `pollId` geändert hat, registrierst du einen zweiten `results`-Listener, während der erste noch da ist. Jetzt führt ein einzelnes eingehendes Event deinen Handler zweimal aus, dann dreimal, und die State-Updates vervielfachen sich. Die Verbindung selbst ist vielleicht in Ordnung, aber die Listener leaken.

Die Lösung ist, exakt das zu entfernen, was du hinzugefügt hast. Deshalb wird der Handler in einer benannten Konstante `onResults` gespeichert statt in einer inline Arrow Function: `socket.off("results", onResults)` kann den Listener nur entfernen, wenn du dieselbe Function-Referenz übergibst, die du registriert hast. Eine inline Arrow Function, die sowohl an `on` als auch an `off` übergeben wird, wäre zwei unterschiedliche Funktionen, also würde das `off` nichts entfernen.

❗ **Achtung:** Im Development-Modus mountet der React Strict Mode jede Komponente, lässt ihre Effects laufen, und unmountet und remountet sie dann sofort wieder – absichtlich, um genau diese Art von Bug aufzudecken. Ohne richtiges Cleanup siehst du verdoppelte Verbindungen und Events, die zweimal feuern, aber nur in Development. „Behebe" das nicht, indem du den Strict Mode abschaltest. Die Verdopplung ist ein Zeichen dafür, dass dein Cleanup unvollständig ist.

## Reconnection handhaben

Verbindungen brechen ab, und oft aus ganz alltäglichen Gründen, etwa weil ein Laptop in den Schlafmodus geht. Socket.io übernimmt das erneute Verbinden selbst, mit Retry und Backoff, bis es durchkommt, aber es kann nicht entscheiden, was dein Interface währenddessen anzeigen soll. Dieser Teil liegt bei dir, und er beginnt damit, den Connection-Status im State zu tracken.

```javascript
const [connected, setConnected] = useState(socket.connected);

useEffect(() => {
  const onConnect = () => {
    setConnected(true);
    socket.emit("joinPoll", pollId); // re-join the room on every (re)connection
  };
  const onDisconnect = () => setConnected(false);

  socket.on("connect", onConnect);
  socket.on("disconnect", onDisconnect);

  return () => {
    socket.off("connect", onConnect);
    socket.off("disconnect", onDisconnect);
  };
}, [pollId]);
```

Die Events `connect` und `disconnect` kippen einen Boolean, den du als „Live"- oder „Reconnecting…"-Badge rendern kannst, damit der User versteht, warum Updates pausiert haben. Bei der Reconnection emittiert `onConnect` erneut `joinPoll`. Rooms leben auf dem Server, also startet ein wiederverbundener Socket in gar keiner Room. Wenn `joinPoll` nur einmal beim Start gelaufen wäre, würde der Client nach dem ersten Verbindungsabbruch still aufhören, Room-Updates zu bekommen. Das erneute Beitreten innerhalb von `onConnect` lässt es bei jeder Verbindung laufen, sodass der Client seine Room jedes Mal zurückbekommt. Dieselbe Idee gilt für jeden State, den der Client braucht, nachdem er offline war: Bei der Reconnection fragst du den Server nach dem aktuellen Ergebnis, damit das UI aufholt, was es verpasst hat.

## Ein Zustand-Store für den Socket

Das Pattern pro Komponente von oben funktioniert, aber in einer echten App interessieren sich mehrere Komponenten für dieselbe Verbindung und dieselben Ergebnisse. Dieser Kurs hat bereits Zustand für Shared State verwendet, und ein Socket passt in dieses Modell: Halte den Socket und seinen State in einem Store, und lass Komponenten lesen, was sie brauchen, und Actions aufrufen, um zu senden.

```javascript
import { create } from "zustand";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", { autoConnect: false });

type PollState = {
  results: Record<string, number>;
  connected: boolean;
  pollId: string | null;
  joinPoll: (pollId: string) => void;
  vote: (option: string) => void;
};

export const usePollStore = create<PollState>()((set, get) => {
  // Registered once, because the store is created once.
  socket.on("connect", () => {
    set({ connected: true });
    const { pollId } = get();
    if (pollId) socket.emit("joinPoll", pollId); // re-join on every (re)connection
  });
  socket.on("disconnect", () => set({ connected: false }));
  socket.on("results", (results: Record<string, number>) => set({ results }));

  return {
    results: {},
    connected: false,
    pollId: null,

    joinPoll: (pollId) => {
      set({ pollId });
      if (socket.connected) {
        socket.emit("joinPoll", pollId);
      } else {
        socket.connect();
      }
    },

    vote: (option) => socket.emit("vote", { pollId: get().pollId, option }),
  };
});
```

Die Listener werden einmal registriert, weil der Store einmal erstellt wird, also gibt es kein on/off pro Komponente und nichts, das leaken kann, wenn eine Komponente remountet. Der `connect`-Handler tritt der Room bei jeder Verbindung erneut bei — derselbe Reconnection-Fix wie im vorherigen Abschnitt, jetzt an einer einzigen Stelle. Komponenten lesen einzelne Slices des Stores und rendern nur neu, wenn sich diese Slices ändern:

```javascript
import { useEffect } from "react";
import { usePollStore } from "./pollStore";

export function Poll({ pollId }: { pollId: string }) {
  const results = usePollStore((s) => s.results);
  const connected = usePollStore((s) => s.connected);
  const joinPoll = usePollStore((s) => s.joinPoll);
  const vote = usePollStore((s) => s.vote);

  useEffect(() => {
    joinPoll(pollId);
  }, [pollId, joinPoll]);

  return (
    <div>
      <span>{connected ? "Live" : "Reconnecting..."}</span>
      <button onClick={() => vote("pizza")}>Pizza</button>
      <button onClick={() => vote("pasta")}>Pasta</button>
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
}
```

`joinPoll` läuft immer noch in einem Effect, der auf `pollId` keyed ist, aber jetzt spricht es mit dem Store statt direkt mit dem Socket. Weil der Socket für die Lebensdauer der App existiert, gibt es kein Disconnect beim Unmount; der Store behält die eine Verbindung, und jede Komponente teilt sie sich.

## Ressourcen

[Socket.io: Client API](https://socket.io/docs/v4/client-api/)
[Socket.io: Client with React](https://socket.io/how-to/use-with-react)
[React: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
[Zustand documentation](https://github.com/pmndrs/zustand)

## Denkanstoß

Im Store-Beispiel werden die Socket-Listener nur einmal registriert, weil der Store nur einmal erstellt wird – im Gegensatz zum Pattern pro Komponente, wo jeder Mount neue Listener anlegt und das Cleanup im `useEffect` entscheidend ist. Überlege: Welche anderen Browser-APIs oder externen Verbindungen in einer App (zum Beispiel ein WebRTC-Stream oder eine Geolocation-Subscription) würden von demselben Store-Pattern profitieren, und woran erkennst du, dass eine Ressource "App-Lifetime" statt "Komponenten-Lifetime" verdient?