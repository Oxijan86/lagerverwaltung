# Lagerverwaltung Lovrencic V88.20 – Änderungsumfang

**Auslieferungsart:** testfähiges Quellcode-Update zum manuellen GitHub-Upload. Die GitHub-Verbindung hat keine Schreibrechte (HTTP 403), daher weder Live-Commit noch automatische Freigabe.

## Installationsdateien

Die beiden Installationswege (Windows PowerShell oder Python) verändern in einer entpackten Kopie des GitHub-Projekts genau sechs Programmdateien:

1. `local_backend.js` – neuer geschützter Archivierungs-Endpunkt mit Preview, Bestands-/Inventur-/Buchungssperren, Backup, Audit, erneuter Prüfung und transaktionaler Archivierung.
2. `service-worker.js` – lädt die V88.20-Zusatzmodule und legt einen neuen PWA-Cache an.
3. `v88_4_export.js` – beim PDF-Mengeneintrag gilt vorrangig die Einheit der Original-RONDO-PDF.
4. `v88_20_core.js` – reine Prüf- und Entscheidungslogik für Artikelnummern und Sicherheitsregeln.
5. `v88_20_report.js` – gezählte Zusatzartikel als PDF und Word-Dokument.
6. `v88_20_assistant.js` – Anwenderoberfläche, Original-PDF-Ausschnitte, manuelle Artikelnummernkorrektur, Prüffortschritt, Sammelarchivierung und Hilfe.

## Wichtige Schutzregeln

- Keine automatische Änderung der `lager.db` beim Installieren.
- Neue Archivierung **entfernt keine Buchungen**. Sie setzt lediglich `articles.active=0` – nur bei Artikeln ohne Bestand, Anfangsbestand, Inventurzählungen, Buchungen, Lagerortbestände oder sonstige Verknüpfungen.
- Bei Konflikten im PDF-Prüfstand wird nicht stillschweigend überschrieben.
- PDF-Sichtprüfung verändert keine gezählten Mengen.
- Kein Inventurabschluss durch diesen Assistenten.
- Kein künstliches Nullsetzen ungeprüfter Positionen.
- Die bekannte I/1-Verwechslung wird als Vorschlag behandelt, nicht blind gleichgesetzt.

## Grenzen dieser Testversion

- Die PDF-Prüfstände sind bislang browserlokal; Geräteübergreifende PDF-Review-Synchronisierung und ein vollständiger Browser-/Smartphone-Endtest fehlen.
- Der echte GitHub-Branch konnte mangels Berechtigung nicht angelegt werden.
- Die bestehende Einzel-Löschfunktion wird nicht verändert. Für sichere Mehrfachaktionen bitte ausschließlich die neue Archivierungsfunktion verwenden.
- Das manuelle Prüfen am Originalbild bleibt bei scanbedingten OCR-Zweifeln erforderlich.

## Tests

- `test_v88_20_core.cjs`: Vorschläge, Status, manuelle I/1-Korrektur, Bestandsschutz, echte 0 vs. leer
- `test_v88_20_report.cjs`: gezählt-only Auswahl, valide PDF
- `test_v88_20_patch.py`: idempotente Quellcode-Patches, Backups, sechs Dateien, Node-Syntax, Einheitenkorrektur

Diese Tests liefen erfolgreich in einer isolierten Umgebung. Kein Live-PWA-/Mehrgeräte-Test.
