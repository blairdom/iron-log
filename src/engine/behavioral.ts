import type { ThreatState, SessionRecord, AdherenceRecord, BehavioralState, RecoveryModeRecord } from "./types";

const CREDITS_PER_LEVEL = 2.0;
const FREEZE_THRESHOLD = 1.0;
const RECOVERY_EXIT_SESSIONS = 3;
const RECOVERY_STREAK_RESET_DAYS = 7;
const AUTO_RECOVERY_TRIGGER_DAYS = 7;

export function sessionCredit(status: "complete" | "partial" | "skipped"): number {
  if (status === "complete") return 1.0;
  if (status === "partial") return 0.5;
  return 0.0;
}

export function adherenceValue(status: "complete" | "partial" | "skipped"): number {
  if (status === "complete") return 1.0;
  if (status === "partial") return 0.5;
  return 0.0;
}

export function threatLabel(state: ThreatState): string {
  switch (state) {
    case "green": return "ON TRACK";
    case "yellow": return "MOMENTUM SLIPPING";
    case "orange": return "CONSISTENCY AT RISK";
    case "red": return "CRITICAL DRIFT";
    case "blue": return "RECOVERY MODE";
  }
}

export function threatMessage(state: ThreatState): string {
  switch (state) {
    case "green": return "Locked in.";
    case "yellow": return "Momentum slipping.";
    case "orange": return "Consistency at risk.";
    case "red": return "Recovery still possible — complete one session to stabilize.";
    case "blue": return "Rebuilding. One day at a time.";
  }
}

function stateFromSkips(skips: number): ThreatState {
  if (skips === 0) return "green";
  if (skips === 1) return "yellow";
  if (skips === 2) return "orange";
  return "red";
}

function stateLevel(state: ThreatState): number {
  return { green: 0, yellow: 1, orange: 2, red: 3, blue: 0 }[state];
}

function levelToState(level: number): ThreatState {
  return (["green", "yellow", "orange", "red"] as ThreatState[])[Math.max(0, Math.min(3, level))];
}

export function computeBehavioralState(
  sessions: SessionRecord[],
  adherenceRecords: AdherenceRecord[],
  recoveryMode: RecoveryModeRecord,
  goals: import("./types").GoalRecord[],
  today: string
): BehavioralState {
  if (recoveryMode.active) {
    const adherenceRate = computeAdherenceRate(adherenceRecords, today);
    const streak = computeStreak(sessions);
    return {
      threatState: "blue",
      recoveryCredits: 0,
      recoveryMode,
      streak,
      adherenceRate,
      windowSkips: 0,
    };
  }

  // Rolling 7-day window: count skipped scheduled sessions
  const windowStart = dateSubDays(today, 6);
  const windowSessions = sessions.filter(s =>
    s.date >= windowStart && s.date <= today && isScheduledDay(s.dayKey)
  );
  const windowSkips = windowSessions.filter(s => s.status === "skipped").length;

  // Compute base threat from skips
  let baseLevel = windowSkips === 0 ? 0 : windowSkips === 1 ? 1 : windowSkips === 2 ? 2 : 3;

  // Apply recovery credits from consecutive non-skipped sessions after last skip
  // Find the most recent skip, then accumulate credits from sessions after it
  const sortedSessions = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  let credits = 0;
  let consecutiveRun = true;
  const recentSessions = sortedSessions.filter(s => isScheduledDay(s.dayKey)).reverse();

  for (const s of recentSessions) {
    if (s.status === "skipped" || s.status === "not_started") break;
    if (!consecutiveRun) break;
    credits += sessionCredit(s.status as "complete" | "partial" | "skipped");
  }

  // Freeze: at 1.0 credits, stop further escalation (already handled by not adding skips after)
  // De-escalation: every 2.0 credits reduces level by 1
  const levelsReduced = credits >= FREEZE_THRESHOLD ? Math.floor((credits - FREEZE_THRESHOLD) / CREDITS_PER_LEVEL + (credits >= FREEZE_THRESHOLD ? 0 : 0)) : 0;
  const deescalationLevels = credits >= FREEZE_THRESHOLD ? Math.floor((credits) / CREDITS_PER_LEVEL) : 0;
  const effectiveLevel = Math.max(0, baseLevel - deescalationLevels);
  const threatState = levelToState(effectiveLevel);

  const adherenceRate = computeAdherenceRate(adherenceRecords, today);
  const streak = computeStreak(sessions);

  return {
    threatState,
    recoveryCredits: credits,
    recoveryMode,
    streak,
    adherenceRate,
    windowSkips,
  };
}

export function computeAdherenceRate(
  records: AdherenceRecord[],
  today: string,
  windowDays = 28
): number {
  const windowStart = dateSubDays(today, windowDays - 1);
  const window = records.filter(r =>
    r.date >= windowStart &&
    r.date <= today &&
    r.scheduled &&
    !r.recoveryMode &&
    !r.plannedAbsence
  );
  if (window.length === 0) return 0;
  const sum = window.reduce((acc, r) => acc + r.adherenceValue, 0);
  return sum / window.length;
}

export function computeStreak(sessions: SessionRecord[]): number {
  const scheduled = sessions
    .filter(s => isScheduledDay(s.dayKey))
    .sort((a, b) => b.date.localeCompare(a.date));

  let streak = 0;
  for (const s of scheduled) {
    if (s.status === "skipped") break;
    if (s.status === "complete" || s.status === "partial") streak++;
    else break;
  }
  return streak;
}

export function isScheduledDay(dayKey: string): boolean {
  return ["mon", "tue", "wed", "thu", "fri"].includes(dayKey);
}

export function dateSubDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

export function getTodayKey(date: Date = new Date()): string {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[date.getDay()];
}

export function toDateString(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

export function checkRecoveryModeAutoTrigger(
  sessions: SessionRecord[],
  recoveryMode: RecoveryModeRecord,
  today: string
): boolean {
  if (recoveryMode.active) return false;
  const sevenDaysAgo = dateSubDays(today, AUTO_RECOVERY_TRIGGER_DAYS - 1);
  const recentScheduled = sessions.filter(s =>
    s.date >= sevenDaysAgo &&
    s.date <= today &&
    isScheduledDay(s.dayKey)
  );
  const hasAnyCompletion = recentScheduled.some(s => s.status === "complete" || s.status === "partial");
  return !hasAnyCompletion && recentScheduled.length >= AUTO_RECOVERY_TRIGGER_DAYS;
}

export function checkRecoveryModeAutoExit(
  recoveryMode: RecoveryModeRecord
): boolean {
  return recoveryMode.active &&
    recoveryMode.consecutiveCompletedDuringRecovery >= RECOVERY_EXIT_SESSIONS;
}
