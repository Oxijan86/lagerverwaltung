Lagerverwaltung Lovrencic – Version 88.8 (GitHub-Direktupload)
=============================================================

Dieses ZIP ist das Upgrade für das BESTEHENDE Repository:
https://github.com/Oxijan86/lagerverwaltung

Installation:
1. ZIP herunterladen und entpacken.
2. GitHub > Repository > Hauptverzeichnis (Branch main) öffnen.
3. Add file > Upload files wählen.
4. ALLE Dateien aus dem ZIP (nicht die ZIP selbst) direkt ins
   Hauptverzeichnis hochladen. Bestehende gleichnamige Dateien ersetzen.
5. Commit durchführen, GitHub Pages aktualisieren lassen.
6. App vollständig schließen und neu starten, ggf. zweimal neu laden.
7. Oben muss "Version 88.8" stehen. Keine Browserdaten löschen!

NEU V88.8: Abweichender Technikername beim RONDO-Artikelimport
--------------------------------------------------------------
Wenn beim Übernehmen GEPRÜFTER RONDO-Artikel die Meldung
"Techniker ist nicht gültig" entstehen würde, zeigt die App
jetzt einen Hinweis mit dem übergebenen Techniker und den im
aktuellen Lager hinterlegten Namen.

OK: Abweichung ausdrücklich ignorieren und denselben reinen
Artikelimport ohne Mengen fortsetzen. Der Name wird für die
Artikelanlage und die Audit-Ereignisse verwendet; er wird NICHT
automatisch als registrierter Techniker angelegt.

Abbrechen: Import wird nicht fortgesetzt; die bereits geprüften
bzw. für später zurückgestellten PDF-Zeilen bleiben gespeichert.

SICHERHEIT:
- Ausnahmeregel gilt AUSSCHLIESSLICH bei
  /api/articles/create-import UND ausschließlich wenn ALLE
  Artikelpositionen initial_stock=0 und quantity=0 besitzen.
- Für /api/import/create-and-book, SAP-Import mit Mengen,
  Ein-/Ausbuchungen und den Inventurabschluss bleibt die
  reguläre Technikerprüfung uneingeschränkt bestehen.
- Keine laufende Inventur wird durch diese Änderung abgebrochen,
  keine Bestandsmengen werden automatisch korrigiert.
- Der Service Worker aktualisiert die UI und die präzise
  Validierung in local_backend.js beim Laden. Es ist KEINE
  Datenbankmigration erforderlich.
- Achtung: Falls noch eine ältere, nicht aktualisierte App-Instanz
  geöffnet ist, kann sie zunächst den alten Fehler anzeigen.
  V88.8 schließen und vollständig neu laden – bitte KEINE
  Browserdaten löschen oder lager.db löschen.

UNVERÄNDERT AUS V88.7:
- 72-seitige Original-RONDO-PDF wird nur bei passender SHA-256
  über den geprüften Katalog mit 719 Positionen eingelesen.
- In der PDF-Prüfansicht können unklare Zeilen später zugeordnet
  oder mittels Datenbankabgleich geprüft werden.
- Bereits laufende Inventuren haben Vorrang: "Laufende
  Inventur fortsetzen" statt versehentlich eine neue zu erzeugen.
- Sicherer PDF-Export mit Originalseiten, Mengen LINKS vor ST/M,
  Name/Datum auf den Linien, ohne "Gezählt"-Übermalung.
- Export verändert keinen Lagerbestand. Bestandsänderungen erst
  durch expliziten Inventurabschluss.
- Drei Wege der Ersteinrichtung: ohne Import, RONDO-PDF, SAPUI5.

TESTS:
  node --test test_v88_7.cjs test_v88_8.cjs
(Die echte, firmeninterne Original-PDF ist NICHT im ZIP enthalten.
Nur für einen lokalen Zusatztest: RONDO_PDF_PATH=/Pfad/zur/Datei.pdf
node --test test_v88_8.cjs)

GRENZE:
Automatisierte Tests prüfen Serverlogik und UI-Wiederholungen.
Ein vollständiger End-to-End-Test deiner installierten PWA
mit ihrer konkreten neuen Datenbank ist erst nach Installation
möglich. Die Prüfung führt keine Datenbankänderung durch.
