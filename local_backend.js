/* Materialanforderung Mengenfix V50: Mengenspalte ohne Einheit (ST/St./stk.). */

(function(){
const nativeFetch=window.fetch.bind(window);
const DBKEY='lv22-db', METAKEY='lv22-meta', HANDLEKEY='lv22-directory', BACKUPKEY='lv22-backups', SESSIONKEY='lv34-session-start';
let SQL,db,handle=null,autoTimer=null,isSyncing=false;
const helpData={"07-csv-center.md": "# CSV-Center\n\n## Exporte\n\n- Lagerbestand\n- Einbuchungen\n- Entnahmen\n\nDie CSV-Dateien werden direkt im Browser heruntergeladen. Das vorgegebene Tabellenlayout, Semikolon als Trennzeichen und UTF-8 mit BOM bleiben erhalten.\n\n## SAP-Excel oder CSV importieren\n\nUnterstützte Spalten sind unter anderem:\n\n- Material\n- Bezeichnung zum Material\n- Lagerort\n- Bezeichnung des Lagerorts\n- Frei verwendbar\n\nVor dem Buchen wird eine Vorschau angezeigt. Fehlende Artikel können direkt angelegt werden.\n", "02-neues-material.md": "# Neues Material\n\nBeim Anlegen eines Materials können Lagerort und Maschinen direkt ausgewählt werden.\n\n- **Lagerort:** vorhandenen Lagerort auswählen oder unmittelbar einen neuen Lagerort anlegen. Während der Eingabe werden ähnlich benannte Lagerorte vorgeschlagen, damit Dubletten vermieden werden.\n- **Maschinen:** ein Ersatzteil kann mehreren Maschinen gleichzeitig zugeordnet werden. Die Liste unterstützt Mehrfachauswahl. Neue Maschinen können direkt aus dem Materialformular angelegt werden.\n- Vor dem Anlegen ähnlich benannter Lagerorte oder Maschinen weist die App auf vorhandene Einträge hin.\n\nArtikelnummer, Bezeichnung, Anfangsbestand, Sollbestand, Mindestbestand, Einheit und weitere Stammdaten bleiben wie bisher verfügbar.\n\n\n## Buchung bei Materialanlage\n\nSeit Version 58 wird jede neue Materialanlage zusätzlich unter **Buchungen** protokolliert. Der eingegebene Anfangsbestand wird als Einbuchung mit der Quelle **Materialanlage** gespeichert. Auch ein Anfangsbestand von 0 erhält einen nachvollziehbaren Buchungseintrag, ohne den Bestand zu verändern.\n", "17-abschluss-und-tests.md": "# Abschluss Phase 1–7\n\nVersion 17.0 schließt das ursprünglich geplante Projekt ab.\n\nAbnahmetest:\n- Artikel anlegen\n- Ein- und Ausbuchung\n- CSV-Export\n- Inventurkorrektur\n- Materialanforderung in Excel öffnen\n- Historienfilter testen\n- Passwortverwaltung prüfen\n", "08-historie.md": "# Historie\n\nDie Historie enthält alle Einbuchungen und Entnahmen.\n\nSie kann gefiltert werden nach:\n\n- Alle Buchungen\n- Nur Einbuchungen\n- Nur Entnahmen\n\nDas unter **Stammdaten** gewählte Datumsformat wird auch auf bereits vorhandene Einträge angewendet.\n", "01-dashboard.md": "# Dashboard\n\nDas Dashboard zeigt die wichtigsten Kennzahlen:\n\n- **Aktive Artikel:** Anzahl aller verwendbaren Artikel.\n- **Unterbestand:** Artikel unterhalb ihres Mindestbestands.\n- **Heute:** Anzahl der heutigen Buchungen.\n- **Buchungen:** Gesamtzahl aller Ein- und Ausbuchungen.\n\nDie Werte werden aus der lokalen Datenbank `lager.db` berechnet.\n", "04-einbuchung.md": "# Einbuchung\n\n## Manuelle Einbuchung\n\n- Datum und Techniker auswählen.\n- Artikel und Menge hinzufügen.\n- Einbuchung bestätigen.\n- Die letzten Buchungen werden anschließend sofort aktualisiert.\n\n## Lieferschein mit Microsoft 365/Copilot auswerten\n\nDer aktuelle Prompt steht unter **Hilfe → M365-Prompts**. Die Ausgabe beginnt mit `IMPORTTYP: EINBUCHUNG` und enthält pro Material `Artikelnummer[TAB]Bezeichnung[TAB]Anzahl`.\n\nUnbekannte Artikel können direkt als neues Material angelegt oder bewusst ignoriert werden. Artikelnummer und erkannte Bezeichnung werden beim Anlegen vorausgefüllt. Ein Entnahme-Prompt wird im Einbuchungsbereich blockiert.\n", "09-stammdaten.md": "# Stammdaten\n\n## Lagerorte\nLagerorte können weiterhin zentral angelegt werden. Zusätzlich lassen sie sich direkt beim Anlegen eines neuen Materials erstellen. Ähnliche vorhandene Namen werden vorher vorgeschlagen.\n\n## Maschinen und alternative Bezeichnungen\nEine Maschine besitzt einen Hauptnamen und kann beliebig viele alternative Ticket-Bezeichnungen erhalten.\n\n- **Alternative Bezeichnung zuordnen:** z. B. `Compas 4` → `Compas 4.0`.\n- **Trennen:** eine falsche Alias-Zuordnung kann jederzeit wieder entfernt werden.\n- **Maschinen zusammenführen:** zwei bereits getrennt angelegte Maschinen können zu einer Hauptmaschine zusammengeführt werden. Der frühere Name bleibt als Alias erhalten.\n- **Zusammenführung rückgängig:** die vorherige Maschine wird wiederhergestellt und ihre Ersatzteil-Zuordnungen werden soweit möglich auf den Stand vor der Zusammenführung zurückgesetzt.\n\n## Mehrfachzuordnung von Ersatzteilen\nEin Artikel kann mehreren Maschinen gleichzeitig zugeordnet werden. Diese Zuordnung ist beim neuen Material sowie in der vollständigen Artikelliste bearbeitbar.\n", "15-historienfilter.md": "# Historienfilter und Export\n\nFilter:\n- Buchungsart\n- Zeitraum\n- Techniker\n- Artikelnummer oder Bezeichnung\n\nDer CSV-Export übernimmt die aktuell eingestellten Filter.\n", "03-lagerbestand.md": "# Lagerbestand\n\nIm Lagerbestand können Artikel über Artikelnummer, Bezeichnung, Lagerort oder Maschine gesucht werden.\n\n## Spalten\n\n- Sollbestand\n- Mindestbestand\n- Istbestand\n- Differenz zum Sollbestand\n- Lagerort\n- Maschine\n\nEin Artikel wird als Unterbestand hervorgehoben, wenn sein Istbestand unter dem Mindestbestand liegt.\n", "14-inventur.md": "# Inventur\n\n- Inventurliste im CSV-Center exportieren.\n- Gezählten Bestand eintragen.\n- CSV, TXT oder XLSX einlesen.\n- Differenzen prüfen.\n- Bestandskorrekturen mit Administratorpasswort buchen.\n\nNur Differenzen werden als Buchungen mit der Quelle **Inventur** gespeichert.\n", "06-materialanforderung.md": "# Materialanforderung\n\n- Techniker auswählen.\n- **Unterbestand laden** anklicken.\n- Gewünschte Positionen markieren.\n- Bestellmenge prüfen oder ändern.\n- **Materialanforderung exportieren** anklicken.\n\nDie Excel-Datei wird anhand der hinterlegten Vorlage erzeugt. Der Dateiname enthält Datum und Technikername.\n", "13-fehlerbehebung.md": "# Fehlerbehebung\n\n## Lagerbestand bleibt nach dem Start leer\n\nSeit Version 56 kann die Audit-Nachtragung den Datenbankstart nicht mehr blockieren. Falls künftig ein anderer Startfehler auftritt, erscheint eine rote Meldung statt eines stillen leeren Dashboards.\n\nBei Cloud-Betrieb prüfen, ob oben **Cloud** angezeigt wird und ob der verbundene Ordner zugreifbar ist.\n\n## M365-Ergebnis wird nicht erkannt\n\n- Aktuellen Prompt unter **Hilfe → M365-Prompts** verwenden.\n- Auf `IMPORTTYP: EINBUCHUNG` bzw. `IMPORTTYP: ENTNAHME` achten.\n- Artikelnummern und Mengen dürfen nicht leer sein.\n\n\n## Lokaler/Cloud-Dialog erscheint ständig\n\nSeit Version 58 wird ein **lokal neuer, aber sicher auf dem letzten Cloud-Stand basierender** Datenstand automatisch hochgeladen. Nur echte Konflikte zwischen verschiedenen Geräten müssen manuell entschieden werden.\n\nUnter **Dateisynchronisierung** werden die fortlaufende lokale und die zuletzt bekannte Cloud-Revisionsnummer angezeigt.\n", "16-materialanforderung-export.md": "# Materialanforderung\n\nDie Originalvorlage `materialanforderung_vorlage.xlsx` bleibt unverändert erhalten.\n\nPrüfungen:\n- maximal 25 Positionen\n- nur positive Mengen\n- doppelte Artikel werden zusammengefasst\n- Vorschau vor Export\n- Sortierung nach Artikelnummer\n\nDateiname: `Bestellung_Datum_Techniker.xlsx`\n", "10-reset.md": "# Vollständiges Zurücksetzen\n\nDer vollständige Reset löscht:\n\n- Artikel\n- Bestände\n- Buchungen\n- Historie\n- Audit-Protokoll\n- Lagerorte\n- Maschinen\n- Techniker\n- Administratorpasswort\n- Einstellungen\n\nProgrammdateien, Excel-Vorlage und Hilfedateien bleiben erhalten.\n\nNach dem Reset erscheint wieder automatisch die vollständige Ersteinrichtung.\n", "11-m365-prompts.md": "# Microsoft 365 / Copilot – aktuelle Prompts\n\n## Lieferschein – Einbuchung\n\n```text\nIMPORTTYP: EINBUCHUNG\n\nExtrahiere aus diesem Lieferschein ausschließlich das tatsächlich gelieferte Material.\n\nGib pro Material genau eine neue Zeile in dieser Reihenfolge aus:\nArtikelnummer[TAB]Bezeichnung[TAB]Anzahl\n\nWichtige Regeln:\n- Die erste Ausgabezeile muss exakt lauten: IMPORTTYP: EINBUCHUNG\n- Danach nur Materialpositionen ausgeben.\n- Keine Überschrift, keine Erklärung und keinen Fließtext ergänzen.\n- Preise, Summen, Fahrzeit, Arbeitszeit und Kilometer ignorieren.\n- Für jedes Material eine neue Zeile erstellen.\n- Zwischen den Feldern ein echtes Tabulatorzeichen verwenden.\n- Artikelnummer und Bezeichnung exakt übernehmen.\n- Mengen als reine Zahl ausgeben.\n```\n\n## Servicebericht – Entnahme\n\n```text\nIMPORTTYP: ENTNAHME\n\nExtrahiere aus dieser Service-PDF ausschließlich die tatsächlich verwendeten oder verbauten Materialien.\n\nGib pro Material genau eine neue Zeile in dieser Reihenfolge aus:\nDatum[TAB]Artikelnummer[TAB]Bezeichnung[TAB]Anzahl[TAB]Kunde[TAB]Maschine\n\nWichtige Regeln:\n- Die erste Ausgabezeile muss exakt lauten: IMPORTTYP: ENTNAHME\n- Danach nur Materialpositionen ausgeben.\n- Keine Überschrift, keine Erklärung und keinen Fließtext ergänzen.\n- Fahrzeit, Arbeitszeit und Kilometer vollständig ignorieren.\n- Nicht verbaute, nur erwähnte oder empfohlene Materialien nicht übernehmen.\n- Für jedes Material eine neue Zeile erstellen.\n- Zwischen allen Feldern ein echtes Tabulatorzeichen verwenden.\n- Artikelnummer und Bezeichnung exakt übernehmen.\n- Mengen als reine Zahl ausgeben.\n```\n\n## Vertauschungsschutz\n\n`IMPORTTYP: EINBUCHUNG` gehört nur zur Einbuchung. `IMPORTTYP: ENTNAHME` gehört nur zur Entnahme. Beim falschen Bereich bleibt die Buchung gesperrt.\n", "00-erste-schritte.md": "# Erste Schritte\n\nDie Lagerverwaltung startet nach der Erstinstallation mit einem Einrichtungsassistenten.\n\n## Ersteinrichtung\n\n- Administratorpasswort mit mindestens 8 Zeichen vergeben.\n- Namen des Technikers eingeben.\n- Datumsformat auswählen.\n- Einrichtung abschließen.\n\nLagerorte und Maschinen müssen bei der Ersteinrichtung nicht angelegt werden. Sie können später unter **Stammdaten** ergänzt werden.\n", "12-mobile-bedienung.md": "# Mobile Bedienung\n\nAuf schmalen Bildschirmen wird die Navigation über die Schaltfläche **Menü** geöffnet.\n\n## Hinweise\n\n- Tabellen können seitlich verschoben werden.\n- Eingabefelder werden untereinander dargestellt.\n- Die Ersteinrichtung ist für Smartphone und Tablet optimiert.\n- Für umfangreiche CSV- und Excel-Arbeiten ist ein Windows-PC komfortabler.\n\n\n## Cloud-Synchronisierung am Smartphone\n\nIm Cloud-Modus werden eigene, eindeutig auf dem aktuellen Cloud-Stand basierende Änderungen automatisch synchronisiert. Die Auswahl zwischen lokalem und Cloud-Stand erscheint nicht mehr nach jeder normalen Buchung. Eine Entscheidung wird nur noch bei einem echten Konflikt, einer nicht lesbaren Cloud-Datei oder einem nicht eindeutig zuordenbaren Datenstand verlangt.\n", "05-entnahme.md": "# Entnahme\n\n## Manuelle Entnahme\n\n- Datum, Techniker, Kunde und Maschine eintragen.\n- Artikel und Menge hinzufügen.\n- Entnahme bestätigen.\n- Die letzten Buchungen werden anschließend sofort aktualisiert.\n\n## Servicebericht mit Microsoft 365/Copilot auswerten\n\nDer aktuelle Prompt steht unter **Hilfe → M365-Prompts**. Die Ausgabe beginnt mit `IMPORTTYP: ENTNAHME` und enthält pro Material `Datum[TAB]Artikelnummer[TAB]Bezeichnung[TAB]Anzahl[TAB]Kunde[TAB]Maschine`.\n\nUnbekannte Artikel können als neues Material angelegt oder ignoriert werden. Bei einer Entnahme muss ein neu angelegter Artikel genügend Anfangsbestand besitzen. Ein Einbuchungs-Prompt wird im Entnahmebereich blockiert.\n\n\n## Unterschiedliche Maschinenbezeichnungen\n\nDie App berücksichtigt alternative Bezeichnungen von Maschinen. Beispiel: `Compas 4`, `Compas 4.0` und eine kundenspezifische Ticket-Bezeichnung können derselben Hauptmaschine zugeordnet werden. Bei ähnlichen, aber noch nicht verknüpften Namen werden vorhandene Maschinen vorgeschlagen.\n\nUnter **Stammdaten → Maschinen-Bezeichnungen & Mehrfachzuordnung** können alternative Namen zusammengeführt und später wieder getrennt werden.\n"};

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
function audit(user,action,entity,id='',details=''){run('INSERT INTO audit_log(event_time,user_name,action,entity,entity_id,details) VALUES(?,?,?,?,?,?)',[stamp(),user||'Techniker',action,entity,String(id||''),details||''])}

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
  cloud_base_revision_id:syncValue('cloud_base_revision_id',''),
  cloud_base_revision:Number(syncValue('cloud_base_revision','0')),
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
  cloud_base_revision_id:get('cloud_base_revision_id',''),
  cloud_base_revision:Number(get('cloud_base_revision','0')),
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
 },250)
}
function initSchema(){
db.run(`PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS app_settings(setting_key TEXT PRIMARY KEY,setting_value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sync_state(key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS articles(id INTEGER PRIMARY KEY AUTOINCREMENT,article_no TEXT NOT NULL UNIQUE,description TEXT NOT NULL,target_stock REAL NOT NULL DEFAULT 0,minimum_stock REAL NOT NULL DEFAULT 0,initial_stock REAL NOT NULL DEFAULT 0,unit TEXT NOT NULL DEFAULT 'Stk.',location TEXT NOT NULL DEFAULT '',machine TEXT NOT NULL DEFAULT '',active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,manufacturer TEXT NOT NULL DEFAULT '',supplier TEXT NOT NULL DEFAULT '',supplier_article_no TEXT NOT NULL DEFAULT '',barcode TEXT NOT NULL DEFAULT '',purchase_price REAL NOT NULL DEFAULT 0,notes TEXT NOT NULL DEFAULT '',image_url TEXT NOT NULL DEFAULT '',datasheet_url TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS movements(id INTEGER PRIMARY KEY AUTOINCREMENT,movement_date TEXT NOT NULL,movement_type TEXT NOT NULL,article_id INTEGER NOT NULL,quantity REAL NOT NULL,customer TEXT NOT NULL DEFAULT '',technician TEXT NOT NULL DEFAULT '',note TEXT NOT NULL DEFAULT '',source TEXT NOT NULL DEFAULT 'App',created_at TEXT NOT NULL,vehicle TEXT NOT NULL DEFAULT '',machine TEXT NOT NULL DEFAULT '',delivery_note TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS locations(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT UNIQUE NOT NULL,description TEXT NOT NULL DEFAULT '',active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS machines(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT UNIQUE NOT NULL,description TEXT NOT NULL DEFAULT '',active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS machine_aliases(id INTEGER PRIMARY KEY AUTOINCREMENT,alias TEXT UNIQUE NOT NULL,machine_id INTEGER NOT NULL,active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL DEFAULT '',FOREIGN KEY(machine_id) REFERENCES machines(id));
CREATE TABLE IF NOT EXISTS article_machines(article_id INTEGER NOT NULL,machine_id INTEGER NOT NULL,PRIMARY KEY(article_id,machine_id),FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE,FOREIGN KEY(machine_id) REFERENCES machines(id));
CREATE TABLE IF NOT EXISTS machine_merge_history(id INTEGER PRIMARY KEY AUTOINCREMENT,source_machine_id INTEGER NOT NULL,target_machine_id INTEGER NOT NULL,source_name TEXT NOT NULL,snapshot_json TEXT NOT NULL DEFAULT '{}',merged_at TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1);
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
function machineRelationRows(articleId){
 return rows(`SELECT m.id,m.name FROM article_machines am JOIN machines m ON m.id=am.machine_id
  WHERE am.article_id=? AND m.active=1 ORDER BY m.name`,[Number(articleId)]);
}
function syncLegacyArticleMachine(articleId){
 const names=machineRelationRows(articleId).map(x=>x.name);
 run('UPDATE articles SET machine=? WHERE id=?',[names.join(', '),Number(articleId)]);
 return names;
}
function exactMachineResolution(value){
 const wanted=normalizeLoose(value);if(!wanted)return null;
 const canonical=rows('SELECT id,name FROM machines WHERE active=1').find(x=>normalizeLoose(x.name)===wanted);
 if(canonical)return {machine_id:Number(canonical.id),name:canonical.name,input:String(value||''),via_alias:false,exact:true};
 const aliases=rows(`SELECT ma.id alias_id,ma.alias,m.id,m.name FROM machine_aliases ma JOIN machines m ON m.id=ma.machine_id
  WHERE ma.active=1 AND m.active=1`);
 const alias=aliases.find(x=>normalizeLoose(x.alias)===wanted);
 return alias?{machine_id:Number(alias.id),name:alias.name,input:String(value||''),via_alias:true,alias:alias.alias,exact:true}:null;
}
function setArticleMachineIds(articleId,values){
 const aid=Number(articleId);const ids=[];
 for(const value of (Array.isArray(values)?values:[])){
  let id=Number(value);
  if(!id&&String(value||'').trim())id=Number(exactMachineResolution(value)?.machine_id||0);
  if(id&&Number(scalar('SELECT COUNT(*) FROM machines WHERE id=? AND active=1',[id])||0)>0&&!ids.includes(id))ids.push(id);
 }
 run('DELETE FROM article_machines WHERE article_id=?',[aid]);
 for(const id of ids)run('INSERT OR IGNORE INTO article_machines(article_id,machine_id) VALUES(?,?)',[aid,id]);
 return syncLegacyArticleMachine(aid);
}
function migrateMachineRelationsV57(){
 if(setting('machine_relations_v57','')==='1')return;
 try{
  const list=rows('SELECT id,machine FROM articles WHERE TRIM(machine)<>\'\'');
  for(const a of list){
   if(Number(scalar('SELECT COUNT(*) FROM article_machines WHERE article_id=?',[a.id])||0)>0)continue;
   const raw=String(a.machine||'').trim();
   let exact=exactMachineResolution(raw);
   if(exact){run('INSERT OR IGNORE INTO article_machines(article_id,machine_id) VALUES(?,?)',[a.id,exact.machine_id]);continue}
   const parts=raw.split(/\s*[;,|]\s*/).filter(Boolean);
   for(const part of parts){const r=exactMachineResolution(part);if(r)run('INSERT OR IGNORE INTO article_machines(article_id,machine_id) VALUES(?,?)',[a.id,r.machine_id])}
   if(Number(scalar('SELECT COUNT(*) FROM article_machines WHERE article_id=?',[a.id])||0)>0)syncLegacyArticleMachine(a.id);
  }
  setSetting('machine_relations_v57','1');
 }catch(e){console.warn('Maschinen-Mehrfachzuordnung konnte nicht vollständig migriert werden:',e)}
}
function levenshtein(a,b){
 a=normalizeLoose(a);b=normalizeLoose(b);if(a===b)return 0;if(!a)return b.length;if(!b)return a.length;
 const v=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){
  let prev=v[0];v[0]=i;
  for(let j=1;j<=b.length;j++){
   const old=v[j];v[j]=Math.min(v[j]+1,v[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=old;
  }
 }
 return v[b.length];
}
function nameSimilarity(a,b){
 const na=normalizeLoose(a),nb=normalizeLoose(b);if(!na||!nb)return 0;if(na===nb)return 1;
 const max=Math.max(na.length,nb.length);let score=1-levenshtein(na,nb)/max;
 if(na.includes(nb)||nb.includes(na))score=Math.max(score,0.88+0.1*Math.min(na.length,nb.length)/max);
 const ta=new Set(na.split(' ')),tb=new Set(nb.split(' '));const common=[...ta].filter(x=>tb.has(x)).length;
 if(common)score=Math.max(score,0.55+0.4*(2*common/(ta.size+tb.size)));
 return Math.max(0,Math.min(1,score));
}
function similarMasterNames(type,value,limit=5){
 const table=type==='location'?'locations':'machines';
 return rows(`SELECT id,name FROM ${table} WHERE active=1`).map(x=>({...x,score:nameSimilarity(value,x.name)}))
  .filter(x=>x.score>=0.48).sort((a,b)=>b.score-a.score||String(a.name).localeCompare(String(b.name))).slice(0,limit);
}
function machineSuggestions(value,limit=5){
 const direct=similarMasterNames('machine',value,limit);
 const aliases=rows(`SELECT ma.alias,m.id,m.name FROM machine_aliases ma JOIN machines m ON m.id=ma.machine_id WHERE ma.active=1 AND m.active=1`)
  .map(x=>({id:Number(x.id),name:x.name,alias:x.alias,score:nameSimilarity(value,x.alias)})).filter(x=>x.score>=0.48);
 const all=[...direct.map(x=>({id:Number(x.id),name:x.name,alias:'',score:x.score})),...aliases].sort((a,b)=>b.score-a.score);
 const seen=new Set();return all.filter(x=>{if(seen.has(x.id))return false;seen.add(x.id);return true}).slice(0,limit);
}
function resolveMachineName(value){
 const input=String(value||'').trim();if(!input)return {machine_id:0,name:'',input,suggestions:[]};
 const exact=exactMachineResolution(input);if(exact)return {...exact,suggestions:[]};
 const suggestions=machineSuggestions(input,5);
 const top=suggestions[0],second=suggestions[1];
 const auto=top&&top.score>=0.94&&(!second||top.score-second.score>=0.07);
 return auto?{machine_id:top.id,name:top.name,input,via_alias:false,auto_similar:true,score:top.score,suggestions}:{machine_id:0,name:input,input,suggestions};
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
  setSetting('database_version','59');
  if(!setting('date_format'))setSetting('date_format','DD.MM.YYYY');
 }
}
function setupIsRequired(){
 return setting('setup_complete','0')!=='1'&&!existingDatabaseHasContent();
}

async function initialize(){
 SQL=await initSqlJs({locateFile:f=>`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${f}`});
 const b=await ig(DBKEY);db=b?new SQL.Database(new Uint8Array(b)):new SQL.Database();
 initSchema();adoptExistingDatabase();migrateMachineRelationsV57();
 try{backfillMovementAuditV55()}
 catch(e){console.warn('Audit-Nachtragung V55 konnte nicht vollständig ausgeführt werden. Die Datenbank wird trotzdem geladen.',e)}
 handle=await ig(HANDLEKEY)||null;if(!setting('storage_mode'))setSetting('storage_mode',handle?'local_folder':'browser_local');
 const m=await ig(METAKEY)||{};
 if(!m.localModified)m.localModified=currentDbState().changed_at;
 await ip(METAKEY,m);
 await persist(false);
}
function response(data,status=200,headers={}){return new Response(typeof data==='string'||data instanceof Blob||data instanceof ArrayBuffer?data:JSON.stringify(data),{status,headers:{...(typeof data==='object'&&!(data instanceof Blob)&&!(data instanceof ArrayBuffer)?{'Content-Type':'application/json'}:{}),...headers}})}
function body(opt){try{return JSON.parse(opt?.body||'{}')}catch{return {}}}
function query(url){const u=new URL(url,location.href);return Object.fromEntries(u.searchParams.entries())}
function fmtDate(d){const f=setting('date_format','DD.MM.YYYY');if(!d)return '';const x=String(d).slice(0,10).split('-');return f==='YYYY-MM-DD'?x.join('-'):f==='MM/DD/YYYY'?`${x[1]}/${x[2]}/${x[0]}`:`${x[2]}.${x[1]}.${x[0]}`}
function articles(q=''){
 let sql=`SELECT a.*,${stockExpr()} stock FROM articles a LEFT JOIN movements m ON m.article_id=a.id WHERE 1=1`,p=[];
 if(q){
  sql+=` AND (a.article_no LIKE ? OR a.description LIKE ? OR a.location LIKE ? OR a.machine LIKE ? OR EXISTS(
   SELECT 1 FROM article_machines am JOIN machines mm ON mm.id=am.machine_id
   LEFT JOIN machine_aliases ma ON ma.machine_id=mm.id AND ma.active=1
   WHERE am.article_id=a.id AND (mm.name LIKE ? OR ma.alias LIKE ?)))`;
  p=Array(6).fill('%'+q+'%');
 }
 sql+=' GROUP BY a.id ORDER BY a.article_no';
 const list=rows(sql,p);
 for(const a of list){
  const rel=machineRelationRows(a.id);a.machine_ids=rel.map(x=>Number(x.id));a.machines=rel.map(x=>x.name);
  if(rel.length)a.machine=a.machines.join(', ');
 }
 return list;
}

function detectDeclaredImportType(text){
 const first=String(text||'').replace(/\r/g,'').split('\n').map(x=>x.trim()).find(Boolean)||'';
 const m=first.match(/^IMPORTTYP\s*:\s*(EINBUCHUNG|ENTNAHME)$/i);
 return m?m[1].toUpperCase():'';
}
function importContentLines(text){
 return String(text||'').replace(/\r/g,'').split('\n').filter(x=>!/^\s*IMPORTTYP\s*:/i.test(x)).join('\n');
}
function looksLikeServiceImport(text){
 const lines=importContentLines(text).split('\n').map(x=>x.trim()).filter(Boolean);
 if(!lines.length)return false;
 const isQty=v=>Number.isFinite(Number(String(v||'').replace(',','.')));
 let hits=0;
 for(const line of lines){
  const normalized=line.replace(/\s*[;|]\s*/g,'\t');
  if(normalized.includes('\t')){
   const cols=normalized.split('\t').map(x=>x.trim()).filter(Boolean);
   const date=normalizeExtractedDate(cols[0]||'').iso;
   if(date&&cols[1]&&(isQty(cols[2])||isQty(cols[3])))hits++;
  }else{
   const rx=/^(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{4}|\d{4}-\d{1,2}-\d{1,2})\s+[A-Za-z0-9._\/-]+\s+\d+(?:[.,]\d+)?\s+.+$/;
   if(rx.test(line))hits++;
  }
 }
 return hits>=Math.max(1,Math.ceil(lines.length/2));
}
function looksLikeDeliveryImport(text){
 const lines=importContentLines(text).split('\n').map(x=>x.trim()).filter(Boolean);
 if(!lines.length)return false;
 const isQty=v=>Number.isFinite(Number(String(v||'').replace(',','.')));
 let hits=0;
 for(const line of lines){
  const normalized=line.replace(/\s*[;|]\s*/g,'\t');
  if(normalized.includes('\t')){
   const cols=normalized.split('\t').map(x=>x.trim()).filter(Boolean);
   if(cols[0]&&(isQty(cols[1])||isQty(cols[cols.length-1])))hits++;
  }else if(/^[A-Za-z0-9._\/-]+\s+\d+(?:[.,]\d+)?\s*$/.test(line))hits++;
 }
 return hits>=Math.max(1,Math.ceil(lines.length/2));
}

function parseLines(text){
 const out=[],errors=[];
 const lines=importContentLines(text).split('\n');
 const toQty=v=>Number(String(v||'').replace(',','.'));
 for(let i=0;i<lines.length;i++){
  const line=lines[i].trim();
  if(!line)continue;
  if(/^(artikel(?:nummer)?|material(?:nummer)?)\b/i.test(line)&&/\b(menge|anzahl|qty)\b/i.test(line))continue;
  const cleaned=line.replace(/\s*[;|]\s*/g,'\t').replace(/\t+/g,'\t');
  let parts=cleaned.includes('\t')?cleaned.split('\t').map(x=>x.trim()).filter(Boolean):cleaned.split(/\s+/);
  const dateAtStart=normalizeExtractedDate(parts[0]||'').iso;
  if(dateAtStart)parts.shift();
  const article=parts.shift()||'';
  let qty=NaN,desc='';
  if(parts.length){
   const firstQty=toQty(parts[0]);
   const lastQty=toQty(parts[parts.length-1]);
   if(Number.isFinite(firstQty)){
    qty=firstQty;desc=parts.slice(1).join(' ');
   }else if(Number.isFinite(lastQty)){
    qty=lastQty;desc=parts.slice(0,-1).join(' ');
   }
  }
  if(!article||!Number.isFinite(qty)||qty<=0){
   errors.push({line:i+1,article_no:article,error:'Artikelnummer oder Menge konnte nicht erkannt werden.'});
   continue;
  }
  out.push({article_no:article,quantity:qty,description:desc,line:i+1});
 }
 out.errors=errors;
 return out;
}
function matchItems(items){
 const matched=(items||[]).map(x=>{
  const a=rows('SELECT id,article_no,description FROM articles WHERE article_no=?',[x.article_no])[0];
  return {...x,article_id:a?.id||0,description:a?.description||x.description||'',found:!!a};
 });
 return {items:matched.filter(x=>x.found),unknown:matched.filter(x=>!x.found),errors:[]};
}
function recordMaterialCreationMovement(articleId,quantity,d={}){
 const aid=Number(articleId);if(!aid)return null;
 const qty=Math.max(0,Number(quantity||0));
 const technician=d.technician||setting('primary_technician','Techniker');
 const machine=d.machine||machineRelationRows(aid).map(x=>x.name).join(', ');
 run(`INSERT INTO movements(movement_date,movement_type,article_id,quantity,customer,technician,note,source,created_at,vehicle,machine,delivery_note) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
  [d.movement_date||today(),'IN',aid,qty,'',technician,d.note||'Neues Material angelegt – Anfangsbestand',d.source||'Materialanlage',stamp(),d.vehicle||'',machine,'']);
 const id=Number(scalar('SELECT last_insert_rowid()')||0);
 const movement=rows('SELECT * FROM movements WHERE id=?',[id])[0];
 const snapshot=movementAuditSnapshot(movement||{id,article_id:aid,movement_type:'IN',quantity:qty,...d,technician,machine});
 audit(snapshot.technician,'BUCHUNG','Buchung',String(id),createdMovementDetails(snapshot));
 return snapshot;
}

function bookItems(items,type,d){
 const booked=[];
 for(const x of items){
  const aid=Number(x.article_id)||rows('SELECT id FROM articles WHERE article_no=?',[x.article_no])[0]?.id;
  if(!aid)throw Error('Unbekannter Artikel: '+(x.article_no||''));
  const qty=Number(x.quantity);
  if(!(qty>0))continue;
  if(type==='OUT'){
   const a=articles().find(z=>z.id===aid);
   if(a&&qty>a.stock)throw Error(`Nicht genügend Bestand für ${a.article_no}. Verfügbar: ${a.stock}`)
  }
  run(`INSERT INTO movements(movement_date,movement_type,article_id,quantity,customer,technician,note,source,created_at,vehicle,machine,delivery_note) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
   [d.movement_date||today(),type,aid,qty,d.customer||'',d.technician||setting('primary_technician','Techniker'),d.note||'',d.source||'App',stamp(),d.vehicle||'',d.machine||'',d.delivery_note||'']);
  const id=Number(scalar('SELECT last_insert_rowid()')||0);
  const movement=rows('SELECT * FROM movements WHERE id=?',[id])[0];
  const snapshot=movementAuditSnapshot(movement||{id,article_id:aid,movement_type:type,quantity:qty,...d});
  audit(snapshot.technician,'BUCHUNG','Buchung',String(id),createdMovementDetails(snapshot));
  booked.push(snapshot);
 }
 return booked;
}
function auditValue(value){
 if(value===null||value===undefined||value==='')return '—';
 return String(value);
}
function movementTypeLabel(value){return value==='IN'?'Einbuchung':'Entnahme'}
function movementAuditSnapshot(movement){
 const article=rows('SELECT article_no,description FROM articles WHERE id=?',[movement.article_id])[0]||{};
 return {
  id:Number(movement.id),
  movement_date:movement.movement_date||'',
  movement_type:movement.movement_type||'',
  article_id:Number(movement.article_id)||0,
  article_no:article.article_no||movement.article_no||'',
  description:article.description||movement.description||'',
  quantity:Number(movement.quantity)||0,
  customer:movement.customer||'',
  technician:movement.technician||'',
  vehicle:movement.vehicle||'',
  machine:movement.machine||'',
  delivery_note:movement.delivery_note||'',
  note:movement.note||'',
  source:movement.source||'',
  created_at:movement.created_at||''
 };
}
function createdMovementDetails(snapshot){
 return [
  `Buchung #${snapshot.id}`,
  '',
  `Buchungsdatum: ${auditValue(snapshot.movement_date)}`,
  `Buchungsart: ${movementTypeLabel(snapshot.movement_type)}`,
  `Artikel-ID: ${auditValue(snapshot.article_id)}`,
  `Artikelnummer: ${auditValue(snapshot.article_no)}`,
  `Bezeichnung: ${auditValue(snapshot.description)}`,
  `Menge: ${auditValue(snapshot.quantity)}`,
  `Kunde: ${auditValue(snapshot.customer)}`,
  `Techniker: ${auditValue(snapshot.technician)}`,
  `Fahrzeug: ${auditValue(snapshot.vehicle)}`,
  `Maschine: ${auditValue(snapshot.machine)}`,
  `Lieferschein: ${auditValue(snapshot.delivery_note)}`,
  `Quelle: ${auditValue(snapshot.source)}`,
  `Bemerkung: ${auditValue(snapshot.note)}`,
  `Erfasst am: ${auditValue(snapshot.created_at)}`
 ].join('\n');
}

function backfillMovementAuditV55(){
 if(setting('audit_movement_backfill_v55','')==='1')return;
 try{
  let added=0;
  const movements=rows('SELECT * FROM movements ORDER BY id');
  for(const movement of movements){
   const id=String(movement.id);
   const exists=Number(scalar("SELECT COUNT(*) FROM audit_log WHERE action='BUCHUNG' AND entity='Buchung' AND entity_id=?",[id])||0)>0;
   if(exists)continue;
   const snapshot=movementAuditSnapshot(movement);
   audit(snapshot.technician||'Techniker','BUCHUNG','Buchung',id,createdMovementDetails(snapshot));
   added++;
  }
  setSetting('audit_movement_backfill_v55','1');
  if(added)audit('System','MIGRATION','Audit','',`${added} bestehende Buchung(en) mit vollständigen Buchungsdetails nachgetragen.`);
 }catch(e){console.warn('Audit-Migration übersprungen, Anwendung bleibt betriebsbereit:',e)}
}

function detailedMovementChanges(before,after){
 const lines=[`Buchung #${before.id} korrigiert`];
 const add=(label,oldValue,newValue)=>{
  if(String(oldValue??'')!==String(newValue??'')){
   lines.push('',`${label}:`,`Alt: ${auditValue(oldValue)}`,`Neu: ${auditValue(newValue)}`);
  }
 };
 add('Buchungsdatum',before.movement_date,after.movement_date);
 add('Buchungsart',movementTypeLabel(before.movement_type),movementTypeLabel(after.movement_type));
 add('Artikelnummer',before.article_no,after.article_no);
 add('Bezeichnung',before.description,after.description);
 add('Menge',before.quantity,after.quantity);
 add('Kunde',before.customer,after.customer);
 add('Techniker',before.technician,after.technician);
 add('Fahrzeug',before.vehicle,after.vehicle);
 add('Maschine',before.machine,after.machine);
 add('Lieferschein',before.delivery_note,after.delivery_note);
 add('Bemerkung',before.note,after.note);
 add('Quelle',before.source,after.source);
 if(lines.length===1)lines.push('','Keine inhaltliche Änderung erkannt.');
 return lines.join('\n');
}
function deletedMovementDetails(snapshot){
 return [
  `Buchung #${snapshot.id} gelöscht`,
  '',
  `Datum: ${auditValue(snapshot.movement_date)}`,
  `Buchungsart: ${movementTypeLabel(snapshot.movement_type)}`,
  `Artikelnummer: ${auditValue(snapshot.article_no)}`,
  `Bezeichnung: ${auditValue(snapshot.description)}`,
  `Menge: ${auditValue(snapshot.quantity)}`,
  `Kunde: ${auditValue(snapshot.customer)}`,
  `Techniker: ${auditValue(snapshot.technician)}`,
  `Fahrzeug: ${auditValue(snapshot.vehicle)}`,
  `Maschine: ${auditValue(snapshot.machine)}`,
  `Lieferschein: ${auditValue(snapshot.delivery_note)}`,
  `Quelle: ${auditValue(snapshot.source)}`,
  `Bemerkung: ${auditValue(snapshot.note)}`
 ].join('\n');
}

function normalizeTextValue(value){return String(value||'').trim().toLowerCase()}
function possibleDuplicateMovements(payload){
 const type=payload.movement_type||'IN';
 const date=payload.movement_date||today();
 const customer=normalizeTextValue(payload.customer);
 const machine=normalizeTextValue(payload.machine);
 const result=[];
 for(const item of payload.items||[]){
  const aid=Number(item.article_id)||rows('SELECT id FROM articles WHERE article_no=?',[item.article_no])[0]?.id;
  const qty=Number(item.quantity);
  if(!aid||!(qty>0))continue;
  const matches=rows(`SELECT m.id,m.movement_date,m.movement_type,m.quantity,m.customer,m.machine,m.technician,m.source,
   a.article_no,a.description
   FROM movements m JOIN articles a ON a.id=m.article_id
   WHERE m.movement_type=? AND m.movement_date=? AND m.article_id=? AND ABS(m.quantity-?)<0.0000001
   ORDER BY m.id DESC`,[type,date,aid,qty]).filter(x=>
    (!customer||normalizeTextValue(x.customer)===customer) &&
    (!machine||normalizeTextValue(x.machine)===machine)
   );
  result.push(...matches);
 }
 return result;
}
function stockWithoutMovement(articleId,movementId){
 const initial=Number(scalar('SELECT initial_stock FROM articles WHERE id=?',[articleId])||0);
 const incoming=Number(scalar("SELECT COALESCE(SUM(quantity),0) FROM movements WHERE article_id=? AND movement_type='IN' AND id<>?",[articleId,movementId])||0);
 const outgoing=Number(scalar("SELECT COALESCE(SUM(quantity),0) FROM movements WHERE article_id=? AND movement_type='OUT' AND id<>?",[articleId,movementId])||0);
 return initial+incoming-outgoing;
}

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
 if(items.length>995)throw Error('Maximal 995 Positionen sind mit der großen Vorlage möglich.');

 // Preserve the visible order from the material-request screen.
 items.sort((a,b)=>a.first_position-b.first_position);

 if(typeof ExcelJS==='undefined'){
  throw Error('Excel-Exportbibliothek konnte nicht geladen werden. Bitte Internetverbindung prüfen und die Seite neu laden.');
 }

 // 2. Load the original template as a normal workbook.
 const useLargeTemplate=items.length>25;
 const templateFile=useLargeTemplate?'materialanforderung_vorlage_lang.xlsx':'materialanforderung_vorlage.xlsx';
 const templateResponse=await nativeFetch(templateFile);
 if(!templateResponse.ok){
  throw Error(`Excel-Vorlage ${templateFile} konnte nicht geladen werden.`);
 }
 const templateBuffer=await templateResponse.arrayBuffer();

 const workbook=new ExcelJS.Workbook();
 await workbook.xlsx.load(templateBuffer);

 const worksheet=useLargeTemplate
  ?(workbook.getWorksheet('Materialanforderung')||workbook.worksheets[0])
  :(workbook.getWorksheet('Tabelle1')||workbook.worksheets[1]);
 if(!worksheet)throw Error('Exportblatt wurde in der gewählten Excel-Vorlage nicht gefunden.');
 const technician=String(d.technician||setting('primary_technician','Techniker')).trim();
 const exportDate=new Date();exportDate.setHours(0,0,0,0);
 if(useLargeTemplate){
  worksheet.getCell('D1').value=technician;
  worksheet.getCell('F1').value=exportDate;worksheet.getCell('F1').numFmt='dd.mm.yyyy';
  for(let row=4;row<=998;row++){
   worksheet.getCell(`A${row}`).value=row-3;
   worksheet.getCell(`B${row}`).value=null;worksheet.getCell(`C${row}`).value=null;
   worksheet.getCell(`D${row}`).value=null;worksheet.getCell(`F${row}`).value=null;
  }
  items.forEach((x,index)=>{
   const row=4+index;
   worksheet.getCell(`A${row}`).value=index+1;
   worksheet.getCell(`B${row}`).value=x.quantity;worksheet.getCell(`B${row}`).numFmt='0.##';
   worksheet.getCell(`C${row}`).value=String(x.article_no);worksheet.getCell(`C${row}`).numFmt='@';
   worksheet.getCell(`D${row}`).value=String(x.description);
  });
 }else{
  worksheet.getCell('F1').value=technician;
  worksheet.getCell('H1').value=exportDate;worksheet.getCell('H1').numFmt='dd.mm.yyyy';
  for(let row=4;row<=28;row++){
   worksheet.getCell(`B${row}`).value=null;worksheet.getCell(`C${row}`).value=null;
   worksheet.getCell(`F${row}`).value=null;worksheet.getCell(`H${row}`).value=null;
  }
  items.forEach((x,index)=>{
   const row=4+index;
   worksheet.getCell(`B${row}`).value=x.quantity;worksheet.getCell(`B${row}`).numFmt='0.##';
   worksheet.getCell(`C${row}`).value=String(x.article_no);worksheet.getCell(`C${row}`).numFmt='@';
   worksheet.getCell(`F${row}`).value=String(x.description);
  });
 }
 // Avoid recalculation warnings; there are no formulas in the written area.
 workbook.calcProperties.fullCalcOnLoad=false;
 workbook.calcProperties.forceFullCalc=false;
 workbook.calcProperties.calcMode='auto';

 // 4. Generate a structurally valid XLSX through ExcelJS.
 const generated=await workbook.xlsx.writeBuffer();

 // 5. Self-test: open the generated workbook again and verify every value.
 const verificationWorkbook=new ExcelJS.Workbook();
 await verificationWorkbook.xlsx.load(generated);
 const verificationSheet=useLargeTemplate
  ?(verificationWorkbook.getWorksheet('Materialanforderung')||verificationWorkbook.worksheets[0])
  :(verificationWorkbook.getWorksheet('Tabelle1')||verificationWorkbook.worksheets[1]);

 if(!verificationSheet){
  throw Error('Interne Exportprüfung fehlgeschlagen: Exportblatt fehlt.');
 }

 const verifyErrors=[];
 const technicianCell=useLargeTemplate?'D1':'F1';
 const descriptionColumn=useLargeTemplate?'D':'F';
 const dateCell=useLargeTemplate?'F1':'H1';
 const preparedRowCount=useLargeTemplate?995:25;

 const exportedTechnician=String(verificationSheet.getCell(technicianCell).value??'').trim();
 const requestedTechnician=String(
  d.technician||setting('primary_technician','Techniker')
 ).trim();

 if(exportedTechnician!==requestedTechnician){
  verifyErrors.push(`Technikername wurde nicht korrekt übernommen (${technicianCell}).`);
 }

 const exportedDate=verificationSheet.getCell(dateCell).value;
 if(!exportedDate){
  verifyErrors.push(`Exportdatum wurde nicht korrekt übernommen (${dateCell}).`);
 }

 items.forEach((x,index)=>{
  const row=4+index;
  const exportedQty=Number(verificationSheet.getCell(`B${row}`).value);
  const exportedNo=String(verificationSheet.getCell(`C${row}`).value??'').trim();
  const exportedDescription=String(
   verificationSheet.getCell(`${descriptionColumn}${row}`).value??''
  ).trim();

  if(exportedQty!==Number(x.quantity)){
   verifyErrors.push(`Position ${index+1}: Menge ${exportedQty} statt ${x.quantity}.`);
  }
  if(exportedNo!==String(x.article_no)){
   verifyErrors.push(`Position ${index+1}: Artikelnummer ${exportedNo} statt ${x.article_no}.`);
  }
  if(exportedDescription!==String(x.description)){
   verifyErrors.push(`Position ${index+1}: Bezeichnung stimmt nicht überein (${descriptionColumn}${row}).`);
  }
 });

 // Ensure no unintended data remains below the exported rows.
 for(let index=items.length;index<preparedRowCount;index++){
  const row=4+index;
  const values=[
   verificationSheet.getCell(`B${row}`).value,
   verificationSheet.getCell(`C${row}`).value,
   verificationSheet.getCell(`${descriptionColumn}${row}`).value
  ];
  if(values.some(v=>v!==null&&v!==undefined&&String(v)!=='')){
   verifyErrors.push(`Position ${index+1}: Alte Zellinhalte wurden nicht vollständig entfernt.`);
   break;
  }
 }

 if(verifyErrors.length){
  throw Error('Interne Prüfung der gewählten Excel-Vorlage fehlgeschlagen:\n• '+verifyErrors.join('\n• '));
 }

 return {
  blob:new Blob(
   [generated],
   {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
  ),
  count:items.length,
  items:items.map(({first_position,...x})=>x),
  template_type:useLargeTemplate?'large':'standard'
 };
}

function normalizeExtractedDate(value){
 const raw=String(value||'').trim();
 if(!raw)return {iso:'',display:''};
 let m=raw.match(/\b(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})\b/);
 if(m){
  const day=String(Number(m[1])).padStart(2,'0');
  const month=String(Number(m[2])).padStart(2,'0');
  return {iso:`${m[3]}-${month}-${day}`,display:`${day}.${month}.${m[3]}`};
 }
 m=raw.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
 if(m){
  const month=String(Number(m[2])).padStart(2,'0');
  const day=String(Number(m[3])).padStart(2,'0');
  return {iso:`${m[1]}-${month}-${day}`,display:`${day}.${month}.${m[1]}`};
 }
 return {iso:'',display:raw};
}

function parseServiceTsv(text){
 const lines=importContentLines(text).split('\n').map(x=>x.trimEnd()).filter(x=>x.trim());
 const items=[];
 const errors=[];
 const rows=[];
 let firstMetadata={movement_date:'',display_date:'',customer:'',machine:'',machine_input:'',machine_id:0,machine_suggestions:[]};
 const toQty=v=>Number(String(v||'').replace(',','.'));

 for(let i=0;i<lines.length;i++){
  const normalizedLine=lines[i].replace(/\s*[;|]\s*/g,'\t');
  if(!normalizedLine.includes('\t'))continue;
  const cols=normalizedLine.split('\t').map(x=>x.trim()).filter(x=>x!=='');

  const normalized=cols.map(x=>x.toLowerCase().replace(/\s+/g,' '));
  if(
   normalized[0]?.includes('datum') &&
   normalized[1]?.includes('artikel') &&
   (normalized.some(x=>x.includes('anzahl'))||normalized.some(x=>x.includes('menge')))
  ) continue;

  if(cols.length<5){
   errors.push({line:i+1,article_no:cols[1]||'',error:'Zeile enthält zu wenige Spalten.'});
   continue;
  }

  const dateValue=cols[0];
  const articleNo=cols[1];
  let description='',quantityValue='',customerValue='',machineValue='';

  // Neues Format: Datum | Artikel | Bezeichnung | Anzahl | Kunde | Maschine
  if(cols.length>=6 && !Number.isFinite(toQty(cols[2])) && Number.isFinite(toQty(cols[3]))){
   description=cols[2];
   quantityValue=cols[3];
   customerValue=cols[4];
   machineValue=cols.slice(5).join(' ');
  }else{
   // Rückwärtskompatibel: Datum | Artikel | Anzahl | Kunde | Maschine
   quantityValue=cols[2];
   customerValue=cols[3];
   machineValue=cols.slice(4).join(' ');
  }

  const parsedDate=normalizeExtractedDate(dateValue);
  const qty=toQty(quantityValue);
  const article=String(articleNo||'').trim();

  if(!article)continue;

  const lowerArticle=article.toLowerCase();
  const combined=cols.join(' ').toLowerCase();
  if(
   lowerArticle.includes('fahrzeit') ||
   lowerArticle.includes('arbeitszeit') ||
   lowerArticle.includes('kilometer') ||
   combined.includes('fahrzeit') ||
   combined.includes('arbeitszeit') ||
   combined.includes('kilometer')
  ) continue;

  if(!Number.isFinite(qty)||qty<=0){
   errors.push({line:i+1,article_no:article,error:'Anzahl fehlt oder ist ungültig.'});
   continue;
  }

  const rowMeta={
   movement_date:parsedDate.iso,
   display_date:parsedDate.display,
   customer:String(customerValue||'').trim(),
   machine:String(machineValue||'').trim()
  };
  rows.push({article_no:article,description:String(description||'').trim(),quantity:qty,line:i+1,metadata:rowMeta});
  items.push({article_no:article,description:String(description||'').trim(),quantity:qty,line:i+1});

  if(!firstMetadata.movement_date&&rowMeta.movement_date)firstMetadata.movement_date=rowMeta.movement_date;
  if(!firstMetadata.display_date&&rowMeta.display_date)firstMetadata.display_date=rowMeta.display_date;
  if(!firstMetadata.customer&&rowMeta.customer)firstMetadata.customer=rowMeta.customer;
  if(!firstMetadata.machine&&rowMeta.machine)firstMetadata.machine=rowMeta.machine;
 }

 return {matched:rows.length>0,items,metadata:firstMetadata,rows,errors};
}


function machineCandidates(){
 const canonical=rows('SELECT id,name FROM machines WHERE active=1').map(x=>({match_name:x.name,canonical_name:x.name,machine_id:Number(x.id),alias:false}));
 const aliases=rows(`SELECT ma.alias,m.id,m.name FROM machine_aliases ma JOIN machines m ON m.id=ma.machine_id WHERE ma.active=1 AND m.active=1`)
  .map(x=>({match_name:x.alias,canonical_name:x.name,machine_id:Number(x.id),alias:true}));
 return [...canonical,...aliases].sort((a,b)=>b.match_name.length-a.match_name.length);
}
function normalizeLoose(value){
 return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9.]+/g,' ').replace(/\s+/g,' ').trim();
}
function splitCustomerAndMachine(remainder){
 const source=String(remainder||'').trim();
 if(!source)return {customer:'',machine:'',machine_input:''};
 const normalized=normalizeLoose(source);
 for(const candidate of machineCandidates()){
  const nc=normalizeLoose(candidate.match_name);if(!nc)continue;
  if(normalized===nc)return {customer:'',machine:candidate.canonical_name,machine_input:candidate.match_name,machine_id:candidate.machine_id,via_alias:candidate.alias};
  if(normalized.endsWith(' '+nc)){
   const words=source.split(/\s+/),count=candidate.match_name.split(/\s+/).length;
   return {customer:words.slice(0,-count).join(' '),machine:candidate.canonical_name,machine_input:words.slice(-count).join(' '),machine_id:candidate.machine_id,via_alias:candidate.alias};
  }
 }
 const keywords=/\b(compas|croissomat|rondostar|rondinette|ecostar|brotstar|polyline|kombi|smc|sko|croissantwickler|teigteiler)\b/i;
 const words=source.split(/\s+/),index=words.findIndex(word=>keywords.test(word));
 if(index>=0){
  const rawMachine=words.slice(index).join(' '),resolved=resolveMachineName(rawMachine);
  return {customer:words.slice(0,index).join(' '),machine:resolved.machine_id?resolved.name:rawMachine,machine_input:rawMachine,machine_id:resolved.machine_id||0,via_alias:!!resolved.via_alias,suggestions:resolved.suggestions||[]};
 }
 return {customer:source,machine:'',machine_input:''};
}
function parseFlexibleServiceRows(text){
 const lines=importContentLines(text).split('\n');
 const items=[],rowsOut=[],errors=[];
 let firstMetadata={movement_date:'',display_date:'',customer:'',machine:'',machine_input:'',machine_id:0,machine_suggestions:[]};
 for(let i=0;i<lines.length;i++){
  const line=lines[i].trim();
  if(!line)continue;
  if(/^(datum|date)\b/i.test(line)&&/\b(artikel|material)\b/i.test(line))continue;
  const m=line.match(/^(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{4}|\d{4}-\d{1,2}-\d{1,2})[\t ;|]+([A-Za-z0-9._\/-]+)[\t ;|]+(\d+(?:[.,]\d+)?)[\t ;|]+(.+)$/);
  if(!m)continue;
  const parsedDate=normalizeExtractedDate(m[1]);
  const article=m[2].trim();
  const qty=Number(m[3].replace(',','.'));
  const rest=splitCustomerAndMachine(m[4]);
  if(!Number.isFinite(qty)||qty<=0){
   errors.push({line:i+1,article_no:article,error:'Anzahl fehlt oder ist ungültig.'});
   continue;
  }
  const metadata={movement_date:parsedDate.iso,display_date:parsedDate.display,customer:rest.customer,machine:rest.machine,machine_input:rest.machine_input||rest.machine,machine_id:rest.machine_id||0,machine_suggestions:rest.suggestions||[]};
  items.push({article_no:article,quantity:qty,line:i+1});
  rowsOut.push({article_no:article,quantity:qty,line:i+1,metadata});
  if(!firstMetadata.movement_date)firstMetadata.movement_date=metadata.movement_date;
  if(!firstMetadata.display_date)firstMetadata.display_date=metadata.display_date;
  if(!firstMetadata.customer)firstMetadata.customer=metadata.customer;
  if(!firstMetadata.machine)firstMetadata.machine=metadata.machine;if(!firstMetadata.machine_input)firstMetadata.machine_input=metadata.machine_input;if(!firstMetadata.machine_id)firstMetadata.machine_id=metadata.machine_id;if(!firstMetadata.machine_suggestions.length&&metadata.machine_suggestions?.length)firstMetadata.machine_suggestions=metadata.machine_suggestions;
 }
 return {matched:rowsOut.length>0,items,rows:rowsOut,metadata:firstMetadata,errors};
}

function parseServiceReport(text){
 const tsv=parseServiceTsv(text);
 if(tsv.matched)return {items:tsv.items,metadata:tsv.metadata,rows:tsv.rows,errors:tsv.errors};
 const flexible=parseFlexibleServiceRows(text);
 if(flexible.matched)return {items:flexible.items,metadata:flexible.metadata,rows:flexible.rows,errors:flexible.errors};
 const raw=String(text||'').replace(/\r/g,'');
 const lines=raw.split('\n');
 const metadata={movement_date:'',display_date:'',customer:'',machine:''};
 const items=[];
 const errors=[];
 let pendingArticle='';
 let pendingLine=0;

 const pushItem=(article,quantity,line)=>{
  const no=String(article||'').trim();
  const qty=Number(String(quantity||'').replace(',','.'));
  if(!no)return;
  if(!Number.isFinite(qty)||qty<=0){
   errors.push({line,article_no:no,error:'Menge fehlt oder ist ungültig.'});
   return;
  }
  items.push({article_no:no,quantity:qty,line});
 };

 for(let i=0;i<lines.length;i++){
  const original=lines[i];
  const line=original.trim();
  if(!line)continue;
  let m;

  if((m=line.match(/^(?:datum|date|einsatzdatum)\s*[:\-]\s*(.+)$/i))){
   const parsed=normalizeExtractedDate(m[1]);
   metadata.movement_date=parsed.iso;
   metadata.display_date=parsed.display;
   continue;
  }
  if((m=line.match(/^(?:kunde|customer|kundename)\s*[:\-]\s*(.*)$/i))){
   metadata.customer=m[1].trim();
   continue;
  }
  if((m=line.match(/^(?:maschine|machine|anlage|maschinentyp)\s*[:\-]\s*(.*)$/i))){
   metadata.machine=m[1].trim();
   continue;
  }
  if((m=line.match(/^(?:artikelnummer|artikel[- ]?nr\.?|materialnummer|material[- ]?nr\.?)\s*[:\-]\s*([A-Za-z0-9._\/-]+)(?:\s+(?:menge|qty|anzahl)\s*[:\-]?\s*([\d.,]+))?$/i))){
   if(pendingArticle)errors.push({line:pendingLine,article_no:pendingArticle,error:'Menge fehlt.'});
   pendingArticle=m[1].trim();
   pendingLine=i+1;
   if(m[2]){
    pushItem(pendingArticle,m[2],i+1);
    pendingArticle='';
   }
   continue;
  }
  if((m=line.match(/^(?:menge|qty|anzahl)\s*[:\-]\s*([\d.,]+)$/i))){
   if(pendingArticle){
    pushItem(pendingArticle,m[1],pendingLine||i+1);
    pendingArticle='';
   }else{
    errors.push({line:i+1,article_no:'',error:'Menge ohne vorherige Artikelnummer.'});
   }
   continue;
  }

  // Compact formats: "7079 2", "7079;2" or "Artikelnummer: 7079; Menge: 2"
  m=line.match(/^(?:artikelnummer\s*[:\-]\s*)?([A-Za-z0-9._\/-]+)\s*[;,\t ]+\s*(?:menge\s*[:\-]?\s*)?(\d+(?:[.,]\d+)?)$/i);
  if(m){
   if(pendingArticle)errors.push({line:pendingLine,article_no:pendingArticle,error:'Menge fehlt.'});
   pendingArticle='';
   pushItem(m[1],m[2],i+1);
   continue;
  }
 }
 if(pendingArticle)errors.push({line:pendingLine,article_no:pendingArticle,error:'Menge fehlt.'});

 // Backward-compatible fallback for older two-column Copilot output.
 if(!items.length){
  const legacy=parseLines(raw);
  for(const x of legacy)items.push(x);
 }
 return {items,metadata,errors};
}

async function route(url,opt={}){
 await ready;const u=new URL(url,location.href);if(!u.pathname.startsWith('/api/'))return nativeFetch(url,opt);const p=u.pathname,q=Object.fromEntries(u.searchParams),d=body(opt);
 try{
 if(opt.method!=='POST'){
  if(p==='/api/info')return response({version:'59.0',articles:scalar('SELECT COUNT(*) FROM articles WHERE active=1'),movements:scalar('SELECT COUNT(*) FROM movements'),setup_required:setupIsRequired(),date_format:setting('date_format','DD.MM.YYYY')});
  if(p==='/api/setup/status')return response({setup_required:setupIsRequired(),date_format:setting('date_format','DD.MM.YYYY'),technician:setting('primary_technician','')});
  if(p==='/api/admin/password-status'){const has=!!setting('admin_password_hash');return response({setup_required:!has,password_setup_required:!has,has_password:has,can_unlock:has,database_setup_required:setupIsRequired()})};
  if(p==='/api/settings')return response({date_format:setting('date_format','DD.MM.YYYY'),date_formats:['DD.MM.YYYY','YYYY-MM-DD','MM/DD/YYYY']});
  if(p==='/api/masterdata/similar'){
   const type=q.type==='location'?'location':'machine';return response({suggestions:type==='machine'?machineSuggestions(q.q||'',5):similarMasterNames(type,q.q||'',5)});
  }
  if(p==='/api/masterdata')return response({locations:rows('SELECT * FROM locations WHERE active=1 ORDER BY name'),machines:rows('SELECT * FROM machines WHERE active=1 ORDER BY name'),machine_aliases:rows(`SELECT ma.id,ma.alias,ma.machine_id,m.name machine_name FROM machine_aliases ma JOIN machines m ON m.id=ma.machine_id WHERE ma.active=1 ORDER BY m.name,ma.alias`),machine_merges:rows(`SELECT h.id,h.source_machine_id,h.target_machine_id,h.source_name,h.merged_at,t.name target_name FROM machine_merge_history h JOIN machines t ON t.id=h.target_machine_id WHERE h.active=1 ORDER BY h.id DESC`),technicians:rows('SELECT * FROM technicians WHERE active=1 ORDER BY name'),vehicles:rows('SELECT * FROM vehicles WHERE active=1 ORDER BY name')});
  if(p==='/api/articles')return response(articles(q.q||''));
  if(p==='/api/dashboard'){const a=articles().filter(x=>x.active);const low=a.filter(x=>x.stock<x.minimum_stock).sort((x,y)=>(y.minimum_stock-y.stock)-(x.minimum_stock-x.stock)).slice(0,8);const recent=rows('SELECT m.id,m.movement_date,m.movement_type,a.article_no,a.description,m.quantity,m.technician,m.customer,m.machine FROM movements m JOIN articles a ON a.id=m.article_id ORDER BY m.id DESC LIMIT 20');const top=rows("SELECT a.article_no,a.description,SUM(m.quantity) quantity FROM movements m JOIN articles a ON a.id=m.article_id WHERE m.movement_type='OUT' GROUP BY a.id ORDER BY quantity DESC LIMIT 8");return response({articles:a.length,low_stock:low.length,today:scalar('SELECT COUNT(*) FROM movements WHERE movement_date=?',[today()]),movements:scalar('SELECT COUNT(*) FROM movements'),stock_value:a.reduce((s,x)=>s+x.stock*x.purchase_price,0),low_stock_items:low,recent,top_out:top})}
  if(p==='/api/material-request')return response(articles().filter(x=>x.active&&x.stock<x.target_stock).map(x=>({...x,suggested_quantity:Math.max(0,x.target_stock-x.stock)})));
  if(p==='/api/recent-movements'){const type=q.type==='OUT'?'OUT':'IN';return response(rows(`SELECT m.*,a.article_no,a.description FROM movements m JOIN articles a ON a.id=m.article_id WHERE m.movement_type=? ORDER BY m.id DESC LIMIT 20`,[type]))}
 if(p==='/api/history'){
  let list=rows('SELECT m.*,a.article_no,a.description FROM movements m JOIN articles a ON a.id=m.article_id ORDER BY m.movement_date DESC,m.id DESC');
  if(q.type&&q.type!=='ALL')list=list.filter(x=>x.movement_type===q.type);
  if(q.date_from)list=list.filter(x=>x.movement_date>=q.date_from);
  if(q.date_to)list=list.filter(x=>x.movement_date<=q.date_to);
  if(q.technician)list=list.filter(x=>normalizeTextValue(x.technician).includes(normalizeTextValue(q.technician)));
  if(q.customer)list=list.filter(x=>normalizeTextValue(x.customer).includes(normalizeTextValue(q.customer)));
  if(q.article_no)list=list.filter(x=>normalizeTextValue(x.article_no).includes(normalizeTextValue(q.article_no)));
  if(q.description)list=list.filter(x=>normalizeTextValue(x.description).includes(normalizeTextValue(q.description)));
  if(q.machine)list=list.filter(x=>normalizeTextValue(x.machine).includes(normalizeTextValue(q.machine)));
  return response(list)
 }
  if(p==='/api/audit')return response(rows('SELECT * FROM audit_log ORDER BY id DESC'));
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
 
 if(p==='/api/movements/duplicates'){
  return response({duplicates:possibleDuplicateMovements(d),count:possibleDuplicateMovements(d).length});
 }
 if(p==='/api/movement/update'){
  if(!adminAuthorized(d,opt)&&!validPw(d.password||''))throw Error('Administratorpasswort ist falsch.');
  const id=Number(d.id);
  const old=rows('SELECT * FROM movements WHERE id=?',[id])[0];
  if(!old)throw Error('Buchung wurde nicht gefunden.');
  const before=movementAuditSnapshot(old);
  const articleId=Number(d.article_id);
  const quantity=Number(d.quantity);
  if(!articleId||!(quantity>0))throw Error('Artikel und Menge müssen gültig sein.');
  const article=rows('SELECT id,article_no FROM articles WHERE id=?',[articleId])[0];
  if(!article)throw Error('Der ausgewählte Artikel existiert nicht mehr.');

  const affected=[...new Set([Number(old.article_id),articleId])];
  for(const aid of affected){
   let base=stockWithoutMovement(aid,id);
   if(aid===articleId)base+=(d.movement_type==='IN'?quantity:-quantity);
   if(base< -0.0000001){
    const no=scalar('SELECT article_no FROM articles WHERE id=?',[aid])||aid;
    throw Error(`Die Korrektur würde für Artikel ${no} einen negativen Bestand erzeugen.`);
   }
  }

  await createBackup('Sicherheitsbackup','Vor Buchungskorrektur');
  run(`UPDATE movements SET movement_date=?,movement_type=?,article_id=?,quantity=?,customer=?,technician=?,
   note=?,vehicle=?,machine=?,delivery_note=?,source=? WHERE id=?`,[
    d.movement_date||today(),d.movement_type==='OUT'?'OUT':'IN',articleId,quantity,
    d.customer||'',d.technician||'',d.note||'',d.vehicle||'',d.machine||'',
    d.delivery_note||'',old.source||'App',id
  ]);
  const changed=rows('SELECT * FROM movements WHERE id=?',[id])[0];
  const after=movementAuditSnapshot(changed);
  audit('Administrator','KORREKTUR','Buchung',String(id),detailedMovementChanges(before,after));
  await persist();
  return response({ok:true,id});
 }
 if(p==='/api/movement/delete'){
  if(!adminAuthorized(d,opt)&&!validPw(d.password||''))throw Error('Administratorpasswort ist falsch.');
  const id=Number(d.id);
  const old=rows(`SELECT m.*,a.article_no,a.description FROM movements m
   JOIN articles a ON a.id=m.article_id WHERE m.id=?`,[id])[0];
  if(!old)throw Error('Buchung wurde nicht gefunden.');
  const snapshot=movementAuditSnapshot(old);
  const resulting=stockWithoutMovement(Number(old.article_id),id);
  if(resulting< -0.0000001)throw Error('Diese Buchung kann nicht gelöscht werden, weil dadurch ein negativer Lagerbestand entstehen würde.');
  await createBackup('Sicherheitsbackup','Vor Buchungslöschung');
  run('DELETE FROM movements WHERE id=?',[id]);
  audit('Administrator','LÖSCHUNG','Buchung',String(id),deletedMovementDetails(snapshot));
  await persist();
  return response({ok:true,id});
 }

 if(p==='/api/movements'){bookItems(d.items||[d],d.movement_type||'IN',d);await persist();return response({ok:true,count:(d.items||[d]).length},201)}
 if(p==='/api/delivery-note/preview'||p==='/api/import/preview'){
  if(p==='/api/delivery-note/preview'){
   const declared=detectDeclaredImportType(d.text);
   if(declared==='ENTNAHME'||(!declared&&looksLikeServiceImport(d.text))){
    return response({wrong_import_type:true,error:'Entnahme-Daten erkannt. Bitte diese Ausgabe im Bereich „Entnahme – Servicebericht M365/Copilot“ einfügen.',items:[],unknown:[],errors:[]});
   }
  }
  const parsed=parseLines(d.text);
  const matched=matchItems(parsed);
  return response({...matched,errors:[...(matched.errors||[]),...(parsed.errors||[])]});
 }
 if(p==='/api/service-report/preview'){
  const declared=detectDeclaredImportType(d.text);
  if(declared==='EINBUCHUNG'||(!declared&&looksLikeDeliveryImport(d.text))){
   return response({wrong_import_type:true,error:'Einbuchungs-Daten erkannt. Bitte diese Ausgabe im Bereich „Einbuchung – Lieferschein M365“ einfügen.',items:[],unknown:[],errors:[],metadata:{}});
  }
  const parsed=parseServiceReport(d.text);
  if(parsed.metadata?.machine){
   const original=parsed.metadata.machine_input||parsed.metadata.machine;
   const resolved=resolveMachineName(original);
   parsed.metadata.machine_input=original;
   parsed.metadata.machine_suggestions=resolved.suggestions||[];
   parsed.metadata.machine_match=resolved;
   if(resolved.machine_id){parsed.metadata.machine=resolved.name;parsed.metadata.machine_id=resolved.machine_id}
  }
  const matched=matchItems(parsed.items);
  return response({...matched,metadata:parsed.metadata,rows:parsed.rows,errors:[...(matched.errors||[]),...(parsed.errors||[])]})
 }
 if(p==='/api/delivery-note/commit'){await createBackup('Sicherheitsbackup','Vor Lieferschein-Einbuchung');bookItems(d.items,'IN',{...d,source:'Lieferschein'});await persist();return response({ok:true,count:d.items.length})}
 if(p==='/api/service-report/commit'){
  let machine=String(d.machine||'').trim();
  let machineCreated=false;
  if(machine){
   const resolved=resolveMachineName(machine);
   if(resolved.machine_id)machine=resolved.name;
   else if(d.create_machine_if_missing){
    run('INSERT INTO machines(name,description,active) VALUES(?,?,1)',[machine,'Automatisch aus Servicebericht angelegt']);
    machineCreated=true;audit(d.technician||'Techniker','ANLAGE','machine','',machine+' – aus Servicebericht');
   }
  }
  bookItems(d.items,'OUT',{...d,machine,source:'Servicebericht'});
  await persist();
  return response({ok:true,count:d.items.length,machine_created:machineCreated,machine});
 }
 if(p==='/api/import/commit'){await createBackup('Sicherheitsbackup','Vor Import');bookItems(d.items,'IN',{...d,source:'SAP-CSV-Import'});await persist();return response({ok:true,count:d.items.length})}
 if(p==='/api/import/file-preview'){const rr=await xlsxRows(d.filename,d.content_base64);return response(matchItems(rowsToItems(rr)))}
 if(p==='/api/inventory/file-preview'){const rr=await xlsxRows(d.filename,d.content_base64);const parsed=rowsToItems(rr).map(x=>({article_no:x.article_no,counted_stock:x.quantity}));return response(parsed.map(x=>{const a=articles().find(z=>z.article_no===x.article_no);return a?{article_id:a.id,article_no:a.article_no,description:a.description,system_stock:a.stock,counted_stock:x.counted_stock,difference:x.counted_stock-a.stock}:null}).filter(Boolean))}
 if(p==='/api/inventory/preview'){const parsed=parseLines(d.text).map(x=>({article_no:x.article_no,counted_stock:x.quantity}));return response(parsed.map(x=>{const a=articles().find(z=>z.article_no===x.article_no);return a?{article_id:a.id,article_no:a.article_no,description:a.description,system_stock:a.stock,counted_stock:x.counted_stock,difference:x.counted_stock-a.stock}:null}).filter(Boolean))}
 if(p==='/api/inventory/commit'){await createBackup('Sicherheitsbackup','Vor Inventur');if(!adminAuthorized(d,opt))throw Error('Passwort ist falsch oder die Stammdaten sind nicht freigeschaltet.');let changed=0,unchanged=0;for(const x of d.items){const a=articles().find(z=>z.id===Number(x.article_id));const diff=Number(x.counted_stock)-a.stock;if(Math.abs(diff)<1e-8){unchanged++;continue}bookItems([{article_id:a.id,quantity:Math.abs(diff)}],diff>0?'IN':'OUT',{...d,source:'Inventur',note:'Inventurkorrektur'});changed++}audit(d.technician,'INVENTUR','Bestand','',`${changed} Korrekturen`);await persist();return response({ok:true,changed,unchanged})}
 if(p==='/api/material-request/preview'){const x=await materialXlsx(d);return response({count:x.count,items:x.items,template_type:x.template_type})}
 if(p==='/api/export/material-request'){const x=await materialXlsx(d);const tech=(d.technician||'Techniker').replace(/[^\wÄÖÜäöüß-]+/g,'_');return response(x.blob,200,{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':`attachment; filename="Bestellung_${fmtDate(today())}_${tech}.xlsx"`})}
 if(p==='/api/machine/alias'){
  if(!adminAuthorized(d,opt))throw Error('Stammdaten sind nicht freigeschaltet.');
  const machineId=Number(d.machine_id),alias=String(d.alias||'').trim();if(!machineId||!alias)throw Error('Maschine und Bezeichnung fehlen.');
  const machine=rows('SELECT id,name FROM machines WHERE id=? AND active=1',[machineId])[0];if(!machine)throw Error('Maschine nicht gefunden.');
  if(normalizeLoose(machine.name)===normalizeLoose(alias))throw Error('Diese Bezeichnung entspricht bereits dem Hauptnamen.');
  const canonical=rows('SELECT id,name FROM machines WHERE active=1').find(x=>normalizeLoose(x.name)===normalizeLoose(alias));
  if(canonical)throw Error(`„${alias}“ ist bereits als eigene Maschine „${canonical.name}“ angelegt. Bitte bei Bedarf die Funktion „Maschinen zusammenführen“ verwenden.`);
  const existing=rows('SELECT id,alias,machine_id FROM machine_aliases WHERE active=1').find(x=>normalizeLoose(x.alias)===normalizeLoose(alias));
  if(existing)throw Error('Diese alternative Bezeichnung ist bereits zugeordnet.');
  run('INSERT INTO machine_aliases(alias,machine_id,active,created_at) VALUES(?,?,1,?)',[alias,machineId,stamp()]);
  audit('Administrator','ALIAS','Maschine',String(machineId),`Alternative Bezeichnung „${alias}“ → ${machine.name}`);await persist();return response({ok:true,alias,machine_id:machineId},201)
 }
 if(p==='/api/machine/alias/delete'){
  if(!adminAuthorized(d,opt))throw Error('Stammdaten sind nicht freigeschaltet.');
  const alias=rows(`SELECT ma.id,ma.alias,ma.machine_id,m.name machine_name FROM machine_aliases ma JOIN machines m ON m.id=ma.machine_id WHERE ma.id=?`,[Number(d.id)])[0];
  if(!alias)throw Error('Alternative Bezeichnung wurde nicht gefunden.');
  run('DELETE FROM machine_aliases WHERE id=?',[alias.id]);audit('Administrator','TRENNUNG','Maschine',String(alias.machine_id),`Alternative Bezeichnung „${alias.alias}“ von ${alias.machine_name} getrennt.`);await persist();return response({ok:true})
 }
 if(p==='/api/machine/merge'){
  if(!adminAuthorized(d,opt))throw Error('Stammdaten sind nicht freigeschaltet.');
  const sourceId=Number(d.source_id),targetId=Number(d.target_id);if(!sourceId||!targetId||sourceId===targetId)throw Error('Bitte zwei unterschiedliche Maschinen auswählen.');
  const source=rows('SELECT * FROM machines WHERE id=? AND active=1',[sourceId])[0],target=rows('SELECT * FROM machines WHERE id=? AND active=1',[targetId])[0];
  if(!source||!target)throw Error('Eine der Maschinen ist nicht mehr aktiv.');
  const snap={sourceArticleIds:rows('SELECT article_id FROM article_machines WHERE machine_id=?',[sourceId]).map(x=>Number(x.article_id)),targetArticleIds:rows('SELECT article_id FROM article_machines WHERE machine_id=?',[targetId]).map(x=>Number(x.article_id)),sourceAliases:rows('SELECT id,alias FROM machine_aliases WHERE machine_id=?',[sourceId]).map(x=>({id:Number(x.id),alias:x.alias}))};
  run('BEGIN TRANSACTION');
  try{
   run('INSERT INTO machine_merge_history(source_machine_id,target_machine_id,source_name,snapshot_json,merged_at,active) VALUES(?,?,?,?,?,1)',[sourceId,targetId,source.name,JSON.stringify(snap),stamp()]);
   for(const aid of snap.sourceArticleIds)run('INSERT OR IGNORE INTO article_machines(article_id,machine_id) VALUES(?,?)',[aid,targetId]);
   run('DELETE FROM article_machines WHERE machine_id=?',[sourceId]);
   run('UPDATE machine_aliases SET machine_id=? WHERE machine_id=?',[targetId,sourceId]);
   if(!exactMachineResolution(source.name)?.via_alias)run('INSERT OR IGNORE INTO machine_aliases(alias,machine_id,active,created_at) VALUES(?,?,1,?)',[source.name,targetId,stamp()]);
   run('UPDATE machines SET active=0 WHERE id=?',[sourceId]);
   for(const aid of [...new Set([...snap.sourceArticleIds,...snap.targetArticleIds])])syncLegacyArticleMachine(aid);
   run('COMMIT');
  }catch(e){try{run('ROLLBACK')}catch{};throw e}
  audit('Administrator','ZUSAMMENFÜHRUNG','Maschine',String(targetId),`„${source.name}“ wurde unter „${target.name}“ zusammengeführt. Der bisherige Name bleibt als Alias erhalten.`);await persist();return response({ok:true})
 }
 if(p==='/api/machine/merge/undo'){
  if(!adminAuthorized(d,opt))throw Error('Stammdaten sind nicht freigeschaltet.');
  const h=rows('SELECT * FROM machine_merge_history WHERE id=? AND active=1',[Number(d.id)])[0];if(!h)throw Error('Aktive Zusammenführung nicht gefunden.');
  const snap=JSON.parse(h.snapshot_json||'{}'),sourceId=Number(h.source_machine_id),targetId=Number(h.target_machine_id);
  run('BEGIN TRANSACTION');
  try{
   run('UPDATE machines SET active=1 WHERE id=?',[sourceId]);
   run('DELETE FROM machine_aliases WHERE machine_id=? AND LOWER(alias)=LOWER(?)',[targetId,h.source_name]);
   for(const a of (snap.sourceAliases||[]))run('UPDATE machine_aliases SET machine_id=? WHERE id=?',[sourceId,Number(a.id)]);
   const targetBefore=new Set((snap.targetArticleIds||[]).map(Number));
   for(const aid of (snap.sourceArticleIds||[]).map(Number)){
    run('INSERT OR IGNORE INTO article_machines(article_id,machine_id) VALUES(?,?)',[aid,sourceId]);
    if(!targetBefore.has(aid))run('DELETE FROM article_machines WHERE article_id=? AND machine_id=?',[aid,targetId]);
    syncLegacyArticleMachine(aid);
   }
   run('UPDATE machine_merge_history SET active=0 WHERE id=?',[h.id]);run('COMMIT');
  }catch(e){try{run('ROLLBACK')}catch{};throw e}
  audit('Administrator','TRENNUNG','Maschine',String(sourceId),`Zusammenführung von „${h.source_name}“ wurde rückgängig gemacht.`);await persist();return response({ok:true})
 }
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
 if(p==='/api/article/create'){
  if(!adminAuthorized(d,opt))throw Error('Stammdaten sind nicht freigeschaltet.');
  if(!String(d.article_no||'').trim())throw Error('Artikelnummer fehlt.');
  if(!String(d.description||'').trim())throw Error('Bezeichnung fehlt.');
  if(Number(scalar('SELECT COUNT(*) FROM articles WHERE article_no=?',[String(d.article_no).trim()])||0)>0)throw Error('Diese Artikelnummer ist bereits registriert.');
  const enteredInitial=Math.max(0,Number(d.initial_stock||0));
  run(`INSERT INTO articles(article_no,description,target_stock,minimum_stock,initial_stock,unit,location,machine,active,created_at,manufacturer,supplier,supplier_article_no,barcode,purchase_price,notes,image_url,datasheet_url) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
   [d.article_no,d.description,Number(d.target_stock||0),Number(d.minimum_stock||0),0,d.unit||'Stk.',d.location||'',d.machine||'',d.active===false?0:1,stamp(),d.manufacturer||'',d.supplier||'',d.supplier_article_no||'',d.barcode||'',Number(d.purchase_price||0),d.notes||'',d.image_url||'',d.datasheet_url||'']);
  const id=Number(scalar('SELECT last_insert_rowid()')||0);
  const selectedMachines=setArticleMachineIds(id,Array.isArray(d.machine_ids)?d.machine_ids:(d.machine?[d.machine]:[]));
  const creationMovement=recordMaterialCreationMovement(id,enteredInitial,{technician:d.technician||setting('primary_technician','Techniker'),machine:selectedMachines.join(', '),source:'Materialanlage',note:'Neues Material angelegt – Anfangsbestand'});
  audit(d.technician||setting('primary_technician','Techniker'),'ANLAGE','Artikel',String(id),[
   `Artikelnummer: ${auditValue(d.article_no)}`,
   `Bezeichnung: ${auditValue(d.description)}`,
   `Anfangsbestand: ${auditValue(enteredInitial)}`,
   `Sollbestand: ${auditValue(Number(d.target_stock||0))}`,
   `Mindestbestand: ${auditValue(Number(d.minimum_stock||0))}`,
   `Einheit: ${auditValue(d.unit||'Stk.')}`,
   `Lagerort: ${auditValue(d.location)}`,
   `Maschinen: ${auditValue(selectedMachines.join(', '))}`,
   `Hersteller: ${auditValue(d.manufacturer)}`,
   `Lieferant: ${auditValue(d.supplier)}`,
   `Lieferanten-Artikelnummer: ${auditValue(d.supplier_article_no)}`,
   `Barcode: ${auditValue(d.barcode)}`,
   `Einkaufspreis: ${auditValue(Number(d.purchase_price||0))}`,
   `Bemerkung: ${auditValue(d.notes)}`,
   `Aktiv: ${d.active===false?'Nein':'Ja'}`
  ].join('\n'));
  await persist();
  return response({ok:true,id,article_no:d.article_no,movement_id:creationMovement?.id||0},201)
 }
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
    run('UPDATE articles SET article_no=?,description=?,target_stock=?,minimum_stock=?,unit=?,location=?,active=? WHERE id=?',[
      String(x.article_no||'').trim(),String(x.description||'').trim(),normalizeQuantityForUnit(x.target_stock,x.unit),normalizeQuantityForUnit(x.minimum_stock,x.unit),String(x.unit||'Stk.').trim()||'Stk.',String(x.location||''),x.active?1:0,Number(x.id)
    ]);
    setArticleMachineIds(Number(x.id),Array.isArray(x.machine_ids)?x.machine_ids:(x.machine?[x.machine]:[]));
    const diff=normalizeQuantityForUnit(x.current_stock,x.unit)-Number(a.stock);
    if(Math.abs(diff)>1e-8){bookItems([{article_id:a.id,quantity:Math.abs(diff)}],diff>0?'IN':'OUT',{source:'Bestandskorrektur Stammdaten',note:'Istbestand über Sammelspeicherung geändert'});corrected++}
    updated++;
   }
   run('COMMIT');
  }catch(e){try{run('ROLLBACK')}catch{};throw e}
  audit('Techniker','SAMMELÄNDERUNG','Artikel','',`${updated} Artikel gespeichert, ${corrected} Bestandskorrekturen`);
  await persist();return response({ok:true,updated,corrected})
 }
 
 if(p==='/api/article/delete'){
  if(!adminAuthorized(d,opt))throw Error('Stammdaten sind nicht freigeschaltet.');
  const id=Number(d.id);
  const article=rows('SELECT * FROM articles WHERE id=?',[id])[0];
  if(!article)throw Error('Artikel wurde nicht gefunden.');
  const movementCount=Number(scalar('SELECT COUNT(*) FROM movements WHERE article_id=?',[id])||0);
  if(movementCount>0&&!d.force){
   return response({ok:false,requires_force:true,movement_count:movementCount,
    message:`Zu diesem Artikel bestehen ${movementCount} Buchungen.`},409);
  }
  await createBackup('Sicherheitsbackup','Vor Artikellöschung');
  if(movementCount>0)run('DELETE FROM movements WHERE article_id=?',[id]);
  run('DELETE FROM articles WHERE id=?',[id]);
  audit('Administrator','LÖSCHUNG','Artikel',String(id),
   `${article.article_no} – ${article.description}; ${movementCount} zugehörige Buchung(en) entfernt`);
  await persist();
  return response({ok:true,id,movement_count:movementCount});
 }

 if(p==='/api/article/update'){
  if(!adminAuthorized(d,opt))throw Error('Stammdaten sind nicht freigeschaltet.');
  const a=articles().find(x=>x.id===Number(d.id));if(!a)throw Error('Artikel wurde nicht gefunden.');
  run('UPDATE articles SET article_no=?,description=?,target_stock=?,minimum_stock=?,unit=?,location=?,active=?,manufacturer=?,supplier=?,supplier_article_no=?,barcode=?,purchase_price=?,notes=?,image_url=?,datasheet_url=? WHERE id=?',[d.article_no,d.description,Number(d.target_stock||0),Number(d.minimum_stock||0),d.unit||'Stk.',d.location||'',d.active?1:0,d.manufacturer||a.manufacturer,d.supplier||a.supplier,d.supplier_article_no||a.supplier_article_no,d.barcode||a.barcode,Number(d.purchase_price??a.purchase_price),d.notes||a.notes,d.image_url||a.image_url,d.datasheet_url||a.datasheet_url,Number(d.id)]);
  const machines=setArticleMachineIds(Number(d.id),Array.isArray(d.machine_ids)?d.machine_ids:(d.machine?[d.machine]:[]));
  const diff=Number(d.current_stock)-a.stock;if(Math.abs(diff)>1e-8)bookItems([{article_id:a.id,quantity:Math.abs(diff)}],diff>0?'IN':'OUT',{source:'Bestandskorrektur Stammdaten',note:'Istbestand geändert'});
  audit('Techniker','ÄNDERUNG','Artikel',a.id,`Artikel ${d.article_no}; Lagerort ${d.location||'—'}; Maschinen ${machines.join(', ')||'—'}`);await persist();return response({ok:true})
 }
 if(p==='/api/articles/stock-to-levels'){if(!adminAuthorized(d,opt))throw Error('Passwort ist falsch oder die Stammdaten sind nicht freigeschaltet.');for(const a of articles().filter(x=>x.active)){if(d.mode==='target'||d.mode==='both')run('UPDATE articles SET target_stock=? WHERE id=?',[a.stock,a.id]);if(d.mode==='minimum'||d.mode==='both')run('UPDATE articles SET minimum_stock=? WHERE id=?',[a.stock,a.id])}await persist();return response({ok:true,count:articles().length})}
 if(p==='/api/articles/create-import'||p==='/api/import/create-and-book'){if(!adminAuthorized(d,opt))throw Error('Stammdaten sind nicht freigeschaltet.');let created=0,booked=0,skipped=[];for(const x of d.items||[]){let a=rows('SELECT id FROM articles WHERE article_no=?',[x.article_no])[0];if(!a&&x.description){const enteredInitial=Math.max(0,Number(x.initial_stock||0));run('INSERT INTO articles(article_no,description,target_stock,minimum_stock,initial_stock,unit,location,machine,active,created_at) VALUES(?,?,?,?,?,?,?,?,1,?)',[x.article_no,x.description,Number(x.target_stock||0),Number(x.minimum_stock||0),0,x.unit||'Stk.',x.location||'',x.machine||'',stamp()]);a={id:scalar('SELECT last_insert_rowid()')};const machineNames=setArticleMachineIds(Number(a.id),Array.isArray(x.machine_ids)?x.machine_ids:(x.machine?[x.machine]:[]));recordMaterialCreationMovement(Number(a.id),enteredInitial,{technician:d.technician||setting('primary_technician','Techniker'),machine:machineNames.join(', '),source:'Materialanlage / Import',note:'Neues Material über Import angelegt – Anfangsbestand'});created++}else if(!a){skipped.push({article_no:x.article_no,reason:'Bezeichnung fehlt'});continue}if(p==='/api/import/create-and-book'&&Number(x.quantity)>0){bookItems([{article_id:a.id,quantity:Number(x.quantity)}],'IN',{...d,source:'SAP-XLSX/CSV-Import'});booked++}}await persist();return response({ok:true,created,booked,skipped},201)}
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

 // Der aktuelle lokale Stand wird nach erfolgreichem Schreiben selbst zur neuen Cloud-Basis.
 setSyncValue('cloud_base_revision_id',local.revision_id);
 setSyncValue('cloud_base_revision',String(local.revision));
 const bytes=db.export();
 const fh=await handle.getFileHandle('lager.db',{create:true}),w=await fh.createWritable();
 await w.write(bytes);await w.close();
 const f=await fh.getFile();
 await ip(DBKEY,bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
 m.dirty=false;
 m.lastSync=Date.now();
 m.fileModified=f.lastModified;
 m.expectedCloudRevisionId=local.revision_id;
 m.expectedCloudDatabaseId=local.database_id;
 m.lastCloudRevision=local.revision;
 m.lastCloudRevisionId=local.revision_id;
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
 setSyncValue('cloud_base_revision_id',cloud.state.revision_id);
 setSyncValue('cloud_base_revision',String(cloud.state.revision));
 await ip(DBKEY,db.export().buffer);
 const m=await ig(METAKEY)||{};
 m.dirty=false;
 m.lastSync=Date.now();
 m.fileModified=cloud.modified;
 m.localModified=cloud.state.changed_at||cloud.modified;
 m.expectedCloudRevisionId=cloud.state.revision_id;
 m.expectedCloudDatabaseId=cloud.state.database_id;
 m.lastCloudRevision=cloud.state.revision;
 m.lastCloudRevisionId=cloud.state.revision_id;
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


const MATERIAL_REQUEST_FOLDER_KEY='material-request-folder-handle';

function inspectExternalDatabase(bytes){
 const test=new SQL.Database(new Uint8Array(bytes));
 try{
  if(test.exec('PRAGMA quick_check')[0]?.values?.[0]?.[0]!=='ok')throw Error('Backup ist beschädigt.');
  const hasTable=name=>!!test.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${String(name).replaceAll("'","''")}'`)[0];
  if(!hasTable('articles')||!hasTable('movements'))throw Error('Die Datei ist keine gültige Lagerdatenbank.');
  const count=table=>{
   const r=test.exec(`SELECT COUNT(*) FROM ${table}`);
   return Number(r[0]?.values?.[0]?.[0]||0);
  };
  let revision='';
  if(hasTable('sync_state')){
   const r=test.exec("SELECT value FROM sync_state WHERE key='revision' LIMIT 1");
   revision=String(r[0]?.values?.[0]?.[0]||'');
  }
  return {article_count:count('articles'),movement_count:count('movements'),revision};
 }finally{test.close()}
}

window.LVBackupFile={
 async inspect(buffer){
  await ready;
  return inspectExternalDatabase(buffer);
 },
 async restore(buffer,meta={}){
  await ready;
  if(sessionStorage.admin!=='1')throw Error('Administratorbereich ist in dieser Sitzung nicht freigeschaltet.');
  const info=inspectExternalDatabase(buffer);
  await createBackup('Sicherheitsbackup','Vor manuell geladenem Backup');
  const test=new SQL.Database(new Uint8Array(buffer));
  const restoredState=stateFromDatabase(test);
  db.close();db=test;initSchema();adoptExistingDatabase();
  audit('Administrator','WIEDERHERSTELLUNG','Backup',meta.file_name||'',
   `Backup manuell geladen\nDatei: ${meta.file_name||'Unbekannt'}\nRevision: ${info.revision||'—'}\nDatum: ${meta.file_date||new Date().toLocaleString('de-DE')}`);
  await ip(DBKEY,db.export().buffer);
  const m=await ig(METAKEY)||{};
  m.dirty=true;
  m.localModified=restoredState.changed_at||Date.now();
  m.restorePending=true;
  m.writeBlocked=true;
  m.restoreBackupName=meta.file_name||'Manuell geladene Datei';
  await ip(METAKEY,m);
  return {...info,state:restoredState};
 }
};

window.LVMaterialRequestFolder={
 async get(){
  await ready;
  const h=await ig(MATERIAL_REQUEST_FOLDER_KEY)||null;
  return {connected:!!h,folder:h?.name||''};
 },
 async choose(){
  await ready;
  if(!('showDirectoryPicker'in window))throw Error('Dieser Browser unterstützt keine direkte Ordnerauswahl.');
  const old=await ig(MATERIAL_REQUEST_FOLDER_KEY)||null;
  const selected=await showDirectoryPicker({mode:'readwrite'});
  if(!await permission(selected,'readwrite'))throw Error('Schreibberechtigung wurde nicht erteilt.');
  await ip(MATERIAL_REQUEST_FOLDER_KEY,selected);
  audit('Administrator','EINSTELLUNG','Materialanforderung Exportordner','',
   `Exportordner Materialanforderung geändert\nAlt: ${old?.name||'Downloads'}\nNeu: ${selected.name}`);
  await persist(false);
  return {ok:true,folder:selected.name};
 },
 async reset(){
  await ready;
  const old=await ig(MATERIAL_REQUEST_FOLDER_KEY)||null;
  await idel(MATERIAL_REQUEST_FOLDER_KEY);
  audit('Administrator','EINSTELLUNG','Materialanforderung Exportordner','',
   `Exportordner Materialanforderung geändert\nAlt: ${old?.name||'Downloads'}\nNeu: Downloads`);
  await persist(false);
  return {ok:true};
 },
 async save(bytes,fileName,mime='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
  await ready;
  const h=await ig(MATERIAL_REQUEST_FOLDER_KEY)||null;
  if(!h)return {saved:false};
  if(!await permission(h,'readwrite'))throw Error('Zugriff auf den Exportordner wurde nicht erteilt.');
  const fh=await h.getFileHandle(fileName,{create:true});
  const writable=await fh.createWritable();
  await writable.write(new Blob([bytes],{type:mime}));
  await writable.close();
  return {saved:true,folder:h.name};
 }
};


window.LVBackup={
 async manual(){try{const x=await createBackup('Manuell',backupComment.value.trim());backupComment.value='';msg(backupMsg,'Backup erstellt: '+x.name,true);await this.refresh()}catch(e){msg(backupMsg,e.message,false)}},
 async refresh(){await ready;const list=await getBackupIndex();if(!window.backupRows)return;backupRows.innerHTML=list.map(x=>`<tr><td>${new Date(x.created).toLocaleString('de-DE')}</td><td>${x.kind}</td><td>${x.comment||'–'}</td><td>${(x.size/1024).toLocaleString('de-DE',{maximumFractionDigits:1})} KB</td><td><button class="secondary" onclick="LVBackup.restore('${x.name.replaceAll("'","\\'")}')">Wiederherstellen</button> <button class="secondary" onclick="LVBackup.download('${x.name.replaceAll("'","\\'")}')">Herunterladen</button> <button class="danger" onclick="LVBackup.remove('${x.name.replaceAll("'","\\'")}')">Löschen</button></td></tr>`).join('')||'<tr><td colspan="5">Noch keine Backups</td></tr>'},
 async restore(name){
  if(sessionStorage.admin!=='1'){msg(backupMsg,'Bitte zuerst den Administratorbereich in dieser Sitzung freischalten.',false);return}
  if(!confirm('Diesen Datenstand lokal wiederherstellen? Vorher wird ein Sicherheitsbackup des aktuellen lokalen Stands erstellt. Die Cloud-Datei wird noch nicht verändert.'))return;
  try{
   const result=await restoreBackup(name);
   audit('Administrator','WIEDERHERSTELLUNG','Backup',name,
    `Automatisches Backup geladen\nBackup: ${name}\nRevision: ${result.state?.revision??'—'}`);
   await persist(false);
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
    const local=currentDbState();
    const safeBase=cloud.accessible&&local.database_id===cloud.state.database_id&&(
     m.expectedCloudRevisionId===cloud.state.revision_id||
     local.cloud_base_revision_id===cloud.state.revision_id||
     (local.parent_revision_id===cloud.state.revision_id&&local.revision===Number(cloud.state.revision||0)+1)
    );
    if(safeBase&&m.expectedCloudRevisionId!==cloud.state.revision_id){
     m.expectedCloudRevisionId=cloud.state.revision_id;
     m.expectedCloudDatabaseId=cloud.state.database_id;
     m.writeBlocked=false;
     await ip(METAKEY,m);
    }
    await saveToFolder(!silent,false);
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
  const local=currentDbState();
  let cloudRevision=m.lastCloudRevision===undefined?null:Number(m.lastCloudRevision);
  if(mode==='cloud'&&handle){
   const c=await inspectCloudDatabase();
   if(c.accessible){
    cloudRevision=Number(c.state.revision||0);
    m.lastCloudRevision=cloudRevision;
    m.lastCloudRevisionId=c.state.revision_id;
    await ip(METAKEY,m);
   }
  }
  return {mode,configuredMode:mode,connected:!!handle,folder:handle?.name||'',dirty:!!m.dirty,lastSync:Number(m.lastSync||0),localRevision:Number(local.revision||0),cloudRevision,autoSync:mode==='cloud'&&!!handle};
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
   const sameDatabase=local.database_id===c.state.database_id;
   const expectedMatches=m.expectedCloudRevisionId===c.state.revision_id;
   const storedBaseMatches=local.cloud_base_revision_id===c.state.revision_id;
   const directParentMatches=local.parent_revision_id===c.state.revision_id&&local.revision===Number(c.state.revision||0)+1;

   if(sameDatabase&&local.revision_id===c.state.revision_id){
    comparison='identical';

    // Selbstheilung: Nach einem Browser-/Gerätestart können IndexedDB-Metadaten
    // fehlen, obwohl lokale DB und Cloud exakt dieselbe Revision besitzen.
    if(m.expectedCloudRevisionId!==c.state.revision_id ||
       m.expectedCloudDatabaseId!==c.state.database_id ||
       m.dirty || m.writeBlocked){
     m.expectedCloudRevisionId=c.state.revision_id;
     m.expectedCloudDatabaseId=c.state.database_id;
     m.lastCloudRevision=Number(c.state.revision||0);
     m.lastCloudRevisionId=c.state.revision_id;
     m.dirty=false;
     m.writeBlocked=false;
     setSyncValue('cloud_base_revision_id',c.state.revision_id);
     setSyncValue('cloud_base_revision',String(c.state.revision||0));
     await ip(DBKEY,db.export().buffer);
     await ip(METAKEY,m);
    }
   }else if(!sameDatabase){
    comparison='conflict';
   }else if(c.state.revision>local.revision){
    comparison=m.dirty?'conflict':'cloud_newer';
   }else if(local.revision>c.state.revision){
    comparison=(expectedMatches||storedBaseMatches||directParentMatches)
      ?'local_newer_safe'
      :'local_newer_unverified';
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
   localRevision:Number(local.revision||0),
   localDirty:!!m.dirty,
   cloudConnected:!!c.connected,
   cloudAccessible:!!c.accessible,
   cloudModified:Number(c.modified||0),
   cloudFile:c.file||'',
   localRevisionId:local.revision_id,
   localDatabaseId:local.database_id,
   cloudRevisionLabel:c.state?`${c.state.revision} · ${c.state.revision_id.slice(0,8)}`:'–',
   cloudRevision:c.state?Number(c.state.revision||0):null,
   cloudRevisionId:c.state?c.state.revision_id:'',
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
   const safe=local.database_id===c.state.database_id&&(
    m.expectedCloudRevisionId===c.state.revision_id||
    local.cloud_base_revision_id===c.state.revision_id||
    (local.parent_revision_id===c.state.revision_id&&local.revision===Number(c.state.revision||0)+1)
   );
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
  setSetting('database_version','59');
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
