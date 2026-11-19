Lagerverwaltung Lovrencic – Version 88.7 (GitHub-Direktupload)
=============================================================

DIESES UPDATE IST FÜR DAS BESTEHENDE REPOSITORY Oxijan86/lagerverwaltung.
Es ist keine neue, leere Lagerverwaltungs-Anwendung.

1. Dieses ZIP herunterladen und ENTpacken.
2. GitHub: https://github.com/Oxijan86/lagerverwaltung
3. Hauptverzeichnis (main) öffnen. "Add file" > "Upload files".
4. ALLE entpackten Dateien (nicht nur die ZIP-Datei) ins HAUPTVERZEICHNIS
   hochladen. Bereits vorhandene gleichnamige Dateien ERSETZEN.
5. Commit bestätigen. Die PWA/den Browser vollständig schließen, danach
   neu öffnen. Wenn V88.7 nicht angezeigt wird: Seite nochmals hart neu
   laden (Desktop Ctrl+F5) und PWA neu starten.

WICHTIG: Niemals Browserdaten, IndexedDB oder lager.db löschen. Die lokale
Inventur und nicht synchronisierte Änderungen könnten dort gespeichert sein.

WAS V88.7 BEHEBT
================

A) RONDO-PDF-Ausgabe
- Der alte Canvas-/Rasterexport darf nicht mehr ausgeführt werden.
- V88.7 ruft immer die verlustfreie PDF-Erweiterung LV886PDF direkt auf,
  unabhängig von einem alten im Cache befindlichen LV87PDF-Objekt.
- Falls die sichere Erweiterung noch nicht vorhanden ist, versucht der Export,
  sie gezielt nachzuladen. Ist das unmöglich, wird der DOWNLOAD ABGEBROCHEN
  statt erneut weiße Seiten zu produzieren.
- Vor dem Download werden sämtliche Original-PDF-Bytes gegen den Anfang
  der ausgegebenen PDF geprüft. Die Original-RONDO-Seiten müssen erhalten sein.
- Die tatsächlichen Mengen stehen LINKS neben ST/M in der Mengenzeile.
  "Noch nicht gezählt" bleibt unverändert. Es wird NICHT "Gezählt" eingefügt.
- Zählername und aktuelles Exportdatum stehen in den vorgesehenen unteren
  Linien; die Unterschriftszeile bleibt leer.
- Teilweise ausgefüllte PDFs sind erlaubt: Ungezählte Mengen bleiben leer,
  eine ausdrücklich gezählte 0 wird als 0 ausgegeben.
- Der Export greift auf die gewählte gespeicherte Inventur zu und führt
  KEINE Bestandsänderung bzw. keinen Inventurabschluss durch.
- Verlustfreier Export ist aus Sicherheitsgründen auf die anhand SHA-256
  geprüfte ORIGINAL-RONDO-PDF mit 72 Seiten begrenzt. Abweichende Vorlagen
  erhalten einen erklärenden Fehler statt falsch platzierter Zahlen.

B) Bereits gestartete Inventur weiterverwenden
- Die Aktion nach PDF-Abgleich erkennt einen laufenden Inventurentwurf.
- Ist ein Entwurf vorhanden, lautet der Knopf "Laufende Inventur fortsetzen".
  Beim Klick wird dieser Entwurf geöffnet, ohne einen neuen anzulegen.
- Bestehende Zählwerte und die Inventur-Sitzungs-ID bleiben erhalten.
- Die frühere riskante "Nein > neue Inventur"-Verzweigung wird hier
  abgefangen; aus dieser Aktion kann keine zweite Inventur entstehen,
  während ein Entwurf vorhanden ist.
- Nur wenn KEIN Entwurf vorhanden ist, darf ausdrücklich nach Bestätigung
  eine neue Inventur angelegt werden.
- Keine der neuen Funktionen ruft Inventur-Abbruch oder Inventur-Commit auf.

C) Bisherige Funktionen bleiben erhalten
- Import der Original-PDF über die SHA-256-prüfte Katalogzuordnung:
  72 Seiten, 719 Positionen, bei Unsicherheit direkte Zeilenprüfung.
- OCR-Zeilen lassen sich später zuordnen; ähnliche Nummern und
  Beschreibungen werden mit dem vorhandenen Artikelstamm abgeglichen.
- Bei der Ersteinrichtung: leere Datenbank, RONDO-PDF oder SAPUI5-Export.
- Dokumentation unter Hilfe ergänzt.

PRÜFEN NACH INSTALLATION
========================
1. Im Kopf muss Version 88.7 stehen.
2. RONDO-Original-PDF erneut auswählen, falls sie nicht gespeichert ist.
3. Eine bereits laufende Inventur NICHT abbrechen: auf "Laufende Inventur
   fortsetzen" gehen. Der bisherige Zählstand muss sichtbar sein.
4. "RONDO-PDF – Zwischenstand / Abschluss herunterladen" öffnen.
5. RONDO-Originalseiten (Logo, Material und Tabellen) auf Seite 1, 2, 17
   und 72 im PDF prüfen. Zählwerte stehen links von ST/M.
6. Die Inventur erst bei tatsächlich fertiger Zählung über den separaten
   Inventurabschluss verbindlich abschließen.

TECHNISCHE TESTS
================
node --test test_v88_7.cjs

Diese Tests benötigen keine vertrauliche Original-PDF und können auch im
öffentlichen GitHub-Repository durchgeführt werden. Der vollständige
72-Seiten-PDF-Test wurde separat mit der bereitgestellten Originaldatei
vor dem ZIP-Bau durchgeführt. Die Originaldatei ist NICHT im ZIP.

GRENZEN
=======
Die tatsächliche bereits installierte GitHub-Pages-PWA auf deinem Gerät
kann hier nicht direkt geöffnet oder aktualisiert werden. Der lokale
Chromium-Browser-Test des Exportdialogs und der Inventur-Schaltfläche
sowie die PDF-Prüfung sind bestanden. Wenn GitHub Pages nach Upload
noch eine alte Version anzeigt, keine Daten löschen: PWA schließen,
Browser neu laden, Cache-Aktualisierung abwarten.
