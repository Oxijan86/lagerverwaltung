/* Materialanforderung Mengenfix V50: Mengenspalte ohne Einheit (ST/St./stk.). */

(function(){
const nativeFetch=window.fetch.bind(window);
const DBKEY='lv22-db', METAKEY='lv22-meta', HANDLEKEY='lv22-directory', BACKUPKEY='lv22-backups', SESSIONKEY='lv34-session-start', SYNCBASEKEY='lv81-confirmed-cloud-base';
let SQL,db,handle=null,autoTimer=null,deviceStorageModeCache='',pendingDeliveryPersistence='';
const SyncCore=window.LVSyncCore;
const SyncMerge81=window.LVSyncMerge82||window.LVSyncMerge81;
if(!SyncMerge81)throw new Error('sync_merge_v81.js wurde nicht geladen.');
const AppRules=window.LVAppRules;
const AuthCore=window.LVAuthCore;
const TxCore=window.LVTransactionCore;
const V67Core=window.LVV67Core;
const V69Core=window.LVV69Core;
if(!AuthCore)throw new Error('auth_core.js wurde nicht geladen.');
if(!TxCore)throw new Error('transaction_core.js wurde nicht geladen.');
if(!V67Core)throw new Error('v67_core.js wurde nicht geladen.');
if(!V69Core)throw new Error('v69_core.js wurde nicht geladen.');
const adminSessions=AuthCore.createSessionManager();
if(!SyncCore)throw new Error('sync_core.js wurde nicht geladen.');
if(!AppRules)throw new Error('app_rules.js wurde nicht geladen.');
const helpData={"00-erste-schritte.md":"# Erste Schritte – Lagerverwaltung V82\n\nDiese Hilfe führt dich **Schritt für Schritt** durch die gesamte Lagerverwaltung. Auf dem Smartphone: **☰ Menü** öffnen und nach unten zu **❓ Hilfe** scrollen. In der Hilfe kannst du nach Begriffen wie `Excel`, `PDF`, `Kunde`, `Löschung` oder `Konflikt` suchen.\n\n## Erster Start\n1. App öffnen und vorhandene Datenbank auswählen oder eine neue Datenbank einrichten.\n2. Wenn du bereits die Datei `lager.db` hast, **nicht versehentlich eine neue leere Datenbank erstellen**.\n3. Speicherort prüfen: Browser-Speicher, lokaler Ordner oder Cloud-Synchronisationsordner.\n4. Bei Cloud-Nutzung den bekannten Ordner wählen und Zugriff erlauben.\n5. Artikelzahl und Buchungszahl im **Dashboard** mit dem erwarteten Stand vergleichen.\n6. Unter **Backups** eine Sicherung erstellen, bevor du viele Änderungen vornimmst.\n\n## Welche Funktion soll ich wählen?\n- **Einbuchung:** erhaltene Ersatzteile ins Lager aufnehmen.\n- **Entnahme:** tatsächlich verbaute oder entnommene Ersatzteile ausbuchen.\n- **CSV-Center:** Firmenbestandsliste aus SAP (`SAPUI5-Export`) als Inventur vergleichen oder als Zugang importieren.\n- **Einbuchung → Bestell-Excel:** eine ausgefüllte Materialanforderung als erhaltene Lieferung buchen.\n- **Entnahme → Servicebericht-PDF:** Ersatzteile aus einem RONDO-Servicebericht übernehmen.\n- **Inventur:** real gezählte Bestände mit dem Lager vergleichen.\n- **Dateisynchronisierung:** lokale Änderungen mit dem verbundenen Ordner vergleichen und übertragen.\n- **Konfliktarchiv:** Änderungen aus verschiedenen Datenständen prüfen und gegebenenfalls nachträglich übernehmen.\n\n## Ganz wichtig: Smartphone und PC\n1. Vor dem Gerätewechsel auf dem ersten Gerät **Jetzt synchronisieren** wählen.\n2. Auf dem zweiten Gerät nach dem Start den Cloud-Datenstand prüfen.\n3. Bei einem Konflikt niemals unüberlegt **Cloud-Stand überschreiben**.\n4. Stattdessen **Unterschiede vergleichen** und die abweichenden Buchungen prüfen.\n\nSiehe auch **Daten importieren – Übersicht**, **Synchronisierung und Gerätewechsel**, **Konfliktarchiv** und **Fehler beheben**.\n","01-dashboard.md":"# Dashboard – Überblick\n\n## So verwendest du das Dashboard\n1. **Dashboard** im Menü auswählen.\n2. Oben aktive Artikel, Unterbestand, heutige Buchungen und die gesamte Buchungszahl kontrollieren.\n3. **Artikel unter Mindestbestand** prüfen und bei Bedarf **Alle anzeigen** nutzen.\n4. **Häufigste Entnahmen** und **Letzte 20 Buchungen** kontrollieren.\n5. In der Systeminformation die angezeigte **Programmversion** prüfen.\n6. In der Kopfzeile auf den **Synchronisierungsstatus** achten; Gelb bedeutet offene Änderungen, Rot einen Fehler oder Konflikt.\n\n## Wenn Zahlen unerwartet sind\n1. Unter **Buchungen** nach Artikel und Datum filtern.\n2. Den letzten Import beziehungsweise eine Korrektur prüfen.\n3. Bei Gerätewechsel zuerst **Dateisynchronisierung → Unterschiede vergleichen** öffnen.\n4. Nicht den Bestand direkt korrigieren, solange ein Datenkonflikt ungeklärt ist.\n","02-neues-material.md":"# Neues Material anlegen\n\n## Schritt für Schritt\n1. Im Menü **Neues Material** wählen.\n2. **Artikelnummer** eingeben; die App prüft, ob sie bereits vorhanden ist.\n3. **Bezeichnung** ergänzen und korrekte **Einheit** wählen, beispielsweise `Stk.` oder `Liter`.\n4. **Ausgangsbestand** eingeben: nur die Menge, die tatsächlich neu aufgenommen werden soll. `0` ist für einen zunächst leeren Artikel erlaubt.\n5. **Sollbestand** und **Mindestbestand** festlegen. Der Mindestbestand darf nicht größer als der Sollbestand sein.\n6. **Lager** und gegebenenfalls **Lagerort** auswählen. Neue Lagerorte lassen sich ergänzen.\n7. Optional eine oder mehrere **Maschinen** zuordnen, Hersteller, Lieferant, Barcode und Bemerkung erfassen.\n8. **Material speichern** wählen und die Erfolgsmeldung abwarten.\n9. Unter **Lagerbestand** prüfen, ob Artikel und Bestand korrekt erscheinen.\n10. Die anschließende **Cloud-Synchronisierungsabfrage** bearbeiten oder bewusst auf später setzen.\n\n## Häufiger Fehler\nEine Anfangsmenge wird bereits als Bestand berücksichtigt. Dieselbe Lieferung nicht zusätzlich ein zweites Mal als Einbuchung erfassen.\n\n## Unbekannter Artikel beim PDF- oder CSV-Import\nNutze möglichst die Funktion **Neues Material registrieren** beziehungsweise **Anlegen** direkt im Import. Artikelnummer und Beschreibung werden dann aus der Vorlage übernommen.\n","03-lagerbestand.md":"# Lagerbestand – suchen, filtern und anpassen\n\n## Artikel finden\n1. Menü **Lagerbestand** öffnen.\n2. In die Suche Artikelnummer, Beschreibung, Lagerort oder Maschine eingeben.\n3. Auf dem Smartphone einen passenden Treffer antippen.\n4. Mit **Bestandsfilter** zwischen **Alle Artikel**, **Unter Mindestbestand** und **Unter Sollbestand** wechseln.\n5. Auf dem Smartphone **Details anzeigen** öffnen, um alle Felder des Artikels zu sehen.\n\n## Mindestbestand und Sollbestand ändern\n1. Gewünschten Artikel suchen.\n2. Gegebenenfalls **Details anzeigen** öffnen.\n3. Soll- und/oder Mindestbestand ändern.\n4. Über **Speichern** oder **Alle Änderungen speichern** übernehmen.\n5. Die Erfolgsmeldung prüfen und anschließend den Synchronisierungsstatus beachten.\n\n## Lagerort und Maschine\n1. Beim Artikel Lager, Lagerort oder Maschinenzuordnung bearbeiten.\n2. Neue Lagerorte bei Bedarf über **Lager / Lagerorte verwalten** anlegen.\n3. Änderung speichern; sie beeinflusst normalerweise **nicht** die Stückzahl.\n\n## Achtung bei Sammelaktionen\nDie Schaltflächen **Sollbestand aus Istbestand übernehmen** usw. gelten für **alle aktiven Artikel**, nicht nur für die aktuell sichtbaren Suchtreffer. Vor Verwendung unbedingt die Bestätigung prüfen.\n\nIstbestand wird aus Ausgangsbestand und der Buchungshistorie gebildet. Bestandsdifferenzen bei zwei Geräten nicht vorschnell durch manuelle Korrekturen ausgleichen.\n","04-einbuchung.md":"# Einbuchung – Ersatzteile ins Lager aufnehmen\n\n## Manuelle Einbuchung\n1. Menü **Einbuchung** öffnen.\n2. Artikel über Suche oder Auswahlliste auswählen.\n3. Erhaltene **Menge** eingeben; sie muss größer als 0 sein.\n4. Bei Bedarf **+ Position** wählen, um weitere Artikel einzubuchen.\n5. Datum, Techniker und weitere Angaben wie Lieferschein prüfen.\n6. **Einbuchung bestätigen** wählen.\n7. Die Buchungsbestätigung und den neuen Lagerbestand kontrollieren.\n8. Bei der Synchronisierungsabfrage **Jetzt synchronisieren** oder **Später synchronisieren** auswählen.\n\n## Lieferung aus einer Bestell-Excel einlesen\n1. Im Abschnitt **Lieferung aus Bestell-Excel oder M365 einbuchen** die Materialanforderungsdatei `.xlsx` auswählen.\n2. **Bestell-Excel einlesen** wählen.\n3. Die gelesenen Artikel, Mengen und Beschreibungen mit der tatsächlichen Lieferung vergleichen.\n4. Fehlende Artikel gegebenenfalls registrieren und falsche Positionen korrigieren.\n5. **Extraktion jetzt prüfen** und danach **Geprüfte Lieferung einbuchen** wählen.\n6. Anschließend in **Buchungen** kontrollieren, was tatsächlich gebucht wurde.\n\n## Wichtiger Sicherheitshinweis\nEine angeforderte Menge ist nicht automatisch eine gelieferte Menge. Nur erhaltenes Material einbuchen. Wird dieselbe Lieferung erneut geöffnet, zuerst prüfen, ob der Vorgang schon verarbeitet wurde. **Als neuen Vorgang starten** kann eine bewusste erneute Buchung erlauben.\n\nWeitere Details unter **Daten importieren – Übersicht** und **Bestell-Excel importieren**.\n","05-entnahme.md":"# Entnahme – Material aus dem Lager buchen\n\n## Manuelle Entnahme\n1. **Entnahme** im Menü öffnen.\n2. Artikel suchen und die tatsächlich entnommene Menge eingeben.\n3. Weitere Artikel mit **+ Position** ergänzen.\n4. **Kunde**, **Maschine**, **Techniker**, Datum und gegebenenfalls Ticket-/Lieferscheininformationen eintragen, sofern verfügbar.\n5. **Entnahme bestätigen** wählen.\n6. Die Bestätigung und die letzten Entnahmen prüfen.\n7. Nach der lokalen Speicherung die Cloud-Synchronisierung bestätigen oder später nachholen.\n\n## Ersatzteile aus einem Servicebericht\n1. In **Entnahme** zum Bereich **RONDO-Servicebericht direkt aus PDF importieren** gehen.\n2. Die PDF-Datei auswählen und **Ausgewählte PDFs auslesen** wählen.\n3. Erkannte Haupt- und Untertickets sowie Kunde, Maschine und Artikel kontrollieren.\n4. Unbekannte Ersatzteile vor der Entnahme registrieren oder bewusst ignorieren.\n5. Eindeutige Positionen auswählen; bereits gebuchte Positionen dürfen nicht erneut gebucht werden.\n6. **Vorschau / Bestände aktualisieren** und danach **Geprüfte Materialien entnehmen** verwenden.\n\n## Alternative: M365/Copilot\nBei schwer lesbaren PDFs kannst du den vorbereiteten **Copilot-Prompt anzeigen** und extrahierte Daten in den vorhandenen Textimport kopieren. Prüfe besonders Mengen, Artikelnummern und Kundenzuordnung.\n\nBei negativen Beständen, einem unbekannten Artikel oder einem unklaren Kunden niemals einfach bestätigen. Siehe **PDF-Servicebericht importieren**.\n","06-materialanforderung.md":"# Materialanforderung erstellen\n\n## Schritt für Schritt\n1. Menü **Materialanforderung** öffnen.\n2. **Bestellvorschläge laden** wählen.\n3. Prüfen, ob nach Mindestbestand oder Sollbestand aufgefüllt werden soll.\n4. Vorgeschlagene Artikel und Mengen kontrollieren; bei Bedarf Mengen bearbeiten.\n5. **Vorschau prüfen** wählen und das Ergebnis kontrollieren.\n6. **Materialanforderung exportieren** wählen, um die Excel-Datei zu erhalten.\n7. Optional unter **Exportordner Materialanforderung** einen Ordner verbinden.\n\n## Verbrauchsmaterial ohne Artikelnummer\n1. Unter **Verbrauchsmaterial ohne Artikelnummer** Beschreibung und Einheit erfassen.\n2. **Verbrauchsmaterial anlegen** wählen.\n3. Danach **Zur Materialanforderung hinzufügen** verwenden.\n\nEine Materialanforderung ist **keine Lagerbuchung**. Erst wenn Material tatsächlich ankommt, unter **Einbuchung** buchen. Die exportierte Excel-Datei kann dort wieder eingelesen werden.\n","07-csv-center.md":"# CSV-Center – Firmenliste importieren und exportieren\n\n## Welcher Import ist richtig?\n- **Inventur / Bestandsabgleich:** Die Spalte `Frei verwendbar` ist der **gesamte gezählte bzw. gemeldete Bestand**. Die App berechnet die Differenz zum Istbestand.\n- **Einbuchung:** Die Spalte `Frei verwendbar` ist die **neu eingegangene Menge**, die zusätzlich ins Lager gebucht wird.\n\n**Achtung:** Eine vollständige SAP-Bestandsliste darf normalerweise **nicht** als Einbuchung importiert werden. Sonst könnte der vorhandene Bestand nochmals aufaddiert werden.\n\n## Firmenliste aus SAP Schritt für Schritt einlesen\n1. Menü **CSV-Center** öffnen und **Firmenliste importieren** suchen.\n2. Die passende **Importart** wählen: meistens **Inventur / Bestandsabgleich** für eine Bestandsliste.\n3. **Techniker** auswählen und bei Bedarf den **internen Lagerort** für neue Artikel einstellen.\n4. Eine `.xlsx`-, `.csv`- oder `.txt`-Datei auswählen.\n5. Die App liest die Datei ein und zeigt eine **Vorschau**, ohne bereits Lagerbestände zu ändern.\n6. Im Vorschaufilter **Alle**, **Änderungen**, **Neue Artikel**, **Fehler** oder **Bereits verarbeitet** wählen; mit der Suche eine bestimmte Artikelnummer oder Bezeichnung suchen.\n7. Bei unbekannten Artikeln einzeln **Anlegen** oder **Ignorieren** wählen. Alternativ **Alle unbekannten Artikel auf Anlegen stellen** und einzelne Ausnahmen zurückstellen.\n8. Bei jeder Bestandsabweichung **App-Bestand**, **Dateimenge** und **geplante Änderung** vergleichen. Auch die weiteren Seiten durchsehen.\n9. Wenn Fehler angezeigt werden, diese zuerst in der Quelldatei beheben und erneut prüfen.\n10. Erst danach **Geprüften Vorgang bestätigen** wählen. Bei Inventurkorrekturen kann eine Admin-Freigabe erforderlich sein.\n11. Buchungsanzahl und Erfolgsmeldung prüfen. Unter **Buchungen** kontrollieren und die Cloud-Synchronisierung durchführen.\n\n## Die erwarteten Spalten\nDie Firmenvorlage besitzt im Blatt **SAPUI5-Export** diese fünf Überschriften:\n\n`Material;Bezeichnung zum Material;Lagerort;Bezeichnung des Lagerorts;Frei verwendbar`\n\n- `Material` ist die Artikelnummer. Führende Nullen müssen erhalten bleiben.\n- `Bezeichnung zum Material` ist die Artikelbeschreibung.\n- `Lagerort` und `Bezeichnung des Lagerorts` sind die Firmenangaben; sie sind nicht automatisch identisch mit deinem internen Lagerplatz.\n- `Frei verwendbar` ist im Inventurmodus der absolute Bestand, im Einbuchungsmodus die Zugangsmenge.\n\n## Exportieren\n1. Unter **Firmenexport** Firmen-Lagerort und Bezeichnung prüfen, gegebenenfalls **Firmenfelder speichern**.\n2. **Lagerbestand für Firma (CSV)** oder **Lagerbestand für Firma (XLSX)** wählen.\n3. Unter **Weitere CSV-Exporte** bei Bedarf normalen Bestand, Einbuchungen, Entnahmen oder Inventurliste herunterladen.\n\n## Doppelimport vermeiden\nDie App merkt sich bereits verarbeitete Importpositionen. **Als neuen Vorgang starten** umgeht bewusst die bisherige Vorgangskennung und darf nur verwendet werden, wenn eine tatsächlich neue Lieferung oder Erfassung vorliegt.\n\nDie Bereiche **Erweiterter Textimport** und **Legacy-Inventur** sind noch für ältere Datenformate vorhanden. Für die fünfspaltige Firmenliste den modernen Firmenlistenimport verwenden.\n","07-materialanforderung.md":"# Materialanforderung – Zusatzfunktionen\n\n## Bestellvorschläge nachprüfen\n1. Menü **Materialanforderung** öffnen.\n2. Zwischen der Auffüllung zum **Mindestbestand** und zum **Sollbestand** unterscheiden.\n3. Erfasste Mengen vor dem Export prüfen.\n4. Die Excel-Datei exportieren und die Anforderung versenden.\n5. Beim Wareneingang zur **Einbuchung** wechseln und die erhaltene Menge tatsächlich buchen.\n\n**Wichtig:** Ein abgesenkter Mindestbestand lässt einen Artikel möglicherweise aus den Mindestbestandsvorschlägen verschwinden. Mit dem Filter **Unter Sollbestand** im Lagerbestand findest du ihn weiterhin.\n","08-historie.md":"# Buchungshistorie – Buchungen finden und berichtigen\n\n## Buchungen kontrollieren\n1. Menü **Buchungen** öffnen.\n2. Nach Zeitraum, Buchungsart, Artikelnummer, Beschreibung, Kunde, Maschine oder Techniker filtern.\n3. **Filtern** wählen.\n4. Die Buchungen mit Mengen, Datum, Kunden und Bemerkungen kontrollieren.\n5. Bei Bedarf **Gefilterte Buchungen als CSV** exportieren.\n\n## Buchung korrigieren oder löschen\n1. Die betroffene Buchung anhand von Artikel, Datum und Kunde eindeutig identifizieren.\n2. Die angebotene Bearbeitungs- bzw. Löschaktion wählen.\n3. Admin-Freigabe beachten und die angezeigten alten und neuen Werte genau vergleichen.\n4. Sicherheitsabfrage bestätigen und Ergebnis prüfen.\n5. Eine Löschung kann den Bestand verändern. Bei abweichenden Geräten anschließend **Unterschiede vergleichen** öffnen.\n\nV82 protokolliert Löschungen und zugehörige Informationen, damit entfernte Buchungen bei einem Konflikt erkannt und nicht unbemerkt wiederhergestellt werden.\n","09-stammdaten.md":"# Stammdaten verwalten\n\n## Schritt für Schritt\n1. Menü **Stammdaten** öffnen.\n2. Wenn erforderlich **Stammdaten freischalten** wählen und Administratorberechtigung eingeben.\n3. Im passenden Bereich einen **Lagerort**, eine **Maschine** oder einen **Techniker** ergänzen.\n4. Vor dem Anlegen auf ähnliche bestehende Einträge achten, damit keine Dubletten entstehen.\n5. **Speichern** wählen und die neue Bezeichnung kontrollieren.\n6. Bei Maschinen können **alternative Bezeichnungen** einer vorhandenen Maschine zugeordnet werden.\n7. Bereits doppelt angelegte Maschinen über die Zusammenführungsfunktion nur nach Prüfung verbinden.\n8. Im Bereich **Gesamte Lagerliste bearbeiten** Änderungen an mehreren Artikeln mit **Alle Änderungen speichern** übernehmen.\n9. Nach Änderungen die Cloud synchronisieren.\n\n## Weitere Einstellungen\n- Unter **Datumsformat** Anzeigeformat wählen und speichern.\n- Unter **Passwortverwaltung** Administratorkennwort kontrolliert ändern.\n- **Lagerverwaltung vollständig zurücksetzen** löscht Daten; vorher vollständige `lager.db`-Sicherung erstellen.\n\nBei einem Stammdatenkonflikt zwischen PC und Smartphone keine Seite blind überschreiben: alten und neuen Wert im Konfliktarchiv vergleichen.\n","10-audit.md":"# Audit-Protokoll – Änderungen nachvollziehen\n\n## Schritt für Schritt\n1. Menü **Audit** öffnen.\n2. Datum, Benutzer, Aktion und Objekt prüfen.\n3. Bei einer Buchung im Detail Artikel, Menge, Kunde, Maschine, Ticket und Quelle vergleichen.\n4. Bei Korrekturen oder Löschungen auf die dokumentierten Unterschiede achten.\n5. Bei abweichenden Geräten zusätzlich **Dateisynchronisierung → Konfliktarchiv** öffnen.\n\nDas Audit-Protokoll ist keine eigenständige Inventur und ersetzt nicht die Buchungshistorie. Es zeigt, **wer was verändert hat**.\n","10-reset.md":"# Datenbank zurücksetzen – nur im Ausnahmefall\n\n## Sichere Vorgehensweise\n1. Vorher **Backups → Backup jetzt erstellen** wählen.\n2. Zusätzlich **lager.db herunterladen** und die Datei separat aufbewahren.\n3. Unter **Stammdaten** Administratorzugriff freischalten.\n4. Nur wenn wirklich eine vollständig leere Lagerverwaltung gewünscht ist, **Lagerverwaltung vollständig zurücksetzen** auswählen.\n5. Die Sicherheitsabfragen lesen und den Vorgang bewusst bestätigen.\n\n**Achtung:** Ein Zurücksetzen ist kein Mittel zur Konfliktlösung. Bei abweichenden Datenständen stattdessen die **Konfliktansicht** verwenden.\n","11-m365-prompts.md":"# M365 / Copilot – Dokumente auslesen\n\n## Wann verwenden?\nWenn ein Lieferschein oder Servicebericht nicht direkt verarbeitet werden kann, gibt es einen vorbereiteten Copilot-Prompt als alternativen Textimport.\n\n## Schritt für Schritt\n1. Im Menü **Einbuchung** oder **Entnahme** den entsprechenden Dokumentimport öffnen.\n2. **Copilot-Prompt anzeigen** wählen.\n3. Den vorgegebenen Text über **Prompt kopieren** übernehmen.\n4. Im unterstützten M365-/Copilot-Programm mit dem zugehörigen Dokument ausführen.\n5. Die extrahierten Daten in das Textfeld der Lagerverwaltung einfügen.\n6. **Extraktion jetzt prüfen** wählen und unbekannte Artikel behandeln.\n7. **Geprüfte Lieferung einbuchen** bzw. **Geprüfte Entnahme buchen** wählen.\n8. Hinterher Buchungen und Synchronisierungsstatus prüfen.\n\n## Fehler vermeiden\nDie KI-Auswertung kann Mengen, Artikelnummern oder Kunden verwechseln. **Jede Position vor dem Buchen kontrollieren**. Bei PDF-Serviceberichten möglichst zuerst den direkten PDF-Import verwenden.\n","12-backups.md":"# Backups – Daten sichern und wiederherstellen\n\n## Manuelles Backup erstellen\n1. **Backups** im Menü öffnen.\n2. **Backup jetzt erstellen** wählen.\n3. Die angezeigte Sicherung in der Liste überprüfen.\n4. Bei Bedarf zusätzlich unter **Dateisynchronisierung** die vollständige **lager.db herunterladen**.\n\n## Backup wiederherstellen\n1. Zuerst eine aktuelle Sicherheitskopie des bestehenden Datenstands erstellen.\n2. Unter **Backups** die gewünschte Sicherung mit Datum und Herkunft identifizieren.\n3. Wiederherstellung auswählen; falls erforderlich eine `.db`-Datei über **Backup aus Datei laden** öffnen.\n4. Den neuen lokalen Datenstand nach Wiederherstellung prüfen.\n5. Die Cloud wird dadurch **nicht automatisch überschrieben**. Eine anschließende Veröffentlichung muss bewusst erfolgen.\n\n## Bei Konflikten\nVor Zusammenführung oder Überschreiben immer **beide** Datenbankstände erhalten. Im **Konfliktarchiv** lassen sie sich später herunterladen und einzelne Änderungen nachträglich übernehmen.\n","12-mobile-bedienung.md":"# Smartphone – Menü, Suche und Bedienung\n\n## Navigation\n1. App öffnen und oben **☰ Menü** antippen.\n2. Im Menü nach unten scrollen; dort stehen auch **Dateisynchronisierung**, **Backups** und **Hilfe**.\n3. **❓ Hilfe** wählen.\n4. Mit der Hilfesuche beispielsweise `Excel`, `PDF`, `Kunde` oder `Synchronisierung` eingeben.\n5. Ein Thema antippen. Auf kleinen Bildschirmen wird die Anleitung darunter angezeigt.\n6. Mit **Zur Themenliste** zurückspringen oder ein anderes Thema auswählen.\n\n## Buchungen am Smartphone\n1. Für Wareneingang **Einbuchung**, für Verbrauch **Entnahme** öffnen.\n2. Artikel über die Suchfunktion auswählen; weitere Positionen ergänzen.\n3. Kunde und Maschine bei Entnahmen möglichst ergänzen.\n4. Speichern und den Synchronisierungsstatus in der Kopfzeile beachten.\n\n## Gerätewechsel\n1. Vor dem Wechsel die ausstehenden Änderungen synchronisieren.\n2. Auf dem anderen Gerät die Cloud-Revision prüfen.\n3. Bei Konflikten die Unterschiede anzeigen lassen, statt einen alten Datenstand hochzuladen.\n\n**Hinweis:** Beim Schließen mit X kann der Browser eine Warnung anzeigen. Auf manchen Smartphones wird die Anwendung ohne Vorwarnung beendet; lokale Daten bleiben gespeichert, die Cloud-Synchronisierung muss beim nächsten Öffnen geprüft werden.\n","13-fehlerbehebung.md":"# Fehler beheben – verständliche Lösungen\n\n## „Cloud-Ordner nicht erreichbar“ oder Berechtigung fehlt\n1. **Dateisynchronisierung** öffnen.\n2. **Ordnerzugriff erneut freigeben** wählen.\n3. Den bekannten Ordner und die Datei `lager.db` prüfen.\n4. Erst danach erneut synchronisieren. Nicht automatisch einen neuen leeren Ordner anlegen.\n\n## „Datenkonflikt“ oder unterschiedliche Revisionen\n1. **Unterschiede vergleichen** öffnen.\n2. Lokal und Cloud nach Artikel, Buchung, Kunde und Ticket vergleichen.\n3. Unbekannte Änderungen nicht automatisch zusammenführen.\n4. Im Konfliktarchiv die Originaldateien sichern.\n5. Erst nach eindeutiger Entscheidung wieder synchronisieren.\n\n## „Artikel unbekannt“ beim Import\n1. Artikelnummer in der PDF/CSV prüfen (einschließlich führender Nullen).\n2. Vorhandene Artikel in **Lagerbestand** suchen.\n3. Falls wirklich neu: **Neues Material registrieren** beziehungsweise **Anlegen**.\n4. Lagerort, Einheit und Anfangsbestand prüfen.\n5. Vorschau erneut laden und dann nur echte Änderungen buchen.\n\n## „Dateimenge passt nicht“\n1. Prüfen, ob die Datei eine **Bestandsliste** oder eine **Lieferung** ist.\n2. Im CSV-Center richtige Importart wählen.\n3. `Frei verwendbar` im Inventurmodus als Gesamtbestand lesen, im Einbuchungsmodus als Zugang.\n4. Keine Bestellung als geliefert buchen, wenn sie noch nicht angekommen ist.\n\n## „Import bereits verarbeitet“\n1. In Buchungshistorie und Vorschau prüfen, ob die Buchung schon existiert.\n2. Datei nicht einfach als neuen Vorgang erneut starten.\n3. Nur bei einer tatsächlich zweiten Lieferung einen neuen Vorgang beginnen.\n\n## Hilfe zeigt kein Thema / Text ist abgeschnitten\n1. Suchfeld leeren oder **Alle Themen** wählen.\n2. Auf dem Smartphone nach unten zum Anleitungsbereich scrollen.\n3. Wenn weiter nichts erscheint, App einmal neu öffnen und dabei lokal gespeicherte, nicht synchronisierte Daten beachten.\n\n## „Synchronisierung fehlgeschlagen“\n1. Lokal weiterarbeiten ist grundsätzlich möglich, Cloud-Status bleibt gelb/rot.\n2. Prüfen, ob Berechtigung, Ordnerverbindung, Netz und OneDrive verfügbar sind.\n3. Nach Rückkehr die Datenstände **zuerst vergleichen**.\n4. Bei unsicherem Stand nicht **Cloud-Stand überschreiben** wählen.\n\n## Fehler nach Datenbankmigration\n1. Nichts löschen.\n2. Originalbackup und letzte `lager.db` bereithalten.\n3. Integrität und Artikel-/Buchungsanzahl überprüfen.\n4. Notfalls über **Backups** den gesicherten Stand wiederherstellen.\n","14-inventur.md":"# Inventur – Bestand zählen und abgleichen\n\n## Neue Inventur starten\n1. Menü **Inventur** öffnen.\n2. Eine aussagekräftige Bezeichnung eingeben, etwa `Fahrzeug November`.\n3. **Neue Inventur starten** wählen.\n4. Artikel vor Ort zählen; auch **0** ist ein gültiger gezählter Bestand. Ein leeres Feld bedeutet **noch nicht gezählt**.\n5. Die Zählmenge und gegebenenfalls den Lagerort erfassen.\n6. Mit **Zurück** und **Weiter** durch die Artikel gehen.\n7. Zwischendurch **Zwischenstand speichern** wählen.\n8. Für die Dokumentation **Zählliste herunterladen (CSV)** verwenden.\n9. Nach vollständiger Kontrolle **Abschluss prüfen** wählen.\n10. Geplante Bestandskorrekturen und Warnungen prüfen.\n11. Erst dann **Inventur verbindlich abschließen** wählen.\n12. Cloud synchronisieren und bei Gerätewechsel Revisionen vergleichen.\n\n## Wichtig\nDie Inventur wird erst beim verbindlichen Abschluss bestandswirksam. Wenn inzwischen am PC oder Smartphone andere Buchungen erfolgt sind, können die ursprünglichen Vergleichsbestände veraltet sein. Solche Fälle **neu prüfen**, statt alte Inventurdifferenzen blind zu übernehmen.\n\n## Fortsetzen oder abbrechen\nEine gespeicherte Inventur über **Gespeicherte Inventur** wieder öffnen. **Inventur abbrechen und archivieren** verwirft den laufenden Zählvorgang kontrolliert; die bisherige Lagerbuchungshistorie bleibt erhalten.\n","15-historienfilter.md":"# Buchungshistorie filtern\n\n1. Menü **Buchungen** öffnen.\n2. Zeitraum sowie optional Buchungsart (Einbuchung/Entnahme) setzen.\n3. Artikelnummer oder Beschreibung eintragen.\n4. Optional **Kunde**, **Maschine** und **Techniker** einschränken.\n5. **Filtern** wählen.\n6. Die passenden Buchungen prüfen oder **Gefilterte Buchungen als CSV** herunterladen.\n7. Über **Filter löschen** wieder alle Buchungen anzeigen.\n\nFür Konfliktklärung zusätzlich unter **Dateisynchronisierung** die unterschiedlichen Buchungskennungen und Löschungen vergleichen.\n","16-materialanforderung-export.md":"# Materialanforderung als Excel exportieren\n\n1. Menü **Materialanforderung** öffnen.\n2. Artikel und Bestellmengen zusammenstellen.\n3. **Vorschau prüfen** wählen.\n4. **Materialanforderung exportieren** wählen.\n5. Die heruntergeladene `.xlsx`-Datei öffnen und vor dem Weiterleiten kontrollieren.\n6. Wenn die Lieferung eintrifft, die Datei unter **Einbuchung → Bestell-Excel einlesen** verwenden.\n\n**Wichtig:** Exportieren erzeugt keine Lagerbuchung. Nicht bestellte oder nicht gelieferte Mengen dürfen beim späteren Einbuchen nicht einfach übernommen werden.\n","17-abschluss-und-tests.md":"# Nach einer Buchung: Kontrolle und Sicherheit\n\n1. Erfolgsmeldung kontrollieren.\n2. In der Buchungshistorie Artikel, Menge, Datum und gegebenenfalls Kunde, Maschine und Ticket prüfen.\n3. Im Lagerbestand kontrollieren, dass die Menge korrekt verändert wurde.\n4. Synchronisierungsstatus prüfen: **Gelb** bedeutet lokal gespeichert, noch nicht übertragen.\n5. **Jetzt synchronisieren** wählen oder bewusst später erledigen.\n6. Bei unterschiedlichen Datenständen **Unterschiede vergleichen** öffnen.\n7. Vor dem Gerätewechsel sicherstellen, dass beide Geräte denselben bestätigten Stand verwenden.\n\nEin grüner Status ist nur nach erfolgreicher Dateiprüfung der verbundenen Datei gerechtfertigt. Bei OneDrive kann die Übertragung vom lokalen Sync-Ordner auf den Cloud-Server zusätzlich Zeit benötigen.\n","18-servicebericht-pdf.md":"# PDF-Servicebericht von RONDO importieren\n\n## Schritt für Schritt\n1. Menü **Entnahme** öffnen.\n2. Den Abschnitt **RONDO-Servicebericht direkt aus PDF importieren** öffnen.\n3. Eine oder mehrere PDF-Dateien auswählen (`.pdf`).\n4. **Ausgewählte PDFs auslesen** wählen und das Ende der Auswertung abwarten.\n5. Die Vorschau je Dokument prüfen: Kunde, Service-Ticket, Untertickets, Maschine und technische Typkennung.\n6. Für **jede Position** Artikelnummer, Beschreibung und entnommene Menge kontrollieren.\n7. Unbekannte Artikel mit **Neues Material registrieren** anlegen, wenn sie tatsächlich zu deinem Lager gehören. Sonst bewusst nicht auswählen.\n8. Prüfen, ob Positionen bereits aus genau diesem Bericht gebucht wurden; diese **nicht erneut auswählen**.\n9. Wenn eine Maschine falsch oder unbekannt ist, die Zuordnung in der Vorschau korrigieren beziehungsweise leer lassen, statt eine falsche Maschine zu buchen.\n10. **Vorschau / Bestände aktualisieren** wählen.\n11. Nur die tatsächlich verwendeten Ersatzteile auswählen und **Geprüfte Materialien entnehmen** wählen.\n12. Unter **Buchungen** anschließend Menge, Kunde, Ticket, Maschine und Buchung prüfen.\n13. Die Änderungen lokal sichern und die Cloud-Synchronisierung durchführen.\n\n## Häufige Probleme\n- **Unbekannte Artikelnummer:** Erst registrieren; Beschreibung und Nummer aus PDF übernehmen, Lagerort und Menge prüfen.\n- **Unterticket falsch zugeordnet:** Vor dem Buchen Maschine und Ticket manuell korrigieren.\n- **Menge kann nicht entnommen werden:** Prüfen, ob der Artikel ausreichend Bestand hat oder vorher korrekt eingebucht werden muss.\n- **PDF unleserlich:** OCR-/Texterkennung kann Fehler enthalten; gegebenenfalls M365-Textimport verwenden.\n- **Doppelte PDF:** Die Vorschau auf bereits gebuchte Positionen prüfen; keine zweite Entnahme auslösen.\n\n## Was nicht automatisch übernommen wird\nArbeitszeit, Fahrtkosten und sonstige nicht als Lagerartikel erkannte Positionen gehören nicht in die Materialentnahme. Mehrdeutige Positionen müssen manuell geprüft werden.\n","19-datenimport-uebersicht.md":"# Daten importieren – welche Datei gehört wohin?\n\n## Importart wählen\n1. **SAP-Firmenbestandsliste `.xlsx/.csv`:** **CSV-Center → Firmenliste importieren**. Meist **Inventur / Bestandsabgleich** wählen.\n2. **Materialanforderungs-/Bestell-Excel `.xlsx`:** **Einbuchung → Materialanforderung als Excel einlesen**.\n3. **Liefer-/Wareneingangs-Text:** **Einbuchung → Lieferung aus Bestell-Excel oder M365**.\n4. **RONDO-Servicebericht `.pdf`:** **Entnahme → RONDO-Servicebericht direkt aus PDF importieren**.\n5. **Inventurzählliste `.xlsx/.csv`:** **Inventur** oder im **CSV-Center → Legacy-Inventur** (für ältere Formate).\n6. **Vollständige Datenbank `.db`:** **Backups / Dateisynchronisierung** und ausdrücklich **nicht** im CSV-Center.\n\n## Sicherheitscheck vor jedem Import\n1. Prüfe, **was die Mengen bedeuten**: kompletter Bestand oder Zugang/Entnahme.\n2. Datei und Blatt prüfen; bei SAP-Firmenlisten `SAPUI5-Export` verwenden.\n3. Bei neuen Artikeln Bezeichnung, Einheit, Lager und Anfangsbestand prüfen.\n4. Kunde, Ticket und Maschine beim Servicebericht vergleichen.\n5. Vorschau lesen: **bekannt**, **neu**, **abweichend**, **Fehler**, **bereits verarbeitet**.\n6. Fehler korrigieren, statt die Datei ungeprüft zu buchen.\n7. Vorgang nur **einmal** bestätigen; nicht versehentlich **Als neuen Vorgang starten** wählen.\n8. Nach Buchung Bestände und Historie prüfen und synchronisieren.\n\n## Das richtige Beispiel\n- In SAP steht bei Artikel 121321 **12 Stk.**, in deiner App **10 Stk.**: **Inventur/Bestandsabgleich** würde eine **Korrektur +2** planen.\n- Du bekommst eine neue Lieferung mit **12 Stk.** des Artikels: **Einbuchung** würde **+12** planen.\n\nDiese beiden Varianten dürfen nicht verwechselt werden.\n","20-bestell-excel-import.md":"# Bestell-Excel / Materialanforderung als Lieferung importieren\n\n## Schritt für Schritt\n1. Datei mit deiner Materialanforderung bereithalten und den **tatsächlichen Wareneingang** abgleichen.\n2. Menü **Einbuchung** öffnen.\n3. Im Bereich **Lieferung aus Bestell-Excel oder M365 einbuchen** die `.xlsx`-Datei auswählen.\n4. **Bestell-Excel einlesen** drücken.\n5. In der Vorschau Artikelnummer, Beschreibung und Menge mit Lieferschein und Karton vergleichen.\n6. Bei Teillieferungen nur die **erhaltenen** Positionen/Mengen verwenden; fehlende Positionen nicht buchen.\n7. Unbekannte Artikel erfassen oder ignorieren, wie in der Vorschau angeboten.\n8. **Extraktion jetzt prüfen** drücken.\n9. Danach **Geprüfte Lieferung einbuchen** auswählen.\n10. Erfolgsmeldung und letzte Einbuchungen kontrollieren.\n11. Cloud-Synchronisierung durchführen.\n\n## Häufige Fehler\n- Verwechselte Bestell- und Liefermenge: Nicht gelieferte Artikel nicht einbuchen.\n- Bereits gebuchte Lieferung: Keine zweite Einbuchung über **Als neuen Vorgang starten** auslösen.\n- Falsches Dateiformat: SAP-Firmenbestandsliste gehört ins **CSV-Center**, nicht in diesen Bereich.\n","21-synchronisierung-v81.md":"# Synchronisierung – lokal speichern, Cloud prüfen, Gerätewechsel\n\n## Nach einer Buchung\n1. Buchung wird zuerst **lokal** gespeichert.\n2. Die App zeigt **Änderungen lokal gespeichert – Jetzt synchronisieren / Später synchronisieren**.\n3. Bei **Jetzt synchronisieren** liest die App zuerst den verbundenen Ordner und dessen Revision.\n4. Nur bei sicherem Vergleich wird in den Ordner geschrieben. Danach wird die Datei erneut gelesen und geprüft.\n5. Ist die Cloud abweichend, erscheint ein Konflikt. **Nichts wird blind überschrieben.**\n6. Bei **Später synchronisieren** bleibt der Status als ausstehend sichtbar.\n\n## Ordnerberechtigung fehlt\n1. **Dateisynchronisierung** öffnen.\n2. **Ordnerzugriff erneut freigeben** wählen.\n3. Zugriff erlauben und erst danach synchronisieren.\n4. Wenn der Browser die Ordnerauswahl nicht unterstützt, gegebenenfalls die Datenbank über **lager.db herunterladen** sichern.\n\n## Smartphone und PC sicher wechseln\n1. Auf dem zuletzt verwendeten Gerät alle Änderungen synchronisieren.\n2. Warten, bis auch OneDrive die lokale Ordnerdatei auf den Server und zum anderen Gerät übertragen hat.\n3. Auf dem neuen Gerät beim Start die Cloud-Prüfung abwarten.\n4. Nur bei identischem, bestätigtem Stand normal weiterbuchen.\n5. Bei verschiedenen Datenständen **Unterschiede vergleichen** und bei Bedarf **Konfliktarchiv** öffnen.\n\n## Grenzen des verbundenen Ordners\nEine lokal geschriebene `lager.db` beweist noch nicht, dass die OneDrive-Serversynchronisierung abgeschlossen wurde. Gleichzeitige Schreibvorgänge aus verschiedenen Geräten lassen sich mit einer einfachen Browser-Ordnerverknüpfung nicht vollständig ausschließen. Bei offenen Konflikten erst prüfen, dann übernehmen.\n","22-csv-center-v81.md":"# CSV-Center – Suche, Filter und große Dateien\n\n## Eine große Firmenliste prüfen\n1. **CSV-Center → Firmenliste importieren** öffnen.\n2. Importart vor der Dateiauswahl festlegen.\n3. `.xlsx` oder `.csv` auswählen und auf die Vorschau warten.\n4. In der Vorschau über **Suche** eine Artikelnummer oder Beschreibung finden.\n5. Mit **Alle**, **Änderungen**, **Neue Artikel**, **Fehler** oder **Bereits verarbeitet** die Ansicht einschränken.\n6. Bei vielen Einträgen über **Zurück** / **Weiter** die Seiten durchgehen.\n7. Bei unbekannten Artikeln zwischen **Anlegen** und **Ignorieren** wählen. Auswahl bleibt bei Seitenwechsel erhalten.\n8. Geplante Bestandswirkung und Fehlermeldungen prüfen.\n9. **Geprüften Vorgang bestätigen** erst nach vollständiger Kontrolle verwenden.\n\nDie Firmenliste verwendet die Spalten `Material`, `Bezeichnung zum Material`, `Lagerort`, `Bezeichnung des Lagerorts`, `Frei verwendbar`. **Inventur/Bestandsabgleich** ist für eine gesamte Bestandsliste; **Einbuchung** für neue Zugänge.\n","23-konfliktarchiv-v82.md":"# Konfliktarchiv V82 – Unterschiede erkennen und nachträglich übernehmen\n\n## Unterschiedliche Datenstände vergleichen\n1. **Dateisynchronisierung** öffnen.\n2. **Unterschiede vergleichen** wählen, wenn Smartphone und Cloud abweichen.\n3. Lokale und Cloud-Revision sowie die Buchungsanzahl kontrollieren.\n4. Die Unterschiede nach **Artikelnummer**, **Kunde**, **Maschine** oder **Ticket** durchsuchen.\n5. Prüfen, welche Buchung **nur lokal**, **nur in der Cloud**, **geändert** oder **gelöscht** wurde.\n6. Nicht eindeutig auflösbare Konflikte manuell entscheiden; keinen alten Stand ungeprüft in die Cloud schreiben.\n\n## Später einzelne Änderungen nachtragen\n1. Unter **Dateisynchronisierung → Konfliktarchiv** den gespeicherten Konflikt öffnen.\n2. **Lokal** oder **Cloud** als Herkunft des wiederherzustellenden Eintrags auswählen.\n3. Nach Kunde, Artikel, Ticket, Maschine oder Löschung filtern.\n4. Den alten und neuen Wert jedes Eintrags kontrollieren.\n5. Nur die gewünschten Änderungen markieren.\n6. Bei Bedarf fehlende Kunden-, Maschinen- oder Ticketinformationen ergänzen, sofern das Formular sie anbietet.\n7. Übernahme bestätigen. Die Anwendung prüft den aktuellen Datenstand erneut und erstellt eine Sicherheitskopie.\n8. Nach der Übernahme Bestand und Buchungshistorie prüfen und erneut synchronisieren.\n\n## Löschungen und Änderungen\n- **Gelöschte Buchung:** Im Archiv wird die Löschung mit ursprünglichem Kunden, Artikel, Menge und weiteren Daten sichtbar.\n- **Löschung gegen Änderung:** Wenn eine Seite die Buchung gelöscht und die andere sie verändert hat, muss die Entscheidung bewusst getroffen werden.\n- **Geänderter Kunde oder Ticket:** Nur die Informationen sollen aktualisiert werden, nicht erneut die Menge gebucht.\n- **Doppelte Buchung:** Eindeutige Sync-Kennungen verhindern erneutes Buchen derselben Änderung.\n- **Gelöschter Artikel mit Buchungen:** Nicht automatisch samt Buchungshistorie löschen; zuerst den Zusammenhang prüfen.\n- **Inventur- oder Stammdatenkonflikt:** Nicht alle Fälle sind automatisch zusammenführbar. Die Datenstände bleiben gesichert und die App kann eine manuelle Prüfung verlangen.\n\n## Vollständige Originalstände sichern\nIm Konfliktarchiv beide Datenbanken herunterladen, bevor du einen Datenstand aufgibst. **Ein nicht übernommener Eintrag darf nicht heimlich verschwinden.**\n","24-sync-fehler-und-schliessen.md":"# Fenster schließen, Offline-Modus und Cloud-Fehler\n\n## Windows-Fenster mit X schließen\n1. Wenn lokale Änderungen noch nicht synchronisiert sind, kann der Browser beim Schließen über **X** eine Warnung anzeigen.\n2. Wähle **Auf dieser Seite bleiben**, wenn du erst synchronisieren möchtest.\n3. In der App oben **Abmelden / schließen** öffnen, um die dort verfügbaren Sicherungsoptionen bewusst zu verwenden.\n4. Bei **Später synchronisieren** bleibt die Änderung lokal gespeichert; am nächsten Start die Cloud erneut prüfen.\n\nBrowser dürfen den eigenen Warntext ersetzen und zeigen nicht auf jedem Gerät eine Warnung. Beim Wegwischen auf Android gibt es keine zuverlässige Abfrage.\n\n## Synchronisierung fehlgeschlagen\n1. Buchungshistorie und lokalen Bestand kontrollieren.\n2. Unter **Dateisynchronisierung** den Fehler lesen.\n3. Gegebenenfalls **Ordnerzugriff erneut freigeben** wählen.\n4. Cloud-Revision prüfen; wenn ein anderer PC inzwischen gearbeitet hat, **Unterschiede vergleichen** wählen.\n5. Keine Aktion **Cloud-Stand ausdrücklich überschreiben**, solange Änderungen unbekannt sind.\n6. Bei wiederholtem Fehler die komplette `lager.db` und die Konfliktarchivdateien zusätzlich herunterladen.\n\n## Online-Synchronisierung ist nicht automatisch OneDrive-Serverbestätigung\nBei einem lokal verbundenen OneDrive-Ordner bestätigt die App zunächst das Schreiben und Lesen dieser Datei. Die tatsächliche OneDrive-Serverübertragung kann verzögert sein. Vor dem Öffnen auf einem zweiten Gerät den OneDrive-Synchronisierungsstatus prüfen.\n","25-alle-funktionen-index.md":"# Alle Funktionen – Schnellnavigation\n\n## Lager verwalten\n1. **Dashboard:** Kennzahlen, letzte Buchungen und Unterbestand ansehen.\n2. **Lagerbestand:** Artikel und Bestände suchen, Soll/Mindestwerte, Lagerort und Maschine pflegen.\n3. **Neues Material:** Artikelnummer, Beschreibung, Menge, Lagerort und Maschinenzuordnung erfassen.\n4. **Inventur:** Reale Bestände zählen, später fortsetzen und nach Prüfung korrigieren.\n\n## Material bewegen\n5. **Einbuchung:** Wareneingänge manuell oder aus Excel/M365 buchen.\n6. **Entnahme:** Material manuell oder aus PDF-Serviceberichten/M365 entnehmen.\n7. **Materialanforderung:** Nach Mindest-/Sollbestand bestellen und Excel exportieren.\n8. **CSV-Center:** SAP-Firmenliste importieren, vergleichen und Bestände/Buchungen exportieren.\n\n## Prüfen und sichern\n9. **Buchungen:** Vorgänge suchen, filtern, korrigieren und als CSV exportieren.\n10. **Audit:** Änderungsprotokoll kontrollieren.\n11. **Stammdaten:** Lagerorte, Maschinen, Techniker, Alternative Namen, Passwort und Einstellungen.\n12. **Dateisynchronisierung:** Geräte vergleichen, Cloud verbinden und sicher synchronisieren.\n13. **Konfliktarchiv:** Nicht übernommene Änderungen später prüfen und gezielt nachtragen.\n14. **Backups:** Sicherheitskopien erstellen und wiederherstellen.\n15. **Hilfe:** Hier stehen alle Schritt-für-Schritt-Anleitungen.\n\n## Die häufigsten Fragen\n- **Wie importiere ich SAP-Excel?** → **CSV-Center – Firmenliste importieren und exportieren**.\n- **Wie buche ich angeforderte Ersatzteile ein?** → **Bestell-Excel / Materialanforderung als Lieferung importieren**.\n- **Wie importiere ich einen RONDO-PDF-Servicebericht?** → **PDF-Servicebericht von RONDO importieren**.\n- **Was tun bei abweichenden Smartphone-/PC-Ständen?** → **Konfliktarchiv V82**.\n- **Warum kommt eine Warnung beim Schließen?** → **Fenster schließen, Offline-Modus und Cloud-Fehler**.\n"};

function idbOpen(){return new Promise((res,rej)=>{const r=indexedDB.open('LagerverwaltungLovrencicV21',1);r.onupgradeneeded=()=>r.result.createObjectStore('data');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function ig(k){const d=await idbOpen();return new Promise((res,rej)=>{const r=d.transaction('data').objectStore('data').get(k);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function ip(k,v){const d=await idbOpen();return new Promise((res,rej)=>{const r=d.transaction('data','readwrite').objectStore('data').put(v,k);r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})}
async function idel(k){const d=await idbOpen();return new Promise((res,rej)=>{const r=d.transaction('data','readwrite').objectStore('data').delete(k);r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})}
async function initDeviceStorageMode(){
 const m=await ig(METAKEY)||{};
 const indexedMode=String(m.deviceStorageMode||'');
 const legacyMode=String(setting('storage_mode','')||'');
 deviceStorageModeCache=await SyncCore.initializeDeviceStorageMode({
  indexedMode,legacyMode,hasHandle:!!handle,
  persistMode:async mode=>{m.deviceStorageMode=mode;await ip(METAKEY,m)}
 });
}
function storageMode(){return ['cloud','local_folder','browser_local'].includes(deviceStorageModeCache)?deviceStorageModeCache:'browser_local'}
async function setDeviceStorageMode(mode){
 deviceStorageModeCache=mode||'browser_local';
 const m=await ig(METAKEY)||{};m.deviceStorageMode=deviceStorageModeCache;await ip(METAKEY,m);
}
async function queryHandlePermission(h,mode='read'){
 if(!h)return 'denied';
 try{return typeof h.queryPermission==='function'?await h.queryPermission({mode}):'granted'}catch{return 'denied'}
}
async function requestHandlePermissionExplicit(h,mode='readwrite'){
 if(!h)return false;
 try{
  const q=await queryHandlePermission(h,mode);if(q==='granted')return true;
  return typeof h.requestPermission==='function'&&(await h.requestPermission({mode}))==='granted';
 }catch{return false}
}
function rows(sql,p=[]){const s=db.prepare(sql);s.bind(p);const a=[];while(s.step())a.push(s.getAsObject());s.free();return a}
function scalar(sql,p=[]){const x=rows(sql,p);return x.length?Object.values(x[0])[0]:0}
function run(sql,p=[]){db.run(sql,p)}
function runTransaction(work){return TxCore.runTransaction(run,work)}
function today(){return new Date().toISOString().slice(0,10)}
function stamp(){return new Date().toISOString()}
function setting(k,d=''){const r=rows('SELECT setting_value FROM app_settings WHERE setting_key=?',[k]);return r.length?r[0].setting_value:d}
function setSetting(k,v){run('INSERT OR REPLACE INTO app_settings(setting_key,setting_value) VALUES(?,?)',[k,String(v)])}
function legacyHash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(16)}
async function validPw(p){
 const stored=setting('admin_password_hash','');
 if(!p||!stored)return false;
 return AuthCore.verifyPassword(String(p),stored,(password,encoded)=>legacyHash(password)===encoded);
}
async function migrateLegacyPasswordIfNeeded(password){
 const stored=setting('admin_password_hash','');
 if(stored&& !stored.startsWith('pbkdf2$') && legacyHash(password)===stored){
  setSetting('admin_password_hash',await AuthCore.hashVerifiedLegacyPassword(password));
  audit('System','PASSWORT-MIGRATION','System','','Bestehender Passwort-Hash auf PBKDF2 migriert');
  await persist();
  return true;
 }
 return false;
}
async function setAdminPassword(password){setSetting('admin_password_hash',await AuthCore.hashPassword(password))}
function adminTokenFromHeaders(opt){
 const h=opt?.headers;if(!h)return '';
 return typeof h.get==='function'?(h.get('X-LV-Admin-Token')||''):(h['X-LV-Admin-Token']||'');
}
async function adminAuthorized(d,opt){
 try{
  if(adminSessions.verify(adminTokenFromHeaders(opt)))return true;
  return await validPw(d?.password)||await validPw(d?.admin_password);
 }catch{return false}
}
function requireAdminSession(opt,message='Administrator-Sitzung erforderlich.'){return V67Core.requireAdminSession(adminSessions,adminTokenFromHeaders(opt),message)}
function normalizeQuantityForUnit(value,unit){
 const n=Number(value||0);
 return ['Stk.','Satz','Rolle','Packung','Karton'].includes(String(unit||''))?Math.round(n):n;
}
function stockExpr(){return "a.initial_stock+COALESCE(SUM(CASE WHEN m.movement_type='IN' THEN m.quantity WHEN m.movement_type='OUT' THEN -m.quantity ELSE 0 END),0)"}
function audit(user,action,entity,id='',details=''){run('INSERT INTO audit_log(event_time,user_name,action,entity,entity_id,details,sync_uuid) VALUES(?,?,?,?,?,?,?)',[stamp(),user||'Techniker',action,entity,String(id||''),details||'',randomId()])}

function randomId(){
 if(globalThis.crypto?.randomUUID)return crypto.randomUUID();
 return 'id-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
}
function syncValue(key,def=''){
 try{
  const r=rows('SELECT value FROM sync_state WHERE key=?',[key])[0];
  return r?String(r.value):def;
 }catch{return def}
}
function setSyncValue(key,value){
 run('INSERT INTO sync_state(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[key,String(value)]);
}
function ensureSyncState(){
 if(!syncValue('database_id'))setSyncValue('database_id',randomId());
 if(!syncValue('revision'))setSyncValue('revision','0');
 if(!syncValue('revision_id'))setSyncValue('revision_id',randomId());
 if(!syncValue('changed_at'))setSyncValue('changed_at',String(Date.now()));
}
function currentDbState(){
 ensureSyncState();
 return {
  database_id:syncValue('database_id'),
  revision:Number(syncValue('revision','0')),
  revision_id:syncValue('revision_id'),
  parent_revision_id:syncValue('parent_revision_id',''),
  cloud_base_revision_id:syncValue('cloud_base_revision_id',''),
  cloud_base_revision:Number(syncValue('cloud_base_revision','0')),
  changed_at:Number(syncValue('changed_at','0')),
  articles:Number(scalar('SELECT COUNT(*) FROM articles')||0),
  movements:tableExists('movements')?Number(scalar('SELECT COUNT(*) FROM movements')||0):0
 };
}
function bumpRevision(){
 ensureSyncState();
 const oldId=syncValue('revision_id');
 setSyncValue('parent_revision_id',oldId);
 setSyncValue('revision',String(Number(syncValue('revision','0'))+1));
 setSyncValue('revision_id',randomId());
 setSyncValue('changed_at',String(Date.now()));
}
function stateFromDatabase(test){
 const get=(key,def='')=>{
  try{
   const stmt=test.prepare('SELECT value FROM sync_state WHERE key=?');
   stmt.bind([key]);
   const value=stmt.step()?String(stmt.getAsObject().value):def;
   stmt.free();
   return value;
  }catch{return def}
 };
 const count=table=>{
  try{
   const r=test.exec(`SELECT COUNT(*) AS c FROM ${table}`);
   return Number(r[0]?.values?.[0]?.[0]||0);
  }catch{return 0}
 };
 return {
  database_id:get('database_id','legacy'),
  revision:Number(get('revision','0')),
  revision_id:get('revision_id','legacy-'+count('articles')+'-'+count('movements')),
  parent_revision_id:get('parent_revision_id',''),
  cloud_base_revision_id:get('cloud_base_revision_id',''),
  cloud_base_revision:Number(get('cloud_base_revision','0')),
  changed_at:Number(get('changed_at','0')),
  articles:count('articles'),
  movements:count('movements')
 };
}
// Serielle, dauerhafte lokale Speicherung. Die Cloud wird niemals Voraussetzung fuer eine Buchung.
 let persistQueue=Promise.resolve(),notifyLocalChanges=false;
 function dispatchSyncEvent(name,detail={}){try{window.dispatchEvent(new CustomEvent(name,{detail}))}catch(e){console.warn('Sync-Hinweis:',e)}}
 async function persist(dirty=true){
  if(dirty)bumpRevision();
  const bytes=db.export().buffer,revision=currentDbState();
  const save=async()=>{
   await ip(DBKEY,bytes);
   const m=await ig(METAKEY)||{};
   if(dirty){m.dirty=true;m.localModified=revision.changed_at;m.pendingChanges=Number(m.pendingChanges||0)+1}
   await ip(METAKEY,m);
   await syncStatus();
   if(dirty){
    scheduleAutomaticBackup();
    if(notifyLocalChanges)dispatchSyncEvent('lv81:local-saved',{revision:revision.revision_id,pendingChanges:m.pendingChanges});
   }
   if(window.refreshDatabaseStatus)window.refreshDatabaseStatus();
  };
  persistQueue=persistQueue.then(save,save);
  return persistQueue;
 }
 function scheduleAutoSync(){/* V81: Cloud-Schreiben erst nach explizitem Klick, nie still im Hintergrund. */}
 async function assertInventoryWritable(){
  // Auch bei Offline-Modus, Konflikt oder abgelaufener Berechtigung lokal buchen.
  // Die Cloud bleibt durch validateWriteGuard unabhaengig davon gesperrt.
  const m=await ig(METAKEY)||{};
  if(storageMode()==='cloud'&&handle&&!m.writeBlocked){
   try{
    const c=await inspectCloudDatabase(),expected=m.expectedCloudRevisionId||currentDbState().cloud_base_revision_id;
    if(c.status!==SyncCore.CloudStatus.OK){m.syncErrorCode=c.status;m.syncErrorMessage=c.error||'Cloud zurzeit nicht erreichbar.'}
    else if((expected&&c.state.revision_id!==expected)||c.state.database_id!==currentDbState().database_id){m.writeBlocked=true;m.syncErrorCode='conflict';m.syncErrorMessage='Cloud-Datenstand wurde auf einem anderen Gerät geändert.'}
    else {delete m.syncErrorCode;delete m.syncErrorMessage;return true}
    await ip(METAKEY,m);dispatchSyncEvent('lv81:sync-error',{code:m.syncErrorCode,message:m.syncErrorMessage});
   }catch(e){m.syncErrorCode='io_error';m.syncErrorMessage=e.message;await ip(METAKEY,m);dispatchSyncEvent('lv81:sync-error',{code:'io_error',message:e.message})}
  }
  return true;
 }const ServicePDF=window.LVServicePDFBackend.create({run,rows,transaction:runTransaction,articles,persist,audit,stamp,backup:createBackup,guard:assertInventoryWritable,databaseId:()=>currentDbState().database_id,validate:validateBookingItems,book:writePreparedBookings});
const Warehouse=window.LVWarehouseCore.create({run,rows,scalar,setting,setSetting,persist,audit,stamp,transaction:runTransaction,guard:assertInventoryWritable});
const Inventory=window.LVInventoryCore.create({
 run,rows,scalar,transaction:runTransaction,articles,stamp,today,setting,persist,audit,
 book:writePreparedBookings,backup:createBackup,authorized:adminAuthorized,
 databaseId:()=>currentDbState().database_id,parseQty:V69Core.parseQty,wholeUnit:AppRules.isWholeNumberUnit,
 assertWritable:assertInventoryWritable,storage:()=>Warehouse

});
function initSchema(){
db.run(`PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS app_settings(setting_key TEXT PRIMARY KEY,setting_value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sync_state(key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS articles(id INTEGER PRIMARY KEY AUTOINCREMENT,article_no TEXT NOT NULL UNIQUE,description TEXT NOT NULL,target_stock REAL NOT NULL DEFAULT 0,minimum_stock REAL NOT NULL DEFAULT 0,initial_stock REAL NOT NULL DEFAULT 0,unit TEXT NOT NULL DEFAULT 'Stk.',location TEXT NOT NULL DEFAULT '',machine TEXT NOT NULL DEFAULT '',active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,manufacturer TEXT NOT NULL DEFAULT '',supplier TEXT NOT NULL DEFAULT '',supplier_article_no TEXT NOT NULL DEFAULT '',barcode TEXT NOT NULL DEFAULT '',purchase_price REAL NOT NULL DEFAULT 0,notes TEXT NOT NULL DEFAULT '',image_url TEXT NOT NULL DEFAULT '',datasheet_url TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS movements(id INTEGER PRIMARY KEY AUTOINCREMENT,movement_date TEXT NOT NULL,movement_type TEXT NOT NULL,article_id INTEGER NOT NULL,quantity REAL NOT NULL,customer TEXT NOT NULL DEFAULT '',technician TEXT NOT NULL DEFAULT '',note TEXT NOT NULL DEFAULT '',source TEXT NOT NULL DEFAULT 'App',created_at TEXT NOT NULL,vehicle TEXT NOT NULL DEFAULT '',machine TEXT NOT NULL DEFAULT '',delivery_note TEXT NOT NULL DEFAULT '',ticket TEXT NOT NULL DEFAULT '',machine_code TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS locations(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT UNIQUE NOT NULL,description TEXT NOT NULL DEFAULT '',active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS machines(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT UNIQUE NOT NULL,description TEXT NOT NULL DEFAULT '',active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS machine_aliases(id INTEGER PRIMARY KEY AUTOINCREMENT,alias TEXT UNIQUE NOT NULL,machine_id INTEGER NOT NULL,active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL DEFAULT '',FOREIGN KEY(machine_id) REFERENCES machines(id));
CREATE TABLE IF NOT EXISTS article_machines(article_id INTEGER NOT NULL,machine_id INTEGER NOT NULL,PRIMARY KEY(article_id,machine_id),FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE,FOREIGN KEY(machine_id) REFERENCES machines(id));
CREATE TABLE IF NOT EXISTS machine_merge_history(id INTEGER PRIMARY KEY AUTOINCREMENT,source_machine_id INTEGER NOT NULL,target_machine_id INTEGER NOT NULL,source_name TEXT NOT NULL,snapshot_json TEXT NOT NULL DEFAULT '{}',merged_at TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS technicians(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT UNIQUE NOT NULL,email TEXT NOT NULL DEFAULT '',default_vehicle TEXT NOT NULL DEFAULT '',active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS vehicles(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT UNIQUE NOT NULL,description TEXT NOT NULL DEFAULT '',active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS audit_log(id INTEGER PRIMARY KEY AUTOINCREMENT,event_time TEXT NOT NULL,user_name TEXT NOT NULL,action TEXT NOT NULL,entity TEXT NOT NULL,entity_id TEXT NOT NULL DEFAULT '',details TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS consumables(id INTEGER PRIMARY KEY AUTOINCREMENT,description TEXT NOT NULL COLLATE NOCASE UNIQUE,unit TEXT NOT NULL DEFAULT 'Stk.',active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS import_position_results(operation_id TEXT NOT NULL,source TEXT NOT NULL,position_key TEXT NOT NULL,article_no TEXT NOT NULL DEFAULT '',article_id INTEGER NOT NULL DEFAULT 0,movement_id INTEGER NOT NULL DEFAULT 0,quantity REAL NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,PRIMARY KEY(operation_id,source,position_key));`);
Inventory.init();
Warehouse.init();
ServicePDF.init();
ensureSyncState();
SyncMerge81.ensureSchema(db); // V82: Ticketfelder und dauerhafte Löschereignisse
}

function tableExists(name){
 try{return Number(scalar("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?",[name]))>0}catch{return false}
}
function machineRelationRows(articleId){
 return rows(`SELECT m.id,m.name FROM article_machines am JOIN machines m ON m.id=am.machine_id
  WHERE am.article_id=? AND m.active=1 ORDER BY m.name`,[Number(articleId)]);
}
function syncLegacyArticleMachine(articleId){
 const names=machineRelationRows(articleId).map(x=>x.name);
 run('UPDATE articles SET machine=? WHERE id=?',[names.join(', '),Number(articleId)]);
 return names;
}
function exactMachineResolution(value){
 const wanted=normalizeLoose(value);if(!wanted)return null;
 const canonical=rows('SELECT id,name FROM machines WHERE active=1').find(x=>normalizeLoose(x.name)===wanted);
 if(canonical)return {machine_id:Number(canonical.id),name:canonical.name,input:String(value||''),via_alias:false,exact:true};
 const aliases=rows(`SELECT ma.id alias_id,ma.alias,m.id,m.name FROM machine_aliases ma JOIN machines m ON m.id=ma.machine_id
  WHERE ma.active=1 AND m.active=1`);
 const alias=aliases.find(x=>normalizeLoose(x.alias)===wanted);
 return alias?{machine_id:Number(alias.id),name:alias.name,input:String(value||''),via_alias:true,alias:alias.alias,exact:true}:null;
}
function setArticleMachineIds(articleId,values){
 const aid=Number(articleId);const ids=[];
 for(const value of (Array.isArray(values)?values:[])){
  let id=Number(value);
  if(!id&&String(value||'').trim())id=Number(exactMachineResolution(value)?.machine_id||0);
  if(id&&Number(scalar('SELECT COUNT(*) FROM machines WHERE id=? AND active=1',[id])||0)>0&&!ids.includes(id))ids.push(id);
 }
 run('DELETE FROM article_machines WHERE article_id=?',[aid]);
 for(const id of ids)run('INSERT OR IGNORE INTO article_machines(article_id,machine_id) VALUES(?,?)',[aid,id]);
 return syncLegacyArticleMachine(aid);
}
function migrateMachineRelationsV57(){
 if(setting('machine_relations_v57','')==='1')return false;
 let changed=false;
 try{
  const list=rows('SELECT id,machine FROM articles WHERE TRIM(machine)<>\'\'');
  for(const a of list){
   if(Number(scalar('SELECT COUNT(*) FROM article_machines WHERE article_id=?',[a.id])||0)>0)continue;
   const raw=String(a.machine||'').trim();
   let exact=exactMachineResolution(raw);
   if(exact){run('INSERT OR IGNORE INTO article_machines(article_id,machine_id) VALUES(?,?)',[a.id,exact.machine_id]);changed=true;continue}
   const parts=raw.split(/\s*[;,|]\s*/).filter(Boolean);
   for(const part of parts){const r=exactMachineResolution(part);if(r){run('INSERT OR IGNORE INTO article_machines(article_id,machine_id) VALUES(?,?)',[a.id,r.machine_id]);changed=true}}
   if(Number(scalar('SELECT COUNT(*) FROM article_machines WHERE article_id=?',[a.id])||0)>0)syncLegacyArticleMachine(a.id);
  }
  setSetting('machine_relations_v57','1');changed=true;
 }catch(e){console.warn('Maschinen-Mehrfachzuordnung konnte nicht vollständig migriert werden:',e)}
 return changed;
}
function levenshtein(a,b){
 a=normalizeLoose(a);b=normalizeLoose(b);if(a===b)return 0;if(!a)return b.length;if(!b)return a.length;
 const v=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){
  let prev=v[0];v[0]=i;
  for(let j=1;j<=b.length;j++){
   const old=v[j];v[j]=Math.min(v[j]+1,v[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=old;
  }
 }
 return v[b.length];
}
function nameSimilarity(a,b){
 const na=normalizeLoose(a),nb=normalizeLoose(b);if(!na||!nb)return 0;if(na===nb)return 1;
 const max=Math.max(na.length,nb.length);let score=1-levenshtein(na,nb)/max;
 if(na.includes(nb)||nb.includes(na))score=Math.max(score,0.88+0.1*Math.min(na.length,nb.length)/max);
 const ta=new Set(na.split(' ')),tb=new Set(nb.split(' '));const common=[...ta].filter(x=>tb.has(x)).length;
 if(common)score=Math.max(score,0.55+0.4*(2*common/(ta.size+tb.size)));
 return Math.max(0,Math.min(1,score));
}
function similarMasterNames(type,value,limit=5){
 const table=type==='location'?'locations':'machines';
 return rows(`SELECT id,name FROM ${table} WHERE active=1`).map(x=>({...x,score:nameSimilarity(value,x.name)}))
  .filter(x=>x.score>=0.48).sort((a,b)=>b.score-a.score||String(a.name).localeCompare(String(b.name))).slice(0,limit);
}
function machineSuggestions(value,limit=5){
 const direct=similarMasterNames('machine',value,limit);
 const aliases=rows(`SELECT ma.alias,m.id,m.name FROM machine_aliases ma JOIN machines m ON m.id=ma.machine_id WHERE ma.active=1 AND m.active=1`)
  .map(x=>({id:Number(x.id),name:x.name,alias:x.alias,score:nameSimilarity(value,x.alias)})).filter(x=>x.score>=0.48);
 const all=[...direct.map(x=>({id:Number(x.id),name:x.name,alias:'',score:x.score})),...aliases].sort((a,b)=>b.score-a.score);
 const seen=new Set();return all.filter(x=>{if(seen.has(x.id))return false;seen.add(x.id);return true}).slice(0,limit);
}
function resolveMachineName(value){
 const input=String(value||'').trim();if(!input)return {machine_id:0,name:'',input,suggestions:[]};
 const exact=exactMachineResolution(input);if(exact)return {...exact,suggestions:[]};
 const suggestions=machineSuggestions(input,5);
 const top=suggestions[0],second=suggestions[1];
 const auto=top&&top.score>=0.94&&(!second||top.score-second.score>=0.07);
 return auto?{machine_id:top.id,name:top.name,input,via_alias:false,auto_similar:true,score:top.score,suggestions}:{machine_id:0,name:input,input,suggestions};
}

function existingDatabaseHasContent(){
 try{
  if(!tableExists('articles'))return false;
  const articleCount=Number(scalar('SELECT COUNT(*) FROM articles')||0);
  const movementCount=tableExists('movements')?Number(scalar('SELECT COUNT(*) FROM movements')||0):0;
  const technicianCount=tableExists('technicians')?Number(scalar('SELECT COUNT(*) FROM technicians')||0):0;
  const locationCount=tableExists('locations')?Number(scalar('SELECT COUNT(*) FROM locations')||0):0;
  const machineCount=tableExists('machines')?Number(scalar('SELECT COUNT(*) FROM machines')||0):0;
  return articleCount>0||movementCount>0||technicianCount>0||locationCount>0||machineCount>0;
 }catch{return false}
}
function adoptExistingDatabase(){
 let changed=false;
 if(existingDatabaseHasContent()&&setting('setup_complete','0')!=='1'){
  setSetting('setup_complete','1');setSetting('database_adopted','1');setSetting('database_version','82');
  if(!setting('date_format'))setSetting('date_format','DD.MM.YYYY');changed=true;
 }
 return changed;
}
function setupIsRequired(){
 return setting('setup_complete','0')!=='1'&&!existingDatabaseHasContent();
}

async function initialize(){
 SQL=await initSqlJs({locateFile:f=>`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${f}`});
 const b=await ig(DBKEY);db=b?new SQL.Database(new Uint8Array(b)):new SQL.Database();
 if(b){
  let priorVersion='';
  try{priorVersion=String(db.exec("SELECT setting_value FROM app_settings WHERE setting_key='database_version'")[0]?.values?.[0]?.[0]||'')}catch{}
  if(priorVersion!=='81'&&!(await ig('lv81-migration-backup-ok'))){
   // Original-Bytes V80 vor jeder SQLite-Schemaaenderung dauerhaft sichern.
   await writeBackupBytes(new Uint8Array(b),'Sicherheitsbackup','Original_vor_V81_Migration',false);
   await ip('lv81-migration-backup-ok','1');
  }
 }
 initSchema();const adopted=adoptExistingDatabase();
 handle=await ig(HANDLEKEY)||null;
 await initDeviceStorageMode();
 let migrated=adopted;
 migrated=migrateMachineRelationsV57()||migrated;
 try{migrated=backfillMovementAuditV55()||migrated}
 catch(e){console.warn('Audit-Nachtragung V55 konnte nicht vollständig ausgeführt werden. Die Datenbank wird trotzdem geladen.',e)}
   if(setting('database_version','')!=='81'){setSetting('database_version','81');migrated=true}
 if(!setting('date_format')){setSetting('date_format','DD.MM.YYYY');migrated=true}
 if(!setting('company_export_location')){setSetting('company_export_location','1025');migrated=true}
 if(!setting('company_export_location_name')){setSetting('company_export_location_name','Lovrencic Tobias');migrated=true}
 const m=await ig(METAKEY)||{};
 if(!m.localModified)m.localModified=currentDbState().changed_at;
 await ip(METAKEY,m);
 await persist(migrated);
 notifyLocalChanges=true;
}
function response(data,status=200,headers={}){return new Response(typeof data==='string'||data instanceof Blob||data instanceof ArrayBuffer?data:JSON.stringify(data),{status,headers:{...(typeof data==='object'&&!(data instanceof Blob)&&!(data instanceof ArrayBuffer)?{'Content-Type':'application/json'}:{}),...headers}})}
function body(opt){try{return JSON.parse(opt?.body||'{}')}catch{return {}}}
function query(url){const u=new URL(url,location.href);return Object.fromEntries(u.searchParams.entries())}
function fmtDate(d){const f=setting('date_format','DD.MM.YYYY');if(!d)return '';const x=String(d).slice(0,10).split('-');return f==='YYYY-MM-DD'?x.join('-'):f==='MM/DD/YYYY'?`${x[1]}/${x[2]}/${x[0]}`:`${x[2]}.${x[1]}.${x[0]}`}
function articles(q=''){
 let sql=`SELECT a.*,${stockExpr()} stock FROM articles a LEFT JOIN movements m ON m.article_id=a.id WHERE 1=1`,p=[];
 if(q){
  sql+=` AND (a.article_no LIKE ? OR a.description LIKE ? OR a.location LIKE ? OR a.machine LIKE ? OR EXISTS(
   SELECT 1 FROM article_machines am JOIN machines mm ON mm.id=am.machine_id
   LEFT JOIN machine_aliases ma ON ma.machine_id=mm.id AND ma.active=1
   WHERE am.article_id=a.id AND (mm.name LIKE ? OR ma.alias LIKE ?)))`;
  p=Array(6).fill('%'+q+'%');
 }
 sql+=' GROUP BY a.id ORDER BY a.article_no';
 const list=rows(sql,p);
  const pdfMachineByArticle=new Map();
  if(tableExists('service_pdf_machine_usage'))for(const use of rows(`SELECT article_id,machine,machine_code FROM service_pdf_machine_usage WHERE machine<>'' OR machine_code<>''`)){
    let values=pdfMachineByArticle.get(Number(use.article_id));if(!values){values={machines:new Set(),codes:new Set()};pdfMachineByArticle.set(Number(use.article_id),values)}
    if(use.machine)values.machines.add(use.machine);if(use.machine_code)values.codes.add(use.machine_code);
  }
  for(const a of list){const rel=machineRelationRows(a.id);a.machine_ids=rel.map(x=>Number(x.id));a.machines=rel.map(x=>x.name);
    if(rel.length)a.machine=a.machines.join(', ');
    const pdf=pdfMachineByArticle.get(Number(a.id));a.pdf_machines=pdf?[...pdf.machines]:[];a.pdf_machine_codes=pdf?[...pdf.codes]:[];
  }
 return list;
}

function publicArticle(article){
 const {purchase_price,...rest}=article||{};
 return rest;
}

function detectDeclaredImportType(text){
 const first=String(text||'').replace(/\r/g,'').split('\n').map(x=>x.trim()).find(Boolean)||'';
 const m=first.match(/^IMPORTTYP\s*:\s*(EINBUCHUNG|ENTNAHME)$/i);
 return m?m[1].toUpperCase():'';
}
function importContentLines(text){
 return String(text||'').replace(/\r/g,'').split('\n').filter(x=>!/^\s*IMPORTTYP\s*:/i.test(x)).join('\n');
}
function looksLikeServiceImport(text){
 const lines=importContentLines(text).split('\n').map(x=>x.trim()).filter(Boolean);
 if(!lines.length)return false;
 const isQty=v=>Number.isFinite(Number(String(v||'').replace(',','.')));
 let hits=0;
 for(const line of lines){
  const normalized=line.replace(/\s*[;|]\s*/g,'\t');
  if(normalized.includes('\t')){
   const cols=normalized.split('\t').map(x=>x.trim()).filter(Boolean);
   const date=normalizeExtractedDate(cols[0]||'').iso;
   if(date&&cols[1]&&(isQty(cols[2])||isQty(cols[3])))hits++;
  }else{
   const rx=/^(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{4}|\d{4}-\d{1,2}-\d{1,2})\s+[A-Za-z0-9._\/-]+\s+\d+(?:[.,]\d+)?\s+.+$/;
   if(rx.test(line))hits++;
  }
 }
 return hits>=Math.max(1,Math.ceil(lines.length/2));
}
function looksLikeDeliveryImport(text){
 const lines=importContentLines(text).split('\n').map(x=>x.trim()).filter(Boolean);
 if(!lines.length)return false;
 const isQty=v=>Number.isFinite(Number(String(v||'').replace(',','.')));
 let hits=0;
 for(const line of lines){
  const normalized=line.replace(/\s*[;|]\s*/g,'\t');
  if(normalized.includes('\t')){
   const cols=normalized.split('\t').map(x=>x.trim()).filter(Boolean);
   if(cols[0]&&(isQty(cols[1])||isQty(cols[cols.length-1])))hits++;
  }else if(/^[A-Za-z0-9._\/-]+\s+\d+(?:[.,]\d+)?\s*$/.test(line))hits++;
 }
 return hits>=Math.max(1,Math.ceil(lines.length/2));
}

function parseLines(text,{allowZero=false}={}){
 const out=[],errors=[];
 const lines=importContentLines(text).split('\n');
 const toQty=v=>Number(String(v||'').replace(',','.'));
 for(let i=0;i<lines.length;i++){
  const line=lines[i].trim();
  if(!line)continue;
  if(/^(artikel(?:nummer)?|material(?:nummer)?)\b/i.test(line)&&/\b(menge|anzahl|qty)\b/i.test(line))continue;
  const cleaned=line.replace(/\s*[;|]\s*/g,'\t').replace(/\t+/g,'\t');
  let parts=cleaned.includes('\t')?cleaned.split('\t').map(x=>x.trim()).filter(Boolean):cleaned.split(/\s+/);
  const dateAtStart=normalizeExtractedDate(parts[0]||'').iso;
  if(dateAtStart)parts.shift();
  const article=parts.shift()||'';
  let qty=NaN,desc='';
  if(parts.length){
   const firstQty=toQty(parts[0]);
   const lastQty=toQty(parts[parts.length-1]);
   if(Number.isFinite(firstQty)){
    qty=firstQty;desc=parts.slice(1).join(' ');
   }else if(Number.isFinite(lastQty)){
    qty=lastQty;desc=parts.slice(0,-1).join(' ');
   }
  }
  if(!article||!Number.isFinite(qty)||(allowZero?qty<0:qty<=0)){
   errors.push({line:i+1,article_no:article,error:'Artikelnummer oder Menge konnte nicht erkannt werden.'});
   continue;
  }
  out.push({article_no:article,quantity:qty,description:desc,line:i+1});
 }
 out.errors=errors;
 return out;
}
function matchItems(items){
 const matched=(items||[]).map(x=>{
  const a=rows('SELECT id,article_no,description FROM articles WHERE article_no=?',[x.article_no])[0];
  return {...x,article_id:a?.id||0,description:a?.description||x.description||'',found:!!a};
 });
 return {items:matched.filter(x=>x.found),unknown:matched.filter(x=>!x.found),errors:[]};
}

async function sha256Hex(value){
 const bytes=new TextEncoder().encode(String(value||''));
 const digest=await crypto.subtle.digest('SHA-256',bytes);
 return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
async function stableImportOperationId(source,text,nonce=''){
 const hash=await sha256Hex(`${String(source||'import')}\n${String(text||'').replace(/\r/g,'')}\n${String(nonce||'')}`);
 return `lv-${String(source||'import')}-${hash.slice(0,40)}`;
}
function importPositionKey(item,index=0){return item?.position_key||V67Core.normalizePositionKey(item,index)}
function importResult(operationId,source,positionKey){
 if(!operationId||!positionKey)return null;
 return rows('SELECT * FROM import_position_results WHERE operation_id=? AND source=? AND position_key=?',[operationId,source,positionKey])[0]||null;
}
function recordImportResult(operationId,source,positionKey,data={}){
 if(!operationId||!positionKey)return null;
 run(`INSERT INTO import_position_results(operation_id,source,position_key,article_no,article_id,movement_id,quantity,status,created_at)
  VALUES(?,?,?,?,?,?,?,?,?)
  ON CONFLICT(operation_id,source,position_key) DO UPDATE SET article_no=excluded.article_no,article_id=excluded.article_id,movement_id=excluded.movement_id,quantity=excluded.quantity,status=excluded.status`,[
   operationId,source,positionKey,String(data.article_no||''),Number(data.article_id||0),Number(data.movement_id||0),Number(data.quantity||0),String(data.status||''),data.created_at||stamp()
  ]);
 return importResult(operationId,source,positionKey);
}
function annotateImportPositions(items){return (items||[]).map((x,i)=>({...x,position_key:importPositionKey(x,i)}))}
function activeTechnicianNames(){return rows('SELECT name FROM technicians WHERE active=1 ORDER BY name').map(x=>x.name)}
function resolveBookingArticle(item){
 const id=Number(item?.article_id)||Number(rows('SELECT id FROM articles WHERE article_no=?',[String(item?.article_no||'').trim()])[0]?.id||0);
 if(!id)return null;
 return articles().find(x=>Number(x.id)===id)||null;
}
function validateBookingItems(items,type,d={}){
 const technician=String(d.technician||setting('primary_technician','Techniker')).trim();
 const valid=activeTechnicianNames();
 if(technician===setting('primary_technician','Techniker')&&!valid.includes(technician))valid.push(technician);
 return V67Core.validateBookingBatch(items,type,{technician,validTechnicians:valid,resolveArticle:resolveBookingArticle});
}
function recordMaterialCreationMovement(articleId,quantity,d={}){
 const aid=Number(articleId),qty=Number(quantity||0);if(!aid)throw Error('Artikel-ID für Anfangsbuchung fehlt.');if(!Number.isFinite(qty)||qty<0)throw Error('Ungültiger Ausgangsbestand.');
 run(`INSERT INTO movements(movement_date,movement_type,article_id,quantity,customer,technician,note,source,created_at,vehicle,machine,delivery_note,ticket,machine_code,sync_uuid) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[d.movement_date||today(),'IN',aid,qty,d.customer||'',d.technician||setting('primary_technician','Techniker'),d.note||'Neues Material angelegt – Anfangsbestand',d.source||'Materialanlage',stamp(),d.vehicle||'',d.machine||'',d.delivery_note||'',d.ticket||((d.source||'').includes('Servicebericht')?d.delivery_note:'')||'',d.machine_code||'',randomId()]);
 const id=Number(scalar('SELECT last_insert_rowid()')||0),movement=rows('SELECT * FROM movements WHERE id=?',[id])[0];const snapshot=movementAuditSnapshot(movement||{id,article_id:aid,movement_type:'IN',quantity:qty,...d});audit(snapshot.technician,'BUCHUNG','Buchung',String(id),createdMovementDetails(snapshot));return snapshot;
}
function writePreparedBookings(prepared,type,d={}){
 const booked=[];
 for(const x of prepared){
  const aid=Number(x.article_id),qty=Number(x.quantity);
  run(`INSERT INTO movements(movement_date,movement_type,article_id,quantity,customer,technician,note,source,created_at,vehicle,machine,delivery_note,ticket,machine_code,sync_uuid) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
   [d.movement_date||today(),type,aid,qty,d.customer||'',d.technician||setting('primary_technician','Techniker'),d.note||'',d.source||'App',stamp(),d.vehicle||'',d.machine||'',d.delivery_note||'',d.ticket||((d.source||'').includes('Servicebericht')?d.delivery_note:'')||'',d.machine_code||'',randomId()]);
  const id=Number(scalar('SELECT last_insert_rowid()')||0);
  const movement=rows('SELECT * FROM movements WHERE id=?',[id])[0];
  const snapshot=movementAuditSnapshot(movement||{id,article_id:aid,movement_type:type,quantity:qty,...d});
  audit(snapshot.technician,'BUCHUNG','Buchung',String(id),createdMovementDetails(snapshot));
  booked.push({...snapshot,position_key:x.position_key||''});
 }
 return booked;
}
function bookItems(items,type,d){
 const prepared=validateBookingItems(items,type,d);
 return writePreparedBookings(prepared,type,d);
}
function bookItemsAtomic(items,type,d){
 const prepared=validateBookingItems(items,type,d);
 return runTransaction(()=>writePreparedBookings(prepared,type,d));
}
function bookImportItemsAtomic(items,type,d,source,operationId){
 const annotated=annotateImportPositions(items);
 const pending=[];let already=0;
 for(const x of annotated){
  const prev=importResult(operationId,source,x.position_key);
  if(prev?.status==='booked'){already++;continue}
  pending.push(x);
 }
 if(!pending.length)return {booked:[],already};
 const prepared=validateBookingItems(pending,type,d);
 const booked=runTransaction(()=>{
  const b=writePreparedBookings(prepared,type,d);
  for(let i=0;i<b.length;i++)recordImportResult(operationId,source,prepared[i].position_key,{article_no:prepared[i].article_no,article_id:prepared[i].article_id,movement_id:b[i].id,quantity:prepared[i].quantity,status:'booked'});
  return b;
 });
 return {booked,already};
}
function auditValue(value){
 if(value===null||value===undefined||value==='')return '—';
 return String(value);
}
function movementTypeLabel(value){return value==='IN'?'Einbuchung':'Entnahme'}
function movementAuditSnapshot(movement){
 const article=rows('SELECT article_no,description FROM articles WHERE id=?',[movement.article_id])[0]||{};
 return {
  id:Number(movement.id),
  movement_date:movement.movement_date||'',
  movement_type:movement.movement_type||'',
  article_id:Number(movement.article_id)||0,
  article_no:article.article_no||movement.article_no||'',
  description:article.description||movement.description||'',
  quantity:Number(movement.quantity)||0,
  customer:movement.customer||'',
  technician:movement.technician||'',
  vehicle:movement.vehicle||'',
  machine:movement.machine||'',
  delivery_note:movement.delivery_note||'',
  ticket:movement.ticket||((movement.source||'').includes('Servicebericht')?movement.delivery_note:'')||'',
  machine_code:movement.machine_code||'',
  note:movement.note||'',
  source:movement.source||'',
  created_at:movement.created_at||''
 };
}
function createdMovementDetails(snapshot){
 return [
  `Buchung #${snapshot.id}`,
  '',
  `Buchungsdatum: ${auditValue(snapshot.movement_date)}`,
  `Buchungsart: ${movementTypeLabel(snapshot.movement_type)}`,
  `Artikel-ID: ${auditValue(snapshot.article_id)}`,
  `Artikelnummer: ${auditValue(snapshot.article_no)}`,
  `Bezeichnung: ${auditValue(snapshot.description)}`,
  `Menge: ${auditValue(snapshot.quantity)}`,
  `Kunde: ${auditValue(snapshot.customer)}`,
  `Techniker: ${auditValue(snapshot.technician)}`,
  `Fahrzeug: ${auditValue(snapshot.vehicle)}`,
  `Maschine: ${auditValue(snapshot.machine)}`,
  `Lieferschein: ${auditValue(snapshot.delivery_note)}`,
  `Quelle: ${auditValue(snapshot.source)}`,
  `Bemerkung: ${auditValue(snapshot.note)}`,
  `Erfasst am: ${auditValue(snapshot.created_at)}`
 ].join('\n');
}

function backfillMovementAuditV55(){
 if(setting('audit_movement_backfill_v55','')==='1')return false;
 let changed=false;
 try{
  let added=0;
  const movements=rows('SELECT * FROM movements ORDER BY id');
  for(const movement of movements){
   const id=String(movement.id);
   const exists=Number(scalar("SELECT COUNT(*) FROM audit_log WHERE action='BUCHUNG' AND entity='Buchung' AND entity_id=?",[id])||0)>0;
   if(exists)continue;
   const snapshot=movementAuditSnapshot(movement);
   audit(snapshot.technician||'Techniker','BUCHUNG','Buchung',id,createdMovementDetails(snapshot));
   added++;changed=true;
  }
  setSetting('audit_movement_backfill_v55','1');changed=true;
  if(added)audit('System','MIGRATION','Audit','',`${added} bestehende Buchung(en) mit vollständigen Buchungsdetails nachgetragen.`);
 }catch(e){console.warn('Audit-Migration übersprungen, Anwendung bleibt betriebsbereit:',e)}
 return changed;
}

function detailedMovementChanges(before,after){
 const lines=[`Buchung #${before.id} korrigiert`];
 const add=(label,oldValue,newValue)=>{
  if(String(oldValue??'')!==String(newValue??'')){
   lines.push('',`${label}:`,`Alt: ${auditValue(oldValue)}`,`Neu: ${auditValue(newValue)}`);
  }
 };
 add('Buchungsdatum',before.movement_date,after.movement_date);
 add('Buchungsart',movementTypeLabel(before.movement_type),movementTypeLabel(after.movement_type));
 add('Artikelnummer',before.article_no,after.article_no);
 add('Bezeichnung',before.description,after.description);
 add('Menge',before.quantity,after.quantity);
 add('Kunde',before.customer,after.customer);
 add('Techniker',before.technician,after.technician);
 add('Fahrzeug',before.vehicle,after.vehicle);
 add('Maschine',before.machine,after.machine);
 add('Lieferschein',before.delivery_note,after.delivery_note);
 add('Bemerkung',before.note,after.note);
 add('Quelle',before.source,after.source);
 if(lines.length===1)lines.push('','Keine inhaltliche Änderung erkannt.');
 return lines.join('\n');
}
function deletedMovementDetails(snapshot){
 return [
  `Buchung #${snapshot.id} gelöscht`,
  '',
  `Datum: ${auditValue(snapshot.movement_date)}`,
  `Buchungsart: ${movementTypeLabel(snapshot.movement_type)}`,
  `Artikelnummer: ${auditValue(snapshot.article_no)}`,
  `Bezeichnung: ${auditValue(snapshot.description)}`,
  `Menge: ${auditValue(snapshot.quantity)}`,
  `Kunde: ${auditValue(snapshot.customer)}`,
  `Techniker: ${auditValue(snapshot.technician)}`,
  `Fahrzeug: ${auditValue(snapshot.vehicle)}`,
  `Maschine: ${auditValue(snapshot.machine)}`,
  `Lieferschein: ${auditValue(snapshot.delivery_note)}`,
  `Quelle: ${auditValue(snapshot.source)}`,
  `Bemerkung: ${auditValue(snapshot.note)}`
 ].join('\n');
}

function normalizeTextValue(value){return String(value||'').trim().toLowerCase()}
function possibleDuplicateMovements(payload){
 const type=payload.movement_type||'IN';
 const date=payload.movement_date||today();
 const customer=normalizeTextValue(payload.customer);
 const machine=normalizeTextValue(payload.machine);
 const result=[];
 for(const item of payload.items||[]){
  const aid=Number(item.article_id)||rows('SELECT id FROM articles WHERE article_no=?',[item.article_no])[0]?.id;
  const qty=Number(item.quantity);
  if(!aid||!(qty>0))continue;
  const matches=rows(`SELECT m.id,m.movement_date,m.movement_type,m.quantity,m.customer,m.machine,m.technician,m.source,
   a.article_no,a.description
   FROM movements m JOIN articles a ON a.id=m.article_id
   WHERE m.movement_type=? AND m.movement_date=? AND m.article_id=? AND ABS(m.quantity-?)<0.0000001
   ORDER BY m.id DESC`,[type,date,aid,qty]).filter(x=>
    (!customer||normalizeTextValue(x.customer)===customer) &&
    (!machine||normalizeTextValue(x.machine)===machine)
   );
  result.push(...matches);
 }
 return result;
}
function stockWithoutMovement(articleId,movementId){
 const initial=Number(scalar('SELECT initial_stock FROM articles WHERE id=?',[articleId])||0);
 const incoming=Number(scalar("SELECT COALESCE(SUM(quantity),0) FROM movements WHERE article_id=? AND movement_type='IN' AND id<>?",[articleId,movementId])||0);
 const outgoing=Number(scalar("SELECT COALESCE(SUM(quantity),0) FROM movements WHERE article_id=? AND movement_type='OUT' AND id<>?",[articleId,movementId])||0);
 return initial+incoming-outgoing;
}

function csv(headers,data){const q=v=>`"${String(v??'').replaceAll('"','""')}"`;return '\ufeff'+[headers,...data].map(r=>r.map(q).join(';')).join('\r\n')}
function csvResp(name,headers,data){return response(new Blob([csv(headers,data)],{type:'text/csv;charset=utf-8'}),200,{'Content-Type':'text/csv;charset=utf-8','Content-Disposition':`attachment; filename="${name}"`})}
function workbookInput(filename,bin){
 if(!/\.(csv|txt|tsv)$/i.test(filename||''))return {data:bin,type:'array'};
 let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(bin)}catch{text=new TextDecoder('windows-1252').decode(bin)}
 return {data:text,type:'string'};
}
async function xlsxRows(filename,b64){
 const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0)),input=workbookInput(filename,bin);const wb=XLSX.read(input.data,{type:input.type});const ws=wb.Sheets[wb.SheetNames[0]];return XLSX.utils.sheet_to_json(ws,{header:1,defval:''})
}
function rowsToItems(data){
 const out=[];for(const r of data){const vals=r.map(x=>String(x??'').trim());if(!vals.some(Boolean))continue;let no=vals[0],qty=Number(vals[1].replace(',','.')),desc=vals[2]||'';if(!Number.isFinite(qty)){const ix=vals.findIndex((v,i)=>i>0&&Number.isFinite(Number(v.replace(',','.'))));if(ix>0){qty=Number(vals[ix].replace(',','.'));desc=vals.slice(1,ix).join(' ')}}if(no&&qty>0)out.push({article_no:no,quantity:qty,description:desc})}return out
}
function parseInventoryRows(data){
 const items=[],errors=[];
 let articleColumn=0,quantityColumn=1,start=0;
 const header=(data[0]||[]).map(x=>String(x??'').trim().toLowerCase());
 const articleIndex=header.findIndex(x=>/^(artikelnummer|material|artikel)$/.test(x));
 const countedIndex=header.findIndex(x=>/^(gezählter bestand|gezahlter bestand|zählbestand|zaehlbestand|menge|anzahl)$/.test(x));
 if(articleIndex>=0&&countedIndex>=0){articleColumn=articleIndex;quantityColumn=countedIndex;start=1}
 for(let i=start;i<data.length;i++){
  const row=data[i]||[];if(!row.some(x=>String(x??'').trim()))continue;
  const no=String(row[articleColumn]??'').trim(),qty=V69Core.parseQty(row[quantityColumn]);
  if(!no||!qty.valid||qty.value<0){errors.push({line:i+1,article_no:no,error:'Artikelnummer oder gültiger Zählbestand fehlt.'});continue}
  items.push({line:i+1,article_no:no,counted_stock:qty.value});
 }
 return {items,errors};
}
async function xlsxRowsFormatted(filename,b64){
 const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
 const input=workbookInput(filename,bin);
 const wb=XLSX.read(input.data,{type:input.type,cellText:true,cellNF:true});
 const preferred=wb.SheetNames.includes('SAPUI5-Export')?'SAPUI5-Export':wb.SheetNames[0];
 const ws=wb.Sheets[preferred];
 const data=XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:false});
 const header=V69Core.findHeaderRow(data);
 if(header&&input.type==='array'){
  // Quantity formats may append ST/M/L or round the display. Read the numeric
  // value of Frei verwendbar; keep formatted identifiers (e.g. leading zeros).
  // CSV quantities remain text so the German decimal comma is parsed correctly.
  const rawData=XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:true});
  const quantityColumn=header.map['Frei verwendbar'];
  for(let r=header.index+1;r<data.length;r++){
   const quantity=rawData[r]?.[quantityColumn];
   if(typeof quantity==='number')data[r][quantityColumn]=quantity;
  }
 }
 return {sheet:preferred,rows:data};
}
function companySource(mode){return mode==='inventory'?'company-inventory':'company-inbook'}
function companyArticleMap(){return new Map(articles().map(a=>[String(a.article_no),a]))}
async function companyStockXlsx(){
 if(typeof ExcelJS==='undefined')throw Error('ExcelJS ist nicht geladen.');
 const workbook=new ExcelJS.Workbook(),sheet=workbook.addWorksheet('SAPUI5-Export');
 const location=setting('company_export_location','1025'),locationName=setting('company_export_location_name','Lovrencic Tobias');
 sheet.addRow(V69Core.REQUIRED_HEADERS);
 for(const a of articles().filter(x=>x.active))sheet.addRow([String(a.article_no),String(a.description||''),String(location),String(locationName),Number(a.stock||0)]);
 sheet.getColumn(1).numFmt='@';sheet.getColumn(3).numFmt='@';sheet.getColumn(5).numFmt='0.########';
 sheet.columns.forEach((c,i)=>c.width=[18,44,14,28,16][i]||18);sheet.getRow(1).font={bold:true};
 const buf=await workbook.xlsx.writeBuffer();return new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
function companyPreview(parsed,mode,operationId){
 const source=companySource(mode),map=companyArticleMap();
 const annotated=annotateImportPositions(parsed.items||[]),base={...parsed,items:annotated};
 const preview=V69Core.previewCompanyItems(base,map,mode,x=>importResult(operationId,source,x.position_key));
 return {...preview,operation_id:operationId};
}
async function materialXlsx(d){
 const source=Array.isArray(d.items)?d.items:[];
 const grouped=new Map();
 const errors=[];

 // 1. Every row is resolved by its stable article ID.
 for(let i=0;i<source.length;i++){
  const x=source[i]||{};
  if(x.selected===false)continue;

  const consumableId=Number(x.consumable_id);
  const isConsumable=x.consumable_id!==undefined;
  const articleId=Number(isConsumable?consumableId:x.article_id);
  const qty=Number(x.quantity);

  if(!Number.isInteger(articleId)||articleId<=0){
   errors.push(`Position ${i+1}: Artikel konnte nicht eindeutig zugeordnet werden.`);
   continue;
  }
  if(!Number.isFinite(qty)||qty<=0){
   errors.push(`Position ${i+1}: Menge muss größer als 0 sein.`);
   continue;
  }

  const article=isConsumable
   ?rows("SELECT id,'' AS article_no,description,unit,active FROM consumables WHERE id=?",[articleId])[0]
   :rows('SELECT id,article_no,description,unit,active FROM articles WHERE id=?',[articleId])[0];

  if(!article||!article.active){
   errors.push(`Position ${i+1}: Artikel-ID ${articleId} ist nicht mehr vorhanden.`);
   continue;
  }

  const articleNo=String(article.article_no||'').trim();
  const description=String(article.description||'').trim();

  if(!articleNo&&!isConsumable){
   errors.push(`Position ${i+1}: Für „${description||'unbekannter Artikel'}“ fehlt die Artikelnummer.`);
   continue;
  }
  if(!description){
   errors.push(`Position ${i+1}: Für Artikel ${articleNo} fehlt die Bezeichnung.`);
   continue;
  }

  // Detect stale or shifted rows before anything is written.
  if(x.article_no!==undefined&&String(x.article_no||'').trim()&&String(x.article_no).trim()!==articleNo){
   errors.push(`Position ${i+1}: Artikelnummer stimmt nicht mehr mit den Stammdaten überein (${x.article_no} ≠ ${articleNo}). Bitte Unterbestand neu laden.`);
   continue;
  }
  if(x.description!==undefined&&String(x.description||'').trim()&&String(x.description).trim()!==description){
   errors.push(`Position ${i+1}: Bezeichnung für Artikel ${articleNo} stimmt nicht mehr mit den Stammdaten überein. Bitte Unterbestand neu laden.`);
   continue;
  }

  const key=(isConsumable?'c:':'a:')+String(article.id);
  if(!grouped.has(key)){
   grouped.set(key,{
    ...(isConsumable?{consumable_id:article.id}:{article_id:article.id}),
    is_consumable:isConsumable,
    article_no:articleNo,
    description,
    unit:String(article.unit||'Stk'),
    quantity:0,
    first_position:i+1
   });
  }
  grouped.get(key).quantity+=qty;
 }

 if(errors.length){
  throw Error('Materialanforderung nicht exportiert:\n• '+errors.join('\n• '));
 }

 const items=[...grouped.values()];
 if(!items.length)throw Error('Keine gültige Position für den Export ausgewählt.');
 if(items.length>995)throw Error('Maximal 995 Positionen sind mit der großen Vorlage möglich.');

 // Preserve the visible order from the material-request screen.
 items.sort((a,b)=>a.first_position-b.first_position);

 if(typeof ExcelJS==='undefined'){
  throw Error('Excel-Exportbibliothek konnte nicht geladen werden. Bitte Internetverbindung prüfen und die Seite neu laden.');
 }

 // 2. Load the original template as a normal workbook.
 const useLargeTemplate=items.length>25;
 const regularItems=items.filter(x=>!x.is_consumable),consumableItems=items.filter(x=>x.is_consumable);
 const consumptionRows=Math.max(10,consumableItems.length);
 const cells=items.map(x=>{
  if(useLargeTemplate)return {row:4+items.indexOf(x),qty:'B',no:'C',desc:'D'};
  return x.is_consumable?{row:31+consumableItems.indexOf(x),qty:'B',no:null,desc:'C'}:{row:4+regularItems.indexOf(x),qty:'B',no:'C',desc:'F'};
 });
 const templateFile=useLargeTemplate?'materialanforderung_vorlage_lang.xlsx':'materialanforderung_vorlage.xlsx';
 const templateResponse=await nativeFetch(templateFile);
 if(!templateResponse.ok){
  throw Error(`Excel-Vorlage ${templateFile} konnte nicht geladen werden.`);
 }
 const templateBuffer=await templateResponse.arrayBuffer();

 const workbook=new ExcelJS.Workbook();
 await workbook.xlsx.load(templateBuffer);

 const worksheet=useLargeTemplate
  ?(workbook.getWorksheet('Materialanforderung')||workbook.worksheets[0])
  :(workbook.getWorksheet('Tabelle1')||workbook.worksheets[1]);
 if(!worksheet)throw Error('Exportblatt wurde in der gewählten Excel-Vorlage nicht gefunden.');
 const technician=String(d.technician||setting('primary_technician','Techniker')).trim();
 const exportDate=new Date();exportDate.setHours(0,0,0,0);
 if(useLargeTemplate){
  worksheet.getCell('D1').value=technician;
  worksheet.getCell('F1').value=exportDate;worksheet.getCell('F1').numFmt='dd.mm.yyyy';
  for(let row=4;row<=998;row++){
   worksheet.getCell(`A${row}`).value=row-3;
   worksheet.getCell(`B${row}`).value=null;worksheet.getCell(`C${row}`).value=null;
   worksheet.getCell(`D${row}`).value=null;worksheet.getCell(`F${row}`).value=null;
  }
  items.forEach((x,index)=>{
   const row=4+index;
   worksheet.getCell(`A${row}`).value=index+1;
   worksheet.getCell(`B${row}`).value=x.quantity;worksheet.getCell(`B${row}`).numFmt=Number.isInteger(x.quantity)?'0':'General';
   worksheet.getCell(`C${row}`).value=String(x.article_no);worksheet.getCell(`C${row}`).numFmt='@';
   worksheet.getCell(`D${row}`).value=String(x.description);
  });
 }else{
  worksheet.getCell('F1').value=technician;
  worksheet.getCell('H1').value=exportDate;worksheet.getCell('H1').numFmt='dd.mm.yyyy';
  for(let row=4;row<=28;row++){
   worksheet.getCell(`B${row}`).value=null;worksheet.getCell(`C${row}`).value=null;
   worksheet.getCell(`F${row}`).value=null;worksheet.getCell(`H${row}`).value=null;
  }
  // Extend only the consumption section when more than ten free-number items are ordered.
  for(let row=31;row<31+consumptionRows;row++){
   if(row>40){
    worksheet.getRow(row).height=worksheet.getRow(40).height;
    for(let col=1;col<=8;col++)worksheet.getCell(row,col).style=JSON.parse(JSON.stringify(worksheet.getCell(40,col).style));
   }
   worksheet.getCell(`A${row}`).value=row-30;
   for(let col=2;col<=8;col++)worksheet.getCell(row,col).value=null;
  }
  worksheet.pageSetup.printArea=`A1:H${Math.max(40,30+consumptionRows)}`;
  items.forEach((x,index)=>{
   const c=cells[index];
   worksheet.getCell(`${c.qty}${c.row}`).value=x.quantity;worksheet.getCell(`${c.qty}${c.row}`).numFmt=Number.isInteger(x.quantity)?'0':'General';
   if(c.no){worksheet.getCell(`${c.no}${c.row}`).value=String(x.article_no);worksheet.getCell(`${c.no}${c.row}`).numFmt='@'}
   worksheet.getCell(`${c.desc}${c.row}`).value=String(x.description);
  });
 }
 // Avoid recalculation warnings; there are no formulas in the written area.
 workbook.calcProperties.fullCalcOnLoad=false;
 workbook.calcProperties.forceFullCalc=false;
 workbook.calcProperties.calcMode='auto';

 // 4. Generate a structurally valid XLSX through ExcelJS.
 const generated=await workbook.xlsx.writeBuffer();

 // 5. Self-test: open the generated workbook again and verify every value.
 const verificationWorkbook=new ExcelJS.Workbook();
 await verificationWorkbook.xlsx.load(generated);
 const verificationSheet=useLargeTemplate
  ?(verificationWorkbook.getWorksheet('Materialanforderung')||verificationWorkbook.worksheets[0])
  :(verificationWorkbook.getWorksheet('Tabelle1')||verificationWorkbook.worksheets[1]);

 if(!verificationSheet){
  throw Error('Interne Exportprüfung fehlgeschlagen: Exportblatt fehlt.');
 }

 const verifyErrors=[];
 const technicianCell=useLargeTemplate?'D1':'F1';
 const descriptionColumn=useLargeTemplate?'D':'F';
 const dateCell=useLargeTemplate?'F1':'H1';
 const preparedRowCount=useLargeTemplate?995:25;

 const exportedTechnician=String(verificationSheet.getCell(technicianCell).value??'').trim();
 const requestedTechnician=String(
  d.technician||setting('primary_technician','Techniker')
 ).trim();

 if(exportedTechnician!==requestedTechnician){
  verifyErrors.push(`Technikername wurde nicht korrekt übernommen (${technicianCell}).`);
 }

 const exportedDate=verificationSheet.getCell(dateCell).value;
 if(!exportedDate){
  verifyErrors.push(`Exportdatum wurde nicht korrekt übernommen (${dateCell}).`);
 }

 items.forEach((x,index)=>{
  const cell=cells[index],row=cell.row;
  const exportedQty=Number(verificationSheet.getCell(`B${row}`).value);
  const exportedNo=cell.no?String(verificationSheet.getCell(`${cell.no}${row}`).value??'').trim():'';
  const exportedDescription=String(
   verificationSheet.getCell(`${cell.desc}${row}`).value??''
  ).trim();

  if(exportedQty!==Number(x.quantity)){
   verifyErrors.push(`Position ${index+1}: Menge ${exportedQty} statt ${x.quantity}.`);
  }
  if(exportedNo!==String(x.article_no)){
   verifyErrors.push(`Position ${index+1}: Artikelnummer ${exportedNo} statt ${x.article_no}.`);
  }
  if(exportedDescription!==String(x.description)){
   verifyErrors.push(`Position ${index+1}: Bezeichnung stimmt nicht überein (${descriptionColumn}${row}).`);
  }
 });

 // Ensure no unintended data remains below the exported rows.
 for(let index=useLargeTemplate?items.length:regularItems.length;index<preparedRowCount;index++){
  const row=4+index;
  const values=[
   verificationSheet.getCell(`B${row}`).value,
   verificationSheet.getCell(`C${row}`).value,
   verificationSheet.getCell(`${descriptionColumn}${row}`).value
  ];
  if(values.some(v=>v!==null&&v!==undefined&&String(v)!=='')){
   verifyErrors.push(`Position ${index+1}: Alte Zellinhalte wurden nicht vollständig entfernt.`);
   break;
  }
 }

 if(!useLargeTemplate){
  for(let row=31+consumableItems.length;row<31+consumptionRows;row++){
   if(['B','C'].some(col=>verificationSheet.getCell(`${col}${row}`).value!=null))verifyErrors.push(`Verbrauchsmaterial: alte Zellinhalte in Zeile ${row}.`);
  }
 }
 if(verifyErrors.length){
  throw Error('Interne Prüfung der gewählten Excel-Vorlage fehlgeschlagen:\n• '+verifyErrors.join('\n• '));
 }

 return {
  blob:new Blob(
   [generated],
   {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
  ),
  count:items.length,
  items:items.map(({first_position,...x})=>x),
  template_type:useLargeTemplate?'large':'standard'
 };
}

function normalizeExtractedDate(value){
 const raw=String(value||'').trim();
 if(!raw)return {iso:'',display:''};
 let m=raw.match(/\b(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})\b/);
 if(m){
  const day=String(Number(m[1])).padStart(2,'0');
  const month=String(Number(m[2])).padStart(2,'0');
  return {iso:`${m[3]}-${month}-${day}`,display:`${day}.${month}.${m[3]}`};
 }
 m=raw.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
 if(m){
  const month=String(Number(m[2])).padStart(2,'0');
  const day=String(Number(m[3])).padStart(2,'0');
  return {iso:`${m[1]}-${month}-${day}`,display:`${day}.${month}.${m[1]}`};
 }
 return {iso:'',display:raw};
}

function parseServiceTsv(text){
 const lines=importContentLines(text).split('\n').map(x=>x.trimEnd()).filter(x=>x.trim());
 const items=[];
 const errors=[];
 const rows=[];
 let firstMetadata={movement_date:'',display_date:'',customer:'',machine:'',machine_input:'',machine_id:0,machine_suggestions:[]};
 const toQty=v=>Number(String(v||'').replace(',','.'));

 for(let i=0;i<lines.length;i++){
  const normalizedLine=lines[i].replace(/\s*[;|]\s*/g,'\t');
  if(!normalizedLine.includes('\t'))continue;
  const cols=normalizedLine.split('\t').map(x=>x.trim()).filter(x=>x!=='');

  const normalized=cols.map(x=>x.toLowerCase().replace(/\s+/g,' '));
  if(
   normalized[0]?.includes('datum') &&
   normalized[1]?.includes('artikel') &&
   (normalized.some(x=>x.includes('anzahl'))||normalized.some(x=>x.includes('menge')))
  ) continue;

  if(cols.length<5){
   errors.push({line:i+1,article_no:cols[1]||'',error:'Zeile enthält zu wenige Spalten.'});
   continue;
  }

  const dateValue=cols[0];
  const articleNo=cols[1];
  let description='',quantityValue='',customerValue='',machineValue='';

  // Neues Format: Datum | Artikel | Bezeichnung | Anzahl | Kunde | Maschine
  if(cols.length>=6 && !Number.isFinite(toQty(cols[2])) && Number.isFinite(toQty(cols[3]))){
   description=cols[2];
   quantityValue=cols[3];
   customerValue=cols[4];
   machineValue=cols.slice(5).join(' ');
  }else{
   // Rückwärtskompatibel: Datum | Artikel | Anzahl | Kunde | Maschine
   quantityValue=cols[2];
   customerValue=cols[3];
   machineValue=cols.slice(4).join(' ');
  }

  const parsedDate=normalizeExtractedDate(dateValue);
  const qty=toQty(quantityValue);
  const article=String(articleNo||'').trim();

  if(!article)continue;

  const lowerArticle=article.toLowerCase();
  const combined=cols.join(' ').toLowerCase();
  if(
   lowerArticle.includes('fahrzeit') ||
   lowerArticle.includes('arbeitszeit') ||
   lowerArticle.includes('kilometer') ||
   combined.includes('fahrzeit') ||
   combined.includes('arbeitszeit') ||
   combined.includes('kilometer')
  ) continue;

  if(!Number.isFinite(qty)||qty<=0){
   errors.push({line:i+1,article_no:article,error:'Anzahl fehlt oder ist ungültig.'});
   continue;
  }

  const rowMeta={
   movement_date:parsedDate.iso,
   display_date:parsedDate.display,
   customer:String(customerValue||'').trim(),
   machine:String(machineValue||'').trim()
  };
  rows.push({article_no:article,description:String(description||'').trim(),quantity:qty,line:i+1,metadata:rowMeta});
  items.push({article_no:article,description:String(description||'').trim(),quantity:qty,line:i+1});

  if(!firstMetadata.movement_date&&rowMeta.movement_date)firstMetadata.movement_date=rowMeta.movement_date;
  if(!firstMetadata.display_date&&rowMeta.display_date)firstMetadata.display_date=rowMeta.display_date;
  if(!firstMetadata.customer&&rowMeta.customer)firstMetadata.customer=rowMeta.customer;
  if(!firstMetadata.machine&&rowMeta.machine)firstMetadata.machine=rowMeta.machine;
 }

 return {matched:rows.length>0,items,metadata:firstMetadata,rows,errors};
}


function machineCandidates(){
 const canonical=rows('SELECT id,name FROM machines WHERE active=1').map(x=>({match_name:x.name,canonical_name:x.name,machine_id:Number(x.id),alias:false}));
 const aliases=rows(`SELECT ma.alias,m.id,m.name FROM machine_aliases ma JOIN machines m ON m.id=ma.machine_id WHERE ma.active=1 AND m.active=1`)
  .map(x=>({match_name:x.alias,canonical_name:x.name,machine_id:Number(x.id),alias:true}));
 return [...canonical,...aliases].sort((a,b)=>b.match_name.length-a.match_name.length);
}
function normalizeLoose(value){
 return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9.]+/g,' ').replace(/\s+/g,' ').trim();
}
function splitCustomerAndMachine(remainder){
 const source=String(remainder||'').trim();
 if(!source)return {customer:'',machine:'',machine_input:''};
 const normalized=normalizeLoose(source);
 for(const candidate of machineCandidates()){
  const nc=normalizeLoose(candidate.match_name);if(!nc)continue;
  if(normalized===nc)return {customer:'',machine:candidate.canonical_name,machine_input:candidate.match_name,machine_id:candidate.machine_id,via_alias:candidate.alias};
  if(normalized.endsWith(' '+nc)){
   const words=source.split(/\s+/),count=candidate.match_name.split(/\s+/).length;
   return {customer:words.slice(0,-count).join(' '),machine:candidate.canonical_name,machine_input:words.slice(-count).join(' '),machine_id:candidate.machine_id,via_alias:candidate.alias};
  }
 }
 const keywords=/\b(compas|croissomat|rondostar|rondinette|ecostar|brotstar|polyline|kombi|smc|sko|croissantwickler|teigteiler)\b/i;
 const words=source.split(/\s+/),index=words.findIndex(word=>keywords.test(word));
 if(index>=0){
  const rawMachine=words.slice(index).join(' '),resolved=resolveMachineName(rawMachine);
  return {customer:words.slice(0,index).join(' '),machine:resolved.machine_id?resolved.name:rawMachine,machine_input:rawMachine,machine_id:resolved.machine_id||0,via_alias:!!resolved.via_alias,suggestions:resolved.suggestions||[]};
 }
 return {customer:source,machine:'',machine_input:''};
}
function parseFlexibleServiceRows(text){
 const lines=importContentLines(text).split('\n');
 const items=[],rowsOut=[],errors=[];
 let firstMetadata={movement_date:'',display_date:'',customer:'',machine:'',machine_input:'',machine_id:0,machine_suggestions:[]};
 for(let i=0;i<lines.length;i++){
  const line=lines[i].trim();
  if(!line)continue;
  if(/^(datum|date)\b/i.test(line)&&/\b(artikel|material)\b/i.test(line))continue;
  const m=line.match(/^(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{4}|\d{4}-\d{1,2}-\d{1,2})[\t ;|]+([A-Za-z0-9._\/-]+)[\t ;|]+(\d+(?:[.,]\d+)?)[\t ;|]+(.+)$/);
  if(!m)continue;
  const parsedDate=normalizeExtractedDate(m[1]);
  const article=m[2].trim();
  const qty=Number(m[3].replace(',','.'));
  const rest=splitCustomerAndMachine(m[4]);
  if(!Number.isFinite(qty)||qty<=0){
   errors.push({line:i+1,article_no:article,error:'Anzahl fehlt oder ist ungültig.'});
   continue;
  }
  const metadata={movement_date:parsedDate.iso,display_date:parsedDate.display,customer:rest.customer,machine:rest.machine,machine_input:rest.machine_input||rest.machine,machine_id:rest.machine_id||0,machine_suggestions:rest.suggestions||[]};
  items.push({article_no:article,quantity:qty,line:i+1});
  rowsOut.push({article_no:article,quantity:qty,line:i+1,metadata});
  if(!firstMetadata.movement_date)firstMetadata.movement_date=metadata.movement_date;
  if(!firstMetadata.display_date)firstMetadata.display_date=metadata.display_date;
  if(!firstMetadata.customer)firstMetadata.customer=metadata.customer;
  if(!firstMetadata.machine)firstMetadata.machine=metadata.machine;if(!firstMetadata.machine_input)firstMetadata.machine_input=metadata.machine_input;if(!firstMetadata.machine_id)firstMetadata.machine_id=metadata.machine_id;if(!firstMetadata.machine_suggestions.length&&metadata.machine_suggestions?.length)firstMetadata.machine_suggestions=metadata.machine_suggestions;
 }
 return {matched:rowsOut.length>0,items,rows:rowsOut,metadata:firstMetadata,errors};
}

function parseServiceReport(text){
 const tsv=parseServiceTsv(text);
 if(tsv.matched)return {items:tsv.items,metadata:tsv.metadata,rows:tsv.rows,errors:tsv.errors};
 const flexible=parseFlexibleServiceRows(text);
 if(flexible.matched)return {items:flexible.items,metadata:flexible.metadata,rows:flexible.rows,errors:flexible.errors};
 const raw=String(text||'').replace(/\r/g,'');
 const lines=raw.split('\n');
 const metadata={movement_date:'',display_date:'',customer:'',machine:''};
 const items=[];
 const errors=[];
 let pendingArticle='';
 let pendingLine=0;

 const pushItem=(article,quantity,line)=>{
  const no=String(article||'').trim();
  const qty=Number(String(quantity||'').replace(',','.'));
  if(!no)return;
  if(!Number.isFinite(qty)||qty<=0){
   errors.push({line,article_no:no,error:'Menge fehlt oder ist ungültig.'});
   return;
  }
  items.push({article_no:no,quantity:qty,line});
 };

 for(let i=0;i<lines.length;i++){
  const original=lines[i];
  const line=original.trim();
  if(!line)continue;
  let m;

  if((m=line.match(/^(?:datum|date|einsatzdatum)\s*[:\-]\s*(.+)$/i))){
   const parsed=normalizeExtractedDate(m[1]);
   metadata.movement_date=parsed.iso;
   metadata.display_date=parsed.display;
   continue;
  }
  if((m=line.match(/^(?:kunde|customer|kundename)\s*[:\-]\s*(.*)$/i))){
   metadata.customer=m[1].trim();
   continue;
  }
  if((m=line.match(/^(?:maschine|machine|anlage|maschinentyp)\s*[:\-]\s*(.*)$/i))){
   metadata.machine=m[1].trim();
   continue;
  }
  if((m=line.match(/^(?:artikelnummer|artikel[- ]?nr\.?|materialnummer|material[- ]?nr\.?)\s*[:\-]\s*([A-Za-z0-9._\/-]+)(?:\s+(?:menge|qty|anzahl)\s*[:\-]?\s*([\d.,]+))?$/i))){
   if(pendingArticle)errors.push({line:pendingLine,article_no:pendingArticle,error:'Menge fehlt.'});
   pendingArticle=m[1].trim();
   pendingLine=i+1;
   if(m[2]){
    pushItem(pendingArticle,m[2],i+1);
    pendingArticle='';
   }
   continue;
  }
  if((m=line.match(/^(?:menge|qty|anzahl)\s*[:\-]\s*([\d.,]+)$/i))){
   if(pendingArticle){
    pushItem(pendingArticle,m[1],pendingLine||i+1);
    pendingArticle='';
   }else{
    errors.push({line:i+1,article_no:'',error:'Menge ohne vorherige Artikelnummer.'});
   }
   continue;
  }

  // Compact formats: "7079 2", "7079;2" or "Artikelnummer: 7079; Menge: 2"
  m=line.match(/^(?:artikelnummer\s*[:\-]\s*)?([A-Za-z0-9._\/-]+)\s*[;,\t ]+\s*(?:menge\s*[:\-]?\s*)?(\d+(?:[.,]\d+)?)$/i);
  if(m){
   if(pendingArticle)errors.push({line:pendingLine,article_no:pendingArticle,error:'Menge fehlt.'});
   pendingArticle='';
   pushItem(m[1],m[2],i+1);
   continue;
  }
 }
 if(pendingArticle)errors.push({line:pendingLine,article_no:pendingArticle,error:'Menge fehlt.'});

 // Backward-compatible fallback for older two-column Copilot output.
 if(!items.length){
  const legacy=parseLines(raw);
  for(const x of legacy)items.push(x);
 }
 return {items,metadata,errors};
}

 function recordDeletionV82(entityType,entityKey,item,reason=''){
  const previous=JSON.stringify(item||{});
  run('INSERT OR IGNORE INTO sync_deletions(event_uuid,entity_type,entity_key,article_no,customer,ticket,machine,deleted_at,previous_json,reason) VALUES(?,?,?,?,?,?,?,?,?,?)',[
   randomId(),entityType,String(entityKey||''),String(item?.article_no||''),String(item?.customer||''),String(item?.ticket||item?.delivery_note||''),String(item?.machine||''),stamp(),previous,reason
  ]);
 }

async function route(url,opt={}){
 await ready;const u=new URL(url,location.href);if(!u.pathname.startsWith('/api/'))return nativeFetch(url,opt);const p=u.pathname,q=Object.fromEntries(u.searchParams),d=body(opt);
 try{
 if(p.startsWith('/api/service-pdf/')){if(opt.method!=='POST')throw Error('PDF-Import benötigt eine POST-Anfrage.');return response(await ServicePDF.handle(p.slice('/api/service-pdf/'.length),d));}
 if(p.startsWith('/api/warehouse76/')){
  const action=p.slice('/api/warehouse76/'.length);
  if((action==='index')===(opt.method==='POST'))throw Error('Ungültige Anfragemethode.');
  return response(await Warehouse.handle(action,d));
 }
 if(p.startsWith('/api/inventory-v75/')){
  const action=p.slice('/api/inventory-v75/'.length),readOnly=['index','get','preview','export'].includes(action);
  if((opt.method==='POST')===readOnly)throw Error('Ungültige Anfragemethode.');
  const input=opt.method==='POST'?d:q;
  if(action==='export'){
   const v=Inventory.view(input.id);
   return csvResp(`Inventur_${safeName(v.session.name)}.csv`,['Inventur','Status','Artikelnummer','Bezeichnung','Einheit','Bestand bei Beginn','Gezählt','Differenz','Lagerort vorher','Lagerort gezählt','Lager vorher','Lager gezählt','Notiz'],v.items.map(x=>[v.session.name,v.session.status,x.article_no,x.description,x.unit,x.base_stock,x.counted_stock===null?'':x.counted_stock,x.difference===null?'':x.difference,x.base_location,x.location,v.warehouses.find(w=>w.id===x.base_warehouse_id)?.name||'',v.warehouses.find(w=>w.id===x.warehouse_id)?.name||'',x.note]));
  }
  return response(await Inventory.handle(action,input,opt));
 }
 if(opt.method!=='POST'){
  if(p==='/api/info')return response({version:'82.0',articles:scalar('SELECT COUNT(*) FROM articles WHERE active=1'),movements:scalar('SELECT COUNT(*) FROM movements'),setup_required:setupIsRequired(),date_format:setting('date_format','DD.MM.YYYY')});
  if(p==='/api/setup/status')return response({setup_required:setupIsRequired(),date_format:setting('date_format','DD.MM.YYYY'),technician:setting('primary_technician','')});
  if(p==='/api/admin/password-status'){const has=!!setting('admin_password_hash');return response({setup_required:!has,password_setup_required:!has,has_password:has,can_unlock:has,database_setup_required:setupIsRequired()})};
  if(p==='/api/settings')return response({date_format:setting('date_format','DD.MM.YYYY'),date_formats:['DD.MM.YYYY','YYYY-MM-DD','MM/DD/YYYY']});
  if(p==='/api/company/settings')return response({location:setting('company_export_location','1025'),location_name:setting('company_export_location_name','Lovrencic Tobias')});
  if(p==='/api/masterdata/similar'){
   const type=q.type==='location'?'location':'machine';return response({suggestions:type==='machine'?machineSuggestions(q.q||'',5):similarMasterNames(type,q.q||'',5)});
  }
  if(p==='/api/masterdata')return response({warehouses:Warehouse.refs().warehouses,default_warehouse_id:Warehouse.defaultId(),default_technician:setting('primary_technician','Techniker'),locations:rows('SELECT * FROM locations WHERE active=1 ORDER BY name'),machines:rows('SELECT * FROM machines WHERE active=1 ORDER BY name'),machine_aliases:rows(`SELECT ma.id,ma.alias,ma.machine_id,m.name machine_name FROM machine_aliases ma JOIN machines m ON m.id=ma.machine_id WHERE ma.active=1 ORDER BY m.name,ma.alias`),machine_merges:rows(`SELECT h.id,h.source_machine_id,h.target_machine_id,h.source_name,h.merged_at,t.name target_name FROM machine_merge_history h JOIN machines t ON t.id=h.target_machine_id WHERE h.active=1 ORDER BY h.id DESC`),technicians:rows('SELECT * FROM technicians WHERE active=1 ORDER BY name'),vehicles:rows('SELECT * FROM vehicles WHERE active=1 ORDER BY name')});
  if(p==='/api/articles')return response(articles(q.q||'').map(publicArticle));
  if(p==='/api/dashboard'){
   const a=articles().filter(x=>x.active);const lowSummary=AppRules.lowStockSummary(a,8);
   const recent=rows('SELECT m.id,m.movement_date,m.movement_type,a.article_no,a.description,m.quantity,m.technician,m.customer,m.machine FROM movements m JOIN articles a ON a.id=m.article_id ORDER BY m.id DESC LIMIT 20');
   const top=rows("SELECT a.article_no,a.description,SUM(m.quantity) quantity FROM movements m JOIN articles a ON a.id=m.article_id WHERE m.movement_type='OUT' GROUP BY a.id ORDER BY quantity DESC LIMIT 8");
   return response({articles:a.length,low_stock:lowSummary.count,today:scalar('SELECT COUNT(*) FROM movements WHERE movement_date=?',[today()]),movements:scalar('SELECT COUNT(*) FROM movements'),low_stock_items:lowSummary.preview.map(publicArticle),low_stock_all:lowSummary.all.map(publicArticle),low_stock_has_more:lowSummary.has_more,recent,top_out:top})
  }
  if(p==='/api/consumables')return response(rows('SELECT id,description,unit FROM consumables WHERE active=1 ORDER BY description COLLATE NOCASE'));
  if(p==='/api/material-request')return response(articles().filter(x=>x.active).map(x=>({x,req:AppRules.materialRequestSuggestion(x,q.mode==='target'?'target':'minimum')})).filter(v=>v.req.needed).map(v=>({...publicArticle(v.x),order_target:v.req.goal,suggested_quantity:v.req.suggested_quantity})));
  if(p==='/api/recent-movements'){const type=q.type==='OUT'?'OUT':'IN';return response(rows(`SELECT m.*,a.article_no,a.description FROM movements m JOIN articles a ON a.id=m.article_id WHERE m.movement_type=? ORDER BY m.id DESC LIMIT 20`,[type]))}
 if(p==='/api/history'){
  let list=rows('SELECT m.*,a.article_no,a.description FROM movements m JOIN articles a ON a.id=m.article_id ORDER BY m.movement_date DESC,m.id DESC');
  if(q.type&&q.type!=='ALL')list=list.filter(x=>x.movement_type===q.type);
  if(q.date_from)list=list.filter(x=>x.movement_date>=q.date_from);
  if(q.date_to)list=list.filter(x=>x.movement_date<=q.date_to);
  if(q.technician)list=list.filter(x=>normalizeTextValue(x.technician).includes(normalizeTextValue(q.technician)));
  if(q.customer)list=list.filter(x=>normalizeTextValue(x.customer).includes(normalizeTextValue(q.customer)));
  if(q.article_no)list=list.filter(x=>normalizeTextValue(x.article_no).includes(normalizeTextValue(q.article_no)));
  if(q.description)list=list.filter(x=>normalizeTextValue(x.description).includes(normalizeTextValue(q.description)));
  if(q.machine)list=list.filter(x=>normalizeTextValue(x.machine).includes(normalizeTextValue(q.machine)));
  return response(list)
 }
  if(p==='/api/audit')return response(rows('SELECT * FROM audit_log ORDER BY id DESC'));
  if(p==='/api/help/list')return response(Object.keys(helpData).sort().map(file=>({file,title:file.slice(0,-3).replace(/[-_]/g,' ')})));
  if(p==='/api/help/content')return response({file:q.file,content:helpData[q.file]||'# Nicht gefunden'});
  const exType=p==='/api/export/inbookings.csv'?'IN':p==='/api/export/outbookings.csv'?'OUT':null;
  if(exType){const list=rows('SELECT m.*,a.article_no,a.description FROM movements m JOIN articles a ON a.id=m.article_id WHERE m.movement_type=? ORDER BY m.id DESC',[exType]);return csvResp(`${exType==='IN'?'Einbuchungen':'Entnahmen'}_${fmtDate(today())}.csv`,['Datum','Art','Artikel','Bezeichnung','Menge','Kunde','Techniker','Fahrzeug','Maschine','Lieferschein','Quelle'],list.map(x=>[fmtDate(x.movement_date),exType==='IN'?'Einbuchung':'Entnahme',x.article_no,x.description,x.quantity,x.customer,x.technician,x.vehicle,x.machine,x.delivery_note,x.source]))}
  if(p==='/api/export/history.csv'){const list=(await (await route('/api/history?'+u.searchParams.toString())).json());return csvResp(`Historie_${fmtDate(today())}.csv`,['Datum','Art','Artikelnummer','Bezeichnung','Menge','Kunde','Techniker','Fahrzeug','Maschine','Lieferschein','Quelle','Bemerkung'],list.map(x=>[fmtDate(x.movement_date),x.movement_type==='IN'?'Einbuchung':'Entnahme',x.article_no,x.description,x.quantity,x.customer,x.technician,x.vehicle,x.machine,x.delivery_note,x.source,x.note]))}
  if(p==='/api/export/stock.csv'){const a=articles();return csvResp(`Lagerbestand_${fmtDate(today())}.csv`,['Artikelnummer','Bezeichnung','Sollbestand','Mindestbestand','Istbestand','Einheit','Lagerort','Maschine','Hersteller','Lieferant'],a.map(x=>[x.article_no,x.description,x.target_stock,x.minimum_stock,x.stock,x.unit,x.location,x.machine,x.manufacturer,x.supplier]))}
  if(p==='/api/export/inventory.csv'){const a=articles();return csvResp(`Inventur_${fmtDate(today())}.csv`,['Artikelnummer','Bezeichnung','Systembestand','Gezählter Bestand','Lagerort','Maschine'],a.map(x=>[x.article_no,x.description,x.stock,'',x.location,x.machine]))}
  if(p==='/api/export/company-stock.csv'){
   const content=V69Core.companyCsv(articles().filter(x=>x.active),setting('company_export_location','1025'),setting('company_export_location_name','Lovrencic Tobias'));
   return response(new Blob([content],{type:'text/csv;charset=utf-8'}),200,{'Content-Type':'text/csv;charset=utf-8','Content-Disposition':`attachment; filename="Lagerbestand_Firma_${fmtDate(today())}.csv"`});
  }
  if(p==='/api/export/company-stock.xlsx')return response(await companyStockXlsx(),200,{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':`attachment; filename="Lagerbestand_Firma_${fmtDate(today())}.xlsx"`});
 }
 if(p==='/api/company/settings'){
  const location=String(d.location??'').trim()||'1025',locationName=String(d.location_name??'').trim()||'Lovrencic Tobias';
  const unchanged=location===setting('company_export_location','1025')&&locationName===setting('company_export_location_name','Lovrencic Tobias');
  if(!unchanged){setSetting('company_export_location',location);setSetting('company_export_location_name',locationName);audit(d.technician||setting('primary_technician','Techniker'),'FIRMENEXPORT','Einstellungen','',`Lagerort: ${location}\nBezeichnung: ${locationName}`);await persist()}
  return response({ok:true,location,location_name:locationName,unchanged});
 }
 if(p==='/api/setup/complete'){if(!setupIsRequired())throw Error('Die Ersteinrichtung ist bereits abgeschlossen.');V67Core.validateSetupPasswords(d.password,d.repeat_password);await setAdminPassword(d.password);setSetting('primary_technician',d.technician||'Techniker');setSetting('date_format',d.date_format||'DD.MM.YYYY');await setDeviceStorageMode(handle&&['cloud','local_folder'].includes(d.storage_mode)?d.storage_mode:'browser_local');setSetting('setup_complete','1');run('INSERT OR IGNORE INTO technicians(name) VALUES(?)',[d.technician||'Techniker']);audit(d.technician,'EINRICHTUNG','System','','Ersteinrichtung');await persist();return response({ok:true,date_format:setting('date_format','DD.MM.YYYY'),storage_mode:storageMode(),token:adminSessions.issue()})}
 if(p==='/api/settings/date-format'){requireAdminSession(opt,'Für die Datumsformatänderung ist eine gültige Administrator-Sitzung erforderlich.');setSetting('date_format',d.date_format);await persist();return response({ok:true,date_format:setting('date_format','DD.MM.YYYY')})}
 if(p==='/api/admin/unlock'){const ok=await validPw(d.password);if(ok){await migrateLegacyPasswordIfNeeded(d.password);return response({ok:true,token:adminSessions.issue(),has_password:true})}return response({ok:false,has_password:!!setting('admin_password_hash')})}
 if(p==='/api/admin/lock'){adminSessions.revoke();return response({ok:true})}
 if(p==='/api/admin/setup-password'){if(setting('admin_password_hash',''))throw Error('Ein Administratorpasswort ist bereits eingerichtet. Verwende „Passwort ändern“.');const np=d.password||d.new_password||d.newPassword||'';const rp=d.repeat_password||d.repeatPassword||np;if(!np||np.length<8)throw Error('Passwort muss mindestens 8 Zeichen haben.');if(np!==rp)throw Error('Die Passwörter stimmen nicht überein.');await setAdminPassword(np);setSetting('setup_complete','1');setSetting('database_adopted','1');audit('Administrator','PASSWORT','System','','Administratorpasswort erstmalig eingerichtet');await persist();return response({ok:true,has_password:true,token:adminSessions.issue()})}
 if(p==='/api/admin/change-password'){const oldpw=d.old_password||d.current_password||'';const newpw=d.new_password||'';const repeat=d.repeat_password??newpw;if(!await validPw(oldpw))throw Error('Bisheriges Passwort ist falsch.');if(!newpw||newpw.length<8)throw Error('Neues Passwort muss mindestens 8 Zeichen haben.');if(newpw!==repeat)throw Error('Die neuen Passwörter stimmen nicht überein.');await setAdminPassword(newpw);adminSessions.revoke();const token=adminSessions.issue();audit('Administrator','PASSWORT','System','','Administratorpasswort geändert');await persist();return response({ok:true,token})}
 if(p==='/api/admin/reset'){if(!await adminAuthorized(d,opt))throw Error('Passwort ist falsch oder die Stammdaten sind nicht freigeschaltet.');db.close();db=new SQL.Database();initSchema();await persist();return response({ok:true})}
 
 if(p==='/api/movements/duplicates'){
  return response({duplicates:possibleDuplicateMovements(d),count:possibleDuplicateMovements(d).length});
 }
 if(p==='/api/movement/update'){
  if(!await adminAuthorized(d,opt)&&!await validPw(d.password||''))throw Error('Administratorpasswort ist falsch.');
  const id=Number(d.id);
  const old=rows('SELECT * FROM movements WHERE id=?',[id])[0];
  if(!old)throw Error('Buchung wurde nicht gefunden.');
  const before=movementAuditSnapshot(old);
  const articleId=Number(d.article_id);
  const quantity=Number(d.quantity);
  if(!articleId||!(quantity>0))throw Error('Artikel und Menge müssen gültig sein.');
  const article=rows('SELECT id,article_no FROM articles WHERE id=?',[articleId])[0];
  if(!article)throw Error('Der ausgewählte Artikel existiert nicht mehr.');

  const affected=[...new Set([Number(old.article_id),articleId])];
  for(const aid of affected){
   let base=stockWithoutMovement(aid,id);
   if(aid===articleId)base+=(d.movement_type==='IN'?quantity:-quantity);
   if(base< -0.0000001){
    const no=scalar('SELECT article_no FROM articles WHERE id=?',[aid])||aid;
    throw Error(`Die Korrektur würde für Artikel ${no} einen negativen Bestand erzeugen.`);
   }
  }

  await createBackup('Sicherheitsbackup','Vor Buchungskorrektur');
  run(`UPDATE movements SET movement_date=?,movement_type=?,article_id=?,quantity=?,customer=?,technician=?,
   note=?,vehicle=?,machine=?,delivery_note=?,source=?,ticket=?,machine_code=? WHERE id=?`,[
    d.movement_date||today(),d.movement_type==='OUT'?'OUT':'IN',articleId,quantity,
    d.customer||'',d.technician||'',d.note||'',d.vehicle||'',d.machine||'',
    d.delivery_note||'',old.source||'App',d.ticket??old.ticket??'',d.machine_code??old.machine_code??'',id
  ]);
  const changed=rows('SELECT * FROM movements WHERE id=?',[id])[0];
  const after=movementAuditSnapshot(changed);
  audit('Administrator','KORREKTUR','Buchung',String(id),detailedMovementChanges(before,after));
  await persist();
  return response({ok:true,id});
 }
 if(p==='/api/movement/delete'){
  if(!await adminAuthorized(d,opt)&&!await validPw(d.password||''))throw Error('Administratorpasswort ist falsch.');
  const id=Number(d.id);
  const old=rows(`SELECT m.*,a.article_no,a.description FROM movements m
   JOIN articles a ON a.id=m.article_id WHERE m.id=?`,[id])[0];
  if(!old)throw Error('Buchung wurde nicht gefunden.');
  const snapshot=movementAuditSnapshot(old);
  const resulting=stockWithoutMovement(Number(old.article_id),id);
  if(resulting< -0.0000001)throw Error('Diese Buchung kann nicht gelöscht werden, weil dadurch ein negativer Lagerbestand entstehen würde.');
  await createBackup('Sicherheitsbackup','Vor Buchungslöschung');
  recordDeletionV82('movement',old.sync_uuid||`legacy:${currentDbState().database_id}:movement:${id}`,snapshot,'Buchung vom Benutzer gelöscht');
  run('DELETE FROM movements WHERE id=?',[id]);
  audit('Administrator','LÖSCHUNG','Buchung',String(id),deletedMovementDetails(snapshot));
  await persist();
  return response({ok:true,id});
 }

 if(p==='/api/movements'){
  const type=d.movement_type==='OUT'?'OUT':'IN';
  const prepared=validateBookingItems(d.items||[d],type,d);
  const booked=runTransaction(()=>writePreparedBookings(prepared,type,d));
  await persist();return response({ok:true,count:booked.length},201)
 }
 if(p==='/api/company-import/file-preview'){
  const mode=d.mode==='inbook'?'inbook':'inventory';
  const rr=await xlsxRowsFormatted(d.filename,d.content_base64),parsed=V69Core.parseCompanyRows(rr.rows);
  const operationId=await stableImportOperationId(companySource(mode),JSON.stringify({sheet:rr.sheet,items:parsed.items,errors:parsed.errors}),d.new_operation_nonce||'');
  const preview=companyPreview(parsed,mode,operationId);
  return response({...preview,sheet:rr.sheet,mode,total_rows:parsed.items.length,company_columns:V69Core.REQUIRED_HEADERS});
 }
 if(p==='/api/company-import/commit'){
  const mode=d.mode==='inbook'?'inbook':'inventory',source=companySource(mode),operationId=String(d.operation_id||'').trim();
  if(!operationId)throw Error('Vorgangskennung fehlt. Bitte die Firmenliste erneut prüfen.');
  if(mode==='inventory')V67Core.requireAdmin(await adminAuthorized(d,opt),'Für Inventurkorrekturen ist eine gültige Administrator-Sitzung erforderlich.');
  const technician=String(d.technician||setting('primary_technician','Techniker')).trim(),validTech=activeTechnicianNames();if(technician===setting('primary_technician','Techniker')&&!validTech.includes(technician))validTech.push(technician);if(!technician||!validTech.includes(technician))throw Error('Techniker ist nicht gültig.');
  const actions=d.unknown_actions||{},internalLocation=String(d.internal_location||'').trim(),seen=new Set(),plans=[];
  for(let i=0;i<(d.items||[]).length;i++){
   const x=d.items[i]||{},articleNo=String(x.article_no||'').trim(),positionKey=String(x.position_key||importPositionKey(x,i));
   if(!articleNo)throw Error(`Artikelnummer fehlt in Zeile ${x.line||i+1}.`);
   const key=articleNo.toLocaleLowerCase('de-DE');if(seen.has(key))throw Error(`Doppelte Artikelnummer ${articleNo} im bestätigten Vorgang.`);seen.add(key);
   const qty=Number(x.quantity);if(!Number.isFinite(qty)||(mode==='inventory'?qty<0:qty<=0))throw Error(`Ungültige Menge für ${articleNo}.`);
   const prior=importResult(operationId,source,positionKey);if(prior){plans.push({kind:'processed',x,positionKey,prior});continue}
   const article=resolveBookingArticle(x)||rows('SELECT id,article_no,description FROM articles WHERE article_no=?',[articleNo])[0];
   if(article){
    const full=articles().find(a=>Number(a.id)===Number(article.id));
    if(mode==='inventory'){
     const diff=qty-Number(full?.stock||0);plans.push({kind:Math.abs(diff)<1e-9?'unchanged':'adjust',x,positionKey,article:full,diff,quantity:qty});
    }else plans.push({kind:'book',x,positionKey,article:full,quantity:qty});
   }else{
    const action=String(actions[positionKey]||'ignore');
    if(action==='ignore'){plans.push({kind:'ignore',x,positionKey,quantity:qty});continue}
    if(action!=='create')throw Error(`Unbekannter Artikel ${articleNo}: ungültige Auswahl.`);

    plans.push({kind:'create',x,positionKey,quantity:qty,location:internalLocation});
   }
  }
  const actual=plans.filter(x=>!['processed','unchanged','ignore'].includes(x.kind));
  if(actual.length)await createBackup('Sicherheitsbackup',mode==='inventory'?'Vor Firmenlisten-Inventur':'Vor Firmenlisten-Einbuchung');
  const result=runTransaction(()=>{
   let created=0,booked=0,ignored=0,unchanged=0,alreadyProcessed=0,changed=0;
   for(const plan of plans){
    if(plan.kind==='processed'){alreadyProcessed++;continue}
    const x=plan.x,articleNo=String(x.article_no),desc=String(x.description||articleNo);
    if(plan.kind==='ignore'){
     recordImportResult(operationId,source,plan.positionKey,{article_no:articleNo,quantity:plan.quantity,status:'ignored'});ignored++;changed++;continue;
    }
    if(plan.kind==='unchanged'){
     recordImportResult(operationId,source,plan.positionKey,{article_no:articleNo,article_id:plan.article.id,quantity:plan.quantity,status:'unchanged'});unchanged++;changed++;continue;
    }
    if(plan.kind==='create'){
     run('INSERT INTO articles(article_no,description,target_stock,minimum_stock,initial_stock,unit,location,machine,active,created_at) VALUES(?,?,?,?,?,?,?,?,1,?)',[articleNo,desc,0,0,0,'Stk.',plan.location,'',stamp()]);
     const id=Number(scalar('SELECT last_insert_rowid()')||0);Warehouse.assign(id,{location:plan.location},{},true);const mv=recordMaterialCreationMovement(id,plan.quantity,{movement_date:d.movement_date||today(),technician,source:mode==='inventory'?'Firmenliste Inventur – neuer Artikel':'Firmenliste Einbuchung – neuer Artikel',note:mode==='inventory'?'Firmenliste: erfasster Bestand als einmaliger Ausgangsbestand':'Firmenliste: Zugangsmenge einmalig als Ausgangsbestand'});
     audit(technician,'ANLAGE','Artikel',String(id),`Artikelnummer: ${articleNo}\nBezeichnung: ${desc}\nQuelle: Firmenliste`);
     recordImportResult(operationId,source,plan.positionKey,{article_no:articleNo,article_id:id,movement_id:mv?.id||0,quantity:plan.quantity,status:'booked'});created++;booked++;changed++;continue;
    }
    if(plan.kind==='book'){
     const b=writePreparedBookings([{article_id:plan.article.id,article_no:plan.article.article_no,quantity:plan.quantity,position_key:plan.positionKey}],'IN',{...d,technician,source:'Firmenliste Einbuchung',note:'Frei verwendbar als Zugangsmenge'});
     recordImportResult(operationId,source,plan.positionKey,{article_no:plan.article.article_no,article_id:plan.article.id,movement_id:b[0]?.id||0,quantity:plan.quantity,status:'booked'});booked++;changed++;continue;
    }
    if(plan.kind==='adjust'){
     const type=plan.diff>0?'IN':'OUT',qty=Math.abs(plan.diff),b=writePreparedBookings([{article_id:plan.article.id,article_no:plan.article.article_no,quantity:qty,position_key:plan.positionKey}],type,{...d,technician,source:'Firmenliste Inventur',note:`Bestandsabgleich auf ${plan.quantity}`});
     recordImportResult(operationId,source,plan.positionKey,{article_no:plan.article.article_no,article_id:plan.article.id,movement_id:b[0]?.id||0,quantity:plan.quantity,status:'booked'});booked++;changed++;continue;
    }
   }
   return {created,booked,ignored,unchanged,already_processed:alreadyProcessed,changed};
  });
  if(result.changed)await persist();
  return response({ok:true,...result,operation_id:operationId,no_change:!result.changed});
 }
 if(p==='/api/delivery-note/preview'||p==='/api/import/preview'){
  const source=p==='/api/delivery-note/preview'?'delivery':'csv';
  if(source==='delivery'){
   const declared=detectDeclaredImportType(d.text);
   if(declared==='ENTNAHME'||(!declared&&looksLikeServiceImport(d.text))){
    return response({wrong_import_type:true,error:'Entnahme-Daten erkannt. Bitte diese Ausgabe im Bereich „Entnahme – Servicebericht M365/Copilot“ einfügen.',items:[],unknown:[],errors:[]});
   }
  }
  const operationId=await stableImportOperationId(source,d.text,d.new_operation_nonce||'');
  const parsed=parseLines(d.text),annotated=annotateImportPositions(parsed);
  const processed=[],pending=[];
  for(const x of annotated){const prev=importResult(operationId,source,x.position_key);if(prev?.status==='booked')processed.push({...x,processed:true,article_id:Number(prev.article_id||0),movement_id:Number(prev.movement_id||0)});else pending.push(x)}
  const matched=matchItems(pending);
  return response({...matched,operation_id:operationId,processed,processed_count:processed.length,errors:[...(matched.errors||[]),...(parsed.errors||[])]});
 }
 if(p==='/api/service-report/preview'){
  const declared=detectDeclaredImportType(d.text);
  if(declared==='EINBUCHUNG'||(!declared&&looksLikeDeliveryImport(d.text))){
   return response({wrong_import_type:true,error:'Einbuchungs-Daten erkannt. Bitte diese Ausgabe im Bereich „Einbuchung – Lieferschein M365“ einfügen.',items:[],unknown:[],errors:[],metadata:{}});
  }
  const operationId=await stableImportOperationId('service',d.text,d.new_operation_nonce||'');
  const parsed=parseServiceReport(d.text);
  if(parsed.metadata?.machine){
   const original=parsed.metadata.machine_input||parsed.metadata.machine;
   const resolved=resolveMachineName(original);
   parsed.metadata.machine_input=original;
   parsed.metadata.machine_suggestions=resolved.suggestions||[];
   parsed.metadata.machine_match=resolved;
   if(resolved.machine_id){parsed.metadata.machine=resolved.name;parsed.metadata.machine_id=resolved.machine_id}
  }
  const annotated=annotateImportPositions(parsed.items),processed=[],pending=[];
  for(const x of annotated){const prev=importResult(operationId,'service',x.position_key);if(prev?.status==='booked')processed.push({...x,processed:true,article_id:Number(prev.article_id||0),movement_id:Number(prev.movement_id||0)});else pending.push(x)}
  const matched=matchItems(pending);
  return response({...matched,operation_id:operationId,processed,processed_count:processed.length,metadata:parsed.metadata,rows:parsed.rows,errors:[...(matched.errors||[]),...(parsed.errors||[])]})
 }
 if(p==='/api/delivery-note/commit'){
  if(d.import_format==='order_excel'&&(d.reviewed!==true||!window.LVServicePDFCore.date(d.movement_date)))throw Error('Bitte Liefermengen und ein gültiges Buchungsdatum prüfen und bestätigen.');
  const operationId=String(d.operation_id||'').trim();
  if(!operationId)throw Error('Vorgangskennung der Lieferscheinauswertung fehlt. Bitte die Extraktion erneut prüfen.');
  const pending=annotateImportPositions(d.items||[]).filter(x=>importResult(operationId,'delivery',x.position_key)?.status!=='booked');
  let prepared=pending.length?validateBookingItems(pending,'IN',d):[];
  await assertInventoryWritable();
  if(prepared.length)await createBackup('Sicherheitsbackup','Vor Lieferschein-Einbuchung');
  await assertInventoryWritable();
  prepared=validatePendingDelivery();
  function validatePendingDelivery(){const unbooked=annotateImportPositions(d.items||[]).filter(x=>importResult(operationId,'delivery',x.position_key)?.status!=='booked');return unbooked.length?validateBookingItems(unbooked,'IN',d):[]}
  const booked=runTransaction(()=>{
   const b=writePreparedBookings(prepared,'IN',{...d,source:d.import_format==='order_excel'?'Materialanforderung Excel':'Lieferschein'});
   for(let i=0;i<b.length;i++)recordImportResult(operationId,'delivery',prepared[i].position_key,{article_no:prepared[i].article_no,article_id:prepared[i].article_id,movement_id:b[i].id,quantity:prepared[i].quantity,status:'booked'});
   return b;
  });
  const changed=LVV68Core.importCommitChanged({bookedCount:booked.length});
  const dbId=currentDbState().database_id;if(changed)pendingDeliveryPersistence=dbId;
  await persist(changed||pendingDeliveryPersistence===dbId);pendingDeliveryPersistence='';
  return response({ok:true,count:booked.length,already_processed:(d.items||[]).length-booked.length,operation_id:operationId,no_change:!changed})
 }
 if(p==='/api/service-report/commit'){
  const operationId=String(d.operation_id||'').trim();
  if(!operationId)throw Error('Vorgangskennung der Serviceauswertung fehlt. Bitte die Extraktion erneut prüfen.');
  const pending=annotateImportPositions(d.items||[]).filter(x=>importResult(operationId,'service',x.position_key)?.status!=='booked');
  const prepared=pending.length?validateBookingItems(pending,'OUT',d):[];
  let machine=String(d.machine||'').trim(),resolved=machine?resolveMachineName(machine):null;
  if(resolved?.machine_id)machine=resolved.name;
  const wantsCreate=!!(machine&&!resolved?.machine_id&&d.create_machine_if_missing);
  if(wantsCreate)requireAdminSession(opt,'Zum Anlegen einer neuen zentralen Maschine ist eine gültige Administrator-Sitzung erforderlich.');
  const result=runTransaction(()=>{
   let machineCreated=false;
   if(wantsCreate){run('INSERT INTO machines(name,description,active) VALUES(?,?,1)',[machine,'Automatisch aus Servicebericht angelegt']);machineCreated=true;audit(d.technician||'Techniker','ANLAGE','machine','',machine+' – aus Servicebericht')}
   const b=writePreparedBookings(prepared,'OUT',{...d,machine,source:'Servicebericht'});
   for(let i=0;i<b.length;i++)recordImportResult(operationId,'service',prepared[i].position_key,{article_no:prepared[i].article_no,article_id:prepared[i].article_id,movement_id:b[i].id,quantity:prepared[i].quantity,status:'booked'});
   return {booked:b,machineCreated};
  });
  const changed=LVV68Core.importCommitChanged({bookedCount:result.booked.length,machineCreated:result.machineCreated});
  if(changed)await persist();
  return response({ok:true,count:result.booked.length,already_processed:(d.items||[]).length-result.booked.length,machine_created:result.machineCreated,machine,operation_id:operationId,no_change:!changed});
 }
 if(p==='/api/import/commit'){
  const operationId=String(d.operation_id||'').trim()||await stableImportOperationId('csv',JSON.stringify(d.items||[]),d.new_operation_nonce||'');
  const pending=annotateImportPositions(d.items||[]).filter(x=>importResult(operationId,'csv',x.position_key)?.status!=='booked');
  const prepared=pending.length?validateBookingItems(pending,'IN',d):[];
  if(prepared.length)await createBackup('Sicherheitsbackup','Vor Import');
  const booked=runTransaction(()=>{
   const b=writePreparedBookings(prepared,'IN',{...d,source:'SAP-CSV-Import'});
   for(let i=0;i<b.length;i++)recordImportResult(operationId,'csv',prepared[i].position_key,{article_no:prepared[i].article_no,article_id:prepared[i].article_id,movement_id:b[i].id,quantity:prepared[i].quantity,status:'booked'});
   return b;
  });
  const changed=LVV68Core.importCommitChanged({bookedCount:booked.length});
  if(changed)await persist();
  return response({ok:true,count:booked.length,already_processed:(d.items||[]).length-booked.length,operation_id:operationId,no_change:!changed})
 }
 if(p==='/api/import/file-preview'){
  const rr=await xlsxRows(d.filename,d.content_base64),sourceText=JSON.stringify(rr);
  const operationId=await stableImportOperationId('csv-file',`${d.filename||''}\n${sourceText}`,d.new_operation_nonce||'');
  const annotated=annotateImportPositions(rowsToItems(rr)),processed=[],pending=[];
  for(const x of annotated){const prev=importResult(operationId,'csv',x.position_key);if(prev?.status==='booked')processed.push({...x,processed:true});else pending.push(x)}
  return response({...matchItems(pending),operation_id:operationId,processed,processed_count:processed.length})
 }
 if(p==='/api/inventory/file-preview'){
  const rr=await xlsxRowsFormatted(d.filename,d.content_base64),company=V69Core.parseCompanyRows(rr.rows);
  const legacy=company.header?null:parseInventoryRows(rr.rows);
  const parsed=company.header?company.items.map(x=>({article_no:x.article_no,counted_stock:x.quantity,line:x.line})):legacy.items;
  const items=[],errors=[...(company.header?company.errors:legacy.errors)];
  for(const x of parsed){const a=articles().find(z=>z.article_no===x.article_no);if(!a){errors.push({line:x.line,article_no:x.article_no,error:'Artikel ist in der Lagerverwaltung unbekannt.'});continue}items.push({article_id:a.id,article_no:a.article_no,description:a.description,system_stock:a.stock,counted_stock:x.counted_stock,difference:x.counted_stock-a.stock})}
  return response({items,errors,sheet:rr.sheet});
 }
 if(p==='/api/inventory/preview'){
  const parsedLines=parseLines(d.text,{allowZero:true});
  const parsed=parsedLines.map(x=>({article_no:x.article_no,counted_stock:x.quantity,line:x.line})),items=[],errors=[...(parsedLines.errors||[])];
  for(const x of parsed){const a=articles().find(z=>z.article_no===x.article_no);if(!a){errors.push({line:x.line,article_no:x.article_no,error:'Artikel ist in der Lagerverwaltung unbekannt.'});continue}items.push({article_id:a.id,article_no:a.article_no,description:a.description,system_stock:a.stock,counted_stock:x.counted_stock,difference:x.counted_stock-a.stock})}
  return response({items,errors});
 }
 if(p==='/api/inventory/commit'){
  V67Core.requireAdmin(await adminAuthorized(d,opt),'Passwort ist falsch oder die Stammdaten sind nicht freigeschaltet.');
  const technician=String(d.technician||setting('primary_technician','Techniker')).trim(),valid=activeTechnicianNames();if(technician===setting('primary_technician','Techniker')&&!valid.includes(technician))valid.push(technician);if(!technician||!valid.includes(technician))throw Error('Techniker ist nicht gültig.');
  const seen=new Set(),changes=[];let unchanged=0;
  for(const x of (d.items||[])){
   const aid=Number(x.article_id);if(!aid||seen.has(aid))throw Error('Inventur enthält eine ungültige oder doppelte Artikelposition.');seen.add(aid);
   const a=articles().find(z=>z.id===aid);if(!a)throw Error('Inventurartikel wurde nicht gefunden.');
   const counted=Number(x.counted_stock);if(!Number.isFinite(counted)||counted<0)throw Error(`Ungültiger Zählbestand für ${a.article_no}.`);
   const diff=counted-Number(a.stock);if(Math.abs(diff)<1e-8){unchanged++;continue}
   if(diff<0&&Math.abs(diff)>Number(a.stock)+1e-9)throw Error(`Inventur würde für ${a.article_no} einen negativen Bestand erzeugen.`);
   changes.push({article:a,diff});
  }
  await createBackup('Sicherheitsbackup','Vor Inventur');
  runTransaction(()=>{
   for(const c of changes)writePreparedBookings([{article_id:c.article.id,article_no:c.article.article_no,quantity:Math.abs(c.diff)}],c.diff>0?'IN':'OUT',{...d,technician,source:'Inventur',note:'Inventurkorrektur'});
   audit(technician,'INVENTUR','Bestand','',`${changes.length} Korrekturen`);
  });
  await persist();return response({ok:true,changed:changes.length,unchanged})
 }
 if(p==='/api/consumables/create'){
  const description=String(d.description||'').trim(),unit=String(d.unit||'Stk.').trim()||'Stk.';
  if(!description)throw Error('Bitte eine Bezeichnung für das Verbrauchsmaterial eingeben.');
  if(description.length>500||unit.length>30)throw Error('Bezeichnung oder Einheit ist zu lang.');
  const existing=rows('SELECT id,description,unit FROM consumables WHERE description=? COLLATE NOCASE AND active=1',[description])[0];
  if(existing)return response({...existing,ok:true,existing:true});
  const result=runTransaction(()=>{
   run('INSERT INTO consumables(description,unit,created_at) VALUES(?,?,?)',[description,unit,stamp()]);
   const id=Number(scalar('SELECT last_insert_rowid()'));
   audit(d.technician||setting('primary_technician','Techniker'),'ANLAGE','Verbrauchsmaterial',String(id),`Bezeichnung: ${description}\nEinheit: ${unit}\nArtikelnummer: —`);
   return {ok:true,id,description,unit};
  });
  await persist();return response(result,201);
 }
 if(p==='/api/material-request/preview'){const x=await materialXlsx(d);return response({count:x.count,items:x.items,template_type:x.template_type})}
 if(p==='/api/export/material-request'){const x=await materialXlsx(d);const tech=(d.technician||'Techniker').replace(/[^\wÄÖÜäöüß-]+/g,'_');return response(x.blob,200,{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':`attachment; filename="Bestellung_${fmtDate(today())}_${tech}.xlsx"`})}
 if(p==='/api/machine/alias'){
  requireAdminSession(opt,'Für Maschinen-Aliase ist eine gültige Administrator-Sitzung erforderlich.');
  const machineId=Number(d.machine_id),alias=String(d.alias||'').trim();if(!machineId||!alias)throw Error('Maschine und Bezeichnung fehlen.');
  const machine=rows('SELECT id,name FROM machines WHERE id=? AND active=1',[machineId])[0];if(!machine)throw Error('Maschine nicht gefunden.');
  if(normalizeLoose(machine.name)===normalizeLoose(alias))throw Error('Diese Bezeichnung entspricht bereits dem Hauptnamen.');
  const canonical=rows('SELECT id,name FROM machines WHERE active=1').find(x=>normalizeLoose(x.name)===normalizeLoose(alias));
  if(canonical)throw Error(`„${alias}“ ist bereits als eigene Maschine „${canonical.name}“ angelegt. Bitte bei Bedarf die Funktion „Maschinen zusammenführen“ verwenden.`);
  const existing=rows('SELECT id,alias,machine_id FROM machine_aliases WHERE active=1').find(x=>normalizeLoose(x.alias)===normalizeLoose(alias));
  if(existing)throw Error('Diese alternative Bezeichnung ist bereits zugeordnet.');
  run('INSERT INTO machine_aliases(alias,machine_id,active,created_at) VALUES(?,?,1,?)',[alias,machineId,stamp()]);
  audit('Administrator','ALIAS','Maschine',String(machineId),`Alternative Bezeichnung „${alias}“ → ${machine.name}`);await persist();return response({ok:true,alias,machine_id:machineId},201)
 }
 if(p==='/api/machine/alias/delete'){
  requireAdminSession(opt,'Für das Trennen von Maschinen-Aliasen ist eine gültige Administrator-Sitzung erforderlich.');
  const alias=rows(`SELECT ma.id,ma.alias,ma.machine_id,m.name machine_name FROM machine_aliases ma JOIN machines m ON m.id=ma.machine_id WHERE ma.id=?`,[Number(d.id)])[0];
  if(!alias)throw Error('Alternative Bezeichnung wurde nicht gefunden.');
  run('DELETE FROM machine_aliases WHERE id=?',[alias.id]);audit('Administrator','TRENNUNG','Maschine',String(alias.machine_id),`Alternative Bezeichnung „${alias.alias}“ von ${alias.machine_name} getrennt.`);await persist();return response({ok:true})
 }
 if(p==='/api/machine/merge'){
  requireAdminSession(opt,'Für das Zusammenführen von Maschinen ist eine gültige Administrator-Sitzung erforderlich.');
  const sourceId=Number(d.source_id),targetId=Number(d.target_id);if(!sourceId||!targetId||sourceId===targetId)throw Error('Bitte zwei unterschiedliche Maschinen auswählen.');
  const source=rows('SELECT * FROM machines WHERE id=? AND active=1',[sourceId])[0],target=rows('SELECT * FROM machines WHERE id=? AND active=1',[targetId])[0];
  if(!source||!target)throw Error('Eine der Maschinen ist nicht mehr aktiv.');
  const snap={sourceArticleIds:rows('SELECT article_id FROM article_machines WHERE machine_id=?',[sourceId]).map(x=>Number(x.article_id)),targetArticleIds:rows('SELECT article_id FROM article_machines WHERE machine_id=?',[targetId]).map(x=>Number(x.article_id)),sourceAliases:rows('SELECT id,alias FROM machine_aliases WHERE machine_id=?',[sourceId]).map(x=>({id:Number(x.id),alias:x.alias}))};
  run('BEGIN TRANSACTION');
  try{
   run('INSERT INTO machine_merge_history(source_machine_id,target_machine_id,source_name,snapshot_json,merged_at,active) VALUES(?,?,?,?,?,1)',[sourceId,targetId,source.name,JSON.stringify(snap),stamp()]);
   for(const aid of snap.sourceArticleIds)run('INSERT OR IGNORE INTO article_machines(article_id,machine_id) VALUES(?,?)',[aid,targetId]);
   run('DELETE FROM article_machines WHERE machine_id=?',[sourceId]);
   run('UPDATE machine_aliases SET machine_id=? WHERE machine_id=?',[targetId,sourceId]);
   if(!exactMachineResolution(source.name)?.via_alias)run('INSERT OR IGNORE INTO machine_aliases(alias,machine_id,active,created_at) VALUES(?,?,1,?)',[source.name,targetId,stamp()]);
   run('UPDATE machines SET active=0 WHERE id=?',[sourceId]);
   for(const aid of [...new Set([...snap.sourceArticleIds,...snap.targetArticleIds])])syncLegacyArticleMachine(aid);
   run('COMMIT');
  }catch(e){try{run('ROLLBACK')}catch{};throw e}
  audit('Administrator','ZUSAMMENFÜHRUNG','Maschine',String(targetId),`„${source.name}“ wurde unter „${target.name}“ zusammengeführt. Der bisherige Name bleibt als Alias erhalten.`);await persist();return response({ok:true})
 }
 if(p==='/api/machine/merge/undo'){
  requireAdminSession(opt,'Für das Trennen zusammengeführter Maschinen ist eine gültige Administrator-Sitzung erforderlich.');
  const h=rows('SELECT * FROM machine_merge_history WHERE id=? AND active=1',[Number(d.id)])[0];if(!h)throw Error('Aktive Zusammenführung nicht gefunden.');
  const snap=JSON.parse(h.snapshot_json||'{}'),sourceId=Number(h.source_machine_id),targetId=Number(h.target_machine_id);
  run('BEGIN TRANSACTION');
  try{
   run('UPDATE machines SET active=1 WHERE id=?',[sourceId]);
   run('DELETE FROM machine_aliases WHERE machine_id=? AND LOWER(alias)=LOWER(?)',[targetId,h.source_name]);
   for(const a of (snap.sourceAliases||[]))run('UPDATE machine_aliases SET machine_id=? WHERE id=?',[sourceId,Number(a.id)]);
   const targetBefore=new Set((snap.targetArticleIds||[]).map(Number));
   for(const aid of (snap.sourceArticleIds||[]).map(Number)){
    run('INSERT OR IGNORE INTO article_machines(article_id,machine_id) VALUES(?,?)',[aid,sourceId]);
    if(!targetBefore.has(aid))run('DELETE FROM article_machines WHERE article_id=? AND machine_id=?',[aid,targetId]);
    syncLegacyArticleMachine(aid);
   }
   run('UPDATE machine_merge_history SET active=0 WHERE id=?',[h.id]);run('COMMIT');
  }catch(e){try{run('ROLLBACK')}catch{};throw e}
  audit('Administrator','TRENNUNG','Maschine',String(sourceId),`Zusammenführung von „${h.source_name}“ wurde rückgängig gemacht.`);await persist();return response({ok:true})
 }
 if(p==='/api/material/master-create'){
  requireAdminSession(opt,'Zum Anlegen neuer zentraler Lagerorte oder Maschinen ist eine gültige Administrator-Sitzung erforderlich.');
  const type=String(d.type||'');
  if(!['location','machine'].includes(type))throw Error('Über die Materialanlage dürfen nur Lagerorte oder Maschinen neu angelegt werden.');
  const name=String(d.name||'').trim();if(!name)throw Error('Bitte einen Namen eingeben.');
  if(type==='location')run('INSERT OR IGNORE INTO locations(name,description,active) VALUES(?,?,1)',[name,String(d.description||'')]);
  else run('INSERT OR IGNORE INTO machines(name,description,active) VALUES(?,?,1)',[name,String(d.description||'')]);
  const created=Number(db.getRowsModified())>0;
  if(!created)throw Error('Dieser Eintrag ist bereits vorhanden.');
  audit(d.technician||setting('primary_technician','Techniker'),'ANLAGE MATERIALFORMULAR',type,'',name);
  await persist();return response({ok:true,name},201)
 }
 if(p==='/api/masterdata'){
  const type=String(d.type||'');
  requireAdminSession(opt,'Für Änderungen an zentralen Stammdaten ist eine gültige Administrator-Sitzung erforderlich.');
  const name=String(d.name||'').trim();
  if(!name)throw Error('Bitte einen Namen eingeben.');
  if(type==='technician'){
    run('INSERT OR IGNORE INTO technicians(name,email,default_vehicle,active) VALUES(?,?,?,1)',[name,d.email||'',d.default_vehicle||'']);
  }else if(type==='location'){
    run('INSERT OR IGNORE INTO locations(name,description,active) VALUES(?,?,1)',[name,d.description||'']);
  }else if(type==='machine'){
    run('INSERT OR IGNORE INTO machines(name,description,active) VALUES(?,?,1)',[name,d.description||'']);
  }else if(type==='vehicle'){
    run('INSERT OR IGNORE INTO vehicles(name,description,active) VALUES(?,?,1)',[name,d.description||'']);
  }else throw Error('Ungültiger Stammdatentyp.');
  const created=Number(db.getRowsModified())>0;
  if(!created)throw Error('Dieser Eintrag ist bereits vorhanden.');
  audit('Techniker','ANLAGE',type,'',name);
  await persist();
  return response({ok:true,name},201)
 }
 if(p==='/api/article/create'){
  if(!String(d.article_no||'').trim())throw Error('Artikelnummer fehlt.');
  if(!String(d.description||'').trim())throw Error('Bezeichnung fehlt.');

  const articleNo=String(d.article_no).trim(),description=String(d.description).trim(),unit=String(d.unit||'Stk.').trim()||'Stk.';
  const ctx=d.import_context&&typeof d.import_context==='object'?d.import_context:null;
  const operationId=String(ctx?.operation_id||'').trim(),source=String(ctx?.source||'').trim(),positionKey=String(ctx?.position_key||'').trim();
  if(operationId&&source&&positionKey){
   const previous=importResult(operationId,source,positionKey);
   if(previous){
    const existingArticle=rows('SELECT id,article_no FROM articles WHERE id=?',[Number(previous.article_id)])[0];
    if(existingArticle)return response({ok:true,id:Number(previous.article_id),article_no:existingArticle.article_no,movement_id:Number(previous.movement_id||0),idempotent:true,already_processed:true},200);
   }
  }
  if(Number(scalar('SELECT COUNT(*) FROM articles WHERE article_no=?',[articleNo])||0)>0)throw Error('Diese Artikelnummer ist bereits registriert.');
  const enteredInitial=AppRules.normalizeQuantity(d.initial_stock,unit);
  const levels=AppRules.normalizeStockLevels(d.target_stock,d.minimum_stock,unit);
  let result;
  result=runTransaction(()=>{
   run(`INSERT INTO articles(article_no,description,target_stock,minimum_stock,initial_stock,unit,location,machine,active,created_at,manufacturer,supplier,supplier_article_no,barcode,notes,image_url,datasheet_url) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [articleNo,description,levels.target_stock,levels.minimum_stock,0,unit,d.location||'',d.machine||'',d.active===false?0:1,stamp(),d.manufacturer||'',d.supplier||'',d.supplier_article_no||'',d.barcode||'',d.notes||'',d.image_url||'',d.datasheet_url||'']);
   const id=Number(scalar('SELECT last_insert_rowid()')||0);
   Warehouse.assign(id,d,{},true);
   const selectedMachines=setArticleMachineIds(id,Array.isArray(d.machine_ids)?d.machine_ids:(d.machine?[d.machine]:[]));
   const creationSource=String(d.creation_source||d.source||'Manuelle Materialanlage').slice(0,120);
   const creationMovement=recordMaterialCreationMovement(id,enteredInitial,{technician:d.technician||setting('primary_technician','Techniker'),machine:selectedMachines.join(', '),source:creationSource,note:'Neues Material angelegt – Anfangsbestand'});
   audit(d.technician||setting('primary_technician','Techniker'),'ANLAGE','Artikel',String(id),[
    `Artikelnummer: ${auditValue(articleNo)}`,`Bezeichnung: ${auditValue(description)}`,`Anfangsbestand: ${auditValue(enteredInitial)}`,
    `Sollbestand: ${auditValue(levels.target_stock)}`,`Mindestbestand: ${auditValue(levels.minimum_stock)}`,`Einheit: ${auditValue(unit)}`,
    `Lagerort: ${auditValue(d.location)}`,`Maschinen: ${auditValue(selectedMachines.join(', '))}`,`Quelle: ${auditValue(creationSource)}`
   ].join('\n'));
   if(operationId&&source&&positionKey){
    const status=source==='delivery'?'booked':'created';
    recordImportResult(operationId,source,positionKey,{article_no:articleNo,article_id:id,movement_id:creationMovement?.id||0,quantity:enteredInitial,status});
   }
   return {id,selectedMachines,creationMovement};
  });
  await persist();
  return response({ok:true,id:result.id,article_no:articleNo,movement_id:result.creationMovement?.id||0,levels_adjusted:levels.adjusted,target_stock:levels.target_stock,minimum_stock:levels.minimum_stock,operation_id:operationId||'',position_key:positionKey||''},201)
 }
 if(p==='/api/articles/batch-update'){
  if(!await adminAuthorized(d,opt))throw Error('Stammdaten sind nicht freigeschaltet.');
  const items=Array.isArray(d.items)?d.items:[];
  if(!items.length)throw Error('Keine Änderungen zum Speichern vorhanden.');
  let updated=0, corrected=0;
  run('BEGIN TRANSACTION');
  try{
   for(const x of items){
    const a=articles().find(z=>z.id===Number(x.id));
    if(!a)continue;
    const unit=String(x.unit||'Stk.').trim()||'Stk.',levels=AppRules.normalizeStockLevels(x.target_stock,x.minimum_stock,unit);
    run('UPDATE articles SET article_no=?,description=?,target_stock=?,minimum_stock=?,unit=?,location=?,active=? WHERE id=?',[
      String(x.article_no||'').trim(),String(x.description||'').trim(),levels.target_stock,levels.minimum_stock,unit,String(x.location||''),x.active?1:0,Number(x.id)
    ]);
    Warehouse.assign(Number(x.id),x,a);
    setArticleMachineIds(Number(x.id),Array.isArray(x.machine_ids)?x.machine_ids:(x.machine?[x.machine]:[]));
    const diff=normalizeQuantityForUnit(x.current_stock,x.unit)-Number(a.stock);
    if(Math.abs(diff)>1e-8){bookItems([{article_id:a.id,quantity:Math.abs(diff)}],diff>0?'IN':'OUT',{source:'Bestandskorrektur Stammdaten',note:'Istbestand über Sammelspeicherung geändert'});corrected++}
    updated++;
   }
   run('COMMIT');
  }catch(e){try{run('ROLLBACK')}catch{};throw e}
  audit('Techniker','SAMMELÄNDERUNG','Artikel','',`${updated} Artikel gespeichert, ${corrected} Bestandskorrekturen`);
  await persist();return response({ok:true,updated,corrected})
 }
 
 if(p==='/api/article/delete'){
  if(!await adminAuthorized(d,opt))throw Error('Stammdaten sind nicht freigeschaltet.');
  const id=Number(d.id);
  const article=rows('SELECT * FROM articles WHERE id=?',[id])[0];
  if(!article)throw Error('Artikel wurde nicht gefunden.');
  const movementCount=Number(scalar('SELECT COUNT(*) FROM movements WHERE article_id=?',[id])||0);
  if(movementCount>0&&!d.force){
   return response({ok:false,requires_force:true,movement_count:movementCount,
    message:`Zu diesem Artikel bestehen ${movementCount} Buchungen.`},409);
  }
  await createBackup('Sicherheitsbackup','Vor Artikellöschung');
  const affected=rows('SELECT m.*,a.article_no,a.description FROM movements m JOIN articles a ON m.article_id=a.id WHERE m.article_id=?',[id]);
  runTransaction(()=>{
   for(const move of affected)recordDeletionV82('movement',move.sync_uuid||`legacy:${currentDbState().database_id}:movement:${move.id}`,movementAuditSnapshot(move),'Artikel gelöscht; zugehörige Buchung entfernt');
   recordDeletionV82('article',article.article_no,article,'Artikel ausdrücklich gelöscht');
   if(movementCount>0)run('DELETE FROM movements WHERE article_id=?',[id]);
   run('DELETE FROM articles WHERE id=?',[id]);
  });
  audit('Administrator','LÖSCHUNG','Artikel',String(id),
   `${article.article_no} – ${article.description}; ${movementCount} zugehörige Buchung(en) entfernt`);
  await persist();
  return response({ok:true,id,movement_count:movementCount});
 }

 if(p==='/api/article/update'){
  if(!await adminAuthorized(d,opt))throw Error('Stammdaten sind nicht freigeschaltet.');
  const a=articles().find(x=>x.id===Number(d.id));if(!a)throw Error('Artikel wurde nicht gefunden.');
  Warehouse.resolve(d,a);
  const updateUnit=String(d.unit||a.unit||'Stk.').trim()||'Stk.',updateLevels=AppRules.normalizeStockLevels(d.target_stock,d.minimum_stock,updateUnit);
  run('UPDATE articles SET article_no=?,description=?,target_stock=?,minimum_stock=?,unit=?,location=?,active=?,manufacturer=?,supplier=?,supplier_article_no=?,barcode=?,notes=?,image_url=?,datasheet_url=? WHERE id=?',[d.article_no,d.description,updateLevels.target_stock,updateLevels.minimum_stock,updateUnit,d.location||'',d.active?1:0,d.manufacturer||a.manufacturer,d.supplier||a.supplier,d.supplier_article_no||a.supplier_article_no,d.barcode||a.barcode,d.notes||a.notes,d.image_url||a.image_url,d.datasheet_url||a.datasheet_url,Number(d.id)]);
  Warehouse.assign(Number(d.id),d,a);
  const machines=setArticleMachineIds(Number(d.id),Array.isArray(d.machine_ids)?d.machine_ids:(d.machine?[d.machine]:[]));
  const diff=Number(d.current_stock)-a.stock;if(Math.abs(diff)>1e-8)bookItems([{article_id:a.id,quantity:Math.abs(diff)}],diff>0?'IN':'OUT',{source:'Bestandskorrektur Stammdaten',note:'Istbestand geändert'});
  audit('Techniker','ÄNDERUNG','Artikel',a.id,`Artikel ${d.article_no}; Lagerort ${d.location||'—'}; Maschinen ${machines.join(', ')||'—'}`);await persist();return response({ok:true})
 }
 if(p==='/api/articles/stock-settings'){
  const id=Number(d.id),a=articles().find(x=>x.id===id);if(!a)throw Error('Artikel wurde nicht gefunden.');
  const levels=AppRules.normalizeStockLevels(d.target_stock,d.minimum_stock,a.unit);
  await assertInventoryWritable();
  const {location,warehouse_id}=Warehouse.resolve(d,a);
  if(location&&Number(scalar('SELECT COUNT(*) FROM locations WHERE name=? AND active=1',[location])||0)!==1)throw Error('Der gewählte Lagerort ist nicht mehr vorhanden.');
  const requested=[...new Set((Array.isArray(d.machine_ids)?d.machine_ids:[]).map(Number).filter(x=>Number.isInteger(x)&&x>0))];
  if(requested.length){const marks=requested.map(()=>'?').join(',');const valid=rows(`SELECT id FROM machines WHERE active=1 AND id IN (${marks})`,requested).map(x=>Number(x.id));if(valid.length!==requested.length)throw Error('Mindestens eine gewählte Maschine ist nicht mehr vorhanden.');}
  const beforeIds=machineRelationRows(id).map(x=>Number(x.id));
  const beforeNames=machineRelationRows(id).map(x=>x.name);
  const before={target_stock:Number(a.target_stock||0),minimum_stock:Number(a.minimum_stock||0),location:String(a.location||''),warehouse_id:a.warehouse_id??null,machine_ids:beforeIds};
  const sameMachines=beforeIds.slice().sort((x,y)=>x-y).join(',')===requested.slice().sort((x,y)=>x-y).join(',');
  if(before.target_stock===levels.target_stock&&before.minimum_stock===levels.minimum_stock&&before.location===location&&before.warehouse_id===warehouse_id&&(!('warehouse_id' in d)||Number(a.warehouse_selection_set)===1)&&sameMachines)return response({ok:true,unchanged:true,...levels,warehouse_id,location,machine_ids:beforeIds,machines:beforeNames});
  let machineNames=[];
  runTransaction(()=>{
   run('UPDATE articles SET target_stock=?,minimum_stock=?,location=?,warehouse_id=?,warehouse_selection_set=? WHERE id=?',[levels.target_stock,levels.minimum_stock,location,warehouse_id,('warehouse_id' in d)||warehouse_id!==null?1:Number(a.warehouse_selection_set||0),id]);
   machineNames=setArticleMachineIds(id,requested);
   audit(d.technician||setting('primary_technician','Techniker'),'LAGERBESTAND-ZUORDNUNG','Artikel',String(id),[
    `Artikelnummer: ${auditValue(a.article_no)}`,
    `Mindestbestand: ${auditValue(before.minimum_stock)} → ${auditValue(levels.minimum_stock)}`,
    `Sollbestand: ${auditValue(before.target_stock)} → ${auditValue(levels.target_stock)}`,
    `Lager: ${before.warehouse_id||'—'} → ${warehouse_id||'—'}`,
    `Lagerort: ${auditValue(before.location)} → ${auditValue(location)}`,
    `Maschinen: ${auditValue(beforeNames.join(', '))} → ${auditValue(machineNames.join(', '))}`,
    levels.adjusted?'Sollbestand wurde automatisch auf den Mindestbestand angehoben.':''
   ].filter(Boolean).join('\n'));
  });
  await persist();return response({ok:true,...levels,warehouse_id,location,machine_ids:requested,machines:machineNames})
 }
 if(p==='/api/articles/levels'){
  const id=Number(d.id),a=articles().find(x=>x.id===id);if(!a)throw Error('Artikel wurde nicht gefunden.');
  const levels=AppRules.normalizeStockLevels(d.target_stock,d.minimum_stock,a.unit);
  const oldTarget=Number(a.target_stock||0),oldMinimum=Number(a.minimum_stock||0);
  if(oldTarget===levels.target_stock&&oldMinimum===levels.minimum_stock)return response({ok:true,unchanged:true,...levels});
  run('UPDATE articles SET target_stock=?,minimum_stock=? WHERE id=?',[levels.target_stock,levels.minimum_stock,id]);
  audit(d.technician||setting('primary_technician','Techniker'),'BESTANDSGRENZEN','Artikel',String(id),[
   `Artikelnummer: ${auditValue(a.article_no)}`,
   `Sollbestand alt: ${auditValue(oldTarget)}`,
   `Sollbestand neu: ${auditValue(levels.target_stock)}`,
   `Mindestbestand alt: ${auditValue(oldMinimum)}`,
   `Mindestbestand neu: ${auditValue(levels.minimum_stock)}`,
   levels.adjusted?'Sollbestand wurde automatisch auf den Mindestbestand angehoben.':''
  ].filter(Boolean).join('\n'));
  await persist();return response({ok:true,...levels})
 }
 if(p==='/api/articles/stock-to-levels'){
  if(!await adminAuthorized(d,opt))throw Error('Für die Sammelübernahme ist eine Administratorfreigabe erforderlich.');
  if(!['target','minimum','both'].includes(d.mode))throw Error('Ungültige Auswahl für die Bestandsübernahme.');
  const active=articles().filter(x=>x.active),plans=[];let adjusted=0;
  for(const a of active){
   const target=d.mode==='target'||d.mode==='both'?a.stock:a.target_stock;
   const minimum=d.mode==='minimum'||d.mode==='both'?a.stock:a.minimum_stock;
   const levels=AppRules.normalizeStockLevels(target,minimum,a.unit);
   if(levels.adjusted)adjusted++;
   if(Number(a.target_stock)!==levels.target_stock||Number(a.minimum_stock)!==levels.minimum_stock)plans.push({a,levels});
  }
  if(!plans.length)return response({ok:true,unchanged:true,count:active.length,updated:0,adjusted});
  runTransaction(()=>{
   for(const {a,levels} of plans){
    run('UPDATE articles SET target_stock=?,minimum_stock=? WHERE id=?',[levels.target_stock,levels.minimum_stock,a.id]);
    audit(d.technician||setting('primary_technician','Techniker'),'BESTANDSGRENZEN','Artikel',String(a.id),[
     `Artikelnummer: ${a.article_no}`,`Quelle: Istbestand-Übernahme im Lagerbestand (${d.mode})`,
     `Istbestand: ${a.stock}`,`Sollbestand: ${a.target_stock} → ${levels.target_stock}`,
     `Mindestbestand: ${a.minimum_stock} → ${levels.minimum_stock}`,
     levels.adjusted?'Sollbestand wurde automatisch auf den Mindestbestand angehoben.':''
    ].filter(Boolean).join('\n'));
   }
  });
  await persist();return response({ok:true,count:active.length,updated:plans.length,adjusted});
 }
 if(p==='/api/articles/create-import'||p==='/api/import/create-and-book'){
  const isCreateAndBook=p==='/api/import/create-and-book';
  const newItems=Array.isArray(isCreateAndBook?d.new_items:d.items)?(isCreateAndBook?d.new_items:d.items):[];
  const knownItems=Array.isArray(d.known_items)?d.known_items:[];
  const technician=String(d.technician||setting('primary_technician','Techniker')).trim();
  const validTech=activeTechnicianNames();if(technician===setting('primary_technician','Techniker')&&!validTech.includes(technician))validTech.push(technician);
  if(!technician||!validTech.includes(technician))throw Error('Techniker ist nicht gültig.');
  const operationId=String(d.operation_id||'').trim()||await stableImportOperationId('csv-create',JSON.stringify({knownItems,newItems}),d.new_operation_nonce||'');
  const source='csv';
  const seenNo=new Set(),plans=[];let adjusted=0;
  // Vollständige Validierung vor dem ersten INSERT/UPDATE.
  for(let i=0;i<newItems.length;i++){
   const x=newItems[i]||{},articleNo=String(x.article_no||'').trim(),description=String(x.description||'').trim(),location=String(x.location||'').trim(),unit=String(x.unit||'Stk.').trim()||'Stk.';
   if(!articleNo)throw Error(`Artikelnummer fehlt in neuer Position ${i+1}.`);
   if(!description)throw Error(`Bezeichnung fehlt für ${articleNo}.`);

   const key=articleNo.toLowerCase();if(seenNo.has(key))throw Error(`Doppelte neue Artikelnummer ${articleNo}.`);seenNo.add(key);
   const prev=rows('SELECT id FROM articles WHERE article_no=?',[articleNo])[0];
   const positionKey=importPositionKey(x,i+knownItems.length);
   const prior=importResult(operationId,source,positionKey);
   if(prev&&!prior)throw Error(`Artikel ${articleNo} ist bereits vorhanden. Import bitte erneut prüfen.`);
   const levels=AppRules.normalizeStockLevels(x.target_stock,x.minimum_stock,unit);if(levels.adjusted)adjusted++;
   const qty=Number(x.quantity||0);if(isCreateAndBook&&(!Number.isFinite(qty)||qty<=0))throw Error(`Ungültige Buchungsmenge für ${articleNo}.`);
   const creationPlan=isCreateAndBook?LVV68Core.createAndBookNewArticlePlan(x,unit):null;
   const initial=creationPlan?AppRules.normalizeQuantity(creationPlan.initial_stock,unit):AppRules.normalizeQuantity(x.initial_stock,unit);if(!Number.isFinite(initial)||initial<0)throw Error(`Ungültiger Ausgangsbestand für ${articleNo}.`);
   plans.push({x,articleNo,description,location,unit,levels,initial,quantity:qty,positionKey,prior,creationPlan});
  }
  const knownPlans=[];const seenBook=new Set();
  if(isCreateAndBook){
   for(let i=0;i<knownItems.length;i++){
    const x=knownItems[i]||{},article=resolveBookingArticle(x);if(!article)throw Error(`Unbekannter Artikel: ${x.article_no||i+1}`);
    const aid=Number(article.id);if(seenBook.has(aid))throw Error(`Doppelte Buchungsposition für ${article.article_no}.`);seenBook.add(aid);
    const qty=Number(x.quantity);if(!Number.isFinite(qty)||qty<=0)throw Error(`Ungültige Menge für ${article.article_no}.`);
    const positionKey=importPositionKey(x,i),prior=importResult(operationId,source,positionKey);
    knownPlans.push({x,article,quantity:qty,positionKey,prior});
   }
  }
  // Auch neue Artikel dürfen nicht dieselbe Artikelnummer wie eine bekannte Buchungsposition doppelt enthalten.
  if(isCreateAndBook){for(const p2 of plans){const existing=rows('SELECT id FROM articles WHERE article_no=?',[p2.articleNo])[0];if(existing&&seenBook.has(Number(existing.id)))throw Error(`Doppelte Position für ${p2.articleNo}.`)}}
  let result=runTransaction(()=>{
   let created=0,booked=0;const createdIds=[];
   for(const plan of plans){
    if(plan.prior){createdIds.push(Number(plan.prior.article_id||0));continue}
    run('INSERT INTO articles(article_no,description,target_stock,minimum_stock,initial_stock,unit,location,machine,active,created_at) VALUES(?,?,?,?,?,?,?,?,1,?)',[plan.articleNo,plan.description,plan.levels.target_stock,plan.levels.minimum_stock,0,plan.unit,plan.location,plan.x.machine||'',stamp()]);
    const id=Number(scalar('SELECT last_insert_rowid()')||0);createdIds.push(id);
    Warehouse.assign(id,plan.x,{location:plan.location},true);
    const machineNames=setArticleMachineIds(id,Array.isArray(plan.x.machine_ids)?plan.x.machine_ids:(plan.x.machine?[plan.x.machine]:[]));
    const mv=recordMaterialCreationMovement(id,plan.initial,{technician,machine:machineNames.join(', '),source:'Materialanlage / CSV-SAP-Import',note:isCreateAndBook?'Neuer Importartikel – erkannte Menge einmalig als Anfangsbestand':'Neues Material über Import angelegt – Anfangsbestand'});
    audit(technician,'ANLAGE','Artikel',String(id),`Artikelnummer: ${plan.articleNo}
Bezeichnung: ${plan.description}
Quelle: CSV/SAP-Import`);created++;
    const creationStatus=isCreateAndBook?'booked':'created';
    recordImportResult(operationId,source,plan.positionKey,{article_no:plan.articleNo,article_id:id,movement_id:mv?.id||0,quantity:plan.initial,status:creationStatus});
    if(isCreateAndBook)booked++;
   }
   if(isCreateAndBook){
    for(const kp of knownPlans){
     if(kp.prior?.status==='booked')continue;
     const b=writePreparedBookings([{article_id:kp.article.id,article_no:kp.article.article_no,quantity:kp.quantity,position_key:kp.positionKey}],'IN',{...d,technician,source:'SAP-XLSX/CSV-Import'});
     recordImportResult(operationId,source,kp.positionKey,{article_no:kp.article.article_no,article_id:kp.article.id,movement_id:b[0]?.id||0,quantity:kp.quantity,status:'booked'});booked++;
    }
    // Neue Artikel wurden bereits mit der erkannten Dokumentmenge genau einmal als Anfangsbestand gebucht.
    // Es folgt absichtlich keine zweite Einbuchung für dieselbe neue Position.
   }
   return {created,booked};
  });
  const changed=LVV68Core.importCommitChanged({bookedCount:result.booked,otherChanges:result.created});
  if(changed)await persist();
  return response({ok:true,...result,skipped:[],levels_adjusted:adjusted,operation_id:operationId,no_change:!changed},201)
 }
 throw Error('Funktion noch nicht zugeordnet: '+p);
 }catch(e){return response({error:e.message||String(e)},400)}
}

function safeName(s){return String(s||'').replace(/[^a-zA-Z0-9ÄÖÜäöüß_-]+/g,'_').slice(0,45)}
function backupStamp(){const d=new Date(),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`}

async function storedBackupIndex(){return await ig(BACKUPKEY)||[]}
async function setBackupIndex(x){await ip(BACKUPKEY,x)}
async function backupDir(create=true){if(!handle)return null;try{return await handle.getDirectoryHandle('Backup',{create})}catch{return null}}
async function cloudBackupEntries(){
 const result=[];
 const d=await backupDir(false);
 if(!d||(await queryHandlePermission(handle,'read'))!=='granted')return result;
 try{
  for await(const [name,entry] of d.entries()){
   if(entry.kind!=='file'||!name.toLowerCase().endsWith('.db'))continue;
   const f=await entry.getFile();
   result.push({name,created:Number(f.lastModified||0),kind:'Cloud-Backup',comment:'Im Cloud-Ordner gefunden',size:f.size,storage:'folder'});
  }
 }catch(e){console.warn('Cloud-Backups konnten nicht gelesen werden',e)}
 return result;
}
async function getBackupIndex(){
 const local=await storedBackupIndex();
 const cloud=await cloudBackupEntries();
 const map=new Map();
 for(const x of [...local,...cloud]){
  const old=map.get(x.name);
  if(!old||x.storage==='folder')map.set(x.name,x);
 }
 return [...map.values()].sort((a,b)=>Number(b.created)-Number(a.created));
}
async function writeBackupBytes(bytes,kind='Automatisch',comment='',preferCloud=true){
 const created=Date.now();
 const name=`Backup_${backupStamp()}${comment?'_'+safeName(comment):''}.db`;
 let storage='local';
 const canCloudBackup=preferCloud&&handle&&(await queryHandlePermission(handle,'readwrite'))==='granted';
 const bd=canCloudBackup?await backupDir(true):null;
 if(bd){
  const fh=await bd.getFileHandle(name,{create:true}),w=await fh.createWritable();
  await w.write(bytes);await w.close();storage='folder';
 }else{
  await ip('backup:'+name,bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
 }
 let list=await storedBackupIndex();
 list.unshift({name,created,kind,comment,size:bytes.byteLength,storage});
 while(list.length>30){
  const old=list.pop();
  if(old.storage==='local')await idel('backup:'+old.name);
 }
 await setBackupIndex(list);
 return list[0];
}
async function createBackup(kind='Automatisch',comment=''){
 return await writeBackupBytes(db.export(),kind,comment,true);
}
let automaticBackupTimer=null;
function scheduleAutomaticBackup(){
 clearTimeout(automaticBackupTimer);
 automaticBackupTimer=setTimeout(async()=>{
  try{
   const item=await createBackup('Automatisch','Nach Änderungen');
   const m=await ig(METAKEY)||{};
   m.lastAutomaticBackup=item.created;
   await ip(METAKEY,m);
   if(window.refreshDatabaseStatus)window.refreshDatabaseStatus();
  }catch(e){console.warn('Automatisches Backup fehlgeschlagen:',e)}
 },15000);
}
async function ensureDailyBackup(){
 try{
  const m=await ig(METAKEY)||{};
  if(!m.lastAutomaticBackup||Date.now()-Number(m.lastAutomaticBackup)>86400000){
   const item=await createBackup('Automatisch','Tägliche Sicherung');
   m.lastAutomaticBackup=item.created;
   await ip(METAKEY,m);
  }
 }catch(e){console.warn('Tägliches Backup fehlgeschlagen:',e)}
}
async function readBackup(x){
 if(!x)throw Error('Backup nicht gefunden.');
 if(x.storage==='folder'){
  const d=await backupDir(false);
  if(!d)throw Error('Cloud-Backup-Ordner ist nicht erreichbar.');
  const f=await (await d.getFileHandle(x.name)).getFile();
  return new Uint8Array(await f.arrayBuffer());
 }
 const raw=await ig('backup:'+x.name);
 if(!raw)throw Error('Lokale Backup-Datei wurde nicht gefunden.');
 return new Uint8Array(raw);
}
async function restoreBackup(name){
 const list=await getBackupIndex(),x=list.find(z=>z.name===name);
 if(!x)throw Error('Backup nicht gefunden.');
 await createBackup('Sicherheitsbackup','Vor Wiederherstellung');
 const bytes=await readBackup(x),test=new SQL.Database(bytes);
 if(test.exec('PRAGMA quick_check')[0]?.values[0][0]!=='ok')throw Error('Backup ist beschädigt.');
 const restoredState=stateFromDatabase(test);
 db.close();db=test;initSchema();adoptExistingDatabase();
 await ip(DBKEY,db.export().buffer);
 const m=await ig(METAKEY)||{};
 m.dirty=true;
 m.localModified=restoredState.changed_at||Date.now();
 m.restorePending=true;
 m.writeBlocked=true;
 m.restoreBackupName=name;
 await ip(METAKEY,m);
 return {...x,state:restoredState};
}
async function deleteBackup(name){
 const list=await getBackupIndex(),x=list.find(z=>z.name===name);
 if(!x)return;
 if(x.storage==='folder'){
  try{const d=await backupDir(false);await d.removeEntry(name)}catch{}
 }else await idel('backup:'+name);
 const stored=(await storedBackupIndex()).filter(z=>z.name!==name);
 await setBackupIndex(stored);
}
class FileSystemCloudStorageAdapter extends SyncCore.CloudStorageAdapter{
 constructor(getHandle){super();this.getHandle=getHandle}
 async inspect(){
  const h=this.getHandle();
  if(!h)return {connected:false,status:SyncCore.CloudStatus.MISSING,accessible:false,file:'lager.db',error:'Kein Synchronisationsordner verbunden.'};
  let permissionState;
  try{permissionState=await queryHandlePermission(h,'read')}catch(e){return {connected:true,status:SyncCore.CloudStatus.PERMISSION_DENIED,accessible:false,file:'lager.db',error:e.message||'Berechtigungsprüfung fehlgeschlagen.'}}
  if(permissionState!=='granted')return {connected:true,status:SyncCore.CloudStatus.PERMISSION_DENIED,accessible:false,file:'lager.db',error:'Ordnerzugriff erneut freigeben.'};
  let fh;
  try{fh=await h.getFileHandle('lager.db',{create:false})}
  catch(e){
   if(e?.name==='NotFoundError')return {connected:true,status:SyncCore.CloudStatus.MISSING,accessible:false,file:'lager.db',error:'lager.db wurde im verbundenen Ordner nicht gefunden.'};
   return {connected:true,status:SyncCore.CloudStatus.IO_ERROR,accessible:false,file:'lager.db',error:e?.message||'Cloud-Datei konnte nicht geöffnet werden.'};
  }
  let f,bytes;
  try{f=await fh.getFile();bytes=new Uint8Array(await f.arrayBuffer())}
  catch(e){return {connected:true,status:SyncCore.CloudStatus.IO_ERROR,accessible:false,file:'lager.db',error:e?.message||'Cloud-Datei konnte nicht vollständig gelesen werden.'}}
  let test;
  try{
   test=new SQL.Database(bytes);
   const check=test.exec('PRAGMA quick_check')[0]?.values?.[0]?.[0];
   if(check!=='ok')return {connected:true,status:SyncCore.CloudStatus.INVALID_DATABASE,accessible:false,file:'lager.db',modified:f.lastModified,size:f.size,bytes,error:'PRAGMA quick_check ist fehlgeschlagen.'};
   if(!test.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='articles'").length)return {connected:true,status:SyncCore.CloudStatus.INVALID_DATABASE,accessible:false,file:'lager.db',modified:f.lastModified,size:f.size,bytes,error:'Die Datei enthält keine gültige Lagerdatenbank.'};
   const state=stateFromDatabase(test);
   return {connected:true,status:SyncCore.CloudStatus.OK,accessible:true,file:'lager.db',modified:f.lastModified,size:f.size,bytes,state,quick_check:'ok'};
  }catch(e){
   return {connected:true,status:SyncCore.CloudStatus.INVALID_DATABASE,accessible:false,file:'lager.db',modified:f?.lastModified||0,size:f?.size||bytes?.byteLength||0,bytes,error:e?.message||'Cloud-Datei ist keine lesbare SQLite-Datenbank.'};
  }finally{try{test?.close()}catch{}}
 }
 async write(bytes,{create=false}={}){
  const h=this.getHandle();if(!h)throw new SyncCore.SyncError('cloud_missing','Kein Synchronisationsordner verbunden.');
  if((await queryHandlePermission(h,'readwrite'))!=='granted')throw new SyncCore.SyncError('permission_required','Ordnerzugriff erneut freigeben.');
  let fh;
  try{fh=await h.getFileHandle('lager.db',{create:!!create})}
  catch(e){throw new SyncCore.SyncError(e?.name==='NotFoundError'?'cloud_missing':'io_error',e?.message||'lager.db konnte nicht zum Schreiben geöffnet werden.')}
  const w=await fh.createWritable();
  try{await w.write(bytes);await w.close()}
  catch(e){try{await w.abort?.()}catch{}throw new SyncCore.SyncError('write_failed',e?.message||'Schreiben der Cloud-Datei ist fehlgeschlagen.')}
 }
}
const cloudAdapter=new FileSystemCloudStorageAdapter(()=>handle);
async function inspectCloudDatabase(){return cloudAdapter.inspect()}

function makeSyncCandidate(){
 const sourceState=currentDbState();
 const sourceBytes=db.export();
 const candidateDb=new SQL.Database(sourceBytes);
 try{
  const stmt=candidateDb.prepare("INSERT INTO sync_state(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value");
  stmt.run(['cloud_base_revision_id',sourceState.revision_id]);stmt.reset();
  stmt.run(['cloud_base_revision',String(sourceState.revision)]);stmt.free();
  const bytes=candidateDb.export();
  const state=stateFromDatabase(candidateDb);
  return {bytes,state,sourceState};
 }finally{candidateDb.close()}
}
async function saveToFolder(makeBackup=true,force=false,{allowCreateMissing=false}={}){
 if(!handle)throw new Error('Kein Synchronisationsordner verbunden.');
 await persistQueue;
 const m=await ig(METAKEY)||{};
  const local=currentDbState();
  try{
   return await SyncCore.performVerifiedWrite({
   adapter:cloudAdapter,local,meta:m,force,allowCreateMissing,
   makeCandidate:async()=>makeSyncCandidate(),
   backupCloud:async cloud=>{
    // Erzwungenes Überschreiben nur nach Sicherheitskopie der tatsächlich lesbaren Cloud-Datei.
         await writeBackupBytes(cloud.bytes,'Sicherheitsbackup','Cloud_vor_Cloud_Sync',false);
         await archiveCurrentPairV82('Manuelles Überschreiben','Cloud-Datenstand vor erzwungenem Speichern gesichert',cloud);
   },
   onSuccess:async({candidate,verified})=>{
    if(makeBackup)await createBackup('Automatisch','Vor Synchronisierung');
    const meta=await ig(METAKEY)||{};
         meta.lastSync=Date.now();meta.fileModified=verified.modified||0;
    meta.expectedCloudRevisionId=candidate.state.revision_id;meta.expectedCloudDatabaseId=candidate.state.database_id;
    meta.lastCloudRevision=Number(candidate.state.revision||0);meta.lastCloudRevisionId=candidate.state.revision_id;
    meta.writeBlocked=false;meta.restorePending=false;delete meta.syncErrorCode;delete meta.syncErrorMessage;

    // Live-DB und lokales IndexedDB-Schreiben sind gemeinsam in derselben
    // persistQueue serialisiert. Eine spaetere Buchung haengt sich dahinter.
    const adopt=async()=>{
     if(currentDbState().revision_id!==candidate.state.revision_id)return false;
     await ip(DBKEY,candidate.bytes.buffer.slice(candidate.bytes.byteOffset,candidate.bytes.byteOffset+candidate.bytes.byteLength));
     if(currentDbState().revision_id!==candidate.state.revision_id)return false;
     db.close();db=new SQL.Database(candidate.bytes);initSchema();return true;
    };
    persistQueue=persistQueue.then(adopt,adopt);
    const adopted=await persistQueue;
    if(!adopted){
     // Die Cloud hat den sicheren Snapshot, neue lokale Buchungen bleiben erhalten.
     setSyncValue('cloud_base_revision_id',candidate.state.revision_id);
     setSyncValue('cloud_base_revision',String(candidate.state.revision));
     await persist(false);
    }
    await ip(SYNCBASEKEY,candidate.bytes.buffer.slice(candidate.bytes.byteOffset,candidate.bytes.byteOffset+candidate.bytes.byteLength));
    const latest=await ig(METAKEY)||{};
    latest.lastSync=meta.lastSync;latest.fileModified=meta.fileModified;
    latest.expectedCloudRevisionId=meta.expectedCloudRevisionId;latest.expectedCloudDatabaseId=meta.expectedCloudDatabaseId;
    latest.lastCloudRevision=meta.lastCloudRevision;latest.lastCloudRevisionId=meta.lastCloudRevisionId;
    latest.writeBlocked=false;latest.restorePending=false;delete latest.syncErrorCode;delete latest.syncErrorMessage;
    latest.dirty=!adopted;latest.pendingChanges=adopted?0:Math.max(1,Number(latest.pendingChanges||1));
    await ip(METAKEY,latest);await syncStatus();
    dispatchSyncEvent('lv81:sync-ok',{revision:candidate.state.revision_id,dirty:latest.dirty});
    if(latest.dirty)dispatchSyncEvent('lv81:local-saved',{revision:currentDbState().revision_id,pendingChanges:latest.pendingChanges});
   }
  });
 }catch(e){
  const meta=await ig(METAKEY)||{};meta.dirty=true;meta.syncErrorCode=e.code||'sync_error';meta.syncErrorMessage=e.message||String(e);await ip(METAKEY,meta);await syncStatus();throw e;
 }
}
async function loadFromFolder(){
 if(!handle)throw Error('Kein Synchronisationsordner verbunden.');
 const cloud=await inspectCloudDatabase();
 if(cloud.status===SyncCore.CloudStatus.PERMISSION_DENIED)throw new SyncCore.SyncError('permission_required','Ordnerzugriff erneut freigeben.');
 if(cloud.status!==SyncCore.CloudStatus.OK)throw Error('Cloud-Datenbank konnte nicht sicher gelesen werden: '+(cloud.error||cloud.status));
 await persistQueue;
   const localSnap=currentDbState();if(localSnap.revision_id!==cloud.state.revision_id)await archiveCurrentPairV82('Cloud als Hauptstand gewählt','Lokaler Datenstand vor Laden der Cloud archiviert',cloud);
 await createBackup('Sicherheitsbackup','Vor Laden aus Synchronisation');
 const test=new SQL.Database(cloud.bytes);
 db.close();db=test;initSchema();adoptExistingDatabase();
 setSyncValue('cloud_base_revision_id',cloud.state.revision_id);setSyncValue('cloud_base_revision',String(cloud.state.revision));
   await ip(DBKEY,db.export().buffer);
  await ip(SYNCBASEKEY,cloud.bytes.buffer.slice(cloud.bytes.byteOffset,cloud.bytes.byteOffset+cloud.bytes.byteLength));
  const m=await ig(METAKEY)||{};
  m.pendingChanges=0;m.dirty=false;m.lastSync=Date.now();m.fileModified=cloud.modified;m.localModified=cloud.state.changed_at||cloud.modified;
 m.expectedCloudRevisionId=cloud.state.revision_id;m.expectedCloudDatabaseId=cloud.state.database_id;
 m.lastCloudRevision=cloud.state.revision;m.lastCloudRevisionId=cloud.state.revision_id;m.writeBlocked=false;m.restorePending=false;
   delete m.syncErrorCode;delete m.syncErrorMessage;await ip(METAKEY,m);dispatchSyncEvent('lv81:sync-ok',{revision:cloud.state.revision_id});
  return {ok:true,state:cloud.state};
}
window.LVStorage={
 async exportDatabase(){await ready;return new Blob([db.export()],{type:'application/octet-stream'})},
 async prepareNewDatabase(mode='browser_local'){
  if(mode==='local_folder'||mode==='cloud'){
   if(!('showDirectoryPicker'in window))throw Error('Dieser Browser unterstützt keine Ordnerauswahl. Nutzen Sie „Ohne Ordner nur im Browser speichern“.');
   const selected=await showDirectoryPicker({mode:'readwrite'});
   if(!await requestHandlePermissionExplicit(selected,'readwrite'))throw Error('Schreibberechtigung wurde nicht erteilt.');
   const previous=handle;handle=selected;
   const inspection=await inspectCloudDatabase();
   if(inspection.status!==SyncCore.CloudStatus.MISSING){handle=previous;throw Error(inspection.status===SyncCore.CloudStatus.OK?'Im ausgewählten Ordner befindet sich bereits eine lager.db.':'Der ausgewählte Ordner kann nicht sicher als leer bestätigt werden: '+(inspection.error||inspection.status));}
   await ip(HANDLEKEY,handle);await setDeviceStorageMode(mode);
   const m=await ig(METAKEY)||{};m.writeBlocked=false;delete m.expectedCloudRevisionId;delete m.expectedCloudDatabaseId;await ip(METAKEY,m);
   await requestSync({mode:'initialize',silent:true,force:true,allowCreateMissing:true,makeBackup:false});
   return {ok:true,mode,folder:handle.name};
  }
  await ready;
  handle=null;await idel(HANDLEKEY);await setDeviceStorageMode('browser_local');
  const m=await ig(METAKEY)||{};m.writeBlocked=false;delete m.expectedCloudRevisionId;delete m.expectedCloudDatabaseId;await ip(METAKEY,m);await syncStatus();
  return {ok:true,mode:'browser_local',folder:'Nur Browser-Speicher'};
 },
 async openExistingFolder(){
  if(!('showDirectoryPicker'in window))throw Error('Ordnerauswahl wird von diesem Browser nicht unterstützt.');
  const selected=await showDirectoryPicker({mode:'readwrite'});if(!await requestHandlePermissionExplicit(selected,'readwrite'))throw Error('Schreibberechtigung wurde nicht erteilt.');
  const previous=handle;handle=selected;const cloud=await inspectCloudDatabase();
  if(cloud.status!==SyncCore.CloudStatus.OK){handle=previous;throw Error('Vorhandene lager.db konnte nicht sicher geöffnet werden: '+(cloud.error||cloud.status));}
  const oldMeta=await ig(METAKEY)||{};if(oldMeta.dirty&&!confirm('Der lokale Datenstand hat nicht synchronisierte Änderungen. Vor dem Laden aus dem gewählten Ordner wird ein Sicherheitsbackup erstellt. Lokalen Datenstand ersetzen?')){handle=previous;return {cancelled:true}}
  await idel(SYNCBASEKEY);await ip(HANDLEKEY,handle);await loadFromFolder();await setDeviceStorageMode('cloud');return {ok:true};
 },
 async openExistingFile(input){
  const f=input.files?.[0];if(!f)throw Error('Keine Datei ausgewählt.');
  const bytes=new Uint8Array(await f.arrayBuffer());if(bytes.length<100)throw Error('Die ausgewählte Datei ist leer oder zu klein.');
  let test;try{test=new SQL.Database(bytes)}catch{throw Error('Die ausgewählte Datei ist keine lesbare SQLite-Datenbank.')}
  const check=test.exec('PRAGMA quick_check');if(check[0]?.values[0][0]!=='ok')throw Error('Die Datenbankprüfung ist fehlgeschlagen.');
  if(!test.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='articles'").length)throw Error('In dieser Datei wurde keine Lagerdatenbank mit einer Artikeltabelle gefunden.');
  await idel(SYNCBASEKEY);db.close();db=test;initSchema();adoptExistingDatabase();if(existingDatabaseHasContent())setSetting('setup_complete','1');
  const articleCount=Number(scalar('SELECT COUNT(*) FROM articles')||0),movementCount=tableExists('movements')?Number(scalar('SELECT COUNT(*) FROM movements')||0):0;
  await persist(true);const state=currentDbState(),meta=await ig(METAKEY)||{};
  meta.dirty=true;meta.localModified=state.changed_at;meta.writeBlocked=!!handle;meta.restorePending=false;await ip(METAKEY,meta);
  return {ok:true,articles:articleCount,movements:movementCount,file:f.name};
 }
};


async function cloudState(){
 if(storageMode()!=='cloud')return {connected:false,status:'missing'};
 const c=await inspectCloudDatabase();
 if(!c.connected)return {connected:false};
 return {
  connected:true,
  accessible:c.status===SyncCore.CloudStatus.OK,
  status:c.status,
  file:'lager.db',
  folder:handle?.name||'',
  modified:Number(c.modified||0),
  size:Number(c.size||0),
  state:c.state||null,
  error:c.error||''
 };
}
async function localCounts(){
 return {
  articles:Number(scalar('SELECT COUNT(*) FROM articles')||0),
  movements:tableExists('movements')?Number(scalar('SELECT COUNT(*) FROM movements')||0):0
 };
}

window.LVDatabaseStatus={
 async get(){
  await ready;
  const m=await ig(METAKEY)||{};
  return {
   lastModified:currentDbState().changed_at||Number(m.localModified||0),
   lastAutomaticBackup:Number(m.lastAutomaticBackup||0),
   cloudConnected:storageMode()==='cloud'&&!!handle,
   dirty:!!m.dirty,
   lastSync:Number(m.lastSync||0)
  };
 }
};


const MATERIAL_REQUEST_FOLDER_KEY='material-request-folder-handle';

function inspectExternalDatabase(bytes){
 const test=new SQL.Database(new Uint8Array(bytes));
 try{
  if(test.exec('PRAGMA quick_check')[0]?.values?.[0]?.[0]!=='ok')throw Error('Backup ist beschädigt.');
  const hasTable=name=>!!test.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${String(name).replaceAll("'","''")}'`)[0];
  if(!hasTable('articles')||!hasTable('movements'))throw Error('Die Datei ist keine gültige Lagerdatenbank.');
  const count=table=>{
   const r=test.exec(`SELECT COUNT(*) FROM ${table}`);
   return Number(r[0]?.values?.[0]?.[0]||0);
  };
  let revision='';
  if(hasTable('sync_state')){
   const r=test.exec("SELECT value FROM sync_state WHERE key='revision' LIMIT 1");
   revision=String(r[0]?.values?.[0]?.[0]||'');
  }
  return {article_count:count('articles'),movement_count:count('movements'),revision};
 }finally{test.close()}
}

window.LVBackupFile={
 async inspect(buffer){
  await ready;
  return inspectExternalDatabase(buffer);
 },
 async restore(buffer,meta={}){
  await ready;
  if(sessionStorage.admin!=='1')throw Error('Administratorbereich ist in dieser Sitzung nicht freigeschaltet.');
  const info=inspectExternalDatabase(buffer);
  await createBackup('Sicherheitsbackup','Vor manuell geladenem Backup');
  const test=new SQL.Database(new Uint8Array(buffer));
  const restoredState=stateFromDatabase(test);
  db.close();db=test;initSchema();adoptExistingDatabase();
  audit('Administrator','WIEDERHERSTELLUNG','Backup',meta.file_name||'',
   `Backup manuell geladen\nDatei: ${meta.file_name||'Unbekannt'}\nRevision: ${info.revision||'—'}\nDatum: ${meta.file_date||new Date().toLocaleString('de-DE')}`);
  await persist(true);
  const m=await ig(METAKEY)||{};
  m.dirty=true;
  m.localModified=currentDbState().changed_at||Date.now();
  m.restorePending=true;
  m.writeBlocked=true;
  await idel(SYNCBASEKEY);
  m.restoreBackupName=meta.file_name||'Manuell geladene Datei';
  await ip(METAKEY,m);
  return {...info,state:restoredState};
 }
};

window.LVMaterialRequestFolder={
 async get(){
  await ready;
  const h=await ig(MATERIAL_REQUEST_FOLDER_KEY)||null;
  return {connected:!!h,folder:h?.name||''};
 },
 async choose(){
  await ready;
  if(!('showDirectoryPicker'in window))throw Error('Dieser Browser unterstützt keine direkte Ordnerauswahl.');
  const old=await ig(MATERIAL_REQUEST_FOLDER_KEY)||null;
  const selected=await showDirectoryPicker({mode:'readwrite'});
  if(!await requestHandlePermissionExplicit(selected,'readwrite'))throw Error('Schreibberechtigung wurde nicht erteilt.');
  await ip(MATERIAL_REQUEST_FOLDER_KEY,selected);
  audit('Administrator','EINSTELLUNG','Materialanforderung Exportordner','',
   `Exportordner Materialanforderung geändert\nAlt: ${old?.name||'Downloads'}\nNeu: ${selected.name}`);
  await persist(true);
  return {ok:true,folder:selected.name};
 },
 async reset(){
  await ready;
  const old=await ig(MATERIAL_REQUEST_FOLDER_KEY)||null;
  await idel(MATERIAL_REQUEST_FOLDER_KEY);
  audit('Administrator','EINSTELLUNG','Materialanforderung Exportordner','',
   `Exportordner Materialanforderung geändert\nAlt: ${old?.name||'Downloads'}\nNeu: Downloads`);
  await persist(true);
  return {ok:true};
 },
 async save(bytes,fileName,mime='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
  await ready;
  const h=await ig(MATERIAL_REQUEST_FOLDER_KEY)||null;
  if(!h)return {saved:false};
  if((await queryHandlePermission(h,'readwrite'))!=='granted')throw Error('Zugriff auf den Exportordner fehlt. Bitte den Ordner ausdrücklich erneut auswählen/freigeben.');
  const fh=await h.getFileHandle(fileName,{create:true});
  const writable=await fh.createWritable();
  await writable.write(new Blob([bytes],{type:mime}));
  await writable.close();
  return {saved:true,folder:h.name};
 }
};


window.LVBackup={
 async manual(){try{const x=await createBackup('Manuell',backupComment.value.trim());backupComment.value='';msg(backupMsg,'Backup erstellt: '+x.name,true);await this.refresh()}catch(e){msg(backupMsg,e.message,false)}},
 async refresh(){await ready;const list=await getBackupIndex();if(!window.backupRows)return;backupRows.innerHTML=list.map(x=>`<tr><td>${new Date(x.created).toLocaleString('de-DE')}</td><td>${x.kind}</td><td>${x.comment||'–'}</td><td>${(x.size/1024).toLocaleString('de-DE',{maximumFractionDigits:1})} KB</td><td><button class="secondary" onclick="LVBackup.restore('${x.name.replaceAll("'","\\'")}')">Wiederherstellen</button> <button class="secondary" onclick="LVBackup.download('${x.name.replaceAll("'","\\'")}')">Herunterladen</button> <button class="danger" onclick="LVBackup.remove('${x.name.replaceAll("'","\\'")}')">Löschen</button></td></tr>`).join('')||'<tr><td colspan="5">Noch keine Backups</td></tr>'},
 async restore(name){
  if(sessionStorage.admin!=='1'){msg(backupMsg,'Bitte zuerst den Administratorbereich in dieser Sitzung freischalten.',false);return}
  if(!confirm('Diesen Datenstand lokal wiederherstellen? Vorher wird ein Sicherheitsbackup des aktuellen lokalen Stands erstellt. Die Cloud-Datei wird noch nicht verändert.'))return;
  try{
   const result=await restoreBackup(name);
   audit('Administrator','WIEDERHERSTELLUNG','Backup',name,
    `Automatisches Backup geladen\nBackup: ${name}\nRevision: ${result.state?.revision??'—'}`);
   await persist(true);
   sessionStorage.removeItem('lv_startup_confirmed');
   alert('Backup wurde lokal wiederhergestellt. Die Cloud-Datei bleibt unverändert. Prüfe den Bestand und veröffentliche ihn nur bewusst als neuen Cloud-Stand.');
   location.reload();
  }catch(e){msg(backupMsg,e.message,false)}
 },
 async refreshPending(){
  try{
   const s=await LVBackupState.get();
   if(window.restorePendingBox)restorePendingBox.style.display=s.restorePending?'block':'none';
  }catch(e){console.warn(e)}
 },
 async publishRestored(){
  if(!confirm('Der wiederhergestellte, möglicherweise ältere Datenstand überschreibt die aktuelle Cloud-Datei. Vorher wird die jetzige Cloud-Datei als Sicherheitsbackup gesichert. Wirklich veröffentlichen?'))return;
  try{
   await LVBackupState.publishRestored();
   msg(restorePendingMsg,'Wiederhergestellter Stand wurde als neuer Cloud-Stand veröffentlicht.',true);
   setTimeout(()=>location.reload(),500);
  }catch(e){msg(restorePendingMsg,e.message,false)}
 },
 async discardRestore(){
  if(!confirm('Lokale Wiederherstellung verwerfen und den aktuellen Cloud-Stand erneut laden?'))return;
  try{
   await LVBackupState.discardRestore();
   location.reload();
  }catch(e){msg(restorePendingMsg,e.message,false)}
 },
 async remove(name){if(!confirm('Backup wirklich löschen?'))return;await deleteBackup(name);await this.refresh()},
 async download(name){const x=(await getBackupIndex()).find(z=>z.name===name),bytes=await readBackup(x),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([bytes],{type:'application/octet-stream'}));a.download=x.name;a.click()}
};
const ready=initialize().then(async()=>{setTimeout(ensureDailyBackup,2500)});
window.fetch=route;
async function syncStatus(){const m=await ig(METAKEY)||{};if(window.syncFile)syncFile.textContent=handle?.name||'Keiner';if(window.syncDirty)syncDirty.textContent=m.dirty?'Ja':'Nein';if(window.syncLast)syncLast.textContent=m.lastSync?new Date(m.lastSync).toLocaleString('de-DE'):'Noch nie';if(window.syncAuto)syncAuto.textContent=handle?'Aktiv':'Wartet auf Ordner'}
async function permission(h,m){return (await queryHandlePermission(h,m))==='granted'}
async function performSyncRequest(req={}){
 const mode=req.mode||'sync',silent=!!req.silent;
 if(!handle)throw new SyncCore.SyncError('cloud_missing','Kein Synchronisationsordner verbunden.');
 if(mode==='force'||mode==='initialize'){
  return saveToFolder(req.makeBackup!==false,!!req.force,{allowCreateMissing:!!req.allowCreateMissing});
 }
 // Normales Speichern (auch local_folder) läuft durch dieselbe Konfliktklassifikation
 // und denselben strikten Write-Guard wie Cloud-Sync. Kein Sonder-Write/Bypass.
 const directSave=mode==='save';
 if(!directSave&&storageMode()!=='cloud'){if(!silent)throw Error('Cloud-Modus ist nicht aktiviert.');return {skipped:true}}
   await persistQueue;
  let m=await ig(METAKEY)||{};
  let cloud=await inspectCloudDatabase();
 if(cloud.status===SyncCore.CloudStatus.PERMISSION_DENIED){m.dirty=!!m.dirty; m.syncErrorCode='permission_required';m.syncErrorMessage='Ordnerzugriff erneut freigeben.';await ip(METAKEY,m);throw new SyncCore.SyncError('permission_required','Ordnerzugriff erneut freigeben.')}
 const local=currentDbState();
 let decision=SyncCore.classifySyncState({local,cloud,meta:m});
   if(decision==='identical'){
   // Metadaten dürfen sich selbst reparieren, ohne die SQLite-Inhalte zu ändern.
   m.expectedCloudDatabaseId=cloud.state.database_id;m.expectedCloudRevisionId=cloud.state.revision_id;m.writeBlocked=false;m.dirty=false;m.pendingChanges=0;
     m.lastCloudRevision=Number(cloud.state.revision||0);m.lastCloudRevisionId=cloud.state.revision_id;await ip(SYNCBASEKEY,cloud.bytes.buffer.slice(cloud.bytes.byteOffset,cloud.bytes.byteOffset+cloud.bytes.byteLength));await ip(METAKEY,m);dispatchSyncEvent('lv81:sync-ok',{revision:cloud.state.revision_id});return {ok:true,decision};
 }
 if(decision==='local_newer_safe'){
  // Strikter Guard verlangt exakte expected-Werte. Nur aus einer bereits als sicher klassifizierten Basis reparieren.
  m.expectedCloudDatabaseId=cloud.state.database_id;m.expectedCloudRevisionId=cloud.state.revision_id;m.writeBlocked=false;await ip(METAKEY,m);
  return saveToFolder(req.makeBackup!==false,false);
 }
 if(decision==='cloud_newer'&&!m.dirty){await loadFromFolder();return {ok:true,decision,reloaded:true}}
 if(decision==='cloud_missing')throw new SyncCore.SyncError('cloud_missing','lager.db fehlt im Cloud-Ordner. Außerhalb der Ersteinrichtung wird sie nicht automatisch neu erstellt.');
 if(decision==='permission_required')throw new SyncCore.SyncError('permission_required','Ordnerzugriff erneut freigeben.');
 if(decision==='cloud_unreadable')throw new SyncCore.SyncError('cloud_unreadable','Cloud-Datei ist beschädigt oder nicht vollständig lesbar und wird nicht überschrieben.');
   try{await archiveCurrentPairV82('Konflikt bei Synchronisierung','Unabhängige Datenstände',cloud)}catch(e){console.warn('Konfliktarchiv fehlgeschlagen',e);throw new SyncCore.SyncError('archive_failed','Konfliktarchiv konnte nicht sicher gespeichert werden: '+e.message)}
   m.writeBlocked=true;m.syncErrorCode='conflict';m.syncErrorMessage='Unabhängige Änderungen an beiden Datenständen. Bitte Vergleich öffnen.';await ip(METAKEY,m);dispatchSyncEvent('lv81:sync-error',{code:'conflict',message:m.syncErrorMessage});
  throw new SyncCore.SyncError('conflict','Parallelkonflikt: Lokaler und Cloud-Stand stammen nicht eindeutig voneinander ab. Bitte Vergleich öffnen.');
}
const syncQueue=new SyncCore.SyncQueue(performSyncRequest);
function requestSync(req={}){return syncQueue.request(req)}

const V82ARCHIVEINDEX='lv82-conflict-archive-index';
const v82Array=bytes=>bytes?new Uint8Array(bytes):null;
async function archivePairV82({localBytes,cloudBytes,baseBytes=null,kind='Konflikt',reason=''}){
 const localDb=new SQL.Database(localBytes),cloudDb=new SQL.Database(cloudBytes);
 let baseDb=baseBytes?new SQL.Database(baseBytes):null;
 try{
  const l=SyncMerge81.snapshot(localDb),c=SyncMerge81.snapshot(cloudDb),b=baseDb?SyncMerge81.snapshot(baseDb):null;
  if(l.database_id!==c.database_id)reason+=' · Verschiedene Datenbank-IDs';
  const id='c'+(await sha256Hex(l.database_id+'|'+l.revision_id+'|'+c.revision_id)).slice(0,32);
  const list=await ig(V82ARCHIVEINDEX)||[];
  if(list.some(x=>x.id===id))return id;
  const plan=SyncMerge81.compare(b,l,c);
  const row={id,kind,reason,created:Date.now(),database_id:l.database_id,local_revision:l.revision_id,cloud_revision:c.revision_id,base_revision:b?.revision_id||'',local_movements:Object.keys(l.movements).length,cloud_movements:Object.keys(c.movements).length,
    customerCount:new Set([...Object.values(l.movements),...Object.values(c.movements)].map(x=>x.customer).filter(Boolean)).size,
    differences:plan.movementChanges.length+plan.articleChanges.length+plan.deletionChanges.length,status:'offen'};
  // Store both complete originals *before* making the archive visible in the list.
  await ip('lv82-archive:'+id+':local',v82Array(localBytes).slice().buffer);
  await ip('lv82-archive:'+id+':cloud',v82Array(cloudBytes).slice().buffer);
  if(baseBytes)await ip('lv82-archive:'+id+':base',v82Array(baseBytes).slice().buffer);
  await ip(V82ARCHIVEINDEX,[row,...list]);
  dispatchSyncEvent('lv82:archive-changed',{id});
  return id;
 }finally{localDb.close();cloudDb.close();baseDb?.close()}
}
async function archiveCurrentPairV82(kind='Konflikt',reason='',existingCloud=null){
 await persistQueue;
 const cloud=existingCloud||await inspectCloudDatabase();
 if(cloud.status!==SyncCore.CloudStatus.OK)throw Error('Cloud-Datenstand nicht sicher lesbar. Archiv wurde nicht erstellt.');
 const base=await ig(SYNCBASEKEY);
 return archivePairV82({localBytes:db.export(),cloudBytes:cloud.bytes,baseBytes:base?new Uint8Array(base):null,kind,reason});
}
async function archiveDetailsV82(id,source='local'){
 const entry=(await ig(V82ARCHIVEINDEX)||[]).find(x=>x.id===id);
 if(!entry)throw Error('Archiv nicht gefunden.');
 if(!['local','cloud'].includes(source))throw Error('Unbekannte Archivseite.');
 const wanted=await ig('lv82-archive:'+id+':'+source),other=await ig('lv82-archive:'+id+':'+(source==='local'?'cloud':'local'));
 if(!wanted||!other)throw Error('Archivdateien nicht vollständig vorhanden.');
 const a=new SQL.Database(new Uint8Array(wanted)),b=new SQL.Database(new Uint8Array(other));
 try{
  const ss=SyncMerge81.snapshot(a),os=SyncMerge81.snapshot(b),now=SyncMerge81.snapshot(db);
  const result=SyncMerge81.recoveryPreview(ss,now,os);
  return {entry,source,rows:result.rows,blocked:result.blocked,reason:result.reason||'',counts:result.counts||{}};
 }finally{a.close();b.close()}
}
async function recoverArchiveV82(id,source,selected,details={}){
 await persistQueue;
 if(!Array.isArray(selected)||!selected.length)throw Error('Keine Änderungen ausgewählt.');
 const a=await ig('lv82-archive:'+id+':'+source),b=await ig('lv82-archive:'+id+':'+(source==='local'?'cloud':'local'));
 if(!a||!b)throw Error('Archivdateien fehlen.');
 const start=currentDbState().revision_id;
 const backupName=await writeBackupBytes(db.export(),'Sicherheitsbackup','V82_vor_Archivuebernahme',false);
 const result=SyncMerge81.recover({SQL,currentBytes:db.export(),sourceBytes:new Uint8Array(a),otherBytes:new Uint8Array(b),selected,details});
 if(currentDbState().revision_id!==start)throw Error('Datenstand während Archivübernahme verändert. Keine Änderungen übernommen.');
 const old=db,candidate=new SQL.Database(result.bytes);
 try{
  db=candidate;initSchema();audit('Administrator','ARCHIVÜBERNAHME','Synchronisierung',id,`Archivseite: ${source}; Übernommene Änderungen: ${result.applied}; Übersprungene: ${result.already}; Backup: ${backupName.name}`);
  await persist(true);old.close();
 }catch(e){db=old;candidate.close();throw e}
 const list=await ig(V82ARCHIVEINDEX)||[];
 const next=list.map(x=>x.id===id?{...x,lastApplied:Date.now(),status:'teilweise/geprüft',appliedCount:Number(x.appliedCount||0)+result.applied}:x);
 await ip(V82ARCHIVEINDEX,next);dispatchSyncEvent('lv82:archive-changed',{id});
 return {ok:true,applied:result.applied,already:result.already};
}
window.LVSyncArchiveState={
 async list(){await ready;return await ig(V82ARCHIVEINDEX)||[]},
 async archiveCurrent(kind='Manuell',reason=''){await ready;return archiveCurrentPairV82(kind,reason)},
 async details(id,source='local'){await ready;return archiveDetailsV82(id,source)},
 async recover(id,source,selected,details){await ready;return recoverArchiveV82(id,source,selected,details)},
 async download(id,side){await ready;if(!['local','cloud','base'].includes(side))throw Error('Ungültiger Archivteil.');const raw=await ig('lv82-archive:'+id+':'+side);if(!raw)throw Error('Archivdatei nicht vorhanden.');const a=document.createElement('a');const url=URL.createObjectURL(new Blob([raw],{type:'application/octet-stream'}));a.href=url;a.download=`lager_${id}_${side}.db`;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000)}
};

let pendingMerge81=null;
async function compareMerge81(choices={}){
 await ready;await persistQueue;
 const cloud=await inspectCloudDatabase();
 if(cloud.status!==SyncCore.CloudStatus.OK)throw new Error('Cloud-Datenbank nicht lesbar: '+(cloud.error||cloud.status));
 const local=currentDbState();
 const b=await ig(SYNCBASEKEY),baseBytes=b?new Uint8Array(b):null;
 const localBytes=db.export();
 const csdb=new SQL.Database(cloud.bytes),bsdb=baseBytes?new SQL.Database(baseBytes):null;
 try{
  const localView=SyncMerge81.snapshot(db),cloudView=SyncMerge81.snapshot(csdb),baseView=bsdb?SyncMerge81.snapshot(bsdb):null;
  const result=SyncMerge81.compare(baseView,localView,cloudView,choices);
  const archiveId=(local.revision_id!==cloud.state.revision_id)?await archivePairV82({localBytes,cloudBytes:cloud.bytes,baseBytes,kind:'Konfliktvergleich',reason:'Unterschiedliche lokale und Cloud-Datenstände'}):'';
  pendingMerge81={cloudRevision:cloud.state.revision_id,localRevision:local.revision_id,localBytes,cloudBytes:cloud.bytes,baseBytes};
  return {ok:true,cloudRevision:cloud.state.revision_id,localRevision:local.revision_id,baseRevision:baseView?.revision_id||'',baseRevisionNumber:baseView?.revision??null,archiveId,cloudDate:cloud.modified||0,localDate:local.changed_at||0,...result};
 }finally{csdb.close();bsdb?.close()}
}
async function commitMerge81(choices={}){
 if(!pendingMerge81)throw new Error('Bitte zuerst einen aktuellen Konfliktvergleich öffnen.');
 await persistQueue;
 const previous=pendingMerge81, local=currentDbState(),cloud=await inspectCloudDatabase();
 if(cloud.status!==SyncCore.CloudStatus.OK)throw new Error('Cloud konnte vor der Zusammenführung nicht gelesen werden.');
 if(local.revision_id!==previous.localRevision||cloud.state.revision_id!==previous.cloudRevision){pendingMerge81=null;throw new Error('Ein Datenstand hat sich seit der Vorschau geändert. Bitte erneut vergleichen. Keine Daten überschrieben.')}
 if(!previous.baseBytes)throw new Error('Keine bestätigte gemeinsame Ausgangsdatenbank. Automatische Zusammenführung ist gesperrt.');
 // Beide Originale vor jeglichem Schreibversuch separat sichern.
 await writeBackupBytes(previous.localBytes,'Sicherheitsbackup','V81_Lokal_vor_Zusammenfuehrung',false);
 await writeBackupBytes(cloud.bytes,'Sicherheitsbackup','V81_Cloud_vor_Zusammenfuehrung',false);
 const merged=SyncMerge81.apply({SQL,localBytes:previous.localBytes,cloudBytes:cloud.bytes,baseBytes:previous.baseBytes,choices});
 const candidateDb=new SQL.Database(merged.bytes);
 let candidate;
 try{
  const nextRev=Math.max(Number(local.revision),Number(cloud.state.revision))+1;
  const parent=cloud.state.revision_id,nextId=randomId();
  candidateDb.run("INSERT INTO sync_state(key,value) VALUES('parent_revision_id',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",[parent]);
  candidateDb.run("INSERT INTO sync_state(key,value) VALUES('revision',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",[String(nextRev)]);
  candidateDb.run("INSERT INTO sync_state(key,value) VALUES('revision_id',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",[nextId]);
  candidateDb.run("INSERT INTO sync_state(key,value) VALUES('cloud_base_revision_id',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",[nextId]);
  candidateDb.run("INSERT INTO sync_state(key,value) VALUES('cloud_base_revision',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",[String(nextRev)]);
  candidateDb.run("INSERT INTO sync_state(key,value) VALUES('changed_at',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",[String(Date.now())]);
  candidate={bytes:candidateDb.export(),state:stateFromDatabase(candidateDb)};
 }finally{candidateDb.close()}
 const before=await inspectCloudDatabase();
 if(before.status!==SyncCore.CloudStatus.OK||before.state.revision_id!==previous.cloudRevision||currentDbState().revision_id!==previous.localRevision)throw new Error('Zwischenzeitliche Änderungen: Zusammenführung abgebrochen.');
 await cloudAdapter.write(candidate.bytes);
 const verified=await inspectCloudDatabase();
 SyncCore.verifyWrittenState(candidate.state,verified);
 await ip(SYNCBASEKEY,candidate.bytes.buffer.slice(candidate.bytes.byteOffset,candidate.bytes.byteOffset+candidate.bytes.byteLength));
 const meta=await ig(METAKEY)||{};
 meta.lastSync=Date.now();meta.fileModified=verified.modified||0;
 meta.expectedCloudRevisionId=candidate.state.revision_id;meta.expectedCloudDatabaseId=candidate.state.database_id;
 meta.lastCloudRevision=candidate.state.revision;meta.lastCloudRevisionId=candidate.state.revision_id;
 meta.writeBlocked=false;delete meta.syncErrorCode;delete meta.syncErrorMessage;
 // Auch die Uebernahme der zusammengefuehrten Daten in IndexedDB erfolgt
 // seriell mit parallel eingegebenen Buchungen.
 const adoptMerged=async()=>{
  if(currentDbState().revision_id!==previous.localRevision)return false;
  await ip(DBKEY,candidate.bytes.buffer.slice(candidate.bytes.byteOffset,candidate.bytes.byteOffset+candidate.bytes.byteLength));
  if(currentDbState().revision_id!==previous.localRevision)return false;
  db.close();db=new SQL.Database(candidate.bytes);initSchema();return true;
 };
 persistQueue=persistQueue.then(adoptMerged,adoptMerged);
 const adopted=await persistQueue;
 if(!adopted){
  meta.dirty=true;meta.pendingChanges=Math.max(1,Number(meta.pendingChanges||1));
  // Nachlauf: die unabhaengigen neuen Buchungen bleiben lokal gespeichert.
 }else{meta.dirty=false;meta.pendingChanges=0}
 await ip(METAKEY,meta);pendingMerge81=null;
 dispatchSyncEvent('lv81:sync-ok',{revision:candidate.state.revision_id,dirty:meta.dirty});
 if(meta.dirty)dispatchSyncEvent('lv81:local-saved',{pendingChanges:meta.pendingChanges});
 return {ok:true,merged:merged.plan.movementChanges.length,dirty:meta.dirty};
}
window.LVSyncMergeState={compare:compareMerge81,merge:commitMerge81};

window.LVSync={
 async chooseFolder(){return LVStorageModeState.enableCloud()},
 async inspect(){await ready;return inspectCloudDatabase()},
 async reauthorize(){
  if(!handle)throw Error('Kein Synchronisationsordner verbunden.');
  const ok=await requestHandlePermissionExplicit(handle,'readwrite');
  if(!ok)throw Error('Ordnerzugriff wurde nicht freigegeben.');
  const m=await ig(METAKEY)||{};delete m.syncErrorCode;delete m.syncErrorMessage;await ip(METAKEY,m);await syncStatus();return {ok:true};
 },
 async load(reloadAfter=true){try{const m=await ig(METAKEY)||{};if(m.dirty&&!confirm('Achtung: Die lokalen Änderungen sind noch nicht synchronisiert. Ein Sicherheitsbackup wird erstellt. Wirklich den Cloud-Stand laden und den lokalen Stand ersetzen?'))throw Error('Laden des Cloud-Standes abgebrochen.');await loadFromFolder();if(reloadAfter)location.reload();return {ok:true}}catch(e){if(window.syncMsg)msg(syncMsg,e.message,false);throw e}},
 async save(){try{await requestSync({mode:'save',makeBackup:true,force:false});msg(syncMsg,'Datenbank und Backup sicher gespeichert.',true)}catch(e){msg(syncMsg,e.message,false);throw e}},
 async forceSave(){
  if(!confirm('ACHTUNG: Der lokale Datenstand überschreibt die aktuelle, lesbare Cloud-Datei. Vorher wird eine Sicherheitskopie angelegt. Wirklich fortfahren?'))return;
  try{await requestSync({mode:'force',makeBackup:true,force:true});msg(syncMsg,'Cloud-Datei wurde ausdrücklich überschrieben und vorher gesichert.',true)}catch(e){msg(syncMsg,e.message,false);throw e}
 },
 async sync(silent=false){
  try{
   const request=storageMode()==='local_folder'?{mode:'save',silent,makeBackup:!silent,force:false,localFolder:true}:{mode:'sync',silent,makeBackup:!silent};
   const r=await requestSync(request);if(!silent)msg(syncMsg,r?.reloaded?'Neuer Cloud-Stand wurde geladen.':'Synchronisierung erfolgreich.',true);return r
  }catch(e){const m=await ig(METAKEY)||{};m.syncErrorCode=e.code||'sync_error';m.syncErrorMessage=e.message||String(e);await ip(METAKEY,m);if(!silent&&window.syncMsg)msg(syncMsg,e.message,false);else console.warn(e);dispatchSyncEvent('lv81:sync-error',{code:m.syncErrorCode,message:m.syncErrorMessage});throw e}
 },
 async disconnect(){handle=null;await idel(HANDLEKEY);await setDeviceStorageMode('browser_local');const m=await ig(METAKEY)||{};m.writeBlocked=false;await ip(METAKEY,m);await syncStatus();msg(syncMsg,'Lokaler Modus aktiviert. Die Cloud-Datei wurde nicht gelöscht.',true)},
 exportDb(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([db.export()],{type:'application/octet-stream'}));a.download='lager.db';a.click()},
 async importDb(input){try{await LVStorage.openExistingFile(input);location.reload()}catch(e){alert(e.message)}},
 flush(){/* V81: Speichern bleibt lokal; beim Schliessen keine unbeaufsichtigte Cloud-Ueberschreibung. */}
};


 window.LVSyncNoticeState={async get(){await ready;const m=await ig(METAKEY)||{};return {dirty:!!m.dirty,pendingChanges:Number(m.pendingChanges||0),cloudConnected:!!handle,mode:storageMode(),errorCode:m.syncErrorCode||'',errorMessage:m.syncErrorMessage||'',writeBlocked:!!m.writeBlocked,lastSync:Number(m.lastSync||0)};}};
window.LVStorageModeState={
 async get(){
  await ready;const m=await ig(METAKEY)||{},mode=storageMode(),local=currentDbState();
  let cloudRevision=m.lastCloudRevision===undefined?null:Number(m.lastCloudRevision),cloudStatus='missing',permissionRequired=false;
  if(['cloud','local_folder'].includes(mode)&&handle){const c=await inspectCloudDatabase();cloudStatus=c.status;permissionRequired=c.status===SyncCore.CloudStatus.PERMISSION_DENIED;if(c.status===SyncCore.CloudStatus.OK){cloudRevision=Number(c.state.revision||0);m.lastCloudRevision=cloudRevision;m.lastCloudRevisionId=c.state.revision_id;await ip(METAKEY,m)}}
  return {mode,configuredMode:mode,connected:!!handle,folder:handle?.name||'',dirty:!!m.dirty,lastSync:Number(m.lastSync||0),localRevision:Number(local.revision||0),cloudRevision,cloudStatus,permissionRequired,syncing:!!syncQueue.running,conflict:!!m.writeBlocked&&cloudStatus===SyncCore.CloudStatus.OK,syncErrorCode:m.syncErrorCode||'',syncErrorMessage:m.syncErrorMessage||'',autoSync:['cloud','local_folder'].includes(mode)&&!!handle&&!permissionRequired};
 },
 async chooseLocalFolder(){
  await ready;if(!('showDirectoryPicker'in window))throw Error('Dieser Browser unterstützt keine dauerhafte Ordnerauswahl.');
  const selected=await showDirectoryPicker({mode:'readwrite'});if(!await requestHandlePermissionExplicit(selected,'readwrite'))throw Error('Schreibberechtigung wurde nicht erteilt.');
  const previous=handle;handle=selected;const inspection=await inspectCloudDatabase();
  if(inspection.status!==SyncCore.CloudStatus.MISSING){handle=previous;throw Error(inspection.status===SyncCore.CloudStatus.OK?'In diesem Ordner liegt bereits eine lager.db. Wenn dies Ihr bestehender Synchronisationsordner ist, verwenden Sie bitte „Cloud-Synchronisationsordner verbinden“ statt „Lokalen Speicherordner“.' : 'Der Ordner kann nicht sicher als leer bestätigt werden: '+(inspection.error||inspection.status))}
  await ip(HANDLEKEY,handle);await setDeviceStorageMode('local_folder');const m=await ig(METAKEY)||{};m.writeBlocked=false;delete m.expectedCloudRevisionId;delete m.expectedCloudDatabaseId;await ip(METAKEY,m);
  await createBackup('Sicherheitsbackup','Vor Wechsel des lokalen Speicherordners');await requestSync({mode:'initialize',silent:true,force:true,allowCreateMissing:true,makeBackup:false});return {ok:true,mode:'local_folder',folder:handle.name};
 },
 async enableCloud(){
  await ready;if(!('showDirectoryPicker'in window))throw Error('Dieser Browser unterstützt keine dauerhafte Ordnerverknüpfung.');
  const selected=await showDirectoryPicker({mode:'readwrite'});if(!await requestHandlePermissionExplicit(selected,'readwrite'))throw Error('Schreibberechtigung wurde nicht erteilt.');
  const previous=handle;handle=selected;const inspection=await inspectCloudDatabase();

  // Vorhandene beschädigte/unlesbare Dateien bleiben strikt geschützt.
  if(inspection.status===SyncCore.CloudStatus.PERMISSION_DENIED){handle=previous;throw Error('Der ausgewählte Ordner wurde nicht freigegeben. Ordnerzugriff erneut freigeben.');}
  if(inspection.status===SyncCore.CloudStatus.INVALID_DATABASE){handle=previous;throw Error('Im ausgewählten Ordner liegt eine lager.db, die keine gültige/intakte Lagerdatenbank ist. Sie wird nicht überschrieben.');}
  if(inspection.status===SyncCore.CloudStatus.IO_ERROR){handle=previous;throw Error('Die vorhandene lager.db konnte nicht vollständig gelesen werden. Sie wird nicht überschrieben.');}

  // Bestehender Synchronisationsordner: nur verbinden, niemals beim Verbinden überschreiben.
  if(inspection.status===SyncCore.CloudStatus.OK){
   await ip(HANDLEKEY,handle);await setDeviceStorageMode('cloud');
   const m=await ig(METAKEY)||{},local=currentDbState(),cloud=inspection.state;
   m.lastCloudRevision=Number(cloud.revision||0);m.lastCloudRevisionId=cloud.revision_id;m.fileModified=inspection.modified||0;
   delete m.syncErrorCode;delete m.syncErrorMessage;
   if(local.database_id===cloud.database_id&&local.revision_id===cloud.revision_id){
    // Exakt identisch: Verbindung ist unmittelbar bestätigt.
    m.expectedCloudDatabaseId=cloud.database_id;m.expectedCloudRevisionId=cloud.revision_id;m.writeBlocked=false;m.dirty=false;m.pendingChanges=0;await ip(SYNCBASEKEY,inspection.bytes.buffer.slice(inspection.bytes.byteOffset,inspection.bytes.byteOffset+inspection.bytes.byteLength));
   }else{
    // Unterschiedlicher Stand: Verbindung zulassen, Schreiben aber bis zur Start-/Konfliktentscheidung blockieren.
    m.writeBlocked=true;
   }
   await ip(METAKEY,m);await syncStatus();
   return {ok:true,mode:'cloud',folder:handle.name,existing:true,cloudRevision:Number(cloud.revision||0),cloudRevisionId:cloud.revision_id,cloudArticles:Number(cloud.articles||0),cloudMovements:Number(cloud.movements||0),identical:local.database_id===cloud.database_id&&local.revision_id===cloud.revision_id};
  }

  // Nur ein tatsächlich leerer Ordner darf als neue Cloud-Ablage initialisiert werden.
  if(inspection.status!==SyncCore.CloudStatus.MISSING){handle=previous;throw Error('Der Ordner konnte nicht sicher als leer oder als gültiger Synchronisationsordner erkannt werden: '+(inspection.error||inspection.status));}
  await ip(HANDLEKEY,handle);await setDeviceStorageMode('cloud');const m=await ig(METAKEY)||{};m.writeBlocked=false;delete m.expectedCloudRevisionId;delete m.expectedCloudDatabaseId;await ip(METAKEY,m);
  await createBackup('Sicherheitsbackup','Vor Umstellung auf Cloud');await requestSync({mode:'initialize',silent:true,force:true,allowCreateMissing:true,makeBackup:false});return {ok:true,mode:'cloud',folder:handle.name,existing:false,created:true};
 },
 async enableLocal(){handle=null;await idel(HANDLEKEY);await setDeviceStorageMode('browser_local');const m=await ig(METAKEY)||{};m.writeBlocked=false;delete m.expectedCloudRevisionId;delete m.expectedCloudDatabaseId;await ip(METAKEY,m);await syncStatus();return {ok:true,mode:'browser_local'}},
 async changeFolder(){const previous=handle;handle=null;try{const r=await this.enableCloud();if(!r.identical)await idel(SYNCBASEKEY);return r}catch(e){handle=previous;if(previous)await ip(HANDLEKEY,previous);throw e}}
};

window.LVStartupState={
 async get(){
  await ready;const m=await ig(METAKEY)||{},c=await cloudState(),local=currentDbState();
  const cloudForClassify=c.connected?{connected:true,status:c.status||((c.accessible&&c.state)?'ok':'io_error'),state:c.state||null}:{connected:false,status:'missing'};
  let comparison=SyncCore.classifySyncState({local,cloud:cloudForClassify,meta:m});
  if(comparison==='identical'&&c.state){
   // Nur gerätespezifische Metadaten reparieren; keine SQLite-Inhaltsänderung.
   if(m.expectedCloudRevisionId!==c.state.revision_id||m.expectedCloudDatabaseId!==c.state.database_id||m.dirty||m.writeBlocked){m.expectedCloudRevisionId=c.state.revision_id;m.expectedCloudDatabaseId=c.state.database_id;m.lastCloudRevision=Number(c.state.revision||0);m.lastCloudRevisionId=c.state.revision_id;m.dirty=false;m.writeBlocked=false;await ip(METAKEY,m)}
  }
  return {
   setupRequired:setupIsRequired(),needsConfirmation:sessionStorage.getItem('lv_startup_confirmed')!=='1',localModified:local.changed_at||Number(m.localModified||0),localArticles:local.articles,localMovements:local.movements,
   localRevisionLabel:`${local.revision} · ${local.revision_id.slice(0,8)}`,localRevision:Number(local.revision||0),localDirty:!!m.dirty,
   cloudConnected:!!c.connected,cloudAccessible:!!c.accessible,cloudStatus:c.status||'missing',permissionRequired:c.status===SyncCore.CloudStatus.PERMISSION_DENIED,
   cloudModified:Number(c.modified||0),cloudFile:c.file||'',cloudError:c.error||'',localRevisionId:local.revision_id,localDatabaseId:local.database_id,
   cloudRevisionLabel:c.state?`${c.state.revision} · ${c.state.revision_id.slice(0,8)}`:'–',cloudRevision:c.state?Number(c.state.revision||0):null,cloudRevisionId:c.state?c.state.revision_id:'',comparison
  };
 },
 async confirm(mode){
  await ready;
  const m=await ig(METAKEY)||{};
  const c=await inspectCloudDatabase();
  const local=currentDbState();
  m.startupConfirmedAt=Date.now();
  m.startupConfirmedMode=mode;
  if(mode==='local'&&c.status===SyncCore.CloudStatus.OK){
   const safe=local.database_id===c.state.database_id&&(
    m.expectedCloudRevisionId===c.state.revision_id||
    local.cloud_base_revision_id===c.state.revision_id||
    (local.parent_revision_id===c.state.revision_id&&local.revision===Number(c.state.revision||0)+1)
   );
   m.writeBlocked=!safe&&local.revision_id!==c.state.revision_id;
  }
  await ip(SESSIONKEY,db.export().buffer);
  await ip(METAKEY,m);
  sessionStorage.setItem('lv_startup_confirmed','1');
  return {ok:true,writeBlocked:!!m.writeBlocked};
 },
 async loadCloud(){
  await ready;
  if(!handle)throw Error('Kein Synchronisationsordner verbunden.');
  const state=await cloudState();
  if(!state.accessible){
   throw Error('Die Datei lager.db konnte im verbundenen Synchronisationsordner nicht gelesen werden. '+(state.error||''));
  }
  await LVSync.load(false);
  return {
   ok:true,
   file:state.file,
   modified:state.modified
  };
 },
 async createNew(){
  await ready;
  await createBackup('Sicherheitsbackup','Vor neuer Datenbank');
  await idel(SYNCBASEKEY);
  db.close();
  db=new SQL.Database();
  initSchema();
  setSetting('setup_complete','0');
  setSetting('database_version','81');
   const m=await ig(METAKEY)||{};
  m.dirty=true;
  m.localModified=Date.now();
  await ip(METAKEY,m);
  await persist(true);
  return {ok:true};
 }
};

window.LVBackupState={
 async get(){
  await ready;
  const m=await ig(METAKEY)||{};
  return {restorePending:!!m.restorePending,writeBlocked:!!m.writeBlocked,backupName:m.restoreBackupName||''};
 },
 async publishRestored(){
  await ready;
  const m=await ig(METAKEY)||{};
  if(!m.restorePending)throw Error('Es ist kein wiederhergestellter Datenstand vorgemerkt.');
  if(!handle)throw Error('Kein Synchronisationsordner verbunden.');
  await requestSync({mode:'force',force:true,makeBackup:true});
  return {ok:true};
 },
 async discardRestore(){
  await ready;
  const m=await ig(METAKEY)||{};
  if(!m.restorePending)throw Error('Es ist kein wiederhergestellter Datenstand vorgemerkt.');
  await loadFromFolder();
  return {ok:true};
 }
};

window.LVSession={
 async status(){
  await ready;
  const m=await ig(METAKEY)||{};
  let cloudStatus=handle?SyncCore.CloudStatus.IO_ERROR:SyncCore.CloudStatus.MISSING;
  if(handle){
   const inspection=await inspectCloudDatabase();
   cloudStatus=inspection.status;
  }
  return {dirty:!!m.dirty,connected:!!handle,lastSync:m.lastSync||0,cloudStatus,permissionRequired:cloudStatus===SyncCore.CloudStatus.PERMISSION_DENIED};
 },
 async close(mode){
  await ready;
  clearTimeout(autoTimer);
  clearTimeout(automaticBackupTimer);
  if(mode==='sync'){
   if(!handle)throw Error('Es ist kein Synchronisationsordner verbunden. Nutze „Nur lokal schließen“ oder richte zuerst unter Dateisynchronisierung einen Ordner ein.');
   const closeRequest=SyncCore.closeSyncRequestForMode(storageMode());
   if(!closeRequest)throw Error('Im reinen Browser-Modus ist kein Synchronisationsordner aktiv.');
   await requestSync(closeRequest);
   await createBackup('Abschluss','Nach Synchronisierung beim Abmelden');
  }else if(mode==='local'){
   await createBackup('Abschluss','Lokales Abmelden ohne Synchronisierung');
   await persist(false);
  }else if(mode==='discard'){
   const stored=await ig(SESSIONKEY);
   if(stored){
    try{db.close()}catch{}
    db=new SQL.Database(new Uint8Array(stored));
    initSchema();
    await ip(DBKEY,db.export().buffer);
   }
   const m=await ig(METAKEY)||{};
   m.dirty=false;
   m.restorePending=false;
   m.sessionClosed=Date.now();
   await ip(METAKEY,m);
   try{db.close()}catch{}
   return {ok:true,mode};
  }
  const m=await ig(METAKEY)||{};
  m.sessionClosed=Date.now();
  await ip(METAKEY,m);
  try{db.close()}catch{}
  return {ok:true,mode};
 }
};

window.LVBackend={ready,db:()=>db,persist,invalidateAdminSession:()=>adminSessions.revoke()};ready.then(syncStatus);
})();
