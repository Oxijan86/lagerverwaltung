# Lagerverwaltung Lovrencic – Version 61

## Behobener Smartphone-Fehler
V60 verlangte beim Umschalten vom lokalen Modus in den Cloud-Modus fälschlich einen leeren Ordner. Dadurch konnte ein Smartphone den bereits eingerichteten Synchronisationsordner nicht erneut verbinden, weil dort erwartungsgemäß bereits `lager.db` lag.

## Neues Verhalten
- **Cloud-Synchronisationsordner verbinden** akzeptiert einen Ordner mit vorhandener gültiger `lager.db`.
- Beim Verbinden wird diese Datei **nicht geschrieben oder überschrieben**.
- Die vorhandene Datei wird zuerst über die V60-Prüflogik gelesen (`PRAGMA quick_check`, Lagerdatenbank-Struktur und Sync-Metadaten).
- Ist lokaler und Cloud-Stand exakt identisch, wird die Verbindung direkt bestätigt.
- Sind die Stände unterschiedlich, wird Cloud-Schreiben zunächst blockiert und nach dem Neustart die bestehende Start-/Konfliktprüfung angezeigt. So kann gezielt der Cloud-Stand geladen oder bewusst lokal weitergearbeitet werden.
- Eine beschädigte oder nicht vollständig lesbare `lager.db` bleibt geschützt und kann über diesen Verbindungsweg nicht überschrieben werden.
- Nur wenn der ausgewählte Ordner wirklich keine `lager.db` enthält, wird er nach ausdrücklicher Auswahl als neue Cloud-Ablage initialisiert.
- **Lokalen Speicherordner auswählen / ändern** bleibt absichtlich für einen neuen lokalen Ablageordner reserviert. Bei vorhandener `lager.db` verweist die Fehlermeldung jetzt auf den richtigen Cloud-Button.

## Datenkompatibilität
V60-Datenbanken werden ohne Schema-Neuaufbau geöffnet. Es werden keine Artikel, Buchungen, Stammdaten, Audit-Einträge oder Backups gelöscht.

## Sicherheitsgrenze
Wie bereits in V60 dokumentiert, liefert ein lokal synchronisierter OneDrive-Ordner keine atomare serverseitige Compare-and-Swap-Garantie. V61 ändert daran nichts. Sichtbare Parallelkonflikte bleiben geschützt; exakt gleichzeitige unabhängige Dateischreibvorgänge verschiedener Geräte können ohne Microsoft-Graph-ETag/If-Match nicht vollständig ausgeschlossen werden.
