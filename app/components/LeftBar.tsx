"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Slider,
  Typography,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { VictimFilters, victimFilterConfig } from "../models/victims";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

interface Props {
  isOpened: boolean;
  filters: VictimFilters;
  setFilters: Dispatch<SetStateAction<VictimFilters>>;
}

export default function LeftBar({ filters, setFilters, isOpened }: Props) {
  const renderFilter = (fieldName: keyof VictimFilters) => {
    const filter = filters[fieldName];
    const config = victimFilterConfig[fieldName];

    const handleRangeChange = (newValue: number | number[]) => {
      if (Array.isArray(newValue)) {
        setFilters((prev) => ({
          ...prev,
          [fieldName]: { type: "range", value: [newValue[0], newValue[1]] },
        }));
      }
    };

    const handleListChange = (value: any) => {
      const listValue = Array.isArray(value) ? value : [value];
      setFilters((prev) => ({
        ...prev,
        [fieldName]: { type: "list", value: listValue },
      }));
    };

    const handleValueChange = (value: any) => {
      setFilters((prev) => ({
        ...prev,
        [fieldName]: { type: "value", value },
      }));
    };

    return (
      <Accordion
        key={fieldName}
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
          aria-controls={`${fieldName}-content`}
          id={`${fieldName}-header`}
        >
          <Box display="flex" sx={{ alignItems: "center", gap: 1 }}>
            <PersonOutlinedIcon sx={{ width: 16 }} />{" "}
            <Typography>{config.label}</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {filter.type === "range" &&
            Array.isArray(filter.value) &&
            typeof filter.value[0] === "number" && (
              <Slider
                aria-label={`${config.label} range`}
                value={filter.value as [number, number]}
                onChange={(_, newValue) => handleRangeChange(newValue)}
                valueLabelDisplay="auto"
                min={config.min}
                max={config.max}
                marks={[
                  {
                    value: config.min || 0,
                    label: (config.min || 0).toString(),
                  },
                  {
                    value: config.max || 100,
                    label: (config.max || 100).toString(),
                  },
                ]}
              />
            )}
          {filter.type === "list" &&
            config.options &&
            Array.isArray(filter.value) && (
              <FormControl fullWidth>
                <InputLabel>{config.label}</InputLabel>
                <Select
                  multiple
                  value={filter.value}
                  onChange={(e) => handleListChange(e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {config.options.map((option) => (
                    <MenuItem key={String(option)} value={option}>
                      <Checkbox
                        checked={
                          Array.isArray(filter.value) &&
                          filter.value.indexOf(option) > -1
                        }
                      />
                      <ListItemText primary={option} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          {filter.type === "value" &&
            config.options &&
            typeof filter.value === "string" && (
              <FormControl fullWidth>
                <InputLabel>{config.label}</InputLabel>
                <Select
                  value={filter.value}
                  onChange={(e) => handleValueChange(e.target.value)}
                >
                  {config.options.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option || <em>Ninguna</em>}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
        </AccordionDetails>
      </Accordion>
    );
  };

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

      {(Object.keys(victimFilterConfig) as (keyof VictimFilters)[]).map(
        renderFilter
      )}
    </Box>
  );
}
