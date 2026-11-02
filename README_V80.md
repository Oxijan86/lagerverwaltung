# Lagerverwaltung Lovrencic V80

## Funktionen

- PDF-Serviceberichte mit Hauptticket und Untertickets: Positionstabellen werden jeweils eigenstaendig erkannt, den Tickets und Maschinen zugeordnet und mit der technischen Produkt-ID verknuepft.
- Bei unklarer Zuordnung bleibt die Maschine bewusst frei; Materialpositionen werden vor dem Buchen geprueft.
- Unbekannte Artikel lassen sich direkt in der PDF-Vorschau registrieren (Nummer und Beschreibung uebernommen; Einheit, Soll-/Mindestbestand, Anfangsbestand und Lagerort manuell pruefen).
- Anfangsbestand startet mit **0** und wird nur bei ausdruecklicher Bestaetigung als reale Einbuchung erfasst.
- Die PDF-Positionen koennen danach auf Basis des geprueften Bestands als Entnahme gebucht werden.
- Die Suche im Lagerbestand beruecksichtigt Maschinenbezeichnungen und technische Typkennungen aus bestaetigten Service-PDF-Buchungen.
- Vorhandene Datenbankdateien werden nicht ueberschrieben, Stammdaten-Maschinenbeziehungen nicht automatisch veraendert.

## Deployment

Das Upload-Paket enthaelt die vollstaendige *V80-Einspielroutine*, nicht noch einmal die 56 MB der bereits auf GitHub vorhandenen Bibliotheken. Das GitHub-Workflow installiert die Aenderungen in den bestehenden Repository-Dateien, fuehrt Tests aus und commitet die aktualisierten Dateien auf `main`. Falls GitHub Actions keine Schreibberechtigung erhalten, muss diese unter Repository Settings > Actions > General > Workflow permissions auf Read and write gesetzt werden. Im Workflow wird `permissions: contents: write` explizit angefordert.

Nach dem erfolgreichen Workflow ist **das gesamte Repository eine vollstaendige und lauffaehige V80-GitHub-Version**. Bei Fehlern erfolgt kein automatischer Commit. Keinesfalls darf dieses Upload-Paket als komplett neue Website ohne den alten Dateibestand verwendet werden.

Die Upload-Anleitung steht in `GITHUB_HOCHLADEN.txt`.
