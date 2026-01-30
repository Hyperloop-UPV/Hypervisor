
export interface BatteryCell {
  id: number;
  temp: number;
}

export interface BMSData {
  id: number;
  cells : BatteryCell[];
  voltage: number;
}

export interface PropulsionData {
  braking: boolean;
  acceleration: boolean;
  speed: number;
}


export interface LevitationData {
  verticalGap?: number;
  lateralOffset?: number;
  verticalAccel?: number;
  lateralAccel?: number;
  magnetTemp?: number;
  current?: number;
  power?: number;
}

export interface CamerasData{
  url: string;
  status: string;
}

export interface TelemetryData {
  hvbms: BMSData[];
  lvbms: BMSData;
  propulsion: PropulsionData | any; 
  levitation: LevitationData | any;
  cameras: CamerasData | any;
  dcBusVoltage?: number;
}
