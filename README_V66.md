# Lagerverwaltung Lovrencic – Version 66

Version 66 baut vollständig auf V65 auf. Bestehende SQLite-Datenbanken bleiben ohne Schema-Neuaufbau kompatibel.

## Änderungen

### Lagerbestand
- Spaltenfolge: Artikelnummer, Bezeichnung, Istbestand, Mindestbestand, Sollbestand, Lagerort, Maschinenzuordnung, Aktionen.
- Lagerort, Mehrfach-Maschinenzuordnung, Mindest- und Sollbestand sind im normalen Lagerbestand passwortfrei änderbar.
- Es können nur vorhandene aktive Lagerorte/Maschinen gewählt werden; zentrale Stammdatenänderungen bleiben geschützt.
- Einzelnes Speichern und „Alle Änderungen speichern“ werden unterstützt.
- Ungespeicherte Entwürfe bleiben auch bei Suche/Filter und Re-Render erhalten.
- Auf Smartphones wird jede Lagerzeile unter 700 px als gut lesbare Karte dargestellt.

### Standard-Techniker
- `primary_technician` wird über `/api/masterdata` als Standard-Techniker bereitgestellt.
- Automatische Vorauswahl bei manueller Einbuchung, M365-Lieferschein, Materialanlage, unbekannten M365-Artikeln und CSV/SAP-Import.
- Eine manuell geänderte Techniker-Auswahl wird bei Aktualisierung der Stammdaten nicht überschrieben.
- Der tatsächlich gewählte Techniker wird an Backend, Buchungen und Audit übergeben.

### M365-Neuanlage
- Bei einem unbekannten M365-Artikel wird die erkannte Menge automatisch als Ausgangsbestand vorausgefüllt.
- Beispiel: Menge 5 → genau eine Anfangsbuchung über 5 → Istbestand nach Materialanlage 5.
- Bei Lieferschein/Einbuchung wird diese bereits als Ausgangsbestand gebuchte Menge innerhalb derselben Extraktion gesperrt und nicht erneut eingebucht.
- Bei Servicebericht/Entnahme bleibt die anschließende Entnahme korrekt möglich.
- Doppel-Klicks werden im Frontend abgefangen; die eindeutige Artikelnummer schützt zusätzlich gegen wiederholte Create-Requests.

### Transaktionen
- Direkte Materialanlage bleibt atomar: Artikel, Lagerortzuordnung, Maschinenrelationen, Anfangsbuchung und Audit werden innerhalb des bestehenden Transaktionspfads erzeugt.
- Der neue passwortfreie Lagerbestand-Zuordnungsendpunkt speichert Bestandsebenen, Lagerort und Maschinenrelationen gemeinsam transaktional.

### Bestandslogik
Unverändert aus V65:
- `0 <= Mindestbestand <= Sollbestand`
- bei Mindest > Soll wird Soll auf Mindest angehoben
- Unterbestand nur bei `Ist < Mindest`
- Bestellvorschlag nur unter Mindest mit `max(0, Soll - Ist)`

### Synchronisation
Die gehärtete Synchronisations- und Konfliktlogik aus V59–V65 wurde nicht abgeschwächt. Browser-/OneDrive-Dateisynchronisation besitzt weiterhin keine serverseitige atomare Compare-and-Swap-Garantie.

## Technische Grenze
Exakt gleichzeitige Dateischreibvorgänge verschiedener Geräte in einen lokal synchronisierten OneDrive-Ordner können trotz Pre-/Post-Write-Prüfungen nicht vollständig verhindert werden. Für eine harte Mehrgerätegarantie wäre später Microsoft Graph mit ETag/If-Match oder eine zentrale Datenbank erforderlich.
