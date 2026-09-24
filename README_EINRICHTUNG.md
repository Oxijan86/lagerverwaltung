# Lagerverwaltung Lovrencic V64

## Neuer Einrichtungsassistent

1. Datenbank
   - Neue Datenbank erstellen (Ersteinrichtung)
   - Vorhandene Datenbank öffnen
2. Speicherort
   - lokaler Ordner
   - Cloud-Ordner
   - nur Browser-Speicher als Rückfalllösung
3. Benutzer
   - Technikername
   - Datumsformat
4. Sicherheit
   - Administratorpasswort
5. Zusammenfassung und Start

## Lokaler Ordner

Im lokalen Modus kann ein Ordner ausgewählt werden. Die App speichert dort automatisch `lager.db`. Zusätzlich bleibt der Datenstand im Browser gespeichert. Unter „Speicher & Synchronisation“ kann der lokale Ordner später geändert werden.

Ein Ordner, der bereits eine `lager.db` enthält, wird nicht automatisch überschrieben.

## Browser-Einschränkung

Die Ordnerauswahl funktioniert nur in Browsern, die die File System Access API unterstützen. Falls keine Ordnerauswahl verfügbar ist, kann die Datenbank im Browser verwendet und manuell exportiert werden.

## Cloud-Modus

Der Cloud-Modus ist für einen synchronisierten Ordner vorgesehen. Jeder Kollege sollte eine eigene Datenbank und einen eigenen Ordner verwenden. Vor einem Gerätewechsel immer synchronisieren und schließen.


## Version 61 – bestehende Cloud-Verknüpfung auf einem weiteren Gerät
Ein bereits verwendeter Synchronisationsordner muss **nicht leer** sein. Unter **Speicher & Synchronisation → Cloud-Synchronisationsordner verbinden** kann derselbe Ordner ausgewählt werden. Eine vorhandene gültige `lager.db` wird nur verbunden und geprüft. Sie wird durch das bloße Verbinden nicht überschrieben.

## Version 64

- Bestehende Cloud-/Ordner-Modi werden beim Update aus älteren Versionen übernommen.
- Neue Materialien können ohne Administratorpasswort angelegt werden; Änderungen bestehender Stammdaten bleiben geschützt.
- Soll- und Mindestbestand können direkt im Lagerbestand und Dashboard bearbeitet werden.
- M365-Prompts sind markier- und kopierbar.
