/* eslint-disable @next/next/no-img-element */
"use client";

import { AppBar, Box, Button, Toolbar } from "@mui/material";
import { Dispatch, SetStateAction } from "react";

import CircularProgress from "@mui/material/CircularProgress";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import MapIcon from "@mui/icons-material/Map";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import SchoolIcon from "@mui/icons-material/School";
import { VisualizationMode } from "../../types/map";
import WhatshotIcon from "@mui/icons-material/Whatshot";

interface Props {
  shouldOpenFilters: boolean;
  setShouldOpenFilters: Dispatch<SetStateAction<boolean>>;
  visualizationMode: VisualizationMode;
  onVisualizationModeChange: (mode: VisualizationMode) => void;
  isChangingVisualizationMode: boolean;
  showSchools?: boolean;
  onToggleSchools?: () => void;
  showZats?: boolean;
  onToggleZats?: () => void;
}

export default function Navbar({
  setShouldOpenFilters,
  shouldOpenFilters,
  visualizationMode,
  onVisualizationModeChange,
  isChangingVisualizationMode,
  showSchools = false,
  onToggleSchools,
  showZats = false,
  onToggleZats,
}: Props) {
  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={1}
      sx={{
        borderRadius: 3,
        width: "calc(100% - 48px)",
        left: 24,
        top: 16,
        px: 2,
        backgroundColor: "#fff",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box display="flex" sx={{ gap: 1 }}>
          <img
            src="/logoSIMUN.png"
            alt="Logo SIMUN"
            style={{ height: 32, marginRight: 8 }}
          />
          <Button
            variant="text"
            onClick={() => setShouldOpenFilters((prev) => !prev)}
            sx={{ display: "flex", p: 0 }}
          >
            {shouldOpenFilters && <FilterAltIcon sx={{ color: "black" }} />}
            {!shouldOpenFilters && (
              <FilterAltOutlinedIcon sx={{ color: "black" }} />
            )}
          </Button>
          <Button
            variant="text"
            onClick={() =>
              onVisualizationModeChange(
                visualizationMode === "points" ? "heatmap" : "points"
              )
            }
            sx={{ display: "flex", p: 0, ml: 1 }}
            title={
              visualizationMode === "heatmap"
                ? "Switch to Points (Heatmap uses alternative implementation)"
                : "Switch to Heatmap (Alternative implementation)"
            }
            disabled={isChangingVisualizationMode}
          >
            {isChangingVisualizationMode ? (
              <CircularProgress size={20} sx={{ color: "gray" }} />
            ) : visualizationMode === "heatmap" ? (
              <ScatterPlotIcon sx={{ color: "orange" }} />
            ) : (
              <WhatshotIcon sx={{ color: "black" }} />
            )}
          </Button>
          {onToggleSchools && (
            <Button
              variant="text"
              onClick={onToggleSchools}
              sx={{ display: "flex", p: 0, ml: 1 }}
              title={showSchools ? "Hide Schools" : "Show Schools"}
            >
              <SchoolIcon sx={{ color: showSchools ? "green" : "black" }} />
            </Button>
          )}
          {onToggleZats && (
            <Button
              variant="text"
              onClick={onToggleZats}
              sx={{ display: "flex", p: 0, ml: 1 }}
              title={showZats ? "Hide ZATs" : "Show ZATs"}
            >
              <MapIcon sx={{ color: showZats ? "blue" : "black" }} />
            </Button>
          )}
        </Box>
        <img src="/escudo.png" alt="Escudo UNAL" style={{ height: 40 }} />
      </Toolbar>
    </AppBar>
  );
}
