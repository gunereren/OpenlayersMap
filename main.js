import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { Draw, Modify, Snap } from 'ol/interaction.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { get } from 'ol/proj.js';

const raster = new TileLayer({
    source: new OSM(),
});

const source = new VectorSource();
const vector = new VectorLayer({
    source: source,
    style: {
        'fill-color': 'rgba(255, 255, 255, 0.2)',       // Seçim yaptığı alanın rengi.                                  Default: rgba(255, 255, 255, 0.2)
        'stroke-color': '#fa0000',                      // Seçim yaptığı alanın sınır çizgilerinin rengi.               Default: #ffcc33
        'stroke-width': 2,                              // Seçim yaptığı alanın sınır çizgilerinin kalınlığı.           Default: 2
        'circle-radius': 7,                             // Point type olunca haritada bıraktığı darielerin yarıçapı.    Default: 7
        'circle-fill-color': '#ffcc33',                 // Point type olunca haritada bıraktığı darielerin rengi.       Default: #ffcc33
    },
});

// Limit multi-world panning to one world east and west of the real world.
// Geometry coordinates have to be within that range.
const extent = get('EPSG:3857').getExtent().slice();
extent[0] += extent[0];
extent[2] += extent[2];
const map = new Map({
    layers: [raster, vector],
    target: 'map',
    view: new View({
        center: [3600000, 3900000],                     // Harita ilk açıldığında karşımıza çıkan konum
        zoom: 3,                                        // Harita ilk açıldığında zoom miktarı
        extent,
    }),
});

const modify = new Modify({ source: source });
map.addInteraction(modify);

let draw, snap; // global so we can remove them later
const typeSelect = document.getElementById('type');

function addInteractions() {
    draw = new Draw({
        source: source,
        type: typeSelect.value,
    });
    map.addInteraction(draw);
    snap = new Snap({ source: source });
    map.addInteraction(snap);
}

// ZOOM BUTON KONTROLLERI
document.getElementById("zoom-out").addEventListener("click", function (){
    const view = map.getView();
    const zoom = view.getZoom();
    view.setZoom(zoom - 1);
});

document.getElementById("zoom-in").addEventListener("click", function(){
    const view = map.getView();
    const zoom = view.getZoom();
    view.setZoom(zoom + 1);
})


/**
 * Handle change event.
 */
typeSelect.onchange = function () {
    map.removeInteraction(draw);
    map.removeInteraction(snap);
    addInteractions();
};

addInteractions();
