# Lagerverwaltung Lovrencic – Version 69

Version 69 überarbeitet das CSV-Center auf Grundlage der Firmenvorlage `Bestandsliste Lovrencic 032026.xlsx` und repariert den Hilfe-Reiter.

## Maßgebliche Firmenvorlage

Unterstützt wird das Blatt `SAPUI5-Export` mit exakt diesen fünf Überschriften in beliebiger Spaltenposition:

1. `Material`
2. `Bezeichnung zum Material`
3. `Lagerort`
4. `Bezeichnung des Lagerorts`
5. `Frei verwendbar`

Die Zuordnung erfolgt ausschließlich anhand der Überschriften. `Frei verwendbar` ist die einzige Mengenquelle. Die Firmenfelder `Lagerort` und `Bezeichnung des Lagerorts` werden weder als Menge noch als interne Lagerortzuordnung verwendet. Insbesondere wird `1025` niemals als Menge interpretiert.

## CSV-Center

### Firmenliste importieren

Vor dem Prüfen wird ausdrücklich zwischen zwei Modi gewählt:

- **Inventur / Bestandsabgleich**: `Frei verwendbar` ist der erfasste Vergleichsbestand. Erst nach Bestätigung wird die Differenz zum aktuellen Istbestand gebucht. Ein expliziter Wert `0` ist gültig. Leere und ungültige Mengen werden als Fehler angezeigt.
- **Einbuchung**: `Frei verwendbar` ist eine Zugangsmenge. Nur positive Mengen sind gültig. Die Oberfläche warnt deutlich davor, eine komplette Bestandsliste versehentlich als Wareneingang zu buchen.

Die Vorschau zeigt vor jeder Änderung:

- Status
- Artikelnummer
- Bezeichnung
- Dateimenge
- aktuellen App-Bestand
- geplante Änderung
- Behandlung unbekannter Artikel
- Fehler

Dateiprüfung und Vorschau verändern die Datenbank nicht.

Unbekannte Artikel können bewusst ignoriert oder angelegt werden. Der interne Lagerort für neue Artikel wird separat aus den vorhandenen App-Lagerorten gewählt; der Firmenwert `1025` wird nicht übernommen. Bei einer Neuanlage wirkt die Dateimenge genau einmal als Anfangsbestand.

Jeder Firmenimport erhält eine stabile Vorgangskennung. Ein erneuter Bestätigungsversuch desselben Vorgangs führt nicht zu Doppelbuchungen. Ist bereits alles verarbeitet, wird weder erneut gebucht noch eine zusätzliche Revision erzeugt.

Inventurkorrekturen bleiben wie bisher administrativ geschützt.

### Lagerbestand für Firma

Neu sind:

- **Lagerbestand für Firma (CSV)**
- **Lagerbestand für Firma (XLSX)** mit Blattname `SAPUI5-Export`

Beide verwenden genau die fünf Firmenfelder. `Frei verwendbar` enthält den aktuellen Istbestand der Lagerverwaltung.

Die Firmenfelder sind unabhängig von den internen App-Lagerorten konfigurierbar. Vorgaben:

- Lagerort: `1025`
- Bezeichnung des Lagerorts: `Lovrencic Tobias`

Der normale Lagerbestands-CSV-Export bleibt erhalten.

## Hilfe

Der bisher nicht vollständig angeschlossene Hilfe-Reiter wurde repariert:

- Themenliste wird geladen.
- Themen lassen sich öffnen.
- Suche durchsucht Titel und tatsächliche Hilfetexte.
- Kein Treffer wird eindeutig angezeigt.
- M365-Prompt-Codeblöcke bleiben markier- und kopierbar.

Aktualisierte Schritt-für-Schritt-Anleitungen behandeln:

1. Firmenliste als Inventur/Bestandsabgleich.
2. Firmenliste als Einbuchung inklusive Warnung vor versehentlichem Vollbestand-Wareneingang.
3. Firmenexport vor dem Versand kontrollieren.
4. Lieferschein-Foto/PDF mit Microsoft 365/Copilot auswerten und in Einbuchung übernehmen.
5. Servicebericht-Foto/PDF mit Microsoft 365/Copilot auswerten und in Entnahme übernehmen.

Die Lagerverwaltung führt ausdrücklich keine eigene KI-Auswertung von Fotos oder PDFs durch.

## Kompatibilität und Sicherheit

- Bestehende SQLite-Datenbanken bleiben kompatibel.
- Bestehende Buchungen, Revisionen, `database_id`, `revision_id`, Cloud-Basis und Konfliktschutz bleiben erhalten.
- Die bestehende Sync-Warteschlange und Pre-/Post-Write-Prüfung bleiben unverändert aktiv.
- Soll- und Mindestbestand werden durch Firmen-Inventuren nicht verändert.
- Interne Lagerorte werden niemals aus den Firmenfeldern erzeugt.

## Technische Grenze

Die Synchronisation eines lokal eingebundenen OneDrive-Ordners besitzt weiterhin keine serverseitige atomare Compare-and-Swap-Garantie. Ohne Microsoft Graph mit ETag/`If-Match` oder eine zentrale Datenbank kann bei zwei exakt gleichzeitig schreibenden Geräten keine vollständige Garantie gegeben werden. Die bestehende Konflikterkennung bleibt davon unberührt.
