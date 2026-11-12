(function(){
    'use strict';
    const sources=[['Markets_5',layer_Markets_5],['Mengatheringpoints_4',layer_Mengatheringpoints_4],['Womengatheringpoints_3',layer_Womengatheringpoints_3],['Communityleaderhouses_2',layer_Communityleaderhouses_2],['Motorparks_1',layer_Motorparks_1]].map(([name,layer])=>({name,layer,markers:layer.getLayers()}));
    const wardBounds=new Map(json_Wards.features.map(f=>[f.properties.fid,L.geoJSON(f).getBounds()]));
    sources.forEach(s=>s.markers.forEach(m=>m.siteDetails=json_SiteDetails[s.name][m.feature.properties.fid]));
    let selected=new Set(),active=false;
    const includes=marker=>!active||marker.siteDetails.wards.some(id=>selected.has(id));
    window.SiteScope={includes,sources};
    map.createPane('siteLabels');map.getPane('siteLabels').style.zIndex=460;map.getPane('siteLabels').style.pointerEvents='none';
    const labels=L.layerGroup().addTo(map),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
    ctx.font='12px Arial';
    let frame;
    function scheduleLabels(){cancelAnimationFrame(frame);frame=requestAnimationFrame(renderLabels);}
    function renderLabels(){
        labels.clearLayers();
        const zoom=map.getZoom();if(zoom<13)return;
        const viewport=map.getBounds(),size=map.getSize(),boxes=[];
        const thresholds=new Map([...wardBounds].map(([id,b])=>[id,Math.max(13,map.getBoundsZoom(b,false,L.point(50,50)))]));
        sources.filter(s=>map.hasLayer(s.layer)).forEach(s=>s.markers.forEach(marker=>{
            const meta=marker.siteDetails,point=marker.getLatLng();
            if(!includes(marker)||!meta.label||!viewport.contains(point))return;
            const relevant=meta.wards.filter(id=>!active||selected.has(id));
            const minZoom=relevant.length?Math.min(...relevant.map(id=>thresholds.get(id)||15)):15;
            if(zoom<minZoom)return;
            const xy=map.latLngToContainerPoint(point),width=Math.min(220,ctx.measureText(meta.label).width+12);
            const rect={x:xy.x+10,y:xy.y-12,w:width,h:24};
            if(rect.x+rect.w>size.x||rect.y<0||rect.y+rect.h>size.y)return;
            if(boxes.some(b=>rect.x<b.x+b.w+5&&rect.x+rect.w+5>b.x&&rect.y<b.y+b.h+3&&rect.y+rect.h+3>b.y))return;
            boxes.push(rect);
            const text=document.createElement('span');text.textContent=meta.label;
            L.tooltip({pane:'siteLabels',permanent:true,direction:'right',offset:[10,0],className:'site-label',interactive:false}).setLatLng(point).setContent(text).addTo(labels);
        }));
    }
    function apply(){
        const selection=window.boundarySelection||{active:false,ids:[]};active=selection.active;selected=new Set(selection.ids);
        let count=0;
        sources.forEach(s=>s.markers.forEach(m=>{const keep=includes(m);if(keep){count++;if(!s.layer.hasLayer(m))s.layer.addLayer(m);}else if(s.layer.hasLayer(m))s.layer.removeLayer(m);}));
        map.closePopup();
        document.querySelector('#boundary-sites').textContent=count.toLocaleString()+' matching sites';
        map.fire('sitescopechange');scheduleLabels();
    }
    map.on('boundaryfilterchange',apply);
    map.on('zoomend moveend resize overlayadd overlayremove',scheduleLabels);
    apply();
})();
