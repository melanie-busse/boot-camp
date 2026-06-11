# Backend Express Advanced – Aufgabe

## Einen Burn-on-Read-Service bauen

Baue eine kleine Express-Anwendung mit TypeScript, die es einer Person ermöglicht, eine Nachricht zu erstellen, und einer anderen Person, diese Nachricht genau einmal zu öffnen.

Verwende den Logger aus dieser Session als gemeinsame Infrastruktur für die gesamte App – und füge das Burn-on-Read-Verhalten darüber hinaus.

---

## Anforderungen

- Express-Anwendung mit TypeScript aufsetzen
- Nunjucks für Templates verwenden
- Eigenes CSS hinzufügen oder ein kleines CSS-Framework nutzen
- Ein Textfeld bereitstellen, in das die Nutzerin oder der Nutzer eine Nachricht eingeben kann
- Die Eingabe vor dem Speichern bereinigen (Sanitization)
- Die Nachricht in einer Datei speichern
- Einen einzigartigen Link für die gespeicherte Nachricht generieren
- Diesen Link der absendenden Person nach dem Erstellen anzeigen
- Die Datei löschen, nachdem der Link einmal geöffnet wurde

---

## Denkanstoß beim Bauen

- Welcher Teil der App sollte den Dateinamen oder die ID erzeugen?
- Wo sollten Dateien gespeichert werden, damit der Pfad vorhersehbar bleibt?
- Was soll passieren, wenn jemand einen abgelaufenen oder fehlenden Link öffnet?
- Welche Requests sollten im Access-Log dieser App auftauchen?