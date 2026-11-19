LAGERVERWALTUNG LOVRENCIC — V88.17
=================================

SICHERHEIT ZUERST
1. Laufende Inventur öffnen und „Zwischenstand speichern“ kontrollieren.
2. Unter „Dateisynchronisierung“ > „lager.db herunterladen“ eine aktuelle Datenbankkopie speichern.
3. Bitte weder Browser-/Website-Daten noch IndexedDB löschen. Keine neue Inventur starten.

GITHUB
1. ZIP entpacken.
2. Alle im ZIP enthaltenen Dateien in das HAUPTVERZEICHNIS von
   https://github.com/Oxijan86/lagerverwaltung hochladen.
   (Add file > Upload files; vorhandene Dateien ersetzen, neue hinzufügen.)
3. Commit durchführen und GitHub Pages aktualisieren lassen.
4. Installierte App schließen und neu öffnen, bei Bedarf erneut starten.
5. V88.17 oben in der Anwendung kontrollieren.

SAMMELZUORDNUNG BEIM RONDO-PDF-IMPORT
- Inventur > RONDO-PDF prüfen / Letzte PDF öffnen > Artikelprüfung öffnen.
- „I/1: X Artikelnummern gesammelt prüfen“ im oberen Vergleichsbalken.
- Liste vergleichen; bestätigen nur, wenn das ORIGINAL tatsächlich ein I enthält.
- Die Änderung der PDF-Artikelnummern ändert weder den gezählten Bestand noch den Stammdatensatz.
- NICHT blind „Geprüfte Firmenartikel übernehmen“ drücken: neue Artikel würden angelegt.

SAMMELZUORDNUNG BEIM PDF-EXPORT
- Inventur > „RONDO-PDF – Zwischenstand / Abschluss herunterladen“.
- Richtige offene Inventur explizit wählen.
- Unter „Sammelzuordnung: OCR-I/1 und identische Bezeichnung“:
  „I/1-Treffer prüfen“, „Alle unkritischen markieren“, „Ausgewählte PDF-Zuordnungen gemeinsam speichern“.
- Die vorgeschlagenen Zielnummern und die Mengen prüfen. Bereits beim falschen Artikel gezählte Positionen bleiben für Einzelprüfung zurückgestellt.
- Anschließend „PDF mit bisherigen Zählwerten erzeugen“. Originalseiten müssen vollständig sichtbar bleiben.

DUBLETTEN IN DATENBANK
- Im selben PDF-Ausgabedialog: „Artikelstamm: falsche I/1-Dubletten“.
- „I/1-Dubletten in Stammdaten suchen“ > CSV exportieren.
- „Sicherheitsprüfung für alle Paare“ zeigt gesperrte und technisch archivierbare Zeilen.
- NUR nach Prüfung anhand der Original-PDF mögliche OCR-Fehlartikel auswählen.
- Nach doppelter Bestätigung werden ausschließlich aktuell nachweislich UNBENUTZTE Fehlartikel archiviert.
- Vor jedem einzelnen Archivierungsschritt wird ein Sicherheitsbackup angelegt.
- Artikel mit Zählmengen, relevanten Buchungen oder echten Beständen werden BLOCKIERT.
- Eine Archivierung ist KEIN Bestandstransfer und kein Inventurabschluss.
- Wenn die App eine Fehlermeldung zeigt, stoppen, DB sichern und die genaue Meldung prüfen.

Die aus der bisherigen Datenbanksicherung erzeugte externe CSV mit 41 I/1-Paaren
ist eine PRÜFLISTE, keine Löschfreigabe.

TESTS
134/134 automatisierte Tests bestanden. Browser-Endtest auf dem Zielgerät offen.
