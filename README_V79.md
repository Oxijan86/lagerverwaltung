# Lagerverwaltung Lovrencic – Version 79.0

Stand: 25.10.2026. Enthält die PDF-/Excel-Funktionen aus V78 und die neuen Sollbestandsfilter.

## Neu in V79

- Lagerbestand: Filter **Alle Artikel / Unter Mindestbestand / Unter Sollbestand**, mit der Artikelsuche kombinierbar.
- Direkt beim Istbestand steht **Zum Soll fehlen …**. Rot bezeichnet unter Mindest, Gelb unter Soll bei erreichtem Mindestbestand; zusätzlich steht immer eine Textkennzeichnung.
- Materialanforderung: Auswahl **Unter Mindestbestand (wie bisher)** oder **Unter Sollbestand – bis Soll auffüllen**.
- Bestellmenge ist die Differenz Soll minus Ist. Ist, Soll und Mindest werden in der Vorschau gezeigt. Grenzwerte und Bestände werden durch die Auswahl nicht geändert.
- Bearbeitete Vorschlagsmengen werden beim Wechsel der Vorschlagsart erst nach Bestätigung ersetzt. Verbrauchsmaterial bleibt stehen.

Die bisherige Mindestbestandsregel erklärt das Verschwinden von Vorschlägen nach dem Absenken des Mindestbestands. Die Vorschlagsliste ist kein Archiv offener Bestellungen. Tatsächliche Änderungen eines konkreten Artikels können nur anhand der eigenen Datenbank beziehungsweise des Auditprotokolls geprüft werden.

## GitHub-Update von V77 oder V78

Das kleine Update enthält alle Programmänderungen seit V77 einschließlich der V78-Funktionen. **Nicht erst V78 installieren.**

1. Eigene Lagerdatenbank sichern.
2. `Lagerverwaltung_Lovrencic_V79_GitHub_Update.zip` entpacken.
3. Den gesamten Inhalt direkt ins Repository-Hauptverzeichnis hochladen. Vorhandene Dateien ersetzen, Ordnerstruktur von `hilfe` und `tests` beibehalten. Keinen zusätzlichen V79-Oberordner hochladen.
4. Mit **Commit changes** bestätigen und nach der GitHub-Pages-Bereitstellung die Anwendung neu laden. Im Kopf muss **79.0** stehen.

Der vorhandene vollständige V77-Ordner `vendor` bleibt unverändert verwendbar und muss nicht nochmals hochgeladen werden. Das Update enthält keine Nutzerdatenbank. Für eine Neuinstallation ist das vollständige Paket einschließlich `vendor` vorgesehen.

## Bedienung

**Suchen:** Lagerbestand → Bestandsfilter **Unter Sollbestand** → gegebenenfalls Suchbegriff eingeben. Fehlmengen sind direkt sichtbar, auch auf dem Smartphone ohne Aufklappen aller Details.

**Anfordern:** Materialanforderung → Vorschläge anhand von **Unter Sollbestand – bis Soll auffüllen** → Auswahl und Mengen prüfen → Vorschau → Export. Vor erneuter Anforderung prüfen, ob der Artikel bereits bestellt wurde. Offene Bestellmengen werden nicht automatisch verwaltet.

PDF-Entnahme und Einbuchung aus Bestell-Excel bleiben wie in V78 verfügbar; die Anleitung steht im Hilfe-Reiter.

## Prüfungen

`npm test`: 26 Tests erfolgreich (20 aus V78, 6 neue Soll-/Mindestbestandstests). `npm run test:syntax` erfolgreich. Die neuen Bedienwege wurden in Chromium auf Desktop- und Smartphone-Breite, einschließlich echtem Excel-Export, geprüft. Smartphone-Breite ist eine Browser-Simulation, kein Test auf einem realen Smartphone. Einzelheiten in `TEST_RESULTS_V79.md`.
