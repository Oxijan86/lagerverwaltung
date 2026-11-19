# Testprotokoll – Lagerverwaltung V88.10

Datum: 19.11.2026

**50/50 automatisierte Tests bestanden**, kein Fehlschlag, kein Skip.
Aufruf: `node --test test_v88_7.cjs test_v88_8.cjs test_v88_9.cjs test_v88_10.cjs`

Schwerpunkte:
- Artikel schon gezählt (5 Stück): auch bei der ALTEN Fokusfunktion nur „Weitere Menge“ editierbar.
- Artikel noch ungezählt: Fokus im Feld „Gezählt“.
- Artikel mit 0 Stück: bereits gezählt, Sprung zur Zusatzmenge.
- Störungsfall: Eventuelle Eingabe in das schreibgeschützte Mengenfeld wird abgefangen und der alte Wert wiederhergestellt.
- Gesamtkorrektur: bewusste Freigabe möglich; nach Verlassen wieder geschützt; bei abgebrochener Bestätigung bleibt sie geschützt.
- Standortwahl: ausgewählter Lagerort aktiviert die Zählortautomatik ohne gesonderten Knopf.
- Mehrfachzählung: 5 an A + 3 an B = 8, A und B bleiben getrennt; erneut +2 an B = A 5 / B 5 / gesamt 10.
- Unklare OCR-Artikel, Technikerhinweis, RONDO-PDF-Import und Export, Inventurfortsetzung: bisherige Regressionstests weiterhin bestanden.
- Originale private 72-Seiten-RONDO-PDF: SHA-256 mit bekanntem Katalog abgeglichen, 719 Positionen validiert.

**Grenzen der Prüfung:** Die Fokus-/Eingabetests simulieren echte DOM-Ereignisse in Node. Ein vollständiger Browser-End-to-End-Test auf dem produktiven GitHub Pages und Android-Smartphone ist nicht nachgewiesen; der lokale Chromium-Headless-Start war in der Umgebung nicht ausführbar. Bitte nach der Installation den Testablauf der README verwenden und die laufende Inventur nicht voreilig abschließen.

**Datenintegrität:** Keine lokale DB-Migration, keine Bestandsänderung durch Zählung, keine Veränderung an bisherigen Zählmengen oder Inventursitzungen durch das Update selbst.
