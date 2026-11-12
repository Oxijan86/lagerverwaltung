(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.LVHelpCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
 function extractCodeBlocks(markdown){
  const blocks=[];
  const text=String(markdown||'').replace(/```([^\n`]*)\n([\s\S]*?)```/g,(_m,_lang,code)=>{
   const normalized=code.endsWith('\n')?code.slice(0,-1):code;
   const token=`@@LV_CODE_${blocks.length}@@`;
   blocks.push(normalized);
   return `\n\n${token}\n\n`;
  });
  return {text,blocks};
 }
 function inlineFormat(text){
  return esc(text)
   .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
   .replace(/`([^`\n]+)`/g,'<code>$1</code>');
 }
 function renderOutsideCode(text){
  const lines=String(text||'').split('\n');
  const out=[];let paragraph=[];let list=[];let listType='';
  const flushP=()=>{if(paragraph.length){out.push(`<p>${paragraph.map(inlineFormat).join('<br>')}</p>`);paragraph=[]}};
  const flushList=()=>{if(list.length){out.push(`<${listType}>`+list.map(x=>`<li>${inlineFormat(x)}</li>`).join('')+`</${listType}>`);list=[];listType=''}};
  for(const line of lines){
   const trimmed=line.trim();
   if(/^@@LV_CODE_\d+@@$/.test(trimmed)){flushP();flushList();out.push(trimmed);continue}
   const heading=trimmed.match(/^(#{1,3})\s+(.*)$/);
   if(heading){flushP();flushList();out.push(`<h${heading[1].length}>${inlineFormat(heading[2])}</h${heading[1].length}>`);continue}
   const ordered=line.match(/^\s*\d+[.)]\s+(.*)$/);
   const unordered=line.match(/^\s*[-*]\s+(.*)$/);
   if(ordered||unordered){
    flushP();const type=ordered?'ol':'ul';if(listType && listType!==type)flushList();
    listType=type;list.push((ordered||unordered)[1]);continue;
   }
   if(!trimmed){flushP();flushList();continue}
   flushList();paragraph.push(line);
  }
  flushP();flushList();return out.join('\n');
 }

 function renderMarkdown(markdown){
  const {text,blocks}=extractCodeBlocks(markdown);
  let rendered=renderOutsideCode(text);
  blocks.forEach((code,i)=>{
   const token=`@@LV_CODE_${i}@@`;
   const block=`<div class="prompt-box"><pre class="prompt-pre"><code class="prompt-code">${esc(code)}</code></pre><div class="toolbar prompt-actions"><button class="secondary" type="button" onclick="markPromptCode(this)">Prompt markieren</button><button class="secondary" type="button" onclick="copyPromptCode(this)">Prompt kopieren</button><span class="small prompt-copy-status" aria-live="polite"></span></div></div>`;
   rendered=rendered.replace(token,block);
  });
  return `<div class="help-content">${rendered}</div>`;
 }
 function normalizeQuery(value){return String(value||'').toLocaleLowerCase('de-DE').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim()}
 function filterTopics(topics,query){const q=normalizeQuery(query);return !q?[...(topics||[])]:[...(topics||[])].filter(x=>normalizeQuery(String((x.title||'')+'\n'+(x.content||''))).includes(q));}
 return {extractCodeBlocks,renderMarkdown,filterTopics};
});
