LAGERVERWALTUNG LOVRENCIC – V88.20 (TESTVERSION / GITHUB-UPLOAD-PAKET)
===================================================================

BISHERIGE DATEN UNVERÄNDERT
---------------------------
Diese Dateien verändern beim Einspielen KEINE lager.db, KEINE Inventur, KEINE
Zählmenge, KEINE Buchung und KEINEN vorhandenen PDF-Prüfstand. Es werden nur
Programmdateien aktualisiert. Bitte trotzdem vorher ein vollständiges
Backup der lager.db und des PDF-Prüfstands (JSON) erstellen.

WICHTIG: Die GitHub-Verbindung konnte den Branch nicht automatisch anlegen
(403 – fehlende Schreibberechtigung). Deshalb enthält dieses Paket ein
lokales Installationsprogramm für die sechs geänderten GitHub-Dateien.

INSTALLATION AUF WINDOWS – SCHRITT FÜR SCHRITT
---------------------------------------------
1. In deiner Lagerverwaltung zuerst ein Backup der lager.db machen sowie den
   RONDO-PDF-Prüfstand als JSON herunterladen. Nichts abschließen.
2. Im Browser dein GitHub-Repository Oxijan86/lagerverwaltung öffnen.
   Über „Code“ -> „Download ZIP“ das ganze Repository herunterladen.
3. Das heruntergeladene ZIP in einen Ordner entpacken (z. B.
   „lagerverwaltung-main“). Nicht in der Cloud-App arbeiten.
4. Dieses V88.20-Paket ebenfalls entpacken.
5. Den entpackten Ordner „lagerverwaltung-main“ mit der Maus auf die Datei
   INSTALLIEREN_V88_20.bat ziehen. Das Windows-Fenster zeigt Erfolg oder Fehler.
   Dafür wird PowerShell verwendet, das bei Windows normalerweise vorhanden ist.
   Eine Alternative für Entwickler ist: python v88_20_patch.py <Projektordner>.
6. Im entpackten Projektordner sind jetzt diese SECHS Dateien aktualisiert:
     local_backend.js
     service-worker.js
     v88_4_export.js
     v88_20_core.js
     v88_20_report.js
     v88_20_assistant.js
7. Diese sechs Dateien im GitHub-Hauptverzeichnis über „Add file“ ->
   „Upload files“ hochladen und den Commit bestätigen. Keine alten
   .v88_19_backup-Dateien hochladen.
8. Anwendung nach dem GitHub-Update neu laden. PWA/Service-Worker braucht
   ggf. einen Neustart der Seite, bis V88.20 angezeigt wird.
9. ZUERST mit einer gesicherten TESTDATENBANK prüfen, dann erst echte
   Archivierung durchführen. Die erste Inbetriebnahme auf Smartphone/PC
   muss gesondert überprüft werden.

FUNKTIONSUMFANG
---------------
* Inventur: geführte PDF-Sichtprüfung mit echter Originalseite und automatisch
  vergrößerter Materialzeile.
* Erkanntes I/1 und O/0 wird mit Stammdaten verglichen; keine stille Korrektur.
* Artikelnummer selbst eingeben, Vorschläge beim Tippen und nach der Prüfung
  automatisch zur nächsten offenen Zeile wechseln.
* Prüfstatus „geprüft“, „korrigiert“, „später prüfen“ bleibt im
  PDF-Prüfstand des Browsers erhalten. Bereits früher manuell geprüfte
  Positionen (checked_at) werden übernommen.
* Stammdaten: Mehrfachauswahl per Checkbox, Filter für mögliche I/1-Fehlartikel,
  Vorschau „sicher“/„gesperrt“ und Sammelarchivierung nach zwei Bestätigungen.
* Server prüft jeden Artikel erneut vor der Archivierung und erstellt ein
  Sicherheitsbackup. Bestände, Buchungen, Inventurzählungen, Import- und
  Servicebericht-Verknüpfungen sperren die Archivierung.
* Keine automatische oder erzwungene Löschung von Buchungshistorien über die
  neue Sammelaktion. Die alte Einzel-Löschfunktion wurde nicht geändert.
* PDF-Zählmengen: Der Firmen-PDF-Einheit wird bei der Druckformatierung
  Vorrang gegeben. Fehlt ein Zählwert, bleibt das Feld leer. Eine echte 0
  bleibt ausdrücklich 0. Der bestehende sichere Original-PDF-Export bleibt.
* Zusätzlicher Firmenbericht: NUR tatsächlich gezählte Artikel ohne sichere
  Original-PDF-Zuordnung, mit möglichen OCR-Fällen kenntlich gemacht.
  Direkt aus der gewählten Inventur als PDF oder Word (.docx) herunterladbar.
* Hilfe-Reiter erhält eine Schritt-für-Schritt-Anleitung.

WAS NOCH MANUELL ZU PRÜFEN IST
-----------------------------
* Browser/PWA auf Windows und Smartphone; korrekte Vergrößerung bei jeder
  Papierposition. Die Erkennung ist scanbedingt nicht fehlerfrei.
* Kompletten RONDO-PDF-Export gegen die Original-PDF einschließlich der 72
  Seiten visuell prüfen.
* Cloud-Synchronisierung: PDF-Bilder und V88.20-Prüfstände werden weiterhin
  im Browser gespeichert, NICHT automatisch in der Cloud-lager.db.
  Bei Gerätewechsel PDF-Prüfstand als JSON sichern und beide Datenstände
  vergleichen. Ein systemweiter synchronisierter PDF-Prüfstatus ist noch nicht
  implementiert; die bestehende Lagerdatenbank-Synchronisierung bleibt bestehen.
* Archivierung ist reversibel; endgültiges Löschen beliebiger Stammdaten
  wäre gefährlich und ist bewusst NICHT als Sammelaktion implementiert.

AUTOMATISIERTE TESTS
--------------------
Für die reine Logik: node test_v88_20_core.cjs
Für die Dokumentausgabe: node test_v88_20_report.cjs
Für die Updater-Integration: python test_v88_20_patch.py

Diese Tests ersetzen KEINEN vollständigen Browser-/PWA-/Datenbanktest mit
realen Dateien. Freigabe für produktiven Einsatz erst nach Praxiskontrolle.
