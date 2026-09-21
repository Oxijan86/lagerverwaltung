# Lagerverwaltung Lovrencic – Version 63

## Fehlerbehebung: Ordnerzugriff beim Synchronisieren und Schließen

### Problem in V62
V62 konnte den Ordnerzugriff bereits im Startdialog erneut freigeben. Wurde die Berechtigung aber erst beim Schließen benötigt, zeigte der Schließen-Dialog nur die Fehlermeldung „Ordnerzugriff erneut freigeben“, ohne eine passende Aktion anzubieten.

### Änderung in V63
- Der Schließen-Dialog prüft den Berechtigungszustand bereits beim Öffnen.
- Bei `permission_denied` erscheint direkt **🔐 Ordnerzugriff freigeben & synchronisieren**.
- Erst der ausdrückliche Benutzer-Klick ruft die bestehende `LVSync.reauthorize()`-Funktion auf.
- Danach wird `lager.db` erneut geprüft.
- Anschließend läuft `LVSession.close('sync')` über dieselbe zentrale Sync-Warteschlange und dieselben V60/V61-Schreibguards.
- Es existiert kein neuer Sonderpfad, der Schutzprüfungen umgeht.
- Bei Konflikt, beschädigter Cloud-Datei, anderer `database_id` oder fehlgeschlagener Prüfung wird nicht geschlossen und nicht automatisch überschrieben.
- „Nur lokal schließen“ und „Ohne Speichern schließen“ bleiben unverändert verfügbar.

## Browsergrenze
Mobile Chromium-Browser können eine erneute Dateisystemberechtigung nur zuverlässig aus einer direkten Benutzeraktion heraus anfordern. Deshalb kann V63 die Freigabe nicht still im Hintergrund durchführen.
