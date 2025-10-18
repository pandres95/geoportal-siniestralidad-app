export interface SchoolProperties {
  id: number;
  nombre_est: string;
  nombre_sed: string;
  orden_de_s: string;
  direccion: string;
  discapacidad: number;
  talentos_o: number;
  grupos_etn: number;
  sector: number;
  natu_jur: number;
  calendario: number;
  genero: number;
  cod_loca: string;
  especialid: number;
  clase_tipo: number;
  bilingue: number;
  fecha: string;
  dane12_est: string;
  dane12_sed: string;
  da_hipoacu: number;
  da_sordera: number;
  da_lenguas: number;
  da_ucastel: number;
  discap_fis: number;
  discap_fle: number;
  discap_pce: number;
  di_dcognit: number;
  di_sdown: number;
  dis_multip: number;
  dis_psicos: number;
  dv_bajavis: number;
  dis_ceguer: number;
  t_espectro: number;
  t_voz_y_ha: number;
  sistemica: number;
  sordocegue: number;
  otra: number;
  tot_est_ma: number;
  afrodescen: number;
  indigenas: number;
  negritudes: number;
  palenquero: number;
  raizales: number;
  rom: number;
  tot_est_et: number;
  capacid_ex: number;
  doble_exce: number;
  te_actfisi: number;
  te_artes: number;
  te_cnatur: number;
  te_csociai: number;
  te_ldsocia: number;
  te_tecnolo: number;
  tot_est_ca: number;
  tmatric_ge: number;
  zona: number;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface SchoolFeature {
  geometry: {
    coordinates: [number, number];
    type: string;
  };
  properties: SchoolProperties;
  type: string;
}

export interface SchoolData {
  features: SchoolFeature[];
  type: string;
}

import { MapLayer, VisualizationMode } from "@/types/map";

import { AccidentData } from "../services/dataService";
import { DataProvider } from "../providers/dataProvider";
import { Filters } from "../../types/filters";
import { ModelBuilder } from "../services/modelBuilder";

export interface SchoolFilters {
  // Add filters as needed - for now, no filters since schools are static
  [key: string]: any; // Allow any filters for future extensibility
}

export const SCHOOL_COLOR = "#008000"; // Green color for schools

export class SchoolsModelBuilder implements ModelBuilder {
  private filters?: Filters;
  private visualizationMode?: VisualizationMode;
  private dataProvider?: DataProvider;
  private cachedData?: AccidentData;

  withFilters(filters: Filters): this {
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
    if (!this.dataProvider) {
      throw new Error("Builder not properly configured");
    }

    // Check if we have cached data
    if (!this.cachedData) {
      console.log("Fetching schools data from API...");
      // Fetch data using dataProvider
      this.cachedData = await DataProvider.fetchData({
        model: "schools",
        filters: this.filters || {},
      });
      console.log("Cached", this.cachedData.features.length, "schools");
    } else {
      console.log("Using cached schools data");
    }

    // Process data - schools are always points
    const processedData = this.processDataset(this.cachedData, "points");

    // Return as MapLayer - schools always use points visualization
    return {
      id: "schools",
      data: processedData,
      visualizationMode: "points",
      visible: true,
    };
  }

  private processDataset(data: AccidentData, mode: VisualizationMode) {
    if (mode === "heatmap") {
      return this.convertToHeatmapData(data);
    }

    // Convert to Deck.gl format with colors
    const features = data.features.map((feature) => {
      return {
        type: "Feature" as const,
        geometry: feature.geometry,
        properties: {
          ...feature.properties,
          color: SCHOOL_COLOR,
          shape: "square" as const,
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
        weight: 1, // Schools have equal weight
      },
    }));

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }
}
