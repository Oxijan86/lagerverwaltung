# Lagerverwaltung Lovrencic – Version 76

Das vollständige Paket enthält alle Funktionen aus V75 einschließlich Inventur, Artikelsuche und gespeicherten Zwischenständen. V76 ergänzt die gemeinsame Lagerverwaltung im Lagerbestand, bei neuen Materialien und in der Inventur.

## Lagerbestand und Bestandskontrolle

1. **Lagerbestand** öffnen. Auf dem Smartphone beim gewünschten Artikel **Details anzeigen** antippen.
2. **Lager** auswählen und bei Bedarf einen **Lagerort** ergänzen. Der Lagerort darf leer bleiben.
3. Für fehlende Einträge **+ Lager / Lagerort** öffnen, Lager oder Lagerort anlegen und **Auswahl übernehmen** wählen.
4. Mit **Speichern** beim Artikel oder **Alle Änderungen speichern** die Zuordnung sichern.

Auswahl und Neuanlage sind ohne Kennwort möglich. Ein Lagerwechsel leert einen nicht zum neuen Lager passenden Lagerort. Ungespeicherte Zuordnungen bleiben bei der Artikelsuche und zusammen mit anderen Artikeländerungen erhalten. Istbestand und Mengenbuchungen werden durch die Zuordnung nicht geändert.

## Standardlager

**Lager / Lagerorte und Standardlager verwalten** öffnen, das Lager auswählen und **Ausgewähltes Lager als Standard speichern** wählen. Dieses Lager wird bei neuen Materialien und noch nicht zugeordneten Artikeln vorausgewählt. Bereits gespeicherte Zuordnungen werden nicht pauschal geändert. **Ohne Lager** lässt sich ausdrücklich speichern; diese Auswahl bleibt erhalten. Im Verwaltungsdialog kann mit **Ohne Lager** auch der Standard entfernt werden.

Lager, Lagerorte und Standardlager sind Bestandteil der lager.db und ihrer Backups. Für einen Gerätewechsel die aktuelle Lagerdatei synchronisieren oder übertragen.

## Inventur

Lager und optionaler Lagerort lassen sich je Artikel auswählen und zwischenspeichern. Neue Lager und Lagerorte sind auch hier ohne Kennwort anlegbar. Die gemeinsame Verwaltung des Standardlagers ist ebenfalls erreichbar. Die Zuordnung wird erst beim Inventurabschluss für tatsächlich gezählte Artikel übernommen. Ungezählte Artikel bleiben unverändert.

Ändert eine Bestandskontrolle zwischenzeitlich das Lager oder den Lagerort eines gezählten Artikels, erkennt die Inventur dies als Konflikt. Vor dem Abschluss den betroffenen Bestandsstand aktualisieren und erneut zählen. Der bestehende Schutz für Bestandskorrekturen und den verbindlichen Inventurabschluss bleibt erhalten. Der CSV-Export enthält auch Lagerzuordnungen ohne Lagerort.

## Update

Die vorhandene lager.db zunächst sichern. Das vollständige App-Paket in der bestehenden Bereitstellung aktualisieren und die App neu laden. Die Anzeige lautet **76.0**. Die vorhandene Lagerdatei und Inventuren weiterverwenden; eine neue Ersteinrichtung ist nicht erforderlich. Vorhandene Lagerzuordnungen aus V75-Lagerorten werden beim Öffnen übernommen. Der neue Service-Worker-Cache lädt die aktualisierten Module.

## Prüfung

321 erfolgreiche automatisierte Prüfungen, einschließlich echter Chromium-Bedienung am PC, Smartphone-Ansichten bei 360/390/430 Pixeln und einem frischen mobilen Browserkontext. Getestet wurden auch die Übernahme vorhandener V74-/V75-Dateien, Inventur mit über 600 Positionen, Speicherfehler und Neustart. Es fand kein Test auf physischer Smartphone-Hardware statt.

Einzelheiten: TEST_RESULTS_V76.txt. Die Bedienhinweise sind auch im Reiter Hilfe enthalten. Bestehende Excel-Vorlagen bleiben unverändert.
