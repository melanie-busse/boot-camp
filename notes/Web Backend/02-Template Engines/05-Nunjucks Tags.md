# Backend Template Engines – Nunjucks Tags

Die meisten Templates müssen dynamische Inhalte rendern, die sich je nach den zugrundeliegenden Daten ändern. Typische Szenarien für eine Event-Management-Plattform sind zum Beispiel:

- Eine chronologische Liste bevorstehender Events anzeigen
- Ein „Ausverkauft"-Badge anzeigen, wenn keine Tickets mehr verfügbar sind
- Den „Event bearbeiten"-Button vor regulären Nutzern verbergen

Für solche Funktionen stellt Nunjucks Kontrollfluss-Tags mit der `{% %}` Syntax bereit. Im Gegensatz zu den `{{ }}`-Klammern, die einfach einen Wert ausgeben, führen `{% %}`-Blöcke tatsächliche Logik aus. Die zwei wichtigsten Tags sind `for` (Schleifen) und `if` (Bedingungen).

---

## For-Schleifen

Der `{% for %}`-Tag iteriert über ein Array und rendert seinen Inhalt einmal pro Element. Die Schleifenvariable nimmt dabei nacheinander jeden Wert an.

Der folgende Server-Code übergibt ein Array von Events an das Template:

```javascript
res.render("events.html", {
  events: [
    {
      name: "React Conf",
      date: "June 10, 2025",
      location: "Berlin",
      soldOut: false,
    },
    {
      name: "Vue.js Summit",
      date: "July 2, 2025",
      location: "Amsterdam",
      soldOut: true,
    },
  ],
});
```

Das Template iteriert über das Array:

```nunjucks
{% for event in events %}
<div class="event">
  <h3>{{ event.name }}</h3>
  <p>{{ event.date }} — {{ event.location }}</p>
</div>
{% endfor %}
```

Nunjucks unterstützt außerdem eine `{% else %}`-Klausel bei `for`-Schleifen. Sie wird gerendert, wenn das Array leer ist:

```nunjucks
{% for event in events %}
<p>{{ event.name }}</p>
{% else %}
<p>Keine bevorstehenden Events.</p>
{% endfor %}
```

Um über die Eigenschaften eines Objekts statt über ein Array zu iterieren, verwendet man die Form `for key, value in object`:

```nunjucks
{% for key, value in event %}
<li>{{ key }}: {{ value }}</li>
{% endfor %}
```

### Schleifenvariablen

Innerhalb einer `for`-Schleife stellt Nunjucks ein `loop`-Objekt mit Informationen zur aktuellen Iteration bereit:

| Variable | Beschreibung |
| --- | --- |
| `loop.index` | Aktuelle Position, beginnend bei `1` |
| `loop.index0` | Aktuelle Position, beginnend bei `0` |
| `loop.first` | `true` beim ersten Durchlauf |
| `loop.last` | `true` beim letzten Durchlauf |
| `loop.length` | Gesamtanzahl der Elemente in der Liste |

```nunjucks
{% for event in events %}
<div class="event">
  {% if loop.first %}
  <span class="badge">Featured</span>
  {% endif %}
  <h3>{{ loop.index }}. {{ event.name }}</h3>
  <p>{{ event.date }} — {{ event.location }}</p>
</div>
{% endfor %}
```

Das erste Event erhält ein „Featured"-Badge. Jedes Event wird mit `loop.index` nummeriert.

---

## Bedingtes Rendern

Der `{% if %}`-Tag rendert einen Abschnitt nur, wenn eine Bedingung wahr ist:

```nunjucks
{% if event.soldOut %}
<span class="badge">Ausverkauft</span>
{% endif %}
```

Für zwei Zweige fügt man `{% else %}` hinzu:

```nunjucks
{% if event.soldOut %}
<span class="badge badge-sold-out">Ausverkauft</span>
{% else %}
<span class="badge badge-available">Tickets verfügbar</span>
{% endif %}
```

Für mehr als zwei Zweige verwendet man `{% elif %}`:

```nunjucks
{% if event.spotsLeft == 0 %}
<span>Ausverkauft</span>
{% elif event.spotsLeft < 10 %}
<span>Fast ausgebucht — noch {{ event.spotsLeft }} Plätze frei</span>
{% else %}
<span>Tickets verfügbar</span>
{% endif %}
```

Die Bedingung kann ein beliebiger Ausdruck sein, der als truthy oder falsy ausgewertet wird: eine Variable, ein Vergleichsoperator (`==`, `!=`, `<`, `>`) oder ein boolescher Operator (`and`, `or`, `not`).

---

## Weiterführende Links

- [Nunjucks Templating – `for`](https://mozilla.github.io/nunjucks/templating.html#for)
- [Nunjucks Templating – `if`](https://mozilla.github.io/nunjucks/templating.html#if)