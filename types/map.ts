export type VisualizationMode = "points" | "heatmap" | "clusters";

export interface MapFeature {
  type: "Feature";
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    [key: string]: any;
    color?: [number, number, number, number] | string; // RGBA for Deck.gl or hex for MapLibre
    weight?: number; // For heatmap
  };
}

export interface MapData {
  type: "FeatureCollection";
  features: MapFeature[];
}

export interface MapLayer {
  id: string;
  data: MapData;
  visualizationMode: VisualizationMode;
  visible?: boolean;
}

export interface MapComponentProps {
  layers: MapLayer[];
  onBoundsChange?: (bounds: [number, number, number, number]) => void;
  onZoomChange?: (zoom: number) => void;
}
