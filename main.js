import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { Draw, Modify, Snap } from 'ol/interaction.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { get } from 'ol/proj.js';
import { toStringHDMS } from 'ol/coordinate';
import { toLonLat } from 'ol/proj';


const saveParcelBtn = document.getElementById("saveParcel");
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
        center: [0, 0],                     // Harita ilk açıldığında karşımıza çıkan konum
        zoom: 2,                                        // Harita ilk açıldığında zoom miktarı
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
    draw.addEventListener("drawend", onDrawEnd);            // çizme işlemi bitince tetiklenecek
    draw.addEventListener("drawend", function openPopup() {
        const popup = document.getElementById("popup");
        const popupbackground = document.getElementById("popupBackground");
        popup.style.display = "block";
        popupbackground.style.display = "block";
    });
}

// PARSELİ KAYDET BUTONUNA BASINCA OLACAKLAR
saveParcelBtn.addEventListener("click", function () {
    var inputElements = document.getElementsByClassName("inputBox");
    var tablo = document.getElementById("table");
    var yeniSatir = tablo.insertRow(tablo.rows.length);
    yeniSatir.style="background-color: white;"

    var huc1 = yeniSatir.insertCell(0);                     
    var huc2 = yeniSatir.insertCell(1);
    var huc3 = yeniSatir.insertCell(2);
    var huc4 = yeniSatir.insertCell(3);

    huc1.innerHTML = inputElements[0].value;
    huc2.innerHTML = inputElements[1].value;
    huc3.innerHTML = inputElements[2].value;

    var duzenleButon = document.createElement("button");        // Edit butonu
    duzenleButon.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Edit';
    duzenleButon.style ="margin:0 1rem; text-align: center;"
    huc4.appendChild(duzenleButon);

    var silButon = document.createElement("button");            // Delete butonu
    silButon.innerHTML = "<i class=\"fa-solid fa-xmark\" style=\"color: #000000;\"></i> Delete";
    huc4.appendChild(silButon);

    for (var i = 0; i < inputElements.length; i++) {                    // Girilen değerleri okuyup inputBox'ı temizleyen döngü
        console.log("Input", i + 1, "değeri: " + inputElements[i].value);
        inputElements[i].value = "";
    }
    popup.style.display = 'none';
    popupBackground.style.display = "none";
});

const closePopupButton = document.getElementById('closePopupButton');
closePopupButton.addEventListener('click', () => {
    popup.style.display = 'none';
    const popupBackground = document.getElementById("popupBackground");
    popupBackground.style.display = "none";
});

// ZOOM BUTON KONTROLLERI
document.getElementById("zoom-out").addEventListener("click", function () {
    const view = map.getView();
    const zoom = view.getZoom();
    view.setZoom(zoom - 1);
});
document.getElementById("zoom-in").addEventListener("click", function () {
    const view = map.getView();
    const zoom = view.getZoom();
    view.setZoom(zoom + 1);
});

function onDrawEnd(event) {
    var feature = event.feature; // Çizilen nesne
    var geometry = feature.getGeometry(); // Geometriyi al
    console.log("geometry:", geometry);
    var coordinates = geometry.getCoordinates(); // Koordinatları al

    console.log("Çizilen nesne geometrisi: ", geometry.getType());
    console.log("Koordinatlar: ", coordinates);
    const hdms = toStringHDMS(toLonLat(coordinates));       // koordinatları çevirme işlemi
    console.log(hdms);
}


/**
 * Handle change event.
 */
typeSelect.onchange = function () {
    map.removeInteraction(draw);
    map.removeInteraction(snap);
    addInteractions();
};

addInteractions();
