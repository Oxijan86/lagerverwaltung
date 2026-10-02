# Lagerverwaltung Lovrencic – Version 70

V70 baut auf dem vollständigen V69-Paket auf. Die vorhandene Firmenvorlage mit 630 Materialzeilen und beide Materialanforderungs-Vorlagen bleiben enthalten.

## CSV-Center

Die in V69 fehlende Funktion `downloadResponse()` wurde implementiert. Alle sechs Exportbuttons erzeugen wieder Dateien: Firmenbestand CSV/XLSX, normaler Lagerbestand, Einbuchungen, Entnahmen und Inventurliste. Downloadfehler erscheinen im jeweiligen Meldungsfeld. Der Blob-Link bleibt 30 Sekunden gültig.

Dateiauswahl, erneute Vorschau, neuer Vorgang, Bestätigung, Ignorieren und Neuanlage wurden über die echte Oberfläche mit SQL.js/IndexedDB geprüft. Während einer Firmenvorschau ist die Bestätigung gesperrt. Neuere Vorschauen verdrängen veraltete Antworten; die Entscheidung „Anlegen“ bleibt beim erneuten Prüfen erhalten. Der erweiterte Textimport und dessen separat eingeblendeter Neuanlage-Button wurden ebenfalls geprüft.

Die ältere Inventur akzeptiert jetzt Zählbestand 0. Fehler aus dem Textparser werden angezeigt. Inventurdateien wählen „Gezählter Bestand“ anhand der Überschrift, statt Systembestand oder Lagerort als Menge zu lesen. Leere Zählfelder sind Fehler. CSV-Dateien werden als UTF-8 oder Windows-1252 dekodiert, bevor der Tabellenparser sie liest.

## Smartphone-Einrichtung

Bei einer frischen Installation überlagert der Startprüfungsdialog den Einrichtungsassistenten nicht mehr. Der Assistent ist auf schmalen Displays passend umbrochen und bedienbar.

- Mit unterstützter Ordnerauswahl können lokaler Ordner oder synchronisierte Cloud-Ablage ausgewählt werden. Der Picker wird direkt aus der Klickaktion aufgerufen.
- Ohne Ordnerauswahl steht **Lagerdatenbank auf diesem Gerät erstellen** als erste Speicheroption bereit. Alle fünf Einrichtungsschritte funktionieren. Danach öffnet sich Dateisynchronisierung mit **lager.db herunterladen**.
- Eine vorhandene Datenbank lässt sich über die normale Dateiauswahl öffnen.
- Eine vorhandene `lager.db` wird durch „Neue Datenbank“ nicht automatisch überschrieben.

Die Browser-Datenbank bleibt auf diesem Gerät gespeichert. Ein Download ist eine Kopie. Ohne verbundenen, zugänglichen Ordner gibt es in diesem Modus **keine automatische Cloud-Synchronisation**. Eine browserseitige Datei-/Ordnerauswahl kann fehlende Betriebssystem- oder Cloudanbieter-Unterstützung nicht ersetzen.

## Verbrauchsmaterial ohne Artikelnummer

In **Materialanforderung → Verbrauchsmaterial ohne Artikelnummer** lassen sich Bezeichnung und Einheit dauerhaft speichern. Anschließend den Eintrag auswählen, Anzahl eingeben und **Zur Materialanforderung hinzufügen** wählen. Bestellpositionen können abgewählt oder entfernt werden. „Unterbestand laden“ erhält die hinzugefügten Verbrauchsmaterialpositionen.

Verbrauchsmaterial liegt in einer zusätzlichen SQLite-Tabelle `consumables`, mit eigener stabiler ID. SAP-Artikel und Lagerbestandsauswertung erhalten keine künstlichen Artikelnummern. Verbrauchsmaterial ist Bestandteil von `lager.db`, Backups und der bestehenden Dateisynchronisation.

| Gesamtzahl ausgewählter Positionen | Excel-Ausgabe |
| --- | --- |
| Bis 25 | Standardvorlage: normale Artikel ab Zeile 4; Verbrauchsmaterial ab Zeile 31 im vorhandenen Abschnitt „Verbrauchsmaterial ohne Nummer“ |
| Ab 26 | Große Vorlage: alle Positionen in normalen Zeilen; Artikelnummer bei Verbrauchsmaterial bleibt leer |

Die zehn vorbereiteten Verbrauchsmaterialzeilen der kleinen Vorlage werden bei Bedarf bis zur benötigten Anzahl erweitert. Auch 25 Verbrauchsmaterialien werden vollständig exportiert. Doppelte Positionen werden pro Material-ID zusammengefasst; Artikel-ID und Verbrauchsmaterial-ID bleiben getrennt. Der Export öffnet die erzeugte Datei erneut und prüft Mengen, Bezeichnungen, Artikelnummern und Zellzuordnung.

## Lagerort optional

Ein leerer interner Lagerort ist zulässig bei manueller Materialanlage, unbekannten Materialien aus Einbuchung/Entnahme, separater CSV-Neuanlage, kombinierter CSV-Neuanlage mit Buchung sowie Firmenimport. Firmen-Lagerort `1025` bleibt unabhängig vom internen Lagerort.

## Update

Die App-Dateien dieser Folgeversion in der vorhandenen Bereitstellung aktualisieren und die Seite neu laden. V70 besitzt einen neuen Service-Worker-Cache. Die bestehende `lager.db` weiterverwenden; eine erneute Ersteinrichtung ist für ein Update nicht erforderlich. Es werden keine vorhandenen Artikel, Buchungen oder Lagerorte gelöscht. Die zusätzliche Verbrauchsmaterial-Tabelle wird automatisch ergänzt.

## Tests reproduzieren

Node.js 20 oder neuer, Python 3.12 und Chromium:

```sh
npm ci
python3 -m pip install -r tests/requirements.txt
python3 -m playwright install --with-deps chromium
npm test
npm run test:syntax
```

`CHROMIUM_EXECUTABLE` kann auf einen vorhandenen Chromium zeigen. `LV_TEST_ASSETS` kann für Tests ein Verzeichnis mit den fünf CDN-Dateien enthalten; ansonsten werden die festgelegten npm-Testabhängigkeiten verwendet. Der GitHub-Workflow installiert diese Abhängigkeiten vor dem Testlauf.

Die Smartphone-Tests verwenden Chromium mit Touch- und Mobile-Emulation bei 360/390/430 Pixeln. Die Ordnerpfade wurden mit echten serialisierbaren FileSystemDirectoryHandles aus OPFS und einem simulierten Picker geprüft. Dies ist **kein Test auf einem physischen Android-Smartphone** und keine Zusicherung für die Ordnerfreigabe jedes Browsers oder Cloudanbieters.

Bestehende Revisionen, Datenbankidentität, Konfliktschutz, Schreibsperren und Sync-Warteschlange bleiben erhalten. Die bestehende Grenze der lokalen Cloud-Dateisynchronisation ohne serverseitigen atomaren Compare-and-Swap bleibt bestehen.
