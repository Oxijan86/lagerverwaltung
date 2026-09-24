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
  const out=[];let paragraph=[];let list=[];
  const flushP=()=>{if(paragraph.length){out.push(`<p>${paragraph.map(inlineFormat).join('<br>')}</p>`);paragraph=[]}};
  const flushList=()=>{if(list.length){out.push('<ul>'+list.map(x=>`<li>${inlineFormat(x)}</li>`).join('')+'</ul>');list=[]}};
  for(const line of lines){
   const trimmed=line.trim();
   if(/^@@LV_CODE_\d+@@$/.test(trimmed)){flushP();flushList();out.push(trimmed);continue}
   const h=trimmed.match(/^(#{1,3})\s+(.*)$/);
   if(h){flushP();flushList();out.push(`<h${h[1].length}>${inlineFormat(h[2])}</h${h[1].length}>`);continue}
   const li=line.match(/^\s*-\s+(.*)$/);
   if(li){flushP();list.push(li[1]);continue}
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
 return {extractCodeBlocks,renderMarkdown};
});
