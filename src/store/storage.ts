import type { SessionRecord, AdherenceRecord, RecoveryModeRecord, PlannedAbsence, GoalRecord } from "../engine/types";
import type { DayTemplate } from "../data/program";
import { DEFAULT_PROGRAM } from "../data/program";

const KEYS = {
  sessions: "ironlog_sessions",
  adherence: "ironlog_adherence",
  recovery: "ironlog_recovery",
  absences: "ironlog_absences",
  goals: "ironlog_goals",
  program: "ironlog_program",
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadSessions(): SessionRecord[] {
  return load<SessionRecord[]>(KEYS.sessions, []);
}

export function saveSessions(sessions: SessionRecord[]): void {
  save(KEYS.sessions, sessions);
}

export function loadAdherence(): AdherenceRecord[] {
  return load<AdherenceRecord[]>(KEYS.adherence, []);
}

export function saveAdherence(records: AdherenceRecord[]): void {
  save(KEYS.adherence, records);
}

export function loadRecoveryMode(): RecoveryModeRecord {
  return load<RecoveryModeRecord>(KEYS.recovery, {
    active: false,
    enteredDate: null,
    entryType: null,
    plannedEndDate: null,
    exitDate: null,
    exitType: null,
    consecutiveCompletedDuringRecovery: 0,
    daysInRecovery: 0,
  });
}

export function saveRecoveryMode(record: RecoveryModeRecord): void {
  save(KEYS.recovery, record);
}

export function loadAbsences(): PlannedAbsence[] {
  return load<PlannedAbsence[]>(KEYS.absences, []);
}

export function saveAbsences(absences: PlannedAbsence[]): void {
  save(KEYS.absences, absences);
}

export function loadGoals(): GoalRecord[] {
  return load<GoalRecord[]>(KEYS.goals, DEFAULT_GOALS);
}

export function saveGoals(goals: GoalRecord[]): void {
  save(KEYS.goals, goals);
}

export function loadProgram(): DayTemplate[] {
  return load<DayTemplate[]>(KEYS.program, DEFAULT_PROGRAM);
}

export function saveProgram(program: DayTemplate[]): void {
  save(KEYS.program, program);
}

const DEFAULT_GOALS: GoalRecord[] = [
  { id: "t1-m1", tier: 1, label: "3 sessions this week", status: "active", achievedDate: null, progressValue: 0, targetValue: 3 },
  { id: "t1-m2", tier: 1, label: "2 consecutive green weeks", status: "locked", achievedDate: null, progressValue: 0, targetValue: 2 },
  { id: "t2-m1", tier: 2, label: "4-week streak", status: "locked", achievedDate: null, progressValue: 0, targetValue: 28 },
  { id: "t2-m2", tier: 2, label: "8-week streak", status: "locked", achievedDate: null, progressValue: 0, targetValue: 56 },
  { id: "t3-m1", tier: 3, label: "12 weeks adherence above 80%", status: "locked", achievedDate: null, progressValue: 0, targetValue: 84 },
  { id: "t3-m2", tier: 3, label: "6 months adherence above 80%", status: "locked", achievedDate: null, progressValue: 0, targetValue: 180 },
  { id: "t4-m1", tier: 4, label: "1 year of consistent training", status: "locked", achievedDate: null, progressValue: 0, targetValue: 365 },
];
