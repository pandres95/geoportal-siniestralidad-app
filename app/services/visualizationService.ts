import { AccidentData } from "./dataService";

export type VisualizationMode = "points" | "heatmap" | "clusters";

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

  setVisualizationMode(mode: VisualizationMode, data: AccidentData): void {
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
    }
  }

  private createPointVisualization(data: AccidentData): void {
    const layer = new google.maps.Data({ map: this.map });

    layer.setStyle((feature) => {
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
    });

    layer.addGeoJson(data as any);
    this.currentLayers.push({ layer, type: "points", data });
  }

  private createHeatmapVisualization(data: AccidentData): void {
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

  private createAlternativeHeatmap(data: AccidentData): void {
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
      const type = feature.properties?.type as "injured" | "dead";
      const isDead = type === "dead";

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
            fillColor: isDead ? "rgba(255, 0, 0, 0.3)" : "rgba(0, 0, 255, 0.2)",
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

  private createClusterVisualization(data: AccidentData): void {
    // For clustering, we'll use marker clusters
    const markers: google.maps.Marker[] = [];

    data.features.forEach((feature) => {
      const coordinates = feature.geometry.coordinates;
      if (!coordinates || coordinates.length < 2) return;

      const [lng, lat] = coordinates;
      const type = feature.properties?.type as "injured" | "dead";
      const isDead = type === "dead";

      const marker = new google.maps.Marker({
        position: { lat, lng },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: isDead ? "red" : "blue",
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

  updateData(data: AccidentData): void {
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
