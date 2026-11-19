# Testergebnisse – Lagerverwaltung V88.7

Prüfdatum: 19.11.2026. Keine Datenbankänderung während dieser Tests.

## Getestete Original-RONDO-Datei

- Die zwei zur Verfügung gestellten 72-seitigen Original-Dateien haben denselben SHA-256-Fingerabdruck: `a3f457120746435d4a0d8b81b4f808e6a122b448353c91de6d291cdcf16aa29b`.
- 72 Originalseiten, 719 Materialpositionen werden über den geprüften Katalog erkannt.
- Eine veränderte PDF erhält **nicht** dieselben Katalogdaten.
- Die Original-PDF wird aus Datenschutz-/Urheberrechtsgründen **nicht** ins GitHub-Upload-Paket kopiert.

## PDF-Export und Weißseitenfehler

- Fehler der hochgeladenen weißen Zwischenstands-PDF reproduziert.
- Neuer PDF-Export mit **72 Originalseiten** ausgeführt, die PDF wurde mit PyMuPDF unabhängig geöffnet.
- Bytes 0 bis 3.256.939 des Original-PDF befinden sich bytegleich am Anfang der Ausgabe; die nachfolgenden PDF-Änderungen sind append-only.
- Externer visueller Vergleich von Seite 1, 2, 17, 36, 57 und 72 zeigt erhaltene Originaltabellen und RONDO-Kopfbereiche.
- Testmengen 2, 1, 0, 1,5, 11 links neben der Mengeneinheit; keine Statusänderung auf `Gezählt`.
- Zähler/Datum im unteren linken Originalfeld, keine Unterschrift.
- Gezählte Null bleibt 0, ungezählte Positionen bleiben leer.
- Browser-/Chromium-Test mit **echtem Klick auf den PDF-Exportknopf**: PDF-Download erzeugt, 72 Seiten enthalten Originalvorlage. Die absichtlich defekte alte PDF-Funktion wurde **nicht aufgerufen**.
- Browser-Dialogtest mit 1/719 gezählten Positionen: 718 bleiben unbeschriftet, es erfolgt kein Inventurabschluss.
- Bei fehlendem sicheren Modul oder fehlendem Originalseitenanteil wird **kein PDF-Download** erzeugt.

## Inventurfortsetzung

- Chromium-DOM-Test: Ein offener Inventurentwurf wird erkannt und fortgesetzt; alter `onclick`-Handler wird blockiert.
- Chromium-DOM-Test: Ohne Entwurf und bei abgelehnter Nachfrage wird **keine** neue Inventur angelegt.
- Node-Tests: Bestehende Inventur-Sitzungs-ID bleibt erhalten; der Guard ruft keinen Abbruch-/Commit-Endpunkt auf.

## Testläufe

- `node --test test_v88_7.cjs`: **12/12 bestanden**, ohne Original-PDF.
- Vollständiger Originaldatei-Regressionslauf der V88.6-Funktionen: **20/20 bestanden**.
- Ergänzender 72-Seiten-Integrations-/Sicherheitstest für V88.7: **20/20 bestanden** (mit Original-PDF).
- Chromium-GUI-Test Inventurfortsetzung und Abbruch einer neuen Anlage: **2/2 bestanden**.
- Chromium-GUI-Test des Exportdialogs: **erfolgreich**, PDF mit 72 Seiten erzeugt; alte Rasterfunktion wurde nicht aufgerufen.

## Grenzen

Der produktive End-to-End-Test **direkt unter der auf dem Nutzergerät installierten GitHub-Pages-PWA** ist nicht möglich. Tests erfolgten mit den hochladbaren V88.7-Quelldateien sowie in Chromium mit lokalen Browser-Testseiten. Eine abweichende Original-RONDO-PDF darf nicht automatisch denselben Überlagerungspfad nutzen.
