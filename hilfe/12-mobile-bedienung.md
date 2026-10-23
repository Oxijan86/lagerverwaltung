# Mobile Bedienung

Auf schmalen Bildschirmen wird die Navigation über die Schaltfläche **Menü** geöffnet.

## Hinweise

- Tabellen können seitlich verschoben werden.
- Eingabefelder werden untereinander dargestellt.
- Die Ersteinrichtung ist für Smartphone und Tablet optimiert.
- Für umfangreiche CSV- und Excel-Arbeiten ist ein Windows-PC komfortabler.


## Cloud-Synchronisierung am Smartphone

Im Cloud-Modus werden eigene, eindeutig auf dem aktuellen Cloud-Stand basierende Änderungen automatisch synchronisiert. Die Auswahl zwischen lokalem und Cloud-Stand erscheint nicht mehr nach jeder normalen Buchung. Eine Entscheidung wird nur noch bei einem echten Konflikt, einer nicht lesbaren Cloud-Datei oder einem nicht eindeutig zuordenbaren Datenstand verlangt.


## Version 61 – vorhandenen Synchronisationsordner auf dem Smartphone verbinden
Unter **Speicher & Synchronisation** wählen Sie **Cloud-Synchronisationsordner verbinden**. Ein Ordner darf bereits eine gültige `lager.db` enthalten. Die Datei wird beim Verbinden nicht überschrieben. Lokal- und Cloud-Stand werden anschließend anhand von `database_id`, Revision und `revision_id` verglichen. Nur ein leerer Ordner wird als neue Cloud-Ablage initialisiert.

Der Button **Lokalen Speicherordner auswählen / ändern** ist dagegen für einen neuen lokalen Ablageordner bestimmt und akzeptiert absichtlich keinen Ordner, der bereits eine `lager.db` enthält.


## Version 62 – Ordnerzugriff nach Browserneustart

Auf Android kann der Browser einen bereits gespeicherten Ordner-Handle behalten, die tatsächliche Lese-/Schreibberechtigung aber nach einem Neustart erneut verlangen.

Wenn beim Start **Ordnerzugriff erforderlich** erscheint, befindet sich deshalb direkt im Startdialog die Schaltfläche **🔐 Ordnerzugriff erneut freigeben**.

Erst der Fingertipp auf diese Schaltfläche löst die Browser-Berechtigungsabfrage aus. Danach wird die vorhandene `lager.db` gelesen und geprüft. Sie wird durch die Freigabe nicht automatisch überschrieben.


## Version 63 – Synchronisieren und schließen
Wenn beim Schließen der Sitzung die Browserberechtigung für den bereits verbundenen Synchronisationsordner fehlt, erscheint direkt im Schließen-Dialog **🔐 Ordnerzugriff freigeben & synchronisieren**. Erst dieser Fingertipp fordert die Berechtigung an. Danach wird die Cloud-Datei erneut geprüft und der normale geschützte Synchronisationspfad fortgesetzt.


## V68 – Lagerbestand suchen trotz Bildschirmtastatur
Die Suche arbeitet während des Tippens direkt aus dem bereits geladenen Lagerbestand. Trefferzahl und die ersten Treffer stehen direkt unter dem Suchfeld. Die Trefferliste ist auf kleinen Displays begrenzt scrollbar und bleibt oberhalb der Bildschirmtastatur bedienbar. Über **Tastatur schließen** oder durch Antippen eines Treffers kann der Eingabefokus verlassen werden.

## Ersteinrichtung V70

Der Einrichtungsassistent ist bei 360, 390 und 430 Pixel Breite per Touch bedienbar. Der Startprüfungsdialog überlagert eine frische Einrichtung nicht. Ordnerauswahl wird nach Browserfähigkeit angezeigt; ohne Unterstützung steht die vollständige Einrichtung im Browser mit lager.db-Download bereit.
