# Testbericht Lagerverwaltung Lovrencic V81.0

**Ergebnis: 35/35 automatische Tests erfolgreich; 30/30 Browser-Prüfungen erfolgreich; 28/28 JavaScript-Syntaxprüfungen erfolgreich.**

## Node.js – reale SQLite-Engine im Testadapter

- Bisherige V80-Tests zum PDF-Servicebericht, Haupt- und Untertickets, technischen Typkennungen, Materialregistrierung, Version und PWA laufen weiterhin.
- V80→V81-Migration: neue eindeutige Kennungen für Buchungen und Audit, bisherige Zeilen und Inhalte erhalten.
- Paralleländerungen: fünf unabhängige Smartphone-Buchungen und eine PC-Buchung werden anhand der IDs einmalig übernommen; Bestand korrekt.
- Konflikte an demselben Artikel: verschiedene Mindestbestände erfordern explizite Auswahl.
- Derselbe Buchungsvorgang mit identischer Kennung wird nicht ein zweites Mal eingebucht.
- Gleichzeitiger Import derselben Position mit verschiedenen Buchungskennungen führt zu einer Sperre (Doppelimportgefahr).
- Fehlende gemeinsame Ausgangsversion, parallele Stammdatenänderungen und lokale Artikellöschung werden sicher blockiert.
- Cloud-Berechtigung fehlt: kein Schreibzugriff.
- Unterbrochener Schreibvorgang: kein Erfolgssignal.
- Änderung der Cloud während der Schreibvorbereitung: kein Schreibzugriff.
- Cloud-Rückleseprüfung nach erfolgreichem Schreiben erfolgt vor Erfolgsmeldung; falsche Revision führt zu einem Fehler.

## Chromium – echte Browser-Interaktionen mit simulierten Cloud-/DB-Antworten

- Smartphone 390×844 und Desktop 1280×900: Synchronisierungsaufforderung, später verschieben, wieder anzeigen, erfolgreich synchronisieren, Fehler sichtbar halten, Ordnerfreigabe erneuern, Konfliktvergleich und Auswahlfelder.
- CSV: synthetische Datei mit **630 Positionen**, 50 Positionen pro Seite, Wechsel der Seiten, Merken von sieben angelegten neuen Artikeln, Filtern nach neuen Positionen und Fehlern, Materialsuche.

## Syntax und Versionskonsistenz

- **25** Top-Level-JavaScript-Dateien und **3** eingebettete HTML-JavaScript-Blöcke: Syntax OK.
- Frontend, Backend, PWA-Manifest und Service-Worker: alle V81.0 bzw. neuer Cache-Schlüssel.

## Testgrenzen

Keine echte produktive `lager.db` und kein persönlicher OneDrive-Cloudzugang verwendet. Ein vollständiger Geräte-übergreifender End-to-End-Test mit dem **tatsächlichen OneDrive-Serverupload** wurde nicht durchgeführt. Für die Browser-Tests wurden Cloud-/Datenbankantworten simuliert; der SQLite-Abgleich wurde zusätzlich mit einer nativen SQLite-Test-Engine geprüft. Ein serverseitiges exklusives Dateilock / Compare-and-Swap kann die bestehende Ordner-API nicht garantieren.

Diese Grenzen sind in der Anwendung und im README dokumentiert. Vor der produktiven Umstellung zuerst Testbuchungen mit einer Kopie der Datenbank ausführen.
