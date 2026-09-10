# Lagerverwaltung Lovrencic – Version 59

## Synchronisationsfix Smartphone / Cloud

### Behobener Fehler
In V58 konnte ein normaler Zustand direkt nach einer Buchung fälschlich als
„Lokaler Stand ist neuer – Herkunft nicht sicher“ eingestuft werden.

Beispiel:
- Cloud Revision 87
- lokale Buchung erzeugt Revision 88
- Cloud noch Revision 87

Das ist normalerweise kein Konflikt. V58 konnte jedoch die Abstammung des lokalen
Stands verlieren und blockierte dadurch die automatische Synchronisierung.

### Änderungen
- Die Datenbank speichert jetzt zusätzlich die letzte bestätigte Cloud-Basisrevision.
- Mehrere lokale Buchungen können auf derselben Cloud-Basis aufbauen und automatisch synchronisiert werden.
- Fehlende IndexedDB-Synchronisationsmetadaten werden bei identischen lokalen/Cloud-Revisionen automatisch repariert.
- Eine direkte Kindrevision (z. B. lokal 88, Cloud 87) wird anhand der Parent-Revision ebenfalls als sicher erkannt.
- Nach erfolgreichem Cloud-Speichern wird die neue Revision sofort zur neuen Synchronisationsbasis.
- Die fortlaufende Cloud-Nummer wird aus der tatsächlich verbundenen lager.db gelesen.
- Ein bewusst bestätigter echter Konflikt wird für denselben unveränderten Cloud-Stand nicht alle 15 Sekunden erneut als Dialog angezeigt.
- Ändert sich die Cloud anschließend auf einem anderen Gerät, erscheint die Konfliktprüfung wieder.
- Echte Paralleländerungen werden weiterhin niemals automatisch überschrieben.

## Erwarteter Normalfall
Cloud #87 → lokale Buchung → lokal #88 → automatische Synchronisierung → Cloud #88.

Danach:
lokale Buchung → lokal #89 → automatische Synchronisierung → Cloud #89.

Ohne Auswahl „lokal oder Cloud“.
