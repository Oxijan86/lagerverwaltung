# Lagerverwaltung Lovrencic – Version 71

V71 behebt das abschließende Komma bei Mengen in der Excel-Materialanforderung. Ganze Mengen erscheinen zum Beispiel als **5** statt **5,**. Die Korrektur gilt für normale Artikel und Verbrauchsmaterial ohne Artikelnummer, sowohl in der kleinen Vorlage bis 25 Positionen als auch in der großen Vorlage ab 26 Positionen.

Die Mengen bleiben echte Zahlen in Excel. Ganze Mengen erhalten das Zahlenformat `0`, Dezimalmengen das Excel-Standardformat `General`. Damit wird kein abschließendes Dezimalzeichen erzwungen; auch Mengen wie 1,125 werden nicht mehr durch das bisherige Format auf zwei Nachkommastellen gerundet.

## Update

Das vollständige Paket entpacken, die App-Dateien in der vorhandenen Bereitstellung aktualisieren und die Seite neu laden. Die App zeigt Version **71.0** und verwendet einen neuen Service-Worker-Cache. Die bestehende `lager.db` weiterverwenden. Die Funktionen aus V70 sind weiterhin enthalten; siehe `README_V70.md`.

Bereits exportierte Excel-Dateien werden nicht nachträglich verändert. Die Materialanforderung mit V71 erneut exportieren.

## Prüfung

Die Regressionstests erzeugen echte Excel-Dateien über die App und prüfen numerische Zellwerte sowie die mit SheetJS gerenderte Anzeige der exportierten Zahlenformate. Geprüft werden beide Vorlagen, beide Materialtypen, ganze Mengen und Dezimalmengen mit bis zu sechs Nachkommastellen. Die originalen Vorlagendateien bleiben unverändert.

Testbefehle und Abhängigkeiten sind in `README_V70.md` beschrieben. Ergebnisse stehen in `TEST_RESULTS_V71.txt`.
