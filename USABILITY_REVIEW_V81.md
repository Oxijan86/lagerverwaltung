# Bedienbarkeitsprüfung – Lagerverwaltung V81

Die folgende Übersicht dokumentiert die im Code überprüften Funktionen. Eine vollständige praktische End-to-End-Funktionsprüfung an der echten Kunden-Datenbank / OneDrive-Umgebung war nicht verfügbar.

| Bereich | V81-Änderung / Befund | Noch separat zu prüfen |
| --- | --- | --- |
| Dashboard | Dauerhaft sichtbarer Synchronisierungszustand im Kopfbereich | Darstellung bei vielen Dashboard-Elementen auf kleinen Bildschirmen |
| Lagerbestand | Bereits bestehende Live-Suche, Soll-/Mindestfilter, mobile Detailkarten bleiben; nach Speichern Sync-Abfrage | Große Datenbestände und physische Smartphone-Tastatur |
| Neues Material | Neuanlage und Maschinenzuordnung bleiben, Datenänderung löst Sync-Abfrage aus | Betrieb mit unterschiedlichen Stammdatenständen |
| Einbuchung | Eindeutige Buchungskennung, lokale Speicherung und sichtbare Cloud-Erinnerung | Live-SAP-Ablauf mit echten Artikelmengen |
| Entnahme | Wie Einbuchung; Cloud-Fehler verhindert lokale Buchung nicht | Negativbestände, gleichzeitig eintreffende Buchungen |
| PDF-Servicebericht | V80-PDF-Unterticket-/Maschinenfunktionen beibehalten; 16 V80-Regressionstests im Gesamttest enthalten | Reale Layoutvarianten anderer Serviceberichte |
| Inventur | Lokal auch bei Cloud-Ausfall möglich; parallele Inventuränderungen blockieren automatischen Merge | Offene Zählentwürfe und geräteübergreifender Wiederaufnahmeversuch |
| Materialanforderung | V80-Funktionsumfang beibehalten | Bereits angeforderte offene Mengen separat nachhalten (spätere Version) |
| CSV-Firmenimport | Vorschaufehler beseitigt, 50er-Seiten, Statusfilter, Suche, Merken der Auswahl, Warnung im Einbuchungsmodus | Produktive SAP-Datei und Excel-spezifische Formatabweichungen |
| Buchungshistorie | UUID-Nachtragung für bestehende Einträge; Konfliktvergleich erkennt unterschiedliche Buchungsstände | Komplette Historie zwischen Geräten im Realbetrieb |
| Audit | Eindeutige Audit-UUID für Zusammenführung; unverändert vorhandene Audit-Oberfläche | Verfeinerte Ansicht zur Cloud-Herkunft |
| Stammdaten / Lagerorte | Unterschiede separat erkennbar; unsichere gleichzeitige Änderungen blockiert | Selektive Verschmelzung komplexer Stammdaten künftig |
| Backups | Original-V80-Backup vor Migration; Sicherheitsbackups vor Cloud-Überschreibung und Merge | Wiederherstellungsprobe mit einer separaten Testdatenbank |
| Dateisynchronisierung | Dialog, Status, Wiederholung, Ordnerfreigabe, Revisionsprüfung, Drei-Wege-Vergleich | Echter Cloud-Provider-Upload nur über direkte Provider-API beweisbar |
| Hilfe | Neue V81-Hilfekapitel integriert | Weitere kontextabhängige Hinweise |

**Bewusst nicht automatisiert:** Auflösung von parallel geänderten Inventuren, Löschungen, widersprüchlichen Doppelimporten oder nicht nachweisbaren gemeinsamen Datenbankständen. Die Anwendung bietet in diesen Fällen keine potenziell datenvernichtende automatische Auswahl an.
