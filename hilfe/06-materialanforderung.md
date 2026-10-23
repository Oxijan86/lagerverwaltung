# Materialanforderung

- Techniker auswählen.
- **Unterbestand laden** anklicken.
- Gewünschte Positionen markieren.
- Bestellmenge prüfen oder ändern.
- **Materialanforderung exportieren** anklicken.

Die Excel-Datei wird anhand der hinterlegten Vorlage erzeugt. Der Dateiname enthält Datum und Technikername.

## Verbrauchsmaterial ohne Artikelnummer (V70)

1. In Materialanforderung eine Bezeichnung und optional die Einheit eingeben.
2. **Verbrauchsmaterial anlegen** wählen. Der Eintrag bleibt in der Lagerdatenbank gespeichert.
3. Ein gespeichertes Verbrauchsmaterial auswählen, Anzahl eingeben und **Zur Materialanforderung hinzufügen** wählen.
4. Menge und Exportauswahl in der Liste prüfen; **Entfernen** entfernt nur die Bestellposition.
5. Vorschau prüfen und exportieren. **Unterbestand laden** lässt Verbrauchsmaterialpositionen stehen.

Bis insgesamt 25 Positionen wird die kleine Vorlage genutzt. Verbrauchsmaterial steht ab Zeile 31 im Abschnitt **Verbrauchsmaterial ohne Nummer**; bei mehr als zehn Verbrauchsmaterialpositionen wird dieser Abschnitt erweitert. Ab insgesamt 26 Positionen wird die große Vorlage genutzt: Menge und Bezeichnung stehen in normalen Zeilen, Artikelnummer bleibt leer.

Verbrauchsmaterial wird nicht mit einer künstlichen Artikelnummer in den SAP-Lagerbestand geschrieben. Doppelte Positionen werden anhand ihrer gespeicherten ID zusammengefasst.
