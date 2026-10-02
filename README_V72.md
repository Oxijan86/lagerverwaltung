# Lagerverwaltung Lovrencic – Version 72

V72 behebt die Einbuchung der Firmenvorlage mit 630 Materialzeilen im Blatt `SAPUI5-Export`.

Die Mengenspalte bleibt **Frei verwendbar**. Die Datei enthält echte Excel-Zahlen mit Anzeigeformaten wie `1 ST`, `1,50 M` oder `1,000 L`. Der bisherige Import las diese Anzeigetexte und lehnte sie als ungültige Mengen ab. V72 liest für diese Spalte den numerischen Zellwert. Anzeigeeinheiten und gerundete Anzeigeformate beeinflussen die Buchungsmenge dadurch nicht mehr.

CSV-Dateien behalten die bestehende Auswertung deutscher Kommazahlen, zum Beispiel `2,5`.

Artikelnummern werden weiterhin mit ihrer Formatierung eingelesen, damit führende Nullen erhalten bleiben. Firmen-Lagerort `1025` und Bezeichnung des Lagerorts bleiben eigene Felder. Leere oder ungültige Mengen werden weiterhin angezeigt und blockieren die Bestätigung.

## Einbuchung mit der Firmenvorlage

1. Im CSV-Center bei **Firmenliste importieren** die Importart **Einbuchung** wählen.
2. Techniker auswählen und die XLSX-Datei öffnen.
3. Die Vorschau prüfen. Die mitgelieferte Testvorlage ergibt 630 Positionen und 0 Fehler.
4. Für unbekannte Artikel **Anlegen** oder **Ignorieren** auswählen. Der interne Lagerort bleibt optional.
5. **Geprüften Vorgang bestätigen** wählen. Erst dabei werden die Mengen als Zugang gebucht.

Bei **Einbuchung** ist Frei verwendbar die Zugangsmenge, die zum vorhandenen Bestand addiert wird. Bei **Inventur / Bestandsabgleich** ist Frei verwendbar der Vergleichsbestand. Auch dieser Importmodus liest die korrigierten numerischen Mengenwerte.

Die wiederholte Bestätigung desselben Vorgangs bucht keine Menge doppelt. Ein ausdrücklich gestarteter neuer Vorgang kann dieselbe Datei erneut buchen, wie bisher.

## Update

Das vollständige Paket entpacken, die App-Dateien in der vorhandenen Bereitstellung aktualisieren und die Seite neu laden. Die App zeigt **72.0** und verwendet einen neuen Service-Worker-Cache. Die bestehende `lager.db` weiterverwenden. Alle Funktionen und die korrigierten Materialanforderungs-Exporte aus V71 sind enthalten.

## Tests

Die neue Regression verwendet die Originaldatei einschließlich ST/M/L-Zahlenformaten über die echte Dateiauswahl und Bestätigung der Browser-App mit SQL.js und IndexedDB. Sie prüft jede der 630 Mengen, den Zugang bei einem bereits vorhandenen Artikel, Neuanlagen, Dezimalwerte, Neustart und Wiederholung. Weitere Grenzfälle prüfen führende Nullen, angezeigte Rundung, Leerwerte, ungültige Werte sowie 0 und negative Mengen.

Ergebnisse: `TEST_RESULTS_V72.txt`. Testbefehle und Abhängigkeiten: `README_V70.md`.
