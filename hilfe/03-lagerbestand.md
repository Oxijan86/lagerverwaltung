# Lagerbestand

Die Spalten sind in Version 66 bewusst so angeordnet: **Artikelnummer → Bezeichnung → Istbestand → Mindestbestand → Sollbestand → Lager / Lagerort → Maschinenzuordnung → Aktionen**.

Ohne Administratorpasswort können pro Artikel geändert werden:

- Mindestbestand
- Sollbestand
- Lager und optionaler Lagerort
- eine oder mehrere vorhandene Maschinenzuordnungen

Artikelnummer, Bezeichnung und Istbestand bleiben im normalen Lagerbestand unveränderbar. Lager und Lagerorte können hier ohne Kennwort ergänzt werden. Neue Maschinen werden über die dafür vorgesehenen Stammdaten-/Materialwege angelegt.

Ein Artikel ist nur Unterbestand bei `Istbestand < Mindestbestand`. Bei `Istbestand == Mindestbestand` besteht keine Warnung.

Mindestbestand darf unter Sollbestand liegen. Falls Mindestbestand über Sollbestand eingegeben wird, wird Sollbestand automatisch angehoben. Ungespeicherte Änderungen bleiben bei Suche und Filter erhalten und werden beim Ansichtswechsel angekündigt.


## Smartphone ab V67
Auf dem Smartphone sind zunächst nur Artikelnummer, Bezeichnung und Istbestand sichtbar. Über **Details anzeigen** werden Mindest-/Sollbestand, Lagerort, Maschinen und Speichern aufgeklappt. Mehrere Artikel können gleichzeitig geöffnet bleiben; ungespeicherte Änderungen bleiben markiert.


## Smartphone-Suche ab V68
Während der Eingabe zeigt die Lagerbestandsansicht direkt am Suchfeld die aktuelle Trefferzahl. Auf Smartphones werden die ersten passenden Artikel unmittelbar unter dem Suchfeld mit Artikelnummer, Bezeichnung und Istbestand angezeigt. Ein Treffer kann direkt angetippt werden; die Bildschirmtastatur wird dabei geschlossen und der Artikel in der Lagerbestandsansicht angesprungen. Aufgeklappte Details und ungespeicherte Artikelentwürfe bleiben erhalten. Bei null Treffern erscheint **Keine Artikel gefunden**.

## Bestandsgrenzen aus dem Istbestand übernehmen (V74)

Im Reiter Lagerbestand, unter **Soll- und Mindestbestand einstellen**, stehen diese drei Sammelaktionen bereit:

- Sollbestand aus Istbestand übernehmen
- Mindestbestand aus Istbestand übernehmen
- Soll und Mindestbestand aus Istbestand übernehmen

Sie gelten für alle aktiven Artikel, auch wenn die Suche nur einen Teil der Liste zeigt. Vor der Übernahme erscheint eine Bestätigung; die bestehende Administratorfreigabe bleibt erforderlich. Ungespeicherte Einzeländerungen bitte zuerst mit **Alle Änderungen speichern** sichern. Die Sammelübernahme verändert nur Soll- und Mindestbestand. Istbestand, Buchungen und Zuordnungen bleiben erhalten. Falls der Mindestbestand sonst über dem Sollbestand liegen würde, wird der Sollbestand angehoben und dies in der Rückmeldung genannt.

Einzelne Soll- und Mindestbestände lassen sich weiterhin direkt in der Lagerbestandstabelle ändern und mit **Speichern** sichern. Auf dem Smartphone dazu **Details anzeigen** öffnen.


## Lager und Standardlager ab V76

Unter **Lager / Lagerorte und Standardlager verwalten** vorhandene Lager wählen oder neue Lager und Lagerorte ohne Kennwort anlegen. **Ausgewähltes Lager als Standard speichern** legt die Vorauswahl für neue Materialien und noch nicht zugeordnete Artikel fest. Bei **Ohne Lager** kann der Standard wieder entfernt werden. Bestehende Artikelzuordnungen werden dadurch nicht pauschal geändert.

In der Artikelzeile ein Lager und bei Bedarf einen Lagerort auswählen. Lagerort darf leer bleiben. Bei einem Lagerwechsel wird ein nicht passender Lagerort geleert. **+ Lager / Lagerort** öffnet die Neuanlage direkt beim Artikel. Mit **Auswahl übernehmen** wird die Zuordnung zunächst vorgemerkt; anschließend **Speichern** oder **Alle Änderungen speichern** wählen. Istbestand und Buchungen ändern sich dadurch nicht.

Die Funktionen stehen auch während einer gewöhnlichen Bestandskontrolle auf PC und Smartphone bereit; auf dem Smartphone vorher **Details anzeigen** öffnen. Lager, Lagerorte und Standardlager werden mit der lager.db gespeichert und übertragen.
