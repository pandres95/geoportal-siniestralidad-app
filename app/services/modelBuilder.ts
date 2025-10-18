import { MapLayer, VisualizationMode } from "../../types/map";

import { DataProvider } from "../providers/dataProvider";
import { Filters } from "../../types/filters";

export interface ModelBuilder {
  withFilters(filters: Filters): this;
  withVisualizationMode(mode: VisualizationMode): this;
  fetchWith(provider: DataProvider): this;
  build(): Promise<MapLayer>;
}

export interface ModelConfig {
  constructor: new () => ModelBuilder;
  filters: Filters;
  visualizationMode: VisualizationMode;
  enabled: boolean;
}
