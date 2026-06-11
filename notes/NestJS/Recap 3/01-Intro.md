# Zusammenfassung Projekt 3 – DarkBay
Willkommen bei DarkBay , einer API für einen Untergrundmarktplatz, auf dem Nutzer Artikel zum Verkauf anbieten und miteinander bieten. Sie entwickeln das Backend komplett selbst. Es gibt kein Frontend; die gesamte Kommunikation erfolgt über eine RESTful-API mit JSON-Daten.

Ein Verkäufer stellt eine Auktion für einen Artikel mit Startpreis und Enddatum ein. Andere Nutzer konkurrieren mit Geboten. Die Kernlogik befindet sich in Ihrer Serviceschicht: Ein gültiges Gebot muss dem Startpreis entsprechen und alle bestehenden Gebote übersteigen. Die Auktion muss natürlich noch laufen. Verstößt eine Anfrage gegen diese Regeln, weist Ihre API sie mit einem entsprechenden HTTP-Statuscode zurück, anstatt stillschweigend einen Fehler auszugeben oder einen allgemeinen Serverfehler zu melden.

Ihr Datenmodell basiert auf einer 1:n-Beziehung. Die auctionsTabelle speichert die Angebote – Titel, Beschreibungen, Startpreise und Enddaten. Das Auktionsende ist standardmäßig drei Tage nach Auktionserstellung festgelegt, sofern kein anderes Datum angegeben ist. Die offersTabelle erfasst die Gebote und verknüpft diese über einen Fremdschlüssel mit der jeweiligen Auktion. Mithilfe dieser Beziehung können Sie den aktuellen Preis berechnen, das höchste Gebot abrufen oder die gesamte Gebotshistorie einsehen.

Dieses Projekt simuliert einen realistischen Übergang (Refactoring), den jedes reale Backend durchläuft. Anfangs vertrauen Sie dem Client. Das bedeutet, dass der Anfragetext die Identität enthält "seller": "z3r0c00l"oder "bidder": "ac1dburn"vorgibt. So sind Ihre Kernfunktionen schnell einsatzbereit. Später entfernen Sie dieses blinde Vertrauen und implementieren eine ordnungsgemäße Authentifizierung. Die Felder für Verkäufer und Bieter verschwinden aus den API-Nutzdaten. Die Datenbank verknüpft weiterhin Benutzer mit ihren Auktionen und Geboten, aber die API extrahiert die Identität ausschließlich aus einem verifizierten JWT. Clients können ihre Identität nicht mehr fälschen, da der Server die Token-Signatur bei jeder geschützten Anfrage validiert.

Bevor Sie Ihre erste Codezeile schreiben, richten Sie ein Git-Repository ein. Verwenden Sie die Versionskontrolle für Ihre Arbeit, versuchen Sie, häufig Commits durchzuführen, aussagekräftige Commit-Nachrichten zu schreiben und Ihren Fortschritt auf GitHub zu übertragen.

Das Werk gliedert sich in sechs Teile:

Projekteinrichtung & Datenbank
Das Auktionsmodul
Das Angebotsmodul und die Gebotslogik
RESTful Polish
Authentifizierung
API-Dokumentation mit Swagger