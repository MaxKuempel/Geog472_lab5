let mineralind;
let vorP;
function FetchMineralInd(){
    fetch("data/INDOPAC_Mineral_facilities.geojson")
    .then(response => response.json())
    .then(data=> {
        console.log(data);
        mineralind = data;  
        vorP = turf.voronoi(mineralind);
        L.geoJSON(vorP).addTo(map);
    }
    )
}
let countries;
function FetchCountries(){
    fetch("data/World_Countries.geojson")
       .then(response => response.json())
    .then(data=> {
        console.log(data);
        countries = data
        L.geoJSON(data).addTo(map);
})
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

window.onload = function(){
    FetchMineralInd();
    FetchCountries();
}