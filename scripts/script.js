
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
var map = L.map('map').setView([14,108], 2);
var OpenStreetMap_HOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
});
OpenStreetMap_HOT.addTo(map);


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
    fillOpacity: 1, 
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

var legend_Choropleth;
function RenderChoropleth (){

    L.geoJSON(countries, {
    style: StyleChoropleth
}).addTo(Choropleth_group)

//legend//
legend_Choropleth = L.control({position: 'topright'}); //Taken from choropleth tutorial https://leafletjs.com/examples/choropleth/

legend_Choropleth.onAdd = function (map) {

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



}
//normalized area

function ColorScheme_area(value){ //per 10,000 sq km
return value >  10? "#7a0177":
        value > 5 ? "#c51b8a":
        value > 2.5 ? "#f768a1":
        value > 1 ? "#fbb4b9":
        value > 0 ? "#feebe2":
        "#999999"

}

function StyleChoropleth_area(feature) {
return{
    fillColor: ColorScheme_area(feature.properties.ind_per_area),
    fillOpacity: 1, 
    weight: 0.5,
    opacity:1,
    color: 'black' 
}   
}

function RenderChoroplethNormalized(){
     L.geoJSON(countries, {
    style: StyleChoropleth_area
}).addTo(Choropleth_group_normalized)


legend_Choropleth_N = L.control({position: 'topright'}); //Taken from choropleth tutorial https://leafletjs.com/examples/choropleth/

legend_Choropleth_N.onAdd = function (map) {
    
    var div = L.DomUtil.create('div', 'info legend'),
        mineralprojects = [0,1,2.5,5,10],
        labels = [];

    div.innerHTML += '<strong>Legend </strong> <br>'
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < mineralprojects.length; i++) {
        div.innerHTML +=
            '<i style="background:' + ColorScheme_area(mineralprojects[i] + 1) + '"></i> ' +
            mineralprojects[i] + (mineralprojects[i + 1] ? '&ndash;' + mineralprojects[i + 1] + " Mineral projects / 10,000 sq km"+'<br>' : '+ Mineral projects / 10,000 sq km'); //same choropleth tutorial https://leafletjs.com/examples/choropleth/
    }

    return div;
};



}



function RenderProportional(){
    for (let i = 0; i < countries.features.length; i++){
        L.circleMarker((countries.features[i].properties.centroid.geometry.coordinates).reverse(),
            {radius: countries.features[i].properties.count / 5}
        ).addTo(Proportional)
    }
    
    legend_proportional = L.control({position: 'topright'}); //Taken from choropleth tutorial https://leafletjs.com/examples/choropleth/

legend_proportional.onAdd = function (map) {
    
    var div = L.DomUtil.create('div', 'info legend'),
        mineralprojects = [10,50,100],
        labels = [];

    div.innerHTML += '<strong>Legend </strong> <br>'
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < mineralprojects.length; i++) {
       div.innerHTML += "coming soon! " + mineralprojects[i] + " "
       '/n'
     }

    return div;
};

}

function LayerSwitcher(){
    selected_layer = document.querySelector('input[name="selector"]:checked').value
    if (selected_layer == "Choropleth"){
        map.removeControl(legend_Choropleth_N)
        map.removeControl(legend_proportional)
        map.removeLayer(Choropleth_group_normalized)
        map.removeLayer(Proportional)
        Choropleth_group.addTo(map)
        legend_Choropleth.addTo(map)
    }
    else if (selected_layer == "Normalized") {
        map.removeLayer(Choropleth_group)
        map.removeControl(legend_proportional)
        map.removeLayer(Proportional)
        map.removeControl(legend_Choropleth)
        Choropleth_group_normalized.addTo(map)
        legend_Choropleth_N.addTo(map)
    }
    else if (selected_layer == "Proportional Symbols") {
        map.removeControl(legend_Choropleth)
        map.removeControl(legend_Choropleth_N)
        map.removeLayer(Choropleth_group)
        map.removeLayer(Choropleth_group_normalized)
        Proportional.addTo(map)
        legend_proportional.addTo(map)
    }
    else {
        console.log("no layer selected somehow")
    }
}

window.onload = function(){
    DisplayChoropleth();
}