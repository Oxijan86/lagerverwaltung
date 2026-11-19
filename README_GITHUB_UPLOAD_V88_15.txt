LAGERVERWALTUNG LOVRENCIC — VERSION V88.15 (STARTFEHLER REPARIERT)
============================================================

Fehler in V88.14:
Beim Klick auf „Laufende Inventur fortsetzen“ erschien
„LVInventory is not defined“ und die App zeigte einen Startfehler.
Ursache war eine falsche Lade-Reihenfolge des Lagerort-Kernmoduls.

UPLOAD
1. Diese ZIP-Datei entpacken.
2. GitHub-Repository Oxijan86/lagerverwaltung aufrufen.
3. Add file -> Upload files -> alle Dateien aus dem ZIP INS HAUPTVERZEICHNIS
   laden. Den Upload bestätigen.
4. GitHub Pages bereitstellen lassen. App dann vollständig schließen und neu
   öffnen. Bei Bedarf ein weiteres Mal neu öffnen, damit der neue Service
   Worker die Startseite aktualisiert.
5. Versionsanzeige V88.15 prüfen.
6. Bei mehreren laufenden Inventuren unbedingt die RICHTIGE Inventur über
   „Gespeicherte Inventur“ auswählen und „Ausgewählte Inventur öffnen“ wählen.

WICHTIG
- KEINEN neuen Inventurstart als Fehlerbehebung verwenden.
- KEINE Browserdaten, IndexedDB, lokale Wiederherstellungskopien oder
  lager.db-Dateien löschen.
- Keine automatische Inventurbeendigung, kein Bestandsabschluss.
- Sicherungsdatei der bisherigen lager.db unverändert aufbewahren.
- Dieser Upload enthält KEINE Nutzerdatenbank oder Benutzerdokumente.
- Bestehende V88.14-Funktionen bleiben enthalten.

Prüfung: 114 automatisierte Tests erfolgreich; realer Chromium-Browserstart
in der Buildumgebung nicht abgeschlossen. Die erste Ausführung der installierten
App bleibt ausdrücklich ein Praxistest.
