
export interface BatteryCell {
  id?: number;
  voltage?: number | null;
}

export interface BMSData {
  id?: number;
  cells: BatteryCell[];
  voltage?: number | null;
  temps?: (number | null)[];
}

export interface PropulsionCurrentSensors {
  uA?: number | null;
  vA?: number | null;
  wA?: number | null;
  uB?: number | null;
  vB?: number | null;
  wB?: number | null;
}

export interface PropulsionGateDriver {
  faultA?: boolean | null;
  faultB?: boolean | null;
  readyA?: boolean | null;
  readyB?: boolean | null;
}

export interface PropulsionData {
  state?: string | null;
  targetSpeed?: number | null;
  speedError?: number | null;
  actualCurrentRef?: number | null;
  slipMotor?: number | null;
  speedKmH?: number | null;
  positionM?: number | null;
  frequency?: number | null;
  modulationFrequency?: number | null;
  dutyU?: number | null;
  dutyV?: number | null;
  dutyW?: number | null;
  currentPeak?: number | null;
  batteryVoltageA?: number | null;
  batteryVoltageB?: number | null;
  currentSensors: PropulsionCurrentSensors;
  gateDriver: PropulsionGateDriver;
}

export interface VehicleStatePressures {
  high?: number | null;
  low?: number | null;
  regulatorFeedback?: number | null;
}

export interface VehicleStateBrakes {
  active?: boolean | null;
  status?: string | null;
}

export interface VehicleStateSafety {
  sdcClosed?: boolean | null;
  hvbmsConnected?: boolean | null;
  pcuConnected?: boolean | null;
  lcuConnected?: boolean | null;
}

export interface VehicleStateData {
  state?: string | null;
  pressures: VehicleStatePressures;
  brakes: VehicleStateBrakes;
  electrovalveEnabled?: boolean | null;
  safety: VehicleStateSafety;
}

export interface TelemetryData {
  hvbms: BMSData[];
  lvbms?: BMSData | null;
  levitation: {
    verticalGap?: number | null;
    current?: number | null;
    power?: number | null;
  };
  propulsion: PropulsionData;
  vehicleState: VehicleStateData;
  dcBusVoltage?: number | null;
  totalBatteryVoltage?: number | null;
  unitsByMeasurementKey?: Record<string, string | null | undefined>;
}
