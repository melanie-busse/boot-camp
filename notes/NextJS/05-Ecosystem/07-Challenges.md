# Next.js Ecosystem – Challenges

## Code Snippet Library – Besseres Erstellungsformular

Füge `react-hook-form` zum Projekt hinzu und nutze es, um ein Formular zum Erstellen neuer Snippets zu bauen.

* Verwende die `register`-Funktion auf deinen Inputs.
* Verwende die `handleSubmit`-Funktion auf deinem Formular.
* Verwende das `formState`-Objekt, um Validierungsfehler anzuzeigen.
* Füge deinen Inputs Validierungsregeln hinzu.

## Code Snippet Library – Favoriten-Seite

Füge eine Favoriten-Seite hinzu, die die Lieblings-Snippets des Nutzers anzeigt.

* Erstelle einen globalen `favoritesStore`, der ein Array von Favoriten-Snippet-IDs sowie Update-Funktionen enthält.
* Erstelle einen Favoriten-Button, der den Store nutzt, um ein Snippet zu den Favoriten hinzuzufügen oder daraus zu entfernen. Verwende die Komponente sowohl auf der Snippet-Detailseite als auch in der Snippet-Liste.
* Erstelle eine `FavoritesList`-Seite, die den Store nutzt, um die Liste der Lieblings-Snippets zu lesen.
* Erstelle eine Server-Funktion, die eine Liste von Snippet-IDs entgegennimmt und die entsprechenden Snippets zurückgibt.
* Füge dem Snippets-Service eine `getSnippetsByIds`-Funktion hinzu, die die Datenbank nach einer Liste von Snippets anhand der ID abfragt. (Postgres hat ein Schlüsselwort namens `ANY`, das hier nützlich sein wird.)
* Verwende entweder ein `useEffect` oder eine Suspense-Boundary, um die asynchrone Server-Funktion in deiner `FavoritesList`-Seite aufzurufen.
* Persistiere die Favoritenliste in `localStorage`. Achte darauf, einen Hydration Mismatch zu vermeiden.

## Code Snippet Library – Interaktiver Code-Editor

Füge den Monaco Editor zur Snippet-Detailseite hinzu, um den Code-Snippet zu bearbeiten. Füge einen Button hinzu, um zwischen der Code-Block-Anzeige und dem Code-Editor zu wechseln.