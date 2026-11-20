# Lagerverwaltung Lovrencic V88.20 – Release

## Geänderte GitHub-Dateien

1. `service-worker.js`: Cache/Versionskennung V88.20, V88.20-Module im korrekten Ladepfad; aktualisiert auch ältere Offline-HTML-Startseiten.
2. `local_backend.js`: API-Version 88.20, sichere Sammelarchivierung und Wiederherstellung, technische Import-Nullbuchungen erlaubt ohne Bewegungsdaten zu löschen, gezählte Artikel geschützt. Eigene Tabellen für geräteübergreifenden PDF-Prüfstatus und I/1-Dublettenprüfung mit Konflikterkennung.
3. `v88_4_export.js`: PDF-Einheit als Referenz, ergänzt den JSON-Prüfstand um `review_v8820` und `reviewed_at`.
4. `sync_merge_v82.js`: neue Review-Tabellen in die Konflikterkennung aufgenommen (kein stilles Überschreiben).
5. `v88_20_core.js`: Prüfentscheidungen, manuelle Nummernkorrektur, Verwechslungs-Vorschläge, offene Positionen.
6. `v88_20_assistant.js`: Originalzeile mit Zoom und Ganzseitenansicht, Buchstaben-/Zahlenkorrektur, Zählwarnungen, Mehrfachauswahl, unabhängiger Dubletten-Prüfstatus, Archivierungsvorschau, Restore, Zusatzbericht.
7. `v88_20_report.js`: separat gelistete *tatsächlich gezählte* Artikel ohne sichere Original-PDF-Position als PDF oder DOCX.

## Grundsätze

- Original-RONDO-PDF unverändert, kein automatischer Inventurabschluss.
- Keine Nullwerte für ungezählte Positionen.
- Keine automatische Übertragung von Zählwerten zwischen unterschiedlichen Artikel-IDs.
- RONDO-PDF-Einheiten maßgeblich; Zahlen unverändert.
- Vor Sammelarchivierung Backup, Audit und zweimalige Bestätigung.
- Für fehlerhafte ungezählte Artikel werden bei Archivierung ausschließlich **leere** Draft-Inventurplatzhalter entfernt; gebuchte Mengen/Buchungen bleiben erhalten.
- Prüfentscheidungen werden zusätzlich in `lager.db` gespeichert; gescannte Original-PDF bleibt im Browser.

## Testnachweise

`test_v88_20_core.cjs`, `test_v88_20_report.cjs`, `test_v88_20_patch.py`,
`test_v88_20_backend_real.cjs` (nur mit lokaler Sicherung der DB),
`test_v88_20_browser.py` (Chrome UI mit isoliertem Datenbank-Stub).

Ein produktiver Zwei-Geräte-/GitHub-Pages-End-to-End-Test ist vor Ort erforderlich.
