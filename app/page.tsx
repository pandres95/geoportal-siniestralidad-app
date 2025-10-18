"use client";

import { useEffect, useState } from "react";

import { Box } from "@mui/material";
import { DataProvider } from "./providers/dataProvider";
import LeftBar from "./components/LeftBar";
import MapComponent from "./components/MapComponent";
import Navbar from "./components/Navbar";
import { VictimsModelBuilder } from "./models/victims";
import { VisualizationMode } from "../types/map";
import { ZatsModelBuilder } from "./models/zats";
import { useFilters } from "./hooks/useFilters";

export default function Home() {
  const [lastFetchedData, setLastFetchedData] = useState<any>(null);
  const [zatData, setZatData] = useState<any>(null);

  const [shouldOpenLeftBar, setShouldOpenLeftBar] = useState(false);
  const [visualizationMode, setVisualizationMode] =
    useState<VisualizationMode>("points");
  const [isChangingVisualizationMode, setIsChangingVisualizationMode] =
    useState(false);
  const [showZats, setShowZats] = useState(true);

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

  // Fetch victims data
  useEffect(() => {
    async function fetchVictimsData() {
      console.log(
        "🔍 Fetching victims data for visualization mode:",
        visualizationMode
      );

      try {
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

    fetchVictimsData();
  }, [visualizationMode, debouncedFilters]); // Use debounced filters to prevent excessive API calls

  // Fetch ZAT data
  useEffect(() => {
    async function fetchZatData() {
      if (!showZats) return;

      console.log("🔍 Fetching ZAT data");

      try {
        const result = await new ZatsModelBuilder()
          .withFilters({} as any) // ZATs don't need filters for now
          .withVisualizationMode("polygons") // ZATs are polygons
          .fetchWith(new DataProvider())
          .build();

        setZatData(result);
      } catch (error) {
        console.error("❌ Failed to fetch ZAT data: ", error);
      }
    }

    fetchZatData();
  }, [showZats]); // Only refetch when showZats changes

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Navbar
        setShouldOpenFilters={setShouldOpenLeftBar}
        shouldOpenFilters={shouldOpenLeftBar}
        visualizationMode={visualizationMode}
        onVisualizationModeChange={handleVisualizationModeChange}
        isChangingVisualizationMode={isChangingVisualizationMode}
        currentModel={showZats ? "zats" : "victims"}
        onModelChange={(model) => setShowZats(model === "zats")}
      />
      <LeftBar
        filters={filters}
        setFilters={setFilters}
        isOpened={shouldOpenLeftBar}
      />
      <MapComponent
        layers={[
          ...(lastFetchedData ? [lastFetchedData] : []),
          ...(zatData ? [zatData] : []),
        ]}
      />
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
        Victims: {lastFetchedData ? "YES" : "NO"} (
        {lastFetchedData?.data?.features?.length || 0} features)
        <br />
        ZATs: {zatData ? "YES" : "NO"} ({zatData?.data?.features?.length || 0}{" "}
        features)
        <br />
        Total Layers:{" "}
        {
          [
            ...(zatData ? [zatData] : []),
            ...(lastFetchedData ? [lastFetchedData] : []),
          ].length
        }
        <br />
        Mode: {lastFetchedData?.visualizationMode || "none"}
      </div>
    </Box>
  );
}
