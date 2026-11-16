/* V86: Schnellumlagerung und Fahrzeugwechsel, mit Preview + ausdruecklicher Freigabe. */
(function(){'use strict';
 const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let bins=[],history=[],rev='',refs=null,previewRows=[],expected='',busy=false;
 const options=(rows,empty,value)=>`<option value="">${empty}</option>`+rows.map(x=>`<option value="${esc(value(x))}">${esc(x.name)}</option>`).join('');
 function setOptions(el,html){const old=el.value;el.innerHTML=html;if([...el.options].some(o=>o.value===old))el.value=old;}
 function value(){return {mode:document.querySelector('input[name="bin86Mode"]:checked')?.value||'all',warehouse_id:$('bin86SourceWarehouse').value,location:$('bin86SourceLocation').value,target_warehouse_id:$('bin86TargetWarehouse').value,target_location:$('bin86TargetLocation').value,bin_id:Number($('bin86SourceBin').value),quantity:$('bin86Quantity').value,reason:$('bin86Reason').value}}
 function message(t,ok=false){const el=$('bin86Msg');if(el){el.textContent=t;el.className='message '+(ok?'ok':'error');el.style.display='block'}}
 function clearPreview(){previewRows=[];expected='';$('bin86Execute').disabled=true;$('bin86Rows').innerHTML='';$('bin86Summary').textContent='Bitte Umlagerung erneut prüfen.';}
 function filtered(){const q=String($('bin86Search').value||'').trim().toLowerCase();return bins.filter(b=>!q||[b.article_no,b.description,b.warehouse_name,b.location].some(v=>String(v||'').toLowerCase().includes(q)))}
 function renderList(){const list=filtered();$('bin86Current').innerHTML=list.slice(0,350).map(b=>`<tr><td><button class="lv83-article-link" type="button" onclick="openStockArticleV83(${b.article_id})">${esc(b.article_no)}</button></td><td>${esc(b.description)}</td><td>${esc(b.warehouse_name||'Ohne Lager')}</td><td>${esc(b.location||'Ohne Lagerort')}</td><td>${Number(b.quantity).toLocaleString('de-DE')} ${esc(b.unit)}</td></tr>`).join('')||'<tr><td colspan="5">Keine zugeordneten Bestände.</td></tr>';
  $('bin86History').textContent=history.slice(0,12).map(x=>`${x.created_at}: ${x.article_no} · ${x.quantity} · ${x.source_location||'(ohne Ort)'} → ${x.target_location||'(ohne Ort)'}`).join('\n');$('bin86History').style.whiteSpace='pre-line';}
 function places(){if(!refs)return;for(const [wid,lid,empty] of [['bin86SourceWarehouse','bin86SourceLocation','Alle Lagerorte'],['bin86TargetWarehouse','bin86TargetLocation','Ohne Lagerort']]){
  const selected=$ (wid).value;const arr=(refs.locations||[]).filter(l=>!selected||String(l.warehouse_id||'')===selected).sort((a,b)=>a.name.localeCompare(b.name,'de'));
  setOptions($(lid),options(arr,empty,x=>x.name));
 }
 const source=$('bin86SourceWarehouse').value,loc=$('bin86SourceLocation').value;
 const filteredBins=bins.filter(x=>(!source||String(x.warehouse_id||'')===source)&&(!loc||x.location===loc));
 setOptions($('bin86SourceBin'),'<option value="">Teilbestand auswählen</option>'+filteredBins.map(b=>`<option value="${b.id}">${esc(b.article_no)} · ${esc(b.location||'ohne Ort')} · ${Number(b.quantity).toLocaleString('de-DE')} ${esc(b.unit)}</option>`).join(''));
 }
 function resetEvents(){clearPreview();}
 window.LVStockBinsV86={
  async open(){if(busy)return;busy=true;try{
   const [r,m]=await Promise.all([window.api('/api/stock-bins-v86/index'),window.api('/api/masterdata')]);
   refs=m;bins=r.bins||[];history=r.history||[];rev=r.revision;
   for(const id of ['bin86SourceWarehouse','bin86TargetWarehouse'])setOptions($(id),options(m.warehouses||[],id==='bin86SourceWarehouse'?'Quelllager auswählen':'Ziellager auswählen',x=>x.id));
   places();renderList();clearPreview();
   message('Teilbestände geladen. Wähle für den Fahrzeugumzug Quell- und Ziellager, prüfe die Vorschau und bestätige erst danach.',true);
  }catch(e){message(e.message)}finally{busy=false}},
  refreshPlaces(){places();clearPreview()},modeChanged(){$('bin86Single').hidden=value().mode!=='selected';clearPreview()},filter(){renderList()},
  async preview(){clearPreview();if(busy||!bins.length)return;
   const args=value();if(!args.target_warehouse_id&&!args.target_location)return;
   try{
    const result=await window.api('/api/stock-bins-v86/preview',{method:'POST',body:JSON.stringify(args)});
    previewRows=result.items||[];expected=result.revision;$('bin86Rows').innerHTML=previewRows.slice(0,600).map(x=>`<tr><td>${esc(x.article_no)}</td><td>${esc(x.description)}</td><td>${esc(x.from_location||'ohne Lagerort')}</td><td>${Number(x.quantity).toLocaleString('de-DE')} ${esc(x.unit)}</td><td>${esc(x.to_location||'ohne Lagerort')}</td></tr>`).join('');
    const total=previewRows.reduce((n,x)=>n+Number(x.quantity),0);$('bin86Summary').textContent=`${previewRows.length} Teilbestände · ${total.toLocaleString('de-DE')} Einheiten. Der Gesamtbestand bleibt unverändert.`;
    $('bin86Execute').disabled=!previewRows.length;
   }catch(e){$('bin86Summary').textContent=e.message;}
  },
  async execute(){if(busy||!expected||!previewRows.length)return;
   const args=value(),count=previewRows.length;
   if(!confirm(`${count} Teilbestände jetzt verbindlich umlagern?\n\nEin vollständiges Backup wird angelegt. Der Gesamtbestand ändert sich nicht.`))return;
   busy=true;$('bin86Execute').disabled=true;let success='';
   try{
    const d=await window.api('/api/stock-bins-v86/execute',{method:'POST',body:JSON.stringify({...args,expected_revision_id:expected,confirm:true,password:sessionStorage.adminPassword||''})});
    success=`${d.moved} Lagerort-Positionen umgelagert. Der Gesamtbestand ist unverändert.`;
    await Promise.allSettled([window.loadArticles?.(),window.dash?.()]);
   }catch(e){message(e.message)}finally{busy=false;clearPreview();if(success){await this.open();message(success,true)}}
  }
 };
})();
