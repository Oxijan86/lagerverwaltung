/* RONDO V88.20 – well-formed printable PDF/Word reports for counted articles
 * not confidently located in the RONDO company PDF. Read-only. */
(function(root,factory){'use strict';const a=factory();if(typeof module==='object'&&module.exports)module.exports=a;if(root)root.LV8820Report=a})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const xml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 const lines=(s,len=94)=>{const words=String(s??'').split(/\s+/),out=[];let line='';for(const word of words){if((line+' '+word).trim().length>len&&line){out.push(line);line=''}if(word.length>len){if(line)out.push(line);line='';for(let i=0;i<word.length;i+=len)out.push(word.slice(i,i+len));continue}line+=(line?' ':'')+word}if(line)out.push(line);return out.length?out:['']};
 function makeRows(report){
  if(!report||!Array.isArray(report.reportRows))throw Error('Firmen-Abgleich fehlt.');
  return report.reportRows.filter(r=>r.count_status==='In dieser Inventur gezählt'&&String(r.inventory_count).trim()!=='');
 }
 function renderText(report){const rows=makeRows(report),out=[
   'RONDO – GEZÄHLTE ARTIKEL OHNE BESTÄTIGTE PDF-POSITION',
   'Inventur: '+String(report.sessionName||''),'Erstellt: '+new Date().toLocaleDateString('de-DE'),
   'Diese Liste enthält ausschließlich tatsächlich gezählte Artikel.','Mögliche OCR-Verwechslungen sind als Prüfung gekennzeichnet.',
   'Gesamt: '+rows.length+' Artikel',''
  ];
  for(let i=0;i<rows.length;i++){
   const r=rows[i];out.push((i+1)+'. '+r.article_no+' – '+r.description);
   out.push('   Gezählte Menge: '+r.inventory_count+' '+r.unit+' | Lagerort: '+(r.location||'nicht festgelegt'));
   out.push('   Status: '+r.status+(r.possible_pdf_positions?' | Mögliche PDF-Position: '+r.possible_pdf_positions:''));out.push('');
  }return out.flatMap(x=>lines(x))
 }
 const cp1252={'€':128,'‚':130,'ƒ':131,'„':132,'…':133,'†':134,'‡':135,'ˆ':136,'‰':137,'Š':138,'‹':139,'Œ':140,'Ž':142,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151,'˜':152,'™':153,'š':154,'›':155,'œ':156,'ž':158,'Ÿ':159};
 const latin1=s=>[...String(s)].map(c=>{const n=c.codePointAt(0);return n<=255?String.fromCharCode(n):cp1252[c]!==undefined?String.fromCharCode(cp1252[c]):'?'}).join('');
 const pdfEscape=s=>latin1(s).replace(/[\\()]/g,'\\$&');
 function pdf(report){
  const text=renderText(report),perPage=48,pages=[];
  for(let i=0;i<text.length;i+=perPage)pages.push(text.slice(i,i+perPage));
  if(!pages.length)pages.push(['Keine gezählten zusätzlichen Artikel gefunden.']);
  let objects=[''],id=1;function obj(content){const n=id++;objects[n]=content;return n}
  const catalogId=obj(''),pagesId=obj(''),fontId=obj('<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>');
  const pageIds=[];
  for(let n=0;n<pages.length;n++){
   const ps=pages[n],ops=['BT','/F1 9 Tf','42 792 Td','12 TL'];
   for(let j=0;j<ps.length;j++){if(j)ops.push('T*');ops.push('('+pdfEscape(ps[j])+') Tj')}
   ops.push('ET');const stream=ops.join('\n')+'\n';const contentId=obj('<< /Length '+stream.length+' >>\nstream\n'+stream+'endstream');
   const pageId=obj('<< /Type /Page /Parent '+pagesId+' 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 '+fontId+' 0 R >> >> /Contents '+contentId+' 0 R >>');
   pageIds.push(pageId);
  }
  objects[catalogId]='<< /Type /Catalog /Pages '+pagesId+' 0 R >>';
  objects[pagesId]='<< /Type /Pages /Count '+pageIds.length+' /Kids ['+pageIds.map(x=>x+' 0 R').join(' ')+'] >>';
  let data='%PDF-1.4\n%\xE2\xE3\xCF\xD3\n',offsets=[0];
  for(let i=1;i<objects.length;i++){offsets[i]=data.length;data+=i+' 0 obj\n'+objects[i]+'\nendobj\n'}
  const xref=data.length;data+='xref\n0 '+objects.length+'\n0000000000 65535 f \n';
  for(let i=1;i<objects.length;i++)data+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
  data+='trailer\n<< /Size '+objects.length+' /Root '+catalogId+' 0 R >>\nstartxref\n'+xref+'\n%%EOF\n';
  return Uint8Array.from(data,c=>c.charCodeAt(0));
 }
 async function docx(report,JSZip){if(!JSZip)throw Error('Word-Export benötigt JSZip. Bitte App online öffnen oder PDF herunterladen.');
  const rows=makeRows(report),zip=new JSZip();
  const p=t=>'<w:p><w:r><w:t xml:space="preserve">'+xml(t)+'</w:t></w:r></w:p>';
  const cell=v=>'<w:tc><w:tcPr/><w:p><w:r><w:t xml:space="preserve">'+xml(v)+'</w:t></w:r></w:p></w:tc>';
  let body=p('RONDO – Gezählt, aber keine bestätigte PDF-Position')+p('Inventur: '+(report.sessionName||'')+' | '+new Date().toLocaleDateString('de-DE'))+
   p('Ausschließlich gezählte Artikel; mögliche OCR-Verwechslungen sind gesondert gekennzeichnet.')+
   p('Anzahl: '+rows.length);
  body+='<w:tbl><w:tblPr><w:tblBorders><w:bottom w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/></w:tblBorders></w:tblPr>';
  body+='<w:tr>'+['Art.-Nr.','Bezeichnung','Gezählt','Einheit','Lagerort','Bewertung'].map(cell).join('')+'</w:tr>';
  for(const r of rows)body+='<w:tr>'+[r.article_no,r.description,r.inventory_count,r.unit,r.location,r.status+(r.possible_pdf_positions?' – '+r.possible_pdf_positions:'')].map(cell).join('')+'</w:tr>';
  body+='</w:tbl>';
  const doc='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
   '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+body+'<w:sectPr/></w:body></w:document>';
  zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.folder('_rels').file('.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.folder('word').file('document.xml',doc);
  return zip.generateAsync({type:'blob',compression:'DEFLATE'});
 }
 return {makeRows,renderText,pdf,docx};
});
