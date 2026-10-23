# Microsoft 365 / Copilot – aktuelle Prompts

Vollständige RONDO-Servicebericht-PDFs können ab V77 direkt unter **Entnahme** eingelesen werden, bei Bild-PDFs optional mit Texterkennung. Die folgenden M365/Copilot-Prompts bleiben als zusätzlicher Importweg für die bisherige Textauswertung verfügbar.

## Lieferschein – Einbuchung

```text
IMPORTTYP: EINBUCHUNG

Extrahiere aus diesem Lieferschein ausschließlich das tatsächlich gelieferte Material.

Gib pro Material genau eine neue Zeile in dieser Reihenfolge aus:
Artikelnummer[TAB]Bezeichnung[TAB]Anzahl

Wichtige Regeln:
- Die erste Ausgabezeile muss exakt lauten: IMPORTTYP: EINBUCHUNG
- Danach nur Materialpositionen ausgeben.
- Keine Überschrift, keine Erklärung und keinen Fließtext ergänzen.
- Preise, Summen, Fahrzeit, Arbeitszeit und Kilometer ignorieren.
- Für jedes Material eine neue Zeile erstellen.
- Zwischen den Feldern ein echtes Tabulatorzeichen verwenden.
- Artikelnummer und Bezeichnung exakt übernehmen.
- Mengen als reine Zahl ausgeben.
```

## Servicebericht – Entnahme

```text
IMPORTTYP: ENTNAHME

Extrahiere aus dieser Service-PDF ausschließlich die tatsächlich verwendeten oder verbauten Materialien.

Gib pro Material genau eine neue Zeile in dieser Reihenfolge aus:
Datum[TAB]Artikelnummer[TAB]Bezeichnung[TAB]Anzahl[TAB]Kunde[TAB]Maschine

Wichtige Regeln:
- Die erste Ausgabezeile muss exakt lauten: IMPORTTYP: ENTNAHME
- Danach nur Materialpositionen ausgeben.
- Keine Überschrift, keine Erklärung und keinen Fließtext ergänzen.
- Fahrzeit, Arbeitszeit und Kilometer vollständig ignorieren.
- Nicht verbaute, nur erwähnte oder empfohlene Materialien nicht übernehmen.
- Für jedes Material eine neue Zeile erstellen.
- Zwischen allen Feldern ein echtes Tabulatorzeichen verwenden.
- Artikelnummer und Bezeichnung exakt übernehmen.
- Mengen als reine Zahl ausgeben.
```

Unter jedem Prompt stehen **Prompt markieren** und **Prompt kopieren**. Die Codeblöcke sind auch auf dem Smartphone per Langdruck auswählbar. Beim Kopieren wird zuerst die Clipboard-API verwendet und bei Bedarf eine Browser-Fallbackmethode.
