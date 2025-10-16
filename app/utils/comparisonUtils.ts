import { Filters } from "../components/LeftBar";

export const areTheSameFilters = (
  prev: Filters | null,
  curr: Filters
): boolean => {
  if (!prev) {
    return false;
  }
  if (
    prev.ageRange[0] !== curr.ageRange[0] ||
    prev.ageRange[1] !== curr.ageRange[1]
  ) {
    return false;
  }
  return true;
};

export const areTheSameBounds = (
  prev: null | [number, number, number, number],
  curr: [number, number, number, number]
): boolean => {
  if (!prev) {
    return false;
  }
  if (prev.some((bound, idx) => bound !== curr[idx])) {
    return false;
  }
  return true;
};

export const hasValidBounds = (
  bounds: [number, number, number, number]
): boolean => {
  return bounds.some((bound) => !!bound);
};

export const shouldFetchData = (
  prevBounds: [number, number, number, number] | null,
  currentBounds: [number, number, number, number],
  prevFilters: Filters | null,
  currentFilters: Filters
): boolean => {
  if (!hasValidBounds(currentBounds)) {
    return false;
  }

  return (
    !areTheSameBounds(prevBounds, currentBounds) ||
    !areTheSameFilters(prevFilters, currentFilters)
  );
};
