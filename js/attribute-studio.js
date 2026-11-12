/* View-only web attribute viewer. Uses only the attributes already published in the map. */
(function () {
    'use strict';
    const sources = [
        {name:'Markets', layer:layer_Markets_5, nameField:'market_name'},
        {name:'Men gathering points', layer:layer_Mengatheringpoints_4, nameField:'men_location_name'},
        {name:'Women gathering points', layer:layer_Womengatheringpoints_3, nameField:'women_group_name'},
        {name:'Community leader houses', layer:layer_Communityleaderhouses_2, nameField:'leader_name'},
        {name:'Motor parks', layer:layer_Motorparks_1, nameField:'community'}
    ];
    const text = value => value == null ? '' : String(value);
    const norm = value => text(value).trim().toLocaleLowerCase();
    const title = key => ({fid:'Record ID', lga:'LGA',site_type:'Site category'}[key] || key.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()));
    sources.forEach(source => source.rows = (window.SiteScope?.sources.find(s=>s.layer===source.layer)?.markers||source.layer.getLayers()).map((marker,index)=>({marker,index,p:marker.feature.properties})));
    const inScope=row=>!window.SiteScope||window.SiteScope.includes(row.marker);
    const panel = document.createElement('section');
    panel.id='attribute-studio';panel.hidden=true;panel.setAttribute('aria-labelledby','studio-heading');
    panel.innerHTML = '<header><div><h2 id="studio-heading">Attribute Table Studio</h2><div class="studio-caption">Web viewer · Click a site to locate it on the map</div></div><button id="studio-close" type="button" aria-label="Close attribute table">Close</button></header>'+
        '<div class="studio-filters"><label>Site layer<select id="studio-layer"></select></label><label class="studio-search">Search all columns<input id="studio-search" type="search" placeholder="Name, location, or attribute…"></label><label>LGA<select id="studio-lga"></select></label><label>Ward<select id="studio-ward"></select></label><label>Community<select id="studio-community"></select></label><button id="studio-reset" type="button">Clear filters</button><button id="studio-csv" type="button">Download CSV</button></div>'+
        '<div class="studio-table-wrap" tabindex="0" aria-label="Scrollable site attributes"><table><thead></thead><tbody></tbody></table></div>'+
        '<footer><span id="studio-count" role="status" aria-live="polite"></span><div class="studio-paging"><button id="studio-prev" type="button">Previous</button><span id="studio-page"></span><button id="studio-next" type="button">Next</button></div></footer>';
    document.body.appendChild(panel);
    const scopeNote=document.createElement('div');scopeNote.id='studio-scope';panel.querySelector('header').after(scopeNote);
    const $=id=>document.getElementById(id), layerSelect=$('studio-layer'), search=$('studio-search');
    const filterIds=['lga','ward','community'], filters=filterIds.map(k=>$('studio-'+k));
    const tableHead=panel.querySelector('thead'), tableBody=panel.querySelector('tbody');
    let source=sources[0],columns=[],filtered=[],page=0,sortKey='',direction=1,selected=null,selectionRing=null;
    const pageSize=50,collator=new Intl.Collator(undefined,{numeric:true,sensitivity:'base'});
    sources.forEach((s,i)=>{const option=new Option(s.name+' ('+s.rows.length+')',String(i));layerSelect.add(option);});
    const control=L.control({position:'bottomleft'});
    let launch;
    control.onAdd=function(){const container=L.DomUtil.create('div','studio-control');launch=document.createElement('button');launch.type='button';launch.className='studio-launch';launch.textContent='Attribute Table Studio';launch.setAttribute('aria-controls',panel.id);launch.setAttribute('aria-expanded','false');launch.onclick=()=>setOpen(panel.hidden);container.appendChild(launch);L.DomEvent.disableClickPropagation(container);return container;};
    control.addTo(map);
    function setOpen(open){panel.hidden=!open;document.body.classList.toggle('studio-open',open);launch.setAttribute('aria-expanded',String(open));map.invalidateSize({pan:true,animate:false});if(open)layerSelect.focus();else launch.focus();}
    $('studio-close').onclick=()=>setOpen(false);
    panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();setOpen(false);}});
    function rebuildFilters(){
        let candidates=source.rows.filter(inScope);
        filters.forEach((select,i)=>{
            const previous=select.value, values=new Map();
            candidates.forEach(row=>{const value=text(row.p[filterIds[i]]).trim();if(value)values.set(norm(value),value);});
            select.replaceChildren(new Option('All '+(i===0?'LGAs':i===1?'wards':'communities'),''));
            [...values.entries()].sort((a,b)=>collator.compare(a[1],b[1])).forEach(([key,value])=>select.add(new Option(value.replace(/_/g,' '),key)));
            if(values.has(previous))select.value=previous;
            if(select.value)candidates=candidates.filter(row=>norm(row.p[filterIds[i]])===select.value);
        });
    }
    function refresh(resetPage=true){
        if(resetPage)page=0;
        const query=norm(search.value);
        filtered=source.rows.filter(row=>inScope(row)&&filters.every((select,i)=>!select.value||norm(row.p[filterIds[i]])===select.value)&&(!query||Object.values(row.p).some(value=>norm(value).includes(query))));
        const area=window.boundarySelection;
        scopeNote.textContent=area?.active?'Boundary area: '+[area.lga,area.ward].filter(Boolean).join(' / ')+' · Table filters narrow this area further.':'Boundary area: all sites';
        if(sortKey)filtered.sort((a,b)=>direction*collator.compare(text(a.p[sortKey]),text(b.p[sortKey]))||a.index-b.index);
        page=Math.max(0,Math.min(page,Math.ceil(filtered.length/pageSize)-1));
        render();
    }
    function render(){
        const header=document.createElement('tr');
        columns.forEach(key=>{const th=document.createElement('th');th.scope='col';th.setAttribute('aria-sort',sortKey===key?(direction===1?'ascending':'descending'):'none');const button=document.createElement('button');button.type='button';button.textContent=title(key)+(sortKey===key?(direction===1?' ↑':' ↓'):'');button.onclick=()=>{direction=sortKey===key?-direction:1;sortKey=key;refresh();};th.appendChild(button);header.appendChild(th);});
        tableHead.replaceChildren(header);tableBody.replaceChildren();
        const rows=filtered.slice(page*pageSize,(page+1)*pageSize);
        rows.forEach(row=>{const tr=document.createElement('tr');tr.setAttribute('aria-selected',String(selected===row));tr.dataset.recordId=text(row.p.fid);tr.onclick=()=>locate(row,tr);
            columns.forEach((key,i)=>{const td=document.createElement('td');const value=text(row.p[key]);if(i===0){const button=document.createElement('button');button.type='button';button.className='studio-site-link';button.textContent=value||'Unnamed site '+text(row.p.fid);button.setAttribute('aria-label','Locate '+button.textContent+' on map');td.appendChild(button);}else td.textContent=value||'—';tr.appendChild(td);});tableBody.appendChild(tr);});
        if(!rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=columns.length;td.className='studio-empty';td.textContent='No sites match these filters. Try a different search or clear filters.';tr.appendChild(td);tableBody.appendChild(tr);}
        $('studio-count').textContent=filtered.length.toLocaleString()+' of '+source.rows.length.toLocaleString()+' sites · '+(rows.length?(page*pageSize+1)+'–'+Math.min((page+1)*pageSize,filtered.length):'0')+' shown';
        $('studio-page').textContent='Page '+(page+1)+' of '+Math.max(1,Math.ceil(filtered.length/pageSize));
        $('studio-prev').disabled=page===0;$('studio-next').disabled=(page+1)*pageSize>=filtered.length;$('studio-csv').disabled=!filtered.length;
        panel.querySelector('.studio-table-wrap').scrollTop=0;
    }
    function locate(row,tr){
        selected=row;tableBody.querySelectorAll('tr').forEach(el=>el.setAttribute('aria-selected',String(el===tr)));
        if(!map.hasLayer(source.layer))map.addLayer(source.layer);
        if(selectionRing)map.removeLayer(selectionRing);
        selectionRing=L.circleMarker(row.marker.getLatLng(),{radius:13,color:'#f3b72e',weight:3,fill:false,interactive:false}).addTo(map);
        map.setView(row.marker.getLatLng(),Math.max(map.getZoom(),16),{animate:false});row.marker.openPopup();
    }
    function selectSource(){source=sources[Number(layerSelect.value)];selected=null;page=0;sortKey='';direction=1;search.value='';filters.forEach(s=>s.value='');if(selectionRing){map.removeLayer(selectionRing);selectionRing=null;}const keys=[...new Set(source.rows.flatMap(row=>Object.keys(row.p)))];columns=[source.nameField,...keys.filter(k=>k!==source.nameField)];rebuildFilters();refresh();}
    layerSelect.onchange=selectSource;search.oninput=()=>refresh();
    filters.forEach((select,i)=>select.onchange=()=>{filters.slice(i+1).forEach(s=>s.value='');rebuildFilters();refresh();});
    $('studio-reset').onclick=()=>{search.value='';filters.forEach(s=>s.value='');rebuildFilters();refresh();};
    $('studio-prev').onclick=()=>{page--;refresh(false);};$('studio-next').onclick=()=>{page++;refresh(false);};
    function csvCell(value){let str=text(value);if(/^[\s]*[=+\-@]/.test(str)||/^[\t\r\n]/.test(str))str="'"+str;return '"'+str.replace(/"/g,'""')+'"';}
    $('studio-csv').onclick=()=>{const csv='\ufeff'+[columns.map(title),...filtered.map(row=>columns.map(key=>row.p[key]))].map(row=>row.map(csvCell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='lagos-rise-'+source.name.toLowerCase().replace(/\s+/g,'-')+'-filtered.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
    map.on('sitescopechange',()=>{selected=null;if(selectionRing){map.removeLayer(selectionRing);selectionRing=null;}filters.forEach(s=>s.value='');rebuildFilters();refresh();});
    selectSource();
})();

