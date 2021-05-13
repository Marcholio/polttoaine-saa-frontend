import React from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";

import "./App.css";

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
