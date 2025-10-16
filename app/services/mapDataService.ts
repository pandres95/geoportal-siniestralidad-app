import {
  VisualizationMode,
  VisualizationService,
} from "./visualizationService";

import { AccidentData } from "./dataService";

export class MapDataService {
  private visualizationService: VisualizationService;

  constructor(visualizationService: VisualizationService) {
    this.visualizationService = visualizationService;
  }

  updateMapData(data: AccidentData, mode?: VisualizationMode): void {
    if (mode) {
      this.visualizationService.setVisualizationMode(mode, data);
    } else {
      this.visualizationService.updateData(data);
    }
  }

  clearMapData(): void {
    this.visualizationService.destroy();
  }

  setVisualizationMode(mode: VisualizationMode, data: AccidentData): void {
    this.visualizationService.setVisualizationMode(mode, data);
  }

  getCurrentVisualizationMode(): VisualizationMode {
    return this.visualizationService.getCurrentMode();
  }

  // Utility method to combine injured and dead data for visualization
  static combineAccidentData(
    injuredData: AccidentData,
    deadData: AccidentData
  ): AccidentData {
    const combined = {
      type: "FeatureCollection",
      features: [
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
}
