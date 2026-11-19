/* Lagerverwaltung Lovrencic V88.17 – RONDO-OCR-Schutzschicht.
 * Keine Datenbankmigration, keine Bestandsbuchung durch OCR.
 * Ein fehlerhafter/unklarer Scan bleibt zwingend in der manuellen Prüfansicht.
 */
(function(root, factory){
  'use strict';
  const api=factory(root);
  if(typeof module==='object' && module.exports) module.exports=api;
  if(root && root.document) api.install();
})(typeof globalThis!=='undefined'?globalThis:this, function(root){
  'use strict';
  const n=v=>String(v??'').normalize('NFKC').trim().toUpperCase().replace(/[\s_.]/g,'');
  const expectedCount=p=>p===72?9:10;
  const validNo=s=>/^(?=.*\d)[A-Z0-9][A-Z0-9_\/-]{3,24}$/.test(n(s));
  const isCounted=r=>r?.counted_stock!==null&&r?.counted_stock!==undefined&&String(r?.counted_stock).trim()!=='';
  function ocrWords(result,width,height){
    if(!width||!height)return [];
    const data=result?.data||{},out=[];
    const add=w=>{const b=w?.bbox;if(!b||!String(w.text||'').trim())return;
      out.push({text:String(w.text).trim(),left:b.x0/width,top:b.y0/height,
       width:(b.x1-b.x0)/width,height:(b.y1-b.y0)/height,
       confidence:Number(w.confidence??100)});
    };
    for(const block of data.blocks||[])for(const para of block.paragraphs||[])
      for(const line of para.lines||[])for(const word of line.words||[])add(word);
    if(!out.length&&typeof data.tsv==='string'){
      const lines=data.tsv.trim().split(/\r?\n/);
      const head=(lines.shift()||'').split('\t');
      const map=Object.fromEntries(head.map((name,i)=>[name,i]));
      if(['level','text','left','top','width','height'].every(k=>map[k]!==undefined)){
        for(const line of lines){const c=line.split('\t');if(c[map.level]!=='5')continue;
          const value=c.slice(map.text).join('\t').trim();if(!value)continue;
          const left=Number(c[map.left]),top=Number(c[map.top]),w=Number(c[map.width]),h=Number(c[map.height]);
          if([left,top,w,h].every(Number.isFinite))out.push({text:value,left:left/width,top:top/height,
           width:w/width,height:h/height,confidence:Number(c[map.conf]??100)});
        }
      }
    }
    return out;
  }
  function rateOcr(result, parser, pageNo,dimensions){
    const data=result?.data||{};
    let parsed;
    const words=ocrWords(result,dimensions?.width,dimensions?.height);
    try {parsed=parser(String(data.text||''),pageNo,words)}catch{parsed=null}
    const rows=(parsed?.positions||[]).filter(r=>Number.isInteger(r.position)&&r.position>=1&&r.position<=10);
    const uniqueRows=new Map();
    for(const r of rows)if(!uniqueRows.has(r.position))uniqueRows.set(r.position,r);
    const distinct=[...uniqueRows.values()];
    const sound=distinct.filter(r=>validNo(r.article_no)&&String(r.description||'').trim().length>1).length;
    const verified=distinct.filter(r=>r.verified!==false).length;
    const confidence=Number(data.confidence);
    return {positions:distinct.length,sound,verified,confidence:Number.isFinite(confidence)?confidence:0,
       score:distinct.length*100+sound*18+verified*5+(Number.isFinite(confidence)?confidence/10:0)};
  }
  function chooseOcr(first,second,parser,pageNo,firstDimensions,secondDimensions){
    if(!second)return first;
    const a=rateOcr(first,parser,pageNo,firstDimensions),b=rateOcr(second,parser,pageNo,secondDimensions);
    // Nie willkürlich durch den zweiten Lauf austauschen: mehr belegbare
    // Artikelpositionen zuerst, dann gültige Positionen, dann OCR-Konfidenz.
    const choice=b.score>a.score?second:first;
    if(choice?.data)choice.data._lv88_pass=b.score>a.score?2:1;
    return choice;
  }
  function auditPositions(page, original, words=[]){
    if(!page||!Array.isArray(page.positions))return page;
    const warnings=[...(page.warnings||[])], positions=[],seen=new Set();
    const spatial=original?.parseRondoSpatial?.(words,page.page,page.beleg,'1025')||[];
    const byPos=new Map(spatial.map(r=>[r.position,r]));
    for(const row of page.positions){
      const pos=Number(row.position),no=n(row.article_no),key=String(pos);
      if(!Number.isInteger(pos)||pos<1||pos>10){warnings.push(`Seite ${page.page}: Unzulässige Position ${row.position} – nicht übernommen.`);continue}
      if(seen.has(key)){warnings.push(`Seite ${page.page}: Position ${pos} mehrfach gelesen – manuelle Prüfung.`);const prior=positions.find(r=>r.position===pos);if(prior){prior.verified=false;prior.warning='Position mehrfach gelesen, Original prüfen'}continue}
      seen.add(key);
      const s=byPos.get(pos),description=String(row.description||'').trim();
      const uncertain=!validNo(no)||description.length<2||row.verified===false;
      let warning=String(row.warning||'');
      let verified=!uncertain;
      if(!s){verified=false;warning='Position konnte nicht unabhängig bestätigt werden – Original-PDF kontrollieren';}
      else if(n(s.article_no)!==no){verified=false;warning='Artikelnummer stimmt zwischen Text- und Positionserkennung nicht überein';}
      else if(s.verified===false){verified=false;warning='Positionserkennung unsicher – Artikelnummer und Bezeichnung kontrollieren';}
      else if(s.description&&description){
        const tokens=v=>new Set(String(v).toUpperCase().replace(/[^A-ZÄÖÜ0-9]+/g,' ').split(/\s+/).filter(x=>x.length>=3));
        const a=tokens(s.description),b=tokens(description);
        if(a.size>1&&b.size>1&&![...a].some(w=>b.has(w))){
          verified=false;warning='Bezeichnung der Position weicht vom getrennt gelesenen Text ab';
        }
      }
      // Scanpositionen dürfen nicht als bereits gezählte Mengen ausgegeben werden.
      positions.push({...row,position:pos,article_no:no,counted_stock:null,
        verified,warning:verified?'':warning||'Artikelnummer/Bezeichnung im PDF kontrollieren'});
    }
    const expected=expectedCount(Number(page.page));
    if(positions.length!==expected){warnings.push(`Seite ${page.page}: ${positions.length}/${expected} Positionen. Fehlende oder doppelte Zeilen manuell abgleichen.`)}
    return {...page,positions:positions.sort((a,b)=>a.position-b.position),warnings};
  }
  function qualityOfCanvas(canvas){
    try{
      const w=canvas.width,h=canvas.height;
      if(!w||!h)return {ok:false,reason:'Die PDF-Seite wurde leer gerendert.'};
      const probe=root.document.createElement('canvas');
      probe.width=256;probe.height=352;
      const ctx=probe.getContext('2d',{willReadFrequently:true});
      ctx.drawImage(canvas,0,0,probe.width,probe.height);
      const pixels=ctx.getImageData(0,0,probe.width,probe.height).data;
      let dark=0,total=0;
      for(let i=0;i<pixels.length;i+=4){total++;
        if(pixels[i]*0.299+pixels[i+1]*0.587+pixels[i+2]*0.114<236)dark++;
      }
      probe.width=probe.height=0;
      const share=total?dark/total:0;
      return share<0.00015?{ok:false,reason:'Bildprüfung sieht kaum Schrift (möglicherweise schwacher Scan oder fehlerhafte Vorschau).'}:
        share>0.80?{ok:false,reason:'Die Seite ist ungewöhnlich dunkel. Bitte die PDF überprüfen.'}:{ok:true,darkRatio:share};
    }catch{return {ok:true,reason:'Bildanalyse nicht verfügbar; OCR-Prüfung erfolgt weiterhin.'}}
  }
  function rescaleOcrBboxes(result,scaleX,scaleY){
    if(!result?.data)return result;
    const data=result.data;
    const box=b=>{if(!b)return;for(const k of ['x0','x1'])if(Number.isFinite(b[k]))b[k]*=scaleX;
      for(const k of ['y0','y1'])if(Number.isFinite(b[k]))b[k]*=scaleY;};
    for(const block of data.blocks||[]){box(block.bbox);
      for(const para of block.paragraphs||[]){box(para.bbox);
        for(const line of para.lines||[]){box(line.bbox);
          for(const word of line.words||[])box(word.bbox);
        }
      }
    }
    if(typeof data.tsv==='string'){
      const lines=data.tsv.split(/\r?\n/),head=lines[0]?.split('\t')||[];
      const map=Object.fromEntries(head.map((name,i)=>[name,i]));
      if(['left','top','width','height'].every(k=>map[k]!==undefined)){
        data.tsv=lines.map((line,i)=>{if(i===0||!line)return line;
          const cols=line.split('\t');
          for(const [key,factor] of [['left',scaleX],['width',scaleX],['top',scaleY],['height',scaleY]]){
            const v=Number(cols[map[key]]);if(Number.isFinite(v))cols[map[key]]=String(Math.round(v*factor));
          }
          return cols.join('\t');
        }).join('\n');
      }
    }
    return result;
  }
  function enhanceCanvas(source){
    if(!source||!source.width||!source.height||!root.document) return null;
    const mem=Number(root.navigator?.deviceMemory)||4;
    const maxPixels=mem<=4?4.1e6:5.6e6,maxDim=mem<=4?2550:2900;
    const desired=mem<=4?1.12:1.24;
    const scale=Math.max(0.8,Math.min(desired,maxDim/Math.max(source.width,source.height),Math.sqrt(maxPixels/(source.width*source.height))));
    const canvas=root.document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(source.width*scale));canvas.height=Math.max(1,Math.round(source.height*scale));
    const ctx=canvas.getContext('2d',{willReadFrequently:true,alpha:false});
    if(!ctx)throw Error('Bildverarbeitung wird vom Browser nicht unterstützt.');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(source,0,0,canvas.width,canvas.height);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
    const p=pixels.data;
    // Leichtes Graustufen-Normalisieren statt harter Schwellwert:
    // dünne Materialziffern dürfen nicht verloren gehen.
    for(let i=0;i<p.length;i+=4){
      const gray=p[i]*0.299+p[i+1]*0.587+p[i+2]*0.114;
      const boosted=Math.max(0,Math.min(255,(gray-125)*1.42+125));
      p[i]=p[i+1]=p[i+2]=boosted;
    }
    ctx.putImageData(pixels,0,0);
    return canvas;
  }
  function annotateStatus(text){const e=root.document?.getElementById('lv87ScanStatus');if(e){e.textContent=text;e.setAttribute('role','status')}}
  function installCoreAudit(){
    const Core=root.LV87Core;
    if(!Core||Core._lv88AuditInstalled)return;
    const oldParse=Core.parseOcrPage.bind(Core);
    const spatial=Core.parseRondoSpatial?.bind(Core);
    Core.parseOcrPage=function(text,pageNo,words){
      const parsed=oldParse(text,pageNo,words);
      return auditPositions(parsed,{parseRondoSpatial:spatial},words);
    };
    Core._lv88AuditInstalled=true;
  }
  function installTesseract(){
    const T=root.Tesseract;
    if(!T||T._lv88Installed||typeof T.createWorker!=='function')return false;
    const original=T.createWorker.bind(T);
    T.createWorker=async function(...args){
      const worker=await original(...args);
      if(!worker||typeof worker.recognize!=='function'||worker._lv88Worker)return worker;
      const recognize=worker.recognize.bind(worker);
      worker.recognize=async function(image,options,outputs){
        const quality=qualityOfCanvas(image);
        // V88.17: die verkleinerte Stichprobe ist NICHT beweiskräftig.
        // Auch eine fast weiße Vorschau muss zuerst der echten OCR übergeben werden.
        // Nur der bestehende Scanner darf nach beiden OCR-Läufen ohne erkannte
        // Materialposition abbrechen; eine bloße Helligkeitsheuristik niemals.
        if(!quality.ok){
          annotateStatus('Bildprüfung unsicher – Texterkennung wird trotzdem durchgeführt. '+quality.reason);
          root.console?.warn?.('V88.17: Unklare PDF-Bildvorschau, OCR wird fortgesetzt:',quality.reason);
        }
        const cfg={...(outputs||{}),text:true,tsv:true,blocks:true};
        let first=await recognize(image,options||{},cfg),second=null,enhanced=null,secondDimensions=null;
        const base=rateOcr(first,root.LV87Core.parseOcrPage,1,image);
        // Bei fehlenden, unsicheren oder kaum lesbaren Positionen ein zweiter Lauf.
        if(base.positions<10||base.sound<base.positions||base.confidence<55){
          try{
            annotateStatus(`Zweiter OCR-Lauf: ${base.positions} Positionen erkannt, Bild wird kontrastverstärkt …`);
            enhanced=enhanceCanvas(image);
            secondDimensions={width:enhanced.width,height:enhanced.height};
            second=await recognize(enhanced,options||{},cfg);
          }catch(e){
            if(!first?.data?.text)throw Error('Beide OCR-Wege fehlgeschlagen: '+(e?.message||e));
          }finally{if(enhanced){enhanced.width=0;enhanced.height=0}}
        }
        const chosen=chooseOcr(first,second,root.LV87Core.parseOcrPage,1,image,secondDimensions);
        if(chosen?.data && !quality.ok)chosen.data._lv88_imageWarning=quality.reason;
        if(chosen===second && secondDimensions)rescaleOcrBboxes(second,image.width/secondDimensions.width,image.height/secondDimensions.height);
        return chosen;
      };
      worker._lv88Worker=true;
      return worker;
    };
    T._lv88Installed=true;
    return true;
  }
  function updateVersion(){
    const el=root.document?.getElementById('appVersion');
    if(el){
      if(el._lv87Observer?.disconnect)el._lv87Observer.disconnect();
      el._lv87Observer={disconnect(){}};
      el.textContent='88.17';
      if(!el._lv88Observer && typeof root.MutationObserver==='function'){
        const observer=new root.MutationObserver(()=>{if(el.textContent!=='88.17')el.textContent='88.17'});
        observer.observe(el,{childList:true,characterData:true,subtree:true});
        el._lv88Observer=observer;
      }
    }
    root.document.title='Lagerverwaltung Lovrencic V88.17';
    const description=root.document.querySelector('meta[name="description"]');
    if(description)description.content='Lagerverwaltung Lovrencic V88.17 PWA';
  }
  function install(){
    if(!root.document)return;
    installCoreAudit();installTesseract();updateVersion();
    root.addEventListener?.('pageshow',updateVersion);
    // Wenn ein anderes Fenster/älterer Offline-Stand verzögert lädt, nochmals prüfen.
    root.document.addEventListener?.('DOMContentLoaded',()=>{installCoreAudit();installTesseract();updateVersion()},{once:true});
  }
  return {install,rateOcr,chooseOcr,ocrWords,rescaleOcrBboxes,auditPositions,qualityOfCanvas,enhanceCanvas,expectedCount,isCounted};
});
