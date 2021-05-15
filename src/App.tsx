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
import axios from "axios";
import Point from "ol/geom/Point";
import { Feature } from "ol";
import Style from "ol/style/Style";
import Text from "ol/style/Text";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

import { Button } from "@material-ui/core";

import { Fuel, Station } from "./types";

import "./App.css";

const App = () => {
  const map = useRef({} as Map);

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

  useEffect(() => {
    if (!state.loading) {
      map.current.getLayers().forEach((layer, i) => {
        // Do not remove base map layer
        if (i !== 0) {
          map.current.removeLayer(layer);
        }
      });

      const heatmapSource = new VectorSource({
        format: new GeoJSON(),
        loader: () => {
          heatmapSource.addFeatures(
            state.stations.map((station) => {
              const feature = new Feature(
                new Point(fromLonLat(station.coordinates))
              );
              feature.setProperties({
                value: station.prices[state.selectedFuel],
              });
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
              feature.setProperties({
                value: station.prices[state.selectedFuel],
              });

              feature.setStyle(
                new Style({
                  text: new Text({
                    font: "20px Helvetica",
                    fill: new Fill({ color: "#fff" }),
                    stroke: new Stroke({ color: "#000" }),
                    text: station.prices[state.selectedFuel].toString(),
                    overflow: true,
                  }),
                })
              );
              return feature;
            })
          );
        },
      });

      map.current.addLayer(
        new HeatMapLayer({
          source: heatmapSource,
          weight: (feature) => {
            return (feature.get("value") - 1.4) * 3;
          },
          blur: 250,
          radius: 125,
        })
      );

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
      <div id="fuelSelector">
        <Button
          color={state.selectedFuel === "Ysi5" ? "primary" : "default"}
          variant="contained"
          onClick={() => updateSelectedFuel("Ysi5")}
        >
          95
        </Button>
        <Button
          color={state.selectedFuel === "Ysi8" ? "primary" : "default"}
          variant="contained"
          onClick={() => updateSelectedFuel("Ysi8")}
        >
          98
        </Button>
        <Button
          color={state.selectedFuel === "Diesel" ? "primary" : "default"}
          variant="contained"
          onClick={() => updateSelectedFuel("Diesel")}
        >
          Diesel
        </Button>
      </div>
    </div>
  );
};

export default App;
