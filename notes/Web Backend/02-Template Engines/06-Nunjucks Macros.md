# Backend Template Engines – Nunjucks Macros

Ein Template, das eine Event-Liste rendert, erzeugt für jedes Event dasselbe HTML: eine Karte mit Titel, Datum, Ort und vielleicht einem „Ausverkauft"-Badge. Dieses HTML existiert einmal im Listen-Template, und Änderungen dort wirken sich auf jede Karte aus. Nun stelle man sich vor, dieselbe Karte erscheint auf einer Startseite, einer Speaker-Detailseite und der Haupt-Event-Übersicht. Das Markup liegt an drei Stellen – und eine Design-Änderung muss überall vorgenommen werden.

Das Konzept der `macros` bietet hierfür eine elegante Lösung. Ein `macro` ist ein benannter, wiederverwendbarer Template-Codeblock, der Parameter entgegennimmt – ähnlich wie eine Funktion in JavaScript. Man definiert ihn einmal und ruft ihn überall auf, wo dieses HTML benötigt wird. Das Macro besitzt das Markup; der Aufrufer liefert die Daten.

---

## Ein Macro definieren

Der `{% macro %}`-Tag definiert eine wiederverwendbare Template-Funktion. Er erhält einen Namen und eine Parameterliste, und sein Inhalt enthält das zu rendernde HTML:

```nunjucks
{% macro eventCard(name, date, location, soldOut=false) %}
<div class="event-card">
  <h3>{{ name }}</h3>
  <p>{{ date }} — {{ location }}</p>
  {% if soldOut %}
  <span class="badge">Ausverkauft</span>
  {% endif %}
</div>
{% endmacro %}
```

Drei Dinge sind dabei zu beachten:

- `name`, `date` und `location` sind Pflichtparameter – sie müssen bei jedem Aufruf angegeben werden.
- `soldOut=false` ist optional und fällt auf `false` zurück, wenn er weggelassen wird.
- Der Macro-Body ist normales Nunjucks – jede Variable, jeder Tag und jeder Ausdruck funktioniert darin.

Ein Macro aufzurufen sieht aus wie ein Funktionsaufruf:

```nunjucks
{{ eventCard("React Conf", "June 10, 2025", "Berlin") }}
{{ eventCard("Vue.js Summit", "July 2, 2025", "Amsterdam", true) }}
```

Der erste Aufruf lässt `soldOut` weg und verwendet daher den Standardwert `false`. Der zweite übergibt `true`, wodurch das „Ausverkauft"-Badge erscheint.

---

## Macros importieren

Sobald ein Projekt mehr als ein paar Macros enthält, gehören sie in eigene Dateien statt inline in jedes Template. Der `{% import %}`-Tag lädt eine Macro-Datei und stellt ihre Macros unter einem Namespace bereit.

Angenommen, die Datei `macros/events.html` enthält das `eventCard`-Macro von oben:

```nunjucks
{% import "macros/events.html" as eventMacros %}

{{ eventMacros.eventCard("React Conf", "June 10, 2025", "Berlin") }}
{{ eventMacros.eventCard("Vue.js Summit", "July 2, 2025", "Amsterdam", true) }}
```

`as eventMacros` weist der importierten Datei einen Namespace zu. Alle Macros aus dieser Datei sind als `eventMacros.macroName` zugänglich. Mehrere Macro-Dateien können im selben Template unter verschiedenen Namespaces importiert werden.

---

## Weiterführende Links

- [Nunjucks Templating – `macro`](https://mozilla.github.io/nunjucks/templating.html#macro)