# Lagerverwaltung Lovrencic – Version 68

## Schwerpunkt
V68 verbessert die Smartphone-Suche im Lagerbestand, liefert die vollständige automatisierte Teststruktur samt CI mit aus und korrigiert zwei Import-/Idempotenzfälle.

## Smartphone-Suche
- laufende Trefferzahl direkt am Suchfeld
- erste passende Artikel direkt darunter: Artikelnummer, Bezeichnung, Istbestand
- Treffer sind touchfähig und springen zum Artikel
- Antippen eines Treffers beendet den Suchfokus; Details und ungespeicherte Entwürfe bleiben erhalten
- eindeutige Null-Treffer-Meldung
- Suche filtert lokal im bereits geladenen Artikelbestand und löst nicht bei jedem Tastendruck einen Datenbank-/Netzwerkzugriff aus
- PC-Tabelle und Spaltenreihenfolge bleiben unverändert

## Idempotente Wiederholungsversuche
Für `/api/delivery-note/commit`, `/api/service-report/commit` und `/api/import/commit` gilt jetzt: Wenn alle Positionen bereits verarbeitet sind und keine sonstige Änderung stattfindet, wird `persist()` nicht aufgerufen. Damit ändern sich SQLite-Inhalt, Revision, `revision_id`, Dirty-/Sync-Status und OneDrive-Schreibbedarf nicht. Wird tatsächlich gebucht oder im Servicebericht eine neue Maschine angelegt, erfolgt weiterhin genau eine Revisionierung.

## Create-and-book
Für neue Importartikel ist die Dokumentmenge die einzige Bestandswirkung. Beispiel `quantity=5` und `initial_stock=5`: Es entsteht genau eine Anfangsbuchung über 5 und Istbestand 5. Ein zweiter Buchungsschritt für denselben neuen Artikel entfällt. Bestehende Artikel werden weiterhin regulär mit der Importmenge eingebucht.

## Tests und CI
- `tests/` ist vollständig Bestandteil des Pakets.
- `tests/run-tests.js` bricht ausdrücklich ab, wenn keine Testdateien gefunden werden.
- `.github/workflows/ci.yml` führt `npm test` und die Build-/Syntaxprüfung aus.
- V68 ergänzt Verhaltens-, SQLite-Integrations-, Synchronisations- und UI-Suchtests.
- Zusätzlich wurde die Smartphone-Suche mit gerendertem V68-HTML/CSS/JavaScript in Headless Chromium bei 360, 390 und 430 px geprüft. Eine 300-px-Okklusion simuliert die geöffnete Android-Bildschirmtastatur. Dies ist ausdrücklich **kein Test auf einem physischen Android-Gerät**.

## Synchronisationsgrenze
Die bestehende V59–V67-Synchronisationslogik bleibt erhalten: `database_id`, Revision, `revision_id`, Cloud-Basis, Schreibsperre, Sync-Warteschlange sowie Prüfung unmittelbar vor und nach dem Cloud-Schreiben. Ein lokal synchronisierter OneDrive-Ordner besitzt weiterhin keine serverseitige atomare Compare-and-Swap-Garantie. Zwei exakt gleichzeitig schreibende Geräte können ohne ETag/`If-Match` nicht vollständig abgesichert werden. Eine solche Garantie würde eine gesonderte Architekturänderung, z. B. Microsoft Graph mit ETag/`If-Match` oder eine zentrale Datenbank, erfordern.
