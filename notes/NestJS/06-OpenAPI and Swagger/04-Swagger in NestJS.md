# NestJS Swagger - Swagger in NestJS

Ein OpenAPI-Dokument parallel zu einer NestJS-Anwendung von Hand zu pflegen, ist keine gute Idee. Jede Änderung an einem Controller, jedes neue DTO-Feld und jede umbenannte Route müsste zusätzlich auch in der YAML-Datei nachgetragen werden, und niemand macht das dauerhaft zuverlässig.

Stattdessen erzeugt `@nestjs/swagger` das OpenAPI-Dokument beim Start der Anwendung direkt aus dem Code. Die meisten benötigten Informationen stehen ohnehin schon im Quellcode: `@Get('/messages/:id')` definiert die Route, die Typen der Konstruktorparameter deklarieren die Abhängigkeiten, die DTO-Klassen beschreiben die Request-Struktur, und der Rückgabetyp beschreibt die Response-Struktur. Das Plugin liest all diese Informationen aus und erzeugt daraus ein vollständiges OpenAPI-Dokument, ohne dass eine zusätzliche YAML-Datei gepflegt werden muss.

Einige zusätzliche Decorators wie `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiProperty` und `@ApiBearerAuth` ergänzen genau die Metadaten, die reine TypeScript-Typen nicht transportieren können: menschenlesbare Kurzbeschreibungen, Response-Statuscodes jenseits von 200, Beispielwerte oder die Struktur von Fehlerantworten. Das Ergebnis ist eine Dokumentationsseite, die sich automatisch mit dem Code aktualisiert.

## Installation und Bootstrap

Installiere das Paket als normale Dependency:

```bash
npm install @nestjs/swagger
```

Das Einbinden erfolgt in `main.ts`, nachdem die Anwendung erstellt wurde und bevor `listen` aufgerufen wird:

```ts
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("Cyber Chat API")
    .setDescription("Threads, messages, and comments")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(3000);
}
bootstrap();
```

Hier passieren drei Dinge:

- `DocumentBuilder` erstellt den Top-Level-Bereich `info` des OpenAPI-Dokuments. Die Methoden, die du darauf aufrufst, entsprechen direkt den Feldern aus der vorherigen Konzepterklärung: `setTitle` und `setVersion` füllen `info`, `addBearerAuth` registriert einen Eintrag `bearerAuth` unter `components/securitySchemes`.
- `SwaggerModule.createDocument` läuft durch die Anwendung, untersucht alle Controller und DTOs und setzt daraus im Speicher ein vollständiges OpenAPI-Dokument zusammen.
- `SwaggerModule.setup('api', app, document)` registriert zwei Routen: `GET /api` liefert die Swagger-UI als HTML aus, und `GET /api-json` liefert das rohe OpenAPI-Dokument.

Nachdem die Anwendung gestartet wurde, zeigt `http://localhost:3000/api` die interaktive Dokumentationsseite an.

## DTOs mit `@ApiProperty` dokumentieren

NestJS-DTOs enthalten bereits Informationen über ihre Struktur: Eigenschaftsnamen, TypeScript-Typen und `class-validator`-Decorators wie `@IsString()` oder `@IsEmail()`. Das Swagger-CLI-Plugin, das weiter unten behandelt wird, kann den Großteil davon automatisch auslesen. Wenn das Plugin nicht verfügbar ist oder wenn zusätzliche Metadaten nötig sind, die Typen allein nicht ausdrücken können, verwendet man `@ApiProperty`:

```ts
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsUUID, IsOptional } from "class-validator";

export class CreateMessageDto {
  @ApiProperty({
    description: "The text content of the message",
    example: "Hello, world!",
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: "The thread this message belongs to",
    format: "uuid",
  })
  @IsUUID()
  threadId: string;
}
```

Ein paar Dinge sind dabei wichtig:

- `@ApiProperty` fügt dem OpenAPI-Schema für dieses DTO zusätzliche Metadaten hinzu. `description` und `example` erscheinen in Swagger UI als Hilfetext unter dem jeweiligen Feld.
- `@ApiPropertyOptional` ist eine Kurzform für `@ApiProperty({ required: false })`. Man verwendet es für Eigenschaften, die man auch mit `@IsOptional` markieren würde.
- Das Feld `format` ist ein Hinweis, zum Beispiel `uuid`, `email` oder `date-time`. Diese Werte stammen aus der JSON-Schema-Spezifikation und werden von Swagger UI als zusätzlicher Hilfetext dargestellt.

Das resultierende OpenAPI-Schema für dieses DTO sieht genauso aus wie die handgeschriebenen Schemas aus der vorherigen Konzepterklärung. Die Decorators sind lediglich eine andere Art, dieselben Informationen zu formulieren.

## Controller-Decorators

Routen werden auf Controller- und Methodenebene dokumentiert. Die folgenden Decorators sind diejenigen, zu denen du am häufigsten greifen wirst:

```ts
import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { MessagesService } from "./messages.service";
import { CreateMessageDto } from "./create-message.dto";
import { Message } from "./message.entity";

// @ApiTags("messages") outdated, inferred from controller name
@ApiBearerAuth()
@Controller("messages")
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get()
  @ApiOperation({ summary: "List all messages in a thread" })
  @ApiOkResponse({ type: [Message] })
  findAll(): Promise<Message[]> {
    return this.messages.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single message by id" })
  @ApiOkResponse({ type: Message })
  @ApiNotFoundResponse({ description: "No message exists with that id" })
  findOne(@Param("id") id: string): Promise<Message> {
    return this.messages.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Post a new message to a thread" })
  @ApiCreatedResponse({ type: Message })
  create(@Body() dto: CreateMessageDto): Promise<Message> {
    return this.messages.create(dto);
  }
}
```

Was die einzelnen Decorators tun:

- `@ApiTags('messages')` am Controller gruppiert alle Routen dieser Klasse unter der Überschrift `messages` in Swagger UI. Es gilt jedoch inzwischen als veraltet, weil das Plugin diese Information aus dem Controllernamen ableitet.
- `@ApiBearerAuth()` am Controller markiert alle darin enthaltenen Routen so, dass sie das Bearer-Schema benötigen, das in `main.ts` mit `addBearerAuth()` registriert wurde. Du kannst es auch nur auf einzelne Methoden anwenden, falls nur einige Endpunkte geschützt sind.
- `@ApiOperation({ summary, description })` liefert die menschenlesbare Beschriftung für die Route. `summary` ist die Ein-Zeilen-Beschreibung in der eingeklappten Ansicht, `description` ist der längere Markdown-Text in der ausgeklappten Ansicht.
- `@ApiOkResponse`, `@ApiCreatedResponse`, `@ApiNotFoundResponse`, `@ApiBadRequestResponse` und `@ApiUnauthorizedResponse` sind Kurzformen für `@ApiResponse({ status: 200, ... })` und ähnliche Statuscodes. Sie sind lesbarer als rohe Zahlenwerte. Die Option `type` gibt an, welches DTO oder welche Entity den Response-Body beschreibt; mit `[Message]` wird eine Array-Response dokumentiert.

Du kannst auf einer Methode so viele Response-Decorators stapeln, wie der Endpunkt tatsächlich erzeugen kann. Typischerweise definiert eine Route eine erfolgreiche Response und ein oder zwei Fehlerantworten, zum Beispiel `404` für eine nicht vorhandene Ressource oder `400` für ungültige Eingaben.

## Das CLI-Plugin

`@ApiProperty()` an jede einzelne DTO-Eigenschaft zu schreiben, ist mühsam. Die NestJS-CLI bringt deshalb ein Swagger-Plugin mit, das den Großteil davon automatisch ableitet, indem es beim Build die TypeScript-Typen und `class-validator`-Decorators auswertet.

Aktiviere es in `nest-cli.json`:

```json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/swagger"]
  }
}
```

Sobald das Plugin aktiviert ist:

- Eine DTO-Eigenschaft wie `name: string` wird als erforderlicher String dokumentiert, ohne dass `@ApiProperty()` nötig ist.
- Eine mit `?` markierte Eigenschaft wie `replyToId?: string` wird automatisch als optional dokumentiert.
- `class-validator`-Decorators wie `@IsEmail()`, `@IsUUID()`, `@Min(0)` oder `@MaxLength(100)` werden in die entsprechenden OpenAPI-Schema-Felder übersetzt, etwa `format: email`, `format: uuid`, `minimum: 0` oder `maxLength: 100`.

`@ApiProperty()` verwendest du dann nur noch für Dinge, die das Plugin nicht selbst ableiten kann, etwa menschenlesbare Beschreibungen, Beispiele oder explizite Überschreibungen. Das Plugin läuft allerdings nur dann, wenn der Nest-CLI-Build verwendet wird. Nutzt dein Projekt stattdessen ein eigenes webpack- oder `tsc`-Setup, musst du wieder auf manuelle Decorators zurückgreifen.

## Dokument anzeigen und nutzen

Sobald `SwaggerModule.setup('api', app, document)` eingebunden ist und der Server läuft, sind zwei URLs besonders nützlich:

- `http://localhost:3000/api` rendert Swagger UI. Jeder Tag wird zu einem aufklappbaren Bereich. Jede Route darin hat einen „Try it out“-Button, mit dem du Parameter und Request-Body über ein Formular ausfüllen, eine echte HTTP-Anfrage an den laufenden Server senden und die Antwort direkt inspizieren kannst. Bei geschützten Routen fügst du oben im Dialog „Authorize“ ein JWT ein; Swagger UI sendet es anschließend als `Authorization: Bearer <token>` bei weiteren Requests mit.
- `http://localhost:3000/api-json` liefert das rohe OpenAPI-Dokument zurück. Diese Datei wird von allen anderen Tools verwendet. Du kannst ihre URL in `editor.swagger.io` einfügen, sie in Postman oder Insomnia importieren, um eine Request-Collection zu erzeugen, oder sie an OpenAPI Generator übergeben, um daraus ein typisiertes Client-SDK zu generieren.

Beide URLs enthalten inhaltlich dieselben Daten: Der JSON-Endpunkt ist die zentrale Quelle der Wahrheit, und Swagger UI ist nur eine von mehreren möglichen Darstellungen dieser Informationen.

## Wichtiger Hinweis

⚠️ Auch wenn es sehr nützlich ist, die APIs eines Backend-Services für potenzielle Consumer sichtbar zu machen, kann es ein erhebliches Risiko darstellen, diese Informationen öffentlich zugänglich zu machen, wenn das nicht ausdrücklich gewollt ist. Es kann daher sinnvoll sein, Swagger nur als Development-Dependency zu behandeln oder Swagger in der `production`-Umgebung gar nicht erst zu aktivieren. In den Ressourcen unten findest du dazu einen Link zu einer häufig verwendeten Umgehungslösung.

## Ressourcen

- [Introduction to OpenAPI in NestJS](https://docs.nestjs.com/openapi/introduction)
- [NestJS Swagger decorators](https://docs.nestjs.com/openapi/decorators)
- [NestJS Swagger CLI plugin](https://docs.nestjs.com/openapi/cli-plugin)
- [Setting up Swagger conditionally based on environment](https://stackoverflow.com/questions/67614748/how-to-disable-swagger-for-production-in-nestjs)