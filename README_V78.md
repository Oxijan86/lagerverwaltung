# Lagerverwaltung Lovrencic – Version 78.0

Veröffentlicht: 25.10.2026. Grundlage: GitHub-Version 77, Commit `230346f`.

## Änderungen

- PDF-Leistungsdatum aus dem Datumsblock im Dateinamen: JJJJMMTT, danach optional Uhrzeit. `ZusFassung_20260923092626 .pdf` ergibt 23.09.2026. Das Datum wird im Bericht und in den Materialzeilen vorausgefüllt und kann korrigiert werden.
- Für PDF-Entnahmen zählt nur die positive Zahl. Die Einheit kommt aus den vorhandenen Artikelstammdaten; keine zusätzliche Abfrage, keine Umrechnung, keine Rundung. Arbeitszeit, Reisezeit und Kilometer bleiben ausgeschlossen.
- Eindeutig bereits gebuchte PDFs bleiben gesperrt. Zusätzlich erscheint bei gleichem Kunden und Leistungsdatum ein Hinweis mit früheren Buchungen; zusätzlicher Verbrauch muss ausdrücklich bestätigt werden. Auch alte V77-Importkennungen werden weiter erkannt.
- Bestell-Excel aus Materialanforderung direkt bei Einbuchung einlesen. Kleine und große Vorlage, Dezimalmengen, unbekannte Materialien und wiederholte Importe werden berücksichtigt. Gelieferte Mengen und Lieferdatum müssen geprüft werden.
- Smartphone-Vorschau als Artikelkarten; klare Abschlussanzeige und geleerte erledigte Eingaben bleiben erhalten.

## Update von der bereits vollständigen V77 auf GitHub Pages

1. Vor dem Update eine Datensicherung der eigenen `lager.db` erstellen.
2. `Lagerverwaltung_Lovrencic_V78_GitHub_Update.zip` entpacken.
3. Den **gesamten Inhalt** direkt in das Hauptverzeichnis des Repositorys hochladen. Die Unterordner `hilfe` und `tests` beibehalten. Keinen zusätzlichen V78-Oberordner anlegen.
4. Gleichnamige Dateien ersetzen und mit **Commit changes** speichern.
5. Nach der GitHub-Pages-Bereitstellung die Anwendung neu laden; am PC gegebenenfalls Strg+F5. Im Kopf muss **Version 78.0** stehen.

Der vorhandene Ordner `vendor` wird für dieses Update unverändert weiterverwendet und muss nicht erneut hochgeladen werden. Das Update enthält keine persönliche Datenbank und ersetzt keine Lagerdaten. Für eine vollständige Neuinstallation das Komplettpaket einschließlich `vendor` verwenden.

## Kurze Bedienung

**PDF:** Entnahme → PDFs auswählen → auslesen → Datum, Artikel und Anzahl prüfen → eventuellen Kunden-/Datumsabgleich prüfen → Prüfbestätigung → Materialien entnehmen.

**Excel:** Einbuchung → Bestell-Excel auswählen → einlesen → tatsächlich gelieferte Mengen korrigieren, fehlende Artikel entfernen, unbekannte Artikel anlegen oder ignorieren → Lieferdatum prüfen → Prüfbestätigung → Lieferung einbuchen.

Eine Bestellung ist kein Liefernachweis. Bereits verarbeitete Bestellpositionen sind gesperrt. Für eine weitere Teillieferung derselben Position ist ein bewusst neuer Vorgang mit ausschließlich den zusätzlichen Liefermengen nötig; es gibt keine automatische Restmengenverwaltung. Die ausführliche Erklärung steht im Hilfe-Reiter.

## Prüfungen und Grenzen

Siehe `TEST_RESULTS_V78.md`. Geprüft wurden 20 automatisierte Tests, die Syntax und tatsächliche Browser-Bedienwege mit der bereitgestellten PDF und Bestell-Excel. Die Smartphone-Ansicht wurde bei 390 Pixeln Breite in Chromium simuliert. Kein Test auf einem echten Smartphone und keine neue OCR-/Cloud-Synchronisationsprüfung. Die früher gemeldeten 346 V77-Tests lagen im Repository nicht vor und werden für V78 nicht als erneut bestanden ausgegeben.

Die GitHub-Pages-Seite wird erst durch deinen Upload aktualisiert. Ein Service-Worker-Cache ist keine Datensicherung.

## Tests ausführen

- `npm ci`
- `npm test`
- `npm run test:syntax`

Die Browser-Prüfskripte in `tests/` benötigen zusätzlich Playwright/Chromium. `LV_PDF_SAMPLE` und `LV_ORDER_SAMPLE` auf die beiden Beispieldateien setzen; dann `node tests/browser-imports.cjs` ausführen. Der Upgrade-Test `node tests/browser-upgrade.cjs` benötigt außerdem Git-Historie mit V77-Commit `230346f` (alternativ `LV_BASE_REF`). Optional: `LV_CHROMIUM_BIN`, `LV_PLAYWRIGHT_MODULE`, `LV_BROWSER_LIBRARY_PATH`, `LV_TEST_OUTPUT`. Originalberichte und Bildschirmaufnahmen werden nicht mit ausgeliefert.
