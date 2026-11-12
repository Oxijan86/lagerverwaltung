# Lagerverwaltung Lovrencic – Version 81.0

**Direkte GitHub-Version:** fertig bearbeitete Dateien, kein Installationsskript und kein GitHub-Actions-Workflow nötig.

## So auf GitHub hochladen

1. Die ZIP-Datei **Lagerverwaltung_Lovrencic_V81_Direktupload_GitHub.zip** herunterladen und entpacken.
2. GitHub-Repository **Oxijan86/lagerverwaltung** öffnen → **Add file → Upload files**.
3. **Alle** Dateien und Unterordner aus dem entpackten Inhalt hochladen (insbesondere `index.html`, `local_backend.js`, `sync_core.js`, `sync_merge_v81.js`, `sync_ui_v81.js`, `service-worker.js`, `manifest.webmanifest`, `hilfe/` und `tests_v81/`). Gleichnamige Dateien ersetzen, sonstige bestehende Dateien behalten.
4. **Commit changes** bestätigen. GitHub Pages aktualisiert anschließend die Anwendung. Nach Aktualisierung die App auf Smartphone/PC neu öffnen; unter Einstellungen/Dashboard muss **81.0** erscheinen.
5. Vor der ersten produktiven Nutzung **lager.db separat exportieren und sicher aufbewahren**. Beim ersten Start der V81 erzeugt die App zusätzlich ein Original-Backup des vorhandenen V80-Datenstands in ihrem lokalen Backup-Speicher.

Die zweite ZIP-Datei **Lagerverwaltung_Lovrencic_V81_Vollversion_GitHub.zip** enthält den *gesamten* Repository-Programmstand einschließlich bisheriger Bibliotheken und Vorlagen. Sie ist keine zusätzliche Installation; beim Hochladen ebenfalls erst entpacken.

## Was ist neu?

- Die Datenbank wird vor jeder Cloud-Aktion lokal gespeichert. Nach erfolgreich gespeicherten Datenänderungen bietet die App **Jetzt synchronisieren** und **Später synchronisieren** an. Mehrere schnelle Änderungen werden zu einer Erinnerung zusammengefasst.
- Sichtbarer Status im Header: **ausstehend**, **Ordnerdatei bestätigt**, **Berechtigungsfehler/Konflikt**.
- Cloud-Schreiben erst nach einer expliziten Aktion; keine stille Cloud-Übertragung beim Verlassen. Abgelaufene Ordnerfreigaben können erneut angefordert werden.
- Vor dem Überschreiben einer abweichenden gültigen Ordnerdatenbank wird eine Sicherheitskopie angelegt. Schreiben wird durch Revisionen geschützt und nach dem Speichern erneut geprüft.
- **Unterschiede vergleichen:** Artikelbestände, einzelne Buchungen und geänderte Artikelfelder gegenüberstellen. Ab V81 erhalten Buchungen und Audit-Ereignisse über Geräte hinweg eindeutige IDs. Ein Drei-Wege-Abgleich mit bestätigter gemeinsamer Ausgangsdatenbank kann sichere Ergänzungen und ausgewählte Artikeländerungen übernehmen. Ein identischer Buchungsbeleg wird nicht mehrfach übernommen.
- Wenn die gemeinsame Ausgangsversion fehlt, ein Import auf zwei Geräten doppelt durchgeführt wurde oder Inventur-/Lagerstammdaten nicht sicher zugeordnet werden können, ist die automatische Zusammenführung **gesperrt**. Es ist dann eine gesonderte manuelle Klärung nötig; keine Daten werden still überschrieben.
- CSV-Firmenimport: Absturz nach Dateivorschau behoben; Suche, Filter, 50 Zeilen pro Seite, über Seitenwechsel erhaltene Auswahl unbekannter Artikel, Warnung vor dem Verbuchen einer ganzen Bestandsliste als Einbuchung.
- Hilfetexte für die neue Synchronisierung und den Firmenimport.
- Bestehende V80-PDF-Servicebericht-Erkennung, Haupt-/Untertickets, Maschinenzuordnung, Materialneuanlage und Inventur bleiben integriert.

## Wichtige technische Grenzen

**Browser-Ordnerzugriff ist nicht mit einer OneDrive-Serverbestätigung gleichzusetzen.** Der Status „Ordnerdatei bestätigt“ zeigt an, dass `lager.db` nach dem Schreiben vom Browser erfolgreich zurückgelesen wurde. Ob und wann OneDrive diese Datei serverseitig hochlädt, kann über die bisherige File-System-API nicht bestätigt werden. Exakt gleichzeitige Dateischreibvorgänge zweier Geräte lassen sich damit nicht mit einer serverseitigen Compare-and-Swap-Garantie ausschließen. Für einen vollumfänglich abgesicherten echten Mehrgeräte-Cloudbetrieb wäre später eine direkte OneDrive-API mit Versionsbedingung erforderlich.

Eine konfliktfreie automatische Zusammenführung ist nur mit einer **bestätigten gemeinsamen Ausgangsversion auf diesem Gerät** möglich. Wenn auf PC und Smartphone schon *vor* der V81-Einführung unabhängig gebucht wurde, werden die Unterschiede angezeigt und ein unbewiesener Merge verweigert. Es gibt bewusst keinen „neuere Datenbank gewinnt“-Modus.

Artikel-Löschungen, gleichzeitige Änderungen an Inventuren/Lagern sowie widersprüchliche Importbuchungen erfordern eine gesonderte fachliche Klärung. Die App setzt bei solchen Fällen Sicherheit über Automatisierung. Für sensible oder gleichzeitige Teamnutzung sollten außerdem getrennte Benutzersitzungen und eine serverseitige Cloud-API geplant werden.

## Tests

- Node.js-Testlauf: **35 von 35 bestanden** (PDF-V80-Regression, SQLite-Migration, getrennte Buchungen, gleiche Buchungs-UUID, Konflikte, doppelter Import, Berechtigungen, unterbrochenes Schreiben, erfolgreiche Rückleseprüfung).
- Echte Chromium-Browser-UI-Tests mit simulierten Datenbank-/Cloud-Antworten: **30 Prüfungen** für Desktop/Smartphone, Dialoge und CSV-Vorschau mit 630 Zeilen.
- JavaScript-Syntaxprüfung inklusive eingebetteter HTML-Skripte bestanden.
- **Nicht** durchgeführt: produktiver End-to-End-Test mit der persönlichen OneDrive-Datei und tatsächlicher Cloud-Server-Bestätigung. Dafür sind freigegebene Geräte/OneDrive-Zugang und eine Testdatenbank erforderlich. V81 zunächst mit einer Kopie von `lager.db` durchspielen.

Siehe `TEST_RESULTS_V81.md`, `USABILITY_REVIEW_V81.md`, `hilfe/21-synchronisierung-v81.md` und `hilfe/22-csv-center-v81.md`.
