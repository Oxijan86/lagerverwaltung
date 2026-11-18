/* Lagerverwaltung Lovrencic V88.6 – verlustfreier RONDO-PDF-Export.
 * Keine Neurasterung, keine Material-/Bestandsänderung: die ORIGINAL-PDF bleibt
 * byte-identisch erhalten. Die Zählmengen werden als zusätzliche PDF-Contents
 * LINKS neben der Einheit ST/M eingetragen. Zähler und Datum unten auf die Zeilen.
 * Bei unbekannter/komprimierter PDF-Struktur wird mit Fehler abgebrochen.
 */
(function(root,factory){
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root){root.LV886PDF=api;api.install();}
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
 'use strict';
 const KNOWN_SHA='a3f457120746435d4a0d8b81b4f808e6a122b448353c91de6d291cdcf16aa29b';
 function ascii(bytes){let result='';for(let i=0;i<bytes.length;i+=16384)result+=String.fromCharCode(...bytes.subarray(i,i+16384));return result;}
 function bytes(s){return new TextEncoder().encode(s);}
 function digestHex(ab){return root.crypto.subtle.digest('SHA-256',ab).then(d=>Array.from(new Uint8Array(d),x=>x.toString(16).padStart(2,'0')).join(''));}
 function sourceBytes(raw){if(raw instanceof Uint8Array)return raw;if(raw instanceof ArrayBuffer)return new Uint8Array(raw);if(ArrayBuffer.isView(raw))return new Uint8Array(raw.buffer,raw.byteOffset,raw.byteLength);throw Error('Die Original-PDF wurde nicht als Binärdaten bereitgestellt.');}
 function parsedPdf(raw){
  const original=sourceBytes(raw);if(original.length<100||original.length>60*1024*1024)throw Error('Original-PDF fehlt oder ist zu groß.');
  const s=ascii(original);if(!s.startsWith('%PDF-'))throw Error('Kein gültiger PDF-Dateikopf.');
  const mark=s.lastIndexOf('startxref');if(mark<0)throw Error('PDF-Querverweistabelle fehlt.');
  const p=/^startxref\s+(\d+)/.exec(s.slice(mark));if(!p)throw Error('PDF-Querverweis ungültig.');
  const priorXref=Number(p[1]);if(!Number.isSafeInteger(priorXref)||s.slice(priorXref,priorXref+4)!=='xref')throw Error('Die Original-PDF nutzt eine nicht unterstützte Querverweisstruktur. Kein Export erzeugt.');
  const startTrailer=s.indexOf('trailer',priorXref);if(startTrailer<0)throw Error('Der PDF-Trailer fehlt.');
  const xrefs=new Map(),lines=s.slice(priorXref+4,startTrailer).trim().split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  let j=0;
  while(j<lines.length){
   const group=/^(\d+)\s+(\d+)$/.exec(lines[j++]);if(!group)throw Error('PDF-Querverweise sind nicht lesbar.');
   let index=Number(group[1]),count=Number(group[2]);if(count>100000||j+count>lines.length)throw Error('PDF-Querverweis ist unvollständig.');
   for(let k=0;k<count;k++){
    const entry=/^(\d{10})\s+(\d{5})\s+([nf])$/.exec(lines[j++]);if(!entry)throw Error('PDF-Querverweise enthalten einen ungültigen Eintrag.');
    if(entry[3]==='n')xrefs.set(index+k,Number(entry[1]));
   }
  }
  const trailer=s.slice(startTrailer,s.indexOf('startxref',startTrailer));
  const oldSize=Number(/\/Size\s+(\d+)/.exec(trailer)?.[1]||0);
  const rootRef=/\/Root\s+(\d+)\s+0\s+R/.exec(trailer)?.[1];
  const infoRef=/\/Info\s+(\d+)\s+0\s+R/.exec(trailer)?.[1];
  const ids=/\/ID\s*(\[[^\]]+\])/.exec(trailer)?.[1];
  if(!oldSize||!rootRef||!xrefs.size||/\/Encrypt\b/.test(trailer))throw Error('PDF-Trailer ist unvollständig oder die PDF ist verschlüsselt.');
  function obj(id){
   const start=xrefs.get(Number(id));if(!Number.isSafeInteger(start))throw Error('PDF-Objekt '+id+' fehlt.');
   const pre=new RegExp('^'+id+'\\s+0\\s+obj\\s*').exec(s.slice(start,start+35));if(!pre)throw Error('PDF-Objekt '+id+' kann nicht gelesen werden.');
   const end=s.indexOf('endobj',start+pre[0].length);if(end<0||end-start>20000)throw Error('PDF-Objekt '+id+' ist keine unterstützte Seitendefinition.');
   return s.slice(start+pre[0].length,end).trim();
  }
  const rootObject=obj(rootRef),treeRef=Number(/\/Pages\s+(\d+)\s+0\s+R/.exec(rootObject)?.[1]);
  if(!treeRef)throw Error('PDF-Seitenbaum nicht gefunden.');
  const pages=[],visiting=new Set();
  function walk(ref,depth){
   if(depth>12||visiting.has(ref))throw Error('Ungültiger PDF-Seitenbaum.');visiting.add(ref);
   const b=obj(ref);if(/\/Type\s*\/Page\b/.test(b)){pages.push({ref,body:b});visiting.delete(ref);return;}
   if(!/\/Type\s*\/Pages\b/.test(b))throw Error('Unerwarteter Seitentyp.');
   const kids=/\/Kids\s*\[([^\]]+)\]/.exec(b)?.[1];if(!kids)throw Error('PDF-Seitenliste unvollständig.');
   const refs=[...kids.matchAll(/(\d+)\s+0\s+R/g)].map(m=>Number(m[1]));if(!refs.length)throw Error('Keine Seitenreferenzen vorhanden.');
   for(const id of refs)walk(id,depth+1);
   visiting.delete(ref);
  }
  walk(treeRef,0);
  if(pages.length<1||pages.length>150)throw Error('Unplausible Seitenanzahl in der PDF.');
  return {original,source:s,pages,priorXref,oldSize,rootRef,infoRef,ids};
 }
 function escLiteral(value){return String(value).replace(/[\\()]/g,'\\$&');}
 function latinText(value){
  const x=String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'');
  return x.replace(/[ß]/g,'ss').replace(/[ı]/g,'i').replace(/[đ]/g,'d').replace(/[^\x20-\x7e]/g,'?');
 }
 function overlay(rows,quantities,meta,number){
  const q=[];const pageRows=rows.filter(x=>Number(x.page)===number);
  for(const r of pageRows){
   const val=quantities?.[String(r.key??r.page+':'+r.position)];if(val==null||String(val).trim()==='')continue;
   const pos=Number(r.position);if(!Number.isInteger(pos)||pos<1||pos>10)throw Error('Ungültige RONDO-Positionsnummer auf Seite '+number+'.');
   const txt=String(val).trim().replace('.',',');if(!/^(?:\d+)(?:,\d{1,4})?$/.test(txt))throw Error('Ungültige Zählmenge bei '+number+'/'+pos+'.');
   const size=10,approxWidth=txt.length*5.6,x=Math.max(311,447-approxWidth);
   const y=841.68-(292.8+45.4*(pos-1));
   q.push('BT /LV886F '+size+' Tf 0 g 1 0 0 1 '+x.toFixed(2)+' '+y.toFixed(2)+' Tm ('+escLiteral(txt)+') Tj ET');
  }
  const counter=latinText(meta?.counter||''),date=latinText(meta?.date||'');
  if(counter){
   const size=counter.length>31?6.4:counter.length>23?7.3:8.5;
   q.push('BT /LV886F '+size+' Tf 0 g 1 0 0 1 103 107.68 Tm ('+escLiteral(counter.slice(0,100))+') Tj ET');
  }
  if(date)q.push('BT /LV886F 8.5 Tf 0 g 1 0 0 1 103 95.68 Tm ('+escLiteral(date)+') Tj ET');
  return 'q\n'+q.join('\n')+'\nQ\n';
 }
 function addContent(page,streamRef,fontRef){
  let body=page.body;
  const content=/\/Contents\s*(\[[^\]]+\]|\d+\s+0\s+R)/.exec(body);
  if(!content)throw Error('Originalseiten-Inhalt fehlt bei PDF-Seite '+page.ref+'.');
  const old=content[1];const parts=old.startsWith('[')?old.slice(1,-1).trim():old;
  body=body.replace(content[0],'/Contents [ '+parts+' '+streamRef+' 0 R ]');
  if(!/\/Resources\s*<</.test(body))throw Error('Originalseite enthält keine direkt lesbaren PDF-Ressourcen. Kein riskanter Export.');
  if(/\/Font\s*<</.test(body)){
   body=body.replace(/\/Font\s*<</,'/Font << /LV886F '+fontRef+' 0 R ');
  }else{
   body=body.replace(/\/Resources\s*<</,'/Resources << /Font << /LV886F '+fontRef+' 0 R >> ');
  }
  return body;
 }
 function incrementPdf(parsed,rows,quantities,meta,onProgress=()=>{},cancelled=()=>false){
  const {original,pages,priorXref,oldSize,rootRef,infoRef,ids}=parsed;
  const nextId=oldSize,fontId=nextId+pages.length;
  const out=[],offsets=new Map();let cursor=original.length;
  function append(text){const u=bytes(text);out.push(u);cursor+=u.length;}
  function object(id,body){offsets.set(id,cursor);append(id+' 0 obj\n'+body+'\nendobj\n');}
  append('\n');
  for(let i=0;i<pages.length;i++){
   if(cancelled())throw Error('PDF-Ausgabe wurde abgebrochen.');
   const page=pages[i],addStream=nextId+i,stream=overlay(rows,quantities,meta,i+1),buffer=bytes(stream);
   object(addStream,'<< /Length '+buffer.length+' >>\nstream\n'+stream+'endstream');
   object(page.ref,addContent(page,addStream,fontId));
   onProgress('Originalseite '+(i+1)+'/'+pages.length+' unverändert übernommen; Mengen ergänzt');
  }
  object(fontId,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const xrefStart=cursor,sorted=[...offsets].sort((a,b)=>a[0]-b[0]);
  append('xref\n');
  for(let i=0;i<sorted.length;){
   let j=i+1;while(j<sorted.length&&sorted[j][0]===sorted[j-1][0]+1)j++;
   append(sorted[i][0]+' '+(j-i)+'\n');
   for(let k=i;k<j;k++)append(String(sorted[k][1]).padStart(10,'0')+' 00000 n \n');
   i=j;
  }
  append('trailer\n<< /Size '+(fontId+1)+' /Root '+rootRef+' 0 R'+(infoRef?' /Info '+infoRef+' 0 R':'')+(ids?' /ID '+ids:'')+' /Prev '+priorXref+' >>\nstartxref\n'+xrefStart+'\n%%EOF\n');
  // IMPORTANT: original bytes are the untouched FIRST binary segment in the output.
  return new Blob([original,...out],{type:'application/pdf'});
 }
 async function render(originalBytes,rows,quantities,onProgress=()=>{},cancelled=()=>false,meta={}){
  const source=sourceBytes(originalBytes);
  if(!root.crypto?.subtle?.digest)throw Error('Sichere PDF-Prüfung fehlt (HTTPS erforderlich).');
  const hash=await digestHex(source.slice().buffer);
  if(hash!==KNOWN_SHA)throw Error('Die RONDO-PDF entspricht nicht der geprüften Originalvorlage. Zum Schutz vor falsch platzierten Mengen wird kein Export erstellt. Bitte zunächst eine neue Vorlagenprüfung durchführen.');
  const pdf=parsedPdf(source);
  if(pdf.pages.length!==72)throw Error('Die Originaldatei hat unerwartet viele Seiten.');
  for(const row of rows||[]){if(!Number.isInteger(Number(row.page))||Number(row.page)<1||Number(row.page)>pdf.pages.length)throw Error('Materialposition liegt außerhalb der PDF.');}
  const output=incrementPdf(pdf,rows||[],quantities||{},meta,onProgress,cancelled);
  if(output.size<=source.length+1000)throw Error('PDF-Erzeugung unvollständig.');
  return output;
 }
 function install(){
  if(!root.LV87PDF||typeof root.LV87PDF.render!=='function')return false;
  root.LV87PDF.render=render;return true;
 }
 return {KNOWN_SHA,parsedPdf,overlay,addContent,incrementPdf,render,install};
});
