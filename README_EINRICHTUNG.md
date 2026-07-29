# Lagerverwaltung Lovrencic V35 – Startprüfung beim Gerätewechsel

## Behobener Fehler

Auf Smartphones bleibt eine installierte PWA häufig im Hintergrund geöffnet. Die bisherige Startbestätigung blieb dadurch in der laufenden Browsersitzung gespeichert. Beim Wechsel vom PC zurück zum Smartphone erschien deshalb direkt das Dashboard.

## Neues Verhalten

Die Startprüfung wird erneut ausgelöst:

- bei jedem echten Neuladen oder neuen Öffnen der App,
- wenn die App aus dem Browser-Zwischenspeicher wiederhergestellt wird,
- wenn die App mindestens 60 Sekunden im Hintergrund war und wieder geöffnet wird,
- nach einem sauberen Abmelden bzw. Schließen.

Nach einer bewusst bestätigten Auswahl und dem technisch notwendigen kontrollierten Neuladen erscheint der Dialog nicht sofort ein zweites Mal.

## Gerätewechsel

Empfohlener Ablauf:

1. Auf Gerät A `Synchronisieren und schließen`.
2. Auf Gerät B die Lagerverwaltung öffnen.
3. Der Startabgleich erscheint automatisch.
4. Cloud-Revision und lokaler Stand vergleichen.
5. `Aktuellen Cloud-Stand laden` auswählen.
6. Erst danach buchen.

Ist die App auf Gerät B bereits im Hintergrund geöffnet, erscheint der Startabgleich nach dem Zurückkehren erneut, sobald sie mindestens 60 Sekunden im Hintergrund war.
