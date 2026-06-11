# Backend SQL Vertiefung – SQL JOINs

Wenn eine Blog-Einträge-Tabelle eine `author_id` statt des Autorennamens direkt speichert, liefert eine einfache `SELECT * FROM blog_entries`-Abfrage die ID, aber nicht den Namen. Um den Autorennamen neben jedem Beitrag anzuzeigen, werden Daten aus zwei Tabellen gleichzeitig benötigt. Ein `JOIN` kombiniert Zeilen aus mehreren Tabellen anhand eines gemeinsamen Wertes und erzeugt ein einzelnes Ergebnis mit Spalten aus jeder Tabelle.

---

## Warum zusammenhängende Daten in separaten Tabellen gespeichert werden

Den Autorennamen direkt in jede Blog-Eintrag-Zeile zu speichern führt zu Datenduplizierung. Ändert ein Autor seinen Anzeigenamen, müssen alle Zeilen, die ihn referenzieren, aktualisiert werden. Durch die Aufteilung in separate Tabellen (eine für Blog-Einträge, eine für Autoren) existiert jede Information an genau einer Stelle. Ein Blog-Eintrag speichert die `author_id`, und diese ID ist die Verbindung zur `authors`-Tabelle.

Diese Trennung ist nur dann nützlich, wenn die Daten zur Abfragezeit wieder zusammengeführt werden können. Genau das leisten JOINs.

---

## JOIN bzw. INNER JOIN

Ein `INNER JOIN` gibt Zeilen zurück, bei denen beide Tabellen einen übereinstimmenden Wert in der Join-Bedingung haben. Zeilen ohne Übereinstimmung auf einer der beiden Seiten werden aus dem Ergebnis ausgeschlossen.

```sql
SELECT * FROM blog_entries
INNER JOIN authors ON blog_entries.author_id = authors.id;
```

| id | title | createdAt | author_id | id | name | email |
|---|---|---|---|---|---|---|
| 1 | Getting Started with SQL | 2026-01-15 09:23:14 | 101 | 101 | Alice Chen | alice@example.com |
| 2 | Why I Love Postgres | 2026-02-03 14:07:42 | 102 | 102 | Bob Martinez | bob@example.com |
| 3 | Indexing Strategies Explained | 2026-02-19 11:45:30 | 101 | 101 | Alice Chen | alice@example.com |
| 5 | A Brief History of NoSQL | 2026-03-22 08:30:00 | 103 | 103 | Carol Singh | carol@example.com |

Die `INNER JOIN`-Klausel findet für jede Zeile in der `FROM`-Tabelle die passenden Daten aus der `ON`-Tabelle und fügt sie zu einer gemeinsamen Zeile zusammen. Meistens sind nicht alle diese Daten gewünscht, daher schränkt man das `SELECT` auf die benötigten Spalten ein:

```sql
SELECT blog_entries.title, blog_entries.createdAt, authors.name
FROM blog_entries
INNER JOIN authors ON blog_entries.author_id = authors.id;
```

Das ergibt folgende Ausgabe:

| title | createdAt | name |
|---|---|---|
| Getting Started with SQL | 2026-01-15 09:23:14 | Alice Chen |
| Why I Love Postgres | 2026-02-03 14:07:42 | Bob Martinez |
| Indexing Strategies Explained | 2026-02-19 11:45:30 | Alice Chen |
| A Brief History of NoSQL | 2026-03-22 08:30:00 | Carol Singh |

Diese Abfrage liefert eine Zeile pro Blog-Eintrag – jedoch nur Einträge, die einen passenden Autorendatensatz haben. Hat ein Blog-Eintrag eine `author_id`, die keiner Zeile in `authors` entspricht, wird dieser Eintrag nicht angezeigt.

Die `ON`-Klausel definiert, wie die beiden Tabellen zusammenhängen. `blog_entries.author_id = authors.id` weist die Datenbank an, Zeilen zu verbinden, bei denen der Fremdschlüssel in `blog_entries` dem Primärschlüssel in `authors` entspricht.

Da `INNER JOIN` der häufigste Join-Typ ist, kann er zu einfach `JOIN` verkürzt werden. Der Effekt ist identisch.

---

## LEFT JOIN

Ein `LEFT JOIN` gibt alle Zeilen der linken Tabelle zurück (die nach `FROM` genannte, in diesem Fall `blog_entries`), zuzüglich der übereinstimmenden Zeilen aus der rechten Tabelle. Gibt es keine passende Zeile in der rechten Tabelle, erscheinen die Spalten der rechten Seite als `NULL`.

```sql
SELECT blog_entries.title, blog_entries.createdAt, authors.name
FROM blog_entries
LEFT JOIN authors ON blog_entries.author_id = authors.id;
```

Eine Beispielausgabe würde so aussehen:

| title | createdAt | name |
|---|---|---|
| Getting Started with SQL | 2026-01-15 09:23:14 | Alice Chen |
| Why I Love Postgres | 2026-02-03 14:07:42 | Bob Martinez |
| Indexing Strategies Explained | 2026-02-19 11:45:30 | Alice Chen |
| Debugging Slow Queries | 2026-03-08 16:12:55 | NULL |
| A Brief History of NoSQL | 2026-03-22 08:30:00 | Carol Singh |

Damit werden alle Blog-Einträge zurückgegeben, auch solche, deren `author_id` keinem Autor entspricht. Für diese Einträge ist `authors.name` dann `NULL`. Ein `LEFT JOIN` wird verwendet, wenn die vollständige Menge einer Tabelle gewünscht ist, unabhängig davon, ob ein zugehöriger Datensatz in der anderen Tabelle existiert.

Die Wahl zwischen `(INNER) JOIN` und `LEFT JOIN` hängt davon ab, was bei einer fehlenden Übereinstimmung passieren soll: `INNER JOIN` blendet die Zeile aus; `LEFT JOIN` behält sie mit `NULL`-Werten auf der Join-Seite.

Es gibt auch `RIGHT JOIN` und `FULL JOIN`, diese sind jedoch weniger gebräuchlich und werden hier nicht behandelt.

---

## Weiterführende Links

- [SQLite JOIN-Syntax](https://www.sqlite.org/lang_select.html#joinop)
- [SQL JOINs erklärt auf W3Schools](https://www.w3schools.com/sql/sql_join.asp)