/* V87: Export the ORIGINAL scanned RONDO pages with entered counts printed in the
 * quantity column. Images are rendered progressively; no external PDF server.
 * Signature lines remain blank for physical signing.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LV87PDF=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const enc=new TextEncoder();
 const txt=s=>enc.encode(String(s));
 function join(parts){let len=0;for(const p of parts)len+=p.length;const o=new Uint8Array(len);let n=0;for(const p of parts){o.set(p,n);n+=p.length;}return o;}
 class PDFBuilder{
  constructor(){this.objects=[];this.pages=[];}
  add(obj){this.objects.push(obj);return this.objects.length;}
  addPage(jpeg,width,height){
   const im=this.add([txt(`<< /Type /XObject /Subtype /Image /Width ${jpeg.width} /Height ${jpeg.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.bytes.length} >>\nstream\n`),jpeg.bytes,txt('\nendstream')]);
   const cs=txt(`q\n${width} 0 0 ${height} 0 0 cm\n/Im${im} Do\nQ\n`);
   const content=this.add([txt(`<< /Length ${cs.length} >>\nstream\n`),cs,txt('endstream')]);
   const pageNo=this.add(`<< /Type /Page /Parent __PAGES__ 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im${im} ${im} 0 R >> >> /Contents ${content} 0 R >>`);
   this.pages.push(pageNo);
  }
  build(){const pagesNo=this.add(`<< /Type /Pages /Count ${this.pages.length} /Kids [${this.pages.map(p=>p+' 0 R').join(' ')}] >>`);
   const catalog=this.add(`<< /Type /Catalog /Pages ${pagesNo} 0 R >>`),buf=[txt('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')],offset=[0];let at=buf[0].length;
   this.objects.forEach((obj,i)=>{offset.push(at);let content=typeof obj==='string'?[txt(obj.replaceAll('__PAGES__',String(pagesNo)))]:obj;
    const part=[txt(`${i+1} 0 obj\n`),...content,txt('\nendobj\n')];buf.push(...part);at+=part.reduce((s,x)=>s+x.length,0);});
   const start=at;const entries=['0000000000 65535 f \n'];for(let i=1;i<offset.length;i++)entries.push(String(offset[i]).padStart(10,'0')+' 00000 n \n');
   buf.push(txt(`xref\n0 ${offset.length}\n${entries.join('')}trailer\n<< /Size ${offset.length} /Root ${catalog} 0 R >>\nstartxref\n${start}\n%%EOF`));
   return new Blob(buf,{type:'application/pdf'});
  }
 }
 const toBytes=blob=>blob.arrayBuffer().then(b=>new Uint8Array(b));
 async function loadPdf(){const m=await import(new URL('vendor/pdfjs/pdf.min.mjs',document.baseURI).href);m.GlobalWorkerOptions.workerSrc=new URL('vendor/pdfjs/pdf.worker.min.mjs',document.baseURI).href;return m;}
 async function render(originalBytes,rows,quantities,onProgress=()=>{},cancelled=()=>false){
  const m=await loadPdf(),task=m.getDocument({data:new Uint8Array(originalBytes.slice(0)),isEvalSupported:false,stopAtErrors:true,useSystemFonts:true});
  let pdf;try{pdf=await task.promise;const result=new PDFBuilder();
   for(let i=1;i<=pdf.numPages;i++){
    if(cancelled())throw Error('PDF-Ausgabe abgebrochen.');onProgress(`Seite ${i} von ${pdf.numPages} wird ausgefüllt`);
    const page=await pdf.getPage(i),vp=page.getViewport({scale:1.65}),cv=document.createElement('canvas');cv.width=Math.round(vp.width);cv.height=Math.round(vp.height);
    const ctx=cv.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,cv.width,cv.height);
    await page.render({canvasContext:ctx,viewport:vp}).promise;
    const scale=vp.width/page.getViewport({scale:1}).width,pageRows=(rows||[]).filter(r=>Number(r.page)===i);
    for(const row of pageRows){const val=quantities?.[row.key];if(val===null||val===undefined||String(val).trim()==='')continue;
     const pos=Number(row.position);if(pos<1||pos>11)continue;
     // Form geometry is fixed for RONDO 2026 Zählbelege: first row approx. 250/257 pt, 39.35 pt pitch.
     const statusY=(250.0+39.35*(pos-1))*scale,qtyY=(256.6+39.35*(pos-1))*scale;
     ctx.fillStyle='#fff';ctx.fillRect(73*scale,(statusY-9)*1,120*scale,11*scale);
     ctx.fillStyle='#111';ctx.font=`${Math.round(8.1*scale)}px Arial, sans-serif`;ctx.textAlign='left';ctx.fillText('Gezählt',75*scale,statusY);
     ctx.font=`bold ${Math.round(9.4*scale)}px Arial, sans-serif`;ctx.fillText(String(val).replace('.',','),270*scale,qtyY-2*scale);
    }
    const jpeg=await new Promise((res,rej)=>cv.toBlob(b=>b?res(b):rej(Error('PDF-Seite konnte nicht erzeugt werden.')),'image/jpeg',0.85));
    result.addPage({bytes:await toBytes(jpeg),width:cv.width,height:cv.height},page.getViewport({scale:1}).width,page.getViewport({scale:1}).height);
    cv.width=0;cv.height=0;page.cleanup();
   }
   return result.build();
  }finally{if(pdf)await task.destroy()}
 }
 return {render,PDFBuilder};
});
