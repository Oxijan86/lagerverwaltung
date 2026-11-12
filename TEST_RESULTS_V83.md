# V83 – durchgeführte Prüfungen

- `npm test`: **70/70 automatisierte Tests bestanden** (V80/V81/V82/V83 einschließlich Bestands-/Merge-Regressionen).
- `node --check` für die JavaScriptdateien und Inline-HTML-Skripte: ohne Syntaxfehler.
- Chromium V81: 30 isolierte Smartphone-/Desktop-/CSV-Oberflächenprüfungen bestanden (mit simulierten Cloud-Antworten).
- Chromium V82: Konfliktarchiv-UI auf Smartphone und Desktop geprüft (13 + 13 Prüfschritte).
- Chromium-Hilfe: 33 Themen, Suche, Zurücksetzen, nummerierte Schritte auf 390/1280px geprüft.
- Chromium V83: Zwei Bildschirmgrößen, SAP-Materialbeleg-Vorschau mit simuliertem PDF-Textextraktor, Buchungsrichtungsprüfung, Kundenangabe, Bestätigung und Ablehnung einer Materialanforderung; klassische Excel-Vorschau mit simuliertem XLSX-Reader geprüft.
- SAP-Materialbeleg-Synthetiktest: Artikelnummern mit Buchstaben, Kommamenge 1,5, Geschäftsjahr, 301 UL / Ziellager 1010/1025, doppelte Positionen und OCR-Mengenwarnung.

**Nicht durchgeführt:** Vollständiger OCR-Test der tatsächlich hochgeladenen JPG-Seiten im produktiven Smartphone-Browser; OneDrive-Serverupload, File-System-Handle-Berechtigung nach echtem Browser-Neustart und gleichzeitig aktive OneDrive-Clients. Diese Punkte sind vor produktivem Parallelbetrieb real zu verifizieren.
