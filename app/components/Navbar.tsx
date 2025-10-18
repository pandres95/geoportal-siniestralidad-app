/* eslint-disable @next/next/no-img-element */
"use client";

import { AppBar, Box, Button, Toolbar } from "@mui/material";
import { Dispatch, SetStateAction } from "react";

import CircularProgress from "@mui/material/CircularProgress";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import SquareIcon from "@mui/icons-material/Square";
import { VisualizationMode } from "../services/visualizationService";
import WhatshotIcon from "@mui/icons-material/Whatshot";

interface Props {
  shouldOpenFilters: boolean;
  setShouldOpenFilters: Dispatch<SetStateAction<boolean>>;
  visualizationMode: VisualizationMode;
  onVisualizationModeChange: (mode: VisualizationMode) => void;
  isChangingVisualizationMode: boolean;
  currentModel: "victims" | "zats";
  onModelChange: (model: "victims" | "zats") => void;
}

export default function Navbar({
  setShouldOpenFilters,
  shouldOpenFilters,
  visualizationMode,
  onVisualizationModeChange,
  isChangingVisualizationMode,
  currentModel,
  onModelChange,
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
          <Button
            variant="text"
            onClick={() =>
              onModelChange(currentModel === "victims" ? "zats" : "victims")
            }
            sx={{ display: "flex", p: 0, ml: 1 }}
            title={
              currentModel === "zats"
                ? "Switch to Victims Data"
                : "Switch to ZAT Zones"
            }
          >
            <SquareIcon
              sx={{ color: currentModel === "zats" ? "blue" : "black" }}
            />
          </Button>
        </Box>
        <img src="/escudo.png" alt="Escudo UNAL" style={{ height: 40 }} />
      </Toolbar>
    </AppBar>
  );
}
