import { MapLayer, VisualizationMode } from "../../types/map";

import { Filters } from "../../types/filters";
import { ModelBuilder } from "../services/modelBuilder";

export class DummyModelBuilder implements ModelBuilder {
  private filters?: Filters;
  private visualizationMode?: VisualizationMode;
  private dataProvider?: any; // Not used for dummy data

  withFilters(filters: Filters): this {
    this.filters = filters;
    return this;
  }

  withVisualizationMode(mode: VisualizationMode): this {
    this.visualizationMode = mode || "points"; // Default to points for testing
    return this;
  }

  fetchWith(provider: any): this {
    this.dataProvider = provider;
    return this;
  }

  async build(): Promise<MapLayer> {
    // Generate dummy data for Bogotá area
    const dummyData = this.generateDummyData();

    return {
      id: "dummy",
      data: dummyData,
      visualizationMode: this.visualizationMode || "points",
      visible: true,
    };
  }

  private generateDummyData() {
    // Bogotá coordinates approximately
    const centerLat = 4.6;
    const centerLng = -74.1;
    const radius = 0.4; // About 10km radius - more sparse

    const features = Array.from({ length: 70000 }, (_, i) => {
      // Generate random points within radius
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radius;
      const lat = centerLat + distance * Math.cos(angle);
      const lng = centerLng + distance * Math.sin(angle);

      // Random colors for variety - now using string names for MapLibre
      const colorNames = ["red", "green", "blue", "yellow", "magenta", "cyan"];
      const colorName =
        colorNames[Math.floor(Math.random() * colorNames.length)];

      return {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [lng, lat] as [number, number],
        },
        properties: {
          id: i,
          name: `Point ${i + 1}`,
          color: colorName, // String color name for MapLibre
          weight: Math.random() * 10, // For heatmap
        },
      };
    });

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }
}
