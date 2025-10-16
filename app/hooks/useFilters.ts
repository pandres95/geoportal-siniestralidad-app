import { useCallback, useState } from "react";

import { Filters } from "../components/LeftBar";

const defaultFilters: Filters = {
  ageRange: [8, 50],
};

export function useFilters(initialFilters: Filters = defaultFilters) {
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const updateFilters = useCallback((newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const updateAgeRange = useCallback((ageRange: [number, number]) => {
    setFilters((prev) => ({ ...prev, ageRange }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return {
    filters,
    setFilters,
    updateFilters,
    updateAgeRange,
    resetFilters,
  };
}
