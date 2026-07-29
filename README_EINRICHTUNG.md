# Lagerverwaltung Lovrencic V29

## Vereinfachte Datenbankauswahl

Beim ersten Start einer bestehenden Lagerverwaltung wird nur noch die Datei `lager.db` ausgewählt. Ein Synchronisationsordner ist dafür nicht erforderlich.

Die Ordnerverknüpfung befindet sich ausschließlich unter `Dateisynchronisierung` und bleibt optional.

## Manuelle Synchronisierung

Die manuelle Steuerung bleibt vollständig erhalten:

- Synchronisationsordner auswählen
- Jetzt synchronisieren
- Stand aus Datei laden
- Lokalen Stand speichern
- Verknüpfung lösen
- SQLite-Datei importieren oder exportieren

## Abmelden und sauber schließen

Oben rechts befindet sich `Abmelden / schließen`.

Es gibt drei Möglichkeiten:

1. **Synchronisieren und schließen**
   - Backup erstellen
   - `lager.db` in den verbundenen Synchronisationsordner schreiben
   - Sitzung schließen

2. **Nur lokal schließen**
   - lokalen Stand speichern
   - lokales Backup erstellen
   - Cloud-Datei nicht verändern
   - Sitzung schließen

3. **Abbrechen**
   - normal weiterarbeiten

Nach dem Schließen zeigt die App einen geschlossenen Zustand. Erst nach bewusstem erneuten Öffnen wird auf diesem Gerät weitergearbeitet.

## GitHub-Update

Alle Dateien aus dem entpackten V29-Ordner in das Stammverzeichnis des GitHub-Repositories hochladen und vorhandene Dateien ersetzen. Danach die Seite mit `Strg + F5` neu laden.
