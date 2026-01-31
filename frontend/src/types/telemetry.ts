
export interface BatteryCell {
  id?: number;
  voltage?: number | null;
  temp?: number | null;
}

export interface BMSData {
  id?: number;
  cells: BatteryCell[];
  voltage?: number | null;
}

export interface TelemetryData {
  hvbms: BMSData[];
  lvbms?: BMSData | null;
  levitation: {
    verticalGap?: number | null;
    current?: number | null;
    power?: number | null;
  };
  dcBusVoltage?: number | null;
  totalBatteryVoltage?: number | null;
  unitsByMeasurementId?: Record<string, string | null | undefined>;
}
