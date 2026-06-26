# Real-Time Communication – Socket.io & NestJS

Ein roher WebSocket ist nur eine offene Verbindung. Wie der vorherige Abschnitt gezeigt hat, musst du alles, was eine echte Anwendung darüber hinaus braucht, selbst bauen. Natürlich gibt es bereits einige ausgereifte Implementierungen da draußen. Socket.io ist die Library, die einen Großteil davon für dich erledigt, und NestJS bringt Struktur darum, sodass dein Real-Time-Code genauso organisiert und testbar ist wie der Rest deines Backends, statt eine losen Sammlung von Event-Handlern zu sein. Das Running Example für den Rest dieser Session ist eine Live-Umfrage (Live Poll), bei der Clients Votes senden und der Server das aktualisierte Ergebnis an alle Zuschauer pusht.

## Native WebSockets vs. Socket.io

Socket.io ist nicht nur ein dünner Wrapper um den WebSocket des Browsers. Es ist ein eigenes Protokoll, das auf WebSockets aufsetzt, weshalb ein Socket.io-Client mit einem Socket.io-Server sprechen muss und sich nicht mit einem plain `ws://`-Endpoint verbinden kann. Im Gegenzug bietet es Dinge, die rohe WebSockets nicht haben:

- **Automatische Reconnection.** Wenn eine Verbindung abbricht, versucht der Client selbstständig weiter, sich neu zu verbinden, mit sinnvollem Backoff.
- **Transport-Fallback.** Wenn ein Netzwerk oder Proxy WebSockets blockiert, fällt Socket.io auf HTTP Long Polling zurück und funktioniert weiter, und upgradet dann auf einen echten WebSocket, sobald es kann.
- **Strukturierte Events mit JSON.** Du emittest benannte Events mit plain Objects, und Socket.io serialisiert und deserialisiert sie für dich. Kein manuelles `JSON.stringify` bei jeder Message.
- **Rooms und Namespaces.** Eingebaute Wege, um Clients zu gruppieren und Traffic in separate Channels aufzuteilen, sodass du eine Message an eine Gruppe von Usern liefern kannst statt an alle.

## NestJS Gateways

In NestJS ist das Äquivalent zu einem Controller für WebSocket-Traffic ein Gateway. Es ist eine normale Provider-Klasse, markiert mit einem Decorator, und läuft standardmäßig auf Socket.io.

Installiere zuerst die WebSocket-Packages im Backend:

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

Das Frontend braucht `socket.io-client`. Aber implementieren wir zuerst das Gateway:

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { PollService } from "./poll.service";

@WebSocketGateway({ cors: { origin: "*" } })
export class PollGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly pollService: PollService) {}

  @SubscribeMessage("vote")
  handleVote(@MessageBody() option: string) {
    const results = this.pollService.addVote(option);
    this.server.emit("results", results);
  }
}
```

Jeder Decorator hat eine bestimmte Aufgabe:

- `@WebSocketGateway()` markiert die Klasse als Gateway und akzeptiert Konfiguration wie einen Port, einen Namespace, oder CORS-Settings.
- `@WebSocketServer()` injected die zugrunde liegende Socket.io-`Server`-Instanz, mit der du Messages rauspushst.
- `@SubscribeMessage("vote")` registriert die Methode als Handler für das `vote`-Event, ungefähr das Äquivalent zu einem Route-Handler für einen HTTP-Endpoint.
- `@MessageBody()` zieht die Daten, die der Client mit dem Event geschickt hat, in einen Parameter.

Die `cors`-Option im Decorator braucht eine kurze Erklärung. Der Browser behandelt die Verbindung als Cross-Origin-Request, sobald das Frontend von einem anderen Origin ausgeliefert wird als das Backend – was während der Entwicklung fast immer der Fall ist: Der Dev-Server läuft auf einem Port, Nest auf einem anderen. Ohne erlaubten Origin blockiert der Browser den Handshake, bevor Socket.io überhaupt läuft. `origin: "*"` erlaubt jeden Origin, was während der Entwicklung in Ordnung ist; in Production würdest du die echte URL deines Frontends setzen.

Schau dir den Constructor an. Ein Gateway ist ein gewöhnlicher NestJS-Provider, also funktioniert Dependency Injection genau wie überall sonst in der App. Das Gateway injected einen `PollService` und überlässt ihm das eigentliche Zählen. Das hält das Gateway fokussiert auf Senden und Empfangen, während die Business-Logik in einem Service bleibt, den du eigenständig testen kannst.

Hier der minimale `PollService`, an den delegiert wird:

```typescript
import { Injectable } from "@nestjs/common";

@Injectable()
export class PollService {
  private tallies: Record<string, number> = {};

  addVote(option: string) {
    this.tallies[option] = (this.tallies[option] ?? 0) + 1;
    return this.tallies;
  }
}
```

Registriere beide als Provider in einem Modul – `@Module({ providers: [PollGateway, PollService] })` – und importiere dieses Modul in dein `AppModule`. Das reicht, um es laufen zu lassen; der Rest ist gewöhnliches Nest-Setup.

## Events: Emit vs. On

Socket.io-Kommunikation ist Publish/Subscribe, und das funktioniert auf beiden Seiten gleich. Eine Seite emittet ein benanntes Event mit Daten, die andere Seite hört auf diesen Namen. Senden und Empfangen sind dieselben zwei Verben, egal auf welcher Seite du stehst.

Auf dem Server ist `@SubscribeMessage("vote")` die Listen-Hälfte, und `this.server.emit("results", ...)` die Send-Hälfte. Der Client spiegelt das exakt:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.emit("vote", "pizza");

socket.on("results", (results: Record<string, number>) => {
  renderResults(results); // your function to update the UI
});
```

Der Client emittet ein `vote`-Event mit der gewählten Option, das in `handleVote` des Servers landet. Der Server emittet ein `results`-Event mit dem neuen Ergebnis, das im `on("results", ...)`-Handler des Clients landet. Beachte, dass `"pizza"` und das Results-Objekt als echte JavaScript-Werte unterwegs sind, nicht als handgebaute Strings. Socket.io übernimmt die Serialisierung in beide Richtungen.

## Broadcasting, Rooms & Namespaces

Bisher geht jedes `results`-Event an jeden verbundenen Client, weil `this.server.emit(...)` an alle sendet. Das ist selten das, was du willst. Meist musst du eine bestimmte Teilmenge der User erreichen, und Socket.io gibt dir dafür drei Werkzeuge.

Das erste ist Broadcasting an alle außer dem Sender. Wenn du den Socket des einzelnen Clients hast, sendet `socket.broadcast.emit(...)` an alle Clients außer dem, der es ausgelöst hat. Praktisch für „jemand anderes hat gerade gevotet"-Benachrichtigungen.

Das zweite, und das wichtigste, sind Rooms. Eine Room ist eine benannte Gruppe von Sockets, die du als Einheit erreichst. Ein Client tritt einer Room nicht direkt bei; er fragt den Server, und der Server steckt den Socket in die Room. Einmal beigetreten, liefert `this.server.to(roomId).emit(...)` nur an die Sockets in dieser Room. So lässt man einen Server viele unabhängige Polls gleichzeitig laufen: Jeder Poll ist eine Room, und ein Vote in einer Room erreicht nie eine andere.

```typescript
import { ConnectedSocket, MessageBody, SubscribeMessage } from "@nestjs/websockets";
import { Socket } from "socket.io";

@SubscribeMessage("joinPoll")
handleJoin(@MessageBody() pollId: string, @ConnectedSocket() socket: Socket) {
  socket.join(pollId);
}

@SubscribeMessage("vote")
handleVote(@MessageBody() data: { pollId: string; option: string }) {
  const results = this.pollService.addVote(data.pollId, data.option);
  this.server.to(data.pollId).emit("results", results);
}
```

`socket.join(pollId)` braucht den eigenen Socket des Clients, den der `@ConnectedSocket()`-Decorator liefert. Weil es jetzt mehrere Polls gibt, nimmt `addVote` auch die `pollId` entgegen und führt für jede ein eigenes Ergebnis. Nach dem Beitreten wird jeder Vote, der auf diese `pollId` beschränkt ist, nur an seine Room emittiert, sodass Clients, die einen anderen Poll beobachten, nichts mitbekommen.

Das dritte Werkzeug sind Namespaces, die Traffic auf einer höheren Ebene als Rooms aufteilen. Ein Namespace ist ein separater, vordefinierter Endpoint wie `/chat` oder `/admin`, jeweils mit eigener Connection-Handhabung und eigenem Satz von Rooms. Rooms sind dynamische Gruppierungen, die zur Laufzeit erstellt und betreten werden; Namespaces sind grobe, feste Unterteilungen der Anwendung. Die meisten Features nutzen Rooms; Namespaces lohnen sich nur, wenn du wirklich getrennte Bereiche hast, die sich keine Verbindung teilen sollten.

✏️ **Hinweis:** Rooms existieren ausschließlich auf dem Server. Der Client hat keine Join-Methode und keine Liste von Rooms, denen er angehört. Er emittet ein Event wie `joinPoll`, und der Server entscheidet, ob und wie dieser Socket in eine Room gesteckt wird. Halte die Room-Mitgliedschaft als serverseitige Entscheidung, damit sich ein Client nicht selbst in eine Room stecken kann, in die er nicht gehört.

## Ressourcen

[Socket.io documentation](https://socket.io/docs/v4/)
[Socket.io: Rooms](https://socket.io/docs/v4/rooms/)
[NestJS: Gateways](https://docs.nestjs.com/websockets/gateways)

## Denkanstoß

Rooms leben komplett auf dem Server – der Client kann sich nicht selbst in eine Room stecken, sondern nur danach fragen. Stell dir vor, du baust einen privaten Chat-Poll, bei dem nur eingeladene User abstimmen dürfen. Wo genau würdest du im `handleJoin`-Handler die Berechtigung prüfen, und was würde passieren, wenn du diese Prüfung stattdessen dem Client überlassen würdest?