# Lagerverwaltung Lovrencic V34 – Revisionsschutz und Backup-Wiederherstellung

## Interne Revisionen

Jede fachliche Änderung erzeugt in der SQLite-Datenbank:

- eine fortlaufende Revisionsnummer,
- eine eindeutige Revisions-ID,
- die vorherige Revisions-ID,
- einen internen Änderungszeitpunkt,
- eine dauerhafte Datenbank-ID.

Der Startvergleich verwendet diese Werte und nicht nur das Dateidatum.

## Sicherer Cloud-Schreibschutz

Vor jedem Schreiben wird die Cloud-Datenbank nochmals gelesen.

Das Speichern wird blockiert, wenn:

- die Cloud-Revision seit dem Laden verändert wurde,
- der lokale Stand aus einer unbekannten Quelle stammt,
- ein Backup lokal wiederhergestellt wurde,
- ein neuer Synchronisationsordner noch nicht abgeglichen wurde.

Eine erzwungene Überschreibung ist nur über die ausdrücklich benannte Schaltfläche möglich. Die vorherige Cloud-Datei wird dabei zuerst als Sicherheitsbackup gespeichert.

## Backup-Wiederherstellung

Ein Backup wird zunächst ausschließlich lokal wiederhergestellt.

Danach gibt es zwei Möglichkeiten:

1. den wiederhergestellten Stand ausdrücklich als neuen Cloud-Stand veröffentlichen,
2. die Wiederherstellung verwerfen und die aktuelle Cloud-Datei erneut laden.

Die Cloud-Datei wird niemals automatisch durch ein wiederhergestelltes, möglicherweise älteres Backup überschrieben.

## Geräteübergreifende Backup-Liste

Backups im Cloud-Unterordner `Backup` werden direkt aus dem Ordner gelesen. Dadurch sind sie auch auf einem anderen Gerät sichtbar, selbst wenn dessen lokaler Browser-Index die Sicherungen nicht kennt.

## Ohne Speichern schließen

Beim Bestätigen des Startstands wird eine unveränderliche Sitzungskopie erstellt. `Ohne Speichern schließen` stellt genau diesen Stand wieder her und verwirft alle Änderungen der aktuellen Sitzung.
