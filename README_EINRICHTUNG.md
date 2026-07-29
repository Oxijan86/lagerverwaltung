# Lagerverwaltung Lovrencic V19 – PWA mit OneDrive

## Was diese Version kann

- auf Android und Windows als installierbare Web-App laufen
- lokal und ohne eingeschalteten PC arbeiten
- SQLite lokal im Browser speichern
- Datenbank manuell mit dem persönlichen OneDrive synchronisieren
- Cloud-Backups erstellen
- SQLite-Datei exportieren und importieren
- Konflikte über OneDrive-ETags erkennen

## Wichtiger technischer Punkt

Eine PWA kann nicht einfach eine beliebige Datei aus der OneDrive-App dauerhaft direkt öffnen. Für einen sicheren Zugriff auf OneDrive benötigt sie Microsoft Graph und eine eigene Microsoft-App-Registrierung.

Es wird kein eigener Anwendungsserver benötigt. Die PWA selbst muss jedoch über HTTPS bereitgestellt werden, beispielsweise über GitHub Pages oder Azure Static Web Apps.

## 1. Microsoft-App registrieren

1. Im Microsoft Entra Admin Center `App registrations` öffnen.
2. Neue Registrierung anlegen.
3. Unterstützte Kontotypen:
   - persönliche Microsoft-Konten
   - sowie Geschäfts- und Schulkonten
4. Unter **Authentication** eine Plattform **Single-page application** hinzufügen.
5. Als Redirect-URI die spätere HTTPS-Adresse der PWA eintragen, beispielsweise:
   `https://BENUTZERNAME.github.io/lagerverwaltung/`
6. Unter **API permissions** delegierte Microsoft-Graph-Berechtigungen hinzufügen:
   - `User.Read`
   - `Files.ReadWrite.AppFolder`
7. Die **Application (client) ID** kopieren.

## 2. Client-ID eintragen

Entweder:

- in `config.js` bei `clientId`, oder
- später direkt in der App unter **Einstellungen**.

## 3. PWA über HTTPS veröffentlichen

### GitHub Pages

1. Neues privates oder öffentliches Repository erstellen.
2. Alle Dateien dieses Ordners hochladen.
3. Unter `Settings > Pages` die Veröffentlichung aus dem Hauptzweig aktivieren.
4. Die erzeugte HTTPS-Adresse als Redirect-URI in Microsoft Entra eintragen.

Hinweis: Bei einem öffentlichen Repository ist der Quellcode öffentlich. Die Client-ID ist kein Geheimnis; ein Client-Secret darf niemals in die PWA eingetragen werden.

## 4. Installation auf Android

1. PWA-Adresse in Chrome oder Edge öffnen.
2. Menü öffnen.
3. **App installieren** beziehungsweise **Zum Startbildschirm hinzufügen** auswählen.
4. App starten.
5. Unter **Einstellungen** Technikername und Client-ID speichern.
6. Unter **OneDrive** mit Microsoft anmelden.
7. Beim ersten Gerät zunächst Daten erfassen und auf **Jetzt synchronisieren** tippen.

## Gerätewechsel

1. Auf Gerät A die App öffnen.
2. **Jetzt synchronisieren** ausführen.
3. App auf Gerät A schließen.
4. Auf Gerät B öffnen.
5. **Cloudstand herunterladen** ausführen.
6. Erst danach weiterarbeiten.

Nicht gleichzeitig auf zwei Geräten buchen.

## Datenspeicherung

Lokal:
- SQLite in IndexedDB/Browser-Speicher

OneDrive:
- `Apps/Lagerverwaltung Lovrencic/lager.db`
- `Apps/Lagerverwaltung Lovrencic/Backups/...`

## Migration aus Version 18

1. In V18 die Datei `lager.db` über den OneDrive-Ordner sichern.
2. In V19 unter **Einstellungen** die SQLite-Datei importieren.
3. Prüfen, ob Artikel und Buchungen angezeigt werden.
4. Unter **OneDrive** synchronisieren.

Die V18-Datenbankstruktur kann von der PWA nur übernommen werden, wenn sie zu den Tabellen dieser Version passt. Bei einer abweichenden Struktur ist ein gesondertes Migrationswerkzeug erforderlich.
