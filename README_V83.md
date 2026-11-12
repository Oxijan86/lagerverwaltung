# Lagerverwaltung Lovrencic V83.0 – GitHub-Direktupload

## Installation
1. Vorher die aktuelle `lager.db` **aus der Anwendung exportieren** und eine Kopie sicher ablegen.
2. `Lagerverwaltung_Lovrencic_V83_Direktupload_GitHub.zip` entpacken.
3. **Die entpackten Dateien und Unterordner** in das bestehende Repository `Oxijan86/lagerverwaltung` hochladen. Gleichnamige Dateien ersetzen, übrige vorhandene Dateien NICHT löschen.
4. GitHub Pages-Veröffentlichung abwarten und die App neu starten. V83.0 muss im Dashboard angezeigt werden.
5. Die Materialbelegfunktion mit einer **Testdatenbank** prüfen, bevor produktive Buchungen vorgenommen werden.

Die Direktupload-Dateien enthalten alle seit dem GitHub-V80-Stand erforderlichen Änderungen einschließlich V81 und V82. Es ist kein Installationsskript erforderlich.

## Änderungen
- **Materialbuchungsbeleg aus PDF/JPG/PNG:** SAP/RONDO-Materialbelegnummer, Datum, Positionen und Mengen mit OCR bei Bildern/scannierten PDFs, immer Vorschau und verpflichtende Benutzerbestätigung. Materialanforderungen werden als falscher Belegtyp zurückgewiesen.
- **Buchungsrichtung:** Bei SAP-Umlagerung zum Ziel `1010/1025` wird **Einbuchung** vorgeschlagen (nicht pauschal Entnahme). Der Benutzer kann die Richtung nach eigener Prüfung auswählen.
- **Eindeutigkeit:** Buchungen nach Materialbelegnummer einschließlich Jahr und Positionsnummer gegen wiederholte Verarbeitung gesichert. Eine abweichend erneut importierte Position wird blockiert.
- **Klassische Excel-Entnahme:** Unter **Stammdaten → Sonderfunktionen (klassisch)** verfügbar; übernimmt Artikelnummer/Menge in dieselbe geprüfte Buchungsvorschau.
- **Artikel-Schnelllinks:** Materialanforderung und Dashboard öffnen den richtigen Artikel direkt im Lagerbestand.
- **Inventur:** Lagerorte im regulären Feld eintippen und nach Rückfrage direkt als Stammdatensatz anlegen.
- **Cloud-Synchronisierung:** Nach jeder lokalen Änderung wird bei bestehender Berechtigung ein sicherer Cloud-Abgleich versucht. Konflikte sperren das Schreiben, der bestehende V81/V82-Vergleich bleibt erhalten. Bei erneuter Freigabe kann die Synchronisierung wieder gestartet werden.
- **Status:** Nach manueller Synchronisierung erneute Lesung der verbundenen Ordnerdatei und Abgleich der Datenbankrevision. Weitere während des Schreibens entstandene lokale Änderungen bleiben sichtbar und werden nachgeprüft.
- **Hilfe:** Zusätzliche Schritt-für-Schritt-Seiten zu SAP-Materialbelegen, klassischer Excel-Entnahme, Cloud und Inventur.

## Einschränkungen
- Eine `lager.db` im lokal synchronisierten OneDrive-Ordner erlaubt keine **serverseitige Sperre/Compare-and-Swap**. Der erfolgreiche Dateischreib- und Lesevorgang im verbundenen Ordner bestätigt **nicht**, dass OneDrive die Datei schon an den Server übertragen hat. Deshalb gleichzeitiges Bearbeiten auf mehreren Geräten möglichst vermeiden; bei Konflikten nicht erzwingen, sondern vergleichen.
- Die Extraktion handschriftlich markierter Fotos ist OCR-abhängig. Die Abbildung des vom Benutzer hochgeladenen SAP-Belegs wurde visuell geprüft; ein vollständiger OCR-Test der beiden echten JPG-Seiten mit derselben Browserkonfiguration ist **nicht** durchgeführt worden. Alle Mengen, Artikelnummern, Buchungsrichtung und Einheiten vor Buchung manuell prüfen.
- Testläufe benutzen simulierte Cloud- und PDF-Leseantworten sowie SQL-Testdaten. Sie sind **keine** produktive Ende-zu-Ende-Freigabe deines tatsächlichen OneDrive-Ordners.
- Bei einer klassischen Excel-Entnahme muss die Datei die Spalten Artikelnummer/Material und Menge enthalten.

## Datensicherheit
Vor jedem Materialbeleg-Batch wird ein Sicherheitsbackup erstellt. Buchungen werden transaktional mit eindeutigen Synchronisationskennungen und einem Import-Positionsregister gespeichert. Lokale Buchungen sind unabhängig von der Cloud-Verbindung möglich. Unklare Revisionen/Parallelkonflikte dürfen nicht still überschrieben werden.
