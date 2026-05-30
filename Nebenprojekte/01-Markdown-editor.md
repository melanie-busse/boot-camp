📝 Nebenprojekt: Markdown-Editor
In diesem Projekt erstellst du einen Markdown-Editor, mit dem Benutzer Notizen hinzufügen, bearbeiten und löschen können. Benutzer können ihre Notizen nach Titel oder Inhalt durchsuchen. Schließlich kannst du mit anderen Benutzern gemeinsam an Notizen arbeiten.

Basisfunktionen (MVP)
Notizliste: Eine Seitenleiste oder Dashboard-Ansicht, die alle gespeicherten Markdown-Dateien anzeigt (Titel und ein kurzer Textausschnitt). Die Liste soll nach dem Datum der letzten Änderung sortiert sein.

Notiz bearbeiten / Live-Vorschau: Eine geteilte Ansicht (Dual-Pane) oder eine umschaltbare Ansicht, in der roher Markdown-Text in einem Textfeld sofort als formatiertes HTML gerendert wird.

Notiz erstellen: Eine Funktion, um eine neue Notiz in der Datenbank zu speichern, wobei man automatisch in die Bearbeitungsansicht gelangt.

Notiz löschen: Eine Aktion, um eine Notiz dauerhaft aus der Datenbank zu entfernen, wobei die UI sofort aktualisiert wird.

Notizen durchsuchen: Eine Suchleiste, die die Liste filtert, indem sie Schlüsselwörter mit den Titeln und dem rohen Markdown-Inhalt abgleicht.

Zusatzfunktionen (Pro-Features)
Benutzer-Authentifizierung: Ein Login-Flow mit dauerhafter Sitzung (Session), damit Benutzer ihre eigenen Notizen verwalten können.

Autosave: Ein Hintergrundprozess, der den aktuellen Stand des Dokuments nach ein paar Sekunden Inaktivität automatisch mit dem Backend synchronisiert.

Export (PDF/Markdown): Eine Funktion, um die gerenderten Notizen für die Offline-Nutzung herunterzuladen.

Notiz-Verlauf (History): Eine Liste früherer Versionen einer Notiz, um zu älteren Ständen zurückkehren zu können.

Profi-Texteditor: Anstelle einer einfachen textarea kannst du Bibliotheken wie Monaco Editor (bekannt aus VS Code) oder ProseMirror nutzen.

Kollaboratives Editieren: Ein Echtzeit-Modus, in dem mehrere Benutzer gleichzeitig an einer Notiz arbeiten und die Curser der anderen sehen können.

Umsetzungsempfehlungen & Themen
Je nachdem, wo du im Kurs stehst, kannst du dich auf diese Schwerpunkte konzentrieren:

TypeScript
Typdefinitionen: Definiere strikte Interfaces für deine Notiz-Daten (z. B. ID, Inhalt, Zeitstempel), damit Frontend und Backend die gleiche "Sprache" sprechen.

Backend & Datenbank
API-Design: Baue eine REST-API mit Express für die CRUD-Operationen (Erstellen, Lesen, Aktualisieren, Löschen).

Speicherung: Nutze entweder das Dateisystem (fs), um .md-Dateien zu speichern, oder eine Datenbank wie SQLite (lokal) oder MySQL.

Architektur: Folge dem MVC-Muster (Model-View-Controller), um die Datenbanklogik strikt von der Routen-Logik zu trennen.

OOP (Objektorientierte Programmierung)
Datenmodellierung: Nutze Klassen und Interfaces, um deine Anwendung zu strukturieren.

History-Klasse: Implementiere eine Klasse, die die vorherigen Versionen einer Notiz verwaltet.

Editor-Klasse: Erstelle eine Klasse, die die Logik des Editors (Live-Vorschau, Autosave) kapselt.

Next.js (App Router)
Rendering-Strategien: Nutze Server Components, um die Notizliste schnell vom Server zu laden, und Client Components für den interaktiven Editor-Bereich.

State Management: Nutze Zustand oder den Context-API, um den Live-Zustand des getippten Textes zu verwalten, ohne die ganze Seite neu zu laden.

WebSockets
Echtzeit-Synchronisation: Nutze WebSockets, um Änderungen (Tastenschläge) sofort an alle verbundenen Clients zu senden (für das gemeinsame Bearbeiten).