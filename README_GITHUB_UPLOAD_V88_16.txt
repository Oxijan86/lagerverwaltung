LAGERVERWALTUNG LOVRENCIC — VERSION 88.16
=========================================
Korrektur: RONDO-Weißseiten-PDF, OCR-I/1-Zuordnungen, manuelle Nachkorrektur

VOR DER INSTALLATION
1. Laufende Inventur mit „Zwischenstand speichern“ sichern.
2. Unter „Dateisynchronisierung“ eine Kopie „lager.db herunterladen“ erstellen.
3. Diese Kopie getrennt außerhalb des synchronisierten Lagerordners aufbewahren.
4. Keine Inventur abbrechen, abschließen oder neu erstellen, nur um das Update
   einzuspielen. Keine Website-Daten, IndexedDB oder Cache-Speicherdaten löschen.

GITHUB-UPLOAD
1. ZIP entpacken.
2. Alle Dateien aus diesem ZIP in das HAUPTVERZEICHNIS von
   https://github.com/Oxijan86/lagerverwaltung hochladen (Add file > Upload files).
3. Upload bestätigen und GitHub-Pages-Version vollständig neu öffnen.
4. Kontrollieren, dass Version 88.16 angezeigt wird.
5. Falls noch eine alte Version erscheint: Chrome F12 > Application > Service
   Workers > Update; Seite mit Strg+Umschalt+R neu öffnen. KEIN „Clear site data“.
6. Die ursprüngliche laufende Inventur vom 12.11.2026 aus „Gespeicherte
   Inventur“ ausdrücklich auswählen. Keinen neuen Inventurstart vornehmen.

SO WIRD DIE RONDO-PDF KORREKT ERZEUGT
1. „Zwischenstand speichern“. Eine Speichermeldung abwarten.
2. RONDO-Firmeninventur (PDF) > „Letzte PDF öffnen“ (sofern bereits gespeichert).
   Fehlt die Originaldatei, ausschließlich „Inventurliste Lovrencic 1025.pdf“
   importieren. NICHT die fehlerhafte weiße ausgefüllte PDF importieren.
3. „RONDO-PDF – Zwischenstand / Abschluss herunterladen“ anklicken.
4. Richtige laufende Inventur auswählen (bei mehreren Inventuren wichtig).
5. „PDF-Positionen schnell zuordnen“ öffnen. Nach USB-Stick, I1000339,
   11000339 oder Seite 4 suchen. Ggf. „Auch bereits zugeordnete ... anzeigen“
   aktivieren.
6. Den vorhandenen Lagerartikel nach tatsächlicher Artikelnummer und
   Beschreibung MANUELL auswählen und bestätigen. Der Referenzkatalog kann
   insbesondere den Buchstaben I mit der Ziffer 1 verwechseln.
7. Anschließend „PDF mit bisherigen Zählwerten erzeugen“ wählen.
8. Die heruntergeladene PDF vor Firmenabgabe öffnen: Logo, RONDO-Materialzeilen,
   72 Seiten und Zählmengen LINKS VOR ST / M müssen sichtbar sein.
   Wenn die Ausgabe leer erscheint: NICHT an RONDO senden; Fehlermeldung melden.

BEISPIEL USB-STICK AUS DER GEPRÜFTEN SICHERUNG (NICHT LIVE-DATEN)
- Die gescannte Originalseite 4 / Position 6 zeigt I1000339 (Buchstabe I).
- Im gespeicherten Inventurstand ist I1000339 (Artikel-ID 625) mit 2 Stk.
  GEZÄHLT und 3 Stk. bisherigem Buchbestand vorhanden.
- Der separat durch OCR erzeugte Artikel 11000339 (Artikel-ID 767) war
  NICHT gezählt und hatte keinen Anfangsbestand.
- Für diesen Beleg ist deshalb nach bestätigter Prüfung normalerweise
  I1000339 als vorhandener Artikel zuzuordnen. Die 2 Stk. werden dann direkt
  in die RONDO-PDF geschrieben – OHNE Umbuchen einer Inventurmenge.
- Der zusätzliche, möglicherweise falsche OCR-Artikel kann separat über
  „Artikelkorrektur prüfen“ kontrolliert und nur bei fehlenden Beständen,
  Bewegungen und bestätigten Zählungen nach Backup archiviert werden.
- Falls bei ANDEREN Artikeln wirklich der falsche Artikel bereits gezählt
  wurde und die richtige Zielposition leer ist: der neue Dialog bietet nach
  zweimaliger Bestätigung und automatischem Backup die Übernahme AUSSCHLIESSLICH
  der Inventur-Zählung an. Bestehende Lagerbestände bleiben dabei UNVERÄNDERT!

WICHTIG: EINE ZÄHLUNGSÜBERTRAGUNG IST KEINE LAGERBESTANDSKORREKTUR
Vor dem verbindlichen Inventurabschluss immer prüfen, ob unter einer alten
falschen OCR-Nummer noch Lagerbestände, Buchungen oder Lagerortbestände liegen.
Diese dürfen nicht ungeprüft zusammengeführt oder doppelt gezählt werden.

ZUSATZLISTE FÜR RONDO
Im gleichen PDF-Dialog: „Zusatzliste für RONDO herunterladen (CSV)“.
Sie weist nicht im PDF vorhandene Artikel und offene OCR-Prüffälle getrennt aus.
Ungezählte Positionen werden nicht als gezählte Bestände dargestellt.

TECHNISCHE SICHERHEIT
- v88_16_export_guard.js fängt den Exportknopf VOR dem alten Canvas-Renderer ab.
- Export nur mit der geprüften ORIGINAL-PDF (SHA-256-Signatur), 719 Positionen.
- Ausgabe wird auf unveränderte Original-PDF-Bytes geprüft; es gibt keinen
  stillen Fallback auf einen Weißseiten-/Rasterrenderer.
- Bei manueller Zuordnung wird genau EINE PDF-Position gespeichert.
- Keine Inventur- oder Bestandsänderung beim Installieren.
- Neue Zählungs-Übertragung ist versions- und artikelgebunden, transaktional
  und erstellt vor der Änderung ein Sicherheitsbackup.
- Vollständiger Chromium-Praxistest auf deinem Gerät steht noch aus.

Prüfung in der Entwicklungsumgebung: 126/126 automatisierte Tests erfolgreich;
Original-PDF mit 72 Seiten und vier Originalbildern auf jeder Seite geprüft.
Keine Nutzer-Datenbank oder Original-RONDO-PDF ist Bestandteil des ZIP.
