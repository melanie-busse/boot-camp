# Software Design – CS Grundlagen: Algorithmen

Ein Algorithmus ist eine Menge von Anweisungen, um von einer bestimmten Eingabe zu einer gewünschten Ausgabe zu gelangen. Eine Liste sortieren, ein Element in einem Baum finden oder eine Route zwischen zwei Punkten berechnen: All das hat viele mögliche Rezepte – und diese Rezepte sind nicht austauschbar. Zwei Algorithmen, die dasselbe Ergebnis liefern, können sehr unterschiedliche Mengen an Zeit und Speicher benötigen, um dorthin zu gelangen.

---

## Big-O-Notation

Beim Sprechen über und Vergleichen von Algorithmen ist die **Big-O-Notation** ein zentrales Konzept. Diese Notation beschreibt die obere Schranke dafür, wie die Laufzeit eines Algorithmus als Funktion der Eingabegröße wächst. Das klingt vielleicht verwirrend, beantwortet aber typischerweise die Frage: *„Wenn sich meine Eingabe der Größe n (z. B. Array-Länge) verdoppelt, was passiert dann mit der Dauer, die mein Code zum Abschließen benötigt?"*

- Eine Laufzeit von **O(n)** bedeutet, dass sich die Laufzeit bei doppelter Eingabe ungefähr verdoppelt.
- Eine Laufzeit von **O(n²)** bedeutet, dass sich die Laufzeit bei doppelter Eingabe ungefähr vervierfacht (10² = 100 vs. 20² = 400).
- Eine Laufzeit von **O(1)** bedeutet, dass die Laufzeit überhaupt nicht von der Eingabe abhängt – dies wird oft als **konstante Zeit** bezeichnet.

Big O beschreibt die grundlegende Form dieser Beziehung, nicht exakte Ausführungszeiten. Ein O(n)-Algorithmus auf einem langsamen Rechner kann für eine bestimmte Eingabe schneller sein als ein O(log n)-Algorithmus auf einem schnellen. Was Big O aussagt, ist, welcher bei wachsender Eingabe gewinnt. Es ist das richtige Vokabular für das Sprechen über Skalierung – und das falsche für das Sprechen über eine spezifische Anfrage auf einem spezifischen Server.

Die Konvention ist, nur den dominanten Term zu behalten und Konstanten wegzulassen. Ein Algorithmus, der `3n + 7` Schritte benötigt, ist O(n). Ein Algorithmus, der `n² + n` Schritte benötigt, ist O(n²). Der Grund ist, dass mit wachsendem n der größte Term schließlich alles andere dominiert.

![O(n).png](O(n).png)
---

## Häufige Komplexitätsklassen

Eine Handvoll Klassen taucht immer wieder auf. Jede ist unten mit einem typischen Beispiel gepaart, damit die Form erkennbar wird.

| Notation | Beispiel |
|---|---|
| **O(1)** | Eine Hash-Map-Suche. Das Lesen von `users[id]` wird nicht langsamer, wenn die Map wächst. |
| **O(log n)** | Eine Binärsuche in einem sortierten Array. Jeder Vergleich halbiert den verbleibenden Bereich. |
| **O(n)** | Ein linearer Scan. Einmaliges Durchlaufen jedes Elements in einem Array. |
| **O(n log n)** | Ein guter Sortieralgorithmus. Das beste allgemeine Sortieren kann im vergleichsbasierten Modell nicht besser sein. |
| **O(n²)** | Eine verschachtelte Schleife, bei der jede Schleife über die gesamte Eingabe läuft. Jedes Paar in einer Liste vergleichen. |
| **O(2ⁿ)** | Ein naiver rekursiver Algorithmus mit zwei Verzweigungen pro Aufruf. Die unmodifizierte Fibonacci-Rekursion ist das klassische Beispiel. |

---

## Speicherkomplexität

Big O wird auch für den Speicher verwendet. Dieselbe Notation beschreibt, wie viel zusätzlichen Speicher ein Algorithmus als Funktion der Eingabegröße benötigt. Ein linearer Scan, der eine laufende Summe führt, verwendet **O(1)** zusätzlichen Speicher, unabhängig von der Eingabegröße. Ein Algorithmus, der eine Kopie der Eingabe erstellt, verwendet **O(n)**.

Zeit und Speicher sind separate Belange, und ein Algorithmus kann bei einem günstig und beim anderen teuer sein. **Caching** ist ein wiederkehrendes Beispiel, bei dem eine schnellere Ausführung gegen erhöhten Speicherverbrauch eingetauscht wird.

---

## Sortieralgorithmen

Um ein Gefühl dafür zu bekommen, was Algorithmen voneinander unterscheidet, schauen wir uns einige Algorithmen an, die alle dieselbe Aufgabe erfüllen, aber auf unterschiedliche Weise: eine Liste von Elementen sortieren.

### Bubble Sort

Bubble Sort ist der einfachste Sortieralgorithmus in der Beschreibung und der am leichtesten abzutende. Durchlaufe das Array und vergleiche benachbarte Paare. Wenn ein Paar in der falschen Reihenfolge ist, tausche sie. Wiederhole, bis ein vollständiger Durchlauf keine Tausche mehr erzeugt. Nach jedem Durchlauf ist der größte verbleibende Wert an die Spitze geblasen – daher der Name.

```
wiederhole:
  getauscht = false
  für i von 0 bis länge(arr) - 2:
    wenn arr[i] > arr[i+1]:
      tausche arr[i] und arr[i+1]
      getauscht = true
bis nicht getauscht
```

Die äußere Schleife führt einen weiteren vollständigen Durchlauf aus, wenn der vorherige Durchlauf etwas tauschen musste. Sobald ein Durchlauf sauber durchläuft, ist das Array sortiert und die Schleife endet.

Die Laufzeit ist **O(n²)**. Im schlimmsten Fall – einem umgekehrt sortierten Array – muss jeder Wert an jedem anderen vorbeibewegt werden. Bubble Sort verdient seinen Platz im Lehrplan nicht durch Nützlichkeit, sondern als Ausgangspunkt, der verdeutlicht, wie sich O(n²) in der Praxis anfühlt. Hundert Elemente mit Bubble Sort zu sortieren ist in Ordnung. Eine Million Elemente ist es nicht.

---

### Insertion Sort

Insertion Sort baut einen sortierten Bereich am Anfang des Arrays auf, ein Element nach dem anderen. Durchlaufe das Array ab dem zweiten Element. Schiebe für jedes Element dieses nach links an jedem größeren Element vorbei, bis es an der richtigen Stelle im bereits sortierten Bereich landet. Wenn die äußere Schleife jedes Element besucht hat, ist das gesamte Array sortiert.

```
für i von 1 bis länge(arr) - 1:
  aktuell = arr[i]
  j = i - 1
  während j >= 0 und arr[j] > aktuell:
    arr[j+1] = arr[j]
    j = j - 1
  arr[j+1] = aktuell
```

Der schlimmste Fall ist **O(n²)** – bei einem umgekehrt sortierten Array muss jedes neue Element bis ganz nach vorne geschoben werden. Der beste Fall ist **O(n)** – bei einem bereits sortierten Array, weil die innere Schleife beim ersten Vergleich endet. Diese Empfindlichkeit gegenüber der Vorsortierung macht Insertion Sort zur starken Wahl für kleine Arrays und für fast sortierte Arrays. Er ist zudem **In-Place**: Abgesehen von einer einzelnen temporären Variable benötigt er keinen zusätzlichen Speicher.

Das ist der Grund, warum **TimSort** Insertion Sort für die kleinen Abschnitte verwendet, die er vor dem Zusammenführen sortieren muss. Bei Eingaben der Länge ~32 schlägt ein einfacher Algorithmus mit niedrigen konstanten Faktoren alles Aufwendigere.

---

### Merge Sort

Bei Merge Sort wird es etwas anspruchsvoller: Die Strategie verwendet **Teile und Herrsche** auf rekursive Weise. Teile das Array in zwei Hälften. Sortiere jede Hälfte durch Anwendung von Merge Sort auf sie. Führe die zwei sortierten Hälften in einem einzigen sortierten Array zusammen, indem wiederholt das kleinere der zwei vorderen Elemente entnommen wird. Die Rekursion endet bei Arrays der Länge eins, die bereits sortiert sind.

```
funktion mergeSort(arr):
  wenn länge(arr) <= 1: gib arr zurück
  mitte = länge(arr) / 2
  links = mergeSort(arr[0..mitte])
  rechts = mergeSort(arr[mitte..ende])
  gib merge(links, rechts) zurück

funktion merge(links, rechts):
  ergebnis = []
  während links und rechts beide nicht leer:
    wenn links[0] <= rechts[0]:
      entferne das erste Element von links und hänge es an ergebnis an
    sonst:
      entferne das erste Element von rechts und hänge es an ergebnis an
  hänge verbleibende Elemente von links und rechts an ergebnis an
  gib ergebnis zurück
```

`mergeSort` übernimmt das Aufteilen und die Rekursion. `merge` erledigt die eigentliche Sortierarbeit, indem beide sortierten Hälften parallel durchlaufen werden und immer das kleinere vordere Element als nächstes genommen wird.

Die Laufzeit ist **O(n log n)**. Der log-n-Faktor kommt vom Teilungsschritt, der nur etwa log₂ n mal wiederholt werden kann, bevor die Teile die Größe eins haben. Der n-Faktor kommt vom Zusammenführungsschritt, der auf jeder Rekursionsebene das gesamte Array durchlaufen muss. Dieses Produkt ist das Beste, was vergleichsbasiertes Sortieren allgemein erreichen kann.

Der Nachteil von Merge Sort ist der zusätzliche Speicher. Das Zusammenführen erfordert einen temporären Puffer der Größe der Eingabe, was seine Speicherkomplexität auf **O(n)** bringt.

---

## Sortieren in echten Engines

Sehr fortgeschrittene und komplexe Sortieralgorithmen haben typischerweise eine große Konstante in ihrer Zeitkomplexität – der Teil, der, wie oben besprochen, weggelassen wird. Das kann ihnen das falsche Bild vermitteln, immer die beste Wahl zu sein. Für kleinere Arrays mit ungefähr weniger als 10.000 Einträgen können einfachere Algorithmen tatsächlich schneller sein.

Daher ist JavaScripts `Array.prototype.sort` weder Bubble Sort noch Merge Sort. V8, die Engine in Chrome und Node, verwendet **TimSort** – ein Hybrid, der Merge Sort mit Insertion Sort kombiniert und für teilweise sortierte Eingaben optimiert ist, was die meisten realen Eingaben sind. Andere Engines haben im Laufe der Jahre ähnliche Entscheidungen getroffen.

---

## Ressourcen

- [Big-O Cheat Sheet](https://www.bigocheatsheet.com/)
- [Wikipedia: TimSort](https://de.wikipedia.org/wiki/Timsort)
- [Wikipedia: Mergesort](https://de.wikipedia.org/wiki/Mergesort)
- [YouTube: Sortieralgorithmen visualisiert](https://www.youtube.com/watch?v=kPRA0W1kECg)