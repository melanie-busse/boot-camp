# 📝 Dokumentation der Cyber Chat API

Nimm die Cyber Chat NestJS API, die du in den vorherigen Sessions gebaut hast (Threads, Messages, Comments, JWT-Authentifizierung), und füge eine vollständige Swagger-Dokumentation hinzu. Am Ende soll ein Entwickler, der dein Projekt noch nie gesehen hat, http://localhost:3000/api öffnen, jeden Endpunkt verstehen und die API direkt aus dem Browser heraus testen können, ohne eine einzige Zeile Quellcode lesen zu müssen.

---

## 🛠️ Phase 1: Setup & Konfiguration
*Ziel: Swagger ist im Projekt installiert, in der Haupdatei registriert und das CLI-Plugin wertet deine DTOs automatisch aus.*

* [ ] **Pakete installieren:** Installiere die benötigten Swagger-Abhängigkeiten in deinem NestJS-Projekt:
  Befehl: npm install --save @nestjs/swagger

* [ ] **CLI-Plugin aktivieren:** Öffne die Datei `nest-cli.json` im Root-Verzeichnis und aktiviere das Swagger-Plugin, damit Metadaten für DTOs automatisch aus deinen TypeScript-Typen abgeleitet werden:
--------------------------------------------------
{
"$schema": "https://json.schemastore.org/nest-cli",
"collection": "@nestjs/schematics",
"sourceRoot": "src",
"compilerOptions": {
"plugins": ["@nestjs/swagger"]
}
}
--------------------------------------------------

* [ ] **SwaggerModule in main.ts einrichten:**
    * [ ] Importiere `DocumentBuilder` und `SwaggerModule` in deiner `src/main.ts`.
    * [ ] Erstelle eine Konfiguration mit einem sinnvollen Titel (z. B. "Cyber Chat API"), einer Beschreibung und einer Versionsnummer.
    * [ ] Registriere das JWT-Verfahren mit `.addBearerAuth()`, damit geschützte Endpunkte später im Browser autorisiert werden können.
    * [ ] Richte das Setup so ein, dass die Dokumentation unter `/api` und das rohe OpenAPI-Dokument als JSON unter `/api-json` erreichbar ist:
--------------------------------------------------
const config = new DocumentBuilder()
.setTitle('Cyber Chat API')
.setDescription('Vollständige API-Dokumentation für das Cyber Chat Backend')
.setVersion('1.0')
.addBearerAuth()
.build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
--------------------------------------------------

---

## 🏷️ Phase 2: Controller & Routen dokumentieren
*Ziel: Jeder Endpunkt besitzt eine kurze Beschreibung, zeigt erwartete HTTP-Status-Codes und signalisiert benötigte Authentifizierung.*

* [ ] **Routen-Zusammenfassung:** Füge jedem einzelnen Endpoint in deinen Controllern (Threads, Messages, Comments, Auth) den Dekoratoren `@ApiOperation({ summary: '...' })` hinzu, um eine prägnante, einzeilige Beschreibung zu hinterlegen (z. B. `summary: 'Erstellt einen neuen Chat-Thread'`).

* [ ] **Erfolgs- und Fehler-Antworten definieren:** Deklariere für jeden Endpunkt mindestens eine erfolgreiche Antwort und mindestens eine logische Fehler-Antwort, die im Code auftreten kann:
    * [ ] `@ApiCreatedResponse()` (Status 201) für POST-Endpunkte.
    * [ ] `@ApiOkResponse()` (Status 200) für GET-, PATCH- oder PUT-Endpunkte.
    * [ ] `@ApiBadRequestResponse()` (Status 400) für Routen mit Input-Validierung (z. B. fehlerhafter Body).
    * [ ] `@ApiUnauthorizedResponse()` (Status 401) für Routen, die ein valides JWT voraussetzen.
    * [ ] `@ApiNotFoundResponse()` (Status 404) für Routen, die Ressourcen anhand einer ID oder eines Slugs suchen.

* [ ] **JWT-Schutz markieren:** Nutze den Dekorator `@ApiBearerAuth()`, um Routen als geschützt zu markieren.
  *Tipp: Du kannst `@ApiBearerAuth()` auch einmal ganz oben auf Controller-Ebene setzen, wenn alle Routen dieses Controllers ein JWT benötigen.*

---

## 🗃️ Phase 3: DTOs & Datentypen verfeinern
*Ziel: Die Datenmodelle im Swagger-Interface sind klar verständlich, nutzen Beispiele und bilden Enums ab.*

* [ ] **Zusätzliche Metadaten hinzufügen:** Das CLI-Plugin leitet die Basis-Typen zwar automatisch ab, aber für spezifische Details musst du deine DTO-Eigenschaften (z. B. `CreateThreadDto`, `LoginDto`) manuell mit `@ApiProperty()` oder `@ApiPropertyOptional()` anreichern.
* [ ] Ergänze für wichtige Felder Folgendes:
    * [ ] **Descriptions:** Was genau bedeutet das Feld? (z. B. `description: 'Der eindeutige Name des Chat-Raums'`).
    * [ ] **Examples:** Realistische Testdaten hinterlegen (z. B. `example: 'Schnittstellen-Design'`).
    * [ ] **Enums & Formate:** Falls du Status-Felder hast, binde das TypeScript-Enum ein (`enum: MyEnum`). Bei IDs oder Datumsangaben nutze das Format-Feld (`format: 'uuid'` oder `format: 'date-time'`).

---

## 🧪 Phase 4: Überprüfung im Browser
*Führe folgende Schritte direkt in der Swagger-UI aus, um die Vollständigkeit deiner Dokumentation zu testen:*

* [ ] Öffne im Browser http://localhost:3000/api.
* [ ] **Unprotected Route testen:** Suche den Login- oder Registrierungs-Endpoint, klicke auf "Try it out", gib gültige Testdaten ein und sende den Request ab. Du solltest eine echte Antwort vom Server (inklusive des generierten JWTs) sehen.
* [ ] **Authorize-Dialog nutzen:** Kopiere das erhaltene JWT aus der Antwort. Klicke ganz oben in der Swagger-UI auf den grünen "Authorize"-Button, füge das Token dort ein und bestätige.
* [ ] **Protected Route testen:** Gehe nun zu einem geschützten Endpunkt (z. B. Profil abrufen oder Nachricht senden) und klicke dort auf "Try it out". Der Request muss jetzt dank des hinterlegten Tokens erfolgreich durchgehen (Status 200/210).

---

## 🏆 Optionale Zusatz-Herausforderungen (Bonus)

* [ ] **Validierung prüfen:** Öffne http://localhost:3000/api-json im Browser, kopiere den gesamten JSON-Inhalt und füge ihn auf der Webseite [editor.swagger.io](https://editor.swagger.io/) ein. Überprüfe, ob das Dokument fehlerfrei validiert wird.
* [ ] **TypeScript-Client generieren lassen:** Nutze den OpenAPI Generator, um basierend auf deiner API-Schnittstelle automatisch Code für dein Frontend generieren zu lassen:
  Befehl: npx @openapitools/openapi-generator-cli generate -i http://localhost:3000/api-json -g typescript-fetch -o ./client
  *Aufgabe:* Schreibe ein kleines, separates Skript, das diesen generierten Client importiert und testweise einen Endpunkt gegen deinen laufenden Server aufruft.