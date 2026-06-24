# Continuous Integration & Continuous Deployment

## Überblick

Am 1. August 2012 verlor die Knight Capital Group innerhalb von 45 Minuten 440 Millionen Dollar. Das Handelsunternehmen stand kurz davor, neue Software für das Retail-Liquidity-Programm der New York Stock Exchange zu starten. Acht Produktionsserver sollten den neuen Code erhalten. Ein Techniker spielte ihn auf sieben Server ein. Der achte Server lief weiterhin mit der alten Version — und diese enthielt ein Stück inaktiven Testcode aus früheren Jahren, der unter den neuen Flag-Einstellungen damit begann, in höchster Geschwindigkeit fehlerhafte Kauf- und Verkaufsorders abzufeuern.

Bis jemand identifizierte, welcher Server sich falsch verhielt, hatte das Unternehmen Aktien im Wert von rund 7 Milliarden Dollar zu willkürlichen Preisen gekauft und verkauft. Der Verlust überstieg das verfügbare Eigenkapital von Knight Capital. Innerhalb von sechs Monaten wurde das Unternehmen übernommen. Ein einziger Server, der die falsche Version eines einzigen Programms ausführte, beendete die Geschichte einer 17 Jahre alten Firma.

Der Vorfall wurde berühmt wegen seiner Ursache. Es gab keinen cleveren Exploit, und der neue Code selbst funktionierte einwandfrei. Das Deployment war unvollständig — und niemand hatte es bemerkt. Kein automatisierter Prozess beantwortete die Frage „Haben alle acht Server die neue Version erhalten?", weil kein automatisierter Prozess darüber wachte.

Dieses Kapitel behandelt die Disziplin, die aus Vorfällen wie dem bei Knight Capital entstanden ist. Mit **Continuous Integration** prüft ein automatisiertes System jeden Commit und meldet zurück, ob die Änderung sicher zu mergen ist. **Continuous Deployment** erweitert diese Automatisierung auf das Release selbst: Die gleiche Pipeline, die den Code verifiziert hat, baut ihn, liefert ihn aus und startet die neue Version. Bei einer ausreichenden Anzahl von Deployments überspringt jeder Mensch früher oder später einen Verifikationsschritt oder verliert den Überblick darüber, was gerade wo läuft — Maschinen tun das nicht.

## Ressourcen

- [Softwarefehler kostet Knight Capital 440 Millionen Dollar, Spiegel 2012](https://www.spiegel.de/wirtschaft/unternehmen/software-problem-an-der-nyse-kostet-knight-capital-440-millionen-a-847969.html)
- [Continuous Integration – Martin Fowlers Referenz-Essay](https://martinfowler.com/articles/continuousIntegration.html)

---

> **Denkanstoß:** Welche manuellen Schritte in eurem aktuellen Deployment-Prozess könnten — wie bei Knight Capital — unbemerkt ausgelassen werden, und wie ließe sich durch Automatisierung sicherstellen, dass sie niemals übersprungen werden?