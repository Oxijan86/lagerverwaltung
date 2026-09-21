# Geänderte Dateien in Version 60

## Laufzeitcode

- `local_backend.js`
  - eindeutige Cloud-Dateiklassifikation
  - FileSystem-`CloudStorageAdapter`
  - strikter Schreibschutz
  - Kandidaten-/Re-Read-Verifikation
  - zentrale Synchronisationswarteschlange
  - Berechtigungsbehandlung ohne Hintergrund-`requestPermission()`
  - V59-kompatible Revisions-/Migrationsbehandlung
  - gerätespezifischer Speichermodus in IndexedDB
- `sync_core.js` **neu**
  - reine `classifySyncState()`-Funktion
  - Schreibguard und Post-Write-Verifikation
  - `SyncQueue`
  - Adapter-Basisklasse für einen späteren Microsoft-Graph-Adapter
- `index.html`
  - V60-Anzeige
  - Schaltfläche „Ordnerzugriff erneut freigeben“
  - präzisere Zustands-/Konfliktmeldungen
  - `sync_core.js` wird vor `local_backend.js` geladen
- `service-worker.js`
  - neuer V60-Cache
  - `skipWaiting()` und `clients.claim()`
  - Network-first für kritische App-Dateien
- `manifest.webmanifest`
  - V60-Name und Kurzname

## Dokumentation

- `README_V60.md` **neu**
- `hilfe/13-fehlerbehebung.md`
- `hilfe/12-backups.md`
- eingebettete Hilfe in `local_backend.js`

## Entwicklertests

- `package.json` **neu**
- `tests/sync-decision.spec.js`
- `tests/sync-persistence.spec.js`
- `tests/sync-write-guard.spec.js`
- `tests/sync-race.spec.js`
- `tests/sync-two-devices.spec.js`
- `tests/service-worker.spec.js`
- `tests/revision-contract.spec.js`
- `tests/v59-compatibility.spec.js`
- `tests/v59-api-baseline.json`

## Unverändert übernommen

- `materialanforderung_vorlage.xlsx`
- `materialanforderung_vorlage_lang.xlsx`
- bisherige Artikel-/Buchungs-/Stammdaten-/Audit-/Backup-Funktionen
- bestehende README-Dateien V42 bis V59
