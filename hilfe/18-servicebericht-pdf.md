# RONDO-Servicebericht direkt aus PDF importieren (V77)

Im Reiter **Entnahme** den Bereich **RONDO-Servicebericht direkt aus PDF importieren** verwenden. Die Berichte werden auf diesem Gerät verarbeitet; der Umweg über M365 ist nicht erforderlich.

## Auslesen und prüfen

1. Eine oder mehrere vollständige Servicebericht-PDFs auswählen und **Ausgewählte PDFs auslesen** antippen. Maximal 20 Dateien, je 25 MB und 80 Seiten.
2. Die Materialtabellen werden anhand von Produkt, Beschreibung und Istmenge ausgelesen. Zeit, Kilometer, Wartungsleistungen und Fahrtkosten werden ausgeschlossen. Angaben im Fließtext werden nicht zusätzlich als Materialpositionen gezählt.
3. Kunde, Maschine, Ticketnummer und Leistungsdatum prüfen. Das Meldedatum eines möglicherweise alten Tickets wird nicht als Leistungsdatum eingesetzt. Bei mehreren Positionsdaten bleiben die unterschiedlichen Daten erhalten.
4. Artikelnummer, Menge und Einheit bei Bedarf korrigieren. Die Einheit muss zum Lager passen; es erfolgt keine automatische Umrechnung oder Rundung. Unbekannte Artikelnummern bleiben ungeklärt. Gegebenenfalls Material anlegen, tatsächlichen Bestand einbuchen und **Vorschau / Bestände aktualisieren** wählen.
5. Nur gewünschte Positionen auswählen. Der angezeigte Bestand danach berücksichtigt die gesamte Auswahl aus allen Berichten. Bei zu wenig Bestand ist die Buchung gesperrt.
6. Die Prüfbestätigung aktivieren und **Geprüfte Materialien entnehmen** wählen. Vor der Buchung erscheint eine letzte Bestätigung. Erst dann werden die ausgewählten Materialien entnommen.

Das Auslesen und die Vorschau ändern keinen Bestand. Kunden, Maschinen und Mengen im Bericht müssen trotzdem vor der Buchung geprüft werden.

## Zusätzliche oder wiederholte Tabellen

Einige Berichte enthalten weitere Tabellen mit denselben Materialien oder ohne Datum und Einheit. Solche Zeilen werden markiert und zunächst nicht ausgewählt. Wiederholte Artikel können auch echte zusätzliche Entnahmen sein; deshalb wird eine mögliche Wiederholung nicht stillschweigend gelöscht oder doppelt gebucht. Nur nach Prüfung gezielt auswählen. Bei fehlender Einheit wird die Lager-Einheit zur Bestätigung vorgeschlagen.

## Gescannte Berichte

Bei einer Bild-PDF die Option **Texterkennung (OCR) für gescannte Seiten verwenden** aktivieren und erneut auslesen. Die mitgelieferte Texterkennung läuft auf dem Gerät und benötigt mehr Zeit. Erkannte OCR-Materialien bleiben zunächst abgewählt: Artikelnummer, Menge, Einheit und Datum einzeln prüfen. Schlecht lesbare oder handschriftliche Angaben können falsch erkannt werden. Wenn keine Materialtabelle erkannt wird, wird nichts automatisch abgebucht.

## Abschluss und weitere Positionen

Nach einer erfolgreichen Entnahme erscheint **Erledigt: Entnahme abgeschlossen** mit den gebuchten Positionen. Dateiauswahl und Bemerkung werden geleert. Gebuchte PDF-Zeilen sind als erledigt markiert und zunächst ausgeblendet; über **Gebuchte Positionen einblenden** bleiben sie kontrollierbar. Nicht gebuchte Zeilen bleiben zur weiteren Prüfung erhalten.

Beim erneuten Einlesen bereits verarbeiteter PDFs werden die gebuchten Positionen erkannt – auch bei geändertem Dateinamen oder identischem erneut exportiertem Materialinhalt. Noch nicht gebuchte Positionen lassen sich ergänzen. Die Importkennungen werden mit der lager.db gespeichert und bei einem Gerätewechsel mitgenommen. Unabhängige lokale Datenbankkopien sind weiterhin nicht automatisch zusammengeführt.

Bei einem Speicherfehler nach einer Entnahme **Speicherung erneut versuchen** verwenden. Diese Wiederholung erzeugt keine zweite Abbuchung. Vor der PDF-Entnahme wird ein Sicherheitsbackup angelegt; die Buchungen enthalten Quelle, Ticketnummer, Kunde, Maschine, Datum und PDF-Seite. Die Lagerdatei enthält die Buchungen und Importkennungen; die Original-PDFs bleiben bei den ursprünglichen Dateien.

## Bereitstellung

Das vollständige V77-Paket einschließlich **vendor** übernehmen. Die PDF- und OCR-Dateien werden mitgeliefert und unter der Webadresse der App geladen. Für den PDF-Import die vorhandene HTTPS-Webadresse oder einen lokalen Webserver verwenden; direkt per Doppelklick geöffnete HTML-Dateien können durch Browserbeschränkungen keine PDF-Module laden. Bei Offline-Nutzung müssen die benötigten Dateien vorher im Browser verfügbar sein; OCR-Dateien werden bei der ersten Nutzung geladen. Die Verarbeitung überträgt die PDF nicht an einen externen KI-Dienst.

Der bisherige M365-Serviceberichtimport bleibt zusätzlich verfügbar.
