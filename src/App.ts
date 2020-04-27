import * as L from 'leaflet';
import { SelectionManager } from './SelectionManager';
import lidarGridData from './data/lidar-grid.json';
import dtmGridData from './data/lidar-subgrid.json';
import 'leaflet-groupedlayercontrol';
import { ISelectionFeature } from './ISelectionFeature';
import ClipboardJS from 'clipboard';

export class App {
    map: L.Map;

    baseLayers: { [index: string]: L.Layer } = {};

    overlayLayers: { [index: string]: { [index: string]: L.LayerGroup } } = {};

    groupOptions: L.GroupedLayersOptions = {};

    lidarGrid: L.GeoJSON;

    dtmGrid: L.GeoJSON;

    selectionManager: SelectionManager;

    constructor() {
        const mapOptions: L.MapOptions = {
            center: [49.7230, 6.1144],
            zoom: 12
        };

        this.map = new L.Map('map', mapOptions);

        const attributionText = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <a href="https://github.com/DavidMoraisFerreira/lidar-coverage-map-luxembourg" target="_blank">GitHub Repository</a>';

        const OpenStreetMapMapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: attributionText
        }).addTo(this.map);

        const OSMLIDARHillshade = L.tileLayer('https://lidar-hillshade-2019.openstreetmap.lu/layer/mappers_delight_lidar_hillshade_2019/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: attributionText
        });

        this.lidarGrid = L.geoJSON(lidarGridData as GeoJSON.FeatureCollection<any>, {
            onEachFeature: (feature: any, layer: any) => this.handleFeatureEvents(feature, layer),
            style: this.styleModel
        }).addTo(this.map);

        this.dtmGrid = L.geoJSON(dtmGridData as GeoJSON.FeatureCollection<any>, {
            onEachFeature: (feature: any, layer: any) => this.handleFeatureEvents(feature, layer),
            style: this.styleModel
        });

        this.baseLayers = {
            "OpenStreetMap": OpenStreetMapMapnik,
            "LiDAR 2019 Hillshade": OSMLIDARHillshade
        };

        this.overlayLayers = {
            "Grid": {
                "LiDAR Grid": this.lidarGrid,
                "DTM Grid": this.dtmGrid
            }
        };

        this.groupOptions = {
            exclusiveGroups: ["Grid"],
            groupCheckboxes: true,
            collapsed: false
        };

        const uiCopypasteContent = document.getElementById("CopyPasteContent") as HTMLElement;
        const uiStatusElement = document.getElementById("CountSelectedSpan") as HTMLElement;
        this.selectionManager = new SelectionManager(uiCopypasteContent, uiStatusElement);

        L.control.groupedLayers(this.baseLayers, this.overlayLayers, this.groupOptions).addTo(this.map);

        this.map.addEventListener("overlayremove", (event) => {
            event.layer.setStyle({
                fillColor: "Lightgray",
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.7,
                color: '#888888'
            });

            this.selectionManager.clearSelection();
        });

        this.map.addEventListener("overlayadd", (event) => {
            this.selectionManager.clearSelection();
        });

        const clipboard = new ClipboardJS('#clipboardButton');
        clipboard.on('success', (event: ClipboardJS.Event) => {
            event.clearSelection();
        });

        //this.registerSideBar();        
    }

    private handleFeatureEvents(feature: GeoJSON.Feature, layer: L.Layer): void {
        layer.on('mouseover', function (event) {
            event.target.setStyle({
                weight: 1,
                color: '#FF0066'
            });
        });
        layer.on('mouseout', function (event) {
            event.target.setStyle({
                weight: 0.5,
                color: '#888888'
            });
        });

        layer.on('click', (event) => this.handleTileSelectionEvent(event, feature.properties as ISelectionFeature));
    }

    private registerSideBar(): void {
        const info = new L.Control({ position: 'topright' });
        info.onAdd = function (map) {
            const element = L.DomUtil.create('div', 'info');
            //element.innerHTML = `Content`;
            return element;
        }
        info.addTo(this.map);

    }

    private handleTileSelectionEvent(event: L.LeafletEvent, feature: ISelectionFeature): void {
        if (!(this.selectionManager.isSelected(feature.url))) {
            this.selectionManager.addToSelection(feature.url);
            event.target.setStyle({ fillColor: "Green" });
        } else {
            this.selectionManager.removeFromSelection(feature.url)
            event.target.setStyle({ fillColor: "Lightgray" });
        }
    }

    //TODO: refactor
    styleModel(feature: any) {
        return {
            fillColor: "Lightgray",
            weight: 0.5,
            opacity: 1,
            fillOpacity: 0.7,
            color: '#888888'
        };
    }
}