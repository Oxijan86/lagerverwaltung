# Lagerverwaltung Lovrencic – Version 67

## 1. Smartphone-Lagerbestand

Auf dem PC bleibt der Lagerbestand als vollständige Tabelle mit der Reihenfolge Artikelnummer, Bezeichnung, Istbestand, Mindestbestand, Sollbestand, Lagerort, Maschinenzuordnung und Aktionen erhalten.

Auf Smartphones bis 700 px werden zunächst nur Artikelnummer, Bezeichnung und Istbestand angezeigt. **Details anzeigen** klappt Mindestbestand, Sollbestand, Lagerort, Maschinen, Speichern und Speicherstatus direkt am Artikel auf. Mehrere Artikel können gleichzeitig geöffnet bleiben. Der Aufklappzustand bleibt bei einem erneuten Rendern in derselben Sitzung erhalten. Die Schaltflächen verwenden `aria-expanded` und `aria-controls`; Touchflächen bleiben mindestens 44 px hoch.

Ungespeicherte Änderungen werden auch im eingeklappten Zustand mit **Ungespeichert** gekennzeichnet. Suche, Filter und Auf-/Zuklappen verändern den gemeinsamen Entwurf nicht.

## 2. Persistenter M365-Idempotenzschutz

V67 verwendet die SQLite-Tabelle `import_position_results` mit dem eindeutigen Schlüssel aus `operation_id`, `source` und `position_key`.

- M365-/Importvorschauen erhalten eine stabile Vorgangskennung.
- Artikelanlage, Anfangsbuchung und Kennzeichnung der verarbeiteten Position liegen in derselben Transaktion.
- Ein Retry derselben Position liefert das vorhandene Ergebnis zurück.
- Der Schutz bleibt nach Browser- oder App-Neustart bestehen, weil er in `lager.db` gespeichert ist.
- **Als neuen Vorgang starten** erzeugt bewusst eine neue Vorgangskennung für tatsächlich neue Dokumente mit identischem Inhalt.
- Die frühere rein browserseitige `deliveryInitialBooked`-Sperre wurde entfernt.

## 3. Atomare Mehrfachbuchungen

Manuelle Mehrfachbuchungen, Lieferschein, Servicebericht, CSV/SAP, Inventur und Create-and-book validieren alle Positionen vor dem ersten Buchungseintrag. Danach werden alle Positionen in genau einer Transaktion geschrieben. Bei Fehler wird vollständig zurückgerollt.

## 4. Legacy-Passwörter

Bereits vorhandene, gültige Altpasswörter mit 6 oder 7 Zeichen können sich weiterhin anmelden. Nach erfolgreicher Altprüfung werden sie direkt mit PBKDF2, zufälligem Salt und den bestehenden Sicherheitsparametern migriert. Die Mindestlänge von 8 Zeichen gilt für neue, geänderte und zurückgesetzte Passwörter.

## 5. Gemeinsamer Artikelentwurf

Dashboard und Lagerbestand verwenden in V67 genau einen Entwurf pro Artikel-ID. Dadurch können Werte aus beiden Ansichten nicht mehr gegeneinander überschrieben werden. **Alle Änderungen speichern** speichert jeden Artikel nur einmal. Bei einem Fehler bleibt der Entwurf bestehen.

Beim Ansichtswechsel mit offenen Änderungen gibt es drei eindeutige Möglichkeiten:

- Änderungen speichern
- Änderungen verwerfen
- Abbrechen

Verwerfen löscht die Entwürfe tatsächlich; beim erneuten Öffnen werden wieder die gespeicherten Daten aus der Datenbank angezeigt.

## 6. Sicherheit

- Schreibende Änderungen an zentralen Technikern, Lagerorten, Maschinen und anderen Stammdaten benötigen ein **gültiges, vom Backend ausgestelltes Admin-Sitzungstoken**. Passwortwerte oder Frontend-Flags allein reichen dafür nicht aus.
- Die Zuordnung bereits vorhandener Lagerorte/Maschinen im Lagerbestand bleibt passwortfrei.
- Das Erstellen neuer zentraler Lagerorte/Maschinen ist administrativ geschützt – auch wenn es aus der Materialanlage ausgelöst wird.
- `/api/settings/date-format` verlangt ebenfalls ein gültiges Admin-Sitzungstoken.
- `/api/setup/complete` vergleicht Passwort und Passwortwiederholung backendseitig.
- `/api/inventory/commit` prüft die Adminberechtigung vor dem Sicherheitsbackup.
- Produktive Endpunkte enthalten keine öffentlich erreichbaren Fehler-Testschalter.

## 7. Bestandslogik

Verbindlich gilt weiterhin:

- Mindestbestand = Warn- und Bestellschwelle.
- Sollbestand = Auffüllziel.
- `0 <= Mindestbestand <= Sollbestand`.
- Wird Mindestbestand größer als Sollbestand eingegeben, wird **Sollbestand auf Mindestbestand angehoben**.
- Unterbestand ausschließlich bei `Istbestand < Mindestbestand`.
- Bestellmenge ausschließlich dann: `max(0, Sollbestand - Istbestand)`.

## 8. Synchronisation

Die V59–V66-Synchronisationsarchitektur mit `database_id`, Revision, `revision_id`, Cloud-Basis, Schreibsperre, Sync-Warteschlange sowie Pre-/Post-Write-Prüfung bleibt erhalten. V67 ändert nicht die technische Grenze des lokalen OneDrive-/Browser-Dateizugriffs: Er bietet keine serverseitige atomare Compare-and-Swap-Garantie zwischen zwei exakt gleichzeitig schreibenden Geräten.

## Kompatibilität

Bestehende V66-Datenbanken werden ohne destruktive Tabellenmigration geöffnet. Die neue Idempotenz-Tabelle wird ergänzend mit `CREATE TABLE IF NOT EXISTS` angelegt. Artikel, Buchungen, Stammdaten, Auditdaten, Backups und Synchronisationszustand bleiben erhalten.


## 9. Testabdeckung

V67 enthält zusätzlich echte Funktions-/Zustandstests für persistente Idempotenz, Transaktions-Rollback, Legacy-Passwortmigration, gemeinsamen Artikelentwurf und Admin-Sitzungstoken. Die SQLite-Tests öffnen eine reale temporäre SQLite-Datei erneut und prüfen, dass eine bereits verarbeitete M365-Position nach dem Neuöffnen weiterhin idempotent bleibt.

Native Android-/Windows-Browserinteraktionen (z. B. echter Langdruck oder systemeigene Dateiberechtigungsdialoge) können in der Build-Umgebung nicht physisch ausgelöst werden. Die zugehörigen HTML-/CSS-/State-/Berechtigungs-Codepfade werden automatisiert geprüft und diese Einschränkung ist im Testbericht ausdrücklich gekennzeichnet.
