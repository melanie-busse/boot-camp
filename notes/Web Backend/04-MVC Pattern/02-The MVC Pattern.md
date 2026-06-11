# Backend MVC Pattern – Das MVC-Muster

Das Model-View-Controller-Muster (MVC) trennt Zuständigkeiten und verhindert, dass die Codebasis zu einem verworrenen Durcheinander wird. Aber wie kommunizieren diese einzelnen Teile in einer echten Express-Anwendung miteinander?

Im Folgenden werden die Kernkomponenten aufgeschlüsselt und nachvollzogen, wie sie einen Request verarbeiten.

---

## Model, View und Controller

Der Grundgedanke des MVC-Musters ist, dass die drei Schichten für unterschiedliche Aufgaben zuständig sind:

1. **Model** – übernimmt den Datenzugriff, die Speicherung und die Änderung von Daten. Es sitzt direkt vor dem Datenspeicher und weiß als einzige Schicht, wie auf diesen zugegriffen wird.
2. **View** – übernimmt die nutzerorientierte Ausgabe der Anwendung. Es ist verantwortlich für das Rendern von HTML-Templates oder die Strukturierung von JSON-Responses.
3. **Controller** – übernimmt die Logik der Anwendung. Es ist verantwortlich für die Verarbeitung von Nutzereingaben und den Aufruf der passenden Funktionen auf der Model- und View-Schicht.

---

## Wie Codestruktur die Wartbarkeit fördert

Bevor wir tiefer in die einzelnen Teile des MVC-Musters eintauchen, lohnt es sich, darüber nachzudenken, warum wir Code überhaupt so strukturieren wollen.

Der wichtigste Grund für den Einsatz des MVC-Musters ist, Änderungen an der Codebasis handhabbar zu machen. Die einzelnen Teile der Anwendung können unabhängig voneinander gewartet werden, und Änderungen an einem Teil beeinflussen die anderen nicht – solange die API zwischen ihnen gleich bleibt. (API bedeutet hier im Wesentlichen: wie die Funktionen eines Teils aufgerufen werden und was sie zurückgeben.)

Ein Beispiel für eine solche Änderung ist der Austausch einer JSON-Datei durch eine Datenbank. Ohne MVC müsste die gesamte Codebasis danach durchsucht werden, wo die JSON-Datei-Logik eingebettet ist. Die Wahrscheinlichkeit, einen Fall zu übersehen und die Codebasis zu beschädigen, ist hoch. Mit dem MVC-Muster kann das Model einfach gegen ein anderes mit denselben Methodensignaturen ausgetauscht werden – der Rest der Codebasis bleibt unverändert. Intern sieht die Datenverarbeitung jedoch völlig anders aus.

```typescript
// Post-Controller
async function renderPost(req: Request, res: Response): Promise<void> {
  const slug = req.params.slug;
  const post = await postModel.getBySlug(slug);

  if (!post) {
    res.status(404).send("Post not found");
    return;
  }

  res.render("post.html", { post });
}
```

```typescript
// Model mit JSON-Datei-Speicherung
function getBySlug(slug: string): Post | null {
  const posts = fs.readFileSync(postsFilePath, "utf8");
  return posts.find((post) => post.slug === slug);
}
```

```typescript
// Model mit Datenbank-Speicherung
function getBySlug(slug: string): Post | null {
  const db = getDB();
  const post = db.posts.find({ slug });

  if (!post) {
    return null;
  }

  return post;
}
```

In diesem Beispiel fungiert die Funktion `getBySlug` als Model-API. Für den Route-Controller `renderPost` sind beide Implementierungen nicht zu unterscheiden: Die Methode wird gleich aufgerufen, akzeptiert dieselben Parameter und gibt denselben Typ zurück. Den Speicher auszutauschen wird dadurch so trivial wie das Importieren eines anderen `postModel`.

---

## Das Gleichgewicht finden

Den Code für die aktuelle Situation der App zu bauen – ohne für die Zukunft zu überentwickeln – und gleichzeitig die Struktur so zu gestalten, dass Änderungen leicht umsetzbar sind: Das ist das wichtigste Merkmal einer guten Codebasis.

---

## Weiterführende Ressourcen

- [Express Routing Guide](https://expressjs.com/en/guide/routing.html)