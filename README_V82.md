# Lagerverwaltung Lovrencic – V82.0

**Direkte GitHub-Version: fertige Programmdateien, kein Patch-Skript und kein zusätzlicher GitHub-Workflow.**

## Upload bei `Oxijan86/lagerverwaltung`

1. Vor dem Update die aktuelle `lager.db` unter **Dateisynchronisierung → lager.db herunterladen** sichern. Falls möglich zusätzlich eine weitere Kopie unabhängig vom Cloud-Ordner aufbewahren.
2. **Lagerverwaltung_Lovrencic_V82_Direktupload_GitHub.zip** herunterladen und **entpacken**.
3. Auf GitHub **Add file → Upload files** wählen. Den **Inhalt** des entpackten Pakets einschließlich Unterordnern `hilfe/`, `tests_v80/`, `tests_v81/`, `tests_v82/` hochladen. Bei gleichnamigen Dateien die bisherigen ersetzen. Vorhandene andere Dateien nicht löschen.
4. **Commit changes** durchführen und die GitHub-Pages-Veröffentlichung abwarten.
5. Anwendung auf PC und Smartphone neu öffnen und unter **Dashboard** die Version **82.0** kontrollieren. Falls noch V80/V81 sichtbar ist, die PWA schließen/neu öffnen und Aktualisierung prüfen.
6. Die Synchronisierung erst mit einer **Kopie** deiner Datenbank testen. Nur einen realen Datenstand als Grundlage verwenden, und nur dann mit deiner echten Cloud-Lagerdatei arbeiten, wenn der Test erfolgreich ist.

Die **Vollversion** ist alternativ das komplette Paket inklusive bisheriger Ressourcen, Vorlagen und PDF/OCR-Bibliotheken. Sie wird ebenfalls entpackt hochgeladen – die ZIP-Datei selbst ist keine laufende Anwendung.

**Hinweis zur Ausgangsversion:** Der zuletzt überprüfte GitHub-Stand war noch V80, deshalb enthält das Direktuploadpaket ausdrücklich auch alle nötigen V81-Bestandteile. V81 muss nicht vorher separat installiert werden.

## Neue und erhaltene Funktionen

- Sicherungsabfrage nach jeder lokal gespeicherten Änderung mit **Jetzt synchronisieren / Später synchronisieren**, sichtbarer Status, keine blinde Cloud-Überschreibung.
- Cloud-Datenstände vor dem Schreiben prüfen, Backups erstellen und Schreibvorgang erneut lesen; Unklarheiten blockieren Übernahme.
- Geräteübergreifende eindeutige Buchungskennungen für Einbuchungen, Entnahmen, Korrekturen und Nachübernahmen.
- V82: **dauerhafte Löschvermerke**, inklusive Kunde, Ticket, Maschine, ursprünglichem Buchungsinhalt.
- V82: **Konfliktarchiv** mit gespeicherten Original-Datenbanken, Vergleich nach Artikel/Kunde/Ticket/Maschine/Löschung und gezielter nachträglicher Übernahme.
- V82: bei Änderungen einzelner Buchungsinformationen die **zu übernehmenden Felder** auswählen; zusätzliche Kunden-, Ticket-, Maschinen- oder Bemerkungsangaben erfassen. Nicht ausgewählte Felder bleiben erhalten.
- Negative Bestände, ungültige Mengen, widersprüchliche Löschungen und nicht eindeutige Revisionen werden blockiert statt still überschrieben.
- V82: Schutz beim Schließen über Windows-X, soweit der Browser `beforeunload`-Warnungen erlaubt, mit erneutem Hinweis beim nächsten Öffnen.
- CSV-/XLSX-Firmenimport mit Suche, Filter, 50 Zeilen pro Seite und eindeutiger Unterscheidung zwischen **Einbuchung** und **Inventur/Bestandsabgleich**.
- **29 umfassende Schritt-für-Schritt-Hilfethemen** direkt im Menü **Hilfe**, besonders für SAP-Firmenliste, Bestell-Excel, RONDO-Servicebericht-PDF, Backups, Synchronisierung und Konflikte.
- Smartphone-Hilfe: größere Navigation, Suche, Direktzugriff zu wichtigen Importthemen, Such-Reset, echte nummerierte Schrittlisten.
- Bestehende Funktionen von V80/V81 einschließlich PDF-Unterticket-Erkennung, Maschinenzuordnung und Inventur bleiben enthalten.

## Erkannte Fehler und Korrekturen

1. **Hilfe:** Frühere Suchergebnisse ohne Treffer konnten die Anleitung verdrängen. Rücksetzen stellt die Inhalte jetzt wieder her.
2. **Hilfe:** Lange Hilfe-Themen waren auf Smartphones schwer auffindbar; responsive Themenliste und Direktzugriff ergänzt.
3. **Hilfe:** Nummerierte Anleitungen wurden vorher nicht als nummerierte Listen dargestellt; Darstellung korrigiert.
4. **Hilfe:** Schreibweisen ohne Umlaute wie `Loeschungen` wurden nicht als `Löschungen` erkannt; Suche angepasst.
5. **Konfliktarchiv:** Eingaben wie geänderter Kunde/Ticket konnten beim Filtern der Liste verloren gehen; Entwürfe bleiben erhalten.
6. **Konfliktarchiv:** Einzelne Felder einer geänderten Buchung waren nicht separat auswählbar; Auswahl erweitert.
7. **Konfliktarchiv:** Bei manuellen Wiederherstellungen von geänderten Buchungen werden Mengen und weitere Eingabewerte jetzt typgeprüft; ungültige Werte verursachen keine Bestandsveränderung.
8. Der bereits in V81 behobene Abbruch nach einer CSV-Firmenlisten-Vorschau bleibt in V82 beseitigt.

## Wichtige Grenzen

- **OneDrive-Serverbestätigung:** Die aktuelle Browser-Ordneranbindung kann ausschließlich nachprüfen, dass die Datei im verbundenen Ordner geschrieben und wieder gelesen wurde. Ob OneDrive die Datei bereits auf den Server/zweites Gerät übertragen hat, wird **nicht bestätigt**.
- **Gleichzeitiger Cloud-Schreibzugriff:** Die Browser-Dateischnittstelle besitzt keine serverseitige Compare-and-Swap-Sperre. Exakt zeitgleiche Änderungen mehrerer Geräte sind deshalb technisch **nicht zu 100 % garantierbar**. Deshalb vor dem Gerätewechsel auf dem alten Gerät synchronisieren und auf dem neuen Gerät den Cloud-Stand prüfen.
- **Automatische Zusammenführung:** Nur bei einer nachweisbaren gemeinsamen Ausgangsversion und ohne Fachkonflikte. Komplexe Inventur- und Stammdatenkonflikte bleiben aus Sicherheitsgründen gesperrt und müssen manuell geklärt werden.
- **Schließen mit X:** Der Browser kann nur seine eigene Warnung anzeigen; ein eigenes Dialogdesign und automatischer Cloud-Upload beim Schließen sind nicht garantiert. Mobile Betriebssysteme können die App ohne Warnung beenden.
- **Produktivtest:** Die Testfälle verwendeten kontrollierte SQLite-Datenbanken und simulierte Cloud-Schnittstellen. Ein echter Browser-zu-OneDrive-End-to-End-Test mit deiner Cloud-Datei wurde nicht durchgeführt.

Weitere Informationen: `CHANGED_FILES_V82.md`, `TEST_RESULTS_V82.md`, `USABILITY_REVIEW_V82.md` sowie der Reiter **Hilfe** in der App.
