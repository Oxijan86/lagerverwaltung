# Dashboard

Das Dashboard zeigt:

- **Aktive Artikel**
- **Unterbestand** – die vollständige Anzahl aller Artikel mit `Istbestand < Mindestbestand`
- **Heute** – heutige Buchungen
- **Buchungen** – Gesamtzahl aller Ein- und Ausbuchungen


## Artikel unter Mindestbestand

In der Vorschau werden zunächst bis zu acht Artikel angezeigt. Sind mehr Artikel betroffen, steht **Alle anzeigen** zur Verfügung.

Sollbestand und Mindestbestand können direkt in dieser Liste ohne Administratorpasswort geändert werden.

Es gilt immer:

`Mindestbestand <= Sollbestand`

Wird ein Mindestbestand größer als der Sollbestand eingegeben, wird der Sollbestand automatisch auf den Mindestbestand angehoben.

Ein Artikel wird nur angezeigt, wenn `Istbestand < Mindestbestand`. Bei `Istbestand = Mindestbestand` verschwindet er sofort aus der Liste.
