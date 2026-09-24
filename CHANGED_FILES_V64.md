# Geänderte Dateien – Version 64

## Produktionscode

- `index.html`
  - V64-Anzeige
  - neues Material ohne Passwort-Lock
  - Soll-/Mindestbestand direkt im Lagerbestand und Dashboard editierbar
  - Lagerwert entfernt
  - Einkaufspreis aus Material-/Importformularen entfernt
  - Prompt-Dialog mit Markieren/Kopieren und Clipboard-Fallback
  - korrigierter Markdown-Renderer über `help_core.js`
  - Logout-Reauthorize prüft `LVSync.inspect()` unabhängig von Cloud-/Local-Folder-Modus
- `local_backend.js`
  - Speichermodus-Migration V59/V60 → V64 korrigiert
  - `LVSync.inspect()`
  - geschützter `local_folder`-Save ohne Force-Bypass
  - Materialanlage/Importanlage passwortfrei
  - eng begrenzter `/api/material/master-create`
  - `/api/articles/levels`
  - Mindest-/Soll-Regel im Backend
  - Dashboard-Unterbestand und Gesamtzählung korrigiert
  - Materialanforderungsziel `max(Soll,Mindest)`
  - Lagerwert/Preis-Rückgaben entfernt; DB-Spalte `purchase_price` bleibt erhalten
- `sync_core.js`
  - `resolveDeviceStorageMode()`
  - `initializeDeviceStorageMode()` inkl. persistierter Migration
  - `closeSyncRequestForMode()`
  - bestehende V60-Sync-/Guard-Logik bleibt erhalten
- `app_rules.js` **neu**
  - Mengen-/Bestandsnormalisierung
  - Regel `minimum_stock >= target_stock`
  - Unterbestandslogik
  - Materialanforderungsziel
- `help_core.js` **neu**
  - Codeblöcke vor Markdown-Transformation extrahieren
  - unveränderte Prompt-Texte wieder einsetzen
  - Prompt-Aktionsschaltflächen
- `service-worker.js`
  - Cache `lv64-bedienung-bestandslogik-1`
  - neue Module im App-Cache / Network-first
  - `skipWaiting()` und `clients.claim()` bleiben aktiv
- `manifest.webmanifest`
  - V64-Bezeichnung
- `package.json`
  - V64-Paketversion / Testkommando

## Hilfe / Dokumentation

- `README_EINRICHTUNG.md`
- `README_V64.md`
- `hilfe/01-dashboard.md`
- `hilfe/02-neues-material.md`
- `hilfe/03-lagerbestand.md`
- `hilfe/07-csv-center.md`
- `hilfe/11-m365-prompts.md`
- `hilfe/13-fehlerbehebung.md`
- eingebettete Hilfe in `local_backend.js`

## Tests

Neu oder erweitert:

- `tests/storage-mode-migration.spec.js`
- `tests/local-folder-close-v64.spec.js`
- `tests/material-security-v64.spec.js`
- `tests/app-rules.spec.js`
- `tests/levels-endpoint-v64.spec.js`
- `tests/help-prompts.spec.js`
- `tests/dashboard-refresh-v64.spec.js`
- `tests/build-integrity-v64.spec.js`
- bestehende Sync-, Race-, Zwei-Geräte-, Permission-, Service-Worker-, Revisions- und V59-Kompatibilitätstests laufen weiter.

## Bewusst unverändert

- `materialanforderung_vorlage.xlsx`
- `materialanforderung_vorlage_lang.xlsx`

Beide Excel-Vorlagen sind byte-identisch zur V63-Fassung.

Die SQLite-Spalte `articles.purchase_price` bleibt ausschließlich aus Datenbank-Kompatibilitätsgründen erhalten. Sie wird in V64 nicht mehr in der Benutzeroberfläche, den relevanten Exporten oder öffentlichen Artikel-/Materialanforderungsdaten verwendet.
