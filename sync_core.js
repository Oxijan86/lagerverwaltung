(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.LVSyncCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const CloudStatus=Object.freeze({
  OK:'ok',MISSING:'missing',PERMISSION_DENIED:'permission_denied',INVALID_DATABASE:'invalid_database',IO_ERROR:'io_error'
 });
 class SyncError extends Error{
  constructor(code,message,details){super(message);this.name='SyncError';this.code=code;this.details=details||null}
 }
 class CloudStorageAdapter{
  async inspect(){throw new Error('inspect() not implemented')}
  async write(_bytes,_options){throw new Error('write() not implemented')}
 }
 function resolveDeviceStorageMode({indexedMode='',legacyMode='',hasHandle=false}={}){
  const valid=new Set(['cloud','local_folder','browser_local']);
  if(valid.has(indexedMode))return indexedMode;
  if(valid.has(legacyMode))return legacyMode;
  if(hasHandle)return 'cloud';
  return 'browser_local';
 }
 async function initializeDeviceStorageMode({indexedMode='',legacyMode='',hasHandle=false,persistMode}={}){
  const mode=resolveDeviceStorageMode({indexedMode,legacyMode,hasHandle});
  if(typeof persistMode==='function'&&indexedMode!==mode)await persistMode(mode);
  return mode;
 }
 function closeSyncRequestForMode(mode){
  if(mode==='cloud')return {mode:'sync',silent:false,makeBackup:true};
  if(mode==='local_folder')return {mode:'save',silent:false,makeBackup:true,force:false,localFolder:true};
  return null;
 }
 function classifySyncState({local,cloud,meta={}}){
  if(!cloud||cloud.connected===false||cloud.status===CloudStatus.MISSING)return 'cloud_missing';
  if(cloud.status===CloudStatus.PERMISSION_DENIED)return 'permission_required';
  if(cloud.status!==CloudStatus.OK||!cloud.state)return 'cloud_unreadable';
  const cs=cloud.state;
  if(!local||local.database_id!==cs.database_id)return 'conflict';
  if(local.revision_id===cs.revision_id)return 'identical';
  const lr=Number(local.revision||0),cr=Number(cs.revision||0);
  // Gleiche Revisionsnummer mit anderer revision_id ist immer ein Parallelzweig.
  if(lr===cr)return 'conflict';
  if(cr>lr)return meta.dirty?'conflict':'cloud_newer';
  const expectedDbOk=!meta.expectedCloudDatabaseId||meta.expectedCloudDatabaseId===cs.database_id;
  const expectedMatches=expectedDbOk&&meta.expectedCloudRevisionId===cs.revision_id;
  const storedBaseMatches=local.cloud_base_revision_id===cs.revision_id;
  const directParentMatches=local.parent_revision_id===cs.revision_id&&lr===cr+1;
  if(meta.writeBlocked)return 'local_newer_unverified';
  return (expectedMatches||storedBaseMatches||directParentMatches)?'local_newer_safe':'local_newer_unverified';
 }
 function validateWriteGuard({local,cloud,meta={},force=false,allowCreateMissing=false}){
  if(!cloud)throw new SyncError('cloud_unreadable','Cloud-Zustand ist nicht verfügbar.');
  if(cloud.status===CloudStatus.PERMISSION_DENIED)throw new SyncError('permission_required','Ordnerzugriff erneut freigeben.');
  if(cloud.status===CloudStatus.INVALID_DATABASE)throw new SyncError('invalid_database','Die vorhandene Cloud-Datei ist keine gültige, intakte Lagerdatenbank und wird nicht überschrieben.');
  if(cloud.status===CloudStatus.IO_ERROR)throw new SyncError('io_error','Die vorhandene Cloud-Datei konnte nicht vollständig gelesen werden und wird nicht überschrieben.');
  if(cloud.status===CloudStatus.MISSING){
   if(force&&allowCreateMissing)return true;
   throw new SyncError('cloud_missing','Die Cloud-Datei lager.db fehlt. Sie darf nur bei der ausdrücklichen Einrichtung eines neuen, leeren Cloud-Ordners erstellt werden.');
  }
  if(cloud.status!==CloudStatus.OK||!cloud.state)throw new SyncError('cloud_unreadable','Die Cloud-Datei ist nicht sicher lesbar.');
  if(force)return true;
  if(meta.writeBlocked)throw new SyncError('write_blocked','Cloud-Schreiben ist wegen eines nicht bestätigten Konflikts gesperrt.');
  if(local.database_id!==cloud.state.database_id)throw new SyncError('database_id_conflict','Konflikt: Lokale und Cloud-Datenbank besitzen unterschiedliche database_id.');
  if(!meta.expectedCloudDatabaseId||meta.expectedCloudDatabaseId!==cloud.state.database_id)throw new SyncError('expected_database_mismatch','Konflikt: Die erwartete Cloud-database_id stimmt nicht mit der tatsächlichen Cloud-Datei überein.');
  if(!meta.expectedCloudRevisionId||meta.expectedCloudRevisionId!==cloud.state.revision_id)throw new SyncError('expected_revision_mismatch','Konflikt: Die Cloud-Datenbank wurde seit dem letzten bestätigten Stand verändert.');
  return true;
 }
 function conflictFingerprint(state={}){
  return `${state.comparison||'none'}|${state.cloudRevisionId||state.cloudStatus||'none'}`;
 }
 function shouldSuppressRepeatedConflict(state={},acknowledgedFingerprint='',forceDialog=false){
  if(forceDialog)return false;
  if(!acknowledgedFingerprint)return false;
  return acknowledgedFingerprint===conflictFingerprint(state);
 }
 function verifyWrittenState(candidateState,cloud){
  if(!cloud||cloud.status!==CloudStatus.OK||!cloud.state)throw new SyncError('postwrite_unreadable','Die geschriebene Cloud-Datei konnte nicht fehlerfrei erneut gelesen werden.');
  const c=cloud.state;
  if(c.database_id!==candidateState.database_id)throw new SyncError('postwrite_database_id','Nach dem Schreiben stimmt die database_id nicht überein.');
  if(Number(c.revision)!==Number(candidateState.revision))throw new SyncError('postwrite_revision','Nach dem Schreiben stimmt die Revision nicht überein.');
  if(c.revision_id!==candidateState.revision_id)throw new SyncError('postwrite_revision_id','Nach dem Schreiben stimmt die revision_id nicht überein.');
  return true;
 }
 async function performVerifiedWrite({adapter,local,meta={},force=false,allowCreateMissing=false,makeCandidate,backupCloud,onSuccess}){
  if(!adapter||typeof adapter.inspect!=='function'||typeof adapter.write!=='function')throw new TypeError('CloudStorageAdapter fehlt.');
  // Kandidat zuerst erzeugen; die Live-Datenbank bleibt bis zur erfolgreichen Verifikation unverändert.
  const initial=await adapter.inspect();
  validateWriteGuard({local,cloud:initial,meta,force,allowCreateMissing});
  const candidate=await makeCandidate({local,cloud:initial});
  if(!candidate||!candidate.bytes||!candidate.state)throw new SyncError('candidate_invalid','Synchronisationskandidat konnte nicht erstellt werden.');

  // Unmittelbar vor dem tatsächlichen Schreibzugriff nochmals prüfen.
  const prewrite=await adapter.inspect();
  validateWriteGuard({local,cloud:prewrite,meta,force,allowCreateMissing});
  if(force&&prewrite.status===CloudStatus.OK&&backupCloud)await backupCloud(prewrite);

  await adapter.write(candidate.bytes,{create:prewrite.status===CloudStatus.MISSING&&allowCreateMissing});
  // Nach dem Schreiben zwingend erneut lesen und prüfen.
  const verified=await adapter.inspect();
  verifyWrittenState(candidate.state,verified);
  if(onSuccess)await onSuccess({candidate,verified,prewrite});
  return {candidate,verified,prewrite};
 }
 function defaultMerge(a,b){
  if(!a)return b;if(!b)return a;
  const priority={auto:0,sync:1,save:2,force:3,initialize:4};
  const mode=(priority[b.mode]??0)>(priority[a.mode]??0)?b.mode:a.mode;
  return {...a,...b,mode,silent:!!a.silent&&!!b.silent,makeBackup:!!a.makeBackup||!!b.makeBackup};
 }
 class SyncQueue{
  constructor(worker,merge=defaultMerge){this.worker=worker;this.merge=merge;this.running=false;this.pending=null;this.waiters=[];this.maxConcurrent=0;this._concurrent=0}
  request(payload={}){
   this.pending=this.merge(this.pending,payload);
   const promise=new Promise((resolve,reject)=>this.waiters.push({resolve,reject}));
   if(!this.running)this._drain();
   return promise;
  }
  async _drain(){
   if(this.running)return;
   this.running=true;
   try{
    while(this.pending){
     const payload=this.pending;this.pending=null;
     const waiters=this.waiters.splice(0);
     try{
      this._concurrent++;this.maxConcurrent=Math.max(this.maxConcurrent,this._concurrent);
      const result=await this.worker(payload);
      this._concurrent--;
      waiters.forEach(w=>w.resolve(result));
     }catch(e){
      this._concurrent=Math.max(0,this._concurrent-1);
      waiters.forEach(w=>w.reject(e));
     }
    }
   }finally{
    this.running=false;
    // Falls exakt im finally-Fenster eine neue Anforderung kam, sofort nachlaufen.
    if(this.pending)this._drain();
   }
  }
 }
 return {CloudStatus,SyncError,CloudStorageAdapter,resolveDeviceStorageMode,initializeDeviceStorageMode,closeSyncRequestForMode,classifySyncState,validateWriteGuard,verifyWrittenState,performVerifiedWrite,SyncQueue,defaultMerge,conflictFingerprint,shouldSuppressRepeatedConflict};
});
