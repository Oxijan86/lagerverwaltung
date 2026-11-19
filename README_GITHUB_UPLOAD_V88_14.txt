LAGERVERWALTUNG LOVRENCIC V88.14 – GITHUB DIREKTUPLOAD
19.11.2026

INSTALLATION
1. Vor dem Update die aktuelle lager.db sichern; laufende Inventur/Zaehlstaende nicht abschliessen oder loeschen.
2. ZIP entpacken und ALLE enthaltenen Dateien direkt in das Hauptverzeichnis von Oxijan86/lagerverwaltung hochladen (Add file -> Upload files). Keine zusatzlichen Ordner anlegen.
3. Warten, bis GitHub Pages die Dateien bereitgestellt hat, danach die App komplett neu starten. Versionsanzeige V88.14 pruefen.
4. Bestehende Browserdaten, IndexedDB und Datenbank NICHT loeschen. Cloud-Konflikte vor einer weiteren Synchronisierung pruefen.

RONDO-PDF
- Original-PDF vom Benutzer: 72 Seiten, 719 Positionen, SHA256 a3f457120746435d4a0d8b81b4f808e6a122b448353c91de6d291cdcf16aa29b.
- Im PDF-Ausgabedialog koennen unklare Positionen nach Artikelnummer/Bezeichnung gesucht und manuell einem vorhandenen Artikel zugeordnet werden. OCR-aehnliche Zeichen (I/1/O/0/B/8) fuehren NUR zu Vorschlaegen.
- Genaue Seite+Position werden gespeichert; die exportierte PDF verwendet die bestaetigte Zuordnung, niemals eigenmaechtig eine unsichere Nummer.
- Bei einem bereits falsch angelegten OCR-Artikel: „Falsch angelegten OCR-Artikel nachtraeglich berichtigen“, Vorpruefung, Adminfreigabe und Backup. Wenn der richtige Artikel noch nicht existiert: Artikelnummer innerhalb derselben ID berichtigen. Wenn er bereits existiert: ausschliesslich einen unbenutzten OCR-Fehlartikel ohne Bestand, Bewegung oder bestaetigte Zaehlung archivieren. Niemals stillschweigend zusammenfuehren.
- Ein Zaehlwert wird links neben ST/M gedruckt. Originalseiten bleiben bytegenau Grundlage der PDF. Ohne eindeutige Zuordnung bleibt die Zaehlmenge im Firmenbeleg leer.

ZUSATZLISTE FUER RONDO
- Inventur > RONDO-PDF Zwischenstand/Abschluss herunterladen > Inventur auswaehlen > „Zusatzliste fuer RONDO herunterladen (CSV)“.
- Enthalten: aktive Lagerartikel, die sicher nicht in den Belegpositionen stehen, sowie separat markierte moegliche OCR-Zuordnungen.
- Spalten: Status; Artikelnummer; Bezeichnung; Einheit; gezaehlte Menge; aktueller Buchbestand; Lagerort/Inventur-Fundorte; Zaehlstatus; moegliche PDF-Positionen.
- Wenn nicht gezaehlt: die Zaehlmenge BLEIBT LEER; der Buchbestand ist als NICHT inventurgeprueft bezeichnet. Nichts wird hinzugedichtet oder gebucht.
- Die CSV ist in Excel mit Semikolon und UTF-8 BOM nutzbar.

UEBRIGE V88.13-VERBESSERUNGEN
- „Gesamtmenge korrigieren“ ueber separaten Eingabedialog (kein kurzer, defekter Entsperr-Fokus).
- Bestaetigte Erstlagerorte werden sichtbar in den Artikelstammdaten; bestandswirksame Mengen/Teilbestaende erst beim Inventurabschluss. Maschinenzuordnung unveraendert.
- Gueltige Inventureingaben trotz eines anderen ungueltigen Artikels speichern; lokal gesicherter Rest bleibt erhalten.
- Meter-Artikel mit gueltiger Einheit m erlauben 4,7; Stk.-Artikel erlauben nur ganze Zahlen.
- Ungueltige Offline-Fallback-URL beim Import nach Update korrigiert.

TESTHINWEIS
- Die echte Original-RONDO-PDF wurde fuer einen erfolgreichen 72-Seiten-Render-Test verwendet; Testfall USB-Stick Pos. 6 auf Seite 4, bewusst als Testmenge 2.
- Die bereitgestellte JSON-Wiederherstellungskopie wurde auf den Fehler Artikel 13496 / 4,7 Stk. geprueft. Eine vollstaendige lager.db oder ein Cloud-Datenbankbackup lag nicht vor. Deshalb konnten konkrete falsche Artikelstammsaetze aus deinem realen Datenbestand nicht autonom korrigiert oder die persoenliche Zusatzliste vorab erstellt werden.
- Browser-End-to-End auf dem Smartphone muss nach Installation noch geprueft werden.
