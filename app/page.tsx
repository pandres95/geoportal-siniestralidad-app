"use client";

import {
  VisualizationMode,
  VisualizationService,
} from "./services/visualizationService";
import { useEffect, useRef, useState } from "react";

import { Box } from "@mui/material";
import { DataService } from "./services/dataService";
import LeftBar from "./components/LeftBar";
import { MapDataService } from "./services/mapDataService";
import { MapService } from "./services/mapService";
import Navbar from "./components/Navbar";
import { shouldFetchData } from "./utils/comparisonUtils";
import { useFilters } from "./hooks/useFilters";
import { useMapBounds } from "./hooks/useMapBounds";

export default function Home() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const visualizationServiceRef = useRef<VisualizationService | null>(null);
  const mapDataServiceRef = useRef<MapDataService | null>(null);
  const prevFilters = useRef<any>(null);
  const prevBounds = useRef<[number, number, number, number] | null>(null);
  const isInitializedRef = useRef(false);
  const lastFetchedDataRef = useRef<{ injured: any; dead: any } | null>(null);

  const [shouldOpenLeftBar, setShouldOpenLeftBar] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [visualizationMode, setVisualizationMode] =
    useState<VisualizationMode>("points");
  const [isChangingVisualizationMode, setIsChangingVisualizationMode] =
    useState(false);

  // Use custom hooks for state management
  const { filters, setFilters } = useFilters();

  // Handler for visualization mode changes
  const handleVisualizationModeChange = async (mode: VisualizationMode) => {
    if (isChangingVisualizationMode) return; // Prevent multiple simultaneous changes

    setIsChangingVisualizationMode(true);

    try {
      setVisualizationMode(mode);

      // If we have data and services ready, immediately update the visualization
      if (
        mapDataServiceRef.current &&
        isInitializedRef.current &&
        lastFetchedDataRef.current
      ) {
        const combinedData = MapDataService.combineAccidentData(
          lastFetchedDataRef.current.injured,
          lastFetchedDataRef.current.dead
        );
        mapDataServiceRef.current.updateMapData(combinedData, mode);
      }

      // Update map zoom constraints based on visualization mode
      if (mapInstanceRef.current) {
        if (mode === "heatmap") {
          // Heatmap mode: 13-15 (default in 14)
          // First set zoom to a safe level within new constraints, then update constraints
          const currentZoom = mapInstanceRef.current.getZoom() || 13;
          if (currentZoom > 15) {
            mapInstanceRef.current.setZoom(14);
          }
          MapService.updateZoomConstraints(mapInstanceRef.current, 13, 15);
        } else {
          // Points mode: 15-18 (default in 16)
          // First set zoom to a safe level within new constraints, then update constraints
          const currentZoom = mapInstanceRef.current.getZoom() || 13;
          if (currentZoom < 15) {
            mapInstanceRef.current.setZoom(16);
          }
          MapService.updateZoomConstraints(mapInstanceRef.current, 15, 18);
        }
      }
    } finally {
      // Always clear loading state after a short delay to ensure smooth UX
      setTimeout(() => {
        setIsChangingVisualizationMode(false);
      }, 500);
    }
  };

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        const map = await MapService.initializeMap(mapRef.current);
        mapInstanceRef.current = map;

        // Initialize visualization service
        const visualizationService = new VisualizationService(map);
        visualizationServiceRef.current = visualizationService;

        // Initialize map data service
        const mapDataService = new MapDataService(visualizationService);
        mapDataServiceRef.current = mapDataService;

        setIsMapReady(true);
        isInitializedRef.current = true;
      } catch (error) {
        console.error("Failed to initialize map:", error);
      }
    };

    initializeMap();
  }, []);

  // Use custom hook for map bounds (only when map is ready)
  const { bounds } = useMapBounds(isMapReady ? mapInstanceRef.current : null);

  // Fetch data when filters or bounds change
  useEffect(() => {
    async function fetchData() {
      if (!isInitializedRef.current || !mapInstanceRef.current) {
        return;
      }

      if (
        !shouldFetchData(
          prevBounds.current,
          bounds,
          prevFilters.current,
          filters
        )
      ) {
        return;
      }

      try {
        const result = await DataService.fetchAccidentData(filters, bounds);

        // Store the fetched data for visualization mode changes
        lastFetchedDataRef.current = result;

        // Update visualization with new data
        if (mapDataServiceRef.current) {
          const combinedData = MapDataService.combineAccidentData(
            result.injured,
            result.dead
          );
          mapDataServiceRef.current.updateMapData(
            combinedData,
            visualizationMode
          );
        }
      } catch (error) {
        console.error("❌ Failed to fetch accident data:", error);
      }
    }

    fetchData();

    prevFilters.current = filters;
    prevBounds.current = bounds;
  }, [bounds, filters, isMapReady, visualizationMode]);

  return (
    <Box sx={{ width: "100svw", height: "100vh" }}>
      <Navbar
        setShouldOpenFilters={setShouldOpenLeftBar}
        shouldOpenFilters={shouldOpenLeftBar}
        visualizationMode={visualizationMode}
        onVisualizationModeChange={handleVisualizationModeChange}
        isChangingVisualizationMode={isChangingVisualizationMode}
      />
      <LeftBar
        filters={filters}
        setFilters={setFilters}
        isOpened={shouldOpenLeftBar}
      />
      <Box ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </Box>
  );
}
