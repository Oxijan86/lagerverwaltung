
(function(){
const nativeFetch=window.fetch.bind(window);
const DBKEY='lv22-db', METAKEY='lv22-meta', HANDLEKEY='lv22-directory', BACKUPKEY='lv22-backups', SESSIONKEY='lv34-session-start';
let SQL,db,handle=null,autoTimer=null,isSyncing=false;
const helpData={"07-csv-center.md": "# CSV-Center\n\n## Exporte\n\n- Lagerbestand\n- Einbuchungen\n- Entnahmen\n\nDie CSV-Dateien werden direkt im Browser heruntergeladen. Das vorgegebene Tabellenlayout, Semikolon als Trennzeichen und UTF-8 mit BOM bleiben erhalten.\n\n## SAP-Excel oder CSV importieren\n\nUnterstützte Spalten sind unter anderem:\n\n- Material\n- Bezeichnung zum Material\n- Lagerort\n- Bezeichnung des Lagerorts\n- Frei verwendbar\n\nVor dem Buchen wird eine Vorschau angezeigt. Fehlende Artikel können direkt angelegt werden.\n", "02-neues-material.md": "# Neues Material\n\nDer Reiter **Neues Material** ist passwortgeschützt.\n\n## Vorgehen\n\n- Stammdatenpasswort eingeben.\n- Artikelnummer und Bezeichnung erfassen.\n- Anfangsbestand, Sollbestand und Mindestbestand festlegen.\n- Einheit auswählen.\n- Lagerort und Maschine optional auswählen.\n- Material speichern.\n\nDer Anfangsbestand wird als Basisbestand des Artikels geführt.\n", "17-abschluss-und-tests.md": "# Abschluss Phase 1–7\n\nVersion 17.0 schließt das ursprünglich geplante Projekt ab.\n\nAbnahmetest:\n- Artikel anlegen\n- Ein- und Ausbuchung\n- CSV-Export\n- Inventurkorrektur\n- Materialanforderung in Excel öffnen\n- Historienfilter testen\n- Passwortverwaltung prüfen\n", "08-historie.md": "# Historie\n\nDie Historie enthält alle Einbuchungen und Entnahmen.\n\nSie kann gefiltert werden nach:\n\n- Alle Buchungen\n- Nur Einbuchungen\n- Nur Entnahmen\n\nDas unter **Stammdaten** gewählte Datumsformat wird auch auf bereits vorhandene Einträge angewendet.\n", "01-dashboard.md": "# Dashboard\n\nDas Dashboard zeigt die wichtigsten Kennzahlen:\n\n- **Aktive Artikel:** Anzahl aller verwendbaren Artikel.\n- **Unterbestand:** Artikel unterhalb ihres Mindestbestands.\n- **Heute:** Anzahl der heutigen Buchungen.\n- **Buchungen:** Gesamtzahl aller Ein- und Ausbuchungen.\n\nDie Werte werden aus der lokalen Datenbank `lager.db` berechnet.\n", "04-einbuchung.md": "# Einbuchung\n\n## Manuelle Einbuchung\n\n- Datum auswählen.\n- Techniker auswählen.\n- Artikel und Menge hinzufügen.\n- Einbuchung bestätigen.\n\n## Lieferschein mit Microsoft 365 Copilot auslesen\n\nLade den Lieferschein in Microsoft 365 Copilot hoch und verwende diesen Befehl:\n\n```\nLies den beigefügten Lieferschein vollständig aus.\n\nExtrahiere ausschließlich die tatsächlich gelieferten Materialpositionen.\nGib nur diese zwei Spalten aus:\n\nArtikelnummer;Menge\n\nRegeln:\n- Eine Position pro Zeile.\n- Keine Bezeichnung.\n- Keine Überschrift außerhalb der Tabelle.\n- Keine Erklärungen oder Zusammenfassung.\n- Mengen als reine Zahl ausgeben.\n- Gleiche Artikelnummern zu einer Gesamtmenge zusammenfassen.\n```\n\nDas Ergebnis in das Feld **Lieferschein M365/Copilot** einfügen, prüfen und anschließend buchen.\n", "09-stammdaten.md": "# Stammdaten\n\nDie Stammdaten sind durch das Administratorpasswort geschützt.\n\n## Funktionen\n\n- Lagerorte anlegen.\n- Maschinen anlegen.\n- Techniker mit ausschließlich einem Namen anlegen.\n- Artikelstammdaten und Istbestände bearbeiten.\n- Passwort ändern.\n- Datumsformat ändern.\n- Lagerverwaltung vollständig zurücksetzen.\n\n## Datumsformat\n\nVerfügbare Formate:\n\n- TT.MM.JJJJ\n- JJJJ-MM-TT\n- MM/TT/JJJJ\n\nDatumswerte bleiben intern im ISO-Format gespeichert. Dadurch werden nach einer Formatänderung auch bestehende Daten sofort korrekt dargestellt.\n", "15-historienfilter.md": "# Historienfilter und Export\n\nFilter:\n- Buchungsart\n- Zeitraum\n- Techniker\n- Artikelnummer oder Bezeichnung\n\nDer CSV-Export übernimmt die aktuell eingestellten Filter.\n", "03-lagerbestand.md": "# Lagerbestand\n\nIm Lagerbestand können Artikel über Artikelnummer, Bezeichnung, Lagerort oder Maschine gesucht werden.\n\n## Spalten\n\n- Sollbestand\n- Mindestbestand\n- Istbestand\n- Differenz zum Sollbestand\n- Lagerort\n- Maschine\n\nEin Artikel wird als Unterbestand hervorgehoben, wenn sein Istbestand unter dem Mindestbestand liegt.\n", "14-inventur.md": "# Inventur\n\n- Inventurliste im CSV-Center exportieren.\n- Gezählten Bestand eintragen.\n- CSV, TXT oder XLSX einlesen.\n- Differenzen prüfen.\n- Bestandskorrekturen mit Administratorpasswort buchen.\n\nNur Differenzen werden als Buchungen mit der Quelle **Inventur** gespeichert.\n", "06-materialanforderung.md": "# Materialanforderung\n\n- Techniker auswählen.\n- **Unterbestand laden** anklicken.\n- Gewünschte Positionen markieren.\n- Bestellmenge prüfen oder ändern.\n- **Materialanforderung exportieren** anklicken.\n\nDie Excel-Datei wird anhand der hinterlegten Vorlage erzeugt. Der Dateiname enthält Datum und Technikername.\n", "13-fehlerbehebung.md": "# Fehlerbehebung\n\n## Anmeldung funktioniert nicht\n\n- Groß- und Kleinschreibung des Passworts prüfen.\n- Nach einem vollständigen Reset muss die Ersteinrichtung abgeschlossen werden.\n- Das alte Passwort ist nach dem Reset nicht mehr gültig.\n\n## Excel- oder CSV-Datei lässt sich nicht importieren\n\n- Prüfen, ob die Datei geöffnet und gespeichert werden kann.\n- Bei CSV möglichst Semikolon als Trennzeichen verwenden.\n- Artikelnummern und Mengen dürfen nicht leer sein.\n\n## M365-Ergebnis wird nicht erkannt\n\n- Den Prompt aus der Hilfe unverändert verwenden.\n- Ausgabeformat `Artikelnummer;Menge` prüfen.\n- Zusätzliche Erklärungen von Copilot entfernen.\n", "16-materialanforderung-export.md": "# Materialanforderung\n\nDie Originalvorlage `materialanforderung_vorlage.xlsx` bleibt unverändert erhalten.\n\nPrüfungen:\n- maximal 25 Positionen\n- nur positive Mengen\n- doppelte Artikel werden zusammengefasst\n- Vorschau vor Export\n- Sortierung nach Artikelnummer\n\nDateiname: `Bestellung_Datum_Techniker.xlsx`\n", "10-reset.md": "# Vollständiges Zurücksetzen\n\nDer vollständige Reset löscht:\n\n- Artikel\n- Bestände\n- Buchungen\n- Historie\n- Audit-Protokoll\n- Lagerorte\n- Maschinen\n- Techniker\n- Administratorpasswort\n- Einstellungen\n\nProgrammdateien, Excel-Vorlage und Hilfedateien bleiben erhalten.\n\nNach dem Reset erscheint wieder automatisch die vollständige Ersteinrichtung.\n", "11-m365-prompts.md": "# Microsoft 365 Copilot – Prompts\n\n## SAP- oder Materialliste prüfen\n\n```\nPrüfe die beigefügte Materialliste.\n\nErstelle eine Tabelle mit:\nArtikelnummer;Bezeichnung;Menge;Lagerort\n\nRegeln:\n- Eine Position pro Zeile.\n- Leere Zeilen entfernen.\n- Gleiche Artikelnummern zusammenfassen.\n- Mengen als reine Zahl ausgeben.\n- Keine Erklärungen außerhalb der Tabelle.\n```\n\n## Inventurliste auslesen\n\n```\nLies die beigefügte Inventurliste aus.\n\nGib ausschließlich diese Spalten aus:\nArtikelnummer;Menge\n\nRegeln:\n- Eine Position pro Zeile.\n- Gleiche Artikelnummern zusammenfassen.\n- Mengen als reine Zahl ausgeben.\n- Unleserliche Positionen nicht raten, sondern mit PRÜFEN kennzeichnen.\n- Keine zusätzlichen Erklärungen.\n```\n", "00-erste-schritte.md": "# Erste Schritte\n\nDie Lagerverwaltung startet nach der Erstinstallation mit einem Einrichtungsassistenten.\n\n## Ersteinrichtung\n\n- Administratorpasswort mit mindestens 8 Zeichen vergeben.\n- Namen des Technikers eingeben.\n- Datumsformat auswählen.\n- Einrichtung abschließen.\n\nLagerorte und Maschinen müssen bei der Ersteinrichtung nicht angelegt werden. Sie können später unter **Stammdaten** ergänzt werden.\n", "12-mobile-bedienung.md": "# Mobile Bedienung\n\nAuf schmalen Bildschirmen wird die Navigation über die Schaltfläche **Menü** geöffnet.\n\n## Hinweise\n\n- Tabellen können seitlich verschoben werden.\n- Eingabefelder werden untereinander dargestellt.\n- Die Ersteinrichtung ist für Smartphone und Tablet optimiert.\n- Für umfangreiche CSV- und Excel-Arbeiten ist ein Windows-PC komfortabler.\n", "05-entnahme.md": "# Entnahme\n\n## Manuelle Entnahme\n\n- Datum, Techniker, Kunde und Maschine eintragen.\n- Artikel und entnommene Menge hinzufügen.\n- Entnahme bestätigen.\n\n## Servicebericht mit Microsoft 365 Copilot auslesen\n\n```\nLies den beigefügten Servicebericht vollständig aus.\n\nExtrahiere ausschließlich die im Servicebericht tatsächlich verwendeten oder verbauten Materialien.\nGib nur diese zwei Spalten aus:\n\nArtikelnummer;Menge\n\nRegeln:\n- Eine Position pro Zeile.\n- Keine Bezeichnung.\n- Keine Erklärungen oder Zusammenfassung.\n- Mengen als reine Zahl ausgeben.\n- Gleiche Artikelnummern zu einer Gesamtmenge zusammenfassen.\n- Nicht verbaute, nur erwähnte oder empfohlene Materialien nicht übernehmen.\n```\n\nDas Copilot-Ergebnis in das Feld **Servicebericht M365/Copilot** einfügen, mit **Extraktion prüfen** kontrollieren und danach buchen.\n"};

function idbOpen(){return new Promise((res,rej)=>{const r=indexedDB.open('LagerverwaltungLovrencicV21',1);r.onupgradeneeded=()=>r.result.createObjectStore('data');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function ig(k){const d=await idbOpen();return new Promise((res,rej)=>{const r=d.transaction('data').objectStore('data').get(k);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function ip(k,v){const d=await idbOpen();return new Promise((res,rej)=>{const r=d.transaction('data','readwrite').objectStore('data').put(v,k);r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})}
async function idel(k){const d=await idbOpen();return new Promise((res,rej)=>{const r=d.transaction('data','readwrite').objectStore('data').delete(k);r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})}
function rows(sql,p=[]){const s=db.prepare(sql);s.bind(p);const a=[];while(s.step())a.push(s.getAsObject());s.free();return a}
function scalar(sql,p=[]){const x=rows(sql,p);return x.length?Object.values(x[0])[0]:0}
function run(sql,p=[]){db.run(sql,p)}
function today(){return new Date().toISOString().slice(0,10)}
function stamp(){return new Date().toISOString()}
function setting(k,d=''){const r=rows('SELECT setting_value FROM app_settings WHERE setting_key=?',[k]);return r.length?r[0].setting_value:d}
function setSetting(k,v){run('INSERT OR REPLACE INTO app_settings(setting_key,setting_value) VALUES(?,?)',[k,String(v)])}
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(16)}
function validPw(p){return !!p&&setting('admin_password_hash','')===hash(p)}
function adminAuthorized(d,opt){
 try{
  const h=opt?.headers;
  const unlocked=h&&((typeof h.get==='function'&&h.get('X-LV-Admin-Unlocked')==='1')||h['X-LV-Admin-Unlocked']==='1');
  return unlocked||validPw(d?.password)||validPw(d?.admin_password);
 }catch{return validPw(d?.password)||validPw(d?.admin_password)}
}
function normalizeQuantityForUnit(value,unit){
 const n=Number(value||0);
 return ['Stk.','Satz','Rolle','Packung','Karton'].includes(String(unit||''))?Math.round(n):n;
}
function stockExpr(){return "a.initial_stock+COALESCE(SUM(CASE WHEN m.movement_type='IN' THEN m.quantity WHEN m.movement_type='OUT' THEN -m.quantity ELSE 0 END),0)"}
function audit(user,action,entity,id='',details=''){run('INSERT INTO audit_log(event_time,user_name,action,entity,entity_id,details) VALUES(?,?,?,?,?,?)',[stamp().replace('T',' ').slice(0,19),user||'Techniker',action,entity,String(id||''),details||''])}

function randomId(){
 if(globalThis.crypto?.randomUUID)return crypto.randomUUID();
 return 'id-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
}
function syncValue(key,def=''){
 try{
  const r=rows('SELECT value FROM sync_state WHERE key=?',[key])[0];
  return r?String(r.value):def;
 }catch{return def}
}
function setSyncValue(key,value){
 run('INSERT INTO sync_state(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[key,String(value)]);
}
function ensureSyncState(){
 if(!syncValue('database_id'))setSyncValue('database_id',randomId());
 if(!syncValue('revision'))setSyncValue('revision','0');
 if(!syncValue('revision_id'))setSyncValue('revision_id',randomId());
 if(!syncValue('changed_at'))setSyncValue('changed_at',String(Date.now()));
}
function currentDbState(){
 ensureSyncState();
 return {
  database_id:syncValue('database_id'),
  revision:Number(syncValue('revision','0')),
  revision_id:syncValue('revision_id'),
  parent_revision_id:syncValue('parent_revision_id',''),
  changed_at:Number(syncValue('changed_at','0')),
  articles:Number(scalar('SELECT COUNT(*) FROM articles')||0),
  movements:tableExists('movements')?Number(scalar('SELECT COUNT(*) FROM movements')||0):0
 };
}
function bumpRevision(){
 ensureSyncState();
 const oldId=syncValue('revision_id');
 setSyncValue('parent_revision_id',oldId);
 setSyncValue('revision',String(Number(syncValue('revision','0'))+1));
 setSyncValue('revision_id',randomId());
 setSyncValue('changed_at',String(Date.now()));
}
function stateFromDatabase(test){
 const get=(key,def='')=>{
  try{
   const stmt=test.prepare('SELECT value FROM sync_state WHERE key=?');
   stmt.bind([key]);
   const value=stmt.step()?String(stmt.getAsObject().value):def;
   stmt.free();
   return value;
  }catch{return def}
 };
 const count=table=>{
  try{
   const r=test.exec(`SELECT COUNT(*) AS c FROM ${table}`);
   return Number(r[0]?.values?.[0]?.[0]||0);
  }catch{return 0}
 };
 return {
  database_id:get('database_id','legacy'),
  revision:Number(get('revision','0')),
  revision_id:get('revision_id','legacy-'+count('articles')+'-'+count('movements')),
  parent_revision_id:get('parent_revision_id',''),
  changed_at:Number(get('changed_at','0')),
  articles:count('articles'),
  movements:count('movements')
 };
}
async function persist(dirty=true){
 if(dirty)bumpRevision();
 await ip(DBKEY,db.export().buffer);
 const m=await ig(METAKEY)||{};
 if(dirty){
  m.dirty=true;
  m.localModified=currentDbState().changed_at;
 }
 await ip(METAKEY,m);
 await syncStatus();
 if(dirty){
  scheduleAutoSync();
  scheduleAutomaticBackup();
 }
 if(window.refreshDatabaseStatus)window.refreshDatabaseStatus();
}
function scheduleAutoSync(){
 clearTimeout(autoTimer);
 autoTimer=setTimeout(async()=>{
  if(!handle||isSyncing)return;
  const mode=setting('storage_mode','browser_local');
  if(mode==='cloud')LVSync.sync(true);
  else if(mode==='local_folder'){
   try{isSyncing=true;await saveToFolder(false,true)}
   catch(e){console.warn('Lokaler Ordner konnte nicht aktualisiert werden:',e)}
   finally{isSyncing=false}
  }
 },1200)
}
function initSchema(){
db.run(`PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS app_settings(setting_key TEXT PRIMARY KEY,setting_value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sync_state(key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS articles(id INTEGER PRIMARY KEY AUTOINCREMENT,article_no TEXT NOT NULL UNIQUE,description TEXT NOT NULL,target_stock REAL NOT NULL DEFAULT 0,minimum_stock REAL NOT NULL DEFAULT 0,initial_stock REAL NOT NULL DEFAULT 0,unit TEXT NOT NULL DEFAULT 'Stk.',location TEXT NOT NULL DEFAULT '',machine TEXT NOT NULL DEFAULT '',active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,manufacturer TEXT NOT NULL DEFAULT '',supplier TEXT NOT NULL DEFAULT '',supplier_article_no TEXT NOT NULL DEFAULT '',barcode TEXT NOT NULL DEFAULT '',purchase_price REAL NOT NULL DEFAULT 0,notes TEXT NOT NULL DEFAULT '',image_url TEXT NOT NULL DEFAULT '',datasheet_url TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS movements(id INTEGER PRIMARY KEY AUTOINCREMENT,movement_date TEXT NOT NULL,movement_type TEXT NOT NULL,article_id INTEGER NOT NULL,quantity REAL NOT NULL,customer TEXT NOT NULL DEFAULT '',technician TEXT NOT NULL DEFAULT '',note TEXT NOT NULL DEFAULT '',source TEXT NOT NULL DEFAULT 'App',created_at TEXT NOT NULL,vehicle TEXT NOT NULL DEFAULT '',machine TEXT NOT NULL DEFAULT '',delivery_note TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS locations(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT UNIQUE NOT NULL,description TEXT NOT NULL DEFAULT '',active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS machines(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT UNIQUE NOT NULL,description TEXT NOT NULL DEFAULT '',active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS technicians(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT UNIQUE NOT NULL,email TEXT NOT NULL DEFAULT '',default_vehicle TEXT NOT NULL DEFAULT '',active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS vehicles(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT UNIQUE NOT NULL,description TEXT NOT NULL DEFAULT '',active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS audit_log(id INTEGER PRIMARY KEY AUTOINCREMENT,event_time TEXT NOT NULL,user_name TEXT NOT NULL,action TEXT NOT NULL,entity TEXT NOT NULL,entity_id TEXT NOT NULL DEFAULT '',details TEXT NOT NULL DEFAULT '');`);
ensureSyncState();
if(!setting('date_format'))setSetting('date_format','DD.MM.YYYY');
if(!setting('storage_mode'))setSetting('storage_mode','browser_local');
}

function tableExists(name){
 try{return Number(scalar("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?",[name]))>0}catch{return false}
}
function existingDatabaseHasContent(){
 try{
  if(!tableExists('articles'))return false;
  const articleCount=Number(scalar('SELECT COUNT(*) FROM articles')||0);
  const movementCount=tableExists('movements')?Number(scalar('SELECT COUNT(*) FROM movements')||0):0;
  const technicianCount=tableExists('technicians')?Number(scalar('SELECT COUNT(*) FROM technicians')||0):0;
  const locationCount=tableExists('locations')?Number(scalar('SELECT COUNT(*) FROM locations')||0):0;
  const machineCount=tableExists('machines')?Number(scalar('SELECT COUNT(*) FROM machines')||0):0;
  return articleCount>0||movementCount>0||technicianCount>0||locationCount>0||machineCount>0;
 }catch{return false}
}
function adoptExistingDatabase(){
 if(existingDatabaseHasContent()&&setting('setup_complete','0')!=='1'){
  setSetting('setup_complete','1');
  setSetting('database_adopted','1');
  setSetting('database_version','41');
  if(!setting('date_format'))setSetting('date_format','DD.MM.YYYY');
 }
}
function setupIsRequired(){
 return setting('setup_complete','0')!=='1'&&!existingDatabaseHasContent();
}

async function initialize(){
 SQL=await initSqlJs({locateFile:f=>`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${f}`});
 const b=await ig(DBKEY);db=b?new SQL.Database(new Uint8Array(b)):new SQL.Database();
 initSchema();adoptExistingDatabase();handle=await ig(HANDLEKEY)||null;if(!setting('storage_mode'))setSetting('storage_mode',handle?'local_folder':'browser_local');
 const m=await ig(METAKEY)||{};
 if(!m.localModified)m.localModified=currentDbState().changed_at;
 await ip(METAKEY,m);
 await persist(false);
}
function response(data,status=200,headers={}){return new Response(typeof data==='string'||data instanceof Blob||data instanceof ArrayBuffer?data:JSON.stringify(data),{status,headers:{...(typeof data==='object'&&!(data instanceof Blob)&&!(data instanceof ArrayBuffer)?{'Content-Type':'application/json'}:{}),...headers}})}
function body(opt){try{return JSON.parse(opt?.body||'{}')}catch{return {}}}
function query(url){const u=new URL(url,location.href);return Object.fromEntries(u.searchParams.entries())}
function fmtDate(d){const f=setting('date_format','DD.MM.YYYY');if(!d)return '';const x=String(d).slice(0,10).split('-');return f==='YYYY-MM-DD'?x.join('-'):f==='MM/DD/YYYY'?`${x[1]}/${x[2]}/${x[0]}`:`${x[2]}.${x[1]}.${x[0]}`}
function articles(q=''){let sql=`SELECT a.*,${stockExpr()} stock FROM articles a LEFT JOIN movements m ON m.article_id=a.id WHERE 1=1`,p=[];if(q){sql+=' AND (a.article_no LIKE ? OR a.description LIKE ? OR a.location LIKE ? OR a.machine LIKE ?)';p=Array(4).fill('%'+q+'%')}sql+=' GROUP BY a.id ORDER BY a.article_no';return rows(sql,p)}
function parseLines(text){
 const out=[];for(const raw of String(text||'').split(/\r?\n/)){const line=raw.trim();if(!line)continue;const p=line.split(/[;\t|]+/).map(x=>x.trim());if(p.length<2)continue;
 let no=p[0],qty=Number(String(p[1]).replace(',','.')),desc=p[2]||'';if(!Number.isFinite(qty)){qty=Number(String(p[p.length-1]).replace(',','.'));desc=p.slice(1,-1).join(' ')}
 if(no&&Number.isFinite(qty)&&qty>0)out.push({article_no:no,quantity:qty,description:desc})}return out
}
function matchItems(items){return items.map(x=>{const a=rows('SELECT id,article_no,description FROM articles WHERE article_no=?',[x.article_no])[0];return {...x,article_id:a?.id||0,description:a?.description||x.description||'',found:!!a}})}
function bookItems(items,type,d){
 for(const x of items){const aid=Number(x.article_id)||rows('SELECT id FROM articles WHERE article_no=?',[x.article_no])[0]?.id;if(!aid)throw Error('Unbekannter Artikel: '+(x.article_no||''));const qty=Number(x.quantity);if(!(qty>0))continue;
 if(type==='OUT'){const a=articles().find(z=>z.id===aid);if(a&&qty>a.stock)throw Error(`Nicht genügend Bestand für ${a.article_no}. Verfügbar: ${a.stock}`)}
 run(`INSERT INTO movements(movement_date,movement_type,article_id,quantity,customer,technician,note,source,created_at,vehicle,machine,delivery_note) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
 [d.movement_date||today(),type,aid,qty,d.customer||'',d.technician||setting('primary_technician','Techniker'),d.note||'',d.source||'App',stamp(),d.vehicle||'',d.machine||'',d.delivery_note||'']);
 }}
function csv(headers,data){const q=v=>`"${String(v??'').replaceAll('"','""')}"`;return '\ufeff'+[headers,...data].map(r=>r.map(q).join(';')).join('\r\n')}
function csvResp(name,headers,data){return response(new Blob([csv(headers,data)],{type:'text/csv;charset=utf-8'}),200,{'Content-Type':'text/csv;charset=utf-8','Content-Disposition':`attachment; filename="${name}"`})}
async function xlsxRows(filename,b64){
 const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));const wb=XLSX.read(bin,{type:'array'});const ws=wb.Sheets[wb.SheetNames[0]];return XLSX.utils.sheet_to_json(ws,{header:1,defval:''})
}
function rowsToItems(data){
 const out=[];for(const r of data){const vals=r.map(x=>String(x??'').trim());if(!vals.some(Boolean))continue;let no=vals[0],qty=Number(vals[1].replace(',','.')),desc=vals[2]||'';if(!Number.isFinite(qty)){const ix=vals.findIndex((v,i)=>i>0&&Number.isFinite(Number(v.replace(',','.'))));if(ix>0){qty=Number(vals[ix].replace(',','.'));desc=vals.slice(1,ix).join(' ')}}if(no&&qty>0)out.push({article_no:no,quantity:qty,description:desc})}return out
}
async function materialXlsx(d){
 const source=Array.isArray(d.items)?d.items:[];
 const grouped=new Map();
 const errors=[];

 // 1. Every row is resolved by its stable article ID.
 for(let i=0;i<source.length;i++){
  const x=source[i]||{};
  if(x.selected===false)continue;

  const articleId=Number(x.article_id);
  const qty=Number(x.quantity);

  if(!Number.isInteger(articleId)||articleId<=0){
   errors.push(`Position ${i+1}: Artikel konnte nicht eindeutig zugeordnet werden.`);
   continue;
  }
  if(!Number.isFinite(qty)||qty<=0){
   errors.push(`Position ${i+1}: Menge muss größer als 0 sein.`);
   continue;
  }

  const article=rows(
   'SELECT id,article_no,description,unit,active FROM articles WHERE id=?',
   [articleId]
  )[0];

  if(!article){
   errors.push(`Position ${i+1}: Artikel-ID ${articleId} ist nicht mehr vorhanden.`);
   continue;
  }

  const articleNo=String(article.article_no||'').trim();
  const description=String(article.description||'').trim();

  if(!articleNo){
   errors.push(`Position ${i+1}: Für „${description||'unbekannter Artikel'}“ fehlt die Artikelnummer.`);
   continue;
  }
  if(!description){
   errors.push(`Position ${i+1}: Für Artikel ${articleNo} fehlt die Bezeichnung.`);
   continue;
  }

  // Detect stale or shifted rows before anything is written.
  if(x.article_no!==undefined&&String(x.article_no||'').trim()&&String(x.article_no).trim()!==articleNo){
   errors.push(`Position ${i+1}: Artikelnummer stimmt nicht mehr mit den Stammdaten überein (${x.article_no} ≠ ${articleNo}). Bitte Unterbestand neu laden.`);
   continue;
  }
  if(x.description!==undefined&&String(x.description||'').trim()&&String(x.description).trim()!==description){
   errors.push(`Position ${i+1}: Bezeichnung für Artikel ${articleNo} stimmt nicht mehr mit den Stammdaten überein. Bitte Unterbestand neu laden.`);
   continue;
  }

  const key=String(article.id);
  if(!grouped.has(key)){
   grouped.set(key,{
    article_id:article.id,
    article_no:articleNo,
    description,
    unit:String(article.unit||'Stk'),
    quantity:0,
    first_position:i+1
   });
  }
  grouped.get(key).quantity+=qty;
 }

 if(errors.length){
  throw Error('Materialanforderung nicht exportiert:\n• '+errors.join('\n• '));
 }

 const items=[...grouped.values()];
 if(!items.length)throw Error('Keine gültige Position für den Export ausgewählt.');
 if(items.length>25)throw Error('Maximal 25 Positionen möglich.');

 // Preserve the visible order from the material-request screen.
 items.sort((a,b)=>a.first_position-b.first_position);

 if(typeof ExcelJS==='undefined'){
  throw Error('Excel-Exportbibliothek konnte nicht geladen werden. Bitte Internetverbindung prüfen und die Seite neu laden.');
 }

 // 2. Load the original template as a normal workbook.
 const templateResponse=await nativeFetch('materialanforderung_vorlage.xlsx');
 if(!templateResponse.ok){
  throw Error('Excel-Vorlage materialanforderung_vorlage.xlsx konnte nicht geladen werden.');
 }
 const templateBuffer=await templateResponse.arrayBuffer();

 const workbook=new ExcelJS.Workbook();
 await workbook.xlsx.load(templateBuffer);

 // The original export sheet is Tabelle1 (second worksheet in the template).
 const worksheet=workbook.getWorksheet('Tabelle1')||workbook.worksheets[1];
 if(!worksheet){
  throw Error('Exportblatt Tabelle1 wurde in der Excel-Vorlage nicht gefunden.');
 }

 // 3. Change values only. Existing formatting, borders, widths, row heights,
 // print settings, page layout and merged cells remain attached to the cells.
 worksheet.getCell('F1').value=String(
  d.technician||setting('primary_technician','Techniker')
 ).trim();

 const exportDate=new Date();
 exportDate.setHours(0,0,0,0);
 worksheet.getCell('H1').value=exportDate;
 // Keep the original cell style but enforce the requested visible date.
 worksheet.getCell('H1').numFmt='dd.mm.yyyy';

 // Clear only the cell values in the 25 prepared template rows.
 for(let row=4;row<=28;row++){
  worksheet.getCell(`B${row}`).value=null;
  worksheet.getCell(`C${row}`).value=null;
  worksheet.getCell(`F${row}`).value=null;
  worksheet.getCell(`H${row}`).value=null;
 }

 items.forEach((x,index)=>{
  const row=4+index;
  // Quantity is numeric only; no unit is appended.
  worksheet.getCell(`B${row}`).value=x.quantity;
  // Article numbers are always text so leading zeroes cannot be lost.
  worksheet.getCell(`C${row}`).value=String(x.article_no);
  worksheet.getCell(`C${row}`).numFmt='@';
  worksheet.getCell(`F${row}`).value=String(x.description);
 });

 // Avoid recalculation warnings; there are no formulas in the written area.
 workbook.calcProperties.fullCalcOnLoad=false;
 workbook.calcProperties.forceFullCalc=false;
 workbook.calcProperties.calcMode='auto';

 // 4. Generate a structurally valid XLSX through ExcelJS.
 const generated=await workbook.xlsx.writeBuffer();

 // 5. Self-test: open the generated workbook again and verify every value.
 const verificationWorkbook=new ExcelJS.Workbook();
 await verificationWorkbook.xlsx.load(generated);
 const verificationSheet=
  verificationWorkbook.getWorksheet('Tabelle1')||
  verificationWorkbook.worksheets[1];

 if(!verificationSheet){
  throw Error('Interne Exportprüfung fehlgeschlagen: Exportblatt fehlt.');
 }

 const verifyErrors=[];
 const exportedTechnician=String(verificationSheet.getCell('F1').value??'').trim();
 const requestedTechnician=String(
  d.technician||setting('primary_technician','Techniker')
 ).trim();

 if(exportedTechnician!==requestedTechnician){
  verifyErrors.push('Technikername wurde nicht korrekt übernommen.');
 }

 items.forEach((x,index)=>{
  const row=4+index;
  const exportedQty=Number(verificationSheet.getCell(`B${row}`).value);
  const exportedNo=String(verificationSheet.getCell(`C${row}`).value??'').trim();
  const exportedDescription=String(
   verificationSheet.getCell(`F${row}`).value??''
  ).trim();

  if(exportedQty!==Number(x.quantity)){
   verifyErrors.push(`Position ${index+1}: Menge ${exportedQty} statt ${x.quantity}.`);
  }
  if(exportedNo!==String(x.article_no)){
   verifyErrors.push(`Position ${index+1}: Artikelnummer ${exportedNo} statt ${x.article_no}.`);
  }
  if(exportedDescription!==String(x.description)){
   verifyErrors.push(`Position ${index+1}: Bezeichnung stimmt nicht überein.`);
  }
 });

 // Ensure no unintended data remains below the exported rows.
 for(let index=items.length;index<25;index++){
  const row=4+index;
  const values=[
   verificationSheet.getCell(`B${row}`).value,
   verificationSheet.getCell(`C${row}`).value,
   verificationSheet.getCell(`F${row}`).value
  ];
  if(values.some(v=>v!==null&&v!==undefined&&String(v)!=='')){
   verifyErrors.push(`Position ${index+1}: Alte Zellinhalte wurden nicht vollständig entfernt.`);
   break;
  }
 }

 if(verifyErrors.length){
  throw Error('Interne Prüfung der Excel-Datei fehlgeschlagen:\n• '+verifyErrors.join('\n• '));
 }

 return {
  blob:new Blob(
   [generated],
   {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
  ),
  count:items.length,
  items:items.map(({first_position,...x})=>x)
 };
}
async function route(url,opt={}){
 await ready;const u=new URL(url,location.href);if(!u.pathname.startsWith('/api/'))return nativeFetch(url,opt);const p=u.pathname,q=Object.fromEntries(u.searchParams),d=body(opt);
 try{
 if(opt.method!=='POST'){
  if(p==='/api/info')return response({version:'41.0',articles:scalar('SELECT COUNT(*) FROM articles WHERE active=1'),movements:scalar('SELECT COUNT(*) FROM movements'),setup_required:setupIsRequired(),date_format:setting('date_format','DD.MM.YYYY')});
  if(p==='/api/setup/status')return response({setup_required:setupIsRequired(),date_format:setting('date_format','DD.MM.YYYY'),technician:setting('primary_technician','')});
  if(p==='/api/admin/password-status'){const has=!!setting('admin_password_hash');return response({setup_required:!has,password_setup_required:!has,has_password:has,can_unlock:has,database_setup_required:setupIsRequired()})};
  if(p==='/api/settings')return response({date_format:setting('date_format','DD.MM.YYYY'),date_formats:['DD.MM.YYYY','YYYY-MM-DD','MM/DD/YYYY']});
  if(p==='/api/masterdata')return response({locations:rows('SELECT * FROM locations WHERE active=1 ORDER BY name'),machines:rows('SELECT * FROM machines WHERE active=1 ORDER BY name'),technicians:rows('SELECT * FROM technicians WHERE active=1 ORDER BY name'),vehicles:rows('SELECT * FROM vehicles WHERE active=1 ORDER BY name')});
  if(p==='/api/articles')return response(articles(q.q||''));
  if(p==='/api/dashboard'){const a=articles().filter(x=>x.active);const low=a.filter(x=>x.stock<x.minimum_stock).sort((x,y)=>(y.minimum_stock-y.stock)-(x.minimum_stock-x.stock)).slice(0,8);const recent=rows('SELECT m.movement_date,m.movement_type,a.article_no,a.description,m.quantity,m.technician FROM movements m JOIN articles a ON a.id=m.article_id ORDER BY m.id DESC LIMIT 8');const top=rows("SELECT a.article_no,a.description,SUM(m.quantity) quantity FROM movements m JOIN articles a ON a.id=m.article_id WHERE m.movement_type='OUT' GROUP BY a.id ORDER BY quantity DESC LIMIT 8");return response({articles:a.length,low_stock:low.length,today:scalar('SELECT COUNT(*) FROM movements WHERE movement_date=?',[today()]),movements:scalar('SELECT COUNT(*) FROM movements'),stock_value:a.reduce((s,x)=>s+x.stock*x.purchase_price,0),low_stock_items:low,recent,top_out:top})}
  if(p==='/api/material-request')return response(articles().filter(x=>x.active&&x.stock<x.target_stock).map(x=>({...x,suggested_quantity:Math.max(0,x.target_stock-x.stock)})));
  if(p==='/api/history'){let list=rows('SELECT m.*,a.article_no,a.description FROM movements m JOIN articles a ON a.id=m.article_id ORDER BY m.movement_date DESC,m.id DESC');if(q.type&&q.type!=='ALL')list=list.filter(x=>x.movement_type===q.type);if(q.date_from)list=list.filter(x=>x.movement_date>=q.date_from);if(q.date_to)list=list.filter(x=>x.movement_date<=q.date_to);if(q.technician)list=list.filter(x=>x.technician.toLowerCase().includes(q.technician.toLowerCase()));if(q.article)list=list.filter(x=>(x.article_no+' '+x.description).toLowerCase().includes(q.article.toLowerCase()));return response(list)}
  if(p==='/api/audit')return response(rows('SELECT * FROM audit_log ORDER BY id DESC LIMIT 500'));
  if(p==='/api/help/list')return response(Object.keys(helpData).sort().map(file=>({file,title:file.slice(0,-3).replace(/[-_]/g,' ')})));
  if(p==='/api/help/content')return response({file:q.file,content:helpData[q.file]||'# Nicht gefunden'});
  const exType=p==='/api/export/inbookings.csv'?'IN':p==='/api/export/outbookings.csv'?'OUT':null;
  if(exType){const list=rows('SELECT m.*,a.article_no,a.description FROM movements m JOIN articles a ON a.id=m.article_id WHERE m.movement_type=? ORDER BY m.id DESC',[exType]);return csvResp(`${exType==='IN'?'Einbuchungen':'Entnahmen'}_${fmtDate(today())}.csv`,['Datum','Art','Artikel','Bezeichnung','Menge','Kunde','Techniker','Fahrzeug','Maschine','Lieferschein','Quelle'],list.map(x=>[fmtDate(x.movement_date),exType==='IN'?'Einbuchung':'Entnahme',x.article_no,x.description,x.quantity,x.customer,x.technician,x.vehicle,x.machine,x.delivery_note,x.source]))}
  if(p==='/api/export/history.csv'){const list=(await (await route('/api/history?'+u.searchParams.toString())).json());return csvResp(`Historie_${fmtDate(today())}.csv`,['Datum','Art','Artikelnummer','Bezeichnung','Menge','Kunde','Techniker','Fahrzeug','Maschine','Lieferschein','Quelle','Bemerkung'],list.map(x=>[fmtDate(x.movement_date),x.movement_type==='IN'?'Einbuchung':'Entnahme',x.article_no,x.description,x.quantity,x.customer,x.technician,x.vehicle,x.machine,x.delivery_note,x.source,x.note]))}
  if(p==='/api/export/stock.csv'){const a=articles();return csvResp(`Lagerbestand_${fmtDate(today())}.csv`,['Artikelnummer','Bezeichnung','Sollbestand','Mindestbestand','Istbestand','Einheit','Lagerort','Maschine','Hersteller','Lieferant','Einkaufspreis'],a.map(x=>[x.article_no,x.description,x.target_stock,x.minimum_stock,x.stock,x.unit,x.location,x.machine,x.manufacturer,x.supplier,x.purchase_price]))}
  if(p==='/api/export/inventory.csv'){const a=articles();return csvResp(`Inventur_${fmtDate(today())}.csv`,['Artikelnummer','Bezeichnung','Systembestand','Gezählter Bestand','Lagerort','Maschine'],a.map(x=>[x.article_no,x.description,x.stock,'',x.location,x.machine]))}
 }
 if(p==='/api/setup/complete'){if(!d.password||d.password.length<6)throw Error('Passwort muss mindestens 6 Zeichen haben.');setSetting('admin_password_hash',hash(d.password));setSetting('primary_technician',d.technician||'Techniker');setSetting('date_format',d.date_format||'DD.MM.YYYY');setSetting('storage_mode',handle&&['cloud','local_folder'].includes(d.storage_mode)?d.storage_mode:'browser_local');setSetting('setup_complete','1');run('INSERT OR IGNORE INTO technicians(name) VALUES(?)',[d.technician||'Techniker']);audit(d.technician,'EINRICHTUNG','System','','Ersteinrichtung');await persist();return response({ok:true,date_format:setting('date_format','DD.MM.YYYY'),storage_mode:setting('storage_mode','browser_local')})}
 if(p==='/api/settings/date-format'){setSetting('date_format',d.date_format);await persist();return response({ok:true,date_format:setting('date_format','DD.MM.YYYY')})}
 if(p==='/api/admin/unlock')return response({ok:validPw(d.password),has_password:!!setting('admin_password_hash')});
 if(p==='/api/admin/lock')return response({ok:true});
 if(p==='/api/admin/setup-password'){const np=d.password||d.new_password||d.newPassword||'';const rp=d.repeat_password||d.repeatPassword||np;if(!np||np.length<6)throw Error('Passwort muss mindestens 6 Zeichen haben.');if(np!==rp)throw Error('Die Passwörter stimmen nicht überein.');setSetting('admin_password_hash',hash(np));setSetting('setup_complete','1');setSetting('database_adopted','1');audit('Administrator','PASSWORT','System','','Administratorpasswort erstmalig eingerichtet');await persist();return response({ok:true,has_password:true})}
 if(p==='/api/admin/change-password'){const oldpw=d.old_password||d.current_password||'';const newpw=d.new_password||'';const repeat=d.repeat_password??newpw;if(!validPw(oldpw))throw Error('Bisheriges Passwort ist falsch.');if(!newpw||newpw.length<6)throw Error('Neues Passwort muss mindestens 6 Zeichen haben.');if(newpw!==repeat)throw Error('Die neuen Passwörter stimmen nicht überein.');setSetting('admin_password_hash',hash(newpw));audit('Administrator','PASSWORT','System','','Administratorpasswort geändert');await persist();return response({ok:true})}
 if(p==='/api/admin/reset'){if(!adminAuthorized(d,opt))throw Error('Passwort ist falsch oder die Stammdaten sind nicht freigeschaltet.');db.close();db=new SQL.Database();initSchema();await persist();return response({ok:true})}
 if(p==='/api/movements'){bookItems(d.items||[d],d.movement_type||'IN',d);audit(d.technician,'BUCHUNG',d.movement_type||'IN','',`${(d.items||[d]).length} Position(en)`);await persist();return response({ok:true,count:(d.items||[d]).length},201)}
 if(p==='/api/delivery-note/preview'||p==='/api/import/preview'||p==='/api/service-report/preview'){return response(matchItems(parseLines(d.text)))}
 if(p==='/api/delivery-note/commit'){await createBackup('Sicherheitsbackup','Vor Lieferschein-Einbuchung');bookItems(d.items,'IN',{...d,source:'Lieferschein'});audit(d.technician,'BUCHUNG','Lieferschein','',`${d.items.length} Positionen`);await persist();return response({ok:true,count:d.items.length})}
 if(p==='/api/service-report/commit'){bookItems(d.items,'OUT',{...d,source:'Servicebericht'});audit(d.technician,'BUCHUNG','Servicebericht','',`${d.items.length} Positionen`);await persist();return response({ok:true,count:d.items.length})}
 if(p==='/api/import/commit'){await createBackup('Sicherheitsbackup','Vor Import');bookItems(d.items,'IN',{...d,source:'SAP-CSV-Import'});audit(d.technician,'BUCHUNG','CSV-Import','',`${d.items.length} Positionen`);await persist();return response({ok:true,count:d.items.length})}
 if(p==='/api/import/file-preview'){const rr=await xlsxRows(d.filename,d.content_base64);return response(matchItems(rowsToItems(rr)))}
 if(p==='/api/inventory/file-preview'){const rr=await xlsxRows(d.filename,d.content_base64);const parsed=rowsToItems(rr).map(x=>({article_no:x.article_no,counted_stock:x.quantity}));return response(parsed.map(x=>{const a=articles().find(z=>z.article_no===x.article_no);return a?{article_id:a.id,article_no:a.article_no,description:a.description,system_stock:a.stock,counted_stock:x.counted_stock,difference:x.counted_stock-a.stock}:null}).filter(Boolean))}
 if(p==='/api/inventory/preview'){const parsed=parseLines(d.text).map(x=>({article_no:x.article_no,counted_stock:x.quantity}));return response(parsed.map(x=>{const a=articles().find(z=>z.article_no===x.article_no);return a?{article_id:a.id,article_no:a.article_no,description:a.description,system_stock:a.stock,counted_stock:x.counted_stock,difference:x.counted_stock-a.stock}:null}).filter(Boolean))}
 if(p==='/api/inventory/commit'){await createBackup('Sicherheitsbackup','Vor Inventur');if(!adminAuthorized(d,opt))throw Error('Passwort ist falsch oder die Stammdaten sind nicht freigeschaltet.');let changed=0,unchanged=0;for(const x of d.items){const a=articles().find(z=>z.id===Number(x.article_id));const diff=Number(x.counted_stock)-a.stock;if(Math.abs(diff)<1e-8){unchanged++;continue}bookItems([{article_id:a.id,quantity:Math.abs(diff)}],diff>0?'IN':'OUT',{...d,source:'Inventur',note:'Inventurkorrektur'});changed++}audit(d.technician,'INVENTUR','Bestand','',`${changed} Korrekturen`);await persist();return response({ok:true,changed,unchanged})}
 if(p==='/api/material-request/preview'){const x=await materialXlsx(d);return response({count:x.count,items:x.items})}
 if(p==='/api/export/material-request'){const x=await materialXlsx(d);const tech=(d.technician||'Techniker').replace(/[^\wÄÖÜäöüß-]+/g,'_');return response(x.blob,200,{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':`attachment; filename="Bestellung_${fmtDate(today())}_${tech}.xlsx"`})}
 if(p==='/api/masterdata'){
  const type=String(d.type||'');
  if(type!=='technician'&&!adminAuthorized(d,opt))throw Error('Stammdaten sind nicht freigeschaltet. Bitte das Passwort erneut eingeben.');
  const name=String(d.name||'').trim();
  if(!name)throw Error('Bitte einen Namen eingeben.');
  if(type==='technician'){
    run('INSERT OR IGNORE INTO technicians(name,email,default_vehicle,active) VALUES(?,?,?,1)',[name,d.email||'',d.default_vehicle||'']);
  }else if(type==='location'){
    run('INSERT OR IGNORE INTO locations(name,description,active) VALUES(?,?,1)',[name,d.description||'']);
  }else if(type==='machine'){
    run('INSERT OR IGNORE INTO machines(name,description,active) VALUES(?,?,1)',[name,d.description||'']);
  }else if(type==='vehicle'){
    run('INSERT OR IGNORE INTO vehicles(name,description,active) VALUES(?,?,1)',[name,d.description||'']);
  }else throw Error('Ungültiger Stammdatentyp.');
  const created=Number(db.getRowsModified())>0;
  if(!created)throw Error('Dieser Eintrag ist bereits vorhanden.');
  audit('Techniker','ANLAGE',type,'',name);
  await persist();
  return response({ok:true,name},201)
 }
 if(p==='/api/article/create'){if(!adminAuthorized(d,opt))throw Error('Stammdaten sind nicht freigeschaltet.');run(`INSERT INTO articles(article_no,description,target_stock,minimum_stock,initial_stock,unit,location,machine,active,created_at,manufacturer,supplier,supplier_article_no,barcode,purchase_price,notes,image_url,datasheet_url) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[d.article_no,d.description,Number(d.target_stock||0),Number(d.minimum_stock||0),Number(d.initial_stock||0),d.unit||'Stk.',d.location||'',d.machine||'',d.active===false?0:1,stamp(),d.manufacturer||'',d.supplier||'',d.supplier_article_no||'',d.barcode||'',Number(d.purchase_price||0),d.notes||'',d.image_url||'',d.datasheet_url||'']);audit('Techniker','ANLAGE','Artikel','',d.article_no);await persist();return response({ok:true},201)}
 if(p==='/api/articles/batch-update'){
  if(!adminAuthorized(d,opt))throw Error('Stammdaten sind nicht freigeschaltet.');
  const items=Array.isArray(d.items)?d.items:[];
  if(!items.length)throw Error('Keine Änderungen zum Speichern vorhanden.');
  let updated=0, corrected=0;
  run('BEGIN TRANSACTION');
  try{
   for(const x of items){
    const a=articles().find(z=>z.id===Number(x.id));
    if(!a)continue;
    run('UPDATE articles SET article_no=?,description=?,target_stock=?,minimum_stock=?,unit=?,location=?,machine=?,active=? WHERE id=?',[
      String(x.article_no||'').trim(),String(x.description||'').trim(),normalizeQuantityForUnit(x.target_stock,x.unit),normalizeQuantityForUnit(x.minimum_stock,x.unit),String(x.unit||'Stk.').trim()||'Stk.',String(x.location||''),String(x.machine||''),x.active?1:0,Number(x.id)
    ]);
    const diff=normalizeQuantityForUnit(x.current_stock,x.unit)-Number(a.stock);
    if(Math.abs(diff)>1e-8){bookItems([{article_id:a.id,quantity:Math.abs(diff)}],diff>0?'IN':'OUT',{source:'Bestandskorrektur Stammdaten',note:'Istbestand über Sammelspeicherung geändert'});corrected++}
    updated++;
   }
   run('COMMIT');
  }catch(e){try{run('ROLLBACK')}catch{};throw e}
  audit('Techniker','SAMMELÄNDERUNG','Artikel','',`${updated} Artikel gespeichert, ${corrected} Bestandskorrekturen`);
  await persist();return response({ok:true,updated,corrected})
 }
 if(p==='/api/article/update'){if(!adminAuthorized(d,opt))throw Error('Stammdaten sind nicht freigeschaltet.');const a=articles().find(x=>x.id===Number(d.id));run('UPDATE articles SET article_no=?,description=?,target_stock=?,minimum_stock=?,unit=?,location=?,machine=?,active=?,manufacturer=?,supplier=?,supplier_article_no=?,barcode=?,purchase_price=?,notes=?,image_url=?,datasheet_url=? WHERE id=?',[d.article_no,d.description,Number(d.target_stock||0),Number(d.minimum_stock||0),d.unit||'Stk.',d.location||'',d.machine||'',d.active?1:0,d.manufacturer||a.manufacturer,d.supplier||a.supplier,d.supplier_article_no||a.supplier_article_no,d.barcode||a.barcode,Number(d.purchase_price??a.purchase_price),d.notes||a.notes,d.image_url||a.image_url,d.datasheet_url||a.datasheet_url,Number(d.id)]);const diff=Number(d.current_stock)-a.stock;if(Math.abs(diff)>1e-8)bookItems([{article_id:a.id,quantity:Math.abs(diff)}],diff>0?'IN':'OUT',{source:'Bestandskorrektur Stammdaten',note:'Istbestand geändert'});audit('Techniker','ÄNDERUNG','Artikel',a.id,d.article_no);await persist();return response({ok:true})}
 if(p==='/api/articles/stock-to-levels'){if(!adminAuthorized(d,opt))throw Error('Passwort ist falsch oder die Stammdaten sind nicht freigeschaltet.');for(const a of articles().filter(x=>x.active)){if(d.mode==='target'||d.mode==='both')run('UPDATE articles SET target_stock=? WHERE id=?',[a.stock,a.id]);if(d.mode==='minimum'||d.mode==='both')run('UPDATE articles SET minimum_stock=? WHERE id=?',[a.stock,a.id])}await persist();return response({ok:true,count:articles().length})}
 if(p==='/api/articles/create-import'||p==='/api/import/create-and-book'){if(!adminAuthorized(d,opt))throw Error('Stammdaten sind nicht freigeschaltet.');let created=0,booked=0,skipped=[];for(const x of d.items||[]){let a=rows('SELECT id FROM articles WHERE article_no=?',[x.article_no])[0];if(!a&&x.description){run('INSERT INTO articles(article_no,description,target_stock,minimum_stock,initial_stock,unit,location,machine,active,created_at) VALUES(?,?,?,?,?,?,?,?,1,?)',[x.article_no,x.description,Number(x.target_stock||0),Number(x.minimum_stock||0),0,x.unit||'Stk.',x.location||'',x.machine||'',stamp()]);a={id:scalar('SELECT last_insert_rowid()')};created++}else if(!a){skipped.push({article_no:x.article_no,reason:'Bezeichnung fehlt'});continue}if(p==='/api/import/create-and-book'&&Number(x.quantity)>0){bookItems([{article_id:a.id,quantity:Number(x.quantity)}],'IN',{...d,source:'SAP-XLSX/CSV-Import'});booked++}}await persist();return response({ok:true,created,booked,skipped},201)}
 throw Error('Funktion noch nicht zugeordnet: '+p);
 }catch(e){return response({error:e.message||String(e)},400)}
}

function safeName(s){return String(s||'').replace(/[^a-zA-Z0-9ÄÖÜäöüß_-]+/g,'_').slice(0,45)}
function backupStamp(){const d=new Date(),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`}

async function storedBackupIndex(){return await ig(BACKUPKEY)||[]}
async function setBackupIndex(x){await ip(BACKUPKEY,x)}
async function backupDir(create=true){if(!handle)return null;try{return await handle.getDirectoryHandle('Backup',{create})}catch{return null}}
async function cloudBackupEntries(){
 const result=[];
 const d=await backupDir(false);
 if(!d||!await permission(handle,'read'))return result;
 try{
  for await(const [name,entry] of d.entries()){
   if(entry.kind!=='file'||!name.toLowerCase().endsWith('.db'))continue;
   const f=await entry.getFile();
   result.push({name,created:Number(f.lastModified||0),kind:'Cloud-Backup',comment:'Im Cloud-Ordner gefunden',size:f.size,storage:'folder'});
  }
 }catch(e){console.warn('Cloud-Backups konnten nicht gelesen werden',e)}
 return result;
}
async function getBackupIndex(){
 const local=await storedBackupIndex();
 const cloud=await cloudBackupEntries();
 const map=new Map();
 for(const x of [...local,...cloud]){
  const old=map.get(x.name);
  if(!old||x.storage==='folder')map.set(x.name,x);
 }
 return [...map.values()].sort((a,b)=>Number(b.created)-Number(a.created));
}
async function writeBackupBytes(bytes,kind='Automatisch',comment='',preferCloud=true){
 const created=Date.now();
 const name=`Backup_${backupStamp()}${comment?'_'+safeName(comment):''}.db`;
 let storage='local';
 const bd=preferCloud?await backupDir(true):null;
 if(bd&&await permission(handle,'readwrite')){
  const fh=await bd.getFileHandle(name,{create:true}),w=await fh.createWritable();
  await w.write(bytes);await w.close();storage='folder';
 }else{
  await ip('backup:'+name,bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
 }
 let list=await storedBackupIndex();
 list.unshift({name,created,kind,comment,size:bytes.byteLength,storage});
 while(list.length>30){
  const old=list.pop();
  if(old.storage==='local')await idel('backup:'+old.name);
 }
 await setBackupIndex(list);
 return list[0];
}
async function createBackup(kind='Automatisch',comment=''){
 return await writeBackupBytes(db.export(),kind,comment,true);
}
let automaticBackupTimer=null;
function scheduleAutomaticBackup(){
 clearTimeout(automaticBackupTimer);
 automaticBackupTimer=setTimeout(async()=>{
  try{
   const item=await createBackup('Automatisch','Nach Änderungen');
   const m=await ig(METAKEY)||{};
   m.lastAutomaticBackup=item.created;
   await ip(METAKEY,m);
   if(window.refreshDatabaseStatus)window.refreshDatabaseStatus();
  }catch(e){console.warn('Automatisches Backup fehlgeschlagen:',e)}
 },15000);
}
async function ensureDailyBackup(){
 try{
  const m=await ig(METAKEY)||{};
  if(!m.lastAutomaticBackup||Date.now()-Number(m.lastAutomaticBackup)>86400000){
   const item=await createBackup('Automatisch','Tägliche Sicherung');
   m.lastAutomaticBackup=item.created;
   await ip(METAKEY,m);
  }
 }catch(e){console.warn('Tägliches Backup fehlgeschlagen:',e)}
}
async function readBackup(x){
 if(!x)throw Error('Backup nicht gefunden.');
 if(x.storage==='folder'){
  const d=await backupDir(false);
  if(!d)throw Error('Cloud-Backup-Ordner ist nicht erreichbar.');
  const f=await (await d.getFileHandle(x.name)).getFile();
  return new Uint8Array(await f.arrayBuffer());
 }
 const raw=await ig('backup:'+x.name);
 if(!raw)throw Error('Lokale Backup-Datei wurde nicht gefunden.');
 return new Uint8Array(raw);
}
async function restoreBackup(name){
 const list=await getBackupIndex(),x=list.find(z=>z.name===name);
 if(!x)throw Error('Backup nicht gefunden.');
 await createBackup('Sicherheitsbackup','Vor Wiederherstellung');
 const bytes=await readBackup(x),test=new SQL.Database(bytes);
 if(test.exec('PRAGMA quick_check')[0]?.values[0][0]!=='ok')throw Error('Backup ist beschädigt.');
 const restoredState=stateFromDatabase(test);
 db.close();db=test;initSchema();adoptExistingDatabase();
 await ip(DBKEY,db.export().buffer);
 const m=await ig(METAKEY)||{};
 m.dirty=true;
 m.localModified=restoredState.changed_at||Date.now();
 m.restorePending=true;
 m.writeBlocked=true;
 m.restoreBackupName=name;
 await ip(METAKEY,m);
 return {...x,state:restoredState};
}
async function deleteBackup(name){
 const list=await getBackupIndex(),x=list.find(z=>z.name===name);
 if(!x)return;
 if(x.storage==='folder'){
  try{const d=await backupDir(false);await d.removeEntry(name)}catch{}
 }else await idel('backup:'+name);
 const stored=(await storedBackupIndex()).filter(z=>z.name!==name);
 await setBackupIndex(stored);
}
async function inspectCloudDatabase(){
 if(!handle)return {connected:false};
 if(!await permission(handle,'read'))return {connected:true,accessible:false,error:'Leseberechtigung fehlt.'};
 try{
  const fh=await handle.getFileHandle('lager.db'),f=await fh.getFile();
  const bytes=new Uint8Array(await f.arrayBuffer());
  const test=new SQL.Database(bytes);
  if(test.exec('PRAGMA quick_check')[0]?.values[0][0]!=='ok')throw Error('Cloud-Datenbank ist beschädigt.');
  const state=stateFromDatabase(test);
  test.close();
  return {connected:true,accessible:true,file:'lager.db',modified:f.lastModified,size:f.size,bytes,state};
 }catch(e){
  return {connected:true,accessible:false,file:'lager.db',error:e.message};
 }
}
async function saveToFolder(makeBackup=true,force=false){
 if(!handle)throw Error('Kein Synchronisationsordner verbunden.');
 if(!await permission(handle,'readwrite'))throw Error('Schreibberechtigung fehlt.');
 const m=await ig(METAKEY)||{};
 const local=currentDbState();
 const cloud=await inspectCloudDatabase();

 if(cloud.accessible&&!force){
  if(m.writeBlocked)throw Error('Cloud-Schreiben ist gesperrt, weil der Datenstand nicht eindeutig auf der aktuellen Cloud-Revision basiert.');
  if(!m.expectedCloudRevisionId)
   throw Error('Die erwartete Cloud-Revision ist nicht bekannt. Lade zuerst den Cloud-Stand oder verwende die ausdrückliche Überschreibfunktion.');
  if(cloud.state.revision_id!==m.expectedCloudRevisionId)
   throw Error('Konflikt: Die Cloud-Datenbank wurde auf einem anderen Gerät verändert. Cloud-Stand neu laden.');
 }
 if(cloud.accessible&&force){
  await writeBackupBytes(cloud.bytes,'Sicherheitsbackup','Cloud_vor_ausdrücklichem_Überschreiben',true);
 }
 if(makeBackup)await createBackup('Automatisch','Vor Synchronisierung');

 const fh=await handle.getFileHandle('lager.db',{create:true}),w=await fh.createWritable();
 await w.write(db.export());await w.close();
 const f=await fh.getFile();
 m.dirty=false;
 m.lastSync=Date.now();
 m.fileModified=f.lastModified;
 m.expectedCloudRevisionId=local.revision_id;
 m.expectedCloudDatabaseId=local.database_id;
 m.writeBlocked=false;
 m.restorePending=false;
 await ip(METAKEY,m);
 await syncStatus();
 return {ok:true,state:local};
}
async function loadFromFolder(){
 if(!handle)throw Error('Kein Synchronisationsordner verbunden.');
 const cloud=await inspectCloudDatabase();
 if(!cloud.accessible)throw Error('Cloud-Datenbank konnte nicht gelesen werden: '+(cloud.error||''));
 await createBackup('Sicherheitsbackup','Vor Laden aus Synchronisation');
 const test=new SQL.Database(cloud.bytes);
 db.close();db=test;initSchema();adoptExistingDatabase();
 await ip(DBKEY,db.export().buffer);
 const m=await ig(METAKEY)||{};
 m.dirty=false;
 m.lastSync=Date.now();
 m.fileModified=cloud.modified;
 m.localModified=cloud.state.changed_at||cloud.modified;
 m.expectedCloudRevisionId=cloud.state.revision_id;
 m.expectedCloudDatabaseId=cloud.state.database_id;
 m.writeBlocked=false;
 m.restorePending=false;
 await ip(METAKEY,m);
 return {ok:true,state:cloud.state};
}
window.LVStorage={
 async prepareNewDatabase(mode='browser_local'){
  if(mode==='local_folder'||mode==='cloud'){
   if(!('showDirectoryPicker'in window))throw Error('Dieser Browser unterstützt keine Ordnerauswahl. Nutzen Sie „Ohne Ordner nur im Browser speichern“.');
   const selected=await showDirectoryPicker({mode:'readwrite'});
   if(!await permission(selected,'readwrite'))throw Error('Schreibberechtigung wurde nicht erteilt.');
   handle=selected;
   await ip(HANDLEKEY,handle);
   setSetting('storage_mode',mode);
   const m=await ig(METAKEY)||{};
   m.writeBlocked=false;
   delete m.expectedCloudRevisionId;
   delete m.expectedCloudDatabaseId;
   await ip(METAKEY,m);
   await saveToFolder(false,true);
   await persist(false);
   return {ok:true,mode,folder:handle.name};
  }
  handle=null;
  await idel(HANDLEKEY);
  setSetting('storage_mode','browser_local');
  const m=await ig(METAKEY)||{};
  m.writeBlocked=false;
  delete m.expectedCloudRevisionId;
  delete m.expectedCloudDatabaseId;
  await ip(METAKEY,m);
  await persist(false);
  await syncStatus();
  return {ok:true,mode:'browser_local',folder:'Nur Browser-Speicher'};
 },
 async openExistingFolder(){if(!('showDirectoryPicker'in window))throw Error('Ordnerauswahl wird von diesem Browser nicht unterstützt.');handle=await showDirectoryPicker({mode:'readwrite'});await ip(HANDLEKEY,handle);await loadFromFolder();setSetting('storage_mode','cloud');await persist(false)},
 async openExistingFile(input){
  const f=input.files?.[0];if(!f)throw Error('Keine Datei ausgewählt.');
  const bytes=new Uint8Array(await f.arrayBuffer());if(bytes.length<100)throw Error('Die ausgewählte Datei ist leer oder zu klein.');
  let test;try{test=new SQL.Database(bytes)}catch{throw Error('Die ausgewählte Datei ist keine lesbare SQLite-Datenbank.')}
  const check=test.exec('PRAGMA quick_check');if(check[0]?.values[0][0]!=='ok')throw Error('Die Datenbankprüfung ist fehlgeschlagen.');
  if(!test.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='articles'").length)throw Error('In dieser Datei wurde keine Lagerdatenbank mit einer Artikeltabelle gefunden.');
  db.close();db=test;initSchema();adoptExistingDatabase();setSetting('storage_mode',handle?setting('storage_mode','local_folder'):'browser_local');
  if(existingDatabaseHasContent())setSetting('setup_complete','1');
  const articleCount=Number(scalar('SELECT COUNT(*) FROM articles')||0);
  const movementCount=tableExists('movements')?Number(scalar('SELECT COUNT(*) FROM movements')||0):0;
  await ip(DBKEY,db.export().buffer);
  const state=currentDbState(),meta=await ig(METAKEY)||{};
  meta.dirty=true;meta.localModified=state.changed_at;meta.writeBlocked=!!handle;meta.restorePending=false;await ip(METAKEY,meta);
  return {ok:true,articles:articleCount,movements:movementCount,file:f.name};
 }
};


async function cloudState(){
 if(setting('storage_mode','browser_local')!=='cloud')return {connected:false};
 const c=await inspectCloudDatabase();
 if(!c.connected)return {connected:false};
 return {
  connected:true,
  accessible:!!c.accessible,
  file:'lager.db',
  folder:handle?.name||'',
  modified:Number(c.modified||0),
  size:Number(c.size||0),
  state:c.state||null,
  error:c.error||''
 };
}
async function localCounts(){
 return {
  articles:Number(scalar('SELECT COUNT(*) FROM articles')||0),
  movements:tableExists('movements')?Number(scalar('SELECT COUNT(*) FROM movements')||0):0
 };
}

window.LVDatabaseStatus={
 async get(){
  await ready;
  const m=await ig(METAKEY)||{};
  return {
   lastModified:currentDbState().changed_at||Number(m.localModified||0),
   lastAutomaticBackup:Number(m.lastAutomaticBackup||0),
   cloudConnected:setting('storage_mode','browser_local')==='cloud'&&!!handle,
   dirty:!!m.dirty,
   lastSync:Number(m.lastSync||0)
  };
 }
};

window.LVBackup={
 async manual(){try{const x=await createBackup('Manuell',backupComment.value.trim());backupComment.value='';msg(backupMsg,'Backup erstellt: '+x.name,true);await this.refresh()}catch(e){msg(backupMsg,e.message,false)}},
 async refresh(){await ready;const list=await getBackupIndex();if(!window.backupRows)return;backupRows.innerHTML=list.map(x=>`<tr><td>${new Date(x.created).toLocaleString('de-DE')}</td><td>${x.kind}</td><td>${x.comment||'–'}</td><td>${(x.size/1024).toLocaleString('de-DE',{maximumFractionDigits:1})} KB</td><td><button class="secondary" onclick="LVBackup.restore('${x.name.replaceAll("'","\\'")}')">Wiederherstellen</button> <button class="secondary" onclick="LVBackup.download('${x.name.replaceAll("'","\\'")}')">Herunterladen</button> <button class="danger" onclick="LVBackup.remove('${x.name.replaceAll("'","\\'")}')">Löschen</button></td></tr>`).join('')||'<tr><td colspan="5">Noch keine Backups</td></tr>'},
 async restore(name){
  if(!confirm('Diesen Datenstand lokal wiederherstellen? Vorher wird ein Sicherheitsbackup des aktuellen lokalen Stands erstellt. Die Cloud-Datei wird noch nicht verändert.'))return;
  try{
   const result=await restoreBackup(name);
   sessionStorage.removeItem('lv_startup_confirmed');
   alert('Backup wurde lokal wiederhergestellt. Die Cloud-Datei bleibt unverändert. Prüfe den Bestand und veröffentliche ihn nur bewusst als neuen Cloud-Stand.');
   location.reload();
  }catch(e){msg(backupMsg,e.message,false)}
 },
 async refreshPending(){
  try{
   const s=await LVBackupState.get();
   if(window.restorePendingBox)restorePendingBox.style.display=s.restorePending?'block':'none';
  }catch(e){console.warn(e)}
 },
 async publishRestored(){
  if(!confirm('Der wiederhergestellte, möglicherweise ältere Datenstand überschreibt die aktuelle Cloud-Datei. Vorher wird die jetzige Cloud-Datei als Sicherheitsbackup gesichert. Wirklich veröffentlichen?'))return;
  try{
   await LVBackupState.publishRestored();
   msg(restorePendingMsg,'Wiederhergestellter Stand wurde als neuer Cloud-Stand veröffentlicht.',true);
   setTimeout(()=>location.reload(),500);
  }catch(e){msg(restorePendingMsg,e.message,false)}
 },
 async discardRestore(){
  if(!confirm('Lokale Wiederherstellung verwerfen und den aktuellen Cloud-Stand erneut laden?'))return;
  try{
   await LVBackupState.discardRestore();
   location.reload();
  }catch(e){msg(restorePendingMsg,e.message,false)}
 },
 async remove(name){if(!confirm('Backup wirklich löschen?'))return;await deleteBackup(name);await this.refresh()},
 async download(name){const x=(await getBackupIndex()).find(z=>z.name===name),bytes=await readBackup(x),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([bytes],{type:'application/octet-stream'}));a.download=x.name;a.click()}
};
const ready=initialize().then(async()=>{setTimeout(ensureDailyBackup,2500)});
window.fetch=route;
async function syncStatus(){const m=await ig(METAKEY)||{};if(window.syncFile)syncFile.textContent=handle?.name||'Keiner';if(window.syncDirty)syncDirty.textContent=m.dirty?'Ja':'Nein';if(window.syncLast)syncLast.textContent=m.lastSync?new Date(m.lastSync).toLocaleString('de-DE'):'Noch nie';if(window.syncAuto)syncAuto.textContent=handle?'Aktiv':'Wartet auf Ordner'}
async function permission(h,m){if((await h.queryPermission({mode:m}))==='granted')return true;return (await h.requestPermission({mode:m}))==='granted'}
window.LVSync={
 async chooseFolder(){return LVStorageModeState.enableCloud();
 },
 async load(reloadAfter=true){
  try{
   await loadFromFolder();
   if(reloadAfter)location.reload();
   return {ok:true};
  }catch(e){
   if(window.syncMsg)msg(syncMsg,e.message,false);
   throw e;
  }
 },
 async save(){
  try{isSyncing=true;await saveToFolder(true,false);msg(syncMsg,'Datenbank und Backup sicher gespeichert.',true)}
  catch(e){msg(syncMsg,e.message,false)}
  finally{isSyncing=false}
 },
 async forceSave(){
  if(!confirm('ACHTUNG: Der lokale Datenstand überschreibt die aktuelle Cloud-Datei. Die bisherige Cloud-Datei wird vorher als Sicherheitsbackup gespeichert. Wirklich fortfahren?'))return;
  try{isSyncing=true;await saveToFolder(true,true);msg(syncMsg,'Cloud-Datei wurde ausdrücklich überschrieben und vorher gesichert.',true)}
  catch(e){msg(syncMsg,e.message,false)}
  finally{isSyncing=false}
 },
 async sync(silent=false){
  try{
   if(setting('storage_mode','browser_local')!=='cloud'){if(!silent)throw Error('Cloud-Modus ist nicht aktiviert.');return}
   if(!handle){if(!silent)throw Error('Kein Synchronisationsordner verbunden.');return}
   isSyncing=true;
   const m=await ig(METAKEY)||{};
   const cloud=await inspectCloudDatabase();
   if(!cloud.accessible)throw Error('Cloud-Datenbank kann nicht gelesen werden.');
   if(m.dirty){
    await saveToFolder(true,false);
    if(!silent)msg(syncMsg,'Synchronisierung erfolgreich.',true);
   }else if(m.expectedCloudRevisionId!==cloud.state.revision_id){
    await loadFromFolder();
    if(!silent)location.reload();
   }else if(!silent){
    msg(syncMsg,'Lokaler und Cloud-Stand sind bereits identisch.',true);
   }
  }catch(e){
   if(!silent&&window.syncMsg)msg(syncMsg,e.message,false);else console.warn(e);
  }finally{isSyncing=false}
 },
 async disconnect(){handle=null;await idel(HANDLEKEY);setSetting('storage_mode','browser_local');await persist(false);await syncStatus();msg(syncMsg,'Lokaler Modus aktiviert. Die Cloud-Datei wurde nicht gelöscht.',true)},
 exportDb(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([db.export()],{type:'application/octet-stream'}));a.download='lager.db';a.click()},
 async importDb(input){try{await LVStorage.openExistingFile(input);location.reload()}catch(e){alert(e.message)}},
 flush(){
 if(!handle)return;
 clearTimeout(autoTimer);
 if(setting('storage_mode','browser_local')==='cloud')this.sync(true);
 else if(setting('storage_mode','browser_local')==='local_folder')saveToFolder(false,true).catch(console.warn);
}
};



window.LVStorageModeState={
 async get(){
  await ready;
  const m=await ig(METAKEY)||{};
  const mode=setting('storage_mode',handle?'local_folder':'browser_local');
  return {mode,configuredMode:mode,connected:!!handle,folder:handle?.name||'',dirty:!!m.dirty,lastSync:Number(m.lastSync||0)};
 },
 async chooseLocalFolder(){
  await ready;
  if(!('showDirectoryPicker'in window))throw Error('Dieser Browser unterstützt keine dauerhafte Ordnerauswahl.');
  const selected=await showDirectoryPicker({mode:'readwrite'});
  if(!await permission(selected,'readwrite'))throw Error('Schreibberechtigung wurde nicht erteilt.');
  const previousHandle=handle;
  handle=selected;
  try{
   const file=await selected.getFileHandle('lager.db',{create:false}).catch(()=>null);
   if(file)throw Error('Im ausgewählten Ordner befindet sich bereits eine lager.db. Wählen Sie einen leeren Ordner oder importieren Sie die Datei bewusst.');
   await ip(HANDLEKEY,handle);
   setSetting('storage_mode','local_folder');
   const m=await ig(METAKEY)||{};
   m.writeBlocked=false;
   delete m.expectedCloudRevisionId;
   delete m.expectedCloudDatabaseId;
   await ip(METAKEY,m);
   await createBackup('Sicherheitsbackup','Vor Wechsel des lokalen Speicherordners');
   await saveToFolder(false,true);
   await persist(false);
   return {ok:true,mode:'local_folder',folder:handle.name};
  }catch(e){
   handle=previousHandle;
   if(previousHandle)await ip(HANDLEKEY,previousHandle);else await idel(HANDLEKEY);
   throw e;
  }
 },
 async enableCloud(){
  await ready;
  if(!('showDirectoryPicker'in window))throw Error('Dieser Browser unterstützt keine dauerhafte Ordnerverknüpfung.');
  const selected=await showDirectoryPicker({mode:'readwrite'});
  if(!await permission(selected,'readwrite'))throw Error('Schreibberechtigung wurde nicht erteilt.');
  const previousHandle=handle;
  handle=selected;
  const cloud=await inspectCloudDatabase();
  if(cloud.accessible){
   handle=previousHandle;
   throw Error('Im ausgewählten Ordner befindet sich bereits eine lager.db. Wählen Sie für die Übernahme einen leeren Ordner.');
  }
  await ip(HANDLEKEY,handle);
  setSetting('storage_mode','cloud');
  const m=await ig(METAKEY)||{};
  m.writeBlocked=false;
  delete m.expectedCloudRevisionId;
  delete m.expectedCloudDatabaseId;
  await ip(METAKEY,m);
  await createBackup('Sicherheitsbackup','Vor Umstellung auf Cloud');
  await saveToFolder(false,true);
  await persist(false);
  return {ok:true,mode:'cloud',folder:handle.name};
 },
 async enableLocal(){
  await ready;
  handle=null;
  await idel(HANDLEKEY);
  setSetting('storage_mode','browser_local');
  const m=await ig(METAKEY)||{};
  m.writeBlocked=false;
  delete m.expectedCloudRevisionId;
  delete m.expectedCloudDatabaseId;
  await ip(METAKEY,m);
  await persist(false);
  await syncStatus();
  return {ok:true,mode:'browser_local'};
 },
 async changeFolder(){
  await ready;
  const previousHandle=handle;
  handle=null;
  try{return await this.enableCloud()}
  catch(e){handle=previousHandle;if(previousHandle)await ip(HANDLEKEY,previousHandle);throw e}
 }
};

window.LVStartupState={
 async get(){
  await ready;
  const m=await ig(METAKEY)||{};
  const c=await cloudState();
  const local=currentDbState();
  let comparison='none';
  if(c.accessible&&c.state){
   if(local.database_id===c.state.database_id&&local.revision_id===c.state.revision_id){
    comparison='identical';
   }else if(local.database_id!==c.state.database_id){
    comparison='conflict';
   }else if(c.state.revision>local.revision){
    comparison='cloud_newer';
   }else if(local.revision>c.state.revision){
    comparison=m.expectedCloudRevisionId===c.state.revision_id?'local_newer_safe':'local_newer_unverified';
   }else{
    comparison='conflict';
   }
  }
  return {
   needsConfirmation:sessionStorage.getItem('lv_startup_confirmed')!=='1',
   localModified:local.changed_at||Number(m.localModified||0),
   localArticles:local.articles,
   localMovements:local.movements,
   localRevisionLabel:`${local.revision} · ${local.revision_id.slice(0,8)}`,
   cloudConnected:!!c.connected,
   cloudAccessible:!!c.accessible,
   cloudModified:Number(c.modified||0),
   cloudFile:c.file||'',
   cloudRevisionLabel:c.state?`${c.state.revision} · ${c.state.revision_id.slice(0,8)}`:'–',
   comparison
  };
 },
 async confirm(mode){
  await ready;
  const m=await ig(METAKEY)||{};
  const c=await inspectCloudDatabase();
  const local=currentDbState();
  m.startupConfirmedAt=Date.now();
  m.startupConfirmedMode=mode;
  if(mode==='local'&&c.accessible){
   const safe=m.expectedCloudRevisionId===c.state.revision_id&&local.database_id===c.state.database_id;
   m.writeBlocked=!safe&&local.revision_id!==c.state.revision_id;
  }
  await ip(SESSIONKEY,db.export().buffer);
  await ip(METAKEY,m);
  sessionStorage.setItem('lv_startup_confirmed','1');
  return {ok:true,writeBlocked:!!m.writeBlocked};
 },
 async loadCloud(){
  await ready;
  if(!handle)throw Error('Kein Synchronisationsordner verbunden.');
  const state=await cloudState();
  if(!state.accessible){
   throw Error('Die Datei lager.db konnte im verbundenen Synchronisationsordner nicht gelesen werden. '+(state.error||''));
  }
  await LVSync.load(false);
  return {
   ok:true,
   file:state.file,
   modified:state.modified
  };
 },
 async createNew(){
  await ready;
  await createBackup('Sicherheitsbackup','Vor neuer Datenbank');
  db.close();
  db=new SQL.Database();
  initSchema();
  setSetting('setup_complete','0');
  setSetting('database_version','41');
  const m=await ig(METAKEY)||{};
  m.dirty=true;
  m.localModified=Date.now();
  await ip(METAKEY,m);
  await persist(true);
  return {ok:true};
 }
};

window.LVBackupState={
 async get(){
  await ready;
  const m=await ig(METAKEY)||{};
  return {restorePending:!!m.restorePending,writeBlocked:!!m.writeBlocked,backupName:m.restoreBackupName||''};
 },
 async publishRestored(){
  await ready;
  const m=await ig(METAKEY)||{};
  if(!m.restorePending)throw Error('Es ist kein wiederhergestellter Datenstand vorgemerkt.');
  if(!handle)throw Error('Kein Synchronisationsordner verbunden.');
  await saveToFolder(true,true);
  return {ok:true};
 },
 async discardRestore(){
  await ready;
  const m=await ig(METAKEY)||{};
  if(!m.restorePending)throw Error('Es ist kein wiederhergestellter Datenstand vorgemerkt.');
  await loadFromFolder();
  return {ok:true};
 }
};

window.LVSession={
 async status(){
  await ready;
  const m=await ig(METAKEY)||{};
  return {dirty:!!m.dirty,connected:!!handle,lastSync:m.lastSync||0};
 },
 async close(mode){
  await ready;
  clearTimeout(autoTimer);
  clearTimeout(automaticBackupTimer);
  if(mode==='sync'){
   if(!handle)throw Error('Es ist kein Synchronisationsordner verbunden. Nutze „Nur lokal schließen“ oder richte zuerst unter Dateisynchronisierung einen Ordner ein.');
   await saveToFolder(true,false);
   await createBackup('Abschluss','Nach Synchronisierung beim Abmelden');
  }else if(mode==='local'){
   await createBackup('Abschluss','Lokales Abmelden ohne Synchronisierung');
   await persist(false);
  }else if(mode==='discard'){
   const stored=await ig(SESSIONKEY);
   if(stored){
    try{db.close()}catch{}
    db=new SQL.Database(new Uint8Array(stored));
    initSchema();
    await ip(DBKEY,db.export().buffer);
   }
   const m=await ig(METAKEY)||{};
   m.dirty=false;
   m.restorePending=false;
   m.sessionClosed=Date.now();
   await ip(METAKEY,m);
   try{db.close()}catch{}
   return {ok:true,mode};
  }
  const m=await ig(METAKEY)||{};
  m.sessionClosed=Date.now();
  await ip(METAKEY,m);
  try{db.close()}catch{}
  return {ok:true,mode};
 }
};

window.LVBackend={ready,db:()=>db,persist};ready.then(syncStatus);
})();
