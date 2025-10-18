import {
  VisualizationMode,
  VisualizationService,
} from "./visualizationService";

import { AccidentData } from "./dataService";
import { DataProvider } from "../providers/dataProvider";
import { Filters } from "../../types/filters";
import { VictimData } from "../models/victims";

export class MapDataService {
  private visualizationService: VisualizationService;

  constructor(visualizationService: VisualizationService) {
    this.visualizationService = visualizationService;
  }

  updateMapData(
    data: AccidentData | VictimData,
    mode?: VisualizationMode
  ): void {
    if (mode) {
      this.visualizationService.setVisualizationMode(mode, data);
    } else {
      this.visualizationService.updateData(data);
    }
  }

  clearMapData(): void {
    this.visualizationService.destroy();
  }

  setVisualizationMode(
    mode: VisualizationMode,
    data: AccidentData | VictimData
  ): void {
    this.visualizationService.setVisualizationMode(mode, data);
  }

  getCurrentVisualizationMode(): VisualizationMode {
    return this.visualizationService.getCurrentMode();
  }

  // Utility method to combine injured and dead data for visualization
  static combineAccidentData(
    safeData: AccidentData,
    injuredData: AccidentData,
    deadData: AccidentData
  ): AccidentData {
    const combined = {
      type: "FeatureCollection",
      features: [
        ...safeData.features.map((feature) => ({
          ...feature,
          properties: {
            ...feature.properties,
            type: "injured" as const,
            severity: 1,
          },
        })),
        ...injuredData.features.map((feature) => ({
          ...feature,
          properties: {
            ...feature.properties,
            type: "injured" as const,
            severity: 1,
          },
        })),
        ...deadData.features.map((feature) => ({
          ...feature,
          properties: {
            ...feature.properties,
            type: "dead" as const,
            severity: 2,
          },
        })),
      ],
    };

    return combined;
  }

  // Utility method to filter data by bounds if needed
  static filterDataByBounds(
    data: AccidentData,
    bounds: [number, number, number, number]
  ): AccidentData {
    const [minLng, minLat, maxLng, maxLat] = bounds;

    return {
      ...data,
      features: data.features.filter((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
      }),
    };
  }

  // Method to load data for different models
  async loadModelData(
    model: string,
    filters: Filters,
    bounds: [number, number, number, number],
    zoom?: number
  ): Promise<AccidentData | VictimData> {
    if (model === "victims") {
      return await DataProvider.fetchData({
        model,
        filters,
        bounds,
        zoom,
      });
    } else if (model === "accidents") {
      // For backwards compatibility, use victims table and split by status
      const victimsData = await DataProvider.fetchData({
        model: "victims",
        filters,
        bounds,
        zoom,
      });

      // Convert victims data to combined accident format
      const combined = {
        type: "FeatureCollection",
        features: victimsData.features.map((feature) => ({
          ...feature,
          properties: {
            ...feature.properties,
            type: feature.properties.estado === "MUERTO" ? "dead" : "injured",
            severity: feature.properties.estado === "MUERTO" ? 2 : 1,
          },
        })),
      };

      return combined;
    } else {
      // Generic model loading
      return await DataProvider.fetchData({
        model,
        filters,
        bounds,
        zoom,
      });
    }
  }
}
