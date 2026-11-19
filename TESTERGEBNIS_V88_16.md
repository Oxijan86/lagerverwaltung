# V88.16 – Testergebnis

**Automatisierte Tests:** `node --test test_v88_*.cjs` – 126 bestanden, 0 fehlgeschlagen.

## Original-RONDO-PDF

Prüfling: `Inventurliste Lovrencic 1025.pdf`, 72 Seiten, geprüfte SHA256 `a3f457120746435d4a0d8b81b4f808e6a122b448353c91de6d291cdcf16aa29b`.

- Neue Testausgabe enthält exakt die unberührten ursprünglichen PDF-Bytes als Binärpräfix plus inkrementelle Überlagerung.
- Alle 72 Seiten bleiben erhalten.
- Alle Seiten besitzen weiterhin die vier Original-Bildobjekte je Seite.
- Seite 4 / Pos. 6: nach bestätigter manueller Zuordnung erscheint die Testmenge `2` links vor `ST`, Tabellen, Firmenkopf, Logo, Artikelnummern und Seitenlayout bleiben sichtbar.
- Die von der Anwendung des Nutzers fehlerhaft exportierte Datei mit 1.191.406 Bytes ist strukturell erkennbar eine alte Rasterausgabe (1 statt 4 Bilder pro Seite). Eine solche Ausgabe darf nicht mehr freigegeben werden.
- Die Testmenge 2 ist eine Simulation; der ZIP-Upload enthält keine Nutzerdateien und setzt keinerlei Inventurbestände.

## OCR/I-gegen-1

- I1000339 und 11000339 werden nicht automatisch gleichgesetzt.
- Im Prüffall mit originalem I1000339, gezählten 2 Stk. und falsch erzeugtem 11000339 ohne Zählung wird der bereits gezählte I-Artikel angeboten und kann manuell für die PDF bestätigt werden.
- Formal gültige, aber der Katalogreferenz widersprechende Nummern werden bis zur manuellen Freigabe nicht gedruckt.
- Bereits als zugeordnet geltende Positionen bleiben über eine Checkbox manuell auswählbar.
- Die manuelle Zuordnung kann jeweils nur eine Position ändern; weitere Positionen bleiben unverändert.

## Sichere Zählungsübertragung als Alternativfall

- Im Mock-Integrationstest wird ein ausdrücklich bestätigter Zählstand von 2 Stück bei unveränderter Buchbestandsverteilung (3 Stück / 0 Stück) zwischen Artikel-IDs übertragen.
- Vorher Backup-Aufruf; SQL-Transaktion, Versionsänderung, Audit und Persistierung geprüft.
- Konkurrenz-/Versionsfehler, erneute Übertragung sowie fehlende Ziel-/Quellwerte werden abgewiesen.
- Keine Lagerbestands- oder Bewegungsbuchung in der Migrationsroutine.

**Einschränkungen:** Ein vollständiger interaktiver Chromium-Praxistest in der beim Nutzer installierten PWA und die Änderung der echten lokalen `lager.db` wurden bewusst nicht durchgeführt. Die Backend-Migration wurde auf einer Mock-Datenstruktur getestet, nicht auf der produktiven Nutzerdatei; keine produktive Datenbank wurde verändert.
