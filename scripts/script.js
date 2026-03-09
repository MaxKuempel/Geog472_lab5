
let countries;
let mineralind;

async function DisplayChoropleth() { //google AI overview
    try {
        const [countries_r, mineral_ind_r] = await Promise.all([
      fetch("data/World_Countries_Fixed.geojson"),
      fetch("data/INDOPAC_Mineral_facilities.geojson")
    ]);
    countries = await countries_r.json();
    mineralind = await mineral_ind_r.json();
    PointCountChoropleth();
    RenderChoropleth();
    RenderChoroplethNormalized();
    RenderProportional();
}
catch(error) {
    console.error("Error: ", error);
}
}

//the map
var map = L.map('map').setView([0,0], 2);
var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
}); // leaflet provider tiles: Stadia.AlidadeSmoothDark
Stadia_AlidadeSmoothDark.addTo(map);
//Layer groups
var Choropleth_group = L.layerGroup();
var Choropleth_group_normalized = L.layerGroup();
var Proportional = L.layerGroup();

function ColorScheme_Choropleth(value){
return value > 300 ? "#7a0177":
        value > 100 ? "#c51b8a":
        value > 60 ? "#f768a1":
        value > 40 ? "#fbb4b9":
        value > 0 ? "#feebe2":
        "#999999"

}

function StyleChoropleth(feature) {
return{
    fillColor: ColorScheme_Choropleth(feature.properties.count),
    fillOpacity: 0.7, 
    weight: 0.5,
    opacity:1,
    color: 'black' 
}   
}


function PointCountChoropleth(){
    let MineralIndWithin;
    for (let i = 0; i < countries.features.length; i++){
       MineralIndWithin = turf.pointsWithinPolygon(mineralind, countries.features[i])

       countries.features[i].properties.count = MineralIndWithin.features.length;

       // also calculate area while we are at it
       countries.features[i].properties.area = turf.area(countries.features[i]) / 10000000000
       countries.features[i].properties.ind_per_area = countries.features[i].properties.count / countries.features[i].properties.area

       //and centroids
       countries.features[i].properties.centroid = turf.centroid(countries.features[i])
    }
}

function RenderChoropleth (){

    L.geoJSON(countries, {
    style: StyleChoropleth
}).addTo(Choropleth_group)

//legend//
var legend = L.control({position: 'topright'}); //Taken from choropleth tutorial https://leafletjs.com/examples/choropleth/

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        mineralprojects = [0,40,60,100,300],
        labels = [];

    div.innerHTML += '<strong>Legend </strong> <br>'
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < mineralprojects.length; i++) {
        div.innerHTML +=
            '<i style="background:' + ColorScheme_Choropleth(mineralprojects[i] + 1) + '"></i> ' +
            mineralprojects[i] + (mineralprojects[i + 1] ? '&ndash;' + mineralprojects[i + 1] + " Mineral projects"+'<br>' : '+ Mineral projects'); //same choropleth tutorial https://leafletjs.com/examples/choropleth/
    }

    return div;
};
legend.addTo(map)


}
//normalized area

function ColorScheme_area(value){ //per 10,000 sq km
return value >  10? "#7a0177":
        value > 5 ? "#c51b8a":
        value > 2.5 ? "#f768a1":
        value > 1.25 ? "#fbb4b9":
        value > 0 ? "#feebe2":
        "#999999"

}

function StyleChoropleth_area(feature) {
return{
    fillColor: ColorScheme_area(feature.properties.ind_per_area),
    fillOpacity: 0.7, 
    weight: 0.5,
    opacity:1,
    color: 'black' 
}   
}

function RenderChoroplethNormalized(){
     L.geoJSON(countries, {
    style: StyleChoropleth_area
}).addTo(Choropleth_group_normalized)
}



function RenderProportional(){
    for (let i = 0; i < countries.features.length; i++){
        L.circleMarker((countries.features[i].properties.centroid.geometry.coordinates).reverse(),
            {radius: countries.features[i].properties.count / 5}
        ).addTo(Proportional)
    }
    
}

function LayerSwitcher(){
    selected_layer = document.querySelector('input[name="selector"]:checked').value
    if (selected_layer == "Choropleth"){
        map.removeLayer(Choropleth_group_normalized)
        map.removeLayer(Proportional)
        Choropleth_group.addTo(map)
    }
    else if (selected_layer == "Normalized") {
        map.removeLayer(Choropleth_group)
        map.removeLayer(Proportional)
        Choropleth_group_normalized.addTo(map)
    }
    else if (selected_layer == "Proportional Symbols") {
        map.removeLayer(Choropleth_group)
        map.removeLayer(Choropleth_group_normalized)
        Proportional.addTo(map)
    }
    else {
        console.log("no layer selected somehow")
    }
}

window.onload = function(){
    DisplayChoropleth();
}