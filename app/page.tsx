"use client";

import { useEffect, useState } from "react";

import { Box } from "@mui/material";
import { DataProvider } from "./providers/dataProvider";
import LeftBar from "./components/LeftBar";
import Navbar from "./components/Navbar";
import { SchoolsModelBuilder } from "./models/schools";
import { VictimsModelBuilder } from "./models/victims";
import { VisualizationMode } from "../types/map";
import { ZatsModelBuilder } from "./models/zats";
import dynamic from "next/dynamic";
import { useFilters } from "./hooks/useFilters";

const MapComponent = dynamic(() => import("./components/MapComponent"), {
  ssr: false,
});

export default function Home() {
  const [lastFetchedData, setLastFetchedData] = useState<any>(null);
  const [schoolsData, setSchoolsData] = useState<any>(null);
  const [zatsData, setZatsData] = useState<any>(null);

  const [shouldOpenLeftBar, setShouldOpenLeftBar] = useState(false);
  const [visualizationMode, setVisualizationMode] =
    useState<VisualizationMode>("points");
  const [isChangingVisualizationMode, setIsChangingVisualizationMode] =
    useState(false);
  const [showSchools, setShowSchools] = useState(false);
  const [showZats, setShowZats] = useState(false);

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

  // Fetch schools data when showSchools is enabled
  useEffect(() => {
    if (!showSchools) return;

    async function fetchSchoolsData() {
      console.log("🏫 Fetching schools data...");

      try {
        const result = await new SchoolsModelBuilder()
          .withFilters({}) // No filters for schools
          .withVisualizationMode(visualizationMode)
          .fetchWith(new DataProvider())
          .build();

        setSchoolsData(result);
      } catch (error) {
        console.error("❌ Failed to fetch schools data: ", error);
      }
    }

    fetchSchoolsData();
  }, [showSchools, visualizationMode]);

  // Fetch ZATs data when showZats is enabled
  useEffect(() => {
    if (!showZats) return;

    async function fetchZatsData() {
      console.log("🗺️ Fetching ZATs data...");

      try {
        const result = await new ZatsModelBuilder()
          .withFilters({}) // Default filters for ZATs
          .fetchWith(new DataProvider())
          .build();

        setZatsData(result);
      } catch (error) {
        console.error("❌ Failed to fetch ZATs data: ", error);
      }
    }

    fetchZatsData();
  }, [showZats]);

  // Combine layers
  const layers = [];
  if (lastFetchedData) layers.push(lastFetchedData);
  if (schoolsData && showSchools) layers.push(schoolsData);
  if (zatsData && showZats) layers.push(zatsData);

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Navbar
        setShouldOpenFilters={setShouldOpenLeftBar}
        shouldOpenFilters={shouldOpenLeftBar}
        visualizationMode={visualizationMode}
        onVisualizationModeChange={handleVisualizationModeChange}
        isChangingVisualizationMode={isChangingVisualizationMode}
        showSchools={showSchools}
        onToggleSchools={() => setShowSchools(!showSchools)}
        showZats={showZats}
        onToggleZats={() => setShowZats(!showZats)}
      />
      <LeftBar
        filters={filters}
        setFilters={setFilters}
        isOpened={shouldOpenLeftBar}
      />
      <MapComponent layers={layers} />
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
        {lastFetchedData?.data?.features?.length || 0})
        <br />
        Schools: {schoolsData ? "YES" : "NO"} (
        {schoolsData?.data?.features?.length || 0})
        <br />
        ZATs: {zatsData ? "YES" : "NO"} ({zatsData?.data?.features?.length || 0}
        )
        <br />
        Show Schools: {showSchools ? "YES" : "NO"}
        <br />
        Show ZATs: {showZats ? "YES" : "NO"}
        <br />
        Total Layers: {layers.length}
        <br />
        Mode: {lastFetchedData?.visualizationMode || "none"}
      </div>
    </Box>
  );
}
