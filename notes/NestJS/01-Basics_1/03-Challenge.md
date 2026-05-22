# NestJS – Aufgabe: Quote API

Baue eine NestJS-Anwendung, die Zitate aus einem statischen Datensatz bereitstellt.

## Anforderungen

- NestJS mit einem Controller, einem Service und einem Module verwenden
- `GET /quotes` gibt alle Zitate zurück
- `GET /quotes/random` gibt ein zufällig ausgewähltes Zitat zurück

Der Service hält und verwaltet die Zitatdaten. Der Controller verarbeitet die Routen und ruft den Service auf. Beide werden im Root-Module registriert.

## Seed-Daten

```json
[
  { "id": 1, "quote": "The only way to do great work is to love what you do.", "author": "Steve Jobs" },
  { "id": 2, "quote": "Be the change that you wish to see in the world.", "author": "Mahatma Gandhi" },
  { "id": 3, "quote": "Innovation distinguishes between a leader and a follower.", "author": "Steve Jobs" },
  { "id": 4, "quote": "The future belongs to those who believe in the beauty of their dreams.", "author": "Eleanor Roosevelt" },
  { "id": 5, "quote": "Strive not to be a success, but rather to be of value.", "author": "Albert Einstein" },
  { "id": 6, "quote": "Life is what happens when you're busy making other plans.", "author": "John Lennon" },
  { "id": 7, "quote": "The only impossible journey is the one you never begin.", "author": "Tony Robbins" },
  { "id": 8, "quote": "The mind is everything. What you think you become.", "author": "Buddha" },
  { "id": 9, "quote": "Believe you can and you're halfway there.", "author": "Theodore Roosevelt" },
  { "id": 10, "quote": "The best way to predict the future is to create it.", "author": "Peter Drucker" }
]
```

## Optional

- Einen Query-Parameter `GET /quotes?author=<name>` hinzufügen, um Zitate nach Autor zu filtern
- Ein einfaches HTML/CSS/Vanilla-JS-Frontend bauen, das Zitate abruft und anzeigt

---

## Lösung

### Projektstruktur

```
src/
├── quotes/
│   ├── quotes.controller.ts
│   ├── quotes.service.ts
│   └── quotes.module.ts
├── app.module.ts
└── main.ts
```

---

### `quotes.service.ts`

Der Service hält die Daten und stellt Methoden bereit, um sie abzufragen. Er ist mit `@Injectable()` markiert, damit NestJS ihn in den DI-Container aufnimmt.

```ts
import { Injectable } from '@nestjs/common';

interface Quote {
  id: number;
  quote: string;
  author: string;
}

const QUOTES: Quote[] = [
  { id: 1,  quote: "The only way to do great work is to love what you do.",              author: "Steve Jobs" },
  { id: 2,  quote: "Be the change that you wish to see in the world.",                   author: "Mahatma Gandhi" },
  { id: 3,  quote: "Innovation distinguishes between a leader and a follower.",           author: "Steve Jobs" },
  { id: 4,  quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { id: 5,  quote: "Strive not to be a success, but rather to be of value.",             author: "Albert Einstein" },
  { id: 6,  quote: "Life is what happens when you're busy making other plans.",           author: "John Lennon" },
  { id: 7,  quote: "The only impossible journey is the one you never begin.",             author: "Tony Robbins" },
  { id: 8,  quote: "The mind is everything. What you think you become.",                  author: "Buddha" },
  { id: 9,  quote: "Believe you can and you're halfway there.",                           author: "Theodore Roosevelt" },
  { id: 10, quote: "The best way to predict the future is to create it.",                 author: "Peter Drucker" },
];

@Injectable()
export class QuotesService {
  // Gibt alle Zitate zurück – optional gefiltert nach Autor
  findAll(author?: string): Quote[] {
    if (author) {
      return QUOTES.filter(q =>
        q.author.toLowerCase().includes(author.toLowerCase())
      );
    }
    return QUOTES;
  }

  // Gibt ein zufälliges Zitat zurück
  findRandom(): Quote {
    const index = Math.floor(Math.random() * QUOTES.length);
    return QUOTES[index];
  }
}
```

---

### `quotes.controller.ts`

Der Controller definiert die Routen und delegiert die Logik an den Service. NestJS injiziert den `QuotesService` automatisch über den Konstruktor.

```ts
import { Controller, Get, Query } from '@nestjs/common';
import { QuotesService } from './quotes.service';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  // GET /quotes
  // GET /quotes?author=Jobs
  @Get()
  findAll(@Query('author') author?: string) {
    return this.quotesService.findAll(author);
  }

  // GET /quotes/random
  // Muss VOR einer eventuellen :id-Route stehen, damit NestJS
  // "random" nicht als ID-Parameter interpretiert
  @Get('random')
  findRandom() {
    return this.quotesService.findRandom();
  }
}
```

> **Reihenfolge der Routen:** `GET /quotes/random` muss vor `GET /quotes/:id` deklariert werden. NestJS matcht Routen in der Reihenfolge ihrer Deklaration – käme `:id` zuerst, würde `"random"` als ID interpretiert.

---

### `quotes.module.ts`

Das Module gruppiert Controller und Service und macht sie füreinander zugänglich.

```ts
import { Module } from '@nestjs/common';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';

@Module({
  controllers: [QuotesController],
  providers: [QuotesService],
})
export class QuotesModule {}
```

---

### `app.module.ts`

Das Root-Module importiert das `QuotesModule`.

```ts
import { Module } from '@nestjs/common';
import { QuotesModule } from './quotes/quotes.module';

@Module({
  imports: [QuotesModule],
})
export class AppModule {}
```

---

### `main.ts`

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // CORS aktivieren, damit das HTML-Frontend die API aufrufen kann
  app.enableCors();
  await app.listen(3000);
  console.log('Server läuft auf http://localhost:3000');
}
bootstrap();
```

---

## Optional: HTML-Frontend

Ein einfaches Frontend, das alle Zitate lädt, ein zufälliges Zitat anzeigt und nach Autor filtern kann.

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Zitate</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: Georgia, serif;
      background: #f5f0e8;
      color: #2c2c2c;
      min-height: 100vh;
      padding: 2rem;
    }

    h1 { font-size: 2rem; margin-bottom: 1.5rem; }

    .controls {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1rem;
      width: 220px;
    }

    button {
      padding: 0.5rem 1rem;
      background: #2c2c2c;
      color: #f5f0e8;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    button:hover { background: #444; }

    .random-box {
      background: #2c2c2c;
      color: #f5f0e8;
      border-radius: 6px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      max-width: 640px;
    }

    .random-box p { font-size: 1.1rem; line-height: 1.6; margin-bottom: 0.5rem; }
    .random-box span { font-size: 0.85rem; opacity: 0.7; }

    .quote-list { display: flex; flex-direction: column; gap: 1rem; max-width: 640px; }

    .quote-card {
      background: #fff;
      border-left: 4px solid #2c2c2c;
      padding: 1rem 1.25rem;
      border-radius: 0 6px 6px 0;
    }

    .quote-card p { font-size: 1rem; line-height: 1.6; margin-bottom: 0.4rem; }
    .quote-card span { font-size: 0.8rem; color: #666; }

    #status { color: #888; font-style: italic; }
  </style>
</head>
<body>
  <h1>Zitate</h1>

  <div class="controls">
    <button onclick="loadRandom()">Zufälliges Zitat</button>
    <input id="authorInput" type="text" placeholder="Nach Autor filtern…">
    <button onclick="loadByAuthor()">Filtern</button>
    <button onclick="loadAll()">Alle anzeigen</button>
  </div>

  <div id="random-section" class="random-box" style="display:none">
    <p id="random-quote"></p>
    <span id="random-author"></span>
  </div>

  <div class="quote-list" id="quote-list"></div>
  <p id="status"></p>

  <script>
    const API = 'http://localhost:3000';

    async function loadAll() {
      await fetchQuotes('/quotes');
    }

    async function loadRandom() {
      const res = await fetch(`${API}/quotes/random`);
      const q = await res.json();
      document.getElementById('random-quote').textContent = `"${q.quote}"`;
      document.getElementById('random-author').textContent = `— ${q.author}`;
      document.getElementById('random-section').style.display = 'block';
    }

    async function loadByAuthor() {
      const author = document.getElementById('authorInput').value.trim();
      await fetchQuotes(author ? `/quotes?author=${encodeURIComponent(author)}` : '/quotes');
    }

    async function fetchQuotes(path) {
      document.getElementById('status').textContent = 'Lädt…';
      document.getElementById('random-section').style.display = 'none';
      const res = await fetch(`${API}${path}`);
      const quotes = await res.json();
      const list = document.getElementById('quote-list');
      list.innerHTML = '';

      if (quotes.length === 0) {
        document.getElementById('status').textContent = 'Keine Zitate gefunden.';
        return;
      }

      document.getElementById('status').textContent = '';
      quotes.forEach(q => {
        const card = document.createElement('div');
        card.className = 'quote-card';
        card.innerHTML = `<p>"${q.quote}"</p><span>— ${q.author}</span>`;
        list.appendChild(card);
      });
    }

    // Beim Start alle Zitate laden
    loadAll();
  </script>
</body>
</html>
```

---

## Zusammenfassung: Was das Muster zeigt

| Klasse | Decorator | Aufgabe |
|---|---|---|
| `QuotesService` | `@Injectable()` | Daten halten, Logik kapseln |
| `QuotesController` | `@Controller('quotes')` | Routen definieren, Service aufrufen |
| `QuotesModule` | `@Module(...)` | Beide registrieren und gruppieren |

Der Controller weiß nicht, wie der Service seine Daten verwaltet. Der Service weiß nicht, über welche HTTP-Route er aufgerufen wird. NestJS verbindet beide – das ist Dependency Injection in der Praxis.