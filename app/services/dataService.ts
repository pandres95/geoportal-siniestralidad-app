import {
  VICTIM_STATUS_SEVERITY,
  VictimData,
  VictimStatus,
} from "../models/victims";

import { DataProvider } from "../providers/dataProvider";
import { Filters } from "../../types/filters";

export interface AccidentData {
  features: Array<{
    geometry: {
      coordinates: [number, number];
      type: string;
    };
    properties: Record<string, any>;
    type: string;
  }>;
  type: string;
}

export interface DataServiceResult {
  safe: AccidentData;
  injured: AccidentData;
  dead: AccidentData;
}

export class DataService {
  static async fetchAccidentData(
    filters: Filters,
    bounds: [number, number, number, number],
    zoom?: number
  ): Promise<DataServiceResult> {
    // Use the new victims table instead of separate injured/dead tables
    const victimsData = await DataService.fetchVictimData(
      filters,
      bounds,
      zoom
    );

    // Split victims data into injured and dead for backwards compatibility
    const safe = {
      type: "FeatureCollection",
      features: victimsData.features.filter(
        (feature) => feature.properties.estado === "ILESO"
      ),
    };
    const injured = {
      type: "FeatureCollection",
      features: victimsData.features.filter(
        (feature) => feature.properties.estado === "HERIDO"
      ),
    };

    const dead = {
      type: "FeatureCollection",
      features: victimsData.features.filter(
        (feature) => feature.properties.estado === "MUERTO"
      ),
    };

    return {
      safe,
      injured,
      dead,
    };
  }

  static async fetchVictimData(
    filters: Filters,
    bounds: [number, number, number, number],
    zoom?: number
  ): Promise<VictimData> {
    const data = await DataProvider.fetchData({
      model: "victims",
      filters,
      bounds,
      zoom,
    });

    // Process the data to add severity based on estado
    return {
      ...data,
      features: data.features.map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          severity:
            VICTIM_STATUS_SEVERITY[feature.properties.estado as VictimStatus] ||
            1,
        },
      })),
    } as unknown as VictimData;
  }

  static processAccidentDataForVisualization(
    data: AccidentData,
    type: "injured" | "dead"
  ) {
    return {
      ...data,
      features: data.features.map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          type,
          severity: type === "dead" ? 2 : 1, // Higher severity for fatalities
        },
      })),
    };
  }
}
