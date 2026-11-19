# V88.14 – Pruefprotokoll

## Automatisierte Regressionstests

| Pruefgruppe | Ergebnis |
|---|---:|
| V88.7 PDF/Inventur-Schutz | 12/12 |
| V88.8 Technikerimport | 10/10 |
| V88.9 Lagerort/Mengen | 18/18 |
| V88.10 Cursor-Schutz | 10/10 |
| V88.11 Zaehlort-Bindung | 22/22 |
| V88.12 sichere Speicherung | 10/10 |
| V88.13 OCR und Eingabedialog | 11/11 |
| V88.13 OCR-Stammdaten-Reparatur (synthetischer DB-Test) | 6/6 |
| V88.14 PDF/Zusatzliste/Backup | 12/12 |
| **Gesamt** | **111/111** |

## Original-RONDO-PDF

- Datei SHA-256: `a3f457120746435d4a0d8b81b4f808e6a122b448353c91de6d291cdcf16aa29b`
- Original und Ausgabe: 72 Seiten. Das Original ist im Ergebnis bytegenaues Praefix, die Korrekturen sind inkrementelle PDF-Seiteninhalte.
- Sichtpruefung Seite 4/Position 6: Testwert `2` links von `ST`, Originalmaterial und Logo sind erhalten; Zaehler und Datum an ihren Linien.
- Der Testwert `2` ist **synthetisch**, nicht der tatsaechliche Lagerzaehlstand.
- Ungleiche OCR-Nummern `I1000339` und `11000339` werden nicht ohne Bestaetigung gedruckt; nach manueller Freigabe funktioniert die Uebertragung.

## Backup und Fehlerkorrektur

- Die hochgeladene `Inventur_Eingaben_...json` enthaelt zwei noch ungespeicherte Zeilen (IDs 160/182). Der Wert `4,7` ist als `Stk.` ungueltig, waehrend die andere Aenderung separat als gueltig gilt.
- Die Stammdatenkorrektur einer falsch angelegten OCR-Nummer wurde mit **simuliertem Datenbankzustand** getestet: Umbenennung unter gleicher Artikel-ID; Archivierung nur bei leerem/ungenutztem Datensatz; Verweigerung bei echten Bewegungen oder bestaetigten Zaehlungen.
- Eine echte `lager.db`-Kopie wurde **nicht** bereitgestellt; deshalb fand kein echter Reimport eines Nutzer-Datenbankbackups statt.

## Grenzen

- Keine vollstaendige reale Browser-/Smartphone-GUI-Testfahrt. Die Laufzeit- und Dateitests sind erfolgreich, aber die Produktionsinstallation muss noch kontrolliert werden.
- Eine Firmen-Zusatzliste mit tatsaechlichen Lagerbestaenden kann erst **in der verbundenen Anwendung** erstellt werden, da deren aktuelle Datenbank hier nicht vorliegt.
