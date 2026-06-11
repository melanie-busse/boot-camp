# Backend SQL Grundlagen – Aufgaben

## SQLite in dein Express-Projekt integrieren

Verbinde dein bestehendes Blog-Projekt mit einer SQLite-Datenbank und ersetze das fest kodierte Daten-Array durch echte Datenbankzugriffe.

**Anforderungen:**

- Erstelle `src/db/database.ts` mit den Funktionen `connectDB()`, `getDB()` und `closeDB()`
- Rufe `connectDB()` in `src/index.ts` auf, bevor der Server gestartet wird
- Registriere `SIGINT`- und `SIGTERM`-Handler, die `closeDB()` vor dem Beenden aufrufen
- Definiere das Tabellenschema in `connectDB()` mit `CREATE TABLE IF NOT EXISTS`
- Erstelle eine neue Datenbankdatei namens `blog.db` im Verzeichnis `./db`
- Starte den Server erfolgreich und lass die leere Tabelle anlegen. Befülle die Tabelle anschließend mit DB Browser mit den vorhandenen Daten aus deiner JSON-Datei
- Refaktoriere dein Model so, dass die Get-All-Funktion die Datenbank statt der fest kodierten Daten verwendet
- Refaktoriere dein Model so, dass die Get-One-Funktion die Datenbank statt der fest kodierten Daten verwendet
- Überprüfe mit DB Browser, ob die Daten korrekt gelesen werden

---

## SQL-Lernspiele

Arbeite eines oder mehrere dieser interaktiven SQL-Spiele durch. Jedes vermittelt SQL über eine Geschichte oder ein Rätsel – du schreibst echte Abfragen, um voranzukommen.

- [SQL Island](https://sql-island.informatik.uni-kl.de/) – ein Abenteuerspiel, in dem SQL-Befehle dich durch die Spielwelt bewegen
- [SQL Murder Mystery](https://mystery.knightlab.com/) – untersuche einen Tatort mit `SELECT`-Abfragen
- [SQL Squid Game](https://datalemur.com/sql-game) – kämpfe dich durch SQL-Herausforderungen
- [SQL Police Department](https://sqlpd.com/) – löse Fälle mit SQL