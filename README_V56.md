# Lagerverwaltung Lovrencic – Version 56

## Kritischer Startfix
V55 konnte beim Öffnen einer vorhandenen Datenbank mit Buchungen während der Audit-Nachtragung abbrechen. Ursache war die versehentlich entfernte Hilfsfunktion `auditValue`. Die Lagerdaten wurden dadurch nicht gelöscht.

## V56
- fehlende Audit-Funktion wiederhergestellt
- Audit-Nachtragung kann den Start nicht mehr blockieren
- sichtbare Fehlermeldung bei zukünftigen Initialisierungsfehlern
- tatsächlich eingebettete Hilfe-Prompts auf den aktuellen Stand gebracht
- Cloud-/Lokal- und Datenbanklogik ansonsten unverändert
