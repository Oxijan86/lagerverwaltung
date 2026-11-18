# Lagerverwaltung Lovrencic V87 – direkte GitHub-Aktualisierung

**Basis:** das bestehende Repository `Oxijan86/lagerverwaltung`, zuletzt geprüfter Stand `dc2c6f8761167de4e07d99523b907c6a7a697b60` (V86).

Dieses Archiv ist **ein direkt hochladbares Datei-Update für das bestehende Repository**, nicht ein eigenständig startfähiger vollständiger Quellcode-Snapshot. Es benötigt **weder Installationsskript noch GitHub Actions**. Die vorherigen Programmdateien bleiben bestehen; nur die mitgelieferten gleichnamigen Dateien werden ersetzt.

## Enthaltene Änderungen

- **Ersteinrichtung mit zwei Firmen-Dateiformaten:** SAP-Excel/CSV mit vorhandenen Mengen als Anfangsbestand (Zählung freiwillig) oder RONDO-Inventur-PDF ohne Mengen (Erstinventur erforderlich). Die Option „ohne Datei“ bleibt für Sonderfälle erhalten.
- **RONDO-PDF** lokal mit Browser-OCR erkennen (auch gescannte PDFs). Position, Artikelnummer, Beschreibung, Lagerort und Belegnummer überprüfen. Unsichere Artikelnummern und fehlende Positionen vor der Registrierung korrigieren; automatisches stilles Ergänzen ist untersagt.
- **Materialabgleich:** Firmenliste vs. registrierte App-Artikel, Bestand in der App vs. eigene Zählung, zusätzliche App-Artikel und zusätzliche gefundene Materialien in einer gesonderten CSV-Auswertung.
- **Erstinventur:** Artikel werden zunächst ohne Anfangsmenge registriert. Bei der PDF-Variante ist ein Inventur-Zwischenstand notwendig. Bestand erhält erst beim Inventurabschluss die gezählten Mengen. 0 und nicht gezählt sind unterschiedlich.
- **Jährliche Inventur:** RONDO-PDF importieren, Zählung im bestehenden Inventurmodul mit Filtern und Prüfungen durchführen, RONDO-Originalseiten als ausgefüllte PDF ausgeben. Unterschriften bleiben zum Ausdrucken frei.
- **Tastatur-Schnellsuche:** sofortige Vorschläge zu Artikelnummer und Bezeichnung; Pfeiltasten und Enter wählen den Artikel, Fokus direkt ins Mengenfeld, Enter speichert lokal und kehrt zur Suche zurück.
- **Umlagerung:** mehrere konkrete Artikel bzw. Teilbestände und Mengen auswählen; Massenauswahl nur auf Wunsch. Das bestehende V86-Modul mit Backup- und Revisionsprüfung führt jede Umlagerung einzeln aus. Bei einem Zwischenfehler bleiben abgeschlossene Positionen bestehen; die Oberfläche meldet die Teilergebnisse. Es wird **keine Transaktion über mehrere Artikel gleichzeitig** zugesichert.
- **Cloud-/Synchronisierung**: Vorhandene V81–V86-Funktionen und vorhandene Daten werden nicht entfernt oder ersetzt. Die neue Inventurerfassung bleibt lokal möglich.
- **Dokumentation:** `HILFE_V87.md` mit Ablauf und Sicherheitsgrenzen; entsprechende Kurz-Hilfe erscheint in der App.

## Wichtige Hinweise

1. Vor dem Produktivtest eine `lager.db`-Sicherung erstellen.
2. Eine **gescannte** Firmen-PDF benötigt OCR. Die tatsächliche Zuverlässigkeit hängt von Scanqualität und Gerät ab. Die Original-RONDO-PDF muss vor dem Materialimport geprüft werden.
3. Der PDF-Ausdruck übernimmt das originale Seitenbild und legt die Zahlen in der Spalte „Zählmenge“ darüber; es handelt sich **nicht** um eine Änderung im SAP-System und nicht um eine qualifizierte elektronische Signatur. Ausdruck und Unterschrift bei Bedarf.
4. Ohne separate SAP-Mengen lassen sich keine SAP-Bestandsdifferenzen ermitteln. „Auf der Firmenliste“ und „tatsächlich im SAP gebucht“ sind nicht gleichbedeutend.
5. Die PWA kann zunächst die alte Version zwischenspeichern. Nach dem Pages-Update PWA neu öffnen, gegebenenfalls die Seite aktualisieren.
6. Der lokale Backendkern ist weiterhin die V86-Datei. Die Anzeige „V87“ kennzeichnet die V87-Erweiterungsmodule; die `/api/info`-Kennung des unveränderten Kerns bleibt `86.0`. Das ist keine Datenbankmigration.

## Prüfstand

Automatisierte Parser-/Bestands-/Umlagerungs-Prüfungen in `TESTERGEBNIS_V87.md`. Ein vollständiger Produktivtest mit einer echten Datenbank, realer 72-Seiten-OCR **im Browser** und anschließender RONDO-Freigabe ist noch erforderlich. Bitte die Ausgabe-PDF vor Versand an die Firma prüfen.
