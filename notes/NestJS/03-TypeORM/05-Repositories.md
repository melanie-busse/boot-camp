# NestJS TypeORM – Repositories

Wenn die Entity die Form deiner Daten definiert, ist das Repository die Maschine, die sie bewegt.

Da NestJS strikt dem Data-Mapper-Muster folgt, ist deine `Boardgame`-Entity vollständig passiv. Sie hält Daten, kann sich aber nicht selbst in der Datenbank speichern. Stattdessen interagierst du ausschließlich über ein `Repository<Entity>`.

Dieses API stellt die erwarteten Standardoperationen bereit: Zeilen suchen, Datensätze einfügen, Felder aktualisieren und Daten löschen. Da TypeORM TypeScript-Generics nutzt, weiß das Repository genau, welche Spalten auf deiner `Boardgame`-Entity existieren. Versuchst du, nach einer nicht vorhandenen Spalte zu filtern, wirft der Compiler einen Fehler – noch bevor der Code überhaupt ausgeführt wird.

## Dependency Injection in Services

Ähnlich wie andere Provider in NestJS werden Repositories in Services injiziert. Da Repositories von TypeORM aus der Entity-Klasse abgeleitet werden, benötigen wir eine leicht abweichende Syntax zum Injizieren:

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Boardgame } from "./boardgame.entity";

@Injectable()
export class BoardgameService {
  constructor(
    @InjectRepository(Boardgame)
    private readonly boardgames: Repository<Boardgame>,
  ) {}

  // Geschäftslogik kommt hier rein...
}
```

Anstatt sich allein auf den Typ zu verlassen, versehen wir die Property mit `@InjectRepository(Boardgame)`. Das ist notwendig, weil TypeScript-Generics zur Kompilierzeit gelöscht werden und das DI-System von NestJS daher `Repository<Boardgame>` nicht von einem anderen `Repository<T>` unterscheiden kann. Der Decorator liefert das Laufzeit-Token, um das korrekte Repository zu injizieren.

Das Repository selbst wird erstellt, wenn du `TypeOrmModule.forFeature([Boardgame])` im Modul importierst. Die Annotation `Repository<Boardgame>` dient TypeScript lediglich zur korrekten Typinformation.

> 💡 **Namenskonvention**: Benenne die injizierte Property `boardgames` statt `boardgameRepository`. Der aufrufende Code liest sich dadurch deutlich natürlicher: `this.boardgames.find()`.

## Daten abfragen

Das Repository stellt mehrere Lesemethoden bereit. Die gebräuchlichsten sind `find`, `findOne` und `findOneBy`:

```typescript
async findAll(): Promise<Boardgame[]> {
  return this.boardgames.find({
    order: { name: "ASC" },
  });
}

async findByName(name: string): Promise<Boardgame[]> {
  const game = await this.boardgames.findOne({ where: { name } });

  if (!game) {
    throw new NotFoundException(`Boardgame mit dem Namen ${name} nicht gefunden`);
  }
  return game;
}

async findById(id: string): Promise<Boardgame> {
  const game = await this.boardgames.findOneBy({ id });
  if (!game) {
    throw new NotFoundException(`Boardgame mit der ID ${id} nicht gefunden`);
  }
  return game;
}
```

`findOne` und `findOneBy` verhalten sich sehr ähnlich. `findOneBy` ist eine Kurzform für `findOne({ where: { column: value } })`.

Ein häufiger Fehler ist der Aufruf von `findOne()` ohne `where`-Klausel. Übergibt man ein leeres Objekt, führt TypeORM einfach `SELECT * FROM boardgames LIMIT 1` aus und gibt die erste Zeile zurück, die die Datenbank zufällig liest. Verwende immer `findOneBy({ column: value })`, wenn du nach einer bestimmten Einschränkung filterst.

Für Bereiche und Teilübereinstimmungen exportiert TypeORM spezifische Operator-Funktionen:

```typescript
import { LessThanOrEqual, Like } from "typeorm";

async findQuickGames(maxMinutes: number): Promise<Boardgame[]> {
  return this.boardgames.find({
    where: { playtimeMinutes: LessThanOrEqual(maxMinutes) },
  });
}

async searchByName(term: string): Promise<Boardgame[]> {
  // SQLites Standard-LIKE-Operator ist von Natur aus case-insensitive
  return this.boardgames.find({
    where: { name: Like(`%${term}%`) },
  });
}
```

## Daten verändern

Das Schreiben von Daten umfasst zwei separate Schritte. `create` erstellt das Objekt im Arbeitsspeicher. `save` führt das SQL tatsächlich gegen die Datenbank aus.

```typescript
async createGame(dto: CreateBoardgameDto): Promise<Boardgame> {
  // 1. Synchron (lokal): Erstellt die Entity-Instanz im Arbeitsspeicher
  const boardgame = this.boardgames.create(dto);

  // 2. Asynchron (API): Führt das INSERT-Statement über TypeORM aus
  return this.boardgames.save(boardgame);
}
```

Diese Trennung gibt dir die Möglichkeit, das Objekt zu manipulieren, Validierungsroutinen auszuführen oder relationale Daten anzuhängen, bevor die Transaktion in die Datenbank geschrieben wird.

Die Methode `save()` verarbeitet sowohl Inserts als auch Updates. Hat die Entity keinen Primärschlüssel (oder existiert die ID nicht in der Datenbank), löst `save` ein `INSERT` aus. Existiert die ID bereits, führt TypeORM ein `UPDATE` der geänderten Felder durch.

Für rein partielle Updates, bei denen die aktualisierte Entity nicht an den Client zurückgegeben werden muss, ist `update()` deutlich effizienter, da die initiale `SELECT`-Abfrage entfällt:

```typescript
// Führt ein direktes UPDATE-Statement aus. Gibt die geänderte Zeile nicht zurück.
async updatePlaytime(id: string, newTime: number): Promise<void> {
  await this.boardgames.update(id, { playtimeMinutes: newTime });
}
```

Das Löschen ist mit dem Aufruf von `delete()` auf dem Repository unkompliziert:

```typescript
async deleteGame(id: string): Promise<void> {
  await this.boardgames.delete(id);
}
```

## Query Builder

Die Options-Objekt-Syntax (`find({ where: ... })`) eignet sich hervorragend für die große Mehrzahl der CRUD-Operationen. Sobald du jedoch komplexe JOINs ausführen, Zeilen gruppieren oder SQL-Aggregatfunktionen nutzen möchtest, stoßen die Standard-Repository-Methoden an ihre Grenzen.

Anstatt rohe, untypisiierte SQL-Strings zu schreiben, wechselst du zum Query Builder von TypeORM:

```typescript
async getAverageComplexity(): Promise<number> {
  const result = await this.boardgames
    .createQueryBuilder("bg")
    .select("AVG(bg.complexity)", "average")
    .getRawOne();

  return parseFloat(result.average);
}
```

Der Query Builder übersetzt deine verketteten Methodenaufrufe in einen optimierten SQL-String. Beachte die bewusste Verwendung von Aliasen (`"bg"`). Du skizzierst die Abfragestruktur explizit und behältst die vollständige Kontrolle über den Ausführungsplan – während du gleichzeitig Schutz vor SQL-Injection erhältst.