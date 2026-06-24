## 1 Project Setup und die Service-Schicht

Dein erstes Ziel ist eine laufende Next.js-Anwendung, die DarkBay über ein einziges, serverseitiges Modul erreichen kann.

- Scaffolde ein neues Projekt mit `create-next-app` unter Verwendung von TypeScript und dem App Router.
- Speichere die DarkBay-Base-URL in einer Umgebungsvariable in `.env`, zum Beispiel `DARKBAY_API_URL=http://localhost:3030`. Lies sie auf dem Server aus, hardcode sie niemals in Komponenten.
- Erstelle ein `auctionsService`-Modul unter `lib/`, das alle auktionsbezogenen Fetch-Aufrufe gruppiert. Gib ihm kleine, typisierte Funktionen wie `getAuctions()` und `getAuctionById(id)`, die den Request aufbauen, DarkBay aufrufen und die geparsten Daten zurückgeben.

**Design-Frage:** Warum leitest du jeden Backend-Aufruf durch ein einziges serverseitiges Modul, statt `fetch` in jeder Komponente einzeln aufzurufen? Denk darüber nach, wo deine API-URL und später dein Auth-Token leben müssen.

*Resource: Next.js Project Structure*

## 2 Auktionen durchstöbern

Baue die Startseite: eine Liste von Auktionen, die Besucher filtern und durchblättern können, ohne sich einloggen zu müssen.

- Mache die Auktionsliste zu einer asynchronen Server-Component, die über deine Service-Schicht fetcht und die Ergebnisse direkt rendert.
- Füge eine `loading.tsx` hinzu, damit die Route einen Fallback zeigt, während die Daten ankommen.

**Design-Frage:** Die Filter- und Page-Werte kommen über `searchParams` auf dem Server. Was gewinnst du dadurch, diesen State in der URL zu halten statt in clientseitigem `useState`?

*Resource: Next.js Pages and Layouts*

## 3 Auktionsdetail und Gebotsverlauf

Jede Auktion braucht ihre eigene Seite, die das vollständige Listing und die bisher abgegebenen Gebote zeigt.

- Erstelle eine dynamische Route mit einem `[id]`-Ordner. Lies das Segment aus der `params`-Prop und fetche diese einzelne Auktion plus ihre Gebote über die Service-Schicht.
- Rendere die Item-Details, den aktuellen Preis, das Enddatum.
- Verlinke auf der Listenseite jedes Listenelement mit `next/link` zu seiner Detailseite.
- Behandle eine fehlende Auktion: Wenn DarkBay für eine unbekannte id einen 404 zurückgibt, zeige eine Not-Found-Seite; füge eine `error.tsx`-Boundary für unerwartete Fehler hinzu.

**Design-Frage:** Ein Nutzer kann jede beliebige id in die URL eingeben. Wo fängst du den Fall ab, dass diese Auktion nicht existiert, und was sieht der Nutzer?

*Resource: Next.js Dynamic Routes*

## 4 Styling mit Tailwind und shadcn/ui

Verwandle die funktionierende App in etwas, das die Leute nutzen wollen.

- Richte Tailwind CSS ein, dann initialisiere shadcn/ui mit `npx shadcn@latest init`.
- Füge die benötigten Komponenten mit `npx shadcn@latest add` hinzu, zum Beispiel `button`, `card`, `input` und `select`. Baue die Auction-Card-Seiten mit diesen Komponenten.
- Mache das Layout responsiv und unterstütze einen Dark Mode, passend für einen Underground-Marketplace.
- Style die kommenden Elemente weiterhin mit shadcn.

*Resource: shadcn/ui Installation*

## 5 Authentifizierung

Gib Nutzern eine Möglichkeit, sich einzuloggen, damit sie Gebote abgeben, Auktionen erstellen und ihr Konto verwalten können.

- Erstelle eine `authActions`-Datei in deinem `/lib`-Ordner, in der du die Funktionen `loginAction`, `registerAction` und `logoutAction` anlegst.
- Baue Login- und Register-Seiten inklusive der jeweiligen Formulare. Nutze eine Server Action auf deinem eigenen Next.js-Server als Form-Action.
- Rufe in diesem Handler den Login-Endpunkt von DarkBay auf, nimm das zurückgegebene JWT und speichere es in einem httpOnly-Cookie mit `cookies()` aus `next/headers`. Füge eine Logout-Funktion hinzu, die das Cookie löscht.
- Erstelle eine `fetchAPI`-Funktion, die das Token mit `cookies()` aus dem Cookie liest. Sie erhält als Argumente den Pfad sowie ein Options-Objekt und ruft `fetch` auf, indem sie diese Werte übergibt. Zusätzlich fügt sie das JWT-Token, falls vorhanden, als `Authorization: Bearer ${token}` zu den Request-Headers hinzu.
- Aktualisiere deine Service-Schicht, indem du die einfachen `fetch`-Aufrufe durch `fetchAPI` ersetzt.
- Spiegle den Auth-State im UI: zeige Gästen Login- und Register-Links, und eingeloggten Nutzern einen Logout-Button sowie deren Aktionen. Erstelle eine `isAuthenticated`-Funktion, um zu prüfen, ob ein Nutzer eingeloggt ist (durch Auslesen des Cookies). Rufe sie auf dem Server auf und nutze sie, um das UI bedingt zu rendern.

**Sicherheitsfrage:** Warum speicherst du das JWT in einem httpOnly-Cookie, das auf dem Server gelesen wird, statt in `localStorage`, wo Client-Code darauf zugreifen kann?

*Resource: Next.js cookies*

## 6 Geschützte Aktionen

Mit einem Token an der richtigen Stelle können eingeloggte Nutzer nun Auktionen erstellen und Gebote abgeben.

- Baue ein Create-Auction-Formular und ein Place-a-Bid-Formular. Sende sie mit Server-Functions (`"use server"`), die an die `action` des Formulars angebunden sind, sodass die Mutation auf dem Server läuft.
- Rufe nach einem erfolgreichen Schreibvorgang `revalidatePath` für die betroffene Route auf, damit die Listen- oder Detailseite den neuen Zustand ohne manuellen Refresh widerspiegelt.
- Bringe DarkBays Ablehnungen ans Licht. Ein Gebot unter dem aktuellen Preis oder auf eine geschlossene Auktion kommt mit einem bestimmten Statuscode zurück; verwandle das in eine klare Meldung statt in einen generischen Fehler.

**Business-Regel:** DarkBay leitet die Seller- und Bidder-Identität aus dem verifizierten Token ab. Deine Formulare dürfen kein Seller- oder Bidder-Feld senden. Woher kommt diese Identität jetzt?

*Resource: Next.js Server Actions and Mutations*

## 7 Deployment auf Vercel

Bringe die App live und verbinde sie mit deinem laufenden Backend. Die vollständige Anleitung findest du in `deployment.md`.

- Push dein Repository zu GitHub und importiere es in Vercel.
- Setze deine Umgebungsvariablen im Vercel-Projekt und lasse `DARKBAY_API_URL` auf dein DarkBay-Backend auf Render zeigen. Falls du keine laufende Render-Instanz hast, schau dir die DevOps-CI/CD-Session an.
- Öffne die deployte URL und prüfe, dass Browsing, Login und Bidding alle gegen das Live-Backend funktionieren.

*Resource: Deploying on Vercel*

## Bonus-Challenges

Wähle eine oder mehrere, sobald der Hauptbuild läuft.

- **searchParams:** Verdrahte DarkBays Query-Optionen mit der URL: `?status=open|closed`, `?min-price` und `?max-price`, Sortierung nach Enddatum und Pagination. Lies diese aus den `searchParams` der Seite und reiche sie an die API weiter.
- **react-hook-form überall:** Refactore die Auktions- und Gebotsformulare zu react-hook-form mit typisierten Werten und Validierungsregeln, und teile Field-Components über `FormProvider`.
- **Globaler State mit zustand:** Verschiebe den Auth-State oder eine Watchlist in einen zustand-Store, sodass Komponenten nur den Slice abonnieren, den sie brauchen.
- **Watchlist:** Bringe DarkBays Watchlist-Feature ans Licht. Lass eingeloggte Nutzer eine Auktion hinzufügen oder entfernen und eine eigene Watchlist-Seite anzeigen.
- **Open- oder Closed-Badge:** Lies den abgeleiteten Status der Auktion aus und zeige ein „open“- oder „closed“-Badge auf der Card und der Detailseite.
- **Admin-Delete:** Wenn der eingeloggte Nutzer Admin ist, zeige ein Delete-Control auf Listings und rufe den geschützten Delete-Endpunkt auf.
- **Optimistic Bidding:** Zeige das neue Höchstgebot sofort nach dem Absenden an und gleiche es dann mit der Server-Antwort ab.
- **Dark-Mode-Toggle:** Füge einen Switch hinzu, der das Theme umschaltet und sich die Wahl merkt.
- **Skeleton-Loader:** Ersetze einfachen Loading-Text durch Skeleton-Platzhalter in der Form der Auction-Cards.