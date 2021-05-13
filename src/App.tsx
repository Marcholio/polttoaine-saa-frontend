import React from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import HeatMapLayer from "ol/layer/Heatmap";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";

import "./App.css";
import Point from "ol/geom/Point";
import { Feature } from "ol";

// TODO: Fetch data from API
const data: { coordinates: number[]; value: number }[] = [
  {
    coordinates: [24.767956, 60.205239], // Neste Mankkaa Sinikalliontie
    value: 1.669,
  },
  {
    coordinates: [24.74858, 60.20757], // ABC Nihtisilta
    value: 1.194,
  },
];

const vectorSource = new VectorSource({
  format: new GeoJSON(),
  loader: () => {
    vectorSource.addFeatures(
      data.map((station) => {
        const feature = new Feature(new Point(fromLonLat(station.coordinates)));
        feature.setProperties({ value: station.value });
        return feature;
      })
    );
  },
});

setTimeout(() => {
  new Map({
    target: "map",
    view: new View({
      center: fromLonLat([24.65, 60.2]),
      zoom: 12.5,
    }),
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
      new HeatMapLayer({
        source: vectorSource,
        weight: (feature) => {
          return (feature.get("value") - 1) * 2; // TODO: Create proper scaling function
        },
        blur: 25,
        radius: 50,
      }),
    ],
  });
}, 1000);

const App = () => {
  return (
    <div className="App">
      <div id="map" className="map" />
    </div>
  );
};

export default App;
