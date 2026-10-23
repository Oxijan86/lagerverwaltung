# Backups

## Backup aus Datei laden

Über **Backup aus Datei laden** kann eine `.db`-Datei manuell über den Dateimanager ausgewählt werden.

Der Administratorbereich muss in der aktuellen Sitzung bereits freigeschaltet sein. Es erfolgt dabei keine neue Passwortabfrage.

Vor der Wiederherstellung zeigt die App Dateiname, Dateidatum, Datenbankrevision, Artikelanzahl und Buchungsanzahl. Der aktuelle Datenstand wird zuvor automatisch als Sicherheitsbackup gespeichert.

## Automatische Backups

Auch automatische Backups können nur geladen werden, wenn der Administratorbereich in der aktuellen Sitzung bereits freigeschaltet wurde.

Manuelle und automatische Wiederherstellungen werden im Audit-Protokoll dokumentiert.

## Version 60 – Synchronisationssicherheit

Vor jedem normalen Cloud-Schreibvorgang werden `database_id`, erwartete Cloud-Revision, Schreibsperre und die SQLite-Integrität geprüft. Nach dem Schreiben wird `lager.db` erneut gelesen und verifiziert.

Wichtig: Ein lokal synchronisierter OneDrive-Ordner bietet keine serverseitige Compare-and-Swap-Garantie. Exakt gleichzeitige Schreibvorgänge verschiedener Geräte können deshalb technisch nicht vollständig ausgeschlossen werden. Für eine harte Mehrgerätegarantie wäre später z. B. Microsoft Graph mit ETag/If-Match oder eine zentrale Datenbank erforderlich.
