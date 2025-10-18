export interface ZatProperties {
  id: number;
  objectid: number;
  mun_cod: number;
  nom_mun: string;
  zat: string;
  utam: string;
  tmatric_ge_sum: number;
  victimas: number;
  fallecidos: number;
  poblacion_t: number;
  poblacion_menor_5: number;
  poblacion_menor_18: number;
  victimas_menor_18: number;
  fallecidos_menor_18: number;
  tasa_victi_x_matric_c1000: number;
  tasa_falle_x_matric_c1000: number;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface ZatFeature {
  geometry: {
    coordinates: number[][][][];
    type: string;
  };
  properties: ZatProperties;
  type: string;
}

export interface ZatData {
  features: ZatFeature[];
  type: string;
}

import { Filters, ListFilter, RangeFilter } from "../../types/filters";
import { MapLayer, VisualizationMode } from "@/types/map";

import { AccidentData } from "../services/dataService";
import { DataProvider } from "../providers/dataProvider";
import { ModelBuilder } from "../services/modelBuilder";

export interface ZatFilters {
  mun_cod: ListFilter<number>;
  nom_mun: ListFilter<string>;
  zat: ListFilter<string>;
  utam: ListFilter<string>;
  victimas: RangeFilter<number>;
  fallecidos: RangeFilter<number>;
  poblacion_t: RangeFilter<number>;
  poblacion_menor_5: RangeFilter<number>;
  poblacion_menor_18: RangeFilter<number>;
  victimas_menor_18: RangeFilter<number>;
  fallecidos_menor_18: RangeFilter<number>;
  tasa_victi_x_matric_c1000: RangeFilter<number>;
  tasa_falle_x_matric_c1000: RangeFilter<number>;
}

// Filter configuration for UI rendering
export interface FilterConfig<T = any> {
  label: string;
  options?: T[]; // For list/value filters
  min?: number; // For range filters
  max?: number; // For range filters
}

export const zatFilterConfig: {
  [K in keyof ZatFilters]: FilterConfig<ZatFilters[K]["value"]>;
} = {
  mun_cod: {
    label: "Municipality Code",
  },
  nom_mun: {
    label: "Municipality Name",
  },
  zat: {
    label: "ZAT Zone",
  },
  utam: {
    label: "UTAM Zone",
  },
  victimas: {
    label: "Total Victims",
    min: 0,
    max: 1000,
  },
  fallecidos: {
    label: "Total Fatalities",
    min: 0,
    max: 100,
  },
  poblacion_t: {
    label: "Total Population",
    min: 0,
    max: 100000,
  },
  poblacion_menor_5: {
    label: "Population Under 5",
    min: 0,
    max: 10000,
  },
  poblacion_menor_18: {
    label: "Population Under 18",
    min: 0,
    max: 50000,
  },
  victimas_menor_18: {
    label: "Victims Under 18",
    min: 0,
    max: 100,
  },
  fallecidos_menor_18: {
    label: "Fatalities Under 18",
    min: 0,
    max: 20,
  },
  tasa_victi_x_matric_c1000: {
    label: "Victim Rate per 1000 Vehicles",
    min: 0,
    max: 50,
  },
  tasa_falle_x_matric_c1000: {
    label: "Fatality Rate per 1000 Vehicles",
    min: 0,
    max: 5,
  },
};

// Default filter values
export const defaultZatFilters: ZatFilters = {
  mun_cod: { type: "list", value: [] },
  nom_mun: { type: "list", value: [] },
  zat: { type: "list", value: [] },
  utam: { type: "list", value: [] },
  victimas: { type: "range", value: [0, 1000] },
  fallecidos: { type: "range", value: [0, 100] },
  poblacion_t: { type: "range", value: [0, 100000] },
  poblacion_menor_5: { type: "range", value: [0, 10000] },
  poblacion_menor_18: { type: "range", value: [0, 50000] },
  victimas_menor_18: { type: "range", value: [0, 100] },
  fallecidos_menor_18: { type: "range", value: [0, 20] },
  tasa_victi_x_matric_c1000: { type: "range", value: [0, 50] },
  tasa_falle_x_matric_c1000: { type: "range", value: [0, 5] },
};

export class ZatsModelBuilder implements ModelBuilder {
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
    if (!this.dataProvider || !this.filters) {
      throw new Error("Builder not properly configured");
    }

    // Check if we have cached data with the same filters
    if (!this.cachedData) {
      console.log("Fetching ZATs data from API...");
      // Fetch data using dataProvider
      this.cachedData = await DataProvider.fetchData({
        model: "zat",
        filters: this.filters,
        // bounds and zoom will be handled by the dataProvider
      });
      console.log("Cached", this.cachedData.features.length, "ZAT zones");
    } else {
      console.log("Using cached ZATs data");
    }

    // Process data (ZATs are always polygons)
    const processedData = this.processDataset(this.cachedData);

    // Return as MapLayer - ZATs always use polygons visualization
    return {
      id: "zats",
      data: processedData,
      visualizationMode: "polygons",
      visible: true,
    };
  }

  private processDataset(data: AccidentData) {
    // ZATs are polygons, so we only support polygon visualization
    // Convert to format with colors based on victim rates
    const features = data.features.map((feature) => {
      const victimRate = feature.properties.tasa_victi_x_matric_c1000 || 0;

      // Color based on victim rate (higher rate = more red)
      const intensity = Math.min(victimRate / 20, 1); // Normalize to 0-1
      const color: [number, number, number, number] = [
        Math.floor(255 * intensity), // Red
        Math.floor(255 * (1 - intensity)), // Green
        0, // Blue
        180, // Alpha
      ];

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
}
