# Lagerverwaltung Lovrencic – Version 74

Die drei Sammelaktionen für Bestandsgrenzen stehen jetzt direkt im Reiter **Lagerbestand**, unter **Soll- und Mindestbestand einstellen**:

- Sollbestand aus Istbestand übernehmen
- Mindestbestand aus Istbestand übernehmen
- Soll und Mindestbestand aus Istbestand übernehmen

Die bisherigen Buttons im Bereich Stammdaten wurden dorthin verschoben. Die Aktionen gelten für **alle aktiven Artikel**, auch bei einer eingegebenen Suche. Vor der Übernahme erscheint eine Bestätigung; die bestehende Administratorfreigabe bleibt erforderlich. Ungespeicherte Einzeländerungen bitte zuerst mit **Alle Änderungen speichern** sichern.

Einzelne Soll- und Mindestbestände lassen sich direkt in der Lagerbestandstabelle ändern und mit **Speichern** oder **Alle Änderungen speichern** sichern. Auf dem Smartphone zuerst beim Artikel **Details anzeigen** öffnen. Diese Einzelbearbeitung bleibt wie bisher ohne Administratorpasswort möglich.

## Bestandsregel

Es gilt weiterhin `0 ≤ Mindestbestand ≤ Sollbestand`. Falls der kopierte Sollbestand niedriger als der bestehende Mindestbestand wäre, wird der Sollbestand auf den Mindestbestand angehoben. Falls ein neu kopierter Mindestbestand höher als der bestehende Sollbestand wäre, wird ebenfalls der Sollbestand angehoben. Die Rückmeldung zeigt solche Anpassungen an. Bei der Übernahme beider Grenzen erhalten beide den normalisierten Istbestand.

Istbestand, Buchungen, Artikelstammdaten und Zuordnungen werden durch die Sammelübernahme nicht geändert. Inaktive Artikel bleiben unberührt. Die Bestandsgrenzen werden gemeinsam in einer Transaktion aktualisiert und Änderungen im Audit dokumentiert. Eine identische Wiederholung erzeugt keine zusätzliche Revision.

## Update

Das vollständige Paket entpacken, die App-Dateien in der vorhandenen Bereitstellung aktualisieren und die Seite neu laden. Die App zeigt **74.0** und verwendet einen neuen Service-Worker-Cache. Die bestehende `lager.db` weiterverwenden.

Die XLSX-Mengenkorrektur, Sammelauswahl unbekannter Artikel, Smartphone-Einrichtung und korrigierten Materialanforderungs-Exporte sind weiterhin enthalten.

## Tests

Die neue Browserregression prüft alle drei Aktionen, direkte Einzelbearbeitung, Administratorfreigabe, ungespeicherte Entwürfe, Abbruch, aktive/inaktive Artikel, Suchfilter, Null- und Dezimalmengen, Bestandsregel, Audit, Wiederholung und Neustart. Die mobile Bedienung ist in Chromium bei 390 Pixeln geprüft.

Ergebnisse: `TEST_RESULTS_V74.txt`. Testbefehle und Abhängigkeiten: `README_V70.md`.
