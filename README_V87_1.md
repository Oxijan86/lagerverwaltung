# Lagerverwaltung Lovrencic V87.1 – Korrektur der RONDO-PDF-Erkennung

**Basis:** V87.0. Dieses ZIP enthält **nur die zu ersetzenden Dateien**, nicht das vollständige Repository. Alle bisherigen Funktionen aus V80–V87 bleiben erhalten.

## Behobener Fehler

Beim Import der gescannten RONDO-Inventurliste erschien trotz 72 erfolgreich geladener Seiten **„0 Artikelpositionen erkannt“**. Die bisherige OCR-Auswertung hat angenommen, dass Positionsnummer, Materialnummer und Lagerort in derselben Textzeile stehen. Tatsächlich können Texterkennungen die Spalten nacheinander oder mit abweichenden Zeilenumbrüchen liefern.

V87.1 fügt eine **spalten- und zeilenpositionsbasierte Erkennung anhand der OCR-Wortkoordinaten** hinzu und nutzt die bisherige Texterkennung weiterhin ergänzend:

- Erkennt Positionsnummern, Materialnummern, Bezeichnungen, Lagerort und Einheiten aus den Wortkoordinaten des RONDO-Formulars.
- Unterstützt lange sowie vierstellige Materialnummern.
- Verwendet optional strukturierte TSV-Daten, wenn der OCR-Worker keine Wortblöcke liefert.
- Wirft auf Seiten ohne erkennbare Artikel eine **verständliche Fehlermeldung**, statt alle 72 Seiten ohne Artikel durchlaufen zu lassen.
- Verwirft zuvor zwischengespeicherte **leere** OCR-Seiten und scannt sie neu; doppelte Seiteneinträge werden entfernt.
- Blockiert die Übernahme einer vollständig leeren Firmenartikel-Liste.
- Aktualisiert Versionanzeige, Manifest und Service-Worker-Cache.

## Sicherheit

Es werden **keine Artikelnummern geraten**, und unvollständig erkannte Positionen bleiben zur manuellen Kontrolle markiert. Die ursprüngliche PDF hat keine Bestandsmengen. Beim Einlesen werden deshalb **keine Lagerbestände geändert**. Vor einer produktiven Bestandskorrektur muss die Inventur gesondert abgeschlossen werden.

## Prüfumfang

- 19 automatisierte JavaScript-Tests erfolgreich.
- Praktischer OCR-Datentest mit **Seite 1 der echten RONDO-PDF: 10/10 Positionen**.
- Praktischer OCR-Datentest mit **Seite 72: 9/9 Positionen**.
- **Noch kein** erfolgreicher vollständiger OCR-Endtest aller 72 Seiten im Zielbrowser. Andere Seiten können manuelle Nacharbeit benötigen.

Nach dem Upload die PWA aktualisieren, die originale RONDO-PDF erneut auswählen und die Anzahl der Positionen **vor jeder Übernahme prüfen**.
