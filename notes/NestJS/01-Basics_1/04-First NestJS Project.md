# Erstes NestJS-Projekt

Diese Datei baut eine minimale NestJS-Anwendung Schritt für Schritt auf. Sie beginnt mit dem Einstiegspunkt, der das Framework startet, fügt das kleinste Setup hinzu, das eine HTTP-Anfrage beantworten kann, und refaktoriert dieses Setup dann zur Verwendung eines Service. Die Refaktorierung ist der Moment, an dem Dependency Injection ins Spiel kommt.

Alle vier Teile landen in einer einzigen Datei. Echte Projekte verteilen sie auf Ordner – eine Datei pro Klasse –, aber alles zusammen zu halten macht die Verdrahtung hier explizit sichtbar. Wenn `AppController` später eine Abhängigkeit von `AppService` deklariert, ist `AppService` direkt darüber definiert.

---

## Installation und TypeScript-Konfiguration

Laufzeit- und Typ-Abhängigkeiten installieren:

```bash
npm install @nestjs/core @nestjs/common @nestjs/platform-express reflect-metadata
npm install --save-dev @types/node typescript ts-node
```

- `@nestjs/core` ist die NestJS-Laufzeit und der DI-Container.
- `@nestjs/common` stellt die Decorators bereit: `@Injectable()`, `@Controller()`, `@Module()` und die Routen-Decorators.
- `reflect-metadata` ist ein Polyfill, den NestJS zusammen mit `emitDecoratorMetadata` verwendet, um Konstruktortyp-Informationen zur Laufzeit zu lesen.

NestJS basiert auf einer Legacy-Implementierung von TypeScript-Decorators. Das erfordert zwei Flags in der `tsconfig.json`, bevor sie in einer Anwendung funktionieren:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

- `experimentalDecorators` aktiviert die Legacy-Decorator-Implementierung.
- `emitDecoratorMetadata` weist den Compiler an, Typinformationen in die kompilierte Ausgabe einzubetten. NestJS liest diese Metadaten zur Laufzeit, um den Typ jedes Konstruktorparameters zu ermitteln und den richtigen Provider zu injizieren.

> Ohne `emitDecoratorMetadata` kann NestJS Konstruktorabhängigkeiten nicht auflösen – das DI-System funktioniert dann nicht.

---

## Die Bootstrap-Funktion und das App-Module

Jede NestJS-Anwendung startet auf dieselbe Weise: Eine kleine asynchrone Funktion erstellt die App und weist sie an, auf HTTP-Anfragen zu lauschen.

```ts
import { Module } from '@nestjs/common';
import { NestFactory } from "@nestjs/core";

@Module({
  controllers: [],
  providers: [],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3232);
  console.log(`Server läuft auf ${await app.getUrl()}`);
}

bootstrap();
```

`NestFactory.create` nimmt eine Module-Klasse als Argument. Es liest die Konfiguration des Modules, baut den DI-Container auf, instanziiert die registrierten Klassen, löst ihre Abhängigkeiten auf und gibt eine fertige Anwendungsinstanz zurück. `app.listen(3232)` startet dann den HTTP-Server auf dem angegebenen Port.

`AppModule` ist das globale Module, in dem alle Teile der Anwendung zusammenkommen. Es ist vorerst leer – das ändert sich gleich.

---

## AppController

NestJS braucht etwas, wohin Anfragen weitergeleitet werden können. Die einfachste Version ist eine Controller-Klasse mit einem Route-Handler:

```ts
import { Controller, Get } from "@nestjs/common";

@Controller()
class AppController {
  @Get("/")
  showHello() {
    return "Hello World";
  }
}
```

`@Controller()` registriert diese Klasse als Request-Handler und weist NestJS an, ihre Methoden nach Routen-Decorators zu scannen.

`@Get("/")` ist der erste Decorator, der nicht für Dependency Injection verwendet wird. Er registriert die Methode `showHello` als GET-Route-Handler für die Route `/`. NestJS ruft diese Methode auf, wenn eine passende Anfrage eingeht, und verwendet den Rückgabewert als Response-Body. Der String `"Hello World"` ist vorerst fest in der Methode verankert.

Der Controller existiert jetzt – aber NestJS kann ihn noch nicht finden. Er muss dem `AppModule` als Controller hinzugefügt werden:

```ts
import { Module } from "@nestjs/common";

@Module({
  controllers: [AppController],
  providers: [],
})
class AppModule {}
```

`@Module()` nimmt ein Konfigurationsobjekt entgegen. Hier ist nur der `controllers`-Schlüssel gesetzt, mit `AppController` darin. Der Klassenrumpf ist leer, weil alle Informationen, die NestJS benötigt, im Decorator stecken.

Mit diesem Module kann `NestFactory.create(AppModule)` in der Bootstrap-Funktion seine Arbeit tun. NestJS liest das Module, instanziiert `AppController`, registriert seine Routen – und der Server kann eine GET-Anfrage an `/` mit `"Hello World"` beantworten.

---

## Den ersten Provider hinzufügen

Die Anwendung läuft, aber die Nachricht ist direkt im Route-Handler fest verankert – das ist nicht die Art, wie Anwendungen in NestJS gebaut werden. Sie in einen Service auszulagern löst das Problem und entspricht dem Standard-NestJS-Muster.

Der erste Schritt ist die Service-Klasse selbst:

```ts
import { Injectable } from "@nestjs/common";

@Injectable()
class AppService {
  generateMessage(): string {
    return "Hello World";
  }
}
```

`@Injectable()` registriert `AppService` beim DI-Container. Ohne ihn weiß der Container nicht, dass diese Klasse existiert, und kann sie nirgendwo injizieren. Die Methode, die früher im Controller lag, lebt jetzt hier.

Das Module muss `AppService` unter `providers` aufführen, damit der Container weiß, dass er für die Injektion zur Verfügung stehen soll:

```ts
@Module({
  controllers: [AppController],
  providers: [AppService],
})
class AppModule {}
```

Jetzt kann der Service im Controller verwendet werden. Dazu wird dem Controller einfach ein Konstruktorparameter mit `AppService` als Typannotation hinzugefügt. Wichtig zu beachten: Klassen in TypeScript können auch als Typen fungieren.

```ts
@Controller()
class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/")
  showHello() {
    return this.appService.generateMessage();
  }
}
```

Der Konstruktorparameter `private readonly appService: AppService` ist die Dependency-Injection-Deklaration. NestJS liest die `AppService`-Typannotation beim Start, findet den registrierten Provider für diesen Typ und injiziert die Instanz.

---

## Die vollständige Anwendung

Die erste NestJS-Anwendung sieht schließlich so aus:

```ts
import { Controller, Get, Module, Injectable } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

@Injectable()
class AppService {
  generateMessage(): string {
    return "Hello World";
  }
}

@Controller()
class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/")
  showHello() {
    return this.appService.generateMessage();
  }
}

@Module({
  controllers: [AppController],
  providers: [AppService],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3232);
  console.log(`Server läuft auf ${await app.getUrl()}`);
}

bootstrap();
```

---

## Ressourcen

- [NestJS – First Steps](https://docs.nestjs.com/first-steps)