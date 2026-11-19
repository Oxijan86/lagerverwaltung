# Änderungsliste – Lagerverwaltung Lovrencic V88.12

## Speichersicherheit (neu)
- `v88_12_save_guard.js`: lokale Vorprüfung jeder Inventurposition auf stimmige Mengen, richtige Ganzzahl-/Dezimalformate und konsistente Lagerort-Teilmengen. Mit konkretem Artikelhinweis und einer interaktiven Reparaturkarte.
- `service-worker.js`: Einbau der Vorprüfung in `inventory_ui.js` **vor** dem API-Speichern; gültige Änderungen werden auch bei einzelnen ungültigen Entwürfen gespeichert, ungültige lokal gesichert und nicht gelöscht. Ein gezieltes, bestätigungspflichtiges Rücksetzen eines betroffenen Zählwerts ist möglich, bei vorhandenen Teilmengen bewusst gesperrt.
- `service-worker.js`: Fix des fehlenden globalen `syncStatus()`-Aufrufs im bestehenden HTML; auf Aktualisierung mit Version 88.12 umgestellt. Bestehende PDF-/Inventur-/Lagerort-Patches erhalten.

## Mengen
- `4,7` und `4.7` bei echten Meterartikeln (`m`) sowie z. B. `1,25` werden akzeptiert.
- Stückartikel bleiben ganzzahlig. Ein als `Stk.` angelegter Rohrartikel wird **nicht** ohne ausdrückliche Stammdatenkorrektur in `m` umgedeutet.
- Eine tatsächlich gezählte Null bleibt von einer leeren (ungezählten) Eingabe unterscheidbar.

## Hilfe, Version und Prüfungen
- `v88_4_help.js`: neue Hinweise zu Fehlerdiagnose, Zwischenstand, Komma und Wiederherstellung.
- `manifest.webmanifest`, `v88_ocr.js`: Versionsanzeige V88.12.
- `test_v88_12.cjs`: neue Tests mit dem realen Fehlerfall aus einer anonymisierten Zweipositionen-Wiederherstellungskopie; ergänzt die aktualisierten Altversionstests.
- Keine Änderung an `lager.db`, IndexDB-Schema, Bestandsbuchungslogik, RONDO-Original-PDF oder bestehender Inventur bei der Installation.

## Grenzen
Der vollständige End-to-End-Test in der tatsächlichen GitHub-Pages-/Android-Umgebung ist offen. Der Chromium-Start in der Testumgebung funktionierte nicht. Die Software kann beim Auftreten neuer, bisher unbekannter Speicherfehler weiterhin Fehlermeldungen anzeigen; lokale Entwürfe bleiben dann geschützt.
