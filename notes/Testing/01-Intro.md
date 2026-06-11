# Grundlagen des automatisierten Testens

## Warum testen?

Software versagt irgendwann. Der Unterschied zwischen einem chaotischen und einem stabilen Team liegt schlicht darin, *wann* dieser Fehler entdeckt wird. Einen Bug lokal vor einem Commit zu finden kostet Sekunden. Wird er erst in der Produktion sichtbar, leidet das Vertrauen der Nutzer – und es sind sofortige Notfall-Patches erforderlich.

Automatisierte Tests fungieren als strukturelles Sicherheitsnetz. Entwickler können Legacy-Code beherzt refaktorieren und neue Features einbauen, ohne katastrophale Regressionen befürchten zu müssen. Ein einziger Befehl genügt, und das System prüft, ob sich die Anwendung noch exakt wie erwartet verhält. Sich allein auf manuelle Verifikation – also auf das Durchklicken der App nach jeder Änderung – zu verlassen, ist ein erschöpfender Prozess, bei dem Randfälle leicht durchschlüpfen.

---

## Die Test-Pyramide

Nicht alle Tests erfüllen denselben Zweck. Sie werden nach Ausführungsgeschwindigkeit und Umfang kategorisiert. Eine gut durchdachte Test-Suite setzt auf eine Mischung verschiedener Strategien, die üblicherweise als Pyramide dargestellt wird:

```
          ▲  langsamer · weniger · teurer
         ╱ ╲
        ╱E2E╲          End-to-End: vollständige Nutzer-Journeys
       ╱─────╲
      ╱  INT  ╲        Integration: Module im Zusammenspiel
     ╱─────────╲
    ╱    UNIT   ╲      Unit: isolierte Funktionen, in Millisekunden
   ╱─────────────╲
          ▼  schneller · mehr · günstiger
```

---

## Unit Tests – Das Fundament

Unit Tests bilden die Basis. Ein Unit Test isoliert eine einzelne Funktion oder Klasse und überprüft deren interne Logik. Da sie keine Datenbankverbindungen oder externe Netzwerke benötigen, laufen sie in Millisekunden durch. Davon werden Hunderte geschrieben. Schlägt ein Unit Test fehl, zeigt er präzise, wo ein logischer Fehler aufgetreten ist.

---

## Integrationstests – Die Mitte

Komponenten arbeiten selten allein. Ein Integrationstest prüft, was passiert, wenn zwei oder mehr Teile des Systems miteinander kommunizieren. Beispiel: Übergibt der HTTP-Router die Daten korrekt an die Service-Schicht? Diese Tests erfordern in der Regel das Hochfahren von Teilen der Anwendung und interagieren unter Umständen mit einer In-Memory-Datenbank. Sie dauern etwas länger, decken aber Schnittstellenprobleme auf, die isolierten Funktionen verborgen bleiben.

---

## End-to-End-Tests – Die Spitze

End-to-End-Tests simulieren einen echten Client, der mit der vollständig gestarteten Anwendung interagiert. Sie treffen die tatsächlichen Endpunkte und schreiben in eine echte Test-Datenbank – und verifizieren damit den kompletten Lebenszyklus. Obwohl sie das höchste Vertrauen bieten, dass das System korrekt funktioniert, sind sie langsam und anfällig. Eine kleine Änderung im Datenschema kann dutzende End-to-End-Tests brechen. Daher sollten diese Tests sparsam eingesetzt werden – reserviert für kritische Nutzer-Journeys wie Registrierung oder Zahlungsabwicklung.

---

## Zusammenfassung

| Test-Typ | Geschwindigkeit | Umfang | Anzahl |
|---|---|---|---|
| **Unit** | Millisekunden | Einzelne Funktion/Klasse | Hunderte |
| **Integration** | Sekunden | Mehrere Module | Dutzende |
| **End-to-End** | Minuten | Gesamte Anwendung | Wenige |

> **Faustregel:** Viele Unit Tests, einige Integrationstests, wenige End-to-End-Tests.