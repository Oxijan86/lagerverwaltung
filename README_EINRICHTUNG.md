# Lagerverwaltung Lovrencic V22

## Neu in Version 22
- Einrichtungsfrage: neue Datenbank oder vorhandene Datenbank verwenden
- Auswahl eines Synchronisationsordners mit `lager.db` und Unterordner `Backup`
- automatische lokale Speicherung nach jeder Änderung
- automatische Synchronisierung nach Änderungen
- Konfliktschutz, wenn lokaler und gemeinsamer Stand verändert wurden
- automatische Backups vor Synchronisierung und vor Wiederherstellung
- manuelles Backup mit optionalem Kommentar
- Backup-Liste mit Wiederherstellen, Herunterladen und Löschen
- Sicherheitsbackup vor jeder Wiederherstellung
- Aufbewahrung der letzten 30 Backups
- manuelle SQLite-Import-/Exportlösung für Browser ohne Ordnerzugriff

## Aktualisierung auf GitHub
Den gesamten Inhalt dieses Ordners in das Repository hochladen und vorhandene Dateien ersetzen. Danach die Seite mit Strg+F5 neu laden bzw. die installierte PWA neu starten.

## Wichtiger Arbeitsablauf
Auf einem zweiten Gerät zuerst synchronisieren bzw. den Stand laden. Nicht gleichzeitig auf zwei Geräten buchen. Bei einem Konflikt wird keine Datenbank automatisch überschrieben.
