"use client";

import "leaflet/dist/leaflet.css";

import { CircleMarker, MapContainer, Polygon, TileLayer } from "react-leaflet";
import { MapComponentProps, MapLayer } from "../../types/map";
import { useEffect, useState } from "react";

// @ts-expect-error: react-leaflet-heatmap-layer-v3 has no TypeScript definitions
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3";
// Fix for default markers in react-leaflet
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const TILE_LAYER_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_LAYER_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function MapContent({ layers }: MapComponentProps) {
  // Force re-render when layers change
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    console.log("MapContent received layers:", layers.length);
    forceUpdate((prev) => prev + 1);
  }, [layers]);

  const renderPoints = (layer: MapLayer) => {
    console.log(
      "renderPoints called for layer:",
      layer.id,
      "features:",
      layer.data.features.length
    );
    return layer.data.features.map((feature: any, index: number) => {
      // Limit to 100 for debugging
      const [lng, lat] = feature.geometry.coordinates;

      // Use color from feature properties (set by victims model)
      const color = feature.properties.color || "#ff0000";

      return (
        <CircleMarker
          key={`${layer.id}-${index}`}
          center={[lat, lng]}
          radius={3}
          pathOptions={{
            color: color,
            fillColor: color,
            fillOpacity: 0.8,
            weight: 1,
          }}
        />
      );
    });
  };

  const renderHeatmap = (layer: MapLayer) => {
    console.log(
      "renderHeatmap called for layer:",
      layer.id,
      "features:",
      layer.data.features.length
    );
    // Convert GeoJSON features to heatmap points format [lat, lng, intensity]
    const points = layer.data.features.map((feature: any) => {
      const [lng, lat] = feature.geometry.coordinates;
      const intensity = feature.properties.weight || 1;
      return [lat, lng, intensity] as [number, number, number];
    });

    return (
      <HeatmapLayer
        key={`${layer.id}-heatmap`}
        points={points}
        longitudeExtractor={(point: any) => point[1]}
        latitudeExtractor={(point: any) => point[0]}
        intensityExtractor={(point: any) => point[2]}
        radius={20}
        blur={15}
        max={1.0}
        minOpacity={0.3}
      />
    );
  };

  const renderPolygons = (layer: MapLayer) => {
    console.log(
      "renderPolygons called for layer:",
      layer.id,
      "features:",
      layer.data.features.length
    );
    return layer.data.features.map((feature: any, index: number) => {
      // Handle MultiPolygon geometry
      const coordinates = feature.geometry.coordinates;
      const color = feature.properties.color;

      // Convert RGBA array to string if needed
      let fillColor: string;
      let strokeColor: string;
      if (Array.isArray(color) && color.length === 4) {
        const [r, g, b, a] = color;
        fillColor = `rgba(${r}, ${g}, ${b}, ${a})`;
        strokeColor = `rgba(${r}, ${g}, ${b}, 1)`;
      } else if (typeof color === "string") {
        fillColor = color;
        strokeColor = color;
      } else {
        fillColor = "rgba(255, 0, 0, 0.6)";
        strokeColor = "rgba(255, 0, 0, 1)";
      }

      // For MultiPolygon, coordinates is [[[polygon1], [polygon2], ...]]
      // We need to convert from [lng, lat] to [lat, lng] for Leaflet
      const polygons = coordinates.map((polygonCoords: any) =>
        polygonCoords.map((ring: any) =>
          ring.map(([lng, lat]: [number, number]) => [lat, lng])
        )
      );

      return (
        <Polygon
          key={`${layer.id}-${index}`}
          positions={polygons}
          pathOptions={{
            color: strokeColor,
            fillColor: fillColor,
            fillOpacity: 0.6,
            weight: 1,
          }}
        />
      );
    });
  };

  const renderLayers = () => {
    return layers
      .filter((layer) => layer.visible !== false)
      .map((layer) => {
        console.log(
          "Rendering layer:",
          layer.id,
          "mode:",
          layer.visualizationMode
        );
        switch (layer.visualizationMode) {
          case "points":
            return renderPoints(layer);
          case "heatmap":
            return renderHeatmap(layer);
          case "polygons":
            return renderPolygons(layer);
          default:
            return null;
        }
      });
  };

  return (
    <>
      <TileLayer url={TILE_LAYER_URL} attribution={TILE_LAYER_ATTRIBUTION} />
      {renderLayers()}
    </>
  );
}

export default function MapComponent(props: MapComponentProps) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <MapContainer
        center={[4.6, -74.1]}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={true}
        dragging={true}
        doubleClickZoom={true}
      >
        <MapContent {...props} />
      </MapContainer>
    </div>
  );
}
