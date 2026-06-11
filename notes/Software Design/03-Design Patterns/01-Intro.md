# Software Design – Entwurfsmuster: Überblick

Entwurfsmuster sind benannte Lösungen für wiederkehrende Herausforderungen und Fallstricke, denen Entwickler regelmäßig begegnen. Sie helfen dabei, Probleme auf eine strukturierte Weise zu denken, die viele Programmierer teilen. Wenn zwei Entwickler beide sagen können „das ist ein Strategy-Muster" oder „lass es uns in ein Repository einwickeln", überspringen sie den langen Umweg, das zugrundeliegende Problem gegenseitig zu erklären, und beginnen direkt über die eigentliche Implementierung zu sprechen.

---

## Die drei Kategorien

Muster lassen sich in drei Gruppen einteilen, basierend auf der Art des Problems, das sie lösen:

- **Erzeugungsmuster** (*Creational Patterns*) betreffen die Frage, wie Objekte erstellt werden. Sie nehmen die unübersichtliche Arbeit des Konstruierens – die Entscheidung, welche Unterklasse verwendet werden soll, das Einbinden gemeinsamer Ressourcen, das Setzen vieler Optionen – aus dem Code heraus, der einfach nur das Ergebnis verwenden möchte.

- **Strukturmuster** (*Structural Patterns*) betreffen die Frage, wie Objekte zusammenpassen. Sie halten Teile lose verbunden, sodass ein Stück ausgetauscht werden kann, ohne die anderen neu zu schreiben – auch dann, wenn ein Teil isoliert getestet werden soll.

- **Verhaltensmuster** (*Behavioural Patterns*) betreffen die Frage, wie Objekte zur Laufzeit miteinander kommunizieren. Sie ersetzen verschachtelte bedingte Logik durch klare, dedizierte Objekte für jede Verantwortlichkeit.

---

## Grundlegende Prinzipien

Im Kern stützen sich die Muster auf dieselben objektorientierten Ideen, die man gerade kennenlernt. Sie bevorzugen **Komposition** (kleine Objekte, die Referenzen auf andere kleine Objekte halten) gegenüber tiefen Vererbungshierarchien – weil Komposition später einfacher zu ändern ist. Sie folgen außerdem den **SOLID-Prinzipien**, insbesondere der Regel, dass eine Klasse offen für Erweiterungen, aber geschlossen für Modifikationen sein sollte.

---

## Wann Muster einsetzen?

Wenn man Muster zum ersten Mal lernt, ist man versucht, ein Muster auf ein Problem anzuwenden, das es eigentlich gar nicht braucht. **Ein Muster verdient seinen Platz nur dann, wenn es mehr Schmerz beseitigt, als es verursacht.** Ein Repository auf ein 30-Zeilen-Skript zu erzwingen ist ein schlechteres Ergebnis als ein leicht unordentliches 30-Zeilen-Skript.

Das Ziel beim Lernen von Mustern ist zum einen zu wissen, wann man sie einsetzt – und zum anderen zu wissen, wann man sie in Ruhe lässt.