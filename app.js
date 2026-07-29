let SQL, db, editingArticleId=null, installPrompt=null, msalInstance=null, currentEtag=null;
const DB_KEY='lager-db-v19', META_KEY='lager-meta-v19', SETTINGS_KEY='lager-settings-v19';
const GRAPH='https://graph.microsoft.com/v1.0';
const CLOUD_PATH='/me/drive/special/approot:/lager.db:/content';
const BACKUP_FOLDER='/me/drive/special/approot:/Backups';

const $=id=>document.getElementById(id);
function msg(el,text,ok=true){el.textContent=text;el.className='message '+(ok?'ok':'error')}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function now(){return new Date().toISOString()}
function deDate(s){if(!s)return '';return new Date(s).toLocaleString('de-DE')}
function number(v){return Number(v||0).toLocaleString('de-DE',{maximumFractionDigits:2})}

function idb(){
 return new Promise((resolve,reject)=>{
  const r=indexedDB.open('LagerverwaltungLovrencic',1);
  r.onupgradeneeded=()=>r.result.createObjectStore('files');
  r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
 });
}
async function idbGet(key){const d=await idb();return new Promise((res,rej)=>{const t=d.transaction('files'),r=t.objectStore('files').get(key);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function idbSet(key,val){const d=await idb();return new Promise((res,rej)=>{const t=d.transaction('files','readwrite'),r=t.objectStore('files').put(val,key);r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})}

function initSchema(){
 db.run(`PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS articles(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_no TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'Stk.',
  minimum_stock REAL NOT NULL DEFAULT 0,
  target_stock REAL NOT NULL DEFAULT 0,
  location TEXT NOT NULL DEFAULT '',
  machine TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
 );
 CREATE TABLE IF NOT EXISTS movements(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  movement_date TEXT NOT NULL,
  movement_type TEXT NOT NULL CHECK(movement_type IN('IN','OUT')),
  article_id INTEGER NOT NULL,
  quantity REAL NOT NULL CHECK(quantity>0),
  technician TEXT NOT NULL DEFAULT '',
  customer TEXT NOT NULL DEFAULT '',
  machine TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY(article_id) REFERENCES articles(id)
 );
 CREATE INDEX IF NOT EXISTS idx_mov_article ON movements(article_id);
 CREATE INDEX IF NOT EXISTS idx_mov_date ON movements(movement_date);`);
}
async function loadDb(){
 SQL=await initSqlJs({locateFile:f=>`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${f}`});
 const bytes=await idbGet(DB_KEY);
 db=bytes?new SQL.Database(new Uint8Array(bytes)):new SQL.Database();
 initSchema();
 await saveDb(false);
}
async function saveDb(markDirty=true){
 const data=db.export();
 await idbSet(DB_KEY,data.buffer);
 const meta=(await idbGet(META_KEY))||{};
 if(markDirty)meta.dirty=true;
 meta.localModified=now();
 if(currentEtag)meta.etag=currentEtag;
 await idbSet(META_KEY,meta);
 updateCloudStatus();
}
function rows(sql,params=[]){
 const s=db.prepare(sql);s.bind(params);const out=[];
 while(s.step())out.push(s.getAsObject());
 s.free();return out;
}
function scalar(sql,params=[]){const r=rows(sql,params);return r.length?Object.values(r[0])[0]:0}

function stockSql(alias='a'){return `COALESCE(SUM(CASE WHEN m.movement_type='IN' THEN m.quantity ELSE -m.quantity END),0)`}
function getArticles(){
 return rows(`SELECT a.*,${stockSql()} stock FROM articles a LEFT JOIN movements m ON m.article_id=a.id WHERE a.active=1 GROUP BY a.id ORDER BY a.article_no`);
}
function settings(){return JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')}
function saveSettings(s){localStorage.setItem(SETTINGS_KEY,JSON.stringify(s))}

async function renderAll(){
 renderDashboard();renderArticles();renderArticleSelect();renderHistory();updateSettings();updateCloudStatus();
}
function renderDashboard(){
 const a=getArticles();
 $('kpiArticles').textContent=a.length;
 $('kpiLow').textContent=a.filter(x=>Number(x.stock)<Number(x.minimum_stock)).length;
 $('kpiMoves').textContent=scalar('SELECT COUNT(*) FROM movements');
 $('lowRows').innerHTML=a.filter(x=>Number(x.stock)<Number(x.minimum_stock)).map(x=>`<tr><td>${esc(x.article_no)}</td><td>${esc(x.description)}</td><td>${number(x.stock)}</td><td>${number(x.minimum_stock)}</td></tr>`).join('')||'<tr><td colspan="4">Kein Unterbestand</td></tr>';
}
function renderArticles(){
 const q=$('articleSearch').value.trim().toLowerCase();
 $('articleRows').innerHTML=getArticles().filter(x=>!q||`${x.article_no} ${x.description}`.toLowerCase().includes(q)).map(x=>`<tr><td>${esc(x.article_no)}</td><td>${esc(x.description)}</td><td>${number(x.stock)}</td><td>${esc(x.location)}</td><td><button onclick="editArticle(${x.id})">Bearbeiten</button></td></tr>`).join('');
}
function renderArticleSelect(){
 const list=getArticles();
 $('movementArticle').innerHTML=list.map(x=>`<option value="${x.id}">${esc(x.article_no)} – ${esc(x.description)} (${number(x.stock)})</option>`).join('');
}
function renderHistory(){
 const type=$('historyType').value,q=$('historySearch').value.toLowerCase();
 const list=rows(`SELECT m.*,a.article_no,a.description FROM movements m JOIN articles a ON a.id=m.article_id ORDER BY m.id DESC`);
 $('historyRows').innerHTML=list.filter(x=>(!type||x.movement_type===type)&&(!q||`${x.article_no} ${x.description} ${x.customer} ${x.technician}`.toLowerCase().includes(q))).map(x=>`<tr><td>${deDate(x.movement_date)}</td><td>${x.movement_type==='IN'?'Einbuchung':'Entnahme'}</td><td>${esc(x.article_no)}</td><td>${esc(x.description)}</td><td>${number(x.quantity)}</td><td>${esc(x.technician)}</td><td>${esc(x.customer)}</td></tr>`).join('');
}
window.editArticle=id=>{
 const x=rows('SELECT * FROM articles WHERE id=?',[id])[0];if(!x)return;
 editingArticleId=id;$('articleNo').value=x.article_no;$('articleDescription').value=x.description;
 $('articleUnit').value=x.unit;$('articleMinimum').value=x.minimum_stock;$('articleTarget').value=x.target_stock;
 $('articleLocation').value=x.location;$('articleMachine').value=x.machine;
 document.querySelector('[data-view="articles"]').click();
}
function clearArticle(){
 editingArticleId=null;['articleNo','articleDescription','articleLocation','articleMachine'].forEach(id=>$(id).value='');
 $('articleUnit').value='Stk.';$('articleMinimum').value=0;$('articleTarget').value=0;
}
async function saveArticle(){
 const no=$('articleNo').value.trim(),desc=$('articleDescription').value.trim();
 if(!no||!desc)return msg($('articleMsg'),'Artikelnummer und Bezeichnung sind erforderlich.',false);
 try{
  const p=[no,desc,$('articleUnit').value.trim()||'Stk.',+$('articleMinimum').value||0,+$('articleTarget').value||0,$('articleLocation').value.trim(),$('articleMachine').value.trim(),now()];
  if(editingArticleId)db.run('UPDATE articles SET article_no=?,description=?,unit=?,minimum_stock=?,target_stock=?,location=?,machine=?,updated_at=? WHERE id=?',[...p,editingArticleId]);
  else db.run('INSERT INTO articles(article_no,description,unit,minimum_stock,target_stock,location,machine,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)',[...p,p[7]]);
  await saveDb();clearArticle();renderAll();msg($('articleMsg'),'Artikel gespeichert.',true);
 }catch(e){msg($('articleMsg'),'Speichern fehlgeschlagen: '+e.message,false)}
}
async function book(){
 const id=+$('movementArticle').value,qty=+$('movementQty').value,type=$('movementType').value;
 if(!id||qty<=0)return msg($('bookingMsg'),'Artikel und positive Menge angeben.',false);
 const current=scalar(`SELECT ${stockSql()} stock FROM articles a LEFT JOIN movements m ON m.article_id=a.id WHERE a.id=? GROUP BY a.id`,[id]);
 if(type==='OUT'&&qty>current)return msg($('bookingMsg'),`Nicht genügend Bestand. Verfügbar: ${number(current)}`,false);
 db.run('INSERT INTO movements(movement_date,movement_type,article_id,quantity,technician,customer,machine,note,created_at) VALUES(?,?,?,?,?,?,?,?,?)',
  [now(),type,id,qty,$('movementTechnician').value.trim(),$('movementCustomer').value.trim(),$('movementMachine').value.trim(),$('movementNote').value.trim(),now()]);
 await saveDb();$('movementQty').value='';renderAll();msg($('bookingMsg'),'Buchung gespeichert.',true);
}

function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function exportDb(){downloadBlob(new Blob([db.export()],{type:'application/x-sqlite3'}),'lager.db')}
async function importDb(file){
 const bytes=new Uint8Array(await file.arrayBuffer());
 try{
  const test=new SQL.Database(bytes);const check=test.exec('PRAGMA quick_check');
  if(!check.length||check[0].values[0][0]!=='ok')throw new Error('Integritätsprüfung fehlgeschlagen');
  db.close();db=test;initSchema();await saveDb();renderAll();msg($('settingsMsg'),'SQLite-Datei importiert.',true);
 }catch(e){msg($('settingsMsg'),'Import fehlgeschlagen: '+e.message,false)}
}
function exportCsv(){
 const data=rows(`SELECT m.movement_date,m.movement_type,a.article_no,a.description,m.quantity,m.technician,m.customer,m.machine,m.note FROM movements m JOIN articles a ON a.id=m.article_id ORDER BY m.id DESC`);
 const q=s=>`"${String(s??'').replaceAll('"','""')}"`;
 const csv='\ufeff'+[['Datum','Art','Artikelnummer','Bezeichnung','Menge','Techniker','Kunde','Maschine','Bemerkung'],...data.map(x=>[deDate(x.movement_date),x.movement_type==='IN'?'Einbuchung':'Entnahme',x.article_no,x.description,x.quantity,x.technician,x.customer,x.machine,x.note])].map(r=>r.map(q).join(';')).join('\r\n');
 downloadBlob(new Blob([csv],{type:'text/csv;charset=utf-8'}),`Historie_${new Date().toLocaleDateString('de-DE').replaceAll('.','-')}.csv`);
}

function msalConfig(){
 const s=settings(),clientId=s.clientId||window.LAGER_CONFIG.clientId;
 if(!clientId)return null;
 return {auth:{clientId,authority:`https://login.microsoftonline.com/${s.tenant||window.LAGER_CONFIG.tenant||'common'}`,redirectUri:location.origin+location.pathname},cache:{cacheLocation:'localStorage'}};
}
function ensureMsal(){
 const cfg=msalConfig();if(!cfg)throw new Error('Zuerst unter Einstellungen die Microsoft Client-ID eintragen.');
 if(!msalInstance)msalInstance=new msal.PublicClientApplication(cfg);
 return msalInstance;
}
async function login(){
 try{
  const inst=ensureMsal();
  const result=await inst.loginPopup({scopes:window.LAGER_CONFIG.graphScopes});
  inst.setActiveAccount(result.account);updateCloudStatus();msg($('cloudMsg'),'Microsoft-Anmeldung erfolgreich.',true);
 }catch(e){msg($('cloudMsg'),'Anmeldung fehlgeschlagen: '+e.message,false)}
}
async function token(){
 const inst=ensureMsal();
 let account=inst.getActiveAccount()||inst.getAllAccounts()[0];
 if(!account){await login();account=inst.getActiveAccount()||inst.getAllAccounts()[0]}
 if(!account)throw new Error('Keine Microsoft-Anmeldung.');
 try{return (await inst.acquireTokenSilent({account,scopes:window.LAGER_CONFIG.graphScopes})).accessToken}
 catch{return (await inst.acquireTokenPopup({account,scopes:window.LAGER_CONFIG.graphScopes})).accessToken}
}
async function graph(url,opt={}){
 const t=await token();opt.headers={...(opt.headers||{}),Authorization:`Bearer ${t}`};
 const r=await fetch(GRAPH+url,opt);
 if(!r.ok){let text=await r.text();throw new Error(`Microsoft Graph ${r.status}: ${text}`)}
 return r;
}
async function cloudMeta(){
 try{
  const r=await graph('/me/drive/special/approot:/lager.db');
  const j=await r.json();currentEtag=j.eTag;return j;
 }catch(e){if(String(e).includes('404'))return null;throw e}
}
async function sync(){
 try{
  const meta=(await idbGet(META_KEY))||{},remote=await cloudMeta();
  if(remote&&meta.etag&&remote.eTag!==meta.etag&&meta.dirty){
   throw new Error('Synchronisationskonflikt: Cloud und lokaler Stand wurden beide geändert. Zuerst ein Backup exportieren und anschließend bewusst Cloudstand herunterladen oder lokal hochladen.');
  }
  if(remote&&remote.lastModifiedDateTime&&meta.localModified&&!meta.dirty&&new Date(remote.lastModifiedDateTime)>new Date(meta.lastSync||0)){
   return await downloadCloud();
  }
  const bytes=db.export();
  const headers={'Content-Type':'application/octet-stream'};
  if(currentEtag)headers['If-Match']=currentEtag;
  const r=await graph(CLOUD_PATH,{method:'PUT',headers,body:bytes});
  const j=await r.json();currentEtag=j.eTag;
  await idbSet(META_KEY,{dirty:false,etag:j.eTag,lastSync:now(),localModified:meta.localModified});
  await createBackup(false);
  updateCloudStatus();msg($('cloudMsg'),'OneDrive-Synchronisierung abgeschlossen.',true);
 }catch(e){msg($('cloudMsg'),e.message,false)}
}
async function downloadCloud(){
 try{
  const meta=await cloudMeta();if(!meta)throw new Error('In OneDrive wurde noch keine Datenbank gefunden.');
  const r=await graph(CLOUD_PATH);const bytes=new Uint8Array(await r.arrayBuffer());
  const test=new SQL.Database(bytes),check=test.exec('PRAGMA quick_check');
  if(!check.length||check[0].values[0][0]!=='ok')throw new Error('Cloud-Datenbank ist nicht intakt.');
  db.close();db=test;initSchema();currentEtag=meta.eTag;
  await idbSet(DB_KEY,db.export().buffer);
  await idbSet(META_KEY,{dirty:false,etag:meta.eTag,lastSync:now(),localModified:now()});
  renderAll();msg($('cloudMsg'),'Cloudstand heruntergeladen.',true);
 }catch(e){msg($('cloudMsg'),e.message,false)}
}
async function createBackup(show=true){
 try{
  const stamp=new Date().toISOString().replaceAll(':','-').replace('T','_').slice(0,19);
  const bytes=db.export();
  await graph(`/me/drive/special/approot:/Backups/${stamp}_lager.db:/content`,{method:'PUT',headers:{'Content-Type':'application/octet-stream'},body:bytes});
  if(show)msg($('cloudMsg'),'Cloud-Backup erstellt.',true);
 }catch(e){if(show)msg($('cloudMsg'),'Backup fehlgeschlagen: '+e.message,false)}
}
async function logout(){
 try{const i=ensureMsal();const a=i.getActiveAccount()||i.getAllAccounts()[0];if(a)await i.logoutPopup({account:a});updateCloudStatus()}catch(e){msg($('cloudMsg'),e.message,false)}
}
async function updateCloudStatus(){
 const meta=(await idbGet(META_KEY))||{},s=settings();
 $('dirtyStatus').textContent=meta.dirty?'Ja':'Nein';$('lastSync').textContent=meta.lastSync?deDate(meta.lastSync):'Noch nie';
 $('kpiCloud').textContent=meta.dirty?'Änderungen offen':(meta.lastSync?'Synchron':'Lokal');
 $('settingTechnician').value=s.technician||'';$('settingClientId').value=s.clientId||window.LAGER_CONFIG.clientId||'';$('settingTenant').value=s.tenant||window.LAGER_CONFIG.tenant||'common';
 $('movementTechnician').value=s.technician||$('movementTechnician').value;
 try{
  if(msalConfig()){const i=ensureMsal(),a=i.getActiveAccount()||i.getAllAccounts()[0];$('accountStatus').textContent=a?a.username:'Nicht angemeldet'}
  else $('accountStatus').textContent='Client-ID fehlt';
 }catch{$('accountStatus').textContent='Nicht eingerichtet'}
}
function updateSettings(){const s=settings();$('movementTechnician').value=s.technician||''}
async function saveSettingsUi(){
 const s={technician:$('settingTechnician').value.trim(),clientId:$('settingClientId').value.trim(),tenant:$('settingTenant').value.trim()||'common'};
 saveSettings(s);msalInstance=null;updateSettings();updateCloudStatus();msg($('settingsMsg'),'Einstellungen gespeichert.',true);
}

document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{
 document.querySelectorAll('nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');
 document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));$(b.dataset.view).classList.add('active');
});
$('saveArticleBtn').onclick=saveArticle;$('cancelArticleBtn').onclick=clearArticle;$('articleSearch').oninput=renderArticles;
$('bookBtn').onclick=book;$('historyType').onchange=renderHistory;$('historySearch').oninput=renderHistory;
$('exportCsvBtn').onclick=exportCsv;$('saveSettingsBtn').onclick=saveSettingsUi;$('exportDbBtn').onclick=exportDb;
$('importDbInput').onchange=e=>e.target.files[0]&&importDb(e.target.files[0]);
$('loginBtn').onclick=login;$('logoutBtn').onclick=logout;$('syncBtn').onclick=sync;$('downloadBtn').onclick=downloadCloud;$('backupBtn').onclick=()=>createBackup(true);

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('installBtn').classList.remove('hidden')});
$('installBtn').onclick=async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('installBtn').classList.add('hidden')}};
if('serviceWorker' in navigator)navigator.serviceWorker.register('service-worker.js');

(async()=>{try{await loadDb();await renderAll()}catch(e){document.body.innerHTML=`<main><div class="card"><h2>Startfehler</h2><p>${esc(e.message)}</p></div></main>`}})();
