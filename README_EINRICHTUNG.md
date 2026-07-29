# Lagerverwaltung Lovrencic V37 – direkter Gerätewechsel

Browserdaten sind gerätebezogen. Das Schließen auf dem PC kann auf dem Smartphone keinen lokalen Marker setzen.

V37 prüft deshalb die Cloud-Revision selbstständig:

- sofort beim Wechsel in den Vordergrund,
- beim Fokus auf das Browserfenster,
- beim Wiederherstellen einer mobilen Browserseite,
- zusätzlich alle 15 Sekunden bei sichtbarer App.

Nur wenn Cloud und lokaler Stand nicht identisch sind, erscheint der Startdialog. Eine Wartezeit von 60 Sekunden entfällt.

Empfohlener Ablauf:

1. Gerät A: Synchronisieren und schließen
2. Gerät B öffnen oder in den Vordergrund holen
3. Startdialog erscheint bei erkannter neuer Cloud-Revision
4. Aktuellen Cloud-Stand laden
5. Danach weiterarbeiten
