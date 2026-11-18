LAGERVERWALTUNG LOVRENCIC V88.5 – GITHUB-DIREKTUPLOAD
======================================================

ZIEL
  Behebung des wiederholten Fehlers „Seite 1: 0 Wortpositionen und 0 Textzeichen“
  beim Einlesen der unveränderten Originaldatei „Inventurliste Lovrencic 1025.pdf“.

INSTALLATION (bestehendes Repository Oxijan86/lagerverwaltung)
  1. Diese ZIP-Datei entpacken.
  2. Auf GitHub das Repository Oxijan86/lagerverwaltung öffnen.
  3. Add file → Upload files wählen.
  4. ALLE Dateien aus dem entpackten Ordner in das Hauptverzeichnis hochladen.
     Vorhandene Dateinamen werden ersetzt; neue Dateien werden ergänzt.
  5. Commit changes bestätigen.
  6. Die installierte App vollständig schließen und wieder öffnen. Bei Bedarf
     nochmals neu öffnen, damit der neue Service Worker die Seite steuert.
  7. In der Kopfzeile Version 88.5 kontrollieren; dann die unveränderte
     „Inventurliste Lovrencic 1025.pdf“ auswählen und PDF prüfen.

SICHERHEIT
  - NIEMALS Browserdaten/IndexedDB löschen, um das Update zu aktivieren.
  - Vorhandene lager.db, Backups und Synchronisationsordner nicht entfernen.
  - Keine vorhandene Datenbank durch eine neue leere ersetzen.
  - Erst „Inventur verbindlich abschließen“ ändert Lagerbestände.

WAS NUN PASSIEREN SOLL
  Der Dialog zeigt „Original-RONDO-PDF erkannt“ und lädt 719 Positionen auf
  72 Seiten direkt aus dem vorher geprüften Katalog. Anschließend wird die
  Sichtprüfung der unsicheren Materialnummern angeboten.

WENN WEITERHIN EIN FEHLER ERSCHEINT
  - „Datei unterscheidet sich“: Deine ausgewählte Datei hat einen anderen
    SHA-256-Fingerabdruck als die bereitgestellte Original-PDF; nicht blind
    übernehmen. Fehlermeldung inklusive Prüfsummenausschnitt mitteilen.
  - „Importer/Katalog konnte nicht geladen werden“: Die neue Programmdatei wird
    durch Cache/Netzwerk blockiert. Prüfen, ob alle Dateien im Repository liegen
    und die Versionsanzeige 88.5 ist; App schließen und erneut öffnen.
  - „0 Wortpositionen“ trotz V88.5: Bitte vollständige Fehlermeldung senden;
    möglicherweise wurde noch eine alte JavaScript-Datei gestartet.

GETESTET
  - Original-PDF SHA-256: a3f457120746435d4a0d8b81b4f808e6a122b448353c91de6d291cdcf16aa29b
  - Original-PDF: 72 Seiten, 719 Positionen, davon 76 OCR-Prüfhinweise.
  - Automatische Prüfungen: siehe TESTERGEBNIS_V88_5.md.
  - Kein vollständiger E2E-Test im produktiven installierten App-Fenster.

TESTS (optional, für Entwickler)
  node --test test_v88_4.cjs test_v88_5.cjs
  Mit Original-PDF für zusätzliche echte Dateitests:
  RONDO_ORIGINAL_PDF="/pfad/Inventurliste Lovrencic 1025.pdf" node --test test_v88_5.cjs

Die Original-PDF wird aus Datenschutz- und Dateigründungen NICHT mit dem GitHub-Paket ausgeliefert.
