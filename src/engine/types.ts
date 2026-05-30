export type ThreatState = "green" | "yellow" | "orange" | "red" | "blue";
export type SessionStatus = "complete" | "partial" | "skipped" | "not_started";
export type SalvageType = "abbreviated" | "mobility" | "reduced" | "emergency" | null;

export interface SetRecord {
  reps: number;
  weight: number;
  unit: "lbs" | "kg" | "bw";
}

export interface ExerciseRecord {
  exerciseId: string;
  name: string;
  isSessionSwap: boolean;
  swappedFromId: string | null;
  sets: SetRecord[];
  completed: boolean;
}

export interface SessionRecord {
  id: string;
  date: string; // YYYY-MM-DD
  dayKey: string;
  dayType: string;
  status: SessionStatus;
  salvageType: SalvageType;
  exercises: ExerciseRecord[];
  summary: {
    exerciseCount: number;
    totalSets: number;
    totalVolume: number;
  };
  startedAt: string | null;
  completedAt: string | null;
}

export interface AdherenceRecord {
  date: string;
  scheduled: boolean;
  completed: boolean;
  partial: boolean;
  adherenceValue: number;
  threatState: ThreatState;
  recoveryMode: boolean;
  plannedAbsence: boolean;
}

export interface RecoveryModeRecord {
  active: boolean;
  enteredDate: string | null;
  entryType: "manual" | "auto" | "planned_absence" | null;
  plannedEndDate: string | null;
  exitDate: string | null;
  exitType: "manual" | "auto" | "planned_expiry" | null;
  consecutiveCompletedDuringRecovery: number;
  daysInRecovery: number;
}

export interface PlannedAbsence {
  id: string;
  startDate: string;
  endDate: string;
  reason: "travel" | "illness" | "injury" | "deload" | "other";
  createdDate: string;
}

export interface GoalRecord {
  id: string;
  tier: number;
  label: string;
  status: "achieved" | "active" | "locked";
  achievedDate: string | null;
  progressValue: number;
  targetValue: number;
}

export interface CardioSession {
  id: string;
  date: string; // YYYY-MM-DD
  duration: number; // minutes
  speed: number;    // mph
  status: "complete" | "skipped" | "not_started";
  completedAt: string | null;
}

export interface CardioBehavioralState {
  threatState: ThreatState;
  streak: number;
  adherenceRate: number;
  todayStatus: "complete" | "skipped" | "not_started";
}

export interface BehavioralState {
  threatState: ThreatState;
  recoveryCredits: number;
  recoveryMode: RecoveryModeRecord;
  streak: number;
  adherenceRate: number; // 0..1
  windowSkips: number; // skips in rolling 7-day
}
