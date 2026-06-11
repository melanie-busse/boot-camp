# DarkBay – Untergrundmarktplatz API

Willkommen bei **DarkBay**, einer Underground-Marktplatz-API, auf der Nutzer Artikel zur Auktion einstellen und gegeneinander bieten. Dieses Backend wird vollständig von Grund auf neu gebaut. Es gibt kein Frontend – alles läuft über eine **RESTful API mit JSON-Payloads**.

---

## Funktionsweise

Ein Verkäufer erstellt eine Auktion für einen Artikel mit einem Startpreis und einem Enddatum. Andere Nutzer konkurrieren, indem sie Gebote abgeben. Die zentrale Geschäftslogik liegt in der Service-Schicht:

- Ein gültiges Gebot muss mindestens den Startpreis erreichen und alle bestehenden Gebote **strikt überbieten**.
- Die Auktion muss zum Zeitpunkt des Gebots noch **offen** sein.

Verstößt eine Anfrage gegen diese Regeln, lehnt die API sie mit einem passenden HTTP-Statuscode ab – kein stilles Scheitern, kein generischer Serverfehler.

---

## Datenmodell

Das Datenmodell dreht sich um eine **1-zu-n-Beziehung**:

- Die Tabelle **`auctions`** speichert die Inserate: Titel, Beschreibungen, Startpreise und Enddaten. Wird kein Enddatum angegeben, wird es automatisch auf **drei Tage nach Erstellungsdatum** gesetzt.
- Die Tabelle **`offers`** speichert die Gebote und verknüpft diese über einen Fremdschlüssel mit der jeweiligen Auktion.

Diese Beziehung wird genutzt, um den aktuellen Preis zu berechnen, das höchste Gebot abzurufen oder den gesamten Gebotverlauf einer Auktion auszugeben.

---

## Architekturentscheidung: Vertrauen vs. Authentifizierung

Das Projekt simuliert einen realistischen Übergang (Refactoring), den jedes echte Backend durchläuft:

### Phase 1 – Dem Client vertrauen
Zunächst wird dem Client vertraut. Das bedeutet: Ein Request-Body mit `"seller": "z3r0c00l"` oder `"bidder": "ac1dburn"` bestimmt die Identität. So kommen die Kernfunktionen schnell zum Laufen.

### Phase 2 – Echte Authentifizierung
Später wird dieses blinde Vertrauen aufgehoben und eine ordentliche Authentifizierung eingeführt. Die Felder `seller` und `bidder` verschwinden aus den API-Payloads. Die Datenbank verknüpft Nutzer weiterhin mit ihren Auktionen und Geboten – aber die API liest die Identität **ausschließlich aus einem verifizierten JWT**. Clients können ihre Identität nicht mehr fälschen, da der Server bei jeder geschützten Anfrage die Token-Signatur prüft.

---

## Versionskontrolle

Vor der ersten Zeile Code wird ein **Git-Repository** eingerichtet. Die Arbeit wird versioniert, mit häufigen Commits, aussagekräftigen Commit-Nachrichten und regelmäßigem Push zu GitHub.

---

## Projektstruktur – Die sechs Teile

### Teil 1 – Projekt-Setup & Datenbankintegration

Ziel ist die Grundlage: eine laufende NestJS-Anwendung, die mit einer lokalen SQLite-Datenbank verbunden ist.

- Neuen NestJS-Workspace initialisieren und Feature-Module strukturieren.
- Datenbankanbindung via **TypeORM** einrichten.

**Architekturfrage:** Wie konfigurierst du die Datenbankverbindung in der frühen Entwicklungsphase, damit Tabellen beim Start automatisch aus den Entities generiert werden und manuelle Schema-Änderungen entfallen?

📖 Ressource: NestJS Database Integration

---

### Teil 2 – Das Auktionsmodul

Erstellung der zentralen Ressource der API. Verkäufer müssen Auktionen anlegen, alle verfügbaren Inserate auflisten und einzelne Einträge abrufen können.

- **Auction-Entity** modellieren: Artikeldetails (Titel, Beschreibung), Preise (Startpreis, aktueller Preis), Lebenszyklus (Enddatum) und Verkäuferidentität.
- Endpunkte für Erstellung und Abruf entwerfen.

**Designfrage:** Welche Felder muss der Client beim Erstellen mitschicken – und welche soll der Server eigenständig befüllen?

**Geschäftsregel:** Wird beim Erstellen kein Enddatum angegeben, muss die Service-Schicht automatisch eine Standardlaufzeit von **drei Tagen** setzen.

📖 Ressource: NestJS TypeORM Entities

---

### Teil 3 – Das Angebotsmodul & Bietlogik

Dieses Modul implementiert die Kernmechanik von DarkBay. Nutzer reichen Gebote ein, das System prüft sie anhand strenger Regeln.

- **Offer-Entity** modellieren und die Beziehung zur Auktion herstellen. Wie verknüpft man mehrere Gebote mit einem einzigen Inserat, um den vollständigen Bietverlauf festzuhalten?
- **Biet-Service** implementieren: Vor dem Speichern eines Angebots muss der Status der Auktion validiert werden.

**Randfälle, die behandelt werden müssen:**

| Szenario | Erwartetes Verhalten |
|---|---|
| Auktion bereits abgelaufen | Gebot ablehnen |
| Betrag überbietet aktuellen Preis nicht | Gebot ablehnen |
| Erstes Gebot liegt unter dem Startpreis | Gebot ablehnen |

**HTTP-Semantik:** Das Ablehnen eines zu niedrigen Gebots ist eine Verletzung einer Geschäftsregel, keine syntaktisch fehlerhafte Anfrage. Welcher HTTP-Statuscode kommuniziert am besten einen *Konflikt mit dem aktuellen Ressourcenzustand*?

📖 Ressource: TypeORM Relations

---

### Teil 4 – RESTful-Feinschliff

Die API wird auf professionelles Niveau gebracht, ohne die Kernfunktionalität zu verändern.

- **Globale Validierung** einführen: Wie stellt man sicher, dass eingehende Payloads den DTO-Strukturen entsprechen und unbekannte Felder automatisch abgewiesen werden?
- **Datenbankarchitektur schützen:** Response-DTOs definieren, damit Clients nur die Daten erhalten, die für sie bestimmt sind.
- **Paginierung** und folgende **Filteroptionen** für die Auktionsliste implementieren:
    - `?status=open|closed`
    - `?min-price` & `?max-price`
    - Sortierung nach Enddatum, neueste zuerst

**Implementierungsdetail:** Wie gehst du mit der gewünschten Seitengröße und dem Filterstatus (offen vs. geschlossen) um? Paginierte Antworten müssen **Metadaten** enthalten (Gesamtanzahl der Einträge, Gesamtanzahl der Seiten).

📖 Ressource: NestJS Validation

---

### Teil 5 – Authentifizierung & Autorisierung

Die Klartextfelder `seller` und `bidder` werden durch ein sicheres Identitätssystem ersetzt. Die API liest die Nutzeridentität künftig ausschließlich aus einem verifizierten Token.

- **User-Modell** mit sicher gehashen Passwörtern einführen.
- **JWT-basierten Login-Flow** implementieren.

**Sicherheitsfrage:** Wie schützt man die API so, dass das Erstellen von Auktionen und das Abgeben von Geboten eine Authentifizierung erfordert, während das Durchsuchen der Auktionsliste vollständig öffentlich bleibt?

- Auktions- und Angebots-Services **refactoren**: `seller`- und `bidder`-Felder aus den eingehenden DTOs entfernen und die Identität direkt aus dem verifizierten Token ziehen.

**Geschäftslogik-Upgrade:** Wie verhindert man mit echter Authentifizierung, dass ein Verkäufer auf das eigene Inserat bietet?

📖 Ressource: NestJS Authentication

---

### Teil 6 – API-Dokumentation mit Swagger

Lebendige, interaktive Dokumentation wird direkt aus dem Code generiert. Entwickler sollen Endpunkte verstehen und direkt im Browser testen können.

- **Swagger mounten** und so konfigurieren, dass DTOs erkannt werden.
- **Authentifizierte Routen dokumentieren:** Die UI muss einen *Authorize*-Dialog bereitstellen, damit Nutzer ihr JWT einfügen und geschützte Endpunkte testen können.
- **Schema anreichern:** Wo Typen uneindeutig sind, werden Decorators eingesetzt, um klare Beschreibungen und realistische Beispiele zu liefern (z. B. das erwartete Datumsformat).

📖 Ressource: NestJS OpenAPI

---

## Bonus-Aufgaben

Wer die Hauptanforderungen früh abschließt, kann eine oder mehrere dieser Aufgaben angehen:

### 🔖 Merklisten (Watchlists)
Nutzer können Auktionen zu ihrer persönlichen Merkliste hinzufügen, entfernen und abrufen.

### 🗄️ Datenbank-Migrationen
Automatische Synchronisierung deaktivieren. Eine initiale Migration schreiben, die Tabellen manuell erstellt – der einzig sichere Weg, ein Schema in der Produktion weiterzuentwickeln.

### 📊 Abgeleiteter Status
Ein berechnetes `status`-Feld (`open` oder `closed`) in der Auktionsantwort ausgeben, basierend auf dem aktuellen Zeitstempel – der Client muss selbst kein Datum vergleichen.

### 🛡️ Rollenbasierte Zugriffskontrolle (RBAC)
Eine Admin-Rolle einführen. Ein Guard implementiert, der Admins das Löschen beliebiger Auktionen erlaubt, während normale Nutzer nur ihre eigenen Inserate löschen dürfen.

### ⏱️ Rate Limiting
Gebotsabgaben überwachen. Plötzliche Biet-Bursts desselben Nutzers innerhalb eines kurzen Zeitfensters werden mit `429 Too Many Requests` abgewiesen.