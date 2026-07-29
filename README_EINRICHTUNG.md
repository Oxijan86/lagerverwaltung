# Lagerverwaltung Lovrencic V36 – Wiederöffnen mit Cloudprüfung

## Behobener Fehler

Nach `Synchronisieren und schließen` wurde zwar ein Schließzeitpunkt gespeichert, beim erneuten Öffnen aber nicht ausgewertet. Der bisherige Button führte nur `location.reload()` aus. Auf Smartphones konnte dadurch die frühere Browser-/PWA-Sitzung mit bereits bestätigtem Startzustand wieder erscheinen. Die App landete direkt im Dashboard und lud den neuen Cloud-Stand erst nach `Jetzt synchronisieren`.

## Neues Verhalten

Der Button heißt jetzt:

`Cloud-Stand prüfen und auf diesem Gerät öffnen`

Beim Anklicken:

1. wird die frühere Startbestätigung vollständig gelöscht,
2. wird ein dauerhafter Marker für eine erzwungene Startprüfung gesetzt,
3. wird die App mit einem Cache-Buster neu geöffnet,
4. wird der lokale Stand mit der Cloud-Revision verglichen,
5. erscheint zwingend der Startdialog,
6. kann anschließend der aktuelle Cloud-Stand geladen werden.

Auch beim Zurückkehren aus dem Hintergrund wird ein vorhandener Schließmarker ausgewertet.

## Richtiger Gerätewechsel

1. Gerät A: `Synchronisieren und schließen`
2. Gerät B: App öffnen bzw. `Cloud-Stand prüfen und auf diesem Gerät öffnen`
3. Startdialog abwarten
4. `Aktuellen Cloud-Stand laden`
5. Erst danach buchen
