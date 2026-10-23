# Inventur mit PC und Smartphone

## Inventur starten oder fortsetzen

Im eigenen Reiter **Inventur** einen Namen eingeben und **Neue Inventur starten** wählen. Die Inventur übernimmt die aktiven Artikel mit ihrem aktuellen Bestand und Lagerort als Ausgangsstand. Später lässt sich dieselbe Inventur über **Gespeicherte Inventur** wieder öffnen. Mehrere Zwischenstände und abgeschlossene Inventuren bleiben in der Lagerdatei erhalten.

## Artikel suchen und zählen

Die Artikelsuche findet Artikelnummern, Bezeichnungen, Barcodes und Lagerorte. Mehrere Suchwörter können kombiniert werden. Filter zeigen alle, noch nicht gezählte, gezählte oder seit Beginn geänderte Positionen. Zusätzlich ist ein Lagerfilter verfügbar.

Die Liste zeigt 30 Positionen pro Seite. Über **Zurück** und **Weiter** lässt sich blättern. Auf Smartphones stehen die Eingaben als gut bedienbare Karten untereinander.

- **Gezählt** leer lassen: Dieser Artikel ist noch nicht gezählt.
- **0** eingeben: Der Artikel wurde gezählt und es ist nichts mehr vorhanden.
- Dezimalmengen können mit Komma oder Punkt eingegeben werden, zum Beispiel `1,25` oder `1.25`. Keine Tausendertrennzeichen verwenden.
- Den passenden **Lagerort** wählen oder **Ohne Lagerort** einstellen.
- Bei Bedarf eine **Notiz** ergänzen.

Gezählte Mengen werden niemals automatisch aus dem Istbestand vorbefüllt.

## Zwischenspeichern und Gerätewechsel

Die Eingaben werden nach kurzer Eingabepause automatisch gespeichert. Über **Zwischenstand speichern** kann sofort gespeichert werden. Auf die Meldung **Zwischenstand gespeichert** achten. Die Speicherung ändert weder den Istbestand noch Artikel-Lagerorte oder Buchungen.

Gespeicherte Inventuren sind Bestandteil der `lager.db`, der vorhandenen Backups und der Dateisynchronisierung. Vor einem Gerätewechsel den Zwischenstand speichern und die Lagerdatei synchronisieren oder herunterladen und auf dem anderen Gerät öffnen. Dort die aktuelle Datei und dieselbe Inventur auswählen. Zwei getrennte lokale Dateikopien werden nicht automatisch zusammengeführt; die bestehende Konfliktprüfung der Synchronisierung bleibt erhalten.

Bei einem Speicherfehler bleiben ungespeicherte Eingaben zusätzlich als lokale Wiederherstellungskopie im selben Browser erhalten. Diese Kopie ersetzt keinen gespeicherten Zwischenstand in der Lagerdatei. **Lokale Eingaben herunterladen** sichert diese Wiederherstellungskopie bei Bedarf als Datei. Bei einer veralteten lokalen Kopie zuerst sichern und die Änderungen prüfen, bevor der gespeicherte Stand neu geladen wird.

## Lager und Lagerort ergänzen

**Lager oder Lagerort hinzufügen** öffnen. Hier kann ein neues Lager, beispielsweise ein Fahrzeug oder Hauptlager, angelegt werden. Für einen neuen Lagerort das Lager auswählen und den Namen des Lagerorts eingeben. Ohne übergeordnetes Lager ist ebenfalls möglich.

Ab V76 ist die Neuanlage ohne Kennwort möglich. Lager und Lagerorte stehen danach sofort als Stammdaten bereit. In der Artikelliste Lager und optionalen Lagerort auswählen. Ein Lager lässt sich auch ohne Lagerort zuordnen. Die Artikelzuordnung wird erst bei Abschluss für die tatsächlich gezählten Artikel übernommen. Lagerorte mit Lager werden in der übrigen App als **Lager / Lagerort** angezeigt; bestehende Lagerorte bleiben verfügbar.

## Änderungen während der Inventur

Neue Buchungen, geänderte Bestände, Einheiten, Lager oder Lagerorte werden erkannt. Bei betroffenen Artikeln **Bestandsstand aktualisieren und neu zählen** wählen. Dabei wird nur deren alte Zählung geleert. Danach diesen Artikel erneut zählen. Ein zwischenzeitlich gebuchter Bestand wird nicht blind überschrieben.

Über **Neue Artikel ergänzen** werden nach Inventurbeginn neu angelegte aktive Artikel in die Zählliste aufgenommen. Vorhandene Zählungen bleiben erhalten.

## Prüfen und abschließen

**Abschluss prüfen** zeigt die gezählten Mengen, Differenzen, Lagerorte und mögliche Konflikte. Nur gezählte Artikel werden übernommen. Bei ungezählten Artikeln ist ein Teilabschluss nur nach ausdrücklicher Auswahl möglich; deren Bestände und Lagerorte bleiben unverändert.

Mit **Inventur verbindlich abschließen**, Bestätigung und Administratorfreigabe werden Bestandsdifferenzen als Ein- oder Ausbuchungen sowie die Lagerorte der gezählten Artikel übernommen. Vorher wird ein Sicherheitsbackup angelegt. Zählwerte und Änderungen erscheinen im Audit. Ein erneuter Abschluss erzeugt keine Doppelbuchung.

Abgeschlossene Inventuren bleiben zur Ansicht erhalten. Eine neue Zählrunde wird als neue Inventur gestartet. Über **Inventur abbrechen und archivieren** lässt sich eine laufende Inventur ohne Bestandsänderung beenden; der gespeicherte Zwischenstand bleibt archiviert.

## Ergebnis herunterladen

**Zählliste herunterladen (CSV)** enthält den Ausgangsbestand, die Zählmenge, Differenz, alte und gezählte Lagerorte sowie Notizen. Auch Zwischenstände können exportiert werden. Ungezählte Positionen bleiben leer; Nullzählungen stehen ausdrücklich als 0 in der Datei.


## Gemeinsame Lagerverwaltung ab V76

Die Lagerverwaltung und das Standardlager sind auch im Reiter **Lagerbestand** und bei **Neues Material** verfügbar. Neue Inventurpositionen übernehmen vorhandene Lagerzuordnungen; bei noch nicht zugeordneten Artikeln wird das Standardlager vorausgewählt. Die Zuordnung wird erst beim Abschluss für gezählte Artikel übernommen. Eine Bestandskontrolle im Reiter Lagerbestand kann Lager und Lagerort dagegen direkt mit **Speichern** übernehmen. Solche zwischenzeitlichen Änderungen werden in einer laufenden Inventur als Konflikt erkannt.

Der CSV-Export enthält zusätzlich vorheriges und gezähltes Lager, auch wenn kein Lagerort angegeben wurde.
