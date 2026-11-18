# Lagerverwaltung Lovrencic – V88.6

## Aktualisierte Programmdateien

- `service-worker.js`: V88.6-Boot, Versionscache, sichere Delegation der PDF-Ausgabe und zurückgestellte Positionen beim Import auslassen
- `v88_6_pdf.js`: neues, verlustfreies inkrementelles PDF-Overlay; Originalseiten bleiben bytegetreu erhalten
- `v88_3_review.js`: direkte Einzelprüfung, später zuordnen, zurückholen; bessere Vorschläge für ähnliche Nummern und Bezeichnungen
- `v88_4_export.js`: sichere Speicherung von Zählzwischenständen; keine Ausgabe für zurückgestellte Materialnummern
- `v88_4_help.js`: aktualisierte Anleitung für Import, offene Positionen und korrekten PDF-Druck
- `v88_ocr.js`: Versionsanzeige 88.6 und bestehender OCR-Schutz
- `manifest.webmanifest`: Version 88.6

## Beibehaltene und erneut enthaltene Module

`v88_2_catalog.js`, `v88_3_setup.js`, `v88_5_import.js`: abgesicherter 72-Seiten-Import der bytegenau geprüften RONDO-PDF sowie die bisherigen Ersteinrichtungswege.

## Sicherheitsregeln

- PDF-Erzeugen und OCR-Prüfen ändern keine Lagerbestände.
- Zählzwischenstände sind vor Abschluss keine Lagerbewegungen.
- Erst „Inventur verbindlich abschließen“ darf echte Bestandskorrekturen auslösen.
- Ungeklärte Artikel werden weder automatisch registriert noch mit null gebucht.
- Andere nicht geprüfte RONDO-Vorlagen werden für den PDF-Export ausdrücklich abgelehnt.
