# 🚀 Das ultimative NestJS-Feature-Playbook

1. 📂 CLI: Modul, Service, Controller generieren (`nest g...`)
2. 🗄️ DATABASE: Entity schreiben und im Modul via `TypeOrmModule.forFeature()` registrieren
3. 🗺️ MIGRATION: `npm run migration:generate` + `run` ausführen, um die DB-Tabelle zu erstellen
4. 📥 IN-BOUND: Request-DTOs schreiben (Validierung für POST/PATCH/Queries)
5. 📤 OUT-BOUND: Response-DTOs schreiben (Sicherung mit `@Expose()` und `@Exclude()`)
6. ⚙️ SERVICE: Business-Logik implementieren & Daten am Ende mit `plainToInstance` mappen
7. 🚦 CONTROLLER: Endpunkte definieren, Pipes (`ParseUUIDPipe`, `ParseIntPipe`) anwenden, Guards anhängen und DTOs als Typen eintragen


# Fahrplan für das NestJS-Projekt

# Teil1
Hier ist ein strukturierter Fahrplan, wie du am besten vorgehst:

## Schritt 1: Das Projekt aufsetzen und Module generieren

Nutze am besten die NestJS CLI im Terminal. Sie nimmt dir das manuelle Anlegen von Dateien und das Importieren in das AppModule komplett ab.

### Neues Projekt erstellen (falls noch nicht geschehen)

```bash
nest new cyber-chat
```

### Die beiden Module generieren

```bash
nest generate module threads
nest generate module comments
```

Hinweis: Dadurch werden die Module automatisch im AppModule registriert.

## Schritt 2: Typen und Repositories (Datenhaltung)

Bevor Code geschrieben wird, müssen die Datenstrukturen stehen. Da die Daten im Arbeitsspeicher (`Map`) liegen sollen, fangen wir mit den Repositories an.

### Typen/Interfaces anlegen

Erstelle dir die Typen für `Thread` und `Comment` (entweder in eigenen Dateien oder direkt bei den Repositories). Achtung bei der `Map`: In der Aufgabe steht `Map<string, Thread>`, aber die `id` im Typ ist ein `number`. Du kannst die ID beim Speichern in der `Map` einfach mit `.toString()` umwandeln oder als Key nutzen.

### Repositories erstellen

Nutze wieder die CLI, um die Provider zu erstellen:

```bash
nest generate provider threads/threads.repository --flat
nest generate provider comments/comments.repository --flat
```

Das `--flat` verhindert, dass Nest ein extra Unterverzeichnis für den Provider anlegt.

### Logik in die Repositories einbauen

- Setze `@Injectable()` über die Klassen.
- Definiere die private `Map` innerhalb der Klasse, z. B. `private threads = new Map<number, Thread>();` und einen `private currentId = 1;`-Counter zum Hochzählen der IDs.
- Schreibe einfache Methoden wie `create()`, `findAll()`, `findById(id)` und `delete(id)`.

## Schritt 3: Services (Business-Logik)

Die Services vermitteln später zwischen Controller und Repository. Hier wird die Logik implementiert, zum Beispiel wann ein Kommentar wirklich gelöscht wird oder wann nur der Text überschrieben wird.

### Services generieren

```bash
nest generate service threads
nest generate service comments
```

### Dependency Injection einrichten

Injiziere das jeweilige Repository über den Constructor des Services:

```js
// threads.service.js
constructor(private readonly threadsRepository: ThreadsRepository) {}
```

### Verknüpfung für die Route `GET /threads/:id`

Der `ThreadsService` muss für diese Route auch die Kommentare zu einem Thread einsammeln. Das bedeutet: Der `ThreadsService` benötigt Zugriff auf das `CommentsRepository` oder den `CommentsService`.

Wichtig: Damit der `ThreadsService` das nutzen kann, musst du das `CommentsRepository` oder den Service im `CommentsModule` exportieren (`exports: [...]`) und das `CommentsModule` im `ThreadsModule` importieren.

## Schritt 4: Controller (Endpunkte)

Wenn die Services die Daten liefern können, baust du die Schnittstellen nach außen.

### Controller generieren

```bash
nest generate controller threads
nest generate controller comments
```

### Constructor Injection

Injiziere die Services in die Controller.

### Routen mappen

Nutze die NestJS-Dekoratoren `@Post()`, `@Get()`, `@Delete()`, `@Param('id')` und `@Body()`, um die verlangten Routen exakt so abzubilden, wie in der Tabelle vorgegeben.

## Empfohlene Reihenfolge für die Implementierung der Features

Es deprimiert, alles auf einmal zu bauen und am Ende 20 Fehler zu suchen. Bringe die Endpunkte lieber einen nach dem anderen zum Laufen:

1. Thread erstellen und alle Threads anzeigen (`POST /threads` und `GET /threads`). Wenn das klappt, steht dein Grundgerüst.
2. Einzelnen Thread anzeigen (`GET /threads/:id`) – erst mal ohne Kommentare.
3. Bonusaufgabe direkt einbauen: Wenn der Thread bei `/:id` nicht existiert, wirf hier direkt die Nest-eigene Exception:

```js
throw new NotFoundException('Thread nicht gefunden');
```

4. Kommentare hinzufügen und anzeigen (`POST /threads/:id/comments`). Jetzt erweiterst du auch das `GET /threads/:id`, sodass es die passenden Kommentare aus dem `CommentsRepository` filtert und mitsendet.
5. Lösch-Logik einbauen: Erst das echte Löschen des Threads inklusive seiner Kommentare, danach den Sonderfall für das „Soft-Delete“ des einzelnen Kommentars (`body = "deleted"`).

## Wie testest du das Ganze?

Da du kein Frontend hast, installiere dir ein Tool wie Postman, Insomnia oder nutze die REST Client Extension in VS Code, um HTTP-Requests an `http://localhost:3000/threads` zu senden.


# Teil 2
# Cyber Chat – TypeORM Integration: Schritt-für-Schritt-Anleitung

## Schritt 1: Abhängigkeiten installieren

Als Erstes müssen wir TypeORM und den SQLite-Treiber in dein Projekt holen. Öffne dein Terminal im Projektordner und führe aus:

```bash
npm install @nestjs/typeorm typeorm sqlite3
```

## Schritt 2: TypeORM im AppModule konfigurieren

Öffne deine `src/app.module.ts`. Hier importieren wir das `TypeOrmModule` und konfigurieren es für SQLite.

Für den Anfang nutzen wir `synchronize: true` (wie in Schritt 1 & 2 der Aufgabe angedeutet). Sobald alles läuft, können wir uns an die Bonusaufgabe (Schritt 4) mit den Migrationen wagen.

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThreadsModule } from './threads/threads.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'cyber_chat.sqlite', // Name der DB-Datei, die im Root-Verzeichnis erstellt wird
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Sucht automatisch nach all deinen Entities
      synchronize: true, // Erstellt Tabellen automatisch (für die Entwicklung super)
    }),
    ThreadsModule,
    CommentsModule,
  ],
})
export class AppModule {}
```

## Schritt 3: Die Entities erstellen (Datenmodellierung)

Deine alten Interfaces/Klassen werfen wir nicht weg, sondern bauen sie zu echten TypeORM-Entities um. Wichtig ist hier die 1:n-Beziehung (Ein Thread hat viele Kommentare, ein Kommentar gehört zu genau einem Thread).

### 1. Die Thread-Entity (`src/threads/entities/thread.entity.ts`)

Erstelle diese Datei. Wir nutzen `@PrimaryGeneratedColumn('uuid')` für den verlangten UUID-Schlüssel.

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Comment } from '../../comments/entities/comment.entity';

@Entity('threads')
export class Thread {
  @PrimaryGeneratedColumn('uuid') // Generiert automatisch eine einzigartige UUID-Zeichenkette
  id: string;

  @Column()
  title: string;

  @Column('text') // Ein Textfeld für längere Beiträge
  body: string;

  @Column()
  author: string;

  @CreateDateColumn() // Wird von TypeORM automatisch mit dem aktuellen Datum befüllt
  createdAt: Date;

  // Relation: Ein Thread hat viele Kommentare.
  // Das erste Argument verweist auf die Comment-Entity, das zweite auf die Gegenstelle im Kommentar.
  @OneToMany(() => Comment, (comment) => comment.thread, { cascade: true })
  comments: Comment[];
}
```

### 2. Die Comment-Entity (`src/comments/entities/comment.entity.ts`)

Hier nutzen wir `@ManyToOne`, um die Verbindung zurück zum Thread aufzubauen. Wenn ein Thread gelöscht wird, sollen seine Kommentare mitgelöscht werden (`onDelete: 'CASCADE'`).

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Thread } from '../../threads/entities/thread.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn() // Normale fortlaufende ID (1, 2, 3...) für Kommentare
  id: number;

  @Column()
  author: string;

  @Column('text')
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relation: Viele Kommentare gehören zu einem Thread.
  @ManyToOne(() => Thread, (thread) => thread.comments, { onDelete: 'CASCADE' })
  thread: Thread;
}
```

## Schritt 4: Module für TypeORM vorbereiten

Damit du die Repositories in deinen Services injizieren kannst, müssen die Module wissen, welche Entities sie verwalten.

### `src/threads/threads.module.ts` anpassen:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThreadsController } from './threads.controller';
import { ThreadsService } from './threads.service';
import { Thread } from './entities/thread.entity';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Thread]), // Macht das TypeORM-Repository für Thread hier verfügbar
    CommentsModule,
  ],
  controllers: [ThreadsController],
  providers: [ThreadsService], // <-- Dein altes ThreadsRepository wird hier gelöscht!
})
export class ThreadsModule {}
```

### `src/comments/comments.module.ts` anpassen:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment])], // Macht das Repository für Comment verfügbar
  controllers: [CommentsController],
  providers: [CommentsService], // <-- Altes CommentsRepository löschen!
  exports: [CommentsService, TypeOrmModule], // TypeOrmModule exportieren, falls Threads darauf zugreifen muss
})
export class CommentsModule {}
```

## Schritt 5: Die Services refaktorisieren (Der Repository-Austausch)

Jetzt löschst du deine alten Dateien `threads.repository.ts` und `comments.repository.ts`. Deren Aufgaben übernehmen jetzt die generischen Repositories von TypeORM direkt in den Services.

### 1. Der neue ThreadsService

Dank TypeORM reduziert sich das Laden von Kommentaren auf ein einfaches `{ relations: ['comments'] }`. TypeORM übernimmt das SQL-Join im Hintergrund für dich!

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Thread } from './entities/thread.entity';

@Injectable()
export class ThreadsService {
  constructor(
    @InjectRepository(Thread)
    private readonly threadRepository: Repository<Thread>, // TypeORM Repository injizieren
  ) {}

  async create(title: string, author: string, body: string): Promise<Thread> {
    const newThread = this.threadRepository.create({ title, author, body });
    return await this.threadRepository.save(newThread);
  }

  async findAll(): Promise<Thread[]> {
    return await this.threadRepository.find();
  }

  async findOneWithComments(id: string): Promise<Thread> {
    // relations sorgt dafür, dass das Array 'comments' direkt mitgeladen wird!
    const thread = await this.threadRepository.findOne({
      where: { id },
      relations: ['comments'],
    });

    if (!thread) {
      throw new NotFoundException(`Thread mit der ID ${id} existiert nicht.`);
    }

    return thread;
  }

  async delete(id: string): Promise<void> {
    const result = await this.threadRepository.delete(id);

    // Wenn betroffene Zeilen (affected) gleich 0 sind, gab es den Thread nicht
    if (result.affected === 0) {
      throw new NotFoundException(`Thread mit der ID ${id} existiert nicht.`);
    }
  }
}
```

### 2. Der neue CommentsService

Beim Erstellen eines Kommentars verknüpfen wir diesen ganz einfach, indem wir dem Kommentar-Objekt das geladene `thread`-Objekt zuweisen. Für das Soft-Delete nutzen wir das ganz normale `save`.

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Thread } from '../threads/entities/thread.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Thread)
    private readonly threadRepository: Repository<Thread>, // Wird gebraucht, um den Thread zu validieren
  ) {}

  async create(threadId: string, author: string, body: string): Promise<Comment> {
    // Erst prüfen, ob der Thread überhaupt existiert
    const thread = await this.threadRepository.findOne({ where: { id: threadId } });
    if (!thread) {
      throw new NotFoundException(`Thread mit der ID ${threadId} existiert nicht.`);
    }

    const newComment = this.commentRepository.create({
      author,
      body,
      thread, // Hier weisen wir die Relation direkt zu! TypeORM setzt die Fremdschlüssel-ID automatisch.
    });

    return await this.commentRepository.save(newComment);
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Kommentar mit der ID ${id} existiert nicht.`);
    }
    return comment;
  }

  async delete(id: number): Promise<void> {
    const comment = await this.findOne(id); // Wirft automatisch NotFoundException, wenn nicht da

    // Das verlangte Soft-Delete: Body auf "deleted" setzen
    comment.body = 'deleted';
    await this.commentRepository.save(comment);
  }
}
```

## Letzter wichtiger Schritt: Controller anpassen

Da IDs für die Threads jetzt UUIDs (Strings) sind und alle Datenbank-Operationen asynchron laufen (sie geben `Promise` zurück), musst du in deinen Controllern überall dort, wo du `Number(id)` genutzt hast, das Ganze entfernen bzw. anpassen:

- Im `ThreadsController` bleibt die `id` beim Param ein `string`. Übergib sie einfach direkt (ohne `Number()`) an den Service.
- Da die Methoden nun asynchron sind, setze am besten ein `async` vor die Controller-Methoden und ein `await` vor die Service-Aufrufe (oder überlass NestJS das Auflösen der Promises – NestJS kann das nämlich auch automatisch, wenn du das Promise direkt zurückgibst!).

# Teil 3

# Cyber Chat – DTOs, Serialisierung & Paginierung

Mit DTOs (Data Transfer Objects), dem `ClassSerializerInterceptor` und Paginierung bauen wir jetzt eine unüberwindbare Mauer zwischen deiner Datenbank und der Außenwelt.

Bevor wir loslegen, müssen wir drei kleine Pakete installieren, damit wir die Validierungen und DTO-Transformationen nutzen können. Schalte kurz deinen Server aus und installiere sie im Terminal:

```bash
npm install class-validator class-transformer @nestjs/mapped-types
```

Lass uns das Schritt für Schritt durchgehen. Da die Änderungen eng miteinander verzahnt sind, fangen wir mit der globalen Konfiguration an und arbeiten uns dann durch die DTOs, Services und Controller.

## 1. Die globale Basis: `main.ts`

Hier richten wir die `ValidationPipe` (für die Request-Grenze) und den `ClassSerializerInterceptor` (für die Response-Grenze) global ein.

Ersetze den Inhalt deiner `src/main.ts` durch Folgendes:

```typescript
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Die Request-Grenze: Strikte Validierung & Whitelisting
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,                  // Filtert alle nicht im DTO definierten Properties heraus
      forbidNonWhitelisted: true,       // Wirft einen 400 Fehler, wenn unbekannte Felder geschickt werden
      transform: true,                  // Konvertiert Payloads automatisch in die DTO-Klasseninstanzen
      transformOptions: {
        enableImplicitConversion: true, // Erlaubt implizite Konvertierung (z.B. String zu Number bei query params)
      },
    }),
  );

  // 2. Die Response-Grenze: Exkludiert alle Felder, die nicht im Response-DTO stehen
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,    // Nur Felder mit @Expose() werden serialisiert!
    }),
  );

  await app.listen(3000);
}
bootstrap();
```

## 2. Die DTOs (Request & Response)

Jetzt legen wir fest, was reinkommen darf und was rausgehen darf.

### Für die Threads

Erstelle einen Ordner `src/threads/dto/`.

**`src/threads/dto/create-thread.dto.ts`:**

```typescript
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateThreadDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50, { message: 'Der Titel muss zwischen 3 und 50 Zeichen lang sein.' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 2000, { message: 'Der Text muss zwischen 10 und 2000 Zeichen lang sein.' })
  body: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 30, { message: 'Der Autorenname muss zwischen 2 und 30 Zeichen lang sein.' })
  author: string;
}
```

**`src/threads/dto/update-thread.dto.ts`:**

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateThreadDto } from './create-thread.dto';

// Erbt alle Regeln von CreateThreadDto, macht sie aber optional (?) für PATCH
export class UpdateThreadDto extends PartialType(CreateThreadDto) {}
```

**`src/threads/dto/thread-response.dto.ts`:**

```typescript
import { Expose, Type } from 'class-transformer';
import { CommentResponseDto } from '../../comments/dto/comment-response.dto';

export class ThreadResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  body: string;

  @Expose()
  author: string;

  @Expose()
  @Type(() => Date) // Erzwingt die Serialisierung als echtes Date-Objekt
  createdAt: Date;

  @Expose()
  @Type(() => CommentResponseDto) // Verschachtelte Serialisierung für die Kommentare
  comments?: CommentResponseDto[];
}
```

### Für die Kommentare

Erstelle einen Ordner `src/comments/dto/`.

**`src/comments/dto/create-comment.dto.ts`:**

```typescript
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 30, { message: 'Der Autorenname muss zwischen 2 und 30 Zeichen lang sein.' })
  author: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 1000, { message: 'Der Kommentar darf nicht leer sein und maximal 1000 Zeichen lang sein.' })
  body: string;
}
```

**`src/comments/dto/comment-response.dto.ts`:**

```typescript
import { Expose, Type } from 'class-transformer';

export class CommentResponseDto {
  @Expose()
  id: number;

  @Expose()
  author: string;

  @Expose()
  body: string;

  @Expose()
  @Type(() => Date)
  createdAt: Date;
}
```

### Die Paginierung & Filterung (inklusive Bonus)

Erstelle `src/threads/dto/pagination-query.dto.ts`:

```typescript
import { IsInt, IsMin, IsMax, IsOptional, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @IsMin(1)
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @IsMin(1)
  @IsMax(100)
  @Type(() => Number)
  limit: number = 10;

  // BONUS: Sortierung
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', '-createdAt'], { message: 'Sortierung darf nur "createdAt" oder "-createdAt" sein.' })
  sort: string = '-createdAt'; // Standard: Neueste zuerst

  // BONUS: Filterung nach Autor
  @IsOptional()
  @IsString()
  author?: string;
}
```

## 3. Die Services (Business-Logik mit Mapping)

Die Services nutzen jetzt `plainToInstance`, um sicherzustellen, dass niemals eine rohe Entity den Service verlässt.

### `src/threads/threads.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Thread } from './entities/thread.entity';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { ThreadResponseDto } from './dto/thread-response.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ThreadsService {
  constructor(
    @InjectRepository(Thread)
    private readonly threadRepository: Repository<Thread>,
  ) {}

  async create(dto: CreateThreadDto): Promise<ThreadResponseDto> {
    const newThread = this.threadRepository.create(dto);
    const saved = await this.threadRepository.save(newThread);
    return plainToInstance(ThreadResponseDto, saved);
  }

  async findAll(query: PaginationQueryDto) {
    const { page, limit, sort, author } = query;
    const skip = (page - 1) * limit;

    // Sortierung aufbröseln (Bonus)
    const orderDirection = sort.startsWith('-') ? 'DESC' : 'ASC';

    // Filter setzen (Bonus)
    const whereCondition: any = {};
    if (author) {
      whereCondition.author = author;
    }

    const [entities, total] = await this.threadRepository.findAndCount({
      where: whereCondition,
      order: { createdAt: orderDirection },
      take: limit,
      skip: skip,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: plainToInstance(ThreadResponseDto, entities),
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findOneWithComments(id: string): Promise<ThreadResponseDto> {
    const thread = await this.threadRepository.findOne({
      where: { id },
      relations: ['comments'],
    });

    if (!thread) {
      throw new NotFoundException(`Thread mit der ID ${id} existiert nicht.`);
    }

    return plainToInstance(ThreadResponseDto, thread);
  }

  async update(id: string, dto: UpdateThreadDto): Promise<ThreadResponseDto> {
    const thread = await this.threadRepository.preload({
      id: id,
      ...dto,
    });

    if (!thread) {
      throw new NotFoundException(`Thread mit der ID ${id} existiert nicht.`);
    }

    const saved = await this.threadRepository.save(thread);
    return plainToInstance(ThreadResponseDto, saved);
  }

  async delete(id: string): Promise<void> {
    const result = await this.threadRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Thread mit der ID ${id} existiert nicht.`);
    }
  }
}
```

### `src/comments/comments.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comments.entity';
import { Thread } from '../threads/entities/thread.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Thread)
    private readonly threadRepository: Repository<Thread>,
  ) {}

  async create(threadId: string, dto: CreateCommentDto): Promise<CommentResponseDto> {
    const thread = await this.threadRepository.findOne({ where: { id: threadId } });
    if (!thread) {
      throw new NotFoundException(`Thread mit der ID ${threadId} existiert nicht.`);
    }

    const newComment = this.commentRepository.create({
      ...dto,
      thread,
    });

    const saved = await this.commentRepository.save(newComment);
    return plainToInstance(CommentResponseDto, saved);
  }

  async findOne(id: number): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Kommentar mit der ID ${id} existiert nicht.`);
    }
    return plainToInstance(CommentResponseDto, comment);
  }

  async delete(id: number): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Kommentar mit der ID ${id} existiert nicht.`);
    }

    comment.body = 'deleted';
    await this.commentRepository.save(comment);
  }
}
```

## 4. Die Bonus-Custom-Pipe (`ParseDatePipe`)

Für den Bonus-Punkt bauen wir eine eigene Pipe, die einen Query-Parameter validiert und in ein echtes `Date` umwandelt.

Erstelle eine Datei `src/common/pipes/parse-date.pipe.ts`:

```typescript
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date | undefined> {
  transform(value: string): Date | undefined {
    if (!value) {
      return undefined;
    }

    const timestamp = Date.parse(value);
    if (isNaN(timestamp)) {
      throw new BadRequestException(`"${value}" ist kein gültiges Datumsformat (nutze z.B. YYYY-MM-DD).`);
    }

    return new Date(timestamp);
  }
}
```

## 5. Die Controller (Schnittstellen-Sicherung)

Jetzt binden wir alles zusammen, nutzen die `ParseUUIDPipe` für die IDs und statten die Delete-Handler mit dem korrekten HTTP-Statuscode aus.

### `src/threads/threads.controller.ts`

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ThreadsService } from "./threads.service";
import { CommentsService } from "../comments/comments.service";
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { ParseDatePipe } from '../common/pipes/parse-date.pipe';

@Controller('threads')
export class ThreadsController {
    constructor(
        private readonly threadService: ThreadsService,
        private readonly commentsService: CommentsService
    ) {}

    @Get()
    async getAll(
        @Query() paginationQuery: PaginationQueryDto,
        @Query('startDate', ParseDatePipe) startDate?: Date // BONUS: Custom Pipe Anwendung
    ) {
        // Hinweis: startDate könnte man jetzt in der Service-Filterung einbauen!
        if (startDate) {
            console.log("Filtere ab Datum:", startDate.toISOString());
        }
        return await this.threadService.findAll(paginationQuery);
    }

    @Post()
    async create(@Body() createThreadDto: CreateThreadDto) {
        return await this.threadService.create(createThreadDto);
    }

    @Get(":id")
    async getOne(@Param('id', ParseUUIDPipe) id: string) { // Strikte UUID-Validierung!
        return await this.threadService.findOneWithComments(id);
    }

    @Patch(":id")
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateThreadDto: UpdateThreadDto
    ) {
        return await this.threadService.update(id, updateThreadDto);
    }

    @Post(":id/comments")
    async saveComment(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() createCommentDto: CreateCommentDto
    ) {
        return await this.commentsService.create(id, createCommentDto);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
    async delete(@Param('id', ParseUUIDPipe) id: string) {
        await this.threadService.delete(id);
    }
}
```

### `src/comments/comments.controller.ts`

```typescript
import { Controller, Get, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CommentsService } from "./comments.service";

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @Get(":id")
    async getOne(@Param('id') id: string) {
        return await this.commentsService.findOne(Number(id));
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
    async delete(@Param('id') id: string) {
        await this.commentsService.delete(Number(id));
    }
}
```

## Warum ist deine API jetzt absolut „bulletproof"?

- **Keine Datenlecks (Entity-Lecks):** Wenn du morgen in deiner `Thread`-Entity ein Feld wie `internalNotes` hinzufügst, wird dieses Feld ignoriert, weil es im `ThreadResponseDto` fehlt. `excludeExtraneousValues: true` in der `main.ts` filtert es radikal heraus.

- **Whitelisting schützt dich:** Schickt jemand via POST `{ "title": "...", "hack": "attack" }`, schlägt die `ValidationPipe` dank `forbidNonWhitelisted` sofort Alarm und verweigert die Verarbeitung mit einem `400 Bad Request`.

- **Paginierung schützt die Server-Performance:** Wenn du Millionen Threads hättest, holt `findAndCount` mit `take` und `skip` immer nur die angeforderte „Häppchengröße" (Standard 10) aus SQLite.

Starte deinen Server wieder mit `npm run start:dev` und jage deine Test-Requests durch. Du wirst sehen, dass sich die Fehlerbehandlung und die JSON-Antworten jetzt absolut professionell verhalten!


# Teil 4

# Cyber Chat – JWT-Authentifizierung: Schritt-für-Schritt-Anleitung

Da wir die sauberste Architektur bevorzugen, setzen wir den Tipp aus Aufgabe 3 direkt um: Wir registrieren den `JwtAuthGuard` global, damit standardmäßig alle Routen gesperrt sind, und schalten Login und Registrierung gezielt mit einem eigenen `@Public()`-Dekorator frei.

Schalte deinen Server kurz aus und installiere die benötigten Pakete:

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local bcrypt @nestjs/config
npm install -D @types/passport-jwt @types/passport-local @types/bcrypt
```

> **Hinweis:** Falls du `@nestjs/config` noch nicht im Projekt hast, sorgt es dafür, dass wir das JWT-Secret sicher aus einer `.env`-Datei lesen können.

## Schritt 1: Der `@Public()`-Dekorator & Globale Absicherung

Erstelle eine Datei `src/auth/decorators/public.decorator.ts`:

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Erstelle die Datei `src/auth/guards/jwt-auth.guard.ts`:

```typescript
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true; // Lässt öffentliche Routen (wie Register/Login) durch
    }
    return super.canActivate(context); // Prüft das JWT für alle anderen Routen
  }
}
```

## Schritt 2: Das Users-Modul (Datenbasis)

### 1. Die Entity (`src/users/entities/user.entity.ts`)

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude() // Verhindert, dass der Passwort-Hash jemals in JSON-Antworten auftaucht!
  passwordHash: string;
}
```

### 2. Das DTO (`src/users/dto/create-user.dto.ts`)

```typescript
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6, { message: 'Das Passwort muss mindestens 6 Zeichen lang sein.' })
  password: string;
}
```

### 3. Der Service (`src/users/users.service.ts`)

```typescript
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { username: dto.username } });
    if (existing) {
      throw new ConflictException('Dieser Benutzername ist bereits vergeben.');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const newUser = this.userRepository.create({
      username: dto.username,
      passwordHash,
    });

    return await this.userRepository.save(newUser);
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }
}
```

### 4. Das Modul (`src/users/users.module.ts`)

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService], // Wichtig für das AuthModule!
})
export class UsersModule {}
```

## Schritt 3: Das Auth-Modul (Strategien & Token-Ausstellung)

Wir legen ein sicheres Secret fest. Erstelle im Hauptverzeichnis deines Projekts (neben der `package.json`) eine `.env`-Datei:

```
JWT_SECRET=SuperGeheimesCyberChatSecret1337!
```

### 1. Die Local-Strategie (`src/auth/strategies/local.strategy.ts`)

```typescript
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super(); // Nutzt standardmäßig 'username' und 'password' aus dem Body
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Ungültige Anmeldedaten.');
    }
    return user; // Wird an req.user angehängt
  }
}
```

### 2. Die JWT-Strategie (`src/auth/strategies/jwt.strategy.ts`)

```typescript
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback',
    });
  }

  async validate(payload: any) {
    // Das hier extrahiert die Daten aus dem JWT-Payload und packt sie in req.user
    return { userId: payload.sub, username: payload.username };
  }
}
```

### 3. Der Service (`src/auth/auth.service.ts`)

```typescript
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
```

### 4. Der Controller (`src/auth/auth.controller.ts`)

```typescript
import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public() // Route ist ungeschützt
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Public() // Route ist ungeschützt
  @UseGuards(AuthGuard('local')) // Aktiviert die LocalStrategy zur Passwort-Prüfung
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('me') // Automatisch geschützt durch den globalen Guard!
  getProfile(@Request() req) {
    return req.user;
  }
}
```

### 5. Das Modul (`src/auth/auth.module.ts`)

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
```

## Schritt 4: Die Verknüpfung im AppModule & Globaler Guard

Wir müssen nun `ConfigModule`, `UsersModule` und `AuthModule` registrieren und den `JwtAuthGuard` als globalen Guard einbinden.

Passe deine `src/app.module.ts` so an:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThreadsModule } from './threads/threads.module';
import { CommentsModule } from './comments/comments.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Thread } from './threads/entities/thread.entity';
import { Comment } from './comments/entities/comments.entity';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Lädt die .env-Datei global
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'cyber_chat.sqlite',
      entities: [Thread, Comment, User], // User hinzugefügt
      synchronize: false,
      migrations: ['dist/migrations/*.js'],
    }),
    ThreadsModule,
    CommentsModule,
    UsersModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Macht die GESAMTE API standardmäßig dicht!
    },
  ],
})
export class AppModule {}
```

> **Wichtig:** Da wir eine neue Entity `User` haben, führe kurz ein neues `npm run migration:generate` und `npm run migration:run` aus – oder lösche kurz die SQLite-Datei, falls du lokal frisch testen willst!

## Schritt 5: Den Dummy-Autor durch `req.user` ersetzen (Aufgabe 4)

Jetzt kicken wir die Dummy-Autoren aus den Controllern. Wenn jemand eingeloggt ist, steht sein Name in `req.user.username`. Zudem stellen wir sicher, dass man nur eigene Beiträge löschen/ändern darf.

### Im ThreadsController (`src/threads/threads.controller.ts`)

Wir entfernen `@Body('author')` beim Erstellen. Der Autor wird direkt aus dem Request extrahiert!

```typescript
// Imports anpassen...
import { Request, UseGuards } from '@nestjs/common';

@Post()
async create(@Body() createThreadDto: CreateThreadDto, @Request() req) {
    // Wir setzen den Autorennamen direkt aus dem JWT-Token!
    createThreadDto.author = req.user.username;
    return await this.threadService.create(createThreadDto);
}

@Patch(":id")
async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateThreadDto: UpdateThreadDto,
    @Request() req
) {
    // Wir übergeben req.user.username an den Service, um Besitzrechte zu prüfen
    return await this.threadService.update(id, updateThreadDto, req.user.username);
}

@Delete(":id")
@HttpCode(HttpStatus.NO_CONTENT)
async delete(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.threadService.delete(id, req.user.username);
}

@Post(":id/comments")
async saveComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req
) {
    createCommentDto.author = req.user.username; // Auch hier: Autor aus JWT!
    return await this.commentsService.create(id, createCommentDto);
}
```

> **Hinweis:** Ändere im `CreateThreadDto` und `CreateCommentDto` das Feld `author` auf `@IsOptional()`, da es nicht mehr vom Client geschickt werden muss, sondern vom Server gesetzt wird.

### Absicherung im ThreadsService (`src/threads/threads.service.ts`)

```typescript
// ... bei update und delete den username abgleichen:
async update(id: string, dto: UpdateThreadDto, username: string): Promise<ThreadResponseDto> {
    const thread = await this.threadRepository.findOne({ where: { id } });
    if (!thread) throw new NotFoundException(`Thread nicht gefunden.`);

    if (thread.author !== username) {
        throw new ForbiddenException('Du darfst nur deine eigenen Threads bearbeiten.');
    }

    Object.assign(thread, dto);
    const saved = await this.threadRepository.save(thread);
    return plainToInstance(ThreadResponseDto, saved);
}

async delete(id: string, username: string): Promise<void> {
    const thread = await this.threadRepository.findOne({ where: { id } });
    if (!thread) throw new NotFoundException(`Thread nicht gefunden.`);

    if (thread.author !== username) {
        throw new ForbiddenException('Du darfst nur deine eigenen Threads löschen.');
    }

    await this.threadRepository.delete(id);
}
```

> `ForbiddenException` aus `@nestjs/common` importieren.

## So testest du es in deiner `.http`-Datei

```http
### 1. Einen neuen Account registrieren
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "username": "Melanie",
  "password": "superSafePassword123"
}

### 2. Einloggen
# Kopiere dir den extrahierten "access_token" aus der Antwort!
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "username": "Melanie",
  "password": "superSafePassword123"
}

### 3. Mein Profil abrufen (Benötigt das Token)
GET http://localhost:3000/auth/me
Authorization: Bearer <HIER-DEIN-ACCESS-TOKEN-EINSETZEN>

### 4. Einen Thread erstellen (Autor wird automatisch "Melanie")
POST http://localhost:3000/threads
Authorization: Bearer <HIER-DEIN-ACCESS-TOKEN-EINSETZEN>
Content-Type: application/json

{
  "title": "Sicherer Cyber Thread",
  "body": "Dieser Beitrag wurde komplett über JWT authentifiziert!"
}
```