import React, { useEffect, useState, useRef } from "react";

import Map from "ol/Map";
import View from "ol/View";

import TileLayer from "ol/layer/Tile";
import HeatMapLayer from "ol/layer/Heatmap";
import VectorLayer from "ol/layer/Vector";

import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";

import { fromLonLat } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";

import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Geometry from "ol/geom/Geometry";

import Style from "ol/style/Style";
import Text from "ol/style/Text";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

import axios from "axios";

import FuelSelector from "./components/FuelSelector";

import { Fuel, Station } from "./types";

import "./App.css";

const createPointFeatures = (
  stations: Station[],
  selectedFuel: Fuel
): Feature<Point>[] =>
  stations.map((station) => {
    const feature = new Feature(new Point(fromLonLat(station.coordinates)));
    feature.setProperties({
      value: station.prices[selectedFuel],
    });
    return feature;
  });

const createTextFeatures = (stations: Station[], selectedFuel: Fuel) => {
  const features = createPointFeatures(stations, selectedFuel);

  features.forEach((feat) =>
    feat.setStyle(
      new Style({
        text: new Text({
          font: "20px Helvetica",
          fill: new Fill({ color: "#fff" }),
          stroke: new Stroke({ color: "#000" }),
          text: feat.get("value").toString(),
          overflow: true,
        }),
      })
    )
  );

  return features;
};

const scaleValue = (feature: Feature<Geometry>, selectedFuel: Fuel): number =>
  (feature.get("value") - (selectedFuel === "Diesel" ? 1.4 : 1.5)) * 10;

const App = () => {
  const map = useRef({} as Map);

  // Initialize map with base layer
  useEffect(() => {
    map.current = new Map({
      target: "map",
      view: new View({
        center: fromLonLat([24.75, 60.2]),
        zoom: 12.5,
      }),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
    });
  }, []);

  const [state, setState] = useState<{
    loading: Boolean;
    stations: Station[];
    selectedFuel: Fuel;
  }>({
    loading: true,
    stations: [],
    selectedFuel: "Ysi5",
  });

  // Fetch station data once on page load and never after that
  useEffect(() => {
    axios({
      method: "get",
      url: `${process.env.REACT_APP_API_URL}/stations`,
      headers: {
        "x-api-key": process.env.REACT_APP_API_KEY,
      },
    }).then((res: any) =>
      setState((state) => ({ ...state, loading: false, stations: res.data }))
    );
  }, []);

  // Update map layers
  useEffect(() => {
    if (!state.loading) {
      // Clear layers
      map.current.getLayers().forEach((layer, i) => {
        // Do not remove base map layer
        if (i !== 0) {
          map.current.removeLayer(layer);
        }
      });

      // HEATMAP LAYER
      const heatmapSource = new VectorSource({
        format: new GeoJSON(),
        loader: () => {
          heatmapSource.addFeatures(
            createPointFeatures(state.stations, state.selectedFuel)
          );
        },
      });

      map.current.addLayer(
        new HeatMapLayer({
          source: heatmapSource,
          weight: (feature) => scaleValue(feature, state.selectedFuel),
          blur: 250,
          radius: 125,
        })
      );

      // TEXT LAYER
      const textSource = new VectorSource({
        format: new GeoJSON(),
        loader: () => {
          textSource.addFeatures(
            createTextFeatures(state.stations, state.selectedFuel)
          );
        },
      });

      map.current.addLayer(
        new VectorLayer({
          source: textSource,
        })
      );
    }
  }, [state]);

  const updateSelectedFuel = (fuel: Fuel) => {
    if (fuel !== state.selectedFuel) {
      setState((s) => ({ ...s, selectedFuel: fuel }));
    }
  };

  return (
    <div className="App">
      <div id="map" className="map" />
      <FuelSelector
        updateSelectedFuel={updateSelectedFuel}
        selectedFuel={state.selectedFuel}
      />
      <div id="createdby">
        <span>Created by Markus Tyrkk?? - </span>
        <a
          id="sourcecode"
          href="https://github.com/Marcholio/polttoaine-saa-frontend"
          target="_blank"
          rel="noreferrer"
        >
          Source code
        </a>
      </div>
    </div>
  );
};

export default App;
