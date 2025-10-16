import { Filters } from "../components/LeftBar";

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
  injured: AccidentData;
  dead: AccidentData;
}

const BASE_URL = "https://geoportal-siniestralidad-vial.onrender.com/";

export class DataService {
  static async fetchAccidentData(
    filters: Filters,
    bounds: [number, number, number, number]
  ): Promise<DataServiceResult> {
    const [minLng, minLat, maxLng, maxLat] = bounds;

    const injuredUrl = new URL(
      `${BASE_URL}/collections/public.accidents_injuries/items.json?limit=1000&filter=edad BETWEEN ${filters.ageRange[0]} AND ${filters.ageRange[1]}&bbox=${minLng},${minLat},${maxLng},${maxLat}`
    );

    const deadUrl = new URL(
      `${BASE_URL}/collections/public.accidents_fatalities/items.json?limit=1000&filter=edad BETWEEN ${filters.ageRange[0]} AND ${filters.ageRange[1]}&bbox=${minLng},${minLat},${maxLng},${maxLat}`
    );

    const injuredPromise = fetch(injuredUrl).then((res) => res.json());
    const deadPromise = fetch(deadUrl).then((res) => res.json());

    const [injured, dead] = await Promise.all([injuredPromise, deadPromise]);

    return {
      injured,
      dead,
    };
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
