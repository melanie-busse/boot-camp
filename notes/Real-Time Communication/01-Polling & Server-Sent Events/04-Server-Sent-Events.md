# Real-Time Communication - Server-Sent Events

Polling und Long Polling arbeiten beide innerhalb des traditionellen Request/Response-Modells. Sie können nahezu Echtzeit-Updates liefern, aber jedes Update erfordert letztlich einen neuen Request vom Client.

Server-Sent Events verfolgen einen anderen Ansatz. Der Browser öffnet eine einzige HTTP-Verbindung, und der Server hält sie als kontinuierlichen Stream offen. Statt eine Antwort zu senden und die Verbindung zu schließen, kann der Server über dieselbe Verbindung mehrere Updates pushen, sobald neue Daten verfügbar sind.

Für den Export-Job bedeutet das: Der Browser baut zu Beginn des Tasks eine Verbindung auf, und der Server kann über diese Verbindung Progress-Updates streamen, bis der Job abgeschlossen ist.

[SSE model]

Server-Sent Events (SSE) bieten dem Server eine Möglichkeit, einen Strom von Nachrichten an einen Client zu pushen, über eine einzige, lang lebende HTTP-Verbindung. Die Kommunikation läuft dabei nur in eine Richtung: Der Server kann Daten an den Client senden, aber der Client kann über dieselbe Verbindung keine Nachrichten zurücksenden. Muss der Client mit dem Server kommunizieren, nutzt er dafür einen separaten HTTP-Request.

[server-sent events diagram]

Dieses Modell passt zu vielen gängigen Anwendungen. Progress-Updates, Notification-Feeds, Activity-Logs, Dashboards und Live-Metriken folgen alle demselben Muster: Der Server erzeugt einen Strom von Events, und der Client muss diese nur empfangen und anzeigen. In solchen Fällen ist SSE oft eine einfachere Alternative zu WebSockets, die für vollständige Zwei-Wege-Kommunikation gedacht sind und später besprochen werden.

💡 Good to know: Über HTTP/1.1 erlaubt ein Browser nur etwa sechs Verbindungen pro Domain, und jeder offene SSE-Stream belegt eine davon. Mehrere Streams über mehrere Tabs hinweg können dieses Budget aufbrauchen und andere Requests an dieselbe Domain blockieren. HTTP/2 multiplext viele Streams über eine einzige Verbindung, was diese Begrenzung in der Praxis aufhebt.

## Die EventSource-API

Heutzutage bieten Browser eine eingebaute API für die Arbeit mit SSE namens `EventSource`. Du erzeugst eine `EventSource` mit einer URL und registrierst Event-Handler; der Browser übernimmt das Verbindungsmanagement.

```
const source = new EventSource(`/api/exports/${jobId}/stream`);

source.onmessage = (event) => {
  const job = JSON.parse(event.data);
  updateProgressBar(job.progress);

  if (job.status === "done") {
    source.close();
  }
};
```

Das Erzeugen der `EventSource` öffnet sofort die Verbindung. Jede Nachricht, die der Server pusht, löst `onmessage` aus, wobei `event.data` den Payload als String enthält, weshalb das Beispiel ihn wieder in ein Objekt zurückparst. Der Aufruf von `source.close()` beendet den Stream von Client-Seite, sobald der Job abgeschlossen ist.

Ein nützliches Feature von `EventSource` ist die eingebaute Reconnection-Unterstützung. Bricht die Verbindung ab, versucht der Browser automatisch nach einer kurzen Verzögerung, sich neu zu verbinden. In vielen Fällen ist dafür kein zusätzlicher Client-seitiger Code nötig.

SSE unterstützt zudem Event-IDs. Wenn der Server bei jedem Event ein `id`-Feld mitschickt, merkt sich der Browser die ID des zuletzt empfangenen Events. Kommt es zu einer Reconnection, wird dieser Wert im `Last-Event-ID`-Header zurückgesendet. Ein Server, der ausreichend Event-History vorhält, kann diese Information nutzen, um das Streaming ab dem letzten bekannten Event fortzusetzen, statt von vorne zu beginnen.

Es ist außerdem möglich, benannte Events zu senden, für den Fall, dass ein einzelner Stream unterschiedliche Arten von Updates trägt. Eine Nachricht, die mit einer `event: progress`-Zeile gekennzeichnet ist, wird an `source.addEventListener("progress", ...)` ausgeliefert statt an den generischen `onmessage`-Handler, was unterschiedliche Update-Typen saubertrennt hält.

## SSE in Express.js implementieren

Auf der Server-Seite brauchen wir keine zusätzlichen Library-Abhängigkeiten, um SSE zu implementieren (zumindest in einem einfachen Express.js-Beispiel). Verwende eine ganz normale Route mit den richtigen Headers. Diese schreibt fortlaufend in die Response, statt sie zu beenden:

```
import express, { Request, Response } from "express";
import { EventEmitter } from "node:events";

type Job = {
  id: string;
  progress: number; // 0–100
  status: "running" | "done";
  downloadUrl?: string;
  events: EventEmitter;
};

const app = express();
const jobs = new Map<string, Job>();

function runExport(job: Job) {
  const timer = setInterval(() => {
    job.progress = Math.min(job.progress + 10, 100);

    if (job.progress >= 100) {
      job.status = "done";
      job.downloadUrl = `/downloads/${job.id}.csv`;
      clearInterval(timer);
    }

    job.events.emit("progress", job);
  }, 2000);
}
```

Die Route öffnet den Stream, sendet den aktuellen State, und schreibt dann bei jedem `progress`-Event eine neue Nachricht.

```
app.get("/api/exports/:id/stream", (req: Request, res: Response) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    res.status(404).end();
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  // set how long the browser waits before reconnecting
  res.write("retry: 3000\n\n");

  // comment frames keep idle proxies from closing the connection.
  const heartbeat = setInterval(() => res.write(": keep-alive\n\n"), 15_000);

  const send = (current: Job) => {
    res.write(`id: ${current.progress}\n`);
    res.write(
      `data: ${JSON.stringify({
        progress: current.progress,
        status: current.status,
        downloadUrl: current.downloadUrl,
      })}\n\n`,
    );

    if (current.status === "done") {
      clearInterval(heartbeat);
      job.events.off("progress", send);
      res.end();
    }
  };

  job.events.on("progress", send);
  send(job);

  req.on("close", () => {
    clearInterval(heartbeat);
    job.events.off("progress", send);
  });
});
```

Jedes `progress`-Event schreibt eine Nachricht, und sobald der Job fertig ist, stoppt der Handler den Heartbeat, entfernt seinen Listener und beendet die Response.

Die richtigen Headers verwandeln eine gewöhnliche Response in einen Event-Stream:

`Content-Type: text/event-stream` sagt dem Browser, dass dies ein SSE-Feed ist, was das EventSource-Parsing aktiviert.
`Cache-Control: no-cache` verhindert, dass Proxys und der Browser den Stream puffern oder cachen.
`Connection: keep-alive` signalisiert, dass die Verbindung offen bleiben soll, statt nach dem ersten Write zu schließen.
`X-Accel-Buffering: no` sagt nginx, einem gängigen Reverse Proxy, die Response nicht zu puffern. Ohne diesen Header kann der Proxy deine Events zurückhalten und gebündelt freigeben, was den Sinn eines Streams zunichtemacht.

## Das SSE-Datenformat

Das Nachrichtenformat hat sein eigenes, kleines Protokoll. Jede Nachricht ist eine Zeile, die mit `data:` beginnt, gefolgt vom Payload, und die mit einer Leerzeile abgeschlossen wird, also dem `\n\n` am Ende. Dieses doppelte Newline ist keine optionale Dekoration; es ist der Delimiter, der dem Browser mitteilt, dass ein Event vollständig ist. Der Code ruft `res.end()` erst auf, wenn der Job tatsächlich fertig ist, denn das Beenden der Response würde den Stream schließen. Mit der `retry:`-Nachricht kann der Server dem Client mitteilen, eine kurze Zeit zu warten, bevor er sich neu verbindet, falls die Verbindung abbricht.

Hier ein Beispiel für eine Nachricht:

```
data: hello world\n\n

event: chat\n
data: {"from":"Kiki","text":"hi"}\n\n

id: 42\n
data: resumable event\n\n

retry: 5000\n\n
```

## Connection Handling und Resource Cleanup

Ein SSE-Endpoint hält eine Verbindung über einen längeren Zeitraum offen, was bedeutet, dass alle mit dieser Verbindung verknüpften Ressourcen freigegeben werden müssen, sobald der Client die Verbindung trennt. Ein Nutzer könnte den Browser-Tab schließen, wegnavigieren oder die Netzwerkverbindung verlieren. Führt der Server weiterhin Arbeit für eine Verbindung aus, die nicht mehr existiert, bleiben diese Ressourcen unnötig allokiert.

Deshalb sollten SSE-Handler auf das Beenden der Verbindung lauschen. In Express wird das `close`-Event ausgelöst, wenn der Client die Verbindung trennt:

```
req.on("close", () => {
  clearInterval(heartbeat);
  job.events.off("progress", send);
});
```

Die obige Route erzeugt pro Verbindung zwei Dinge: das Heartbeat-Interval und den Progress-Listener. Trennt der Client die Verbindung und wird keines von beiden bereinigt, feuert das Interval weiter in eine tote Response hinein, und der Listener hält den Handler am Leben, indem er eine Referenz auf den Job festhält. Dasselbe gilt für jeden anderen Pro-Verbindung-State: Subscriptions, Einträge in einer Registry, alles, was beim Öffnen des Streams erzeugt wurde, sollte beim Schließen wieder abgebaut werden. Wird das versäumt, führt das zu steigendem Memory-Verbrauch, verschwendeter CPU und Leaks, die mit der Laufzeit der Anwendung weiter wachsen.

## Denkanstoß

Stell dir vor, mehrere Browser-Tabs desselben Nutzers öffnen jeweils eine eigene `EventSource`-Verbindung zum selben Export-Job. Welche Auswirkungen hätte das auf den Server (z. B. auf die Listener am `EventEmitter` des Jobs), und wie könntest du die Implementierung anpassen, damit mehrere gleichzeitige SSE-Verbindungen zum selben Job sauber unterstützt werden, ohne dass beim Trennen eines Tabs versehentlich Listener für die anderen entfernt werden?

## Resources
[MDN: Using server-sent events]
[MDN: EventSource]
[WHATWG: Server-sent events specification]