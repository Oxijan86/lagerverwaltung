# Lagerverwaltung Lovrencic – Version 64

Version 64 basiert vollständig auf V63 und enthält gezielte Korrekturen für Synchronisation, Materialanlage und Bestandsbedienung. Bestehende Tabellen und die Spalte `purchase_price` bleiben aus Kompatibilitätsgründen erhalten; Einkaufspreis und Lagerwert werden jedoch nicht mehr verwendet oder angezeigt.

## Synchronisation

- Speichermodus-Migration aus älteren Versionen korrigiert: IndexedDB → alte `storage_mode`-Einstellung → vorhandener Ordner-Handle → `browser_local`.
- Der ermittelte Gerätemodus wird in IndexedDB gespeichert.
- `LVSync.inspect()` prüft die verbundene `lager.db` direkt und unabhängig vom Speichermodus.
- „Synchronisieren und schließen“ funktioniert nach erneuter Ordnerfreigabe sowohl in `cloud` als auch `local_folder` über den bestehenden geschützten Sync-Pfad.
- Der lokale Ordner-Modus verwendet keinen pauschalen Force-Write mehr für normale automatische/manuelle Speicherungen.
- Beschädigte Dateien, fremde `database_id` und echte Parallelkonflikte werden weiterhin blockiert.

## Materialanlage ohne Passwort

Neue Materialien können über alle vorgesehenen Anlagewege ohne Administratorpasswort angelegt werden. Bestehende Artikel bearbeiten/löschen, Istbestandskorrekturen, Inventur, Maschinen-Merge/Trennung, Einstellungen, Restore, Force-Cloud-Write und Reset bleiben geschützt.

Neue Lagerorte oder Maschinen innerhalb eines Materialformulars verwenden den eng begrenzten Endpoint `/api/material/master-create`; der normale Stammdaten-Endpunkt bleibt geschützt.

## Lagerwert / Einkaufspreis

- Lagerwert-KPI entfernt.
- `stock_value` wird nicht mehr berechnet oder ausgeliefert.
- Einkaufspreis aus Materialformularen, Lagerbestands-CSV und neuen Audit-Einträgen entfernt.
- Die bestehende SQLite-Spalte `purchase_price` bleibt unangetastet, damit alte V63-Datenbanken ohne riskante Tabellenmigration geöffnet werden können.

## M365-Prompts

Markdown-Codeblöcke werden vor allen übrigen Markdown-Ersetzungen extrahiert und unverändert wieder eingesetzt. Das Sprachkennzeichen `text` wird nicht kopiert. Jeder Prompt hat:

- **Prompt markieren**
- **Prompt kopieren**
- Clipboard API mit Fallback
- `user-select:text` und `-webkit-user-select:text`

Auch die Prompt-Schaltflächen direkt bei Einbuchung/Entnahme öffnen jetzt einen markier- und kopierbaren Dialog statt eines einfachen Alerts.

## Soll- und Mindestbestand

Soll- und Mindestbestand können im Lagerbestand und im Dashboard ohne Passwort geändert werden. Der Backend-Endpunkt `/api/articles/levels` darf ausschließlich diese zwei Werte ändern.

Verbindliche Regel:

`0 <= minimum_stock <= target_stock`

Ist Mindestbestand größer als Sollbestand, wird Sollbestand automatisch auf Mindestbestand angehoben. Die Regel gilt auch für neue Materialien und Importe.

Für Materialanforderungen gilt:

- nur wenn `Istbestand < Mindestbestand`,
- Bestellmenge `max(0, Sollbestand - Istbestand)`,
- bei `Istbestand >= Mindestbestand` kein Bestellvorschlag.

## Dashboard-Unterbestand

- Gesamtanzahl wird aus allen Unterbestandsartikeln berechnet.
- Vorschau bleibt auf acht Einträge begrenzt.
- Bei mehr als acht Artikeln gibt es **Alle anzeigen**.
- Unterbestand nur bei `Ist < Mindest`.
- `Ist = Mindest` wird nicht angezeigt.

## Kompatibilität

V63-Datenbanken werden ohne Löschen oder Umbau bestehender Tabellen geöffnet. Es gibt keine DROP-TABLE-Migration.
