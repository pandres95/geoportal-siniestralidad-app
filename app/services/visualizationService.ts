import {
  VICTIM_STATUS_COLORS,
  VictimData,
  VictimStatus,
} from "../models/victims";

import { AccidentData } from "./dataService";

export type VisualizationMode = "points" | "heatmap" | "clusters" | "polygons";

export interface VisualizationLayer {
  layer: google.maps.Data | google.maps.visualization.HeatmapLayer;
  type: VisualizationMode;
  data?: AccidentData;
}

export class VisualizationService {
  private map: google.maps.Map;
  private currentLayers: VisualizationLayer[] = [];
  private currentMode: VisualizationMode = "points";

  constructor(map: google.maps.Map) {
    this.map = map;
  }

  setVisualizationMode(
    mode: VisualizationMode,
    data: AccidentData | VictimData
  ): void {
    this.clearCurrentVisualization();
    this.currentMode = mode;

    switch (mode) {
      case "points":
        this.createPointVisualization(data);
        break;
      case "heatmap":
        this.createHeatmapVisualization(data);
        break;
      case "clusters":
        this.createClusterVisualization(data);
        break;
      case "polygons":
        this.createPolygonVisualization(data);
        break;
    }
  }

  private createPointVisualization(data: AccidentData | VictimData): void {
    console.log(
      "🎨 Creating point visualization with",
      data.features.length,
      "features"
    );

    // Analyze data distribution
    const statusCounts: Record<string, number> = {};
    const coordSamples: Array<{ lat: number; lng: number; estado: string }> =
      [];

    data.features.forEach((feature, index) => {
      const estado =
        feature.properties.estado || feature.properties.type || "unknown";
      statusCounts[estado] = (statusCounts[estado] || 0) + 1;

      if (index < 10) {
        // Sample first 10 coordinates
        coordSamples.push({
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0],
          estado: estado,
        });
      }
    });

    console.table(coordSamples);
    console.log("📊 Status distribution:", statusCounts);

    const layer = new google.maps.Data({ map: this.map });

    let featureCount = 0;
    layer.setStyle((feature) => {
      featureCount++;
      // Check if this is victim data (has estado property)
      const estado = feature.getProperty("estado") as VictimStatus;

      if (estado) {
        // Victim data - use status-based coloring
        return {
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: VICTIM_STATUS_COLORS[estado],
            fillOpacity: 0.9,
            strokeWeight: 1,
            strokeColor: "#fff",
          },
        };
      } else {
        // Legacy accident data - use type-based coloring
        const type = feature.getProperty("type") as "injured" | "dead";
        const isDead = type === "dead";

        return {
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: isDead ? "red" : "blue",
            fillOpacity: 0.9,
            strokeWeight: 1,
            strokeColor: "#fff",
          },
        };
      }
    });

    console.log("📊 Adding GeoJSON data to layer");
    try {
      layer.addGeoJson(data as any);
      console.log("✅ GeoJSON added successfully");

      // Add event listener to check when features are added
      let addedFeatures = 0;
      layer.addListener("addfeature", (event: any) => {
        addedFeatures++;
        if (addedFeatures <= 5) {
          console.log(
            "📍 Feature added:",
            addedFeatures,
            event.feature.getProperty("estado")
          );
        }
      });

      this.currentLayers.push({ layer, type: "points", data });

      // Log layer info after a short delay to allow features to be added
      setTimeout(() => {
        console.log("✅ Point visualization created - checking features...");
        // Try to get features from the layer
        const features = layer.getFeatureById
          ? "Layer has getFeatureById"
          : "No getFeatureById method";
        console.log("Layer features check:", features);
      }, 100);
    } catch (error) {
      console.error("❌ Error adding GeoJSON:", error);
    }
  }

  private createHeatmapVisualization(data: AccidentData | VictimData): void {
    // Check if visualization API is available
    if (!window.google.maps.visualization) {
      console.error("Google Maps Visualization API not loaded");
      return;
    }

    // Check if HeatmapLayer is available (not deprecated)
    if (!window.google.maps.visualization.HeatmapLayer) {
      console.warn(
        "⚠️ Google Maps HeatmapLayer is deprecated as of May 2025. Consider using alternative libraries like deck.gl for heatmap functionality."
      );
      this.createAlternativeHeatmap(data);
      return;
    }

    const heatmapData = data.features
      .map((feature) => {
        const coordinates = feature.geometry.coordinates;
        if (!coordinates || coordinates.length < 2) return null;

        const [lng, lat] = coordinates;
        const severity = feature.properties?.severity || 1;

        return {
          location: new google.maps.LatLng(lat, lng),
          weight: severity,
        };
      })
      .filter(
        (point) => point !== null
      ) as google.maps.visualization.WeightedLocation[];

    if (heatmapData.length === 0) return;

    try {
      const heatmapLayer = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: this.map,
        radius: 20,
        maxIntensity: 10,
        dissipating: true,
        opacity: 0.6,
      });

      this.currentLayers.push({ layer: heatmapLayer, type: "heatmap", data });
    } catch (error) {
      console.error("❌ Error creating heatmap layer:", error);
      console.warn("🔄 Falling back to alternative heatmap implementation");
      this.createAlternativeHeatmap(data);
    }
  }

  private createAlternativeHeatmap(data: AccidentData | VictimData): void {
    // Alternative implementation using point clustering with opacity
    console.log(
      "🔄 Creating alternative heatmap using enhanced point clustering"
    );

    const markers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    data.features.forEach((feature) => {
      const coordinates = feature.geometry.coordinates;
      if (!coordinates || coordinates.length < 2) return;

      const [lng, lat] = coordinates;
      const position = new google.maps.LatLng(lat, lng);
      bounds.extend(position);

      const severity = feature.properties?.severity || 1;
      const estado = feature.properties?.estado as VictimStatus;
      let fillColor: string;

      if (estado) {
        // Victim data - use status-based coloring
        fillColor = VICTIM_STATUS_COLORS[estado]
          .replace(")", ", 0.3)")
          .replace("rgb", "rgba");
      } else {
        // Legacy accident data - use type-based coloring
        const type = feature.properties?.type as "injured" | "dead";
        const isDead = type === "dead";
        fillColor = isDead ? "rgba(255, 0, 0, 0.3)" : "rgba(0, 0, 255, 0.2)";
      }

      // Create multiple semi-transparent markers for heatmap effect
      for (let i = 0; i < severity; i++) {
        const marker = new google.maps.Marker({
          position: {
            lat: lat + (Math.random() - 0.5) * 0.001, // Small random offset
            lng: lng + (Math.random() - 0.5) * 0.001,
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor,
            fillOpacity: 0.4,
            strokeWeight: 0,
          },
          map: this.map,
        });

        markers.push(marker);
      }
    });

    // Fit map to show all points
    if (markers.length > 0) {
      this.map.fitBounds(bounds);

      const clusterLayer = {
        layer: {
          setMap: (map: google.maps.Map | null) => {
            markers.forEach((marker) => marker.setMap(map));
          },
        } as any,
        type: "heatmap" as VisualizationMode,
        data,
      };

      this.currentLayers.push(clusterLayer);
    }
  }

  private createClusterVisualization(data: AccidentData | VictimData): void {
    // For clustering, we'll use marker clusters
    const markers: google.maps.Marker[] = [];

    data.features.forEach((feature) => {
      const coordinates = feature.geometry.coordinates;
      if (!coordinates || coordinates.length < 2) return;

      const [lng, lat] = coordinates;
      const estado = feature.properties?.estado as VictimStatus;
      let fillColor: string;

      if (estado) {
        // Victim data - use status-based coloring
        fillColor = VICTIM_STATUS_COLORS[estado];
      } else {
        // Legacy accident data - use type-based coloring
        const type = feature.properties?.type as "injured" | "dead";
        const isDead = type === "dead";
        fillColor = isDead ? "red" : "blue";
      }

      const marker = new google.maps.Marker({
        position: { lat, lng },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor,
          fillOpacity: 0.9,
          strokeWeight: 1,
          strokeColor: "#fff",
        },
        map: this.map,
      });

      markers.push(marker);
    });

    // Note: This is a basic clustering approach. For production,
    // consider using a proper clustering library like marker-clusterer-plus
    if (markers.length > 0) {
      const clusterLayer = {
        layer: {
          setMap: (map: google.maps.Map | null) => {
            markers.forEach((marker) => marker.setMap(map));
          },
        } as any,
        type: "clusters" as VisualizationMode,
        data,
      };

      this.currentLayers.push(clusterLayer);
    }
  }

  private createPolygonVisualization(data: AccidentData | VictimData): void {
    console.log(
      "🎨 Creating polygon visualization with",
      data.features.length,
      "features"
    );

    const layer = new google.maps.Data({ map: this.map });

    layer.setStyle((feature) => {
      // Get the color from feature properties (should be RGBA array)
      const color = feature.getProperty("color") as
        | [number, number, number, number]
        | string;

      if (Array.isArray(color) && color.length === 4) {
        // RGBA array - convert to rgba() string
        const [r, g, b, a] = color;
        return {
          fillColor: `rgba(${r}, ${g}, ${b}, ${a})`,
          strokeColor: `rgba(${r}, ${g}, ${b}, 1)`,
          strokeWeight: 1,
          fillOpacity: a,
        };
      } else if (typeof color === "string") {
        // Hex color string
        return {
          fillColor: color,
          strokeColor: color,
          strokeWeight: 1,
          fillOpacity: 0.6,
        };
      } else {
        // Default styling
        return {
          fillColor: "rgba(255, 0, 0, 0.6)",
          strokeColor: "rgba(255, 0, 0, 1)",
          strokeWeight: 1,
          fillOpacity: 0.6,
        };
      }
    });

    console.log("📊 Adding GeoJSON polygon data to layer");
    try {
      layer.addGeoJson(data as any);
      console.log("✅ Polygon GeoJSON added successfully");

      this.currentLayers.push({ layer, type: "polygons", data });
    } catch (error) {
      console.error("❌ Error adding polygon GeoJSON:", error);
    }
  }

  private clearCurrentVisualization(): void {
    this.currentLayers.forEach(({ layer }) => {
      if (layer instanceof google.maps.Data) {
        layer.setMap(null);
      } else if ("setMap" in layer) {
        layer.setMap(null);
      }
    });
    this.currentLayers = [];
  }

  getCurrentMode(): VisualizationMode {
    return this.currentMode;
  }

  updateData(data: AccidentData | VictimData): void {
    if (this.currentLayers.length > 0) {
      this.setVisualizationMode(this.currentMode, data);
    } else {
      this.setVisualizationMode("points", data);
    }
  }

  destroy(): void {
    this.clearCurrentVisualization();
  }
}
