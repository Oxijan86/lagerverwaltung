# Lagerverwaltung Lovrencic V84.0 – Inventur leichter bedienen

V84 baut auf der V83-Vollversion auf und enthält alle bisherigen Programmfunktionen, PDF- und Excel-Importwege, Cloud-Synchronisierung sowie das Konfliktarchiv.

## Neu bei der Inventur
- **Zählbereich/Sortimo-Kiste vorwählen:** Lager und Lagerort einmal oben auswählen; die erste Zählung jedes Artikels übernimmt diese Zuordnung automatisch.
- **Lagerort neu anlegen:** auch direkt aus dem neuen Zählbereich heraus möglich.
- **Mehrfach zählen:** Zusätzliche Mengen zum bestehenden Zählstand addieren, ohne vor dem Abschluss weitere echte Lagerbuchungen auszulösen.
- **Schnelle Suche:** Beim Fokussieren wird der Suchtext markiert; außerdem gibt es einen X-Knopf zum Leeren.
- **Cloud-Synchronisierung während Inventur standardmäßig manuell:** keine ständigen Cloud-Abfragen; lokal wird weiter automatisch zwischengespeichert.
- **Schritt-für-Schritt-Hilfe:** Thema `30-inventur-sortimo-und-nachzaehlung-v84.md`.

## Wichtig
Eine Inventurposition hat aktuell **nur einen Ziel-Lagerort**. Wenn derselbe Artikel in mehreren Sortimo-Kisten liegt, addiert V84 die Mengen, bewahrt aber den früheren Lagerort der schon gezählten Position. Die physische Mehrfachlagerung wird nicht als getrennte Lagerortbestandsführung modelliert.

Vor GitHub-Upload die aktuelle `lager.db` exportieren. Die Anwendung zuerst mit einer **Datenbankkopie** testen. Cloud-Verbindungen und Geräte-Wechsel-Konflikte können in einem Browser-Test nur simuliert und müssen anschließend auf den eigenen Geräten geprüft werden.

Für das Hochladen `GITHUB_HOCHLADEN_V84.txt` lesen.
