import { useCallback, useEffect, useRef, useState } from "react";

import { MapService } from "../services/mapService";
import { debounce } from "../utils/debounce";

export function useMapBounds(map: google.maps.Map | null) {
  const [bounds, setBounds] = useState<[number, number, number, number]>([
    0, 0, 0, 0,
  ]);
  const listenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const previousMapRef = useRef<google.maps.Map | null>(null);

  const updateBounds = useCallback(() => {
    if (!map) return;

    const mapBounds = MapService.getMapBounds(map);
    if (mapBounds) {
      setBounds([
        mapBounds.west,
        mapBounds.south,
        mapBounds.east,
        mapBounds.north,
      ]);
    }
  }, [map]);

  const debouncedUpdate = useCallback(debounce(updateBounds, 400), [
    updateBounds,
  ]);

  useEffect(() => {
    // Clean up previous listener if map changed
    if (
      listenerRef.current &&
      previousMapRef.current &&
      previousMapRef.current !== map
    ) {
      MapService.removeMapListener(listenerRef.current);
      listenerRef.current = null;
    }

    if (!map) {
      previousMapRef.current = map;
      return;
    }

    // Set up listener for the new map
    listenerRef.current = MapService.addMapListener(
      map,
      "idle",
      debouncedUpdate
    );

    // Set initial bounds
    updateBounds();

    previousMapRef.current = map;

    return () => {
      if (listenerRef.current) {
        MapService.removeMapListener(listenerRef.current);
        listenerRef.current = null;
      }
    };
  }, [map, debouncedUpdate, updateBounds]);

  return { bounds, updateBounds };
}
