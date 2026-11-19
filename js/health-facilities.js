function createHealthFacilities(map){
    const colours={PHC:'#006d77',Secondary:'#174ea6',Tertiary:'#7b1fa2'};
    map.createPane('healthFacilities');map.getPane('healthFacilities').style.zIndex=430;
    function symbol(colour){return '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="1" width="22" height="22" rx="5" fill="'+colour+'" stroke="white" stroke-width="2"/><path d="M9 5h6v4h4v6h-4v4H9v-4H5V9h4Z" fill="white"/></svg>';}
    return [...new Set(json_HealthFacilities.features.map(f=>f.properties.facility_level))].sort((a,b)=>['PHC','Secondary','Tertiary'].indexOf(a)-['PHC','Secondary','Tertiary'].indexOf(b)).map(level=>{
        const color=colours[level]||'#4b5563';
        const layer=L.geoJSON({type:'FeatureCollection',features:json_HealthFacilities.features.filter(f=>f.properties.facility_level===level)},{
            pointToLayer:(f,ll)=>L.marker(ll,{pane:'healthFacilities',title:f.properties.facility_name,icon:L.divIcon({className:'health-symbol',html:symbol(color),iconSize:[24,24],iconAnchor:[12,12]})}),
            onEachFeature:(f,m)=>{const box=document.createElement('div'),title=document.createElement('strong');title.textContent=f.properties.facility_name;box.append(title);for(const key of ['facility_level','lga','ward','healthdistrict']){const line=document.createElement('div');line.textContent=key.replace(/_/g,' ')+': '+(f.properties[key]||'—');box.append(line);}m.bindPopup(box);}
        }).addTo(map);
        return {name:'HealthFacilities',layer,color,health:true,title:'Health facilities — '+level,level,nameField:'facility_name',legend:symbol(color)+' '+level};
    });
}
