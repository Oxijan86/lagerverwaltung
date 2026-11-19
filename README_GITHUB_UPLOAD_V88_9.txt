LAGER­VERWALTUNG LOVRENCIC – V88.9
================================
Installationspaket für das bestehende Repository Oxijan86/lagerverwaltung.
Auf Grundlage des bestehenden V88.8-Updates. Keine Datenbankmigration.

INSTALLATION
1. Vorher lager.db / Inventur-Zwischenstand sichern. Cloud-Synchronisation prüfen.
2. Dieses ZIP entpacken.
3. GitHub > Oxijan86/lagerverwaltung > Add file > Upload files.
4. ALLE DATEIEN AUS DIESEM ZIP INS REPOSITORY-HAUPTVERZEICHNIS laden.
   Verzeichnisstruktur bestehender Dateien nicht verändern.
5. Änderungen bestätigen; GitHub Pages-Deployment abwarten.
6. Browser-App vollständig schließen und erneut öffnen, Version 88.9 prüfen.
   Browserdaten und IndexedDB NICHT löschen – dort liegen ggf. Inventurdaten.

NEU IN V88.9
* Artikelsuche in laufender Inventur: noch nie gezählt -> Feld "Gezählt";
  schon gezählt (einschließlich 0) -> Feld "Weitere Menge".
* Beim Drücken von Enter wird die zusätzliche Menge summiert; danach
  Rückkehr zum Artikelsuchfeld. Eine erfolglose Speicherung verhindert den Wechsel.
* Die bisherigen Teilmengen je Lagerort bleiben erhalten: z.B. Fach A 5,
  Fach B 3 => gesamt 8. Dieselbe Lagermenge wird nur am gewählten Ort erhöht.
* Ein noch nicht vorhandener Zähl-Lagerort wird über die bereits vorhandene
  Anlegebestätigung registriert, bevor der Fund dort gezählt werden kann.
* Fehlende Lagerort-Zuordnung bei mehreren Zählorten wird angezeigt, statt
  einen falschen Lagerort zu erraten.
* Bereits gezählte Gesamtmenge ist im normalen Ablauf schreibgeschützt.
  Bewusste Korrektur: "Gesamtmenge korrigieren". Hierbei können Teilmengen
  gelöscht werden – die App erklärt das vor der Korrektur.
* Die Hilfe erklärt die neue Erfassung Schritt für Schritt.

WICHTIG
Der Import der 72-seitigen Original-RONDO-PDF, SAPUI5-Import, die PDF-Ausgabe
und das Fortsetzen einer laufenden Inventur bleiben funktional unverändert.
Ein Erfassen von Mengen ändert nur den Inventur-Zwischenstand. Die realen
Lagerbestände und die Mengen pro Lagerort werden ERST beim ausdrücklichen
Inventurabschluss geschrieben. Das Anlegen neuer Lagerort-Stammdaten hingegen
ist eine separate Aktion, die vor dem Abschluss erfolgt.

TECHNISCH
service-worker.js liefert eine gepatchte inventory_ui.js und v87_ui.js aus.
Das neue v88_9_count_core.js enthält die geprüfte Teilmengenlogik.
Der Service Worker prüft die benötigten Quelltext-Anker und bricht bei
unbekannter Quellfassung ab, statt unpassende Änderungen zu erzwingen.

TESTS
  node --test test_v88_7.cjs test_v88_8.cjs test_v88_9.cjs

Lokale automatisierte Prüfung: 40/40 erfolgreich. Der Test gegen eine
laufende, echte GitHub-Pages-Installation und mobile Browser ist damit NICHT
ersetzt. Die bekannten PDF-Positionen bleiben anhand ihrer Prüfsumme geschützt.

Ein automatischer Direkt-Commit in das Repository war nicht möglich – manuelles
GitHub-Hochladen ist erforderlich.
