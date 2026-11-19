# Testprotokoll – V88.12

Datum: 19.11.2026

## Automatisierte Tests

**82 von 82 Tests erfolgreich (keine fehlgeschlagenen Tests).**

Aufruf:

```bash
node --test test_v88_7.cjs test_v88_8.cjs test_v88_9.cjs test_v88_10.cjs test_v88_11.cjs test_v88_12.cjs
```

## Geprüfte Schwerpunkte
- Anonymisiertes Abbild der tatsächlichen Wiederherstellungsdatei: 2 ungespeicherte Positionen; Artikel-ID 160 / Nr. 13496 mit `4,7 Stk.` und weitere gültige Änderung.
- Fehlhafte Position ist konkret identifizierbar; der zweite Artikel kann separat zwischengespeichert werden. Fehlerhafte Menge bleibt lokal erhalten.
- Ausschließlich nach Bestätigung gezieltes Zurücksetzen der ungültigen Zählung, vorher Auslösung der JSON-Sicherung; anschließend kann der Inventur-Zwischenstand gespeichert werden.
- Dezimalmengen `4,7 m`, `4.7 m`, `1,25 m`; konsequente Ablehnung von `4,7 Stk.`; Null bleibt Null, leer bleibt ungezählt.
- Summenprüfung von mehreren Lagerorten, keine stillschweigende Änderung fehlerhafter Teilmengen.
- Fehlender `syncStatus`-Aufruf wird im Seitenstart ohne JavaScript-Referenzfehler abgesichert.
- Bestehende Tests: RONDO-Katalog 719 Positionen / 72 Seiten, PDF-Originalseiten-Export, Artikelprüfung und spätere Zuordnung, Inventurfortsetzung, intelligente Artikelsuche, sichere Lagerort-Teilmengen und Erstlagerort-Schreibschutz.
- Technische JavaScript-Syntax der SW-generierten Inventur-UI, einschließlich Fehler-Speicherweg, wird in Node VM getestet.

## Quell-PDF

SHA-256 der Original-PDF:
`a3f457120746435d4a0d8b81b4f808e6a122b448353c91de6d291cdcf16aa29b`.

**Grenze:** Der Chromium-Browser-Start schlug in der Testumgebung fehl; der Live-Test nach Upload und auf dem Smartphone ist nicht als bestanden anzusehen.
