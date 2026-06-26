# Real-Time Communication – Challenges

## Real-Time Chat

Diese Challenges bauen in mehreren Stufen eine App: einen Real-Time-Chat, in dem Leute benannten Rooms beitreten und mit den anderen im selben Room sprechen. Chat ist eine gute Übung, weil jeder Client gleichzeitig sendet und empfängt, und Rooms dich dazu zwingen, jede Message nur an die Leute im richtigen Room zu liefern. Baue das Backend als NestJS-Gateway auf Socket.io, und das Frontend in React. Jede Challenge fügt dem Chat aus dem vorherigen Schritt eine Fähigkeit hinzu.

### Task 1: Connect and broadcast

Beginne mit der Plumbing: einer Verbindung, die funktioniert, und einer Message, die alle erreicht.

* Richte ein NestJS-Gateway ein, das Socket.io-Connections akzeptiert, und einen React-Client, der sich mit `socket.io-client` verbindet. Erstelle die Client-Connection einmal und teile sie, damit Re-Renders keine neuen öffnen.
* Lass einen User eine Message senden: Der Client emittet sie mit dem Text, und der Server schickt sie an jeden verbundenen Client.
* Rendere die Messages als Liste, sobald sie eintreffen.
* Räume deine Socket-Listener in der Cleanup-Funktion des React-Effects auf, damit eine remountende Komponente sie nicht doppelt registriert.

### Task 2: Rooms

Beschränke Messages jetzt auf einen Room, damit Leute in unterschiedlichen Rooms die Messages der anderen nicht sehen.

* Lass einen User einem Room beitreten, indem er ein Event mit dem Room-Namen emittiert. Der Server steckt diesen Socket in den Room. Ein User ist vorerst immer nur in einem Room gleichzeitig.
* Wenn ein User eine Message sendet, füge den Room und den Text hinzu. Der Server liefert sie nur an diesen Room mit `server.to(room).emit(...)`.
* Rendere die Message-Liste für den aktuellen Room, und stelle sicher, dass ein Room-Wechsel die Messages des neuen Rooms zeigt, nicht eine Mischung aus beiden.

### Task 3: Presence

Zeige, wer im Room ist.

* Tracke auf dem Server, wer in jedem Room ist.
* Wenn jemand beitritt oder geht, informiere den Room, sodass jeder Client eine aktuelle Liste anzeigen kann, wer da ist.

### Task 4: Typing indicators

Zeige an, wenn jemand anderes gerade tippt.

* Wenn ein User tippt, emittiere ein `typing`-Event. Der Server leitet es an die anderen im Room weiter — `socket.broadcast` sendet an alle außer den Sender.
* Zeige den Indikator im UI an, während jemand tippt, und entferne ihn, wenn die Person aufhört.

### Task 5: Disconnects & reconnection

Handhabe Leute, die gehen und zurückkommen.

* Behandle Disconnects auf dem Server mit dem `handleDisconnect`-Hook: aktualisiere die Presence und informiere den Room, dass der User gegangen ist.
* Spiegle den Connection-State im UI wider, damit der User sehen kann, wann er verbunden ist und wann er gerade reconnected.
* Lass den User automatisch nach einer Reconnection seinem Room wieder beitreten, damit er weiterhin Messages bekommt.

### Bonus

* Behalte die letzten 20 Messages pro Room auf dem Server, und schicke diese History an einen User, wenn er beitritt, sodass ein neuer Ankömmling aktuellen Kontext sieht statt eines leeren Bildschirms.
* Verlange einen Username bei der Verbindung, validiert während des Socket.io-Handshakes, und hänge ihn an jede Message und jedes Presence-Event an.
* Unterstütze private 1:1-Messages, indem du jedem Paar von Usern seinen eigenen Room gibst.