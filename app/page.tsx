"use client";

import { useEffect, useState } from "react";

import { Box } from "@mui/material";
import { DataProvider } from "./providers/dataProvider";
import LeftBar from "./components/LeftBar";
import MapComponent from "./components/MapComponent";
import Navbar from "./components/Navbar";
import { VictimsModelBuilder } from "./models/victims";
import { VisualizationMode } from "../types/map";
import { useFilters } from "./hooks/useFilters";

export default function Home() {
  const [lastFetchedData, setLastFetchedData] = useState<any>(null);

  const [shouldOpenLeftBar, setShouldOpenLeftBar] = useState(false);
  const [visualizationMode, setVisualizationMode] =
    useState<VisualizationMode>("points");
  const [isChangingVisualizationMode, setIsChangingVisualizationMode] =
    useState(false);

  // Use custom hooks for state management
  const { filters, debouncedFilters, setFilters } = useFilters();

  // Handler for visualization mode changes
  const handleVisualizationModeChange = async (mode: VisualizationMode) => {
    if (isChangingVisualizationMode) return; // Prevent multiple simultaneous changes

    setIsChangingVisualizationMode(true);

    try {
      setVisualizationMode(mode);
    } finally {
      // Always clear loading state after a short delay to ensure smooth UX
      setTimeout(() => {
        setIsChangingVisualizationMode(false);
      }, 500);
    }
  };

  // Fetch data on component mount and when debounced filters change
  useEffect(() => {
    async function fetchData() {
      console.log(
        "🔍 Fetching victims data for visualization mode:",
        visualizationMode
      );

      try {
        // Use actual victims data
        const result = await new VictimsModelBuilder()
          .withFilters(debouncedFilters as any) // Use debounced filters to avoid excessive API calls
          .withVisualizationMode(visualizationMode)
          .fetchWith(new DataProvider()) // Use actual data provider
          .build();

        // Store the processed data
        setLastFetchedData(result);
      } catch (error) {
        console.error("❌ Failed to fetch victims data: ", error);
      }
    }

    fetchData();
  }, [visualizationMode, debouncedFilters]); // Use debounced filters to prevent excessive API calls

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
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
      <MapComponent layers={lastFetchedData ? [lastFetchedData] : []} />
      {/* Debug */}
      <div
        style={{
          position: "fixed",
          top: 10,
          left: 10,
          background: "white",
          padding: "5px",
          zIndex: 1000,
          fontSize: "12px",
        }}
      >
        Data: {lastFetchedData ? "YES" : "NO"}
        <br />
        Layers: {lastFetchedData ? 1 : 0}
        <br />
        Features: {lastFetchedData?.data?.features?.length || 0}
        <br />
        Mode: {lastFetchedData?.visualizationMode || "none"}
        <br />
        Passed: {JSON.stringify(lastFetchedData ? [lastFetchedData].length : 0)}
      </div>
    </Box>
  );
}
