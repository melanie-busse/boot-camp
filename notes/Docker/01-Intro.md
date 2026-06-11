# Docker – Einführung und Grundkonzepte

## Überblick

Viele Probleme in der Softwareentwicklung entstehen nicht durch den Anwendungscode selbst, sondern durch Unterschiede in der Laufzeitumgebung. Eine NestJS-Applikation kann auf dem eigenen macOS-Laptop einwandfrei laufen und auf dem Windows-Rechner eines Teammitglieds oder dem Produktionsserver sofort abstürzen. Ursachen dafür sind häufig inkompatible Node.js-Versionen, fehlende Systembibliotheken oder Konflikte zwischen global installierten Paketen.

Docker löst dieses Problem, indem es die Anwendung zusammen mit ihrer gesamten Laufzeitumgebung in eine standardisierte Einheit verpackt – den sogenannten **Container**. Anstatt eine umfangreiche Einrichtungsanleitung zu schreiben und darauf zu hoffen, dass jede Entwicklerin und jeder Entwickler sie lückenlos befolgt, wird die Umgebung direkt im Code definiert. Das garantiert, dass die Anwendung überall identisch startet – unabhängig vom Betriebssystem des Hosts.

## Aufbau dieses Moduls

Dieses Modul ist darauf ausgelegt, möglichst schnell in die praktische Arbeit mit Containern einzusteigen. Es beginnt mit einer klaren Begriffsklärung, damit jederzeit ersichtlich ist, mit welchem Artefakt gerade gearbeitet wird. Anschließend werden folgende Themen behandelt:

- Lokale Entwicklungsumgebung einrichten
- Erstes Dockerfile schreiben
- Umgebungsvariablen injizieren
- Fertiges Image in eine öffentliche Registry pushen

> **Denkanstoß:** Welche Probleme hast du bisher erlebt, die auf Unterschiede zwischen Entwicklungs- und Produktionsumgebungen zurückzuführen waren? Wie hätte ein einheitliches Container-Setup diese Situation verändert?