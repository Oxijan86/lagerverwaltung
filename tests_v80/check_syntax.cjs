const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
let count=0;
for(const file of fs.readdirSync(root).filter(name=>name.endsWith('.js'))){
 execFileSync(process.execPath,['--check',path.join(root,file)]);
 count++;
}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
if(!html.includes('id="appVersion">80.0')||!html.includes('service_pdf_v80.js'))throw Error('Falsche Programmversion oder V80-Modul fehlt.');
const backend=fs.readFileSync(path.join(root,'local_backend.js'),'utf8');
if(!backend.includes("version:'80.0'"))throw Error('Falsche Backend-Version');
const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
if(!sw.includes('lv80-pdf-machine-creation-1'))throw Error('Service-Worker-Version ungueltig');
console.log('Syntax, Versionsanzeige, Backend und Service Worker: OK ('+count+' JavaScript-Dateien)');
