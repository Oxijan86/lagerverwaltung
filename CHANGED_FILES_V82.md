# V82.0 – Überblick der Änderungen

## Datenbank, Löschung und Konfliktvergleich
- `local_backend.js`: V82-Ticket/Typfelder, Löschvermerke, Konfliktarchiv mit Originalkopien, selektive Nachübernahme, Backup und vorhandener V81-Cloudschutz; neue 29 Hilfetexte lokal eingebettet.
- `sync_merge_v82.js`: Datensatzvergleich nach eindeutigen Buchungskennungen, Stammdaten, Kunden, Maschine, Ticket, Löschung; Wiederherstellung ausgewählter Felder mit Sicherheitsprüfungen.
- `sync_ui_v82.js`: Konfliktarchivansicht, Einzelübernahme, Erfassung weiterer Angaben; Vermeidung verlorener Eingaben beim Filtern; native X-Warnung.
- `index.html`: V82-Anzeigen, Archivdialog, mobile Hilfe mit Direktzugriff, Suche und Schritt-für-Schritt-Inhalten.
- `sync_core.js`, `sync_merge_v81.js`, `sync_ui_v81.js`: V81-Grundlage für Revisionsschutz, Cloud-Status und Benutzerrückfrage (für direkten V80→V82-Upload enthalten).

## Import, Hilfe und Veröffentlichung
- `help_core.js`: sichere Markdown-Darstellung nummerierter Schritte und Umlaute in der Suche.
- `hilfe/*.md`: 29 vollständig überarbeitete/neu ergänzte Anleitungen; insbesondere alle Importwege sowie Umgang mit Löschungen, Kunden, Konflikten und Backups.
- `service-worker.js`: neuer PWA-Cache für das V82-Hilfe-Update.
- `manifest.webmanifest`, `package.json`, `package-lock.json`: Programmversion V82.0.
- `tests_v81/`, `tests_v82/`: automatische Testfälle für Bestände, Revisionen, Löschungen, Kundendaten, UI und Hilfe.

Der direkte GitHub-Upload enthält alle Änderungen, die auf dem derzeitigen V80-GitHub-Stand noch fehlen.
