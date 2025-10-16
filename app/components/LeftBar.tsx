"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Slider,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { Dispatch, SetStateAction, useState } from "react";

export interface Filters {
  ageRange: [number, number];
}

interface Props {
  isOpened: boolean;
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
}

const marks = [
  {
    value: 8,
    label: "8",
  },
  {
    value: 50,
    label: "50",
  },
];

export default function LeftBar({ filters, setFilters, isOpened }: Props) {
  const [tempValue, setTempValue] = useState(filters.ageRange);
  return (
    <Box
      sx={{
        position: "fixed",
        top: 112,
        left: 24,
        width: { xs: "calc(100vw - 48px)", md: 480 },
        borderRadius: 3,
        bgcolor: "#f5f5f5",
        boxShadow: 3,
        zIndex: 1200,
        p: 2,
        overflowY: "auto",
        display: isOpened ? "block" : "none",
      }}
    >
      <Typography
        variant="h3"
        sx={{ mb: 2, pr: 1 }}
        fontSize={24}
        fontWeight={700}
        textAlign="center"
      >
        Indicadores de seguridad vial juvenil
      </Typography>

      <Accordion
        variant="outlined"
        sx={{
          background: "transparent",
          borderLeft: 0,
          borderRight: 0,
          borderTop: 0,
          "::before": {
            display: "none",
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Box display="flex" sx={{ alignItems: "center", gap: 1 }}>
            <PersonOutlinedIcon sx={{ width: 16 }} />{" "}
            <Typography>Edad</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Slider
            aria-label="Always visible"
            value={tempValue}
            onChangeCommitted={() =>
              setFilters((prev) => ({
                ...prev,
                ageRange: [tempValue[0], tempValue[1]],
              }))
            }
            onChange={(_, [min, max]) => setTempValue([min, max])}
            valueLabelDisplay="auto"
            min={8}
            max={50}
            marks={marks}
            //getAriaValueText={valuetext}
          />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
