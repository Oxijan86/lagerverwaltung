# Neues Material

Neue Materialien können ohne Administratorpasswort angelegt werden.

- Artikelnummer und Bezeichnung sind Pflichtangaben.
- Der hinterlegte **Standard-Techniker** wird automatisch vorausgewählt und kann vor dem Speichern geändert werden.
- Der manuelle **Ausgangsbestand** startet mit `0` und kann angepasst werden.
- **Mindestbestand** ist die Warn- und Bestellschwelle.
- **Sollbestand** ist der gewünschte Bestand nach der Nachbestellung.
- Regel: `0 <= Mindestbestand <= Sollbestand`.
- Wird Mindestbestand größer als Sollbestand eingegeben, wird der **Sollbestand** automatisch auf den Mindestbestand angehoben.
- Lagerort ist optional – auch bei Artikelanlage aus Einbuchung, Entnahme und CSV-/Firmenimport. Ohne Auswahl bleibt der interne Lagerort leer.
- Ausgangsbestand, Lagerort, Maschinenzuordnung, Anfangsbuchung und Audit werden gemeinsam transaktional angelegt.

- Ab V76 kann ein Lager unabhängig vom Lagerort gewählt werden. Das Standardlager wird vorausgewählt; **Ohne Lager** ist ebenfalls möglich.
- **Lager verwalten / Standard festlegen** öffnet die gemeinsame Lagerverwaltung ohne Kennwort. Neue Lagerorte können auch direkt im Formular ergänzt werden.
