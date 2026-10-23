# CSV-Center

## Firmenliste als Inventur / Bestandsabgleich

Die Firmenvorlage verwendet das Blatt **SAPUI5-Export** und genau diese Spalten:

`Material;Bezeichnung zum Material;Lagerort;Bezeichnung des Lagerorts;Frei verwendbar`

Dabei gilt:

- **Material** = Artikelnummer.
- **Bezeichnung zum Material** = Artikelbezeichnung.
- **Frei verwendbar** = Mengenwert.
- Die Firmenfelder **Lagerort** und **Bezeichnung des Lagerorts** werden nicht als interne Lagerorte der App verwendet.
- Der Firmenwert `1025` ist deshalb niemals eine Menge und erzeugt keinen internen Lagerort.

Schritt für Schritt:

1. CSV-Center öffnen.
2. Unter **Firmenliste importieren** die Importart **Inventur / Bestandsabgleich** wählen.
3. CSV- oder XLSX-Datei auswählen.
4. Die Vorschau prüfen: Artikelnummer, Bezeichnung, Dateimenge, bisheriger App-Bestand und geplante Differenz.
5. Fehler, doppelte oder unbekannte Artikel prüfen. Ein expliziter Wert `0` ist ein gültiger Vergleichsbestand; leere oder ungültige Mengen sind Fehler.
6. Bei unbekannten Artikeln bewusst **Ignorieren** oder **Anlegen** wählen. Für neu anzulegende Artikel kann optional ein interner Lagerort ausgewählt werden. Der Firmen-Lagerort wird dafür nicht übernommen.
7. **Geprüften Vorgang bestätigen** wählen. Erst jetzt werden Bestandskorrekturen gebucht.

Sollbestand und Mindestbestand werden durch diesen Bestandsabgleich nicht verändert.

## Firmenliste als Einbuchung

1. Unter **Firmenliste importieren** die Importart **Einbuchung** wählen.
2. Datei auswählen.
3. Standard-Techniker prüfen und bei Bedarf ändern.
4. Vorschau sorgfältig kontrollieren.
5. Nur positive Werte in **Frei verwendbar** sind als Zugangsmenge gültig.
6. Unbekannte Artikel bewusst anlegen oder ignorieren. Bei Neuanlage wirkt die erkannte Menge genau einmal als Anfangsbestand.
7. Vorgang bestätigen.

**Wichtig:** Eine vollständige Bestandsliste darf nicht versehentlich als Einbuchung bestätigt werden. Im Einbuchungsmodus wird jede gültige positive Menge aus **Frei verwendbar** als Wareneingang behandelt.

## Lagerbestand für Firma exportieren

1. Im CSV-Center die Firmenfelder **Lagerort** und **Bezeichnung des Lagerorts** prüfen. Vorgabe: `1025` und `Lovrencic Tobias`.
2. Bei Bedarf ändern und mit **Firmenfelder speichern** sichern.
3. **Lagerbestand für Firma (CSV)** oder **Lagerbestand für Firma (XLSX)** wählen.
4. Vor dem Versand kontrollieren, dass die fünf Firmen-Spalten vorhanden sind und **Frei verwendbar** den aktuellen Istbestand enthält.

Der XLSX-Export verwendet das Blatt **SAPUI5-Export**. Firmen-Lagerort und interne Lagerorte der App bleiben strikt getrennt.

## Weitere Exporte

Der normale Lagerbestands-CSV sowie Buchungsexporte bleiben zusätzlich verfügbar.

## Dateierstellung ab V70

Alle sechs Exportbuttons erzeugen einen Browser-Download. Bei einem Fehler erscheint eine rote Meldung im zugehörigen Bereich. Die erstellte XLSX-Datei nutzt das Blatt SAPUI5-Export. CSV-Dateien verwenden Semikolon und UTF-8 mit BOM.

Die ältere Inventur verarbeitet ebenfalls den Zählbestand 0. Bei Inventurdateien werden die Spalten Artikelnummer und Gezählter Bestand nach ihren Überschriften ausgewählt; Systembestand und Lagerort sind keine Zählmenge. Leere Zählfelder bleiben Fehler. UTF-8-CSV-Dateien und Windows-1252-Dateien werden vor dem Tabellenparser dekodiert.
