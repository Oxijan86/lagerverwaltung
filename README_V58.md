# Lagerverwaltung Lovrencic – Version 58

## Neue Materialanlage als Buchung
- Jede neu angelegte Materialposition erzeugt einen Eintrag unter Buchungen.
- Der eingegebene Anfangsbestand wird als Einbuchung mit Quelle `Materialanlage` geführt.
- Um Doppelzählungen zu verhindern, wird bei neu angelegten Artikeln der Bestand vollständig über diese Buchung aufgebaut.
- Auch bei Anfangsbestand 0 wird ein nachvollziehbarer Buchungseintrag mit Menge 0 erzeugt.

## Audit-Zeit
- Neue Audit-Zeitstempel werden mit eindeutiger UTC-Zeitzone gespeichert.
- Die Anzeige rechnet sie in die lokale Gerätezeit um.
- Auch die bisherigen UTC-Zeitstempel ohne Zonenkennzeichnung werden bei der Audit-Anzeige als UTC interpretiert, wodurch die bisherige Abweichung von zwei Stunden korrigiert wird.

## Dateisynchronisierung
- Fortlaufende lokale Revisionsnummer sichtbar.
- Zuletzt bekannte Cloud-Revisionsnummer sichtbar.
- Automatische Cloud-Synchronisierung nach Änderungen deutlich angezeigt.
- Sichere eigene Änderungen werden nach ca. 250 ms automatisch in die Cloud geschrieben.
- Bei automatischer Synchronisierung wird nicht nach jeder Buchung ein zusätzliches Synchronisationsbackup erstellt; die regulären automatischen Backups bleiben bestehen.

## Smartphone / Cloud
- `local_newer_safe` wird automatisch synchronisiert und öffnet nicht mehr ständig den Lokal-/Cloud-Auswahldialog.
- Ist die Cloud neuer und lokal gibt es keine offenen Änderungen, wird der Cloud-Stand automatisch geladen.
- Manuelle Entscheidung bleibt bei echten Konflikten oder nicht eindeutigem Datenstand erhalten.
