# Real-Time Communication - Challenges

## Task 1: Delivery Service

Eine Aufwärmübung: Finde heraus, wie viel redundante Arbeit Polling verursacht, bevor du es durch einen besseren Ansatz ersetzt.

Setup:

* Erstelle einen Backend-Endpoint, der den Status einer Order verfolgt. Die Order durchläuft dabei unterschiedliche Stages (z. B. Preparing, Out for Delivery, Delivered), gesteuert durch server-seitige Timer.
* Baue einen Client, der den aktuellen Status dieser Order anzeigt.

1. Implementiere das Tracking mit Short Polling. Beobachte den Network-Tab des Browsers und vergleiche, wie viele Requests du sendest gegenüber wie vielen davon tatsächlich eine Änderung melden. Stelle sicher, dass der Client das Polling beendet, sobald die Order ihre finale Stage erreicht.
2. Refaktoriere Client und Server auf Long Polling. Der Client soll nur dann eine HTTP-Response erhalten, wenn sich der Status tatsächlich weiterentwickelt. Vergleiche den Network-Traffic mit deiner Short-Polling-Version.

## Task 2: World Cup Live Match Ticker

Die Hauptaufgabe. Baue einen unidirektionalen Feed von Updates vom Server zum Browser, ähnlich wie den Live-Kommentar und die Score-Änderungen auf einer Sportseite während eines Spiels der WM 2026.

Core Build:

1. Erstelle einen Endpoint, der Events streamt, statt eine einzelne JSON-Response zurückzugeben. Das ist das Server-Sent-Events-Pattern: der Content-Type `text/event-stream` und eine Response, in die du weiterhin schreibst, statt sie zu beenden.
2. Erzeuge auf dem Server Match-Events in unregelmäßigen Abständen (ein Tor, eine gelbe Karte, eine Auswechslung, ein VAR-Review) und pushe jedes davon in den Stream, sobald es passiert. Eine zufällige Verzögerung zwischen den Events lässt den Feed lebendig wirken.
3. Baue einen Client, der sich mit `EventSource` mit dem Stream verbindet und jedes neue Event oben in einer laufenden Kommentarliste anzeigt.
4. Implementiere Resource Cleanup. Trennt der Client die Verbindung (geschlossener Tab, Navigation, Netzwerkausfall), muss der Server das über das `close`-Event des Requests erkennen und alles freigeben, was für diese Verbindung eingerichtet wurde, etwa Timer und Listener. Die Match-Events stammen aus einer gemeinsamen Quelle für alle Zuschauer, daher soll das Verlassen eines einzelnen Clients nur dessen eigenen Listener entfernen, niemals den Feed für alle anderen stoppen. Schließe auf der Client-Seite den Stream mit `source.close()`, wenn die Komponente unmounted wird.
5. Zeige den Verbindungsstatus in der UI als Live, Reconnecting oder Offline an. `EventSource` verbindet sich von selbst neu, aber du musst das beobachten, um den Status anzuzeigen: `onopen` feuert, wenn der Stream (wieder) hergestellt ist, `onerror` feuert, wenn er abbricht und der Browser mit dem Retry beginnt, und `source.readyState` ist `CONNECTING`, `OPEN` oder `CLOSED`. Mappe `OPEN` auf Live, die Retry-Phase auf Reconnecting und einen aufgegebenen Stream auf Offline.
6. Teste das Reconnect-Verhalten. Während der Client zuhört, stoppe deinen Server-Prozess, um einen Netzwerkausfall im Stadion zu simulieren, beobachte, wie die UI auf Reconnecting wechselt, starte den Server dann neu und bestätige, dass der Client den Stream von selbst wiederherstellt und zu Live zurückkehrt.

## Bonus

* Sende mit jedem Event einen Typ (eine `event:`-Zeile) und leite die unterschiedlichen Arten in separate UI-Panels: kritische `score-update`-Events in eines, allgemeine `match-commentary`- und `stadium-stats`-Events in ein anderes. Auf der Client-Seite kommen diese über `source.addEventListener("score-update", ...)` an statt über das generische `onmessage`, alles über denselben einen Stream.
* Implementiere State Recovery. Gib jedem Event eine `id`. Wenn sich der Client neu verbindet, sendet der Browser die zuletzt verarbeitete id im `Last-Event-ID`-Header; lies sie auf dem Server aus (`req.headers["last-event-id"]`), spiele die Events ab, die der Client während des Ausfalls verpasst hat, und setze dann den Live-Feed fort. Dafür muss der Server eine kurze History der letzten Events vorhalten.