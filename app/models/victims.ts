export type VictimStatus = "ILESO" | "HERIDO" | "MUERTO";
export type VictimCondition =
  | "CICLISTA"
  | "CONDUCTOR"
  | "MOTOCICLISTA"
  | "PASAJERO"
  | "PEATON";
export type VictimGender = "FEMENINO" | "MASCULINO" | "SIN INFORMACION";

export interface VictimProperties {
  estado: VictimStatus;
  edad: number;
  condicion: VictimCondition;
  fecha: string; // ISO date string
  genero: VictimGender;
  [key: string]: any;
}

export interface VictimFeature {
  geometry: {
    coordinates: [number, number];
    type: string;
  };
  properties: VictimProperties;
  type: string;
}

export interface VictimData {
  features: VictimFeature[];
  type: string;
}

import {
  Filters,
  ListFilter,
  RangeFilter,
  ValueFilter,
} from "../../types/filters";
import { MapLayer, VisualizationMode } from "@/types/map";

import { AccidentData } from "../services/dataService";
import { DataProvider } from "../providers/dataProvider";
import { ModelBuilder } from "../services/modelBuilder";

export interface VictimFilters {
  edad: RangeFilter<number>;
  estado: ListFilter<VictimStatus>;
  condicion: ValueFilter<VictimCondition | "">; // Allow empty string for no filter
  fecha: RangeFilter<string>; // ISO date strings
  genero: ListFilter<VictimGender>;
}

// Filter configuration for UI rendering
export interface FilterConfig<T = any> {
  label: string;
  options?: T[]; // For list/value filters
  min?: number; // For range filters
  max?: number; // For range filters
}

export const victimFilterConfig: {
  [K in keyof VictimFilters]: FilterConfig;
} = {
  edad: {
    label: "Edad",
    min: 8,
    max: 50,
  },
  estado: {
    label: "Estado",
    options: ["ILESO", "HERIDO", "MUERTO"] as VictimStatus[],
  },
  condicion: {
    label: "Condición",
    options: [
      "",
      "CICLISTA",
      "CONDUCTOR",
      "MOTOCICLISTA",
      "PASAJERO",
      "PEATON",
    ] as (VictimCondition | "")[],
  },
  fecha: {
    label: "Fecha",
  },
  genero: {
    label: "Género",
    options: ["FEMENINO", "MASCULINO", "SIN INFORMACION"] as VictimGender[],
  },
};

// Default filter values
export const defaultVictimFilters: VictimFilters = {
  edad: { type: "range", value: [8, 50] },
  estado: { type: "list", value: [] }, // Empty means no filter
  condicion: { type: "value", value: "" }, // Empty string means no filter
  fecha: { type: "range", value: ["", ""] }, // Empty strings mean no filter
  genero: { type: "list", value: [] }, // Empty means no filter
};

export const VICTIM_STATUS_COLORS: Record<VictimStatus, string> = {
  ILESO: "#0000ff", // blue
  HERIDO: "#ffff00", // yellow
  MUERTO: "#ff0000", // red
};

export const VICTIM_STATUS_SEVERITY: Record<VictimStatus, number> = {
  ILESO: 1,
  HERIDO: 2,
  MUERTO: 3,
};
export class VictimsModelBuilder implements ModelBuilder {
  private filters?: Filters;
  private visualizationMode?: VisualizationMode;
  private dataProvider?: DataProvider;
  private cachedData?: AccidentData;

  withFilters(filters: Filters): this {
    // Clear cache if filters changed
    if (JSON.stringify(this.filters) !== JSON.stringify(filters)) {
      this.cachedData = undefined;
    }
    this.filters = filters;
    return this;
  }

  withVisualizationMode(mode: VisualizationMode): this {
    this.visualizationMode = mode;
    return this;
  }

  fetchWith(provider: DataProvider): this {
    this.dataProvider = provider;
    return this;
  }

  async build(): Promise<MapLayer> {
    if (!this.dataProvider || !this.filters || !this.visualizationMode) {
      throw new Error("Builder not properly configured");
    }

    // Check if we have cached data with the same filters
    if (!this.cachedData) {
      console.log("Fetching victims data from API...");
      // Fetch data using dataProvider
      this.cachedData = await DataProvider.fetchData({
        model: "victims",
        filters: this.filters,
        // bounds and zoom will be handled by the dataProvider
      });
      console.log("Cached", this.cachedData.features.length, "victims");
    } else {
      console.log("Using cached victims data");
    }

    // Process data based on visualization mode
    const processedData = this.processDataset(
      this.cachedData,
      this.visualizationMode
    );

    // Return as MapLayer
    return {
      id: "victims",
      data: processedData,
      visualizationMode: this.visualizationMode,
      visible: true,
    };
  }

  private processDataset(data: AccidentData, mode: VisualizationMode) {
    if (mode === "heatmap") {
      return this.convertToHeatmapData(data);
    }

    // Convert to Deck.gl format with colors
    const features = data.features.map((feature) => {
      const estado = feature.properties
        .estado as keyof typeof VICTIM_STATUS_COLORS;
      const colorString = estado
        ? VICTIM_STATUS_COLORS[estado]
        : "rgb(255, 0, 0)";

      // Convert hex color to RGBA array for Leaflet
      const color = this.hexToRgbaArray(colorString);

      return {
        type: "Feature" as const,
        geometry: feature.geometry,
        properties: {
          ...feature.properties,
          color,
        },
      };
    });

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }

  private convertToHeatmapData(data: AccidentData) {
    const features = data.features.map((feature) => ({
      type: "Feature" as const,
      geometry: feature.geometry,
      properties: {
        weight: 1, // Could be based on severity or other factors
      },
    }));

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }

  private hexToRgbaArray(hexString: string): string {
    // For Leaflet, just return the hex color directly
    return hexString;
  }
}
