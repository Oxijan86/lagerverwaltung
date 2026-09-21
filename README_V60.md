# Lagerverwaltung Lovrencic – Version 60

## Schwerpunkt: Synchronisations-Härtung

V60 baut gezielt auf V59 auf. Die bestehende SQL.js-/SQLite-Architektur, Buchungen, Stammdaten, Audit, Backups, Materialanforderungen, Maschinen-Aliase und die Ordneranbindung bleiben erhalten.

### 1. Cloud-Datei wird eindeutig klassifiziert
`inspectCloudDatabase()` unterscheidet jetzt:

- `ok`
- `missing`
- `permission_denied`
- `invalid_database`
- `io_error`

Eine fehlende `lager.db` wird nur bei der ausdrücklichen Einrichtung eines neuen leeren Ordners erzeugt. Eine vorhandene beschädigte oder nicht vollständig lesbare Datei wird niemals wie ein leerer Ordner behandelt.

### 2. Strikter Schreibschutz
Normale Cloud-Schreibvorgänge sind nur erlaubt, wenn unmittelbar vor dem Schreiben alle Bedingungen erfüllt sind:

- Cloud-Datei ist vorhanden und lesbar,
- `PRAGMA quick_check = ok`,
- identische `database_id`,
- bestätigte `expectedCloudDatabaseId`,
- bestätigte `expectedCloudRevisionId`,
- kein `writeBlocked`.

Bei erzwungenem Überschreiben wird eine vorhandene lesbare Cloud-Datei vorher als Sicherheitsbackup gespeichert. Beschädigte oder nicht lesbare Cloud-Dateien werden auch im Force-Pfad nicht still überschrieben.

### 3. Zentrale Synchronisationswarteschlange
Automatische und manuelle Synchronisation verwenden denselben `SyncQueue`-Mutex. Erfolgt während eines laufenden Syncs eine weitere Buchung, wird eine weitere Runde nachgeschoben. Zwei Schreibvorgänge greifen nie gleichzeitig über die Anwendung auf `lager.db` zu.

### 4. Kandidat + Re-Read-Verifikation
Die Cloud-Basis wird zuerst nur in einer Kandidatenkopie der SQLite-Datenbank gesetzt. Erst nach:

1. Schreiben,
2. erneutem Lesen,
3. `PRAGMA quick_check`,
4. Prüfung von `database_id`, `revision` und `revision_id`

wird der Kandidat lokal übernommen und `dirty=false` gesetzt. Bei `write()`-/`close()`-/Verifikationsfehlern bleibt der lokale Stand unsynchronisiert.

### 5. Berechtigungen
Hintergrundprüfungen verwenden nur `queryPermission()`. Sie lösen keine Browser-Permission-Abfrage aus. Fehlt der Zugriff, kann lokal weitergearbeitet werden; die Oberfläche zeigt **„Ordnerzugriff erneut freigeben“**. Nur dieser ausdrückliche Benutzerweg ruft `requestPermission()` auf.

### 6. Revisionen
Inhaltliche Änderungen werden über `persist(true)` genau einmal revisioniert. Migrations-/Audit-Nachtragungen beim Start werden gesammelt und erzeugen höchstens eine neue Revision. Gerätespezifischer Speichermodus und Ordner-Handle werden in IndexedDB geführt; vorhandene V59-Werte bleiben als Kompatibilitäts-Fallback lesbar.

### 7. Testbare Zustandsentscheidung
Die reine Funktion `classifySyncState({local, cloud, meta})` liegt in `sync_core.js` und hat keine Dialog-, Datei- oder IndexedDB-Abhängigkeiten.

### 8. Automatisierte Tests
Unter `tests/` befinden sich Node-Tests für:

- Zustandsentscheidung,
- Schreibschutz,
- Kandidat/Verifikation,
- Queue/Race-Verhalten,
- Zwei-Geräte-Konflikte,
- Service-Worker-Update.

Ausführen mit:

```bash
npm test
```

## Technische Grenze von lokalem OneDrive-/Dateisync

V60 verbessert die Konflikterkennung deutlich, bietet aber **keine echte atomare Mehrgerätesynchronisation**.

Die File System Access API und ein lokal synchronisierter OneDrive-Ordner stellen der Anwendung keinen serverseitigen ETag-/`If-Match`-Compare-and-Swap bereit. Wenn zwei Geräte exakt gleichzeitig dieselbe alte Cloud-Revision lesen und anschließend nahezu gleichzeitig schreiben, kann die Anwendung den Zwischenzustand nicht in jedem Fall erkennen. OneDrive kann danach einen Letztschreiber-Stand oder eine Konfliktkopie erzeugen.

V60 reduziert dieses Risiko durch:

- Prüfung unmittelbar vor jedem Schreiben,
- Prüfung unmittelbar nach jedem Schreiben,
- `database_id` + `revision_id`,
- Schreibblockaden bei sichtbaren Zweigen,
- serielle Writes innerhalb eines Geräts.

Eine harte serverseitige Garantie erfordert später z. B. einen Microsoft-Graph-Adapter mit ETag/`If-Match`, Dataverse, Azure SQL oder ein anderes Backend mit Transaktionen/Compare-and-Swap. `CloudStorageAdapter` und `sync_core.js` sind so getrennt, dass ein solcher Adapter später ergänzt werden kann.

## V59-Kompatibilität

V59-Datenbanken werden unverändert geöffnet. Fehlende V60-Gerätemetadaten werden aus vorhandenen V59-Informationen abgeleitet. Artikel, Buchungen, Stammdaten, Audit und Backups werden nicht gelöscht.
