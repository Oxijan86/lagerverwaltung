# Lagerverwaltung Lovrencic – Version 55

## Neue Materialien direkt aus Ein-/Ausbuchung registrieren
- Unbekannte Artikel aus **Lieferschein M365** und **Servicebericht M365/Copilot** werden automatisch erkannt.
- Jede unbekannte Position muss bewusst **Material anlegen** oder **Ignorieren**.
- Beim Anlegen sind Artikelnummer und Bezeichnung aus der Auswertung bereits vorausgefüllt.
- Zusätzlich können Anfangsbestand, Sollbestand, Mindestbestand, Einheit, Lagerort, Maschine, Hersteller, Lieferant, Lieferanten-Artikelnummer, Barcode, Einkaufspreis, Bemerkung und Aktiv-Status gepflegt werden.
- Nach dem Speichern wird die Auswertung automatisch erneut geprüft und der neue Artikel in die Buchung übernommen.
- Bei einer Entnahme muss der Anfangsbestand eines neu angelegten Artikels mindestens der Entnahmemenge entsprechen.

## Aktualisierte M365-/Copilot-Prompts
- Einbuchung: `Artikelnummer → Bezeichnung → Anzahl`
- Entnahme: `Datum → Artikelnummer → Bezeichnung → Anzahl → Kunde → Maschine`
- Alte Formate ohne Bezeichnung bleiben lesbar.
- Der Vertauschungsschutz für Einbuchung/Entnahme bleibt aktiv.

## Audit vollständig
- Jede einzelne Buchungsposition erzeugt einen eigenen Audit-Eintrag.
- Gespeichert werden Buchungs-ID, Datum, Buchungsart, Artikel-ID, Artikelnummer, Bezeichnung, Menge, Kunde, Techniker, Fahrzeug, Maschine, Lieferschein, Quelle, Bemerkung und Erfassungszeitpunkt.
- Buchungsart, Artikel, Menge, Kunde und Maschine werden im Audit zusätzlich als eigene Spalten dargestellt.
- Die Anzeige ist nicht mehr auf die letzten 500 Audit-Einträge begrenzt.
- Beim ersten Start von Version 55 werden bestehende Buchungen einmalig mit vollständigen Audit-Details nachgetragen, sofern dafür noch kein positionsgenauer Audit-Eintrag existiert.
- Korrekturen und Löschungen behalten weiterhin die detaillierte Alt-/Neu- bzw. Löschhistorie.

## Hilfe
Die Anleitungen zu Einbuchung, Entnahme, Audit und M365-/Copilot-Prompts wurden auf Version 55 aktualisiert.
