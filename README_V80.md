# Lagerverwaltung Lovrencic – Version 80.0

**Fertige Programmdateien zum Hochladen auf GitHub Pages.** Basis ist die am 02.11.2026 auf GitHub veröffentlichte Version 79.0. Die Dateien sind bereits aktualisiert. Es wird kein Installer, kein Patch-Skript und kein GitHub-Actions-Workflow benötigt.

## Neuerungen

- Kombinierte RONDO-Serviceberichte: Positionstabellen des Haupttickets und der Untertickets werden den Tickets in der Reihenfolge der PDF zugeordnet. Abweichende Tabellenanzahlen ergeben bewusst keine unsichere Unterticket-Maschinenzuordnung.
- Technische Kennung (z. B. PMML113.B, SRL550.A) und Maschinenbezeichnung werden getrennt erkannt und pro PDF-Materialposition gespeichert.
- Nach einer **bestätigten** PDF-Materialentnahme lassen sich Ersatzteile im Lagerbestand über den Namen und die technische Typkennung der erkannten Maschine finden.
- Fehlende Artikel lassen sich im PDF-Import über **„Neues Material registrieren“** anlegen. Artikelnummer und Bezeichnung werden übernommen, Einheit, Lagerort, Sollbestand und Mindestbestand bleiben bearbeitbar.
- Der Anfangsbestand bei der Neuanlage ist standardmäßig **0** und muss ausdrücklich bestätigt werden. Ohne vorhandenen Bestand erfolgt keine Entnahme.
- Neue DB-Tabelle `service_pdf_machine_usage` wird bei Programmstart automatisch angelegt. Alte Datenbanken bleiben erhalten.
- Die mobile Navigation ist scrollbar, damit „Backups“, „Stammdaten“ und „Hilfe“ erreichbar sind.
- Version 80.0 wird in der Oberfläche und durch `/api/info` gemeldet; PWA-Manifest und Service-Worker-Cache aktualisiert.

## Hochladen

Im bestehenden GitHub-Repository `Oxijan86/lagerverwaltung` können Sie mit **Add file → Upload files** die entpackten Dateien aus `Lagerverwaltung_Lovrencic_V80_Direktupload.zip` hochladen. Gleichnamige Dateien ersetzen, sonstige Dateien (insbesondere `vendor/`, `hilfe/`, `icons/`) stehen lassen. Commit bestätigen. **Keine ZIP-Datei als einzelne Datei hochladen.**

Die Vollversion enthält darüber hinaus die bereits vorhandenen Bibliotheken und Dokumentationsdateien. Sie ist als vollständige Archivkopie gedacht; für ein bestehendes Repository ist das kleinere Direktuploadpaket einfacher und genauso funktionsfähig.

## Testen

- Node.js: `npm test` – automatisierte Tests
- Node.js: `npm run test:syntax` – JavaScript-Syntax und Versionskonsistenz
- RONDO-PDF-Auswertung mit echtem sechsseitigem Benutzerbeispiel: 6 Materialtabellen, 5 Untertickets, 33 Materialpositionen und 9 ausgeschlossene Zeit-/Reisekostenpositionen.

**Hinweis zu Daten:** Ohne explizite Benutzerbestätigung führt eine PDF-Vorschau keine Bestandsbuchung aus. Vor produktivem Einsatz sollte die Neuanlage mit einer Kopie der Lagerdatenbank getestet werden.

**Praktische Grenze:** Der automatisierte Browser-Rauchtest konnte hier nicht beendet werden, weil Chromium HTTP-Zugriffe auf die lokale Testadresse durch eine Umgebungsrichtlinie blockiert. Die Quelltext-, Syntax- und Parserprüfungen waren erfolgreich; ein echter E2E-Test mit produktiver Datenbank ist nicht enthalten.
