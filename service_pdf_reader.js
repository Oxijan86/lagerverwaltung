(function(){
 'use strict';
 let library=null,worker=null;
 const root=new URL('./vendor/',document.baseURI);
 async function pdfjs(){if(!library)library=import(new URL('pdfjs/pdf.min.mjs',root).href).then(m=>{m.GlobalWorkerOptions.workerSrc=new URL('pdfjs/pdf.worker.min.mjs',root).href;return m}).catch(e=>{library=null;throw Error('PDF-Modul konnte nicht geladen werden. Bitte die Anwendung über ihre Webadresse öffnen und das vollständige V77-Paket bereitstellen. '+e.message)});return library}
 function loadOCR(){if(window.Tesseract)return Promise.resolve();return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=new URL('tesseract/tesseract.min.js',root).href;s.onload=resolve;s.onerror=()=>{s.remove();reject(Error('Texterkennung konnte nicht geladen werden. Bitte die vollständigen Programmdateien prüfen.'))};document.head.appendChild(s)})}
 async function ocrPage(page,progress){
  await loadOCR();
  if(!worker)worker=window.Tesseract.createWorker('deu+eng',1,{workerPath:new URL('tesseract/worker.min.js',root).href,corePath:new URL('tesseract/core/',root).href,langPath:new URL('tesseract/lang/',root).href,logger:m=>progress?.('Texterkennung: '+Math.round(Number(m.progress||0)*100)+' %'),errorHandler:()=>{}}).catch(e=>{worker=null;throw e});
  const w=await worker,base=page.getViewport({scale:1}),scale=Math.min(3,2500/Math.max(base.width,base.height)),viewport=page.getViewport({scale}),canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
  try{
   await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
   const result=await w.recognize(canvas,{}, {text:true,blocks:true}),words=[];
   for(const block of result.data.blocks||[])for(const paragraph of block.paragraphs||[])for(const line of paragraph.lines||[])for(const word of line.words||[]){const b=word.bbox;if(b&&word.text)words.push({str:word.text,x:b.x0/scale,y:(viewport.height-(line.bbox?.y1??b.y1))/scale,width:(b.x1-b.x0)/scale,height:(b.y1-b.y0)/scale})}
   return words;
  }finally{canvas.width=0;canvas.height=0}
 }
 async function sha(bytes){const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')}
 async function extract(file,options={}){
  if(file.size>25*1024*1024)throw Error('Die PDF ist größer als 25 MB. Bitte einen kleineren Bericht auswählen.');
  if(!/\.pdf$/i.test(file.name))throw Error('Bitte eine PDF-Datei auswählen.');
  const bytes=new Uint8Array(await file.arrayBuffer());if(!new TextDecoder().decode(bytes.slice(0,1024)).includes('%PDF-'))throw Error('Die Datei ist keine gültige PDF.');
  const file_hash=await sha(bytes),m=await pdfjs(),task=m.getDocument({data:bytes,isEvalSupported:false,enableXfa:false,stopAtErrors:true,cMapUrl:new URL('pdfjs/cmaps/',root).href,cMapPacked:true,standardFontDataUrl:new URL('pdfjs/standard_fonts/',root).href,wasmUrl:new URL('pdfjs/wasm/',root).href,useSystemFonts:true});
  let pdf;
  try{
   pdf=await task.promise;if(pdf.numPages>80)throw Error('Der Bericht hat mehr als 80 Seiten. Bitte einzelne Berichte importieren.');
   const pages=[];
   for(let n=1;n<=pdf.numPages;n++){
    if(options.cancelled?.())throw Error('Auslesen abgebrochen.');
    options.progress?.(`Seite ${n} von ${pdf.numPages} wird gelesen …`);
    const page=await pdf.getPage(n),viewport=page.getViewport({scale:1}),content=await page.getTextContent();let items=content.items.filter(x=>typeof x.str==='string').map(x=>({str:x.str,x:x.transform[4],y:x.transform[5],width:x.width,height:x.height}));
    let ocr=false,text_missing=items.reduce((sum,x)=>sum+x.str.trim().length,0)<40;
    if(text_missing&&options.ocr){items=await ocrPage(page,options.progress);ocr=true;text_missing=items.length===0}
    pages.push({number:n,width:viewport.width,height:viewport.height,items,ocr,text_missing});page.cleanup();
   }
   return {filename:file.name,file_hash,pages};
  }catch(e){
   if(e.name==='PasswordException')throw Error('Die PDF ist kennwortgeschützt. Bitte eine entsperrte Kopie verwenden.');
   throw Error('PDF konnte nicht vollständig gelesen werden: '+e.message);
  }finally{await task.destroy()}
 }
 window.LVServicePDFReader={extract,async closeOCR(){if(worker){try{await (await worker).terminate()}finally{worker=null}}}};
})();
