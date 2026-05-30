# Dependency-Injection-Framework

In einer einfachen Express-Anwendung erstellt ein Route-Handler einen Service entweder direkt mit `new UserService()` oder empfängt ihn durch eine manuelle Verdrahtung, die man selbst aufgesetzt hat. Das funktioniert – aber es bindet den Handler an eine bestimmte Implementierung. Wenn der Handler isoliert getestet werden soll, muss der echte Service irgendwie ausgetauscht werden. Es gibt keinen standardisierten Weg dafür, und je größer die Anwendung wird, desto schwieriger wird das zu verwalten.

NestJS umgeht dieses Problem mit einem **Dependency-Injection-Framework**. Anstatt ihre eigenen Abhängigkeiten zu erstellen, deklarieren Komponenten, was sie benötigen – und das Framework stellt es bereit. Ein Controller sagt: „Ich brauche einen Service vom Typ `AppService`", indem er ihn als Konstruktorparameter aufführt. NestJS findet den registrierten Provider, erstellt eine Instanz, falls noch keine existiert, und übergibt sie automatisch.

Decorators und der DI-Container machen das möglich. Decorators teilen NestJS mit, welche Rolle jede Klasse spielt. Der Container ist der Laufzeitmechanismus, der diese Rollen liest, Instanzen verfolgt und Abhängigkeiten auflöst, wenn Komponenten starten.

---

## Decorators in TypeScript

Wir haben Decorators bereits behandelt, hier aber eine kurze Zusammenfassung: Ein Decorator ist eine Funktion, die zur Definitionszeit auf eine Klasse, eine Methode oder einen Parameter angewendet wird. Er wird mit einem `@`-Symbol direkt über dem dekorierten Element geschrieben:

```ts
@Injectable()
class AppService {}
```

Wenn TypeScript das kompiliert, ruft es die `Injectable`-Funktion mit `AppService` als Argument auf. NestJS nutzt diesen Aufruf, um die Klasse in seinem internen Container zu registrieren.

---

## Dependency Injection in NestJS

Der Grundgedanke des Dependency-Injection-Frameworks in NestJS ist: **Der Typ eines Parameters im Konstruktor bestimmt, welche Klasse in diesen Parameter injiziert wird.**

Wenn ein Teil der Anwendung – zum Beispiel ein Controller – den `AppService` von oben benötigt, kann er ihn einfach als Typ eines Konstruktorparameters deklarieren:

```ts
@Controller()
class AppController {
  constructor(private readonly appService: AppService) {}
}
```

Damit diese Magie funktioniert, muss NestJS mitgeteilt werden, dass `AppService` tatsächlich etwas ist, das in andere Klassen injiziert werden kann. Hier kommt der `@Injectable()`-Decorator ins Spiel. Er teilt NestJS mit, dass `AppService` ein Provider ist und in andere Klassen injiziert werden kann, wenn diese ihn anfordern.

Wenn NestJS eine Instanz von `AppController` erstellt, wird es:

1. Eine Instanz von `AppService` erstellen,
2. `AppController` mit der `AppService`-Instanz als Argument für den `appService`-Parameter aufrufen.

Das DI-Framework übernimmt die Erstellung und Bereitstellung jeder Klasseninstanz. Die Abhängigkeit wird mit dem Klassentyp verknüpft – den Rest erledigt das Framework.

Um die Kontrolle darüber zu behalten, welche Provider tatsächlich für welche Controller und Services zugänglich sind, verlangt NestJS, Provider und Controller in **Module** zu gruppieren. Diese Module definieren eine Liste von Providern und Controllern, die füreinander verfügbar sind:

```ts
@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Diese leere Klasse wirkt zunächst sehr seltsam, aber ihr Decorator `@Module()` abstrahiert die Details weg.

---

## Wie NestJS Abhängigkeiten auflöst

NestJS pflegt einen **Container** – ein internes Register von Providern. Beim Start der Anwendung liest es jedes Modul und registriert die dort aufgelisteten Provider. Wenn eine Klasse instanziiert werden muss, inspiziert es die Konstruktorparameter anhand der durch `emitDecoratorMetadata` ausgegebenen Metadaten und löst jede Abhängigkeit aus dem Register auf.

Provider werden standardmäßig als **Singletons** erstellt. Wenn `AppController` und eine andere Komponente beide eine Abhängigkeit von `AppService` deklarieren, erstellt NestJS genau eine `AppService`-Instanz und teilt sie zwischen beiden.

---

## Kern-Decorators

`@Injectable()` markiert eine Klasse als Provider. Der Container verwaltet ihren Lebenszyklus und injiziert sie überall dort, wo der Typ als Konstruktorabhängigkeit erscheint. Jeder Service, den man schreibt, wird diesen Decorator haben.

`@Controller()` markiert eine Klasse als Request-Handler. Controller werden vom Container instanziiert und können injizierte Provider in ihren Konstruktoren empfangen, werden aber im Modul unter `controllers` registriert – nicht unter `providers`. NestJS nutzt `@Controller()`, um die Routen-Map der Anwendung aufzubauen.

`@Module()` gruppiert Controller und Provider in eine Einheit, die das Framework laden kann. Es nimmt ein Konfigurationsobjekt mit mindestens zwei Schlüsseln entgegen: `controllers` und `providers`. Jede Anwendung hat mindestens ein Modul – das Root-Modul.

NestJS verwendet Decorators für mehr als nur Dependency Injection. In kommenden Beispielen werden sie auch als Routen-Methoden-Decorators und Parameter-Decorators auftauchen.

---

## Inversion of Control

Das dem DI-System von NestJS zugrunde liegende Muster heißt **Inversion of Control (IoC)**. Der Name beschreibt, was sich ändert: Normalerweise erstellt der eigene Code die Dinge, die er benötigt. Mit IoC wandert diese Verantwortung zum Framework.

Stell dir vor, du möchtest einen Kuchen. Ohne IoC gehst du in die Küche, holst alle Zutaten zusammen und backst ihn selbst. Mit IoC sagst du einem Bäcker, was du möchtest. Der Bäcker kümmert sich um alles – du erhältst den Kuchen, wenn du ihn brauchst.

Die eigene Klasse ruft nicht `new UserService()` auf. Sie deklariert `constructor(private userService: UserService)`. Das Framework sieht diese Deklaration, findet den registrierten Provider für `UserService` und liefert ihn. Man deklariert, was man braucht – NestJS entscheidet, wann und wie es bereitgestellt wird.

---

## Ressourcen

- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [NestJS Providers](https://docs.nestjs.com/providers)