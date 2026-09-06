export enum WorldEventType {
  MissileHitsOurCity = "missile-hits-our-city"
}

export interface WorldEvent {
  readonly type: WorldEventType;
  readonly time: number;
  readonly text: string;
  readonly value: number;
}

export interface ReportEvent {
  readonly time: number;
  readonly text: string;
  readonly impactTime?: number;
}

export enum DecisionType {
  IncomingMissile = "incoming-missile"
}

export interface DecisionResult {
  readonly type: DecisionType;
  readonly option: number;
}

export interface ControlState {
  readonly vertical: -1 | 0 | 1;
  readonly fire: boolean;
  readonly any: boolean;
}
