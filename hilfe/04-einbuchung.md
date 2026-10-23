# Einbuchung

## Manuelle Einbuchung

- Datum auswählen.
- Der hinterlegte Standard-Techniker ist automatisch vorausgewählt und kann geändert werden.
- Artikel und Menge hinzufügen.
- Einbuchung bestätigen.
- Die letzten Buchungen werden anschließend sofort aktualisiert.

## Lieferschein als Foto oder PDF mit Microsoft 365/Copilot auswerten

Die Lagerverwaltung wertet Fotos oder PDFs **nicht selbst mit KI aus**. Die Auswertung erfolgt in Microsoft 365/Copilot.

1. **Hilfe → Microsoft 365 / Copilot – aktuelle Prompts** öffnen.
2. Beim Lieferschein **Prompt kopieren** wählen. Das funktioniert auch auf dem Smartphone.
3. Lieferschein als Foto oder PDF in Microsoft 365/Copilot öffnen beziehungsweise hochladen.
4. Den kopierten Prompt einsetzen und ausführen.
5. Die Copilot-Ausgabe vollständig kopieren. Sie muss mit `IMPORTTYP: EINBUCHUNG` beginnen.
6. In der Lagerverwaltung den Bereich **Einbuchung** öffnen und die Ausgabe in das M365-Textfeld einfügen.
7. Vorschau prüfen: Artikelnummer, Bezeichnung und Anzahl.
8. Unbekannte Artikel anlegen oder ignorieren.
9. Techniker und Mengen prüfen und die geprüfte Einbuchung bestätigen.

Unbekannte Artikel können direkt als neues Material angelegt oder bewusst ignoriert werden. Artikelnummer, Bezeichnung, erkannte Menge und Standard-Techniker werden vorausgefüllt. Die erkannte Menge wird als Ausgangsbestand verwendet und nicht nochmals zusätzlich eingebucht.


## Sichtbarer Buchungsabschluss ab V77

Nach einer erfolgreichen Buchung zeigt eine grüne Abschlussanzeige **Erledigt** die gebuchten Positionen. Bei manuellen Buchungen werden die Artikelpositionen, Bemerkungen sowie bei Entnahmen Kunde und Maschine geleert; eine neue leere Position steht bereit und das Datum steht wieder auf heute. Der ausgewählte Techniker bleibt erhalten.

Auch die M365-Importe leeren die erledigte Vorschau und zugehörigen Eingaben nach erfolgreicher Buchung. Bei Fehlern bleiben die Eingaben zur Korrektur erhalten. Während des Speicherns sind wiederholte Bestätigungen gesperrt.
