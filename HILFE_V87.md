# Hilfe – RONDO-Inventur und Einrichten (V87)

## Neue Datenbank

Beim letzten Einrichtungsschritt **einen Datenimport wählen**:

- **SAP-Excel oder CSV**: Datei mit den Spalten `Material`, `Bezeichnung zum Material`, `Lagerort`, `Bezeichnung des Lagerorts`, `Frei verwendbar` prüfen. Die SAP-Menge wird nach Bestätigung als Anfangsbestand übernommen. Eine anschließende Inventur wird angeboten, ist freiwillig.
- **RONDO-Inventurliste als PDF**: Die Datei enthält Artikel und Lagerort, nicht die Mengen. Die Anwendung prüft die Erkennung, registriert neue Artikel ohne Ausgangsmenge und beginnt eine **Pflicht-Erstinventur**. Zählung lässt sich unterbrechen und fortsetzen. Erst nach Abschluss werden die Mengen als Anfangsbestand wirksam.
- **Ohne Datei**: nur bei bewusster manueller Einrichtung.

Wichtig: Wenn die PDF nur das Papierbild einer gescannten Zählliste enthält, muss die App die Positionen durch OCR erkennen. Unsichere Nummern niemals blind übernehmen. Falls eine Seite zu wenige Positionen enthält, die fehlenden Positionen manuell ergänzen.

## Jährliche Firmeninventur

Im Menü **Inventur** die RONDO-PDF wählen und lesen lassen. Die App vergleicht die Artikelnummern der PDF mit den erfassten Artikeln. Das Ergebnis enthält: neue Firmenartikel, vorhandene Artikel, Artikel nur in der App. Danach Zählmengen eingeben und die Ergebnisse mit dem App-Bestand vergleichen. Unbekannte physische Artikel zusätzlich registrieren und im Abweichungsbericht auflisten.

### Zählen mit der Tastatur

Artikelnummer oder Namen eintippen → Vorschlag mit Pfeiltasten auswählen → **Enter** → direkt die gezählte Menge eingeben → **Enter** → zurück zur Artikelsuche. Nicht gezählt ist leer; ausdrücklich gezählte **0** ist eine gültige Zählung. Bei bereits gespeicherter Inventur bleibt der Zwischenstand erhalten.

### Abweichungen

- **Auf RONDO-PDF, nicht in der App:** noch nicht registrierter Firmenartikel.
- **In der App, nicht auf RONDO-PDF:** gesondert überprüfen, nicht automatisch löschen oder auf null setzen.
- **App-Bestand anders als gezählt:** bei Inventurabschluss nach Prüfung korrigieren.
- **SAP-Bestand:** kann ohne separate SAP-Liste nicht verglichen werden.

Vor dem Abschluss vergessene Servicebericht-Entnahmen erledigen; Buchungen nach dem Zählen können die Zählbasis beeinflussen. Die Anwendung meldet ggf. Konflikte, kann aber unbekannte Serviceberichte nicht selbst finden.

### Ausgefüllte RONDO-PDF für die Firma

„Ausgefüllte RONDO-PDF erzeugen“ übernimmt die ursprünglichen gescannten Seiten als Hintergrund und druckt die erfassten Mengen in die jeweilige Zählmengenspalte. Bei noch offenen Positionen fragt die Anwendung vor einem Teil-Export nach. Prüfe die PDF vor der Rückgabe und unterschreibe nach Vorgaben der Firma.

## Einzelne Artikel umlagern

Menü **Lagerorte & Umlagerung** → einzelne Teilbestände markieren → pro Artikel die gewünschte Menge eingeben → gemeinsames Ziellager wählen → Vorschau prüfen → bestätigen. „Alle gefilterten auswählen“ ist ausdrücklich optional. Jeder Artikel wird einzeln mit Revisionsprüfung und Backup verbucht; nach einem Abbruch bereits gebuchte Positionen nicht erneut verarbeiten.

## Synchronisieren

Die vorhandene V81–V86-Cloud-Synchronisierung bleibt bestehen. Während einer laufenden Inventur die vorgesehenen lokalen Zwischenstände speichern; auf mehreren Geräten vor einem Wechsel den tatsächlichen Cloud-Stand prüfen. Bei Konflikten keinen Datenstand blind überschreiben.
