# Backend SQL Vertiefung – SQL-Relationstypen

Sobald Daten auf mehrere Tabellen verteilt sind, stellt sich die Frage, wie diese Tabellen miteinander in Beziehung stehen. Nicht jede Beziehung hat dieselbe Form. Ein Autor hat genau ein Profil, ein Autor hat viele Blog-Einträge, und ein Blog-Eintrag kann viele Tags haben, die wiederum zu vielen Einträgen gehören. SQL bildet diese Muster mit drei Relationstypen ab: eins-zu-eins, eins-zu-viele und viele-zu-viele. Jeder wird über Fremdschlüssel umgesetzt, manchmal mit Hilfe einer dritten Tabelle. Die Form einer Beziehung bestimmt, wo der Fremdschlüssel gesetzt wird und ob überhaupt eine zusätzliche Tabelle benötigt wird.

---

## Eins-zu-eins

Eine Eins-zu-eins-Relation bedeutet, dass jede Zeile in Tabelle A mit höchstens einer Zeile in Tabelle B in Beziehung steht – und umgekehrt. Eine `authors`-Tabelle in Verbindung mit einer `author_profiles`-Tabelle ist ein typisches Beispiel: Jeder Autor hat höchstens ein Profil, und jedes Profil gehört genau einem Autor.

Um dies in SQL abzubilden, enthält eine der Tabellen einen Fremdschlüssel, der auf die andere verweist. Ein `UNIQUE`-Constraint auf der Fremdschlüsselspalte stellt sicher, dass die Relation eins-zu-eins bleibt:

```sql
CREATE TABLE author_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id INTEGER UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  FOREIGN KEY (author_id) REFERENCES authors(id)
);
```

Mit Beispieldaten:

**authors**

| id | name |
|---|---|
| 101 | Alice Chen |
| 102 | Bob Martinez |
| 103 | Carol Singh |

**author_profiles**

| id | author_id | bio | avatar_url |
|---|---|---|---|
| 1 | 101 | Likes databases. | alice.jpg |
| 2 | 103 | Writes about tooling. | carol.jpg |

Bob hat keine Profilzeile, was erlaubt ist, weil die Relation auf der Profilseite optional ist. Ein Join der beiden Tabellen über den Fremdschlüssel ergibt eine kombinierte Zeile pro Autor mit Profil:

```sql
SELECT authors.name, author_profiles.bio
FROM authors
INNER JOIN author_profiles ON authors.id = author_profiles.author_id;
```

| name | bio |
|---|---|
| Alice Chen | Likes databases. |
| Carol Singh | Writes about tooling. |

In der Praxis sind echte Eins-zu-eins-Relationen selten. Meistens können die beiden Tabellen einfach zu einer zusammengeführt werden. Das Muster taucht auf, wenn die sekundären Daten optional sind, seltener abgerufen werden oder anderen Zugriffsrechten unterliegen als die Haupttabelle.

---

## Eins-zu-viele

Eine Eins-zu-viele-Relation bedeutet, dass jede Zeile in Tabelle A mit vielen Zeilen in Tabelle B in Beziehung stehen kann, aber jede Zeile in Tabelle B mit genau einer Zeile in Tabelle A. Dies ist der häufigste Relationstyp in relationalen Datenbanken.

Ein Autor mit mehreren Blog-Einträgen ist das klassische Beispiel: Ein Autor hat viele Einträge, aber jeder Eintrag hat genau einen Autor. Der Fremdschlüssel liegt auf der „viele"-Seite, in diesem Fall `blog_entries.author_id`:

```sql
CREATE TABLE blog_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  author_id INTEGER NOT NULL,
  FOREIGN KEY (author_id) REFERENCES authors(id)
);
```

Mit Beispieldaten:

**blog_entries**

| id | title | author_id |
|---|---|---|
| 1 | Getting Started with SQL | 101 |
| 2 | Why I Love Postgres | 102 |
| 3 | Indexing Strategies | 101 |

Ein Join von `blog_entries` und `authors` über den Fremdschlüssel ergibt eine Zeile pro Blog-Eintrag, mit dem Autorennamen verknüpft:

```sql
SELECT authors.name, blog_entries.title
FROM blog_entries
INNER JOIN authors ON blog_entries.author_id = authors.id;
```

| name | title |
|---|---|
| Alice Chen | Getting Started with SQL |
| Bob Martinez | Why I Love Postgres |
| Alice Chen | Indexing Strategies |

Alice erscheint zweimal, weil sie zwei Einträge hat. Das Ergebnis hat eine Zeile pro Blog-Eintrag, nicht eine pro Autor.

---

## Viele-zu-viele

Eine Viele-zu-viele-Relation bedeutet, dass jede Zeile in Tabelle A mit vielen Zeilen in Tabelle B in Beziehung stehen kann – und umgekehrt. Blog-Einträge und Tags sind ein klassisches Beispiel: Ein Eintrag kann viele Tags haben, und ein Tag kann an viele Einträge angehängt sein.

Viele-zu-viele-Relationen in SQL-Datenbanken haben ein grundlegendes Problem: Eine Fremdschlüsselspalte kann pro Zeile nur einen einzigen Wert speichern. Um mehrere Entitäten aus Tabelle A und B miteinander zu verknüpfen, bedient man sich eines Tricks: einer neuen dritten Tabelle, die üblicherweise als **Junction Table** oder **Join Table** bezeichnet wird. Sie speichert alle paarweisen Verbindungen von A und B, indem sie jeweils die IDs der verknüpften Einträge enthält:

```sql
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE blog_entry_tags (
  blog_entry_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (blog_entry_id, tag_id),
  FOREIGN KEY (blog_entry_id) REFERENCES blog_entries(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);
```

Mit Beispieldaten:

**tags**

| id | name |
|---|---|
| 10 | beginner |
| 11 | databases |
| 12 | postgres |

**blog_entry_tags**

| blog_entry_id | tag_id |
|---|---|
| 1 | 10 |
| 1 | 11 |
| 2 | 11 |
| 2 | 12 |

Jede Zeile in `blog_entry_tags` repräsentiert eine Verbindung zwischen einem Blog-Eintrag und einem Tag. Der zusammengesetzte Primärschlüssel aus `(blog_entry_id, tag_id)` verhindert, dass dasselbe Paar zweimal vorkommt. Der eindeutige Bezeichner eines Eintrags ist hier also keine automatisch hochzählende Zahl, sondern die Kombination aus beiden gespeicherten IDs.

Um die Tags für jeden Blog-Eintrag abzurufen, werden drei Tabellen mit zwei `JOIN`-Anweisungen verknüpft:

```sql
SELECT blog_entries.title, tags.name
FROM blog_entries
INNER JOIN blog_entry_tags ON blog_entries.id = blog_entry_tags.blog_entry_id
INNER JOIN tags ON blog_entry_tags.tag_id = tags.id;
```

| title | name |
|---|---|
| Getting Started with SQL | beginner |
| Getting Started with SQL | databases |
| Why I Love Postgres | databases |
| Why I Love Postgres | postgres |

Das Ergebnis hat eine Zeile pro (Eintrag, Tag)-Paar – ein Eintrag mit mehreren Tags erscheint also mehrfach.

Das mag nach viel Aufwand für eine einzelne Datenbankbeziehung klingen. ORMs wie TypeORM, die später noch vorgestellt werden, helfen dabei, den Großteil der Arbeit rund um Viele-zu-viele-Beziehungen zu abstrahieren. Aber es ist wichtig zu verstehen, was dabei im Hintergrund passiert.

---

## Weiterführende Links

- [SQLite Fremdschlüssel](https://www.sqlite.org/foreignkeys.html)
- [Datenbankbeziehungen auf Wikipedia](https://de.wikipedia.org/wiki/Datenbankrelation)