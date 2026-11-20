LAGERVERWALTUNG LOVRENCIC V88.19 – RONDO PDF-ABGLEICH OHNE INVENTURABSCHLUSS

1) ZIP entpacken und enthaltene Dateien in das Hauptverzeichnis von Oxijan86/lagerverwaltung hochladen.
2) Aktuelle lager.db vorher sichern; Browserdaten/IndexedDB nicht löschen.
3) Bestehende Inventur öffnen (keine neue Inventur).
4) RONDO-PDF-Zwischenstand/Abschluss herunterladen öffnen, die richtige bestehende Inventur wählen.
5) Schnellzuordnung zeigt auch ungezählte Artikel und 0-Buchbestand.
6) Offene PDF-Position: Artikelnummer/Bezeichnung aus dem gesamten Stamm suchen, bewusst zuordnen. Bei fehlendem Artikel nur nach Bestätigung mit ANFANGSBESTAND 0 anlegen; dann ist er NICHT automatisch 0 gezählt.
7) „Später zuordnen“ parkt unklare Positionen. „PDF-Prüfstand zwischenspeichern“ sichert alle Verknüpfungen in IndexedDB. „Prüfstand als JSON sichern“ lädt eine getrennte Sicherungsdatei herunter, die per „JSON-Prüfstand einlesen“ mit Hash- und Datenbankprüfung später wiederhergestellt werden kann. Die normale lager.db-Kopie enthält diesen gesonderten PDF-Prüfstand nicht automatisch.
8) Eine bestätigte PDF-Zuordnung darf unabhängig von Zählmengen aus dem offenen Filter verschwinden. Mit „Auch bereits zugeordnete PDF-Positionen anzeigen“ erneut anzeigen.
9) „PDF mit bisherigen Zählwerten erzeugen“ erstellt einen Zwischenstand. 0 wird NUR nach ausdrücklicher Nullzählung ausgegeben, Buchbestand 0 alleine ergibt ein LEERES Feld. Inventurabschluss und Lagerbestandsbuchung bleiben separate Vorgänge.
10) Bei I/1-Verwechslung keine automatische Stammdaten-Löschung. 88.17-Dublettenprüfung nutzen.

WICHTIG: Die Original-PDF muss sichtbar erhalten bleiben. Bei fehlenden RONDO-Zeilen die exportierte PDF NICHT an RONDO geben.

V88.19 HOTFIX JSON-SICHERUNG: Das Herunterladen des PDF-Pruefstands startet unabhaengig von Validierungsfehlern und OHNE zuvor etwas neu zu speichern. Offene/rote Zeilen werden mitgesichert. Der Download wird synchron im Klick ausgeloest. Eine Rueckmeldung erscheint direkt bei den Buttons und im Statusfeld.
