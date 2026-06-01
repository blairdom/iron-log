import type { SessionRecord, AdherenceRecord, RecoveryModeRecord, PlannedAbsence, GoalRecord, CardioSession } from "../engine/types";
import type { DayTemplate } from "../data/program";
import { DEFAULT_PROGRAM } from "../data/program";

const KEYS = {
  sessions: "ironlog_sessions",
  adherence: "ironlog_adherence",
  recovery: "ironlog_recovery",
  absences: "ironlog_absences",
  goals: "ironlog_goals",
  program: "ironlog_program",
  cardio: "ironlog_cardio",
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

export function loadCardioSessions(): CardioSession[] {
  return load<CardioSession[]>(KEYS.cardio, SEED_CARDIO);
}

export function saveCardioSessions(sessions: CardioSession[]): void {
  save(KEYS.cardio, sessions);
}

// Seed data: May 25–30 completed, May 31 not yet started
const SEED_CARDIO: CardioSession[] = [
  { id: "cardio-2026-05-25", date: "2026-05-25", duration: 20, speed: 3.5, status: "complete", completedAt: "2026-05-25T00:00:00.000Z" },
  { id: "cardio-2026-05-26", date: "2026-05-26", duration: 20, speed: 3.5, status: "complete", completedAt: "2026-05-26T00:00:00.000Z" },
  { id: "cardio-2026-05-27", date: "2026-05-27", duration: 20, speed: 3.5, status: "complete", completedAt: "2026-05-27T00:00:00.000Z" },
  { id: "cardio-2026-05-28", date: "2026-05-28", duration: 20, speed: 3.5, status: "complete", completedAt: "2026-05-28T00:00:00.000Z" },
  { id: "cardio-2026-05-29", date: "2026-05-29", duration: 20, speed: 3.5, status: "complete", completedAt: "2026-05-29T00:00:00.000Z" },
  { id: "cardio-2026-05-30", date: "2026-05-30", duration: 20, speed: 3.5, status: "complete", completedAt: "2026-05-30T00:00:00.000Z" },
];

const DEFAULT_GOALS: GoalRecord[] = [
  { id: "t1-m1", tier: 1, label: "Complete 3 sessions in a week", status: "active", achievedDate: null, progressValue: 0, targetValue: 3 },
  { id: "t1-m2", tier: 1, label: "2 consecutive green weeks", status: "locked", achievedDate: null, progressValue: 0, targetValue: 2 },
  { id: "t2-m1", tier: 2, label: "4-week streak (20 sessions)", status: "locked", achievedDate: null, progressValue: 0, targetValue: 20 },
  { id: "t2-m2", tier: 2, label: "8-week streak (40 sessions)", status: "locked", achievedDate: null, progressValue: 0, targetValue: 40 },
  { id: "t3-m1", tier: 3, label: "12 weeks adherence above 80%", status: "locked", achievedDate: null, progressValue: 0, targetValue: 84 },
  { id: "t3-m2", tier: 3, label: "6 months adherence above 80%", status: "locked", achievedDate: null, progressValue: 0, targetValue: 180 },
  { id: "t4-m1", tier: 4, label: "1 year of consistent training", status: "locked", achievedDate: null, progressValue: 0, targetValue: 365 },
];
