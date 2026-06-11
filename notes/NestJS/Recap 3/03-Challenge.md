# Recap Projekt 3 – Aufgaben

Dies ist das Abschlussprojekt des NestJS-Moduls. Du baust die DarkBay-Auktions-API, die in der Einführung beschrieben wird: eine NestJS-Anwendung, in der Nutzer Auktionen einstellen, mit Geboten darauf bieten und ein Gebot nur dann akzeptiert wird, wenn es den aktuell höchsten Preis überbietet. Authentifizierung ist die abschließende Schicht, die auf einem bereits funktionierenden Kern aufgesetzt wird.

---

## 1 – Projekt-Setup & Datenbankintegration

Dein erstes Ziel ist die Grundlage: eine laufende NestJS-Anwendung, die mit einer lokalen SQLite-Datenbank verbunden ist.

- Einen neuen NestJS-Workspace initialisieren und die Feature-Module strukturieren.
- Die Datenbankanbindung via **TypeORM** einrichten.

**Architekturüberlegung:** Wie konfigurierst du die Datenbankverbindung in der frühen Entwicklungsphase, damit Tabellen beim Start automatisch aus deinen Entities generiert werden und manuelle Schema-Änderungen entfallen?

📖 Ressource: NestJS Database Integration

---

## 2 – Das Auktionsmodul

Erstelle die zentrale Ressource der API. Verkäufer benötigen eine Möglichkeit, eine Auktion anzulegen, alle verfügbaren Inserate aufzulisten und einzelne Einträge abzurufen.

- Die **Auction-Entity** modellieren. Definiere die notwendigen Eigenschaften für Artikeldetails (Titel, Beschreibung), Preise (Startpreis, aktueller Preis), Lebenszyklus (Enddatum) und die Identität des Verkäufers.
- Die Endpunkte für Erstellung und Abruf entwerfen.

**Designfrage:** Schau dir dein Request-Payload an. Welche Felder muss der Client mitschicken – und welche soll der Server eigenständig befüllen?

**Geschäftsregel:** Wird beim Erstellen kein Enddatum angegeben, wie setzt du in der Service-Schicht eine Standardlaufzeit von **drei Tagen** durch?

📖 Ressource: NestJS TypeORM Entities

---

## 3 – Das Angebotsmodul & Bietlogik

Dieses Modul implementiert die Kernmechanik von DarkBay. Nutzer reichen Gebote ein, das System bewertet sie anhand strenger Regeln.

- Die **Offer-Entity** modellieren und die Beziehung zur Auktion herstellen. Wie verknüpfst du mehrere Gebote mit einem einzelnen Inserat, um den vollständigen Bietverlauf festzuhalten?
- Den **Biet-Service** implementieren. Vor dem Speichern eines Angebots muss deine Anwendung den Status der Auktion validieren.

**Randfälle, die behandelt werden müssen:**

- Was passiert, wenn die Auktion bereits abgelaufen ist?
- Was, wenn das Gebot den aktuellen Preis nicht überbietet – bzw. beim allerersten Gebot den Startpreis nicht erreicht?

**HTTP-Semantik:** Das Ablehnen eines zu niedrigen Gebots ist eine Verletzung einer Geschäftsregel, keine syntaktisch fehlerhafte Anfrage. Welcher HTTP-Statuscode kommuniziert am besten einen *Konflikt mit dem aktuellen Ressourcenzustand*?

📖 Ressource: TypeORM Relations

---

## 4 – RESTful-Feinschliff

Hebe deine API auf professionelles Niveau, ohne die Kernfunktionalität zu verändern.

- **Globale Validierung** einführen. Wie stellst du sicher, dass eingehende Payloads den DTO-Strukturen entsprechen und unbekannte Felder automatisch abgewiesen werden?
- **Datenbankarchitektur schützen.** Spezifische Response-DTOs definieren, damit Clients nur die Daten erhalten, die für sie bestimmt sind.
- **Paginierung** und folgende **Filteroptionen** für die Auktionsliste implementieren:
    - `?status=open|closed`
    - `?min-price` & `?max-price`
    - Sortierung nach Enddatum, neueste zuerst

**Implementierungsdetail:** Wie gehst du mit der gewünschten Seitengröße und dem Filterstatus (offen vs. geschlossen) um? Paginierte Antworten müssen **Metadaten** enthalten (Gesamtanzahl der Einträge, Gesamtanzahl der Seiten).

📖 Ressource: NestJS Validation

---

## 5 – Authentifizierung & Autorisierung

Ersetze die Klartextfelder `seller` und `bidder` durch ein sicheres Identitätssystem. Die API liest die Nutzeridentität künftig ausschließlich aus einem verifizierten Token – dem Request-Body wird nicht mehr vertraut.

- Ein **User-Modell** mit sicher gehashen Passwörtern einführen.
- Einen **JWT-basierten Login-Flow** implementieren.

**Sicherheitsfrage:** Wie schützt du deine API so, dass das Erstellen von Auktionen und das Abgeben von Geboten eine Authentifizierung erfordert, während das Durchsuchen der Auktionsliste vollständig öffentlich bleibt?

- Auktions- und Angebots-Services **refactoren**: `seller`- und `bidder`-Felder aus den eingehenden DTOs entfernen und die Identität direkt aus dem verifizierten Token lesen.

**Geschäftslogik-Upgrade:** Wie verhinderst du mit echter Authentifizierung, dass ein Verkäufer auf das eigene Inserat bietet?

📖 Ressource: NestJS Authentication

---

## 6 – API-Dokumentation mit Swagger

Lebendige, interaktive Dokumentation direkt aus dem Code generieren. Entwickler sollen Endpunkte verstehen und direkt im Browser testen können.

- **Swagger mounten** und so konfigurieren, dass deine DTOs erkannt werden.
- Wie konfigurierst du die Dokumentation für authentifizierte Routen? Stelle sicher, dass die UI einen **Authorize-Dialog** bereitstellt, damit Nutzer ihr JWT einfügen und geschützte Endpunkte testen können.
- **Schema anreichern.** Wo Typen uneindeutig sind, Decorators einsetzen, um klare Beschreibungen und realistische Beispiele zu liefern (z. B. das erwartete Datumsformat).

📖 Ressource: NestJS OpenAPI

---

## Bonus-Aufgaben

Wähle eine oder mehrere aus, wenn du die Hauptanforderungen früh abschließt.

**Merklisten (Watchlists):** Implementiere die Möglichkeit für Nutzer, eine Auktion zur eigenen Merkliste hinzuzufügen, zu entfernen und sie abzurufen.

**Datenbank-Migrationen:** Automatische Synchronisierung deaktivieren. Eine initiale Migration schreiben, die Tabellen manuell erstellt. Dies ist der einzig sichere Weg, ein Schema in der Produktion weiterzuentwickeln.

**Abgeleiteter Status:** Ein berechnetes `status`-Feld (`open` oder `closed`) in der Auktionsantwort ausgeben, basierend auf dem aktuellen Zeitstempel – der Client muss selbst kein Datum vergleichen.

**Rollenbasierte Zugriffskontrolle:** Eine Admin-Rolle einführen. Einen Guard implementieren, der Admins das Löschen beliebiger Auktionen erlaubt, während normale Nutzer nur ihre eigenen Inserate löschen dürfen.

**Rate Limiting:** Gebotsabgaben überwachen. Plötzliche Biet-Bursts desselben Nutzers innerhalb eines kurzen Zeitfensters mit `429 Too Many Requests` ablehnen.