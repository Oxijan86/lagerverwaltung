# Lagerverwaltung Lovrencic – Version 62

## Korrektur: Cloud-Ordner auf dem Smartphone nach Browserneustart

### Problem in V61
Ein bestehender Synchronisationsordner konnte grundsätzlich korrekt verbunden werden. Nach einem Browser-/Smartphone-Neustart konnte der gespeicherte Ordner-Handle jedoch den Zustand `permission_denied` liefern.

Der Startdialog zeigte dann „Ordnerzugriff erforderlich“, verwies aber zur erneuten Freigabe auf die Seite Dateisynchronisierung, während der Startdialog diese Navigation gleichzeitig blockierte.

### Änderung in V62
- Bei `permission_denied` erscheint direkt im Startdialog:
  **🔐 Ordnerzugriff erneut freigeben**
- Die normale Schaltfläche **Aktuellen Cloud-Stand laden** wird in diesem Zustand ausgeblendet.
- `requestPermission()` wird weiterhin ausschließlich durch eine ausdrückliche Benutzeraktion ausgelöst.
- Nach erfolgreicher Freigabe wird `lager.db` zuerst gelesen und vollständig über die vorhandene Synchronisationslogik geprüft.
- Die Freigabe selbst überschreibt niemals die vorhandene Cloud-Datei.
- Ist der Stand identisch, startet die App direkt.
- Ist die Cloud neuer und lokal unverändert, wird der Cloud-Stand über die vorhandene sichere Logik geladen.
- Ist der lokale Stand ein sicherer Nachfolger, wird die vorhandene sichere Synchronisation verwendet.
- Bei echtem Parallelkonflikt bleibt der Konfliktdialog bestehen.
- Bei ungültiger/beschädigter Cloud-Datei bleibt jeder automatische Schreibvorgang blockiert.

## Browser-Grenze
Android-/Chromium-Browser können für einen gespeicherten File-System-Handle nach einem neuen Browserprozess erneut eine Benutzerfreigabe verlangen. Diese Berechtigungsabfrage darf nicht zuverlässig automatisch aus einer Hintergrundprüfung ausgelöst werden. Deshalb bleibt ein ausdrücklicher Fingertipp erforderlich.
