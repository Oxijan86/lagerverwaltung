# Lagerverwaltung Lovrencic V21

Diese PWA übernimmt den Funktionsumfang der Windows-Version 17 und ergänzt die Dateisynchronisierung ohne Microsoft-Anmeldung.

## GitHub aktualisieren
1. Inhalt dieses Ordners in das bestehende Repository `lagerverwaltung` hochladen.
2. Vorhandene Dateien ersetzen.
3. Commit durchführen.
4. Einige Minuten warten und die GitHub-Pages-Seite mit Strg+F5 neu laden.

## Erster Start
Beim ersten Start erscheint der Einrichtungsassistent:
- Stammdaten-Passwort
- Datumsformat
- Technikername

## Synchronisierung
Unter `Dateisynchronisierung` kann eine gemeinsame `lager.db` ausgewählt werden. Falls der Browser dies nicht unterstützt, SQLite exportieren und über den System-Dateidialog in OneDrive speichern.

## Enthaltener Funktionsumfang
- Dashboard, Lagerwert, Unterbestand, letzte und häufigste Entnahmen
- vollständige Artikelanlage und Artikelbearbeitung
- manuelle Einbuchung
- Lieferschein-Vorschau und Einbuchung
- CSV/XLSX-Import mit Artikelanlage
- manuelle Entnahme
- Servicebericht-Parser und Entnahme
- Materialanforderung mit Vorschau, Zusammenfassung und Originalvorlage
- CSV-Center
- Inventurimport, Vorschau und Korrekturbuchung
- Historienfilter und CSV-Export
- Stammdaten: Lagerorte, Maschinen, Techniker und Fahrzeuge
- Passwortschutz, Passwortwechsel und Reset
- Audit-Protokoll
- Hilfe
- PWA-Installation und Offline-Programmhülle
