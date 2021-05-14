import React, { useEffect, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import HeatMapLayer from "ol/layer/Heatmap";
import VectorLayer from "ol/layer/Vector";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import axios from "axios";
import Point from "ol/geom/Point";
import { Feature } from "ol";
import Style from "ol/style/Style";
import Text from "ol/style/Text";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

import "./App.css";

const App = () => {
  const [state, setState] = useState<{
    loading: Boolean;
    stations: {
      station: string;
      coordinates: number[];
      prices: { "98": number; "95": number; Diesel: number };
    }[];
  }>({
    loading: true,
    stations: [],
  });

  useEffect(() => {
    axios({
      method: "get",
      url: "https://xxxx.execute-api.eu-central-1.amazonaws.com/dev/stations",
      headers: {
        "x-api-key": "xxxx",
      },
    }).then((res: any) => setState({ stations: res.data, loading: false }));
  }, []);

  useEffect(() => {
    if (!state.loading) {
      const heatmapSource = new VectorSource({
        format: new GeoJSON(),
        loader: () => {
          heatmapSource.addFeatures(
            state.stations.map((station) => {
              const feature = new Feature(
                new Point(fromLonLat(station.coordinates))
              );
              feature.setProperties({ value: station.prices["95"] });
              return feature;
            })
          );
        },
      });

      const textSource = new VectorSource({
        format: new GeoJSON(),
        loader: () => {
          textSource.addFeatures(
            state.stations.map((station) => {
              const feature = new Feature(
                new Point(fromLonLat(station.coordinates))
              );
              feature.setProperties({ value: station.prices["95"] });

              feature.setStyle(
                new Style({
                  text: new Text({
                    font: "20px Helvetica",
                    fill: new Fill({ color: "#fff" }),
                    stroke: new Stroke({ color: "#000" }),
                    text: station.prices["95"].toString(),
                    overflow: true,
                  }),
                })
              );
              return feature;
            })
          );
        },
      });

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
            source: heatmapSource,
            weight: (feature) => {
              return (feature.get("value") - 1) * 2; // TODO: Create proper scaling function
            },
            blur: 25,
            radius: 50,
          }),
          new VectorLayer({
            source: textSource,
          }),
        ],
      });
    }
  }, [state]);

  return (
    <div className="App">
      <div id="map" className="map" />
    </div>
  );
};

export default App;
