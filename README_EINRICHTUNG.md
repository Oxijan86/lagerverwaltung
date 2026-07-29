# Lagerverwaltung Lovrencic V39 – Materialanforderung ohne Excel-Reparatur

## Ursache des bisherigen Fehlers

Die bisherige Exportfunktion bearbeitete `sheet2.xml` direkt. Dadurch konnte die Reihenfolge oder Struktur einzelner Zellknoten ungültig werden. Excel öffnete die Datei anschließend nur nach einer Reparatur und meldete entfernte Zellinformationen.

## Neue Exporttechnik

V39 verwendet ExcelJS:

1. Originalvorlage `materialanforderung_vorlage.xlsx` laden
2. vorhandenes Exportblatt `Tabelle1` öffnen
3. ausschließlich Zellwerte ändern
4. Formatierungen und Seitenlayout der Vorlage beibehalten
5. Arbeitsmappe regulär als XLSX schreiben
6. erzeugte Datei intern erneut öffnen
7. Techniker, Menge, Artikelnummer und Bezeichnung jeder Position kontrollieren
8. Download nur bei erfolgreicher Prüfung freigeben

## Unverändert

- bestehendes Tabellenlayout
- Druck- und Seitenlayout
- Spaltenbreiten
- Zeilenhöhen
- Rahmen und Schriftformatierungen
- Dateiname
- bestehende Buttons
- Positionen 1 bis 25
- CSV-Korrekturen aus Version 38

## Zusätzliche Sicherheit

- Artikelnummern werden als Text geschrieben
- Mengen werden ausschließlich numerisch geschrieben
- keine Einheit wird an die Menge angehängt
- leere Restzeilen werden kontrolliert
- falsche oder verschobene Artikelzuordnungen werden vor dem Export blockiert
- der Export wird nach dem Erzeugen erneut eingelesen und gegen die Ausgangsdaten geprüft
