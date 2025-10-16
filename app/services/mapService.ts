export interface MapConfig {
  center: { lat: number; lng: number };
  zoom: number;
  minZoom: number;
  maxZoom?: number;
  mapTypeControl: boolean;
  fullscreenControl: boolean;
  streetViewControl: boolean;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export class MapService {
  private static instance: google.maps.Map | null = null;
  private static isGoogleMapsLoaded = false;

  static getInstance(): google.maps.Map | null {
    return this.instance;
  }

  static async initializeMap(
    mapElement: HTMLDivElement,
    config: Partial<MapConfig> = {}
  ): Promise<google.maps.Map> {
    return new Promise((resolve, reject) => {
      const defaultConfig: MapConfig = {
        center: { lat: 4.710989, lng: -74.072092 }, // Bogotá, Colombia
        zoom: 15, // Default zoom for points mode (more detailed)
        minZoom: 15, // Allow zooming out to see broader area
        maxZoom: 18, // Allow close-up views
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        ...config,
      };

      const initializeMapInstance = () => {
        if (!window.google || !mapElement) {
          reject(new Error("Google Maps not loaded or map element not found"));
          return;
        }

        const map = new window.google.maps.Map(mapElement, defaultConfig);
        this.instance = map;
        this.isGoogleMapsLoaded = true;
        resolve(map);
      };

      if (!window.google) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=visualization`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMapInstance;
        script.onerror = () =>
          reject(new Error("Failed to load Google Maps script"));
        document.head.appendChild(script);
      } else {
        initializeMapInstance();
      }
    });
  }

  static getMapBounds(map: google.maps.Map): MapBounds | null {
    const bounds = map.getBounds();
    if (!bounds) return null;

    return {
      north: bounds.getNorthEast().lat(),
      south: bounds.getSouthWest().lat(),
      east: bounds.getNorthEast().lng(),
      west: bounds.getSouthWest().lng(),
    };
  }

  static setMapBounds(map: google.maps.Map, bounds: MapBounds): void {
    const googleBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(bounds.south, bounds.west),
      new google.maps.LatLng(bounds.north, bounds.east)
    );
    map.fitBounds(googleBounds);
  }

  static addMapListener(
    map: google.maps.Map,
    event: string,
    handler: () => void
  ): google.maps.MapsEventListener {
    return map.addListener(event, handler);
  }

  static removeMapListener(listener: google.maps.MapsEventListener): void {
    window.google?.maps?.event?.removeListener(listener);
  }

  static updateZoomConstraints(
    map: google.maps.Map,
    minZoom?: number,
    maxZoom?: number
  ): void {
    const options: google.maps.MapOptions = {};

    if (minZoom !== undefined) {
      options.minZoom = minZoom;
    }
    if (maxZoom !== undefined) {
      options.maxZoom = maxZoom;
    }

    // Ensure minZoom doesn't exceed maxZoom
    if (options.minZoom !== undefined && options.maxZoom !== undefined) {
      if (options.minZoom > options.maxZoom) {
        console.warn(
          `Invalid zoom constraints: minZoom (${options.minZoom}) > maxZoom (${options.maxZoom}). Swapping values.`
        );
        const temp = options.minZoom;
        options.minZoom = options.maxZoom;
        options.maxZoom = temp;
      }
    }

    // Set both options together to avoid constraint conflicts
    if (Object.keys(options).length > 0) {
      map.setOptions(options);
    }
  }

  static isLoaded(): boolean {
    return this.isGoogleMapsLoaded && !!this.instance;
  }

  static destroy(): void {
    this.instance = null;
    this.isGoogleMapsLoaded = false;
  }
}
