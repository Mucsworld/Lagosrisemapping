/* Boundary selection also scopes site markers and the attribute table. */
function createWardBoundaries(map) {
    'use strict';
    map.createPane('wardBoundaries');
    map.getPane('wardBoundaries').style.zIndex = 400;
    map.createPane('wardLabels');
    map.getPane('wardLabels').style.zIndex = 450;
    map.getPane('wardLabels').style.pointerEvents = 'none';
    const labels=L.layerGroup(), group=L.layerGroup().addTo(map);
    const safeText=value=>{const el=document.createElement('span');el.textContent=value;return el;};
    const polygons=L.geoJSON(null,{
        pane:'wardBoundaries',
        style:{color:'#6b3294',weight:3,opacity:0.9,fillColor:'#af82cf',fillOpacity:0.06},
        onEachFeature(feature,layer){
            const content=document.createElement('div');
            const title=document.createElement('strong');title.textContent=feature.properties.ward;
            content.append(title,document.createElement('br'),safeText('LGA: '+feature.properties.lga));
            layer.bindPopup(content);
        }
    }).addTo(group);
    const control=L.control({position:'topleft'});
    let lga,ward,count;
    const features=json_Wards.features;
    let shown=features;
    function options(select,values,all){
        select.replaceChildren(new Option(all,''));
        [...new Set(values)].sort((a,b)=>a.localeCompare(b)).forEach(v=>select.add(new Option(v,v)));
    }
    function updateLabels(){
        labels.clearLayers();
        if(map.getZoom()<12 && !ward.value)return;
        shown.forEach(f=>L.tooltip({pane:'wardLabels',permanent:true,direction:'center',className:'ward-label',interactive:false})
            .setLatLng(f.properties.label_point).setContent(safeText(f.properties.ward)).addTo(labels));
    }
    function render(zoom){
        shown=features.filter(f=>(!lga.value||f.properties.lga===lga.value)&&(!ward.value||f.properties.ward===ward.value));
        polygons.clearLayers().addData({type:'FeatureCollection',features:shown});
        count.textContent=shown.length+' of '+features.length+' ward boundaries';
        updateLabels();
        window.boundarySelection={active:!!(lga.value||ward.value),ids:shown.map(f=>f.properties.fid),lga:lga.value,ward:ward.value};
        map.fire('boundaryfilterchange');
        if(zoom){group.addTo(map);const bounds=polygons.getBounds();if(bounds.isValid())map.fitBounds(bounds,{padding:[25,25],maxZoom:ward.value?18:15,animate:false});}
    }
    control.onAdd=function(){
        const box=L.DomUtil.create('details','ward-filter');
        box.open=window.innerWidth>=650;
        box.innerHTML='<summary>Ward boundaries</summary><div class="ward-filter-body"><label for="boundary-lga">LGA</label><select id="boundary-lga"></select><label for="boundary-ward">Ward</label><select id="boundary-ward"></select><button type="button" id="boundary-reset">Show all wards and sites</button><div id="boundary-count" role="status"></div><div id="boundary-sites" role="status"></div><small>Filters apply to boundaries, site points and the attribute table. Site labels appear at ward-level zoom.</small></div>';
        lga=box.querySelector('#boundary-lga');ward=box.querySelector('#boundary-ward');count=box.querySelector('#boundary-count');
        options(lga,features.map(f=>f.properties.lga),'All LGAs');
        options(ward,features.map(f=>f.properties.ward),'All wards');
        lga.onchange=()=>{options(ward,features.filter(f=>!lga.value||f.properties.lga===lga.value).map(f=>f.properties.ward),'All wards');render(true);};
        ward.onchange=()=>render(true);
        box.querySelector('button').onclick=()=>{lga.value='';options(ward,features.map(f=>f.properties.ward),'All wards');render(true);};
        L.DomEvent.disableClickPropagation(box);L.DomEvent.disableScrollPropagation(box);
        return box;
    };
    control.addTo(map);labels.addTo(group);render(false);map.on('zoomend',updateLabels);
    return group;
}
