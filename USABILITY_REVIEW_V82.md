# Bedienbarkeits- und Fehlerprüfung V82.0

## Auf Smartphone und PC geprüft
- Konfliktarchiv: ursprünglicher Kunde, Maschine, Ticket und Löschung sichtbar.
- Einzelne Änderungen können separat ausgewählt werden; bei einer geänderten Buchung auch einzelne Felder.
- Bei Filter-/Suchwechsel bleiben bereits eingetragene Kunden-/Ticketinformationen erhalten.
- Mobile Hilfenavigation: 29 Themen, über Suche und Schnellzugriff erreichbar, Anleitung im mobilen Layout lesbar.
- Nach Suche ohne Treffer kann mit **Alle** oder durch Leeren der Suche die Anleitung wiederhergestellt werden.
- Alle Importwege werden mit nummerierten Anleitungen erklärt, insbesondere SAP-Excel und RONDO-Servicebericht.

## Risikobehaftete Funktionen besonders geprüft
- Doppelte Buchungskennungen und Doppelimport: keine zweite Buchung.
- Unbekannter Artikel/Kunde/Ticket: Vorschau oder korrigierende Eingabe vor Übernahme.
- Gelöschte Buchung gegen parallel geänderte Buchung: Übernahme gesperrt, bis bewusst entschieden wird.
- Negativer Bestand durch nachträgliche Übernahme: Vorgang wird abgebrochen.
- Ungültige Menge oder nicht zulässiges Feld: verworfen statt bestandswirksam.
- Cloud-Ausfall und fehlende Ordnerberechtigung: Änderung bleibt lokal, Cloud-Erfolg nicht behaupten.

## Weiter bestehende technische Grenzen
Ein reiner OneDrive-synchronisierter Ordner bietet keine atomare Sperre für zwei gleichzeitige Schreibzugriffe; eine serverseitige Versionskontrolle ist erst mit einer direkten OneDrive-API möglich. Ohne verlässliche gemeinsame Ausgangsrevision werden Konflikte nicht automatisch zusammengeführt. Diese Grenzen werden in der integrierten Hilfe erklärt.

Tests mit der persönlichen produktiven Cloud-Datei sind absichtlich nicht durchgeführt worden; bitte mit einer Kopie von `lager.db` beginnen.
