# Mitgelieferte PDF- und OCR-Komponenten

- PDF.js / pdfjs-dist 6.4.299: Mozilla, Apache-2.0. Hauptmodul, Worker, Standardfonts, CMaps und Bilddecoder unter vendor/pdfjs. Die beiliegenden Lizenzdateien gelten auch für die jeweiligen Decoder und Fonts. Quelle: https://github.com/mozilla/pdf.js und npm pdfjs-dist@6.4.299.
- Tesseract.js 7.0.0: Apache-2.0, unter vendor/tesseract. Quelle: https://github.com/naptha/tesseract.js und npm tesseract.js@7.0.0.
- Tesseract.js-core 7.0.0: Apache-2.0, unter vendor/tesseract/core. Quelle: https://github.com/naptha/tesseract.js-core und npm tesseract.js-core@7.0.0.
- Deutsche und englische Tesseract-Sprachdaten: @tesseract.js-data/deu 1.0.0 und @tesseract.js-data/eng 1.0.0, Variante 4.0.0_best_int. Quellen: npm-Pakete und https://github.com/tesseract-ocr/tessdata_best (Apache-2.0).

Die vorhandenen Komponenten SQL.js, ExcelJS, SheetJS und JSZip sowie ihre bisherigen Einbindungen bleiben erhalten. Runtime-PDF-/OCR-Dateien werden statisch ausgeliefert und benötigen bei der Verwendung keinen npm-Installationsschritt.
