# NestJS Swagger - OpenAPI-Dokument

Ein OpenAPI-Dokument ist einfach nur eine einzelne Datei. Es kann entweder im JSON- oder im YAML-Format vorliegen. In der Praxis ist YAML weiter verbreitet, weil es Kommentare erlaubt, weniger syntaktisches Rauschen als JSON hat und bei Pull Requests übersichtlichere Diffs erzeugt. Die Beispiele in diesem Dokument verwenden daher alle YAML.

Das Dokument besitzt eine kleine, fest definierte Top-Level-Struktur. Jedes API-Dokument beginnt unabhängig von seiner Größe mit denselben wenigen Schlüsseln: `openapi`, `info`, `servers`, `paths` und `components`. Alles andere befindet sich innerhalb dieser Schlüssel.

Das Ziel dieses Dokuments ist Wiedererkennung, nicht Auswendiglernen. Du solltest ein OpenAPI-Dokument eines Drittanbieters öffnen können, die für dich relevanten Endpunkte finden und Request- sowie Response-Struktur direkt herauslesen können, ohne erst die Spezifikation nachschlagen zu müssen. Ein solches Dokument von Hand zu schreiben, kommt eher selten vor; in diesem Kapitel geht es stattdessen darum, es aus NestJS-Code zu generieren.

## Top-Level-Struktur

Das kleinste gültige OpenAPI-Dokument sieht so aus:

```yaml
openapi: 3.0.3
info:
  title: My API
  version: 1.0.0
servers:
  - url: https://api.example.com/v1
paths: {}
components: {}
```

Jeder Top-Level-Schlüssel hat einen bestimmten Zweck:

- `openapi` gibt an, welcher Version der Spezifikation dieses Dokument entspricht. `3.0.3` ist in der Praxis der am häufigsten anzutreffende Wert.
- `info` enthält Metadaten über die API. Die beiden Pflichtfelder sind `title` und `version`; zusätzlich kannst du `description`, `contact` und `license` angeben.
- `servers` listet die Basis-URLs auf, unter denen die API läuft. Du kannst mehrere angeben (Produktion, Staging, lokal), und Swagger UI lässt die Nutzer auswählen, an welche URL „Try it out“ die Anfrage senden soll.
- `paths` ist der Bereich, in dem alle Endpunkte definiert werden. Das leere Objekt oben bedeutet, dass noch keine Endpunkte vorhanden sind.
- `components` ist die wiederverwendbare Typbibliothek. Schemas, Sicherheitsschemata und wiederverwendbare Parameter werden hier definiert und an anderer Stelle mit `$ref` referenziert.

## Paths und Operations

Jeder Endpunkt wird über seinen Pfad als Schlüssel eingetragen. Unter diesem Pfad wird jede HTTP-Methode zu einer eigenen Operation:

```yaml
paths:
  /users:
    get:
      summary: List all users
      tags: [Users]
      responses:
        "200":
          description: A list of users
    post:
      summary: Create a new user
      tags: [Users]
      responses:
        "201":
          description: The newly created user
```

Die Schlüssel unter `/users` sind `get` und `post`. Das bedeutet, dass derselbe Pfad beide Methoden unterstützt. Jede Operation hat ihre eigene `summary`, `tags`, `parameters`, `requestBody` und `responses`.

- `summary` ist eine kurze, menschenlesbare Ein-Zeilen-Beschreibung, die in Swagger UI neben der Route angezeigt wird.
- `tags` ist ein Array aus Gruppennamen. Swagger UI nutzt diese Tags, um aufklappbare Abschnitte darzustellen. Ein Endpunkt kann zu mehr als einem Tag gehören.
- `responses` ist eine Map, die nach HTTP-Statuscodes sortiert ist. Diese werden als Strings angegeben, weil YAML `200` sonst als Zahl interpretieren würde. Jede Operation sollte mindestens eine Response definieren.

Du kannst dieselbe Operation ausführlicher dokumentieren, indem du zusätzlich `description` hinzufügst, also eine längere Erklärung in Markdown, sowie `operationId`, eine eindeutige Kennung, die Codegeneratoren zur Benennung von Client-Methoden verwenden.

## Parameter

Parameter stehen innerhalb einer Operation unter dem Schlüssel `parameters`. Das Feld `in` sagt OpenAPI, an welcher Stelle der Parameter in der HTTP-Anfrage erscheint. Dafür gibt es vier mögliche Werte:

- `path` für Parameter, die in der URL eingebettet sind, etwa `/users/{id}`
- `query` für Parameter nach dem `?` in der URL, etwa `/users?role=admin`
- `header` für HTTP-Request-Header
- `cookie` für Werte im Cookie-Header

Ein Path-Parameter und ein Query-Parameter in derselben Operation:

```yaml
paths:
  /users/{id}:
    get:
      summary: Get a user by id
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
        - name: include
          in: query
          required: false
          schema:
            type: string
            enum: [posts, comments]
      responses:
        "200":
          description: The user
```

Dabei gelten einige Regeln:

- Path-Parameter müssen immer `required: true` haben. Einen optionalen Path-Parameter gibt es nicht; entweder enthält die URL dieses Segment oder eben nicht.
- Query-Parameter haben standardmäßig `required: false`. Man setzt diesen Wert nur explizit, wenn der Parameter verpflichtend ist.
- Das `schema` beschreibt den Typ. `enum` schränkt die erlaubten Werte auf eine feste Liste ein.

## Request-Bodies und Responses

Request-Bodies und Responses beschreiben beide eine Payload. Sie teilen sich denselben Aufbau: eine `content`-Map, die nach Medientypen gegliedert ist, wobei jeder Medientyp ein `schema` enthält.

Ein Request-Body mit einem inline definierten Schema:

```yaml
requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        required: [name, email]
        properties:
          name:
            type: string
          email:
            type: string
            format: email
```

Derselbe Request-Body unter Verwendung einer wiederverwendbaren Komponente:

```yaml
requestBody:
  required: true
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/CreateUserDto"
```

Beide Varianten führen zum gleichen Ergebnis. Der Unterschied liegt in der Wiederverwendbarkeit. Sobald derselbe Typ an mehreren Stellen auftaucht, zum Beispiel im Request-Body von `POST /users`, in der Response von `GET /users/{id}` oder als Array-Element in `GET /users`, sorgt eine einmalige Definition unter `components/schemas` mit anschließender Referenz über `$ref` für Konsistenz und Lesbarkeit im Dokument.

Wie man ein solches Schema definiert, wird im nächsten Abschnitt betrachtet.

Eine Response funktioniert genauso:

```yaml
responses:
  "200":
    description: A list of users
    content:
      application/json:
        schema:
          type: array
          items:
            $ref: "#/components/schemas/UserDto"
  "404":
    description: User not found
```

Jeder Response-Schlüssel muss eine `description` enthalten. Der `content`-Block ist optional; manche Responses, etwa `204 No Content`, haben keinen Body.

## Components und Schemas

`components/schemas` ist die wiederverwendbare Typbibliothek der API. Ein Schema beschreibt die Form eines JSON-Objekts, Arrays oder primitiven Werts, und zwar mithilfe einer Teilmenge von JSON Schema. Die Felder, die am häufigsten gebraucht werden, sind:

- `type` für den JSON-Typ: `object`, `array`, `string`, `integer`, `number`, `boolean`
- `properties` für die Felder eines Objekts
- `required` für ein Array mit Eigenschaftsnamen, die vorhanden sein müssen
- `items` für den Elementtyp eines Arrays
- `enum` für eine feste Menge erlaubter Werte
- `format` für eine genauere Typangabe wie `email`, `uuid` oder `date-time`

Ein `UserDto`-Schema und eine dazugehörige Response, die ein Array von Benutzern zurückgibt:

```yaml
components:
  schemas:
    UserDto:
      type: object
      required: [id, name]
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
          format: email
        role:
          type: string
          enum: [admin, member, guest]
```

Der Referenzpfad lautet immer `#/components/schemas/<Name>`. Das `#` am Anfang bedeutet „in diesem selben Dokument“. OpenAPI unterstützt auch Referenzen auf andere Dateien, aber das wirst du nur selten brauchen.

## Sicherheitsschemata

Authentifizierung wird an zwei Stellen definiert. Zuerst werden die eigentlichen Schemata unter `components/securitySchemes` festgelegt. Anschließend wird über einen `security`-Block auf oberster Ebene oder pro Operation bestimmt, welches dieser Schemata auf bestimmte Endpunkte angewendet wird.

Ein Bearer-JWT-Schema, wie du es aus deiner `nest-auth`-Session kennst:

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []
```

Die Felder bedeuten hier:

- `type: http` steht für HTTP-Authentifizierung, im Gegensatz etwa zu einem API-Key im Header oder OAuth2.
- `scheme: bearer` wählt innerhalb der HTTP-Authentifizierung das Bearer-Schema aus.
- `bearerFormat: JWT` ist nur ein Hinweis für Dokumentationstools; auf die Validierung hat es keinen Einfluss.

Der `security`-Block auf oberster Ebene wendet `bearerAuth` standardmäßig auf alle Operationen an.

Um eine einzelne Operation von dieser globalen Vorgabe auszunehmen, setzt man bei dieser Operation `security: []`. Wenn für eine einzelne Operation ein anderes Schema gelten soll, wird dieses dort stattdessen eingetragen.

OpenAPI unterstützt außerdem noch weitere Sicherheitsarten, die du seltener sehen wirst: `apiKey` für Schlüssel im Header oder in der Query-String, `oauth2` für vollständige OAuth-Flows und `openIdConnect` für OIDC-Discovery-URLs. Die genaue Struktur jeder Variante ist in der Spezifikation dokumentiert.

## Ressourcen

- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [JSON Schema reference](https://json-schema.org/)
- [Swagger Editor](https://editor.swagger.io/)