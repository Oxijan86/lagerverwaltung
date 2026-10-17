# Lagerverwaltung Lovrencic – Version 75

V75 ergänzt den eigenen Reiter **Inventur** für PC und Smartphone. Das vollständige Paket enthält auch sämtliche bisherigen Funktionen aus V74.

## Neu

- Inventuren benennen, starten, zwischenspeichern, nach einem Neustart fortsetzen und später abschließen.
- Artikelsuche nach Artikelnummer, Bezeichnung, Barcode und Lagerort, auch mit mehreren Suchwörtern.
- Filter für offene/gezählte Positionen, geänderte Bestandsstände und Lager; 30 Artikel pro Seite und mobile Eingabekarten.
- Automatisches Zwischenspeichern nach der Eingabe und zusätzlicher Button **Zwischenstand speichern**.
- Leeres Zählfeld bleibt ungezählt; 0 bedeutet tatsächlich gezählten Nullbestand. Dezimalmengen mit Komma oder Punkt werden unterstützt.
- Lagerorte während der Zählung zuordnen und neue Lager sowie Lagerorte direkt im Inventurbereich anlegen.
- Notizen je Artikel, Fortschrittsanzeige, CSV-Export und archivierte abgeschlossene/abgebrochene Zähllisten.
- Gespeicherte Inventuren sind Bestandteil der `lager.db`, ihrer Backups und der bestehenden Dateisynchronisierung.

## So wird gezählt

1. **Inventur** öffnen, Namen eingeben und **Neue Inventur starten** wählen.
2. Artikel suchen, Menge in **Gezählt** eintragen und bei Bedarf Lagerort/Notiz ergänzen.
3. Zwischenspeicherung abwarten oder **Zwischenstand speichern** wählen. Später dieselbe gespeicherte Inventur öffnen.
4. Vor einem Gerätewechsel den Zwischenstand speichern und die aktuelle Lagerdatei synchronisieren oder auf dem anderen Gerät öffnen. Zwei unabhängige lokale Dateikopien werden nicht automatisch zusammengeführt.
5. **Abschluss prüfen** wählen. Wenn einzelne Artikel fehlen, weiterzählen oder bewusst einen Teilabschluss auswählen.
6. Mit **Inventur verbindlich abschließen** und Administratorfreigabe die gezählten Bestände und Lagerorte übernehmen.

Zählen und Zwischenspeichern verändern noch keine Bestände. Bei neuen Buchungen oder geänderten Lagerorten seit dem Ausgangsstand muss der betroffene Artikel aktualisiert und erneut gezählt werden. Ungezählte Artikel werden auch beim Teilabschluss nicht auf 0 gesetzt. Ein wiederholter Abschluss erzeugt keine Doppelbuchung.

Die Neuanlage von Lagern/Lagerorten speichert diese Stammdaten sofort nach Administratorfreigabe; ihre Artikelzuordnung erfolgt erst beim Inventurabschluss. Bestehende Lagerorte bleiben erhalten. Neue zugeordnete Lagerorte erscheinen auch in der übrigen App als `Lager / Lagerort`.

## Schutz und Speicherung

Zählstände werden in zusätzlichen SQLite-Tabellen gespeichert; bestehende Artikel und Buchungen bleiben bei der Migration erhalten. Die Inventur prüft ihren Versionsstand, Bestandsänderungen und den bestehenden Schreibschutz. Vor Bestandskorrekturen wird ein Sicherheitsbackup angelegt. Änderungen erfolgen gemeinsam in einer Transaktion und werden protokolliert.

Ungespeicherte Eingaben werden zusätzlich lokal im Browser für eine Wiederherstellung gehalten. Bei Speicherfehlern erscheint eine Meldung. Diese lokale Kopie ist kein Ersatz für die gespeicherte Lagerdatei und wird beim Gerätewechsel nicht automatisch mitgenommen. Bei Bedarf kann sie über **Lokale Eingaben herunterladen** gesichert werden.

Für den Gerätewechsel wurde außerdem die fehlende `LVSyncCore`-Referenz bei **Lokalen Stand verwenden** behoben, die den Start nach einem Dateiimport blockieren konnte.

## Update

Die App-Dateien in der vorhandenen Bereitstellung aktualisieren und neu laden. Die App zeigt **75.0** und verwendet einen neuen Service-Worker-Cache. Die vorhandene `lager.db` weiterverwenden; eine neue Ersteinrichtung ist nicht nötig. Die bisherige Inventur im CSV-Center bleibt ebenfalls enthalten.

Ausführliche Bedienung: `hilfe/14-inventur.md`, auch im Reiter Hilfe verfügbar. Testergebnisse: `TEST_RESULTS_V75.txt`. Testbefehle und Abhängigkeiten: `README_V70.md`.
