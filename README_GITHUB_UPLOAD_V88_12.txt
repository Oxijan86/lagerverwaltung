LAGERVERWALTUNG LOVRENCIC – VERSION 88.12
=========================================
KORREKTUR: BLOCKIERTE INVENTUR-ZWISCHENSPEICHERUNG / DEZIMALMENGEN

BETRIFFT DIE AM 19.11.2026 FESTGESTELLTE FEHLERKETTE
- Artikel 13496, „Rohr PU 4050 10/8 …“ war mit Einheit „Stk.“ hinterlegt.
- Gleichzeitig lag ein ungespeicherter Zaehlwert von „4,7“ in einer lokalen
  Wiederherstellungskopie. Hierdurch wurde die Inventur-Speicherung abgelehnt.
- Eine zweite gueltige Eingabe blieb dadurch bislang ebenfalls ungespeichert.

NEU V88.12
1) Vor jeder Speicherung prueft die App jede offene Inventurposition
   einschliesslich Menge und Lagerort-Teilmengen und nennt die konkrete
   ARTIKELNUMMER, BEZEICHNUNG, EINHEIT und fehlerhafte EINGABE.
2) Fehlerhafte Eingaben werden NICHT stillschweigend geloescht oder eingebucht.
   Gueltige andere Artikel werden separat als Inventur-Zwischenstand gespeichert.
   Die fehlerhaften Eingaben bleiben in der lokalen Wiederherstellungskopie.
3) Bei blockierter Menge: Schaltflaeche „Nur diese ungueltige Zaehlung
   zuruecksetzen“ nur nach ausdruecklicher Bestaetigung. Zuerst wird die
   lokale JSON-Sicherung zum Download angeboten. Andere Artikel bleiben.
4) Eingabe '4,7' und '4.7' bei einer tatsaechlichen METER-Einheit wie 'm'
   wird akzeptiert, ebenso Meter-Teilmengen je Lagerort. Bei 'Stk.' bleibt
   die Ganzzahlpruefung aktiv. Die APP AENDERT EINE EINHEIT NICHT AUTOMATISCH.
   Wenn ein Rohr tatsaechlich in Metern verwaltet wird, muss der Artikelstamm
   gesondert bewusst auf 'm' berichtigt werden. BESTAENDE WERDEN DABEI
   NICHT DURCH DIESE NEUE VERSION UMGEDEUTET.
5) Der bekannte JavaScript-Fehler 'syncStatus is not defined' wird im
   Seitenstart abgefangen; bestehende Speicherfunktionen werden nicht
   durch den fehlenden globalen Statusaufruf unterbrochen.
6) V88.11: gesicherter Erstlagerort, getrennte Teilmengen, geschuetzte
   Zaehlwerte und bewusste Korrekturen bleiben erhalten.
7) V88.7 ff.: RONDO-PDF-Originalseiten, 72-Seiten-Import, sicherer PDF-Export,
   Technikerhinweis und Schutz einer laufenden Inventur bleiben erhalten.

INSTALLATION (GITHUB PAGES)
1. LOKALE INVENTURDATEN UNBEDINGT BEHALTEN. Weder Browserdaten noch die
   IndexedDB oder lager.db loeschen. Bei vorhandenen ungespeicherten
   Inventureingaben zuerst „Lokale Eingaben herunterladen“ verwenden.
2. ZIP entpacken, darin enthaltene Dateien unveraendert ins Hauptverzeichnis
   https://github.com/Oxijan86/lagerverwaltung hochladen:
   GitHub > Add file > Upload files > Commit changes.
3. Die bisherige Datenbank/Lagerdatei nicht durch Dateien des ZIP ersetzen.
   Das ZIP enthaelt keine lager.db.
4. GitHub-Pages-Version vollstaendig neu laden. Bei installierter PWA ggf.
   App vollstaendig schliessen und erneut oeffnen. Falls noch 88.10/88.11
   angezeigt wird, einmal erneut starten. Browserdaten NICHT loeschen.
5. Erst weiterarbeiten, wenn in der App Version 88.12 angezeigt wird.

PRODUKTIVER TEST OHNE ABSCHLUSS
- Inventur vom 12.11.2026 erneut oeffnen. Prüfen, dass bisherige
  gezaehlte Positionen noch vorhanden sind.
- Bei noch vorhandenem Fehler im gespeicherten lokalen Entwurf erscheint
  Artikel 13496 mit ungueltiger Menge '4,7' bei Einheit 'Stk.'.
- Erst Sicherung herunterladen; danach nur den konkreten fehlerhaften
  Zaehlwert mit ausdruecklicher Bestaetigung korrigieren/zuruecksetzen.
- Ein echter Meterartikel mit Einheit 'm' akzeptiert z.B. 4,7.
- Beim Transportband mit zwei Fundorten die beiden Teilmengen pruefen.
- Auch ein PDF-Zwischenstand darf keinen Inventurabschluss ausloesen.

TESTSTATUS
82/82 automatisierte Tests bestanden am 19.11.2026. Realer PDF-Hash:
a3f457120746435d4a0d8b81b4f808e6a122b448353c91de6d291cdcf16aa29b.
Vorlagenumfang 72 Seiten, 719 Materialpositionen.
Ein zusaetzlicher Chromium-End-to-End-Test konnte wegen einer Browser-
Startstoerung in der Testumgebung NICHT abgeschlossen werden.
Test auf dem produktiven Smartphone/Browser bleibt erforderlich.
