export type matrixType =
  | "cumulative_confirmed"
  | "new_confirmed"
  | "new_deceased";

export interface CoviScopeReq {
  startDate: string;
  endDate: string;
  aggregationFunc: string;
  matrix: matrixType;
  countries: string[];
}

export interface TimeseriesData {
  date: string;
  value: number;
}

export interface CoviScopeRes {
  data: TimeseriesData[];
  error: string;
}
