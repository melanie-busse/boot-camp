# Überblick

Die vorherige Einheit hat eine Express-Anwendung mit einer SQLite-Datenbank verbunden und das Lesen von Daten mit `SELECT` behandelt. Die Anwendung kann jetzt Blog-Einträge aus einem persistenten Speicher ausliefern, aber sie kann nur lesen, was manuell eingefügt wurde. Eine echte Anwendung muss neue Einträge erstellen, bestehende aktualisieren und Datensätze löschen können – und das über die API, nicht über eine Datenbank-GUI.

Diese Einheit deckt drei Bereiche ab.

**Erstens** SQL-Datenaggregation mit `JOIN`-Statements. Ein `JOIN` zieht Daten aus mehreren Tabellen in einer einzigen Abfrage zusammen – das wird notwendig, sobald ein Blog-Eintrag einen Autor per ID referenziert, anstatt den Autorennamen direkt einzubetten.

**Zweitens** die Struktur von Daten über mehrere Tabellen hinweg: Eins-zu-eins-, Eins-zu-viele- und Viele-zu-viele-Beziehungen und wie jede davon mit Fremdschlüsseln modelliert wird – manchmal mit Hilfe einer Verbindungstabelle (Junction Table).

**Drittens** SQL-Mutationen mit den Statements `INSERT`, `UPDATE` und `DELETE`, die als drei neue Routen und drei neue Model-Funktionen in die Express-Anwendung integriert werden. Jede SQL-Mutation entspricht einer HTTP-Methode: `POST` für Erstellen, `PUT` für Aktualisieren und `DELETE` für Entfernen.