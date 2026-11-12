# Testprotokoll – Lagerverwaltung V84.0

## Automatische Funktionstests
- `npm test`: **74/74 erfolgreich**. Die Tests enthalten die früheren PDF-, CSV-, Inventur-, Cloud- und Konflikttests sowie vier neue V84-Testgruppen.
- `npm run test:syntax`: **30 JavaScript-Dateien** auf Syntax und Versionskonsistenz geprüft.
- `python tests_v84/test_inventory_browser.py`: **2 Browsergrößen** (390 und 1280 Pixel), je **17 Prüfungen**, erfolgreich.

## Für die Inventur neu geprüft
1. Zählbereich „Sortimo Ketten“ auswählen und bei erster Zählung übernehmen.
2. Bereits gezählten Artikel um weitere Stück erhöhen: 2 + 4 = 6.
3. Schon gezählten Artikel aus einem anderen Lagerort erhöhen, ohne den alten Lagerort zu überschreiben.
4. Bestehenden Suchtext automatisch markieren und durch neue Artikelnummer ersetzen; Suchfeld per X leeren.
5. Inventur-Zwischenstand lokal speichern, ohne tatsächliche Bestandsbuchung vorzunehmen.
6. Laufender Inventurmodus mit manueller Cloud-Option: Kein synchronisierungsaufforderndes Popup nach einem lokalen Speicherereignis.
7. Fehlermeldungen für negative, leere, ungültige oder gebrochene Stückzahlen sowie noch nicht angelegte Lagerorte.
8. Versionsanzeige und Cache-Schlüssel auf 84.0 aktualisiert.

## Grenzen
Die Integrationstests nutzen eine simulierte Datenbank-API. Ein produktiver Test mit der echten `lager.db` auf mehreren Geräten sowie die tatsächliche Synchronisierung in OneDrive sind **nicht durchgeführt**. Vor produktivem Einsatz unbedingt eine Sicherheitskopie der Datenbank erstellen und die neuen Funktionen mit einer Datenbankkopie prüfen.
