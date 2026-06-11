# Paradigmen des Software-Designs – Herausforderungen

Sie entwickeln Teile eines Bibliotheksverwaltungssystems. Die folgenden Übungen fordern Sie auf, funktionales, objektorientiertes und gestalterisches Denken nacheinander auf denselben Bereich anzuwenden.

---

## 1. Funktionale Transformation in einer Serviceschicht

Sie erhalten ein Array von SQL-Ergebniszeilen für den Buchkatalog. Jede Zeile enthält `id`, `title`, `author_name`, `is_available` und `added_at`.

Schreiben Sie TypeScript-Code, der:

- das Array filtert, sodass nur verfügbare Bücher übrig bleiben,
- jede Zeile einer Antwortform mit `id`, `title`, `authorName` und `addedAt` zuordnet,
- das ursprüngliche Array unverändert lässt.

Erläutern Sie nach Fertigstellung, welcher Teil Ihrer Lösung rein ist und wo Seiteneffekte (z. B. Datenbankschreibvorgänge) in einer Express-Anwendung ihren Platz hätten.

---

## 2. Bibliotheksreservierungen buchen

Ihre örtliche Bibliothek möchte ein Reservierungssystem für Bücher einführen. Bibliotheksmitglieder sollen Bücher reservieren, als zurückgegeben markieren und Reservierungen über ihr Online-Konto stornieren können.

Erstellen Sie eine Klasse `BookReservation` in TypeScript, die die folgenden Kriterien implementiert:

- Im Konstruktor einen Mitgliedsnamen und einen Buchtitel akzeptieren.
- Den Reservierungsstatus so speichern, dass er nicht direkt von außerhalb der Klasse geändert werden kann. Der Status kann nur `"reserviert"`, `"zurückgegeben"` oder `"storniert"` sein.
- Eine Methode `markReturned` bereitstellen, die die Aktion ablehnt, wenn die Reservierung bereits zurückgegeben oder storniert wurde.
- Eine Methode `cancel` bereitstellen, die die Aktion ablehnt, falls das Buch bereits zurückgegeben wurde.
- Eine Möglichkeit bieten, den aktuellen Status sicher auszulesen.

---

## 3. Benachrichtigungssystem für Buchbibliotheken

Entwerfen Sie ein Benachrichtigungssystem für eine Bibliotheks-App. Wenn eine Reservierung erstellt wird oder ein Buch überfällig ist, werden Mitglieder über einen oder mehrere Kanäle (z. B. E-Mail, SMS) benachrichtigt.

Ihre Lösung muss folgende spezifische Anforderungen erfüllen:

**Die Schnittstelle `Notifiable` muss Folgendes deklarieren:**

- `notify(memberId: string, event: string, title: string): void` – sendet eine Benachrichtigung an ein Mitglied.
- `getChannelName(): string` – gibt den Namen des Kanals zurück (z. B. `"email"`).

**Die abstrakte Klasse `BaseNotifier` muss `Notifiable` implementieren und Folgendes bereitstellen:**

- Eine konkrete Methode `formatMessage(event: "reservation" | "overdue", title: string): string`, die eine vollständige Nachrichtenzeichenfolge zurückgibt, z. B. `"Your reservation for 'Dune' is confirmed."` oder `"Reminder: 'Dune' is overdue."`.
- Eine abstrakte Methode `send(memberId: string, message: string): void`, die von Unterklassen implementiert werden muss.
- Eine konkrete Methode `notify(memberId: string, event: "reservation" | "overdue", title: string): void`, die `formatMessage` und dann `send` aufruft.

**Zwei konkrete Klassen, die `BaseNotifier` erweitern:**

- `EmailNotifier`: implementiert eine simulierte E-Mail `send` durch Protokollierung: `Sending email to member #${memberId}: ${message}`
- `SmsNotifier`: implementiert eine simulierte SMS `send` durch Protokollierung: `Sending SMS to member #${memberId}: ${message}`

**Eine Klasse `NotificationService`, die:**

- im Konstruktor ein Array von `Notifiable`-Kanälen akzeptiert (die Benachrichtigungskanäle, die der Benutzer bereits aktiviert hat),
- eine Methode `dispatch(memberId: string, event: "reservation" | "overdue", title: string): void` besitzt, die `notify` für jeden Kanal aufruft.

Testen Sie Ihre Lösung, indem Sie ein `NotificationService`-Objekt mit sowohl einem `EmailNotifier` als auch einem `SmsNotifier` erstellen und dann ein `"reservation"`-Ereignis für das Buch `"Dune"` an das Mitglied `"42"` senden.

---

## 4. Refactor Your Recap 2 App

Schauen Sie sich den Quellcode des vorherigen Projekts noch einmal an. Untersuchen Sie ihn unter Berücksichtigung der Prinzipien Single Responsibility (SRP), Don't Repeat Yourself (DRY) und Separation of Concerns (SoC) und überarbeiten Sie ihn, um sein Design zu verbessern. Sehen Sie Möglichkeiten zur Implementierung einer Klasse?