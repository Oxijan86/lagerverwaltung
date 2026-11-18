LAGERVERWALTUNG LOVRENCIC – VERSION 88.4
=========================================

Installation (für Oxijan86/lagerverwaltung)
------------------------------------------
1. ZIP herunterladen und entpacken.
2. https://github.com/Oxijan86/lagerverwaltung öffnen.
3. Im Hauptverzeichnis Add file > Upload files auswählen und ALLE
   enthaltenen Dateien auf einmal hochladen (gleichnamige ersetzen).
4. Commit changes bestätigen und GitHub Pages aktualisieren lassen.
5. Web-App schließen und erneut öffnen; bei Bedarf zweimal neu laden,
   bis Version 88.4 sichtbar ist.
6. Browserdaten, IndexedDB und bestehende lager.db NIEMALS zum
   Erzwingen eines Updates löschen. Vor größeren Arbeiten Backup erstellen.

Ersteinrichtung: Drei Möglichkeiten
-----------------------------------
- OHNE IMPORT: Standard. Neue leere Datenbank, Artikel später manuell anlegen.
- RONDO-PDF: Materialstamm aus Inventurliste übernehmen; anschließend zählen.
  Für die mit diesem Projekt verwendete 72-Seiten-Originaldatei ist der
  SHA-256-gebundene, extern geprüfte 719-Positionen-Katalog enthalten.
- SAPUI5-Export (XLSX/XLS/CSV): Gleiches Format und dieselbe Prüf-API wie
  im CSV-Center. Erforderliche Spalten:
  Material;Bezeichnung zum Material;Lagerort;
  Bezeichnung des Lagerorts;Frei verwendbar
  Anfangsmengen einmalig übernehmen, nicht zusätzlich als Wareneingang.
  Vorhandene lager.db NICHT durch Ersteinrichtung ersetzen.

Schnelle RONDO-Artikelprüfung
----------------------------
- Unsichere Positionen direkt in der Tabellenzeile bearbeiten.
- Jede Position mit 'Diese Zeile geprüft' schnell bestätigen.
- Existierende Materialnummern/Bezeichnungen mit App-Artikeln abgleichen.
- Bei OCR-Widerspruch passende, nur vorgeschlagene DB-Treffer auswählen.
- Exakte und stark passende DB-Treffer gesammelt als geprüft markieren.
- Doppelte Nummern werden gesperrt. Keine automatischen Bestandseingriffe.
- Touch-Bedienung auf Smartphones mit größerer Zeilendarstellung.

RONDO-PDF während und nach der Inventur
--------------------------------------
1. Unter Inventur > RONDO-Firmeninventur den PDF-Export öffnen.
2. Laufende, abgeschlossene oder gespeicherte Inventur auswählen.
3. ZÄHLER wird mit dem Standard-Techniker aus der App vorbelegt und kann
   im Exportdialog nötigenfalls angepasst werden.
4. DATUM wird automatisch mit dem jeweiligen heutigen lokalen Datum
   des PDF-Exports ausgefüllt (z. B. 18.11.2026).
5. Die Zeile SIGNATUR bleibt absichtlich leer; keine Signatur erforderlich.
6. Schon gezählte Mengen werden auf jede passende PDF-Position geschrieben;
   Menge 0 wird ausdrücklich als 0 behandelt, ungezählte Felder bleiben leer.
7. Auch während der Inventur ist eine teilweise ausgefüllte PDF möglich.
   Das speichert bei Bedarf NUR den Inventur-Zwischenstand.
8. Erst der separate, ausdrückliche Befehl 'Inventur verbindlich
   abschließen' ändert vorhandene Lagerbestände.
9. Nach Abschluss ist die ausgefüllte PDF weiterhin abrufbar und kann
   mehrfach heruntergeladen werden. Ein erneuter Export bucht nichts.

Die Hilfe in der App wurde dafür ergänzt.

Technik / Einschränkungen
------------------------
Die ZIP enthält die neuen und geänderten Dateien für das bestehende
Repository. Vorhandene index.html und v87-Dateien bleiben bestehen.
Der Service Worker bindet notwendige Module ein und passt die V87-
Funktionen beim Browserabruf an. Es ist keine Datenbankmigration vorgesehen.

27 automatisierte Node-Tests bestanden. Eine vollständige E2E-Prüfung
mit der echten App auf deinem Smartphone und mit Cloud-Synchronisation
wurde nicht durchgeführt. Exportplatzierung anhand der Original-RONDO-
PDF auf einer Vorschauseite geprüft; 72-seitiger Browserexport bleibt
auf dem Zielgerät praktisch zu kontrollieren.
