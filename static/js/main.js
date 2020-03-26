document.addEventListener("DOMContentLoaded", function (event) {
    var map = L.map('map').setView([49.7230, 6.1144], 12);

    var clipboard = new ClipboardJS('.clipboard');

    var lidarGrid = L.geoJson(lidarGridData, {
        onEachFeature: onEachFeature,
        style: styleModel
    }).addTo(map);

    var selectedTiles = new Set();

    var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | David Morais Ferreira | <a href="https://github.com/DavidMoraisFerreira/lidar-coverage-map-luxembourg" target="_blank">Repository on Github</a>'
    }).addTo(map);

    var info = L.control();
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    info.update = function (feature) {
        this._div.innerHTML = `<div width="200px">
        <img src="./static/images/OSM_Luxembourg_Logo.svg" height="100px" style="float:right;display:block; margin-left:5px;" />
        <h3>LiDAR Coverage Map Luxembourg</h3>
        <p style="margin-top:10px;">
        Allows you to select open data <a href="https://data.public.lu/fr/datasets/lidar-2019-releve-3d-du-territoire-luxembourgeois/" target="_blank">LIDAR 2019</a> tiles and export the list of URLs. <br /> <br />
        If you want to download the whole dataset, please use the <a href="https://data.public.lu/fr/datasets/r/e2cb8cdb-6886-4560-83f5-14ac14606db2" target="_blank">provided script</a>.
        </p>
        <hr style="height:1px; background-color: #ccc; border:0 none;"/>
        `;

        if (selectedTiles.size != 0) {

            let listOfUrls = "wget ";
            for (let item of selectedTiles) {
                listOfUrls += item + " ";
            }

            this._div.innerHTML += '<button class="clipboard" data-clipboard-target="#copypastecontent">Copy wget command to the clipboard</button><br /><textarea id="copypastecontent" style="width:100%; height:150px">' + listOfUrls + '</textarea><span style="font-style:italic; float:right;">' + selectedTiles.size + ' ' + (selectedTiles.size == 1 ? 'tile' : 'tiles') + ' selected</span>';
        } else {
            this._div.innerHTML += '<div style="text-align:center; margin-top:20px;">Click on tiles to select them for download!</span>'
        }

    };
    info.addTo(map);

    function onEachFeature(feature, layer) {
        layer.on('mouseover', function () {
            info.update(feature);
            this.setStyle({
                weight: 1,
                color: '#FF0066'
            });
        });
        layer.on('mouseout', function () {
            info.update();
            this.setStyle({
                weight: 0.5,
                color: '#888888'
            });
        });

        layer.on('click', function (e) {
            if (!(selectedTiles.has(feature.properties.url))) {
                selectedTiles.add(feature.properties.url);
                this.setStyle({
                    fillColor: "Green"
                });
            } else {
                selectedTiles.delete(feature.properties.url);
                this.setStyle({
                    fillColor: "Lightgray"
                });
            }
            info.update();
        });
    }

    var legend = L.control({ position: 'bottomleft' });
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = `
        <b>Legend:</b> <br />
        <svg xmlns="http://www.w3.org/2000/svg" width="115px" height="60px">
        <rect x="10" y="10" width="20" height="20" style="fill:green;stroke-width:1;stroke:rgb(0,0,0)" />
        <text x="30" y="20" transform="translate(6,5)">Selected</text>
        <rect x="10" y="40" width="20" height="20" style="fill:lightgray;stroke-width:1;stroke:rgb(0,0,0)" />
        <text x="30" y="50" transform="translate(6,5)">Unelected</text>
        </svg>
        `;
        return div;
    };

    legend.addTo(map);
});

function styleModel(feature) {
    return {
        fillColor: "Lightgray",
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.7,
        color: '#888888'
    };
}