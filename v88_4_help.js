/* Hilfereiter V88.5, sichtbar in der bestehenden Hilfe. */
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
   'Erst nach Prüfung „Geprüfte Firmenartikel übernehmen“. Neue Artikel werden ohne erfundene Mengen registriert.'
  ]},
  {title:'Während der Inventur PDF drucken (Zwischenstand)',body:[
   'In Inventur → RONDO-Firmeninventur auf „Ausgefüllte RONDO-PDF erzeugen“ tippen.',
   'Gespeicherte Inventur wählen. Bei der aktuell offenen Inventur werden noch ungespeicherte Zähleingaben zuerst als Zwischenstand gesichert.',
   'Die App schreibt ausschließlich die bereits gezählten Mengen in die ORIGINAL-RONDO-PDF. Nicht gezählte Positionen bleiben leer; 0 bleibt eine echte Null.',
   'Im Feld Zähler steht der eingestellte Techniker; das Datum wird beim Export automatisch auf heute gesetzt. Eine Signatur wird nicht eingetragen.',
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
   'Bei der geprüften Original-PDF werden 719 Positionen unabhängig von der Browser-OCR geladen. Zeigt diese PDF erneut einen Fehler, zuerst Version 88.5 und den Datei-Fingerabdruck prüfen.'
  ]}
 ];
 const safe=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 function install(){
  if(typeof document==='undefined')return false;
  const help=document.getElementById('help');if(!help||document.getElementById('lv884Help'))return false;
  const wrap=document.createElement('details');wrap.id='lv884Help';wrap.className='lv87-card';wrap.open=true;
  const summary=document.createElement('summary');summary.innerHTML='<b>📘 Neu: Hilfe V88.5 – Inventur, PDF-Ausgabe und Datenbank schützen</b>';wrap.appendChild(summary);
  const head=document.createElement('p');head.textContent='Ausführliche Anleitung für die neue RONDO-PDF-Funktion und die drei Wege der Ersteinrichtung. Jede Anleitung lässt sich einzeln öffnen.';wrap.appendChild(head);
  for(const topic of topics){const el=document.createElement('details');el.className='lv87-card';el.style.border='1px solid #ced9e1';el.style.margin='8px 0';
   const s=document.createElement('summary');s.textContent=topic.title;el.appendChild(s);
   const ol=document.createElement('ol');for(const line of topic.body){const li=document.createElement('li');li.textContent=line;ol.appendChild(li)}el.appendChild(ol);wrap.appendChild(el);
  }
  help.insertBefore(wrap,help.firstChild);return true;
 }
 return {topics,install};
});
