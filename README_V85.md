# Lagerverwaltung Lovrencic V85.0 – Inventur-Lagerort-Schnellauswahl

V85 baut auf der vollständigen V84 auf und **enthält die bisherigen Funktionen unverändert**: Warenein- und -ausgänge, RONDO-Materialbelege, klassische Excel-Entnahme, CSV-Center, Inventur, Backups, Cloud-Synchronisierung und Konfliktarchiv.

## Was sich verbessert hat
- **Inventursuche nach Lagerort:** Neben dem bestehenden Lagerfilter ein separates Dropdown **Lagerort – Schnellauswahl**, dessen Optionen sich auf das ausgewählte Lager beschränken. Es gibt auch **Ohne Lagerort**.
- **Sortimo-Kiste mit einem Tipp filtern:** Der Button **Gewählte Sortimo-Kiste anzeigen** übernimmt den gewählten Zählbereich in die Inventursuche.
- **Neuen Lagerort direkt anlegen:** Namen im Zählbereich eingeben, Enter drücken oder **Lagerort speichern & vorwählen** wählen, Namen bestätigen. Die Anlage benötigt keinen zusätzlichen Stammdaten-Bildschirm.
- **Automatische Vorausfüllung für neue Zählungen:** Ungezählte Artikel zeigen den Zählbereich bereits vor dem ersten Zählen als Vorschlag, selbst wenn ihr alter Lagerort leer ist. Erst beim Zählen wird die Zuordnung im Inventur-Zwischenstand gesichert.
- **Artikelnummer trotz Filter finden:** Eine exakt eingegebene Artikelnummer findet den Artikel auch dann, wenn sein bisheriger Lagerort außerhalb des Filters liegt. Eine manuelle Lagerortauswahl bei einem Artikel geht der globalen Vorwahl vor.
- **Bisherige V84-Funktionen erhalten:** Mengen nachzählen, lokale Autospeicherung, Cloud-Abgleich während Inventur auf Wunsch, Konfliktschutz und Smartphone-Hilfe.

## Wichtig zu Beständen
Beim bloßen Suchen wird keine Buchung ausgeführt und kein Artikelstamm geändert. Erst der **Inventurabschluss** übernimmt bestätigte Mengen und den Zähl-Lagerort in die Lagerverwaltung. Eine Inventurposition hat weiterhin nur **einen** Ziel-Lagerort; Mehrfachlagerung eines Artikels in verschiedenen Sortimo-Kisten wird nicht als getrennte Teilbestandsführung abgebildet.

## Test und Bereitstellung
- Automatisierte JavaScript-Funktionstests und Chromium-Smoke-Tests mit nachgebildeten Inventurdaten. Sie überprüfen unter anderem Lagerortfilter, Suche, neue Lagerorte, Vorausfüllung, Erstzählung und Nachzählung auf Smartphone- und PC-Bildschirmgröße.
- Kein Test mit der produktiven `lager.db` oder deinem echten OneDrive durchgeführt.
- Vor der Aktualisierung **lager.db exportieren** und V85 zunächst mit einer Testdatenbank kontrollieren.
- `Lagerverwaltung_Lovrencic_V85_Direktupload_GitHub.zip` vollständig entpacken und die **Dateien mit Ordnerstruktur** ins bestehende Repository hochladen. Gleichnamige Dateien ersetzen, übrige Dateien nicht löschen. Kein Installer und kein Workflow nötig.

Schritt-für-Schritt: **Hilfe → Inventur – Lagerort per Schnellauswahl filtern und direkt vorwählen (V85)**.
