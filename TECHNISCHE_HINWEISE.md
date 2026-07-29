# Technische Hinweise

## Kein klassischer Serverbetrieb

Die Anwendung besitzt kein Backend und keine zentrale Datenbank. Alle SQL-Operationen laufen im Browser über SQLite WebAssembly.

Eine HTTPS-Auslieferung der statischen Dateien ist dennoch erforderlich, weil:

- PWA-Installation und Service Worker einen sicheren Kontext benötigen
- Microsoft-Anmeldung eine registrierte Redirect-URI benötigt
- Browser-Sicherheitsregeln lokale `file://`-Starts einschränken

## Synchronisierungsmodell

- lokal wird in SQLite gearbeitet
- OneDrive erhält beim manuellen Synchronisieren einen vollständigen Datenbanksnapshot
- OneDrive-ETags dienen zur Konflikterkennung
- Cloud-Backups sind zusätzliche SQLite-Snapshots
- gleichzeitige Bearbeitung auf mehreren Geräten ist nicht unterstützt

## Grenzen

- keine automatische Hintergrundsynchronisierung bei geschlossener App
- OneDrive-Synchronisierung benötigt Internet
- Browserdaten dürfen nicht gelöscht werden, bevor die Datenbank synchronisiert oder exportiert wurde
- der erste Start benötigt Internet, damit SQLite WASM und MSAL geladen und im Service Worker zwischengespeichert werden
