(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.LVAuthCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const ITERATIONS=210000;
 function cryptoObj(){return globalThis.crypto||require('node:crypto').webcrypto}
 function bytesToB64(bytes){if(typeof Buffer!=='undefined')return Buffer.from(bytes).toString('base64');let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s)}
 function b64ToBytes(s){if(typeof Buffer!=='undefined')return new Uint8Array(Buffer.from(s,'base64'));const raw=atob(s);return Uint8Array.from(raw,c=>c.charCodeAt(0))}
 async function derive(password,salt,iterations=ITERATIONS){const c=cryptoObj();const key=await c.subtle.importKey('raw',new TextEncoder().encode(String(password)),'PBKDF2',false,['deriveBits']);const bits=await c.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations},key,256);return new Uint8Array(bits)}
 async function hashWithRandomSalt(password,{enforceLength=true}={}){if(enforceLength&&String(password).length<8)throw Error('Passwort muss mindestens 8 Zeichen haben.');const c=cryptoObj();const salt=c.getRandomValues(new Uint8Array(16));const hash=await derive(password,salt);return `pbkdf2$${ITERATIONS}$${bytesToB64(salt)}$${bytesToB64(hash)}`}
 async function hashPassword(password){return hashWithRandomSalt(password,{enforceLength:true})}
 async function hashVerifiedLegacyPassword(password){if(!String(password))throw Error('Legacy-Passwort fehlt.');return hashWithRandomSalt(password,{enforceLength:false})}
 function constantTimeEqual(a,b){if(a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a[i]^b[i];return x===0}
 async function verifyPassword(password,encoded,legacyVerifier){const value=String(encoded||'');if(value.startsWith('pbkdf2$')){const [,it,saltB64,hashB64]=value.split('$');const actual=await derive(password,b64ToBytes(saltB64),Number(it));return constantTimeEqual(actual,b64ToBytes(hashB64))}return typeof legacyVerifier==='function'&&legacyVerifier(password,value)}
 function createSessionManager(){let issued='';return {issue(){const c=cryptoObj();const b=c.getRandomValues(new Uint8Array(32));issued=bytesToB64(b);return issued},verify(token){return !!issued&&String(token||'')===issued},revoke(){issued=''},has(){return !!issued}}}
 return {ITERATIONS,hashPassword,hashVerifiedLegacyPassword,verifyPassword,createSessionManager};
});
