export type FilterType = "range" | "list" | "value";

export interface RangeFilter<T = any> {
  type: "range";
  value: [T, T];
}

export interface ListFilter<T = any> {
  type: "list";
  value: T[];
}

export interface ValueFilter<T = any> {
  type: "value";
  value: T;
}

export type FilterItem<T = any> =
  | RangeFilter<T>
  | ListFilter<T>
  | ValueFilter<T>;

export interface Filters {
  [fieldName: string]: FilterItem;
}
