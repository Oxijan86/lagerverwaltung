# Lagerverwaltung Lovrencic – Version 52

## Intelligente Extraktion

### Servicebericht / Entnahme
- Akzeptiert TAB, mehrere Leerzeichen, Semikolon und Pipe.
- Erkennt z. B. `20.07.2026 91339T08 2 Griekse Bakkerij Irini Compas 4.0`.
- Trennt Kunden- und Maschinennamen anhand vorhandener Maschinenstammdaten.
- Automatische Vorschau während der Eingabe.
- Mengen können vor der Buchung geändert werden.
- Einzelne Positionen können entfernt werden.

### Lieferschein / Einbuchung
- Automatische Vorschau.
- Akzeptiert TAB, Leerzeichen, Semikolon und Pipe.
- Optionales Datum am Zeilenanfang wird berücksichtigt.
- Mengen sind änderbar; Positionen können entfernt werden.
- Klare Zusammenfassung der bekannten und unbekannten Artikel.

Die Materialanforderungsvorlage wurde nicht verändert.
