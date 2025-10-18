import { AccidentData } from "../services/dataService";
import { Filters } from "../../types/filters";

const BASE_URL = "https://geoportal-siniestralidad-vial.onrender.com/";

export interface DataProviderConfig {
  model: string;
  filters?: Filters;
  bounds?: [number, number, number, number];
  limit?: number;
  zoom?: number; // For density control
}

function buildFilterQuery(filters: Filters): string {
  const conditions: string[] = [];

  for (const [field, filter] of Object.entries(filters)) {
    switch (filter.type) {
      case "range":
        const [min, max] = filter.value;
        if (min !== "" && max !== "") {
          conditions.push(`${field} BETWEEN '${min}' AND '${max}'`);
        }
        break;
      case "list":
        if (filter.value.length > 0) {
          const values = filter.value.map((v) => `'${v}'`).join(",");
          conditions.push(`${field} IN (${values})`);
        }
        break;
      case "value":
        if (filter.value !== "") {
          conditions.push(`${field} = '${filter.value}'`);
        }
        break;
    }
  }

  return conditions.length > 0 ? conditions.join(" AND ") : "";
}

export class DataProvider {
  static async fetchData(config: DataProviderConfig): Promise<AccidentData> {
    const { model, filters, bounds, limit = 70000, zoom } = config;

    // Adjust limit based on zoom level for density control
    let adjustedLimit = limit;
    if (zoom !== undefined) {
      // Higher zoom = more detail, lower limit reduction
      // Lower zoom = less detail, higher limit reduction
      const zoomFactor = Math.max(0.1, Math.min(1, zoom / 15)); // Normalize zoom 0-15 to 0.1-1
      adjustedLimit = Math.floor(limit * zoomFactor);
      console.log(
        `🔍 Zoom ${zoom} -> adjusted limit: ${adjustedLimit} (factor: ${zoomFactor})`
      );
    }

    let url = `${BASE_URL}/collections/public.${model}/items.json?limit=${adjustedLimit}`;

    if (filters) {
      const filterQuery = buildFilterQuery(filters);
      if (filterQuery) {
        url += `&filter=${filterQuery}`;
      }
    }

    if (bounds) {
      const [minLng, minLat, maxLng, maxLat] = bounds;
      url += `&bbox=${minLng},${minLat},${maxLng},${maxLat}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch data for model ${model}: ${response.statusText}`
      );
    }

    return response.json();
  }
}
