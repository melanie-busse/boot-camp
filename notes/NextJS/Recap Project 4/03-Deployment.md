# Recap-Projekt 4 – Deployment

## Deployment auf Vercel

Vercel wird vom Team hinter Next.js entwickelt und erkennt daher eine Next.js-App ohne zusätzliche Konfiguration. Falls noch nicht geschehen, erstelle ein Konto auf Vercel, vorzugsweise mit einer GitHub-OAuth-Verbindung. Push dein Repository zu GitHub, wähle dann im Vercel-Dashboard „Add New Project“ und importiere dieses Repository. Vercel erkennt das Framework, führt den Build aus und gibt dir eine Live-URL. Jeder spätere Push auf deinen `main`-Branch löst automatisch ein neues Deployment aus, und Pull Requests erhalten ihre eigenen Preview-URLs, sodass du Änderungen prüfen kannst, bevor sie live gehen.

Das Einzige, was Vercel nicht erraten kann, ist alles Geheime oder Umgebungsspezifische, wie zum Beispiel, wo dein Backend liegt. Das kommt als Nächstes.

## Umgebungsvariablen

Lokal liegen diese in `.env`, die nicht committet wird. Vercel braucht seine eigene Kopie, eingestellt unter Project Settings, dann Environment Variables. Zwei Details sind hier wichtig:

* `DARKBAY_API_URL` enthält die öffentliche Adresse deines Backends. Ohne das `NEXT_PUBLIC_`-Präfix bleibt dieser Wert auf dem Server – genau das, was deine Service-Schicht braucht. Browser-Code sieht ihn niemals.
* Das `NEXT_PUBLIC_`-Präfix legt eine Variable im Browser-Bundle offen. Nutze es nur für Werte, die sicher an den Client ausgeliefert werden können, wie zum Beispiel einen öffentlichen Analytics-Key. Gib deiner API-URL oder irgendeinem Secret niemals dieses Präfix, wenn es serverseitig bleiben soll.

Nachdem du eine Variable hinzugefügt oder geändert hast, deploye neu, damit der neue Wert wirksam wird. Variablen werden zur Build- und Laufzeit gelesen, nicht nachträglich in ein bestehendes Deployment eingepatcht.

## Verbindung zum Render-Backend

Deine DarkBay-API läuft als Web Service auf Render mit ihrer eigenen öffentlichen URL, etwa `https://darkbay.onrender.com`. Setze `DARKBAY_API_URL` auf Vercel auf diese Adresse, und deine Service-Schicht wird das Live-Backend statt `localhost` aufrufen.

Zwei Besonderheiten solltest du einplanen:

* **Cold Starts:** Render lässt einen Service in der Free-Tier nach Inaktivität einschlafen. Der erste Request nach so einem „Nickerchen“ kann viele Sekunden dauern, während der Service aufwacht. Deine `loading.tsx`-States decken das ab, aber sei nicht überrascht, wenn der erste Ladevorgang eine Weile braucht.
* **CORS:** Aufrufe von deinem Next.js-Server zu Render laufen Server-zu-Server ab und unterliegen nicht den Browser-CORS-Regeln. Falls du DarkBay zusätzlich direkt aus Browser-Code aufrufst, konfiguriere DarkBay so, dass es deine Vercel-Domain als Origin erlaubt. Da wir die Aufrufe in der serverseitigen Service-Schicht halten, umgehen wir dieses Problem vollständig.

## Resources

[Deploying on Vercel](https://nextjs.org/docs/app/getting-started/deploying)
[Vercel Environment Variables](https://vercel.com/docs/environment-variables)
[Render Web Services](https://render.com/docs/web-services)