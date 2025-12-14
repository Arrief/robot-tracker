import { Feature, Map, View } from "ol";
import { defaults } from "ol/control";
import { Point } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat, transformExtent } from "ol/proj";
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import Fill from "ol/style/Fill";
import Icon from "ol/style/Icon";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Text from "ol/style/Text";
import { useEffect, useRef } from "react";
import robotMarker from "../assets/robot-head.svg";
import "../styles/Map.css";

function CityMap({ robots }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerLayer = useRef(null);

    useEffect(() => {
        if (mapInstance.current) return; // prevent re-init

        markerLayer.current = new VectorLayer({
            source: new VectorSource(),
        });

        const leipzigCenter = fromLonLat([12.375919, 51.340863]);
        const leipzigArea = transformExtent(
            // west, south, east, north; transform from WGS84 lat-long system to Web Mercator system
            [12.22, 51.26, 12.54, 51.44],
            "EPSG:4326",
            "EPSG:3857"
        );

        mapInstance.current = new Map({
            target: mapRef.current,
            controls: defaults({ attribution: false }),
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                markerLayer.current,
            ],
            view: new View({
                center: leipzigCenter,
                zoom: 15,
                extent: leipzigArea,
            }),
        });
    }, []);

    useEffect(() => {
        if (!markerLayer.current) return;

        const source = markerLayer.current.getSource();
        source.clear();

        robots.forEach((robot) => {
            const feature = new Feature({
                geometry: new Point(fromLonLat([robot.lon, robot.lat])),
                robotId: robot.id,
            });

            feature.setStyle(
                new Style({
                    image: new Icon({
                        src: robotMarker,
                        scale: 1.2,
                        anchor: [0.5, 0.4], // anchor label bottom center of icon
                    }),
                    text: new Text({
                        text: robot.name,
                        font: "bold 14px sans-serif",
                        fill: new Fill({ color: "#000" }),
                        stroke: new Stroke({ color: "#fff", width: 3 }), // outline for better visibility
                        offsetY: -25, // move label above the marker
                    }),
                })
            );

            source.addFeature(feature);
        });
    }, [robots]);

    return <div id="map" ref={mapRef}></div>;
}

export default CityMap;
