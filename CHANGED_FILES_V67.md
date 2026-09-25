# Geänderte Dateien – Version 67

## `index.html`
- Smartphone-Lagerbestand: standardmäßig nur Artikelnummer, Bezeichnung, Istbestand und „Details anzeigen“.
- Aufklappbare Details mit Mindest-/Sollbestand, Lagerort, Maschinenzuordnung, Speichern und Status.
- Aufklappzustand bleibt pro Artikel erhalten; mehrere Artikel können gleichzeitig offen sein.
- `aria-expanded` / `aria-controls`, mindestens 44 px Touchhöhe und gemeinsame Entwurfsdaten.
- Eindeutiger Ansichtswechsel: **Änderungen speichern / Änderungen verwerfen / Abbrechen**.
- M365-Vorgangskennung wird aus der Preview übernommen; „Als neuen Vorgang starten“ erzeugt bewusst eine neue Kennung.
- Erfolgreiche Buchung/Materialanlage wird nicht durch einen nachgelagerten UI-Refresh fälschlich als fehlgeschlagen gemeldet.

## `local_backend.js`
- Neue SQLite-Tabelle `import_position_results` mit eindeutigem Schlüssel `(operation_id, source, position_key)`.
- Persistenter M365-/Import-Idempotenzschutz über Browser-/App-Neustarts hinweg.
- Artikelanlage, Anfangsbuchung und Importpositionsstatus gemeinsam transaktional.
- Manuelle Mehrfachbuchungen, Lieferschein, Servicebericht, CSV/SAP, Inventur und Create-and-book werden vorab validiert und atomar geschrieben.
- Legacy-Adminpasswörter mit 6/7 Zeichen können nach erfolgreicher Prüfung auf PBKDF2 migriert werden.
- Zentrale Stammdatenänderungen und Datumsformatänderungen verlangen ein **gültiges Backend-Sitzungstoken**; ein Passwortwert allein ersetzt dieses Token nicht.
- Neue zentrale Maschine aus Servicebericht sowie Alias/Zusammenführen/Trennen verlangen ebenfalls eine gültige Admin-Sitzung.
- Setup prüft Passwortwiederholung backendseitig.
- Inventur prüft Adminberechtigung vor dem Sicherheitsbackup.
- Öffentliche produktive Test-Fehlerschalter sind entfernt.
- Eingebettete Hilfe auf die korrigierte Bestands- und Sicherheitslogik aktualisiert.

## `v67_core.js`
- `ArticleDraftStore`: genau ein gemeinsamer Entwurf je Artikel-ID.
- `StockDetailsState`: unabhängiger Aufklappzustand pro Artikel.
- vollständige Batch-Vorvalidierung.
- Idempotenz-/Rollback-Testkern.
- Setup-Validierung.
- `requireAdminSession()` für exakt vom Backend ausgestellte Sitzungstoken.

## `auth_core.js`
- Bereits vorhandene PBKDF2-Logik bleibt erhalten.
- `hashVerifiedLegacyPassword()` erlaubt die Migration korrekt geprüfter alter 6-/7-stelliger Passwörter ohne die neue Mindestlänge auf das Altpasswort anzuwenden.

## Dokumentation
- `README_V67.md` neu.
- `README_V64.md` fachlich korrigiert: Materialanforderung nur bei `Ist < Mindest`, Menge `max(0, Soll - Ist)`.
- `hilfe/01-dashboard.md`, `hilfe/02-neues-material.md`, `hilfe/03-lagerbestand.md`, `hilfe/04-einbuchung.md`, `hilfe/06-materialanforderung.md`, `hilfe/09-stammdaten.md` aktualisiert.
- Historischer V64-Testbericht mit Hinweis versehen, dass die damalige Bestellziel-Aussage ab V65 fachlich ersetzt wurde.

## Tests
- `tests/v67-integration.spec.js`: funktionale V67-Regeln einschließlich 360/390/430 px Zustandsprüfung.
- `tests/v67-sqlite-integration.spec.js`: echte temporäre SQLite-Datei für Idempotenz nach DB-Neuöffnung und vollständigen Rollback.
- `tests/v67-security-behavior.spec.js`: verhaltensbasierte Admin-Token-, Datumsformat-, Setup- und Inventur-Sicherheitsprüfungen.
- Bestehende V59–V66 Sync-, API-, Sicherheits-, Revisions- und Service-Worker-Regressionstests bleiben enthalten.
