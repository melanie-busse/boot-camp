# NestJS Swagger - OpenAPI & Swagger

Die meisten Teams beschreiben ihre REST-APIs in irgendeiner Form von Fließtext-Dokumentation: eine Confluence-Seite, ein README oder eine Word-Datei auf einem geteilten Laufwerk. Das funktioniert ungefähr eine Woche lang. Sobald jemand zum ersten Mal ein Feld umbenennt oder einen Query-Parameter hinzufügt, entfernt sich das Dokument von der Realität, und ab diesem Zeitpunkt muss ohnehin jeder API-Consumer den Quellcode lesen.

OpenAPI ist die Standardlösung für dieses Problem. Es ist eine Spezifikation, mit der sich eine REST-API in einer einzigen strukturierten Datei beschreiben lässt: YAML oder JSON, herstellerneutral und maschinenlesbar. Weil die Datei strukturiert und nicht bloß Fließtext ist, können Tools sie direkt verarbeiten. Dieselbe Datei kann genutzt werden, um automatisch eine interaktive HTML-Dokumentationsseite zu rendern, einen typisierten TypeScript-Client zu erzeugen, einen Mock-Server zu konfigurieren und während der Continuous Integration (CI) zu prüfen, ob die echten Antworten dem Vertrag entsprechen.

Swagger ist die am weitesten verbreitete Tool-Familie, die mit OpenAPI-Dateien arbeitet. Im Gespräch werden beide Begriffe oft synonym verwendet, was verwirrend ist, weil sie früher einmal dasselbe bedeuteten und heute unterschiedliche Dinge meinen. Dieses Kapitel entwirrt diese Entwicklung, skizziert, was die Spezifikation abdeckt, und nennt die Tools, denen du am wahrscheinlichsten begegnen wirst.

## Die OpenAPI-Spezifikation

Die OpenAPI Specification (OAS) wird von der OpenAPI Initiative gepflegt, einer Arbeitsgruppe unter dem Dach der Linux Foundation. Sie ist herstellerneutral und frei verfügbar unter [spec.openapis.org](https://spec.openapis.org/oas/latest.html).

Ein OpenAPI-Dokument beschreibt genau eine API. Es listet auf:

- die Server, auf denen die API läuft
- die Endpunkte (Paths) und welche HTTP-Methoden jeweils unterstützt werden
- die Request-Bodies, Query-Parameter, Path-Parameter und Header, die jeder Endpunkt erwartet
- die Responses, die jeder Endpunkt je nach Statuscode zurückgeben kann, einschließlich ihrer Datenstrukturen
- die Authentifizierungsschemata, die von der API verwendet werden

Der Sinn eines strukturierten Formats besteht darin, dass dasselbe Dokument für alle die zentrale Quelle der Wahrheit ist. Das Frontend-Team liest es, um zu wissen, was es aufrufen muss. Das QA-Team liest es, um zu wissen, was getestet werden soll. Ein Codegenerator liest es, um daraus ein Client-SDK zu erzeugen. Swagger UI liest es, um daraus Dokumentation zu rendern. Niemand muss Informationen zwischen verschiedenen Formaten übersetzen.

## Swagger vs. OpenAPI

Die Begriffe sind verwirrend, weil sich ihre Bedeutung im Lauf der Zeit verändert hat.

Swagger begann 2010 als Nebenprojekt bei einem Startup namens Wordnik, entwickelt von Tony Tam. Es war sowohl eine Spezifikation als auch ein Satz von Tools, die damit arbeiteten. Bis 2015 war die Spezifikation weit verbreitet, und das ursprüngliche Team übergab sie an eine neue herstellerneutrale Organisation namens OpenAPI Initiative. Die Spezifikation wurde umbenannt: Aus „Swagger 2.0“ wurde mit dem nächsten großen Release „OpenAPI 3.0“.

Die Tools behielten jedoch den Namen Swagger. SmartBear, das Unternehmen, das Swagger bis dahin übernommen hatte, entwickelte sie weiter und vermarktete sie weiterhin unter Namen wie Swagger Editor, Swagger UI und anderen.

Die Faustregel heute ist einfach: Wenn du über eine Datei oder eine Struktur sprichst, ist der richtige Begriff OpenAPI. Wenn du über ein Tool sprichst, ist der richtige Begriff Swagger. Das NestJS-Integrationspaket heißt aus historischen Gründen `@nestjs/swagger`, aber das Dokument, das es erzeugt, ist ein OpenAPI-3-Dokument und kein Swagger-2-Dokument.

## Die Swagger-Toolchain

Die folgenden Tools sind diejenigen, denen du am häufigsten begegnen wirst. Alle verwenden dieselbe OpenAPI-Datei als Eingabe.

**Swagger UI** ist eine Single-Page-HTML-Anwendung, die ein OpenAPI-Dokument einliest und daraus eine interaktive Dokumentationsseite rendert. Jeder Endpunkt wird zu einer aufklappbaren Zeile mit Methode, Pfad, Beschreibung, Parametern, Request-Body und möglichen Responses. Über einen „Try it out“-Button bei jedem Endpunkt kannst du ein Formular ausfüllen, eine echte HTTP-Anfrage an die API senden und die Antwort direkt sehen. In einer NestJS-Anwendung wird diese Seite durch `@nestjs/swagger` unter `/api` eingebunden.

**Swagger Editor** ist ein browserbasierter YAML-Editor mit Live-Validierung und einer daneben gerenderten Swagger-UI-Vorschau. Er ist nützlich, wenn man ein OpenAPI-Dokument von Hand schreiben oder inspizieren möchte. Die gehostete Version unter [editor.swagger.io](https://editor.swagger.io/) kann ohne Installation verwendet werden.

**Swagger Codegen** und der eng verwandte **OpenAPI Generator** nehmen ein OpenAPI-Dokument und erzeugen daraus Code: typisierte Clients in TypeScript, Java, Python, Go und vielen weiteren Sprachen sowie Server-Stubs in ungefähr ebenso vielen Sprachen. Beide Projekte haben einen gemeinsamen Ursprung, wobei OpenAPI Generator der aktiv gepflegte Community-Fork ist.

**SwaggerHub** ist die gehostete Plattform von SmartBear für die kollaborative Entwicklung und Begutachtung von APIs. Sie bündelt Editor, Versionierung, Mock-Server und Team-Berechtigungen. Während dieses Bootcamps wirst du sie wahrscheinlich nicht brauchen, aber in größeren Organisationen mit einem Design-First-Workflow begegnet sie dir häufig.

Es gibt auch Tools außerhalb der Swagger-Familie, die OpenAPI verarbeiten: **Redoc** rendert eine dreispaltige Dokumentation, die manche Teams Swagger UI vorziehen; **Postman** und **Bruno** importieren OpenAPI-Dateien, um ihre Request-Collections zu befüllen; und **Stoplight Studio** ist ein alternativer grafischer Editor. Das Dateiformat bleibt in allen Fällen dasselbe.

## Ressourcen

- [OpenAPI Initiative](https://www.openapis.org/)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Swagger tools](https://swagger.io/tools/)
- [Bruno OAS Import](https://docs.usebruno.com/open-api/importOAS)