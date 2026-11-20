/* Hilfereiter V88.19, sichtbar in der bestehenden Hilfe. */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LV884Help=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const topics=[
  {title:'PDF prüfen ohne Inventurabschluss – auch bei Bestand 0 (V88.19)',body:[
   'Für die PDF-Zuordnung werden ALLE aktiven Lagerartikel durchsucht, auch solche ohne bisherige Zählung oder mit Buchbestand 0.',
   'Ein Artikel mit Buchbestand 0 ist NICHT automatisch als 0 gezählt. Erst das tatsächliche Kontrollieren und explizite Bestätigen der Nullzählung schreibt im PDF eine 0.',
   'PDF-Positionen können auch ohne Zählung zugeordnet werden. Bestätigte Zuordnungen verschwinden aus dem Filter für offene Zuordnungen; über „Auch bereits zugeordnete … anzeigen“ sind sie jederzeit wieder sichtbar.',
   'Für fehlende Artikel gibt es nach bewusster Bestätigung eine Neuanlage mit Anfangsbestand 0. Dadurch wird NICHT automatisch eine Nullzählung vorgenommen.',
   '„Später zuordnen“ parkt unklare PDF-Zeilen. „PDF-Prüfstand zwischenspeichern“ sichert bestätigte und zurückgestellte Zuordnungen für eine spätere Fortsetzung.',
   'Die Original-RONDO-PDF kann jederzeit mit dem bisherigen Zählstand ausgegeben und visuell kontrolliert werden, ohne die Inventur abzuschließen. Ungezählte Mengen bleiben leer.',
   'Für I/1-Verwechslungen und bereits falsch angelegte Dubletten müssen Artikelbestand und Zählhistorie gesondert geprüft werden; keine automatische Löschung oder Umbuchung.'
  ]},
  {title:'Sammelzuordnung und OCR-Dubletten I / 1 (V88.19)',body:[
   'Inventur > RONDO-PDF – Zwischenstand / Abschluss herunterladen öffnen und die richtige Inventur auswählen. Es ist kein erneuter PDF-Import und keine neue Inventur erforderlich.',
   'Im Dialog „Sammelzuordnung: OCR-I/1 und identische Bezeichnung“ zuerst I/1-Treffer prüfen wählen. Die App schlägt nur Varianten vor, die sich durch das führende I bzw. 1 unterscheiden und dieselbe Bezeichnung haben.',
   'Mit „Alle unkritischen markieren“ nur für eine eindeutig geprüfte Auswahl fortfahren. Mit „Ausgewählte PDF-Zuordnungen gemeinsam speichern“ wird nach Bestätigung nur die PDF-Belegposition korrigiert. Lagerstammdaten, Lagerbestände und Zählungen ändern sich nicht.',
   'Wenn eine Zählmenge beim falschen Artikel liegt, erfolgt keine Sammelzuordnung oder automatische Übertragung. Im Bereich „PDF-Positionen schnell zuordnen“ muss die betreffende Position einzeln auf die richtige Nummer kontrolliert werden.',
   'Unter „Artikelstamm: falsche I/1-Dubletten“ alle möglichen Doppelartikel anzeigen und CSV-Prüfliste herunterladen. Das ist eine Vorschau und entfernt nichts.',
   'Mit „Sicherheitsprüfung für alle Paare“ prüft die Datenbank jedes Paar auf eigene Buchungen, Lagerbestände, bestehende Zählungen und Lagerort-Zuordnungen. Nur technisch unbenutzte 1-Fehlimporte können nach einer doppelten Bestätigung archiviert werden.',
   'Nur wenn du anhand der Original-RONDO-PDF überprüft hast, dass bei ALLEN markierten Artikeln wirklich der Buchstabe I korrekt ist, darfst du die sichere Archivierung bestätigen. Sonst Auswahl zurücknehmen.',
   'Die Archivierung ist KEINE Bestands- oder Zählmengen-Zusammenführung; sie erstellt Sicherheitsbackups, protokolliert die Änderung und blockiert belegte Artikel. Vor dem Abschluss die separate Firmen-Zusatzliste und das OCR-Prüfprotokoll kontrollieren.'
  ]},
  {title:'PDF-Schnellzuordnung und OCR-Artikelstamm korrigieren',body:[
   'Eine unbesetzte oder falsch erkannte RONDO-PDF-Position kann vor dem Ausfüllen über Artikelnummer UND Beschreibung einem vorhandenen Artikel zugeordnet werden. Die automatische Erkennung macht nur Vorschläge – erst nach ausdrücklicher Bestätigung wird die Zuordnung gespeichert.',
   'Wenn aufgrund einer falschen OCR-Nummer bereits ein eigener Artikelstamm entstanden ist: Im PDF-Export unter „Falsch angelegten OCR-Artikel nachträglich berichtigen“ die bisherige und richtige Nummer angeben. Zuerst zeigt eine Vorschau, ob die Korrektur sicher ist.',
   'Existiert der Zielartikel noch nicht, kann die bestehende Artikel-ID unter Erhalt der Buchungshistorie umbenannt werden. Existiert er bereits, darf nur ein unbenutzter Fehlartikel ohne echte Buchung/gezählte Menge als inaktiv archiviert werden. Vor der Korrektur wird ein Datenbank-Sicherheitsbackup erstellt; der Administrator muss sie freigeben.',
   'Bei widersprüchlichen Mengen, Lagerorten oder Buchungen erfolgt KEINE automatische Zusammenführung. Der Hinweis nennt die blockierenden Daten und der Nutzer prüft den Konflikt.',
   'Bei stark unpassender Bezeichnung wird eine OCR-Nummer nicht ungeprüft mit einer fremden Inventurmenge in die Firmen-PDF übertragen.'
  ]},
  {title:'Zusatzliste fuer RONDO: Artikel ausserhalb der PDF',body:[
   'In Inventur > RONDO-PDF-Zwischenstand herunterladen den PDF-Ausgabedialog oeffnen und „Zusatzliste fuer RONDO herunterladen (CSV)“ waehlen.',
   'Die Liste vergleicht alle aktiven Lagerartikel mit den 719 Belegpositionen, einschliesslich manuell korrigierter PDF-Zuordnungen.',
   'Sicher nicht im Beleg vorhandene Artikel erhalten den Status „NICHT IN RONDO-PDF“. Bei moeglichen OCR-Verwechslungen steht stattdessen „OCR-ZUORDNUNG PRUEFEN“; solche Artikel niemals ungeprueft als fehlend melden.',
   'Gezählte Mengen werden separat neben dem aktuellen Buchbestand angezeigt. Bei nicht gezählten Artikeln ist die Zählmenge leer und der Buchbestand ausdruecklich noch nicht inventurgeprueft.',
   'Der CSV-Export laesst sich in Excel oeffnen und veraendert keine Stammdaten, Lagerbestaende oder Zaehlwerte.'
  ]},
  {title:'Ersteinrichtung',body:[
   'Drei Möglichkeiten bei einer NEUEN Datenbank: Ohne Import starten (leere Datenbank), RONDO-Inventurliste (PDF) oder SAPUI5-Export (Excel/CSV).',
   'Bei einer bereits vorhandenen lager.db zuerst diese öffnen – eine Neu-Einrichtung erzeugt sonst einen getrennten Datenbestand.',
   'SAPUI5-Export: gleiche fünf Spalten wie im CSV-Center. Die Firmenmengen werden nach Prüfung einmalig als Anfangsbestand eingetragen. Keine zusätzliche Einbuchung.',
   'RONDO-PDF: Artikelstamm nach OCR-Prüfung anlegen. Die Belege enthalten keine tatsächlichen Zählmengen. Anschließend Inventur beginnen und Materialien zählen.'
  ]},
  {title:'Abweichender Technikername beim PDF-Artikelimport',body:[
   'Sind die RONDO-Artikel geprüft und wird der verwendete Technikername in einer neuen Datenbank nicht erkannt, erscheint ein Hinweis mit dem übergebenen Namen und den in der Datenbank hinterlegten Technikern.',
   'Du kannst den Hinweis bewusst über OK ignorieren und die geprüften RONDO-Artikel trotzdem übernehmen; bei Abbrechen bleibt die Prüfung erhalten.',
   'Diese Ausnahme gilt NUR für den Artikelstammimport OHNE Zählmengen und OHNE Anfangsbestände. Der gewählte Name wird für diese Artikelanlagen protokolliert; er wird nicht automatisch als aktiver Techniker angelegt.',
   'Für Einbuchungen, Ausbuchungen, SAP-Bestandsübernahmen und den Inventurabschluss sind weiterhin gültige Techniker und die bisher erforderlichen Freigaben nötig.',
   'Zurückgestellte/ungeprüfte Artikel bleiben unberührt. Beim Import wird keine laufende Inventur abgebrochen.'
  ]},
  {title:'Artikelnummern schnell prüfen',body:[
   'Unsichere OCR-Positionen in der jeweiligen Zeile korrigieren, direkt „Diese Zeile geprüft“ wählen.',
   'Bestehende Artikel anhand Nummer und Bezeichnung gegen die Lagerdatenbank vergleichen. Eindeutige Übereinstimmungen können gesammelt bestätigt werden.',
   'Ähnliche Materialnummern nur nach Sichtprüfung übernehmen; keine automatische Ersetzung von Stammdaten oder Mengen.',
   'Unsichere Artikel kannst du direkt in der Zeile über „Später zuordnen“ zurückstellen. Sie bleiben mit Seite, Position und OCR-Ergebnis gespeichert; über den Filter „Später zuordnen“ jederzeit wieder öffnen.',
   'Nur freigegebene Zeilen werden übernommen. Zurückgestellte Artikel werden weder automatisch angelegt noch gebucht. Eine spätere Zuordnung muss ausdrücklich geprüft werden.'
  ]},
  {title:'Laufende Inventur sicher fortsetzen',body:[
   'Wenn bereits eine Inventur in Arbeit ist, heißt die Schaltfläche nach dem PDF-Abgleich „Laufende Inventur fortsetzen“. Es wird keine neue Inventur angelegt und keine laufende abgebrochen.',
   'Beim erneuten Import können neue Materialien hinzugefügt werden. Die bereits gespeicherten Zählungen werden nicht verworfen. Die Inventur wird im bisherigen Entwurf fortgeführt.',
   'Eine neue Inventur wird über die Schaltfläche nur angelegt, wenn noch kein Inventurentwurf existiert.',
   'Die Mengen stehen im PDF links neben ST/M. Der Text „Noch nicht gezählt“ im RONDO-Original bleibt stehen; beim Export darf KEIN „Gezählt“-Ersatz oder weißes Seitenbild entstehen.',
   'Der Export verweigert den Download, falls die Originaldaten nicht vollständig erhalten sind. Bei einem Exportfehler die Browser-/Inventurdaten NICHT löschen.'
  ]},
  {title:'Während der Inventur PDF drucken (Zwischenstand)',body:[
   'In Inventur → RONDO-Firmeninventur auf „Ausgefüllte RONDO-PDF erzeugen“ tippen.',
   'Gespeicherte Inventur wählen. Bei der aktuell offenen Inventur werden noch ungespeicherte Zähleingaben zuerst als Zwischenstand gesichert.',
   'Die App belässt die Original-RONDO-Seiten vollständig unverändert und ergänzt die bereits gezählten Mengen LINKS neben ST oder M in der vorgesehenen Zählmengenspalte. Es wird NICHT „Gezählt“ hineingeschrieben. Nicht gezählte Positionen bleiben leer; 0 bleibt eine echte Null.',
   'Neben den gedruckten Feldbezeichnungen Zähler und Date stehen Techniker und heutiges Exportdatum auf den jeweiligen Linien. Signatur bleibt leer.',
   'Die PDF kann jederzeit mehrfach heruntergeladen werden. Der PDF-Export ist KEIN Inventurabschluss und löst KEINE Bestandsbuchungen aus.'
  ]},
  {title:'Nach Inventurabschluss ausgefüllte PDF herunterladen',body:[
   'Nach „Inventur verbindlich abschließen“ werden die gezählten Bestände mit bewusster Bestätigung in die Lagerdatenbank übernommen.',
   'Die abgeschlossene Inventur bleibt gespeichert und kann unter Inventur erneut ausgewählt werden. Zähler und Exportdatum können auch später erneut eingetragen werden.',
   '„Ausgefüllte RONDO-PDF erzeugen“ öffnen, abgeschlossene Inventur auswählen und PDF auch später nochmals erzeugen.',
   'Nicht dieselben Materialbewegungen ein zweites Mal buchen. Eine erneut erzeugte PDF verändert die Datenbank nicht.'
  ]},
  {title:'Sicherer Cursorwechsel und automatische Lagerortzuordnung (V88.19)',body:[
   'Nach der Auswahl eines schon gezählten Artikels landet der Cursor IMMER im Feld „Weitere Menge“. Das gilt auch dann, wenn die ursprüngliche Artikelsuche noch versucht, das Feld „Gezählt“ zu öffnen.',
   'Bereits gespeicherte Mengen, einschließlich 0, sind schreibgeschützt. Eine bewusste Korrektur erfolgt ausschließlich über „Gesamtmenge korrigieren“ mit Bestätigung. Das bisherige Gesamtmengenfeld bleibt immer gesperrt; die Korrektur erfolgt nur im Dialog.',
   'Wähle oben einen Lagerort für deinen nächsten Fund. Die automatische Zuordnung wird damit aktiviert – du musst nicht zusätzlich „Lagerort hinzufügen“ anklicken, wenn dieser Lagerort bereits existiert.',
   'Gib im Feld „Weitere Menge“ die zusätzlich gefundenen Stücke ein und bestätige mit Enter. Die App addiert zum vorhandenen Zählstand und führt denselben Artikel getrennt am neu ausgewählten Lagerort.',
   'Beispiel: Fach A enthält bereits 5 Stück. Du stellst auf Fach B um und findest 3 weitere Stück. Ergebnis: Fach A 5 + Fach B 3 = Gesamt 8.',
   'Wenn ein eingetippter Lagerort noch unbekannt ist, muss die Stammdatenanlage ausdrücklich bestätigt werden; die Anwendung erfindet keine Lagerorte.',
   'Bei einer fehlgeschlagenen Speicherung bleiben die Eingaben bestehen und der Cursor springt nicht zum nächsten Artikel. Die Lagerbestände ändern sich weiterhin erst beim verbindlichen Inventurabschluss.'
  ]},
  {title:'Mehrfachzählung und mehrere Lagerorte (V88.19)',body:[
   'Bei Artikelsuche wird ein noch ungezählter Artikel im Feld „Gezählt“ geöffnet. Ein bereits gezählter Artikel (auch mit 0) wird automatisch im Feld „Weitere Menge“ geöffnet.',
   'Gib die zusätzliche Menge ein und bestätige mit Enter. Sie wird zum bisherigen Gesamtzählstand addiert; danach springt der Cursor zurück zur Artikelsuche.',
   'Wähle vor der Zählung oben den tatsächlichen Zählbereich, also Lager und Lagerort/Sortimo-Kiste. Wird derselbe Artikel an einem weiteren Lagerort gefunden, wird diese Teilmenge diesem Lagerort zugeordnet, statt den alten Ort zu überschreiben.',
   'Beispiel: Fach A 5 Stück, Fach B 3 Stück → Gesamtzählstand 8 Stück; die beiden Zählorte werden getrennt geführt.',
   'Falls ein neuer Lagerort noch nicht im Stamm angelegt ist, wird die vorhandene Anlegebestätigung angezeigt. Der neue Lagerort wird als Stammdatum angelegt; die Zuordnung der gezählten Teilmengen wird erst beim verbindlichen Inventurabschluss bestandswirksam.',
   'Bei mehreren Lagerorten ohne ausgewählten aktuellen Zählbereich wird die zusätzliche Zählung gesperrt, damit eine falsche Lagerortzuordnung vermieden wird.',
   'Das alte Feld „Gezählt“ ist nach der ersten Zählung vor versehentlicher Änderung geschützt. „Gesamtmenge korrigieren“ oeffnet nach der Bestaetigung einen separaten Mengen-Dialog. Ab V88.19 bleibt die Aufteilung bei einer Korrektur mit genau einem Zählort erhalten. Bei mehreren Zählorten ist eine bewusste Korrektur pro Lagerort erforderlich.',
   'Die Inventur wird nur zwischengespeichert. Keine Lagerbestände werden durch zusätzliche Zählungen oder PDF-Export verändert. Ein verbindlicher Inventurabschluss ist weiterhin notwendig.'
  ]},
  {title:'Verbindlicher Erstlagerort und sichere Nachzählung (V88.19)',body:[
   'Bei der ERSTEN Zählung muss oben der tatsächliche Zähl-Lagerort ausgewählt sein. Stückzahl und Fundort werden gemeinsam in der laufenden Inventur zwischengespeichert – nicht erst bei der nächsten Eingabe.',
   'Bei einem bereits gezählten Artikel öffnet die Suche weiterhin „Weitere Menge“. Ein neuer Fund wird automatisch dem AKTUELL ausgewählten Lagerort hinzugefügt; die ursprüngliche Zählmenge und der Erstlagerort werden nicht ersetzt.',
   'Beispiel Transportband: erst Fach A 5 Stück; dann Fach B 3 Stück. In der Inventur stehen Fach A 5, Fach B 3, gesamt 8. Ein weiterer Fund in Fach B erhöht ausschließlich Fach B.',
   'Achtung bei älteren Zählungen: Ist der Erstlagerort noch nicht eindeutig in Teilmengen gespeichert, sperrt die App weitere Additionen, statt einen alten Stammdaten-Lagerort zu erraten. Wähle oben den richtigen ursprünglichen Lagerort und klicke „Erstlagerort festlegen / korrigieren“. Erst nach deiner ausdrücklichen Bestätigung wird er zugeordnet.',
   'Ist der Erstlagerort später nachweislich falsch, kannst du ihn mit derselben Funktion nach Bestätigung korrigieren. Andere Zählorte und die Gesamtsumme bleiben dabei erhalten.',
   'Bei mehreren Zählorten wird die gesamte Zahl geschützt. Die Teilmenge eines bestimmten Orts lässt sich über „Menge am aktuellen Lagerort korrigieren“ nach Rückfrage bewusst ändern.',
   'Ein bisher unbekannter Lagerort muss zur Stammdatenanlage ausdrücklich bestätigt werden; bei Eingabe im Zählbereich öffnet die App den vorhandenen Dialog selbstständig.',
   'Die Teilmengen bleiben Zwischenergebnisse der laufenden Inventur. Erst beim verbindlichen Inventurabschluss entstehen Änderungen an Lagerbeständen und Lagerort-Teilbeständen. Vorher auf korrekte Aufteilung prüfen.'
  ]},
  {title:'Ungültige Zählmengen und sicheres Zwischenspeichern (V88.19)',body:[
   'Die Inventur prüft vor jedem Speichern, ob alle Zählmengen zur Einheit passen. Stückartikel wie Stk. akzeptieren nur ganze Zahlen, Meterartikel mit der Einheit m akzeptieren z. B. 4,7. Die Artikelbeschreibung allein ändert die Einheit nicht.',
   'Bei einer alten ungültigen Eingabe zeigt die App die betroffene Artikelnummer, Bezeichnung, Einheit und fehlerhafte Menge direkt im Inventurfenster. Gültige Zählungen werden trotzdem gespeichert; die problematische Eingabe bleibt sicher in der lokalen Wiederherstellungskopie.',
   'Mit „Lokale Eingaben als Sicherung herunterladen“ kannst du die ausstehenden Eingaben zusätzlich als JSON sichern. „Nur diese ungültige Zählung zurücksetzen“ erfordert eine Bestätigung und löscht nicht die Zählungen der anderen Artikel.',
   'Wenn der Artikel tatsächlich in Metern geführt werden muss, korrigiere seine Einheit bewusst im Artikelstamm nach Sicherung der Inventur. Keine automatische Umdeutung von Stk. in m, damit Bestandswerte nicht unbemerkt geändert werden.',
   'Kann die Lagerdatei wegen eines anderen Problems nicht gespeichert werden, bleibt die lokale Wiederherstellungskopie erhalten. Browserdaten und Datenbank nie zur Fehlerbehebung löschen.',
   'Die zuvor sichtbare Fehlermeldung syncStatus is not defined beim Aufruf der Speicherstatusanzeige ist in V88.19 ebenfalls abgesichert.'
  ]},
  {title:'Bestandsschutz und Datensicherung',body:[
   'Zählungen werden zunächst nur in der laufenden Inventur gespeichert. Der aktuelle Istbestand bleibt unverändert, bis eine Inventur verbindlich abgeschlossen wird.',
   'Erst der ausdrückliche Inventurabschluss kann Zu-/Abbuchungen und Lagerortänderungen erzeugen. Ein PDF-Download hat diese Berechtigung nicht.',
   'Vor Gerätewechsel lokalen Stand speichern und Cloud-Synchronisierung prüfen. Niemals Browserdaten oder IndexedDB zum Aktualisieren löschen.',
   'Bei einem OCR-Widerspruch Materialnummer anhand der Original-PDF prüfen. Eine ähnliche Nummer ist noch kein eindeutiger Treffer.',
   'Die unveränderte Original-PDF wird mittels SHA-256 erkannt: 719 Positionen aus 72 Seiten ohne Browser-OCR; ein anderes Dokument wird nicht mit dem gespeicherten Katalog verwechselt. Zeigt diese PDF erneut einen Fehler, zuerst Version 88.19 und den Datei-Fingerabdruck prüfen.'
  ]}
 ];
 const safe=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 function install(){
  if(typeof document==='undefined')return false;
  const help=document.getElementById('help');if(!help||document.getElementById('lv884Help'))return false;
  const wrap=document.createElement('details');wrap.id='lv884Help';wrap.className='lv87-card';wrap.open=true;
  const summary=document.createElement('summary');summary.innerHTML='<b>📘 Neu: Hilfe V88.19 – Inventur, PDF-Ausgabe und Datenbank schützen</b>';wrap.appendChild(summary);
  const head=document.createElement('p');head.textContent='Ausführliche Anleitung für die neue RONDO-PDF-Funktion und die drei Wege der Ersteinrichtung. Jede Anleitung lässt sich einzeln öffnen.';wrap.appendChild(head);
  for(const topic of topics){const el=document.createElement('details');el.className='lv87-card';el.style.border='1px solid #ced9e1';el.style.margin='8px 0';
   const s=document.createElement('summary');s.textContent=topic.title;el.appendChild(s);
   const ol=document.createElement('ol');for(const line of topic.body){const li=document.createElement('li');li.textContent=line;ol.appendChild(li)}el.appendChild(ol);wrap.appendChild(el);
  }
  help.insertBefore(wrap,help.firstChild);return true;
 }
 return {topics,install};
});
