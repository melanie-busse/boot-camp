# WebSocket – Einführung

## Überblick

Bisher hast du HTTP Dinge tun lassen, für die es nicht entworfen wurde. Short Polling, Long Polling und Server-Sent Events sind alles Wege, um Updates über ein Protokoll an den Browser zu schicken, das dafür nicht gebaut wurde. Sie funktionieren, und viele Produktivsysteme laufen immer noch damit. Aber keiner von ihnen liefert eine echte Zwei-Wege-Verbindung.

Bei Polling fragt der Client den Server ständig, ob sich etwas geändert hat, und die Antwort ist meistens Nein – also sind die meisten dieser Requests verschwendet. SSE ist besser: Der Server kann jederzeit Daten senden, ohne dass der Client danach fragt. Aber es funktioniert nur in eine Richtung. Der Browser empfängt über diesen Stream und kann darüber nichts zurückschicken. Für einen Notification-Feed oder einen Live-Preis reicht eine Richtung aus, und SSE passt dafür gut. Ein Chat ist ein anderes Problem. Beide Personen senden Nachrichten, oft gleichzeitig, und beide müssen die Nachrichten der anderen Person sofort sehen. Weder Polling noch ein Einweg-Stream können das gut abbilden. In diesem Modul geht es um eine Verbindung, bei der beide Seiten gleichzeitig senden können.

## Eine kurze Geschichte der Workarounds

Diese Techniken haben einen Namen und eine längere Geschichte, als man erwarten würde. 2006 fasste Alex Russell sie alle unter einem Namen zusammen: Comet. Das umfasste die Polling-Techniken, die du schon kennst, sowie seltsamere Varianten, wie ein verstecktes iframe, das nie aufhörte zu laden, damit der Server ihm Script-Tags einzeln schicken konnte. Der Name war ein Scherz: Ajax und Comet sind beide amerikanische Reinigungsmittel-Marken. Er setzte sich durch, weil es endlich ein einziges Wort dafür gab, den Server Daten über plain HTTP pushen zu lassen.

Man hatte das schon lange vor 2006 versucht. Netscape Navigator 2.0 hatte 1996 eine „Server Push"-Funktion, die eine Verbindung offen hielt und dem Browser Daten in Stücken schickte. Sie hielt meist etwa dreißig Sekunden, bevor ein Proxy oder eine Firewall die Verbindung beendete.

## Der WebSocket

WebSockets lösten dieses Problem mit einem Protokoll, das für Zwei-Wege-Kommunikation entworfen wurde, statt mit einem weiteren Workaround auf Basis von HTTP. Er tauchte erstmals 2008 im HTML5-Draft unter dem Platzhalternamen „TCPConnection" auf, wanderte dann zur IETF und wurde im Dezember 2011 als RFC 6455 standardisiert. Chrome unterstützte ihn als erster Browser, die anderen folgten innerhalb von ein bis zwei Jahren, und die alten Workarounds wurden überflüssig.

Ein WebSocket gibt jedem Client eine einzelne Verbindung, die offen bleibt und Daten in beide Richtungen trägt. Der Server kann senden, sobald etwas passiert, und der Client kann über dieselbe Verbindung zurücksenden, ohne jedes Mal einen neuen HTTP-Request zu öffnen. Dieses Kapitel behandelt, wie diese Verbindung aufgebaut wird und was es kostet, sie offen zu halten.

Das ist die Technologie hinter den Features, die in Echtzeit aktualisieren. Wenn ein geteiltes Dokument den Cursor einer anderen Person bewegen zeigt oder eine Chatnachricht im Moment des Sendens erscheint, steckt eine solche Verbindung dahinter. In allen Fällen kann jede Seite jederzeit senden, ohne auf die andere zu warten.

Der Rest des Moduls folgt dieser Reihenfolge: Es beginnt mit dem Handshake auf Protokoll-Ebene, schaut sich dann an, warum fast niemand rohe WebSockets im Produktivbetrieb einsetzt, und was Socket.io und NestJS darauf aufsetzen. Die letzten Themen behandeln die Probleme, die auftauchen, sobald echte User sich verbinden: wie ein React-Client durch Reconnects hindurch verbunden bleibt, wer was tun darf, wie geteilter State konsistent bleibt, und was sich ändert, wenn ein Server nicht mehr ausreicht.

## Ressourcen

[The Road to WebSockets: From HTTP Polling to RFC 6455](https://websocket.org/guides/road-to-websockets/)
[MDN: The WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

## Denkanstoß

Polling, SSE und WebSocket lösen alle das gleiche Grundproblem – Daten zwischen Client und Server aktuell halten – aber mit unterschiedlichen Kompromissen bei Richtung, Effizienz und Komplexität. Überlege: Für welche Art von Feature würdest du dich bewusst gegen einen WebSocket entscheiden, obwohl er die "modernste" Lösung ist? Was würde dich dazu bringen, stattdessen lieber bei SSE oder sogar Short Polling zu bleiben?