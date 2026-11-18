/* Hilfereiter V88.6, sichtbar in der bestehenden Hilfe. */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LV884Help=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const topics=[
  {title:'Ersteinrichtung',body:[
   'Drei Möglichkeiten bei einer NEUEN Datenbank: Ohne Import starten (leere Datenbank), RONDO-Inventurliste (PDF) oder SAPUI5-Export (Excel/CSV).',
   'Bei einer bereits vorhandenen lager.db zuerst diese öffnen – eine Neu-Einrichtung erzeugt sonst einen getrennten Datenbestand.',
   'SAPUI5-Export: gleiche fünf Spalten wie im CSV-Center. Die Firmenmengen werden nach Prüfung einmalig als Anfangsbestand eingetragen. Keine zusätzliche Einbuchung.',
   'RONDO-PDF: Artikelstamm nach OCR-Prüfung anlegen. Die Belege enthalten keine tatsächlichen Zählmengen. Anschließend Inventur beginnen und Materialien zählen.'
  ]},
  {title:'Artikelnummern schnell prüfen',body:[
   'Unsichere OCR-Positionen in der jeweiligen Zeile korrigieren, direkt „Diese Zeile geprüft“ wählen.',
   'Bestehende Artikel anhand Nummer und Bezeichnung gegen die Lagerdatenbank vergleichen. Eindeutige Übereinstimmungen können gesammelt bestätigt werden.',
   'Ähnliche Materialnummern nur nach Sichtprüfung übernehmen; keine automatische Ersetzung von Stammdaten oder Mengen.',
   'Unsichere Artikel kannst du direkt in der Zeile über „Später zuordnen“ zurückstellen. Sie bleiben mit Seite, Position und OCR-Ergebnis gespeichert; über den Filter „Später zuordnen“ jederzeit wieder öffnen.',
   'Nur freigegebene Zeilen werden übernommen. Zurückgestellte Artikel werden weder automatisch angelegt noch gebucht. Eine spätere Zuordnung muss ausdrücklich geprüft werden.'
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
  {title:'Bestandsschutz und Datensicherung',body:[
   'Zählungen werden zunächst nur in der laufenden Inventur gespeichert. Der aktuelle Istbestand bleibt unverändert, bis eine Inventur verbindlich abgeschlossen wird.',
   'Erst der ausdrückliche Inventurabschluss kann Zu-/Abbuchungen und Lagerortänderungen erzeugen. Ein PDF-Download hat diese Berechtigung nicht.',
   'Vor Gerätewechsel lokalen Stand speichern und Cloud-Synchronisierung prüfen. Niemals Browserdaten oder IndexedDB zum Aktualisieren löschen.',
   'Bei einem OCR-Widerspruch Materialnummer anhand der Original-PDF prüfen. Eine ähnliche Nummer ist noch kein eindeutiger Treffer.',
   'Die unveränderte Original-PDF wird mittels SHA-256 erkannt: 719 Positionen aus 72 Seiten ohne Browser-OCR; ein anderes Dokument wird nicht mit dem gespeicherten Katalog verwechselt. Zeigt diese PDF erneut einen Fehler, zuerst Version 88.6 und den Datei-Fingerabdruck prüfen.'
  ]}
 ];
 const safe=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 function install(){
  if(typeof document==='undefined')return false;
  const help=document.getElementById('help');if(!help||document.getElementById('lv884Help'))return false;
  const wrap=document.createElement('details');wrap.id='lv884Help';wrap.className='lv87-card';wrap.open=true;
  const summary=document.createElement('summary');summary.innerHTML='<b>📘 Neu: Hilfe V88.6 – Inventur, PDF-Ausgabe und Datenbank schützen</b>';wrap.appendChild(summary);
  const head=document.createElement('p');head.textContent='Ausführliche Anleitung für die neue RONDO-PDF-Funktion und die drei Wege der Ersteinrichtung. Jede Anleitung lässt sich einzeln öffnen.';wrap.appendChild(head);
  for(const topic of topics){const el=document.createElement('details');el.className='lv87-card';el.style.border='1px solid #ced9e1';el.style.margin='8px 0';
   const s=document.createElement('summary');s.textContent=topic.title;el.appendChild(s);
   const ol=document.createElement('ol');for(const line of topic.body){const li=document.createElement('li');li.textContent=line;ol.appendChild(li)}el.appendChild(ol);wrap.appendChild(el);
  }
  help.insertBefore(wrap,help.firstChild);return true;
 }
 return {topics,install};
});
