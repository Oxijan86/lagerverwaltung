# Lagerverwaltung Lovrencic – V86.0

## Wesentliche Erweiterungen

- **Mehrlagerortverwaltung**: Ein Artikel kann über mehrere physische Lagerorte mit eigener Menge verteilt sein. Die Gesamtmenge bleibt aus der vorhandenen Buchungshistorie abgeleitet; beim Umlagern entstehen keine neuen Ein- oder Ausbuchungen.
- **Lagerorte & Umlagerung**: Neue sichtbare Rubrik, einzelne Teilmengen verschieben, alle Teile eines bestimmten Quelllagers/Quelllagerorts gemeinsam umlagern, Vorschau, Pflichtbestätigung, Sicherungsbackup, Audit und Umlagerungshistorie. Der Fahrzeugwechsel kann schrittweise je Lagerort erfolgen.
- **Sicherheitsregeln**: Sammelumlagerungen ohne ausdrücklich gewähltes Quelllager sind gesperrt. Änderungen werden bei der Übernahme gegen die aktuelle Datenbankrevision überprüft. Nach dem Transfer wird die Ansicht aktualisiert.
- **Inventur-Schnellzählung**: Artikelsuche mit Live-Vorschlägen, Enter/Bestätigen & weiter zurück zur Suche, neue Artikel zur Inventur übernehmen, Lagerortänderungen ausdrücklich bestätigen, Teilzählungen an verschiedenen Lagerorten zusammenrechnen und beim Abschluss validieren. Der Lagerortfilter erkennt auch zusätzliche Lagerorte eines Artikels.
- **Firmeninventurliste**: SAPUI5-Export als XLSX/CSV importieren und als Vergleichsstand zur laufenden Inventur speichern. Abgleich mit Zählwerten. XLSX-Export mit gleicher fünfspaltiger `SAPUI5-Export`-Struktur plus `Inventur-Abgleich`-Blatt. Keine Bestandseingriffe durch den Import allein.
- **Materialbuchungsbelege**: PDF-/Fotoimport für den Wareneingang unter **Einbuchung**. Servicebericht-Auswertung bleibt bei **Entnahme**, klassische Excel-Entnahme unter **Stammdaten → Sonderfunktionen**.
- Drei neue Schritt-für-Schritt-Hilfethemen zur Inventur, Umlagerung und Materialbuchungsbelegen.

## Hinweise zum Arbeiten

1. **Vor dem Update unbedingt `lager.db` sichern**, vor allem wenn bereits Inventur-Zwischenstände existieren.
2. **Vor der ersten V86-Nutzung beide Geräte synchronisieren** und eine Sicherheitskopie des produktiven Datenbestands erstellen. Die App legt zusätzlich vor der V86-Mehrlagerortmigration ein lokales Sicherheitsbackup der bisherigen Datenbank an.
3. Neue Lagerorte in **Lager / Lagerorte verwalten** anlegen. Aktuell müssen Lagerortnamen auch über verschiedene Lager hinweg eindeutig sein; für das neue Auto beispielsweise `Neues Fahrzeug – Fach A` benutzen.
4. Nach normalen Wareneingängen/Entnahmen: Der bisherige Buchungsdialog legt bei mehrortigen Artikeln nicht zwingend die genaue physische Teilmenge fest. Bei Bedarf die Lageverteilung unter **Lagerorte & Umlagerung** nachkontrollieren.
5. Die Cloud-Datei in einem OneDrive-Synchronisationsordner ist keine transaktionale Serverdatenbank. Zwei gleichzeitig arbeitende Geräte können nicht über den Ordner allein sicher exklusiv gesperrt werden. Die bestehende Konflikterkennung und Backups weiterhin verwenden; niemals ohne Vergleich überschreiben.
6. Die SAP-Firmenliste ist ein **Vergleichsstand**, kein Buchungsauftrag. Ungezählte Positionen im Export behalten den Unternehmenswert und sind im Zusatzblatt als ungezählt erkennbar.
7. Die tatsächliche Artikelmenge bleibt auch beim Fahrzeugwechsel gleich. **Inventurabschluss** erzeugt dagegen bei Abweichungen tatsächlich Lagerbuchungen.

## Teststatus / Grenzen

- 91/91 Node-Tests bestanden, darunter Datenmigration, Mehrlagerort-Teilung, Sammelumzug, Revisionssperre, SAP-Importvalidierung, Synchronisierungshistorie und vorherige Funktionen.
- 34 JavaScript-Dateien und eingebettete Scripte erfolgreich auf Syntax/Version geprüft.
- Chromium-Tests auf 390px und 1280px für Inventur, Enter-Schnellzählung, Lagerortfilter, Umlagerungs-Vorschau und bestätigten Transfer erfolgreich.
- **Nicht produktiv getestet**: originale `lager.db` des Nutzers, tatsächlicher OneDrive-Serverabgleich, reale Scanner-/Fotoqualität der Materialbuchungsbelege, SAP-Upload in Firmensysteme.

## GitHub-Update

`Lagerverwaltung_Lovrencic_V86_Direktupload_GitHub.zip` ist das empfohlene kumulative Update und enthält die bisherigen V81–V85-Änderungen plus V86. ZIP entpacken und **alle enthaltenen Dateien und Verzeichnisse** ins Wurzelverzeichnis des GitHub-Repositories über **Add file → Upload files** hochladen. Gleichnamige Dateien ersetzen, keine anderen Dateien löschen. Nach dem Deploy Browser/PWA aktualisieren, App-Version 86.0 kontrollieren. Der vollständige ZIP enthält zusätzlich die Bibliotheken und alle unveränderten Projektdateien.
