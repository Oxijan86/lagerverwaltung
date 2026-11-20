LAGERVERWALTUNG LOVRENCIC – V88.20 (REGULÄRE VERSION)
=====================================================
Repository: https://github.com/Oxijan86/lagerverwaltung
Basis: zuletzt geprüfter GitHub-Stand V88.19 mit bereits hochgeladenen V88.20-Modulen.
Stand: 20.11.2026

DIE WICHTIGSTE INFORMATION
-------------------------
Dies ist ein GitHub-Update-Paket, KEINE ZIP-Datei mit einer neuen Datenbank.
Das Paket enthält alle neuen V88.20-Module und erzeugt aus dem aktuellen
GitHub-Quellcode die SIEBEN FERTIGEN Dateien, die bei GitHub hochgeladen werden.
Die bestehende lager.db wird nicht angefasst, ausgetauscht oder gelöscht.

SO INSTALLIERST DU DIE REGULÄRE VERSION
---------------------------------------
1. ZUERST aktuelle lager.db als Sicherung herunterladen. Auch den PDF-Prüfstand
   aus der Anwendung als JSON exportieren. Synchronisierung auf dem PC prüfen.
2. Dieses Paket vollständig in einen Ordner entpacken.
3. INSTALL_V88_20.bat doppelt anklicken.
   Das Skript lädt das aktuelle Originalprojekt direkt von GitHub und ergänzt
   die Änderungen. Kein Python, Node.js oder Git muss installiert sein.
   Falls der Download durch GitHub-Berechtigungen scheitert: Öffne das Repo,
   wähle Code > Download ZIP, entpacke es und ziehe den ausgepackten
   Projektordner mit der Maus auf INSTALL_V88_20.bat.
4. Nach Erfolg befindet sich daneben der Ordner GITHUB_UPLOAD_V88_20.
5. Öffne GitHub > Oxijan86/lagerverwaltung > Add file > Upload files.
   Lade ALLE sieben .js-Dateien aus GITHUB_UPLOAD_V88_20 hoch.
   Es handelt sich teils um ERSATZDATEIEN – bestehende Dateien überschreiben.
   GitHub: Commit changes bestätigen.
6. Warte auf die bestehende GitHub-Pages-Veröffentlichung. Schließe alle offenen
   Tabs der App und öffne sie erneut. Ggf. die App hart neu laden (Strg+F5).
7. Im Info-Bereich muss die Version 88.20 angezeigt werden. Vor weiteren
   Arbeiten den PDF-Prüfstand und die Buchungsdaten vergleichen.

DIE SIEBEN DATEIEN
-----------------
  local_backend.js       – sichere Archivierung, DB-gestützte PDF- und Dublettenprüfung, Versionsnummer
  service-worker.js      – lädt V88.20 und erneuert Offline-App-Cache
  v88_4_export.js        – RONDO-Einheit und vollständige JSON-Prüfstandsicherung
  sync_merge_v82.js      – Konflikte der neuen Prüfdatenbanktabellen erkennen
  v88_20_core.js         – Artikelnummern und Prüfschritte
  v88_20_assistant.js    – geführte Sichtprüfung, Mehrfachauswahl, Prüfung, Wiederherstellung
  v88_20_report.js       – Zusatzliste als PDF oder Word

NEUE FUNKTIONEN
---------------
- Original-RONDO-PDF je Seite/Position automatisch als Bildausschnitt anzeigen;
  ein Klick zeigt auf Wunsch die ganze Seite.
- Artikelnummer manuell korrigieren oder mit vorhandenen Artikelnummern
  abgleichen. I/1 und O/0 nur als VORSCHLÄGE, nicht als automatische Korrektur.
- Position als geprüft / korrigiert / später prüfen speichern.
- Neue PDF-Prüfentscheidungen liegen zusätzlich in lager.db und können mit
  dieser über die bestehende Datei-Synchronisierung übertragen werden.
  WICHTIG: die 72-seitige gescannte Original-PDF selbst bleibt auf jedem Gerät
  lokal und muss auf einem anderen Gerät ggf. erneut importiert werden.
- Dubletten können unabhängig von technischen Sperren als geprüft gespeichert
  und anschließend ausgeblendet werden.
- Stammdaten: bis zu 200 Artikel markieren, vorab auf Archivierung prüfen.
  Echte Buchungen, gezählte Inventurwerte und Bestände verhindern Archivierung.
  Reine technische Nullbuchungen des Imports bleiben erhalten. Vollständig
  UNGEZÄHLTE Platzhalter von laufenden Inventuren werden bei einer ausdrücklich
  bestätigten Archivierung der falschen Artikel entfernt; nie echte Zählungen.
- Archivierte Artikel sind wiederherstellbar. Backup und Audit vor Änderungen.
- PDF-Export: Einheit laut ORIGINAL-RONDO-Beleg, Zahlen nicht umrechnen.
  Fehlende Mengen bleiben leer, ausdrücklich gezählte 0 wird gedruckt.
- Bericht: gezählte Artikel ohne sichere Firmen-PDF-Zuordnung als PDF oder Word.
- Sicherheitsregeln für den Cloud-Konfliktvergleich der neuen Prüfstände.

WICHTIGE GRENZEN UND SCHUTZREGELN
--------------------------------
- Das Markieren oder Korrigieren einer PDF-Artikelnummer ÜBERTRÄGT KEINE
  Inventurzählung automatisch zwischen zwei Lagerartikel-IDs.
- Beispiel Getriebeöl: 32 L unter 11000329 bleiben geschützt. Damit die
  Anwendung sie unter I1000329 druckt, muss die Zählung gesondert über die
  bereits vorhandene kontrollierte PDF-/Inventur-Zuordnungsfunktion übertragen
  werden. Die neue Sichtprüfung warnt ausdrücklich vor ähnlichen Zählungen.
- Der Import und die PDF-Sichtprüfung schließen niemals eine Inventur ab.
- Die bestehende 'Artikel löschen – auch Buchungen löschen'-Funktion wird
  NICHT für die neue Sammelarchivierung verwendet.
- Bei widersprüchlichem Cloud-Stand wird kein automatisches blindes
  Zusammenführen der neuen Prüfstände vorgenommen; Vergleich erforderlich.
- Keine App kann einen vollständig fehlerfreien Betrieb aller Geräte ohne
  einen abschließenden Test auf dem produktiven GitHub-Pages-Host garantieren.

DURCHGEFÜHRTE AUTOMATISIERTE PRÜFUNGEN
--------------------------------------
- JavaScript-Syntaxprüfung von Modulen und vorbereiteten Quelldateien.
- Wiederholbar identischer Patch (idempotente Quellcodeinstallation).
- Prüfstandslogik: I/1, O/0, Zählung ungleich leer, PDF-Einheit.
- Datenbank-Vertragstest auf einer KOPIE der erhaltenen lager.db:
  46 OCR-Verdachtspaare, 45 ungezählte Kandidaten sicher archivierbar,
  der gezählte Getriebeöl-Artikel mit 32 L gesperrt; positive Zählungen,
  Bewegungsdatensätze und Importprotokolle unverändert.
- Prüfdaten in DB speichern, laden, Konflikte erkennen und korrigieren.
- Unabhängigen Dubletten-Prüfstatus speichern und erneut abrufen.
- Chrome-Browser-Test mit simulierten API-Antworten: Sichtprüfung, manuelle
  Nummernkorrektur, Warnung vorhandener Zählung, Sammelarchivierung,
  Wiederherstellung, Prüffilter. Keine JavaScript-Laufzeitfehler.
- Original-PDF-Ausschnitt mit einem realen Bildausschnitt der übermittelten
  RONDO-PDF kontrolliert.

NICHT VORWEGGENOMMEN: Der echte GitHub-Pages-Host und die Synchronisierung
zwischen mehreren realen Geräten konnten aus dieser Umgebung nicht vollständig
per End-to-End-Test durchgespielt werden. Deshalb bitte VOR der ersten
produktiven Sammelarchivierung eine Datenbanksicherung erstellen und einmal
mit wenigen Daten die Funktion prüfen.
