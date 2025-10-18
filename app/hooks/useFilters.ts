import {
  VictimCondition,
  VictimFilters,
  VictimGender,
  VictimStatus,
  defaultVictimFilters,
} from "../models/victims";
import { useCallback, useState } from "react";

import { useDebounce } from "./useDebounce";

export function useFilters(
  initialFilters: VictimFilters = defaultVictimFilters
) {
  const [filters, setFilters] = useState<VictimFilters>(initialFilters);
  const debouncedFilters = useDebounce(filters, 300);

  const updateFilters = useCallback((newFilters: Partial<VictimFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const updateEdad = useCallback((edad: [number, number]) => {
    setFilters((prev) => ({ ...prev, edad: { type: "range", value: edad } }));
  }, []);

  const updateEstado = useCallback((estado: VictimStatus[]) => {
    setFilters((prev) => ({
      ...prev,
      estado: { type: "list", value: estado },
    }));
  }, []);

  const updateCondicion = useCallback((condicion: VictimCondition | "") => {
    setFilters((prev) => ({
      ...prev,
      condicion: { type: "value", value: condicion },
    }));
  }, []);

  const updateGenero = useCallback((genero: VictimGender[]) => {
    setFilters((prev) => ({
      ...prev,
      genero: { type: "list", value: genero },
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultVictimFilters);
  }, []);

  return {
    filters,
    debouncedFilters,
    setFilters,
    updateFilters,
    updateEdad,
    updateEstado,
    updateCondicion,
    updateGenero,
    resetFilters,
  };
}
