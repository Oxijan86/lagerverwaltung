# Fehlerbehebung

## Lagerbestand bleibt nach dem Start leer

Seit Version 56 kann die Audit-Nachtragung den Datenbankstart nicht mehr blockieren. Falls künftig ein anderer Startfehler auftritt, erscheint eine rote Meldung statt eines stillen leeren Dashboards.

Bei Cloud-Betrieb prüfen, ob oben **Cloud** angezeigt wird und ob der verbundene Ordner zugreifbar ist.

## M365-Ergebnis wird nicht erkannt

- Aktuellen Prompt unter **Hilfe → M365-Prompts** verwenden.
- Auf `IMPORTTYP: EINBUCHUNG` bzw. `IMPORTTYP: ENTNAHME` achten.
- Artikelnummern und Mengen dürfen nicht leer sein.


## Lokaler/Cloud-Dialog erscheint ständig

Seit Version 58 wird ein **lokal neuer, aber sicher auf dem letzten Cloud-Stand basierender** Datenstand automatisch hochgeladen. Nur echte Konflikte zwischen verschiedenen Geräten müssen manuell entschieden werden.

Unter **Dateisynchronisierung** werden die fortlaufende lokale und die zuletzt bekannte Cloud-Revisionsnummer angezeigt.


## V60: Ordnerzugriff fehlt
Hintergrundprüfungen öffnen keine Berechtigungsabfrage mehr. Unter Dateisynchronisierung erscheint bei Bedarf **Ordnerzugriff erneut freigeben**. Bis zur ausdrücklichen Freigabe arbeitet die App lokal weiter und überschreibt keine Cloud-Datei.

## V60: beschädigte Cloud-Datei
Eine beschädigte oder nicht vollständig lesbare `lager.db` wird nicht automatisch überschrieben. Zuerst Datei/OneDrive-Konflikt klären oder eine geprüfte Sicherung bewusst wiederherstellen.


## V61: Synchronisationsordner enthält bereits lager.db
Das ist bei einem bereits eingerichteten Smartphone-/PC-Synchronisationsordner normal. Verwenden Sie **Cloud-Synchronisationsordner verbinden**. Die vorhandene Datei wird zuerst vollständig geprüft und nur verbunden. Eine beschädigte oder unlesbare Datei wird weiterhin niemals automatisch überschrieben.


## Startdialog zeigt „Ordnerzugriff erforderlich“

Der Cloud-Ordner ist weiterhin gespeichert, aber der Browser hat den Dateizugriff für die neue Sitzung noch nicht freigegeben.

Im Startdialog **🔐 Ordnerzugriff erneut freigeben** antippen. Der Benutzer-Klick ist erforderlich, weil Browser eine Berechtigungsabfrage nicht zuverlässig aus einer Hintergrundprüfung heraus erlauben.

Die Anwendung arbeitet bis dahin nur lokal und schreibt nichts in die Cloud.


## Version 63 – Synchronisieren und schließen
Wenn beim Schließen der Sitzung die Browserberechtigung für den bereits verbundenen Synchronisationsordner fehlt, erscheint direkt im Schließen-Dialog **🔐 Ordnerzugriff freigeben & synchronisieren**. Erst dieser Fingertipp fordert die Berechtigung an. Danach wird die Cloud-Datei erneut geprüft und der normale geschützte Synchronisationspfad fortgesetzt.

## V64 – Speichermodus nach Update
Beim Update wird der Speichermodus in folgender Reihenfolge bestimmt: IndexedDB-Wert, ältere SQLite-Einstellung `storage_mode`, vorhandener Ordner-Handle, erst danach Browser-Lokal. Eine vorhandene Cloud-Installation fällt dadurch nicht still auf lokalen Browsermodus zurück.

## V64 – Schließen im lokalen Ordner-Modus
Nach einer erneuten Browserfreigabe wird die verbundene `lager.db` direkt lesend geprüft. Diese Prüfung ist nicht an den Cloud-Modus gebunden. Danach läuft derselbe geschützte Synchronisationsweg. Beschädigte Dateien, fremde `database_id` und Parallelkonflikte bleiben gesperrt.
