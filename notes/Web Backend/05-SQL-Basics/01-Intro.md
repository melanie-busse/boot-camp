# Überblick: Datenbanken & SQL

Die meisten Anwendungen müssen Daten speichern, die über einen einzelnen Request oder einen Server-Neustart hinaus bestehen bleiben. Eine Variable im Arbeitsspeicher verschwindet in dem Moment, in dem der Prozess stoppt. Eine einfache Datei funktioniert für kleine Datenmengen – wird aber schwer zu abfragen, zu aktualisieren und konsistent zu halten, sobald sie wächst. Datenbanken lösen dieses Problem, indem sie strukturierten, zuverlässigen Speicher mit einer einheitlichen Methode zum Lesen und Schreiben von Daten bieten.

---

## Was diese Session abdeckt

Diese Session behandelt **relationale Datenbanken** und **SQL** – die Sprache, mit der man mit ihnen interagiert. Der Einstieg erfolgt über die Kernkonzepte: wie Daten in Tabellen organisiert sind, wie Tabellen über Schlüssel miteinander in Beziehung stehen und wie SQL-Statements aussehen.

Danach wird **SQLite** eingerichtet – eine Datenbank, die als einzelne Datei läuft und keinen Server benötigt. Sie eignet sich hervorragend für die lokale Entwicklung, weil es nichts zu konfigurieren gibt.

Sobald das direkte Schreiben von `SELECT`-Abfragen gegen eine Datenbank vertraut ist, geht es weiter zur Integration einer SQLite-Datenbank in eine **Express-Anwendung**. Dabei wird ein dediziertes Datenbank-Modul in TypeScript erstellt, eine Verbindung zu einer SQLite-Datei beim Start aufgebaut, ein Tabellen-Schema definiert und eine Model-Funktion geschrieben, die eine Abfrage ausführt und typisierte Ergebnisse an einen Route-Handler zurückgibt.

---

## Das Ziel

Die Session endet mit einer funktionierenden Express-Anwendung, die Blog-Einträge aus einer echten Datenbank liest – anstatt aus einem hartcodierten Array.