# Überblick

Frameworks und verwaltete Dienste haben es möglich gemacht, eine funktionierende Web-App zu entwickeln, ohne viel über die zugrunde liegende Informatik nachdenken zu müssen. An einem bestimmten Punkt reicht das jedoch nicht mehr aus. Die richtige Werkzeugwahl für eine Aufgabe, das Erkennen, wann eine Architektur zu einem Problem werden wird, und das Verstehen, warum ein Codestück langsamer ist als ein anderes – all das hängt davon ab, was unterhalb der Framework-Schicht passiert.

Diese Sitzung ist eine breite Übersicht über drei Säulen, in denen dieses Verständnis eine Rolle spielt.

## Die drei Säulen

### 1. Datenstrukturen
Wie Daten im Speicher gehalten werden und warum manche Operationen darauf günstig sind, während andere teuer sind.

### 2. Algorithmen
Wie Daten verarbeitet werden und wie zwei Ansätze miteinander verglichen werden können, ohne sie auszuführen.

### 3. Architektur
Wie ein System auf höchster Ebene gestaltet ist und wie diese Gestaltung entscheidet, welche Probleme einfach sind und welche schmerzhaft werden.

---

## Ziel der Sitzung

Jede Säule wird konzeptionell mit webrelevanten Beispielen behandelt, anstatt erschöpfend abgedeckt zu werden. Es werden folgende Themen angesprochen:

- Monolithen neben Microservices
- Verkettete Listen neben Stacks und Bäumen
- Big-O-Notation neben einigen repräsentativen Sortieralgorithmen

Das Ziel ist **nicht**, einen selbst-balancierenden Baum aus dem Gedächtnis zu implementieren. Es geht darum, das **Vokabular** und den **Abwägungsrahmen** zu vermitteln, damit beim nächsten Mal, wenn jemand sagt:

> *„Dieser Endpunkt ist O(n²)"*

oder

> *„Wir sollten das in einen eigenen Service auslagern"*

klar ist, was damit gemeint ist – und ob der Kompromiss zur Situation passt.