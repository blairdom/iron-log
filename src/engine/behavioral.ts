import type { ThreatState, SessionRecord, AdherenceRecord, BehavioralState, RecoveryModeRecord, CardioSession, CardioBehavioralState } from "./types";

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

// ─── Cardio Behavioral Engine ───────────────────────────────────────────────

/** Returns the credit earned for a date: 0, 0.5, or 1.0 */
function dayCardioCredit(sessions: CardioSession[], date: string): number {
  const am = sessions.find(s => s.date === date && s.slot === "am");
  const pm = sessions.find(s => s.date === date && s.slot === "pm");
  const amDone = am?.status === "complete" ? 1 : 0;
  const pmDone = pm?.status === "complete" ? 1 : 0;
  const total = amDone + pmDone;
  if (total === 2) return 1.0;
  if (total === 1) return 0.5;
  return 0.0;
}

export function computeCardioBehavioralState(
  sessions: CardioSession[],
  today: string
): CardioBehavioralState {
  // Streak: consecutive days (going backward) where at least 1 slot was completed
  // Build unique list of past dates desc
  const pastDates: string[] = [];
  for (let i = 0; i < 90; i++) {
    const d = dateSubDays(today, i);
    if (!pastDates.includes(d)) pastDates.push(d);
  }

  let streak = 0;
  for (const d of pastDates) {
    const credit = dayCardioCredit(sessions, d);
    if (credit > 0) streak++;
    else break; // gap = streak ends
  }

  // Rolling 7-day adherence: sum credits / 7
  const windowStart = dateSubDays(today, 6);
  let creditSum = 0;
  for (let i = 0; i <= 6; i++) {
    const d = dateSubDays(today, i);
    if (d >= windowStart && d <= today) {
      creditSum += dayCardioCredit(sessions, d);
    }
  }
  const adherenceRate = creditSum / 7;

  // Threat: days in 7-day window with zero credit (fully missed)
  let zeroDays = 0;
  for (let i = 0; i <= 6; i++) {
    const d = dateSubDays(today, i);
    if (dayCardioCredit(sessions, d) === 0) zeroDays++;
  }
  let threatState: ThreatState;
  if (zeroDays <= 1) threatState = "green";
  else if (zeroDays === 2) threatState = "yellow";
  else if (zeroDays === 3) threatState = "orange";
  else threatState = "red";

  const todayAm = sessions.find(s => s.date === today && s.slot === "am");
  const todayPm = sessions.find(s => s.date === today && s.slot === "pm");
  const todayAmStatus = todayAm?.status ?? "not_started";
  const todayPmStatus = todayPm?.status ?? "not_started";

  const doneCount = (todayAmStatus === "complete" ? 1 : 0) + (todayPmStatus === "complete" ? 1 : 0);
  const todayStatus = doneCount === 2 ? "complete" : doneCount === 1 ? "partial" : "not_started";

  return { threatState, streak, adherenceRate, todayStatus, todayAmStatus, todayPmStatus };
}

// ─── Goals Engine ────────────────────────────────────────────────────────────

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

export function computeGoals(
  goals: import("./types").GoalRecord[],
  sessions: SessionRecord[],
  adherenceRecords: AdherenceRecord[],
  streak: number,
  today: string
): import("./types").GoalRecord[] {
  // Migrate labels for clarity
  const LABELS: Record<string, string> = {
    "t1-m1": "Complete 3 sessions in a week",
    "t1-m2": "2 consecutive green weeks",
    "t2-m1": "4-week streak (20 sessions)",
    "t2-m2": "8-week streak (40 sessions)",
    "t3-m1": "12 weeks adherence above 80%",
    "t3-m2": "6 months adherence above 80%",
    "t4-m1": "1 year of consistent training",
  };
  const updated = goals.map(g => ({ ...g, label: LABELS[g.id] ?? g.label }));

  // Find active goal (first non-achieved)
  const activeIdx = updated.findIndex(g => g.status !== "achieved");
  if (activeIdx === -1) return updated;

  // Ensure only the active one is "active", rest are locked (unless achieved)
  for (let i = 0; i < updated.length; i++) {
    if (updated[i].status === "achieved") continue;
    updated[i].status = i === activeIdx ? "active" : "locked";
  }

  const active = updated[activeIdx];

  // Compute progress for the active goal
  if (active.id === "t1-m1") {
    // 3 sessions this week (Mon–Sun)
    const weekStart = getWeekStart(today);
    const count = sessions.filter(s =>
      s.date >= weekStart && s.date <= today &&
      isScheduledDay(s.dayKey) &&
      (s.status === "complete" || s.status === "partial")
    ).length;
    active.progressValue = Math.min(count, active.targetValue);
    if (active.progressValue >= active.targetValue) {
      active.status = "achieved";
      active.achievedDate = today;
      // Unlock next
      if (activeIdx + 1 < updated.length) updated[activeIdx + 1].status = "active";
    }
  } else if (active.id === "t1-m2") {
    // 2 consecutive green weeks (adherence >= 80% each week)
    let consecutive = 0;
    for (let w = 0; w < 12; w++) {
      const wEnd = dateSubDays(today, w * 7);
      const wStart = dateSubDays(wEnd, 6);
      const weekRecs = adherenceRecords.filter(r =>
        r.date >= wStart && r.date <= wEnd && r.scheduled && !r.recoveryMode && !r.plannedAbsence
      );
      if (weekRecs.length === 0) break;
      const rate = weekRecs.reduce((a, r) => a + r.adherenceValue, 0) / weekRecs.length;
      if (rate >= 0.8) consecutive++;
      else break;
    }
    active.progressValue = Math.min(consecutive, active.targetValue);
    if (active.progressValue >= active.targetValue) {
      active.status = "achieved";
      active.achievedDate = today;
      if (activeIdx + 1 < updated.length) updated[activeIdx + 1].status = "active";
    }
  } else if (active.id === "t2-m1") {
    // 4-week streak = 20 scheduled sessions
    active.progressValue = Math.min(streak, active.targetValue);
    if (active.progressValue >= active.targetValue) {
      active.status = "achieved";
      active.achievedDate = today;
      if (activeIdx + 1 < updated.length) updated[activeIdx + 1].status = "active";
    }
  } else if (active.id === "t2-m2") {
    // 8-week streak = 40 scheduled sessions
    active.progressValue = Math.min(streak, active.targetValue);
    if (active.progressValue >= active.targetValue) {
      active.status = "achieved";
      active.achievedDate = today;
      if (activeIdx + 1 < updated.length) updated[activeIdx + 1].status = "active";
    }
  } else if (active.id === "t3-m1") {
    // 12 weeks adherence > 80%: count eligible days in 84-day window
    const rate84 = computeAdherenceRate(adherenceRecords, today, 84);
    const eligibleDays = adherenceRecords.filter(r =>
      r.date >= dateSubDays(today, 83) && r.date <= today && r.scheduled && !r.recoveryMode && !r.plannedAbsence
    ).length;
    active.progressValue = Math.min(eligibleDays, active.targetValue);
    if (eligibleDays >= active.targetValue && rate84 >= 0.8) {
      active.status = "achieved";
      active.achievedDate = today;
      if (activeIdx + 1 < updated.length) updated[activeIdx + 1].status = "active";
    }
  } else if (active.id === "t3-m2") {
    // 6 months adherence > 80%
    const rate180 = computeAdherenceRate(adherenceRecords, today, 180);
    const eligible = adherenceRecords.filter(r =>
      r.date >= dateSubDays(today, 179) && r.date <= today && r.scheduled && !r.recoveryMode && !r.plannedAbsence
    ).length;
    active.progressValue = Math.min(eligible, active.targetValue);
    if (eligible >= active.targetValue && rate180 >= 0.8) {
      active.status = "achieved";
      active.achievedDate = today;
      if (activeIdx + 1 < updated.length) updated[activeIdx + 1].status = "active";
    }
  } else if (active.id === "t4-m1") {
    // 1 year consistent training
    const rate365 = computeAdherenceRate(adherenceRecords, today, 365);
    const eligible = adherenceRecords.filter(r =>
      r.date >= dateSubDays(today, 364) && r.date <= today && r.scheduled && !r.recoveryMode && !r.plannedAbsence
    ).length;
    active.progressValue = Math.min(eligible, active.targetValue);
    if (eligible >= active.targetValue && rate365 >= 0.8) {
      active.status = "achieved";
      active.achievedDate = today;
    }
  }

  return updated;
}

export function computeCardioWeeklyMinutes(
  sessions: CardioSession[],
  weekStart: string
): number {
  const weekEnd = dateSubDays(weekStart, -6);
  return sessions
    .filter(s => s.date >= weekStart && s.date <= weekEnd && s.status === "complete")
    .reduce((sum, s) => sum + s.duration, 0);
}
