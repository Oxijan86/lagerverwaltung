# Testprotokoll Lagerverwaltung Lovrencic V82.0

## Automatisierte Tests

- **57/57 Node.js-Funktionstests bestanden**, ausgeführt über `npm test`.
- V80-PDF- und Unterticket-Erkennung, V81-Revisions-/Buchungsabgleich sowie V82-Löschungen, Kunden, Ticketfelder, Konfliktarchiv und sichere Nachübernahme geprüft.
- **27/27 externe JavaScript-Dateien** erfolgreich auf Syntax geprüft (`npm run test:syntax`).
- **3/3 eingebettete JavaScript-Skripte** in `index.html` separat syntaktisch geprüft.
- **Chromium-Archivbedienung** auf Smartphone (390 px) und Desktop (1280 px): jeweils 13 Prüfungen bestanden (26 insgesamt), inklusive Kundensuche, Ticketanzeige, Löschungen, gesperrte Änderungen, Filterwechsel und X-Warnung.
- **Chromium-Hilfeprüfung** auf Smartphone und Desktop: 29 Themen geladen, Suche/Zurücksetzen, nummerierte Listen sowie Import-, Synchronisierungs-, PDF- und Konflikthinweise erfolgreich geprüft.

## Enthaltene Fehler-/Regressionsfälle

1. Geänderten Kunden und Ticket im Konfliktarchiv anzeigen, nachträglich korrigieren, Mengen unverändert lassen.
2. Unterschiedliche Buchungen mit geräteübergreifend eindeutiger Buchungskennung nur einmal übernehmen.
3. Gelöschte Buchung dokumentieren; Löschung versus spätere Korrektur nicht automatisch überschreiben.
4. Negativen Bestand und ungültige Menge bei Nachübernahme blockieren.
5. Nicht übernommene Datenstände im Konfliktarchiv als vollständige SQLite-Kopien erhalten.
6. CSV-Firmenliste: Inventur gegen Einbuchung unterscheiden; bewusste neue Importkennung vom Doppelimport unterscheiden.
7. Smartphone-Hilfe: kein Treffer → leeren → Hilfetext wieder anzeigen; Import per gezielter Suche finden.
8. Datenübernahme-Entwürfe beim Wechsel des Kunden-/Ticketfilters erhalten.
9. Migrations-Syntax, Versionsanzeige, Service-Worker-Cache und Hilfe-Datenintegrität geprüft.

## Nicht durchgeführt / technische Einschränkungen

- Kein produktiver End-to-End-Test mit dem realen OneDrive-Server und den persönlichen Smartphone-/PC-Ordnerberechtigungen.
- Ein Browser-Ordner kann nach dem Schreiben die zurückgelesene Datei bestätigen, aber nicht den abgeschlossenen OneDrive-Serverupload.
- Die File-System-Schnittstelle bietet keine serverseitige atomare Mehrgeräte-Sperre. Bei zeitgleichen Schreibzugriffen bleibt ein Restrisiko. V82 behandelt unklare Revisionen konservativ.
- Deshalb mit einer gesicherten **Testkopie von lager.db** testen, bevor echte Bestände verändert werden.
