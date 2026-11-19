LAGERVERWALTUNG LOVRENCIC – VERSION 88.10
==========================================
GitHub-Direktupload für https://github.com/Oxijan86/lagerverwaltung
Aufbauend auf Version 88.9. Bestehende Datenbank und Inventuren bleiben erhalten.

INSTALLATION
1. Laufende Inventur speichern; bei Cloud-Nutzung Synchronisationsstand prüfen.
2. Optional vorher eine Sicherung von lager.db und des Inventur-Zwischenstands erstellen.
3. ZIP entpacken. Auf GitHub im Repository-Hauptverzeichnis auf
   Add file > Upload files klicken und ALLE Dateien aus diesem Paket hochladen.
4. Commit bestätigen, GitHub Pages veröffentlichen lassen.
5. Die App vollständig schließen (bei PWA auch aus der App-Übersicht), neu öffnen.
   Die Versionsanzeige muss 88.10 lauten.
6. Browserdaten, lokale Datenbank und IndexedDB NICHT löschen.

NEU: EINGABESCHUTZ V88.10
- Der alte Autocomplete kann den Fokus weiterhin zum Feld "Gezählt" senden.
  Ein neuer, separater Runtime-Schutz erkennt jede solche Fokussierung und
  leitet bei bereits gezählten Artikeln zum Feld "Weitere Menge" weiter.
- Auch eine bereits gezählte 0 wird als gezählt behandelt.
- Das alte Mengenfeld wird schreibgeschützt; falls eine alte App-Routine eine
  Eingabe darin versucht, wird der Originalzählwert wiederhergestellt.
- "Gesamtmenge korrigieren" lässt die Änderung erst nach ausdrücklicher
  Bestätigung zu und sperrt das Feld nach Verlassen erneut.
- Ein noch nicht gezählter Artikel bleibt wie bisher im Feld "Gezählt".

NEU: LAGERORTE V88.10
- Lagerort oben auswählen: die automatische Zuordnung wird aktiviert,
  ohne zusätzlich eine Checkbox anklicken zu müssen.
- Derselbe Artikel ist schon an Ort A gezählt? Bei Ort B einfach den Artikel
  wieder auswählen, neue Stückzahl unter "Weitere Menge" eingeben, Enter.
- Beispiel: Ort A 5 Stück, Ort B 3 Stück -> Gesamt 8, beide Orte separat.
- Ein bisher unbekannter Lagerort erfordert weiterhin eine bewusste
  Bestätigung zur Anlage der Stammdaten.
- Die laufende Inventur speichert die Teilmengen. Erst der verbindliche
  Abschluss aktualisiert Lagerbestände und reale Lagerort-Teilbestände.

TESTABLAUF
1. Lagerort A auswählen, Artikel 11006138 mit 5 Stück zählen, bestätigen.
2. Lagerort B auswählen (bestehender Stammdatenort).
3. Den gleichen Artikel suchen -> Cursor muss im Feld "Weitere Menge" stehen.
4. 3 eingeben, Enter. Kontrolle: A 5 / B 3 / gesamt 8.
5. Artikel erneut suchen: die 8 darf nicht direkt überschreibbar sein.
6. Bei "Gesamtmenge korrigieren" auf Abbrechen gehen: Feld bleibt gesperrt.
7. Testweise einen NEUEN Artikel suchen: Fokus bleibt im Feld "Gezählt".
8. Die Inventur NICHT abschließen, wenn du nur die neue Version testest.

TESTS
  node --test test_v88_7.cjs test_v88_8.cjs test_v88_9.cjs test_v88_10.cjs
50/50 automatisierte Tests bestanden (inklusive originaler RONDO-PDF-SHA-Prüfung).
Der zusätzliche reale End-to-End-Test auf Android/Chromium konnte in der
Containerumgebung nicht abgeschlossen werden; der Bedienablauf muss im
installierten Browser noch gegengetestet werden.

TECHNIK
Neue Datei: v88_10_inventory_focus.js, geladen nach v87_ui.js.
service-worker.js: neue Cache-Version, Automatik für bereits ausgewählten
Zählort, bisheriges Mengenmodell V88.9 und PDF-Module bleiben erhalten.
Keine DB-Migration. Keine automatische Aufhebung alter Zählstände.
