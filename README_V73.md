# Lagerverwaltung Lovrencic – Version 73

V73 ergänzt im CSV-Center die Sammelauswahl **Alle unbekannten Artikel auf Anlegen stellen**. Sie funktioniert bei **Einbuchung** und bei **Inventur / Bestandsabgleich** für die Firmenliste.

## Bedienung

1. Importart und Techniker auswählen, dann die Datei öffnen.
2. Die Vorschau prüfen.
3. **Alle unbekannten Artikel auf Anlegen stellen** anklicken. Der Button zeigt die Anzahl der dafür verfügbaren unbekannten Artikel an.
4. Bei Bedarf einzelne Artikel wieder auf **Ignorieren** stellen.
5. **Geprüften Vorgang bestätigen** anklicken. Erst dann werden Artikel angelegt und die Mengen gebucht beziehungsweise abgeglichen.

Die Sammelauswahl ändert ausschließlich die Auswahlfelder der gültigen, noch nicht verarbeiteten unbekannten Artikel. Sie legt selbst keine Artikel an und verändert keine Bestände. Bekannte Artikel, bereits verarbeitete Positionen und fehlerhafte Positionen behalten ihre bisherige Behandlung. Ohne auswählbare unbekannte Artikel sowie während der Dateiprüfung ist der Button gesperrt.

Beim erneuten Prüfen derselben Datei bleiben Sammelauswahl und individuelle Ausnahmen erhalten. Eine neu ausgewählte Datei beginnt wie bisher mit **Ignorieren** für unbekannte Artikel. Der interne Lagerort bleibt optional.

## Update

Das vollständige Paket entpacken, die App-Dateien in der vorhandenen Bereitstellung aktualisieren und die Seite neu laden. Die App zeigt **73.0** und verwendet einen neuen Service-Worker-Cache. Die bestehende `lager.db` weiterverwenden.

Die Excel-Mengen aus Frei verwendbar einschließlich ST/M/L-Anzeigeformaten und die korrigierten Materialanforderungs-Exporte sind enthalten.

## Tests

Die Sammelauswahl wird über echte Klicks mit der Originaldatei mit 630 Positionen getestet: 1 bekannter und 629 unbekannte Artikel. Beide Importarten, einzelne Ignorieren-Ausnahmen, erneute Prüfung, neue Dateiauswahl, Bestätigung und Wiederholung sind geprüft. Der Bestandsabgleich wird außerdem mit Smartphone-Emulation bei 390 Pixeln getestet.

Ergebnisse: `TEST_RESULTS_V73.txt`. Testbefehle und Abhängigkeiten: `README_V70.md`.
