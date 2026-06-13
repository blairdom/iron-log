import { useState } from "react";
import { useApp } from "../store/AppStore";
import { FONT, screen, card, SURFACE, SURFACE_2, BORDER, BORDER_SUBTLE, TEXT_PRIMARY, TEXT_MUTED, TEXT_DIM, BASE_BG } from "../components/theme";

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7; // Mon=0, Sun=6
}

function dayKeyFromDate(dateStr: string): string {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[new Date(dateStr + "T12:00:00").getDay()];
}

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri"];

const STATUS_COLORS = {
  complete: { bg: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.3)",   color: "#22c55e" },
  partial:  { bg: "rgba(234,179,8,0.12)",  border: "rgba(234,179,8,0.3)",   color: "#eab308" },
  skipped:  { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)",   color: "#ef4444" },
  none:     { bg: "#161B22",               border: "#21262D",               color: "#484F58" },
  future:   { bg: "#0D1117",               border: "#21262D",               color: "#30363D" },
};

// ── Day Edit Panel ────────────────────────────────────────────────────────────

function MiniStepper({
  value, onChange, step, min, unit,
}: { value: number; onChange: (v: number) => void; step: number; min: number; unit: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button
        onClick={() => onChange(Math.max(min, parseFloat((value - step).toFixed(1))))}
        style={{ width: 28, height: 28, background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT_MUTED, fontSize: 18, cursor: "pointer", fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
      >−</button>
      <div style={{ textAlign: "center", minWidth: 44 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: FONT, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 9, color: "#555", fontFamily: FONT, marginTop: 2 }}>{unit}</div>
      </div>
      <button
        onClick={() => onChange(parseFloat((value + step).toFixed(1)))}
        style={{ width: 28, height: 28, background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT_MUTED, fontSize: 18, cursor: "pointer", fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
      >+</button>
    </div>
  );
}

function DayEditPanel({ date, onClose }: { date: string; onClose: () => void }) {
  const { state, dispatch } = useApp();
  const { sessions, cardioSessions } = state;

  const dayKey = dayKeyFromDate(date);
  const isWeekday = WEEKDAYS.includes(dayKey);

  const existingSession = sessions.find(s => s.date === date && s.dayKey === dayKey);
  const existingAm = cardioSessions.find(s => s.date === date && (s.slot === "am" || !s.slot));
  const existingPm = cardioSessions.find(s => s.date === date && s.slot === "pm");

  type StrengthStatus = "complete" | "partial" | "skipped" | "none";
  const [strengthStatus, setStrengthStatus] = useState<StrengthStatus>(
    (existingSession?.status as StrengthStatus) ?? "none"
  );
  const [amDone, setAmDone] = useState(existingAm?.status === "complete");
  const [amDuration, setAmDuration] = useState(existingAm?.duration ?? 20);
  const [amSpeed, setAmSpeed] = useState(existingAm?.speed ?? 3.5);
  const [pmDone, setPmDone] = useState(existingPm?.status === "complete");
  const [pmDuration, setPmDuration] = useState(existingPm?.duration ?? 20);
  const [pmSpeed, setPmSpeed] = useState(existingPm?.speed ?? 3.5);

  const dateFormatted = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  function save() {
    if (isWeekday) {
      dispatch({ type: "BACKFILL_STRENGTH", date, dayKey, status: strengthStatus });
    }
    dispatch({ type: "BACKFILL_CARDIO", date, slot: "am", duration: amDuration, speed: amSpeed, status: amDone ? "complete" : "not_started" });
    dispatch({ type: "BACKFILL_CARDIO", date, slot: "pm", duration: pmDuration, speed: pmSpeed, status: pmDone ? "complete" : "not_started" });
    onClose();
  }

  const strengthOptions: { value: StrengthStatus; label: string; color: string; bg: string }[] = [
    { value: "complete", label: "Complete", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
    { value: "partial",  label: "Partial",  color: "#eab308", bg: "rgba(234,179,8,0.12)"  },
    { value: "skipped",  label: "Skipped",  color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
    { value: "none",     label: "Clear",    color: TEXT_DIM,  bg: SURFACE_2               },
  ];

  return (
    <div style={{ ...card, marginTop: 12, border: `1px solid ${BORDER}`, padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: FONT }}>{dateFormatted}</div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: TEXT_DIM, cursor: "pointer", fontSize: 20, fontFamily: FONT, lineHeight: 1, padding: "0 4px" }}
        >✕</button>
      </div>

      {/* Strength section — weekdays only */}
      {isWeekday && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: TEXT_DIM, marginBottom: 8, fontFamily: FONT }}>
            Strength
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {strengthOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStrengthStatus(opt.value)}
                style={{
                  flex: 1, padding: "8px 0",
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  fontFamily: FONT, borderRadius: 4, cursor: "pointer",
                  border: strengthStatus === opt.value ? `1px solid ${opt.color}33` : "1px solid #1a1a1a",
                  background: strengthStatus === opt.value ? opt.bg : SURFACE,
                  color: strengthStatus === opt.value ? opt.color : "#444",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cardio AM + PM */}
      {(["am", "pm"] as const).map(slot => {
        const done     = slot === "am" ? amDone : pmDone;
        const setDone  = slot === "am" ? setAmDone : setPmDone;
        const duration = slot === "am" ? amDuration : pmDuration;
        const setDur   = slot === "am" ? setAmDuration : setPmDuration;
        const speed    = slot === "am" ? amSpeed : pmSpeed;
        const setSpd   = slot === "am" ? setAmSpeed : setPmSpeed;

        return (
          <div key={slot} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: done ? 10 : 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#555", fontFamily: FONT }}>
                Cardio {slot.toUpperCase()}
              </div>
              <button
                onClick={() => setDone(!done)}
                style={{
                  padding: "5px 14px", fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: FONT,
                  borderRadius: 4, cursor: "pointer",
                  border: done ? "1px solid #1a3a1a" : "1px solid #222",
                  background: done ? "rgba(34,197,94,0.12)" : "#111",
                  color: done ? "#22c55e" : "#444",
                }}
              >
                {done ? "✓ Done" : "Mark Done"}
              </button>
            </div>

            {done && (
              <div style={{ display: "flex", gap: 20, alignItems: "center", paddingLeft: 4 }}>
                <MiniStepper value={duration} onChange={setDur} step={5} min={5} unit="min" />
                <div style={{ width: 1, height: 40, background: BORDER_SUBTLE }} />
                <MiniStepper value={speed} onChange={setSpd} step={0.1} min={0.5} unit="mph" />
              </div>
            )}
          </div>
        );
      })}

      {/* Save */}
      <button
        onClick={save}
        style={{
          width: "100%", padding: 12, marginTop: 8,
          background: "rgba(34,197,94,0.08)", border: "1px solid #1a3a1a",
          borderRadius: 6, color: "#22c55e", fontSize: 13, fontWeight: 700,
          fontFamily: FONT, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
        }}
      >
        SAVE
      </button>
    </div>
  );
}

// ── Main CalendarView ─────────────────────────────────────────────────────────

export default function CalendarView() {
  const { state } = useApp();
  const { sessions, cardioSessions, today } = state;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const now = new Date(today + "T12:00:00");
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthLabel = now.toLocaleString("default", { month: "long", year: "numeric" }).toUpperCase();

  const headers = ["M", "T", "W", "T", "F", "S", "S"];

  function dateStr(day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function getStrengthStatus(day: number): keyof typeof STATUS_COLORS {
    const d = dateStr(day);
    if (d > today) return "future";
    const s = sessions.find(s => s.date === d);
    if (!s) return "none";
    if (s.status === "complete") return "complete";
    if (s.status === "partial") return "partial";
    if (s.status === "skipped") return "skipped";
    return "none";
  }

  function getCardioStatus(day: number): "complete" | "partial" | "skipped" | "none" {
    const d = dateStr(day);
    if (d > today) return "none";
    const amSession = cardioSessions.find(s => s.date === d && (s.slot === "am" || !s.slot));
    const pmSession = cardioSessions.find(s => s.date === d && s.slot === "pm");
    const amDone = amSession?.status === "complete";
    const pmDone = pmSession?.status === "complete";
    if (amDone && pmDone) return "complete";
    if (amDone || pmDone) return "partial";
    return "none";
  }

  function handleCellClick(day: number) {
    const d = dateStr(day);
    if (d > today) return; // can't edit future
    setSelectedDate(prev => prev === d ? null : d);
  }

  // Weekly summary
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().split("T")[0];

  const weekSessions = sessions.filter(s => s.date >= weekStartStr && s.date <= today);
  const weekCardio   = cardioSessions.filter(s => s.date >= weekStartStr && s.date <= today);

  const strengthScheduled = weekSessions.filter(s => WEEKDAYS.includes(s.dayKey)).length;
  const strengthCompleted = weekSessions.filter(s => s.status === "complete").length;
  const strengthPartial   = weekSessions.filter(s => s.status === "partial").length;
  const strengthSkipped   = weekSessions.filter(s => s.status === "skipped").length;
  const strengthAdherence = strengthScheduled > 0
    ? Math.round(((strengthCompleted + strengthPartial * 0.5) / strengthScheduled) * 100)
    : 0;

  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const ds = d.toISOString().split("T")[0];
    if (ds <= today) weekDates.push(ds);
  }
  function dayCredit(d: string): number {
    const am = weekCardio.find(s => s.date === d && (s.slot === "am" || !s.slot));
    const pm = weekCardio.find(s => s.date === d && s.slot === "pm");
    const n = (am?.status === "complete" ? 1 : 0) + (pm?.status === "complete" ? 1 : 0);
    return n === 2 ? 1.0 : n === 1 ? 0.5 : 0;
  }
  const cardioCreditSum = weekDates.reduce((sum, d) => sum + dayCredit(d), 0);
  const cardioDone     = weekDates.filter(d => dayCredit(d) > 0).length;
  const cardioMissed   = weekDates.filter(d => dayCredit(d) === 0).length;
  const daysElapsed    = weekDates.length;
  const cardioAdherence = daysElapsed > 0
    ? Math.round((cardioCreditSum / daysElapsed) * 100)
    : 0;

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div style={screen(null)}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: TEXT_MUTED, textTransform: "uppercase", fontFamily: FONT }}>
          {monthLabel}
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 10, color: TEXT_DIM, fontFamily: FONT }}>
          <span><span style={{ color: "#22c55e" }}>■</span> Complete</span>
          <span><span style={{ color: "#eab308" }}>■</span> Partial</span>
          <span><span style={{ color: "#ef4444" }}>■</span> Skipped</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 10, color: TEXT_DIM, fontFamily: FONT }}>
        <span>Top = Strength</span>
        <span>Bottom = Cardio</span>
        <span style={{ color: "#30363D" }}>· Tap a day to edit</span>
      </div>

      {/* Calendar Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginTop: 12 }}>
        {headers.map((h, i) => (
          <div key={i} style={{ fontSize: 9, fontWeight: 700, color: TEXT_DIM, textAlign: "center", padding: "4px 0 8px", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: FONT }}>
            {h}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} style={{ aspectRatio: "1", background: BASE_BG, borderRadius: 4 }} />;

          const d = dateStr(day);
          const isFuture = d > today;
          const isSelected = selectedDate === d;
          const sc = STATUS_COLORS[getStrengthStatus(day)];
          const cardioKey = isFuture ? "future" : getCardioStatus(day);
          const cs = STATUS_COLORS[cardioKey === "partial" ? "partial" : cardioKey];

          return (
            <div
              key={i}
              onClick={() => handleCellClick(day)}
              style={{
                aspectRatio: "1",
                display: "flex",
                flexDirection: "column",
                borderRadius: 4,
                overflow: "hidden",
                border: isSelected ? `1px solid ${TEXT_MUTED}` : `1px solid ${sc.border}`,
                cursor: isFuture ? "default" : "pointer",
                outline: isSelected ? "1px solid #444" : "none",
              }}
            >
              {/* Top half — Strength */}
              <div style={{
                flex: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: sc.bg,
                fontSize: 11, fontWeight: 600, color: sc.color,
                fontFamily: FONT, borderBottom: "1px solid #0c0c0c",
              }}>
                {day}
              </div>
              {/* Bottom half — Cardio */}
              <div style={{ flex: 1, background: cs.bg }} />
            </div>
          );
        })}
      </div>

      {/* Day Edit Panel */}
      {selectedDate && (
        <DayEditPanel date={selectedDate} onClose={() => setSelectedDate(null)} />
      )}

      {/* Strength Weekly Summary */}
      <div style={{ ...card, marginTop: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: TEXT_MUTED, padding: "0 0 10px", borderBottom: `1px solid ${BORDER_SUBTLE}`, fontFamily: FONT }}>
          Strength — This Week
        </div>
        {[
          { label: "Scheduled",  value: String(strengthScheduled), highlight: false },
          { label: "Completed",  value: String(strengthCompleted), highlight: false },
          { label: "Partial",    value: String(strengthPartial),   highlight: false },
          { label: "Skipped",    value: String(strengthSkipped),   highlight: strengthSkipped > 0 },
          { label: "Adherence",  value: `${strengthAdherence}%`,  highlight: false },
        ].map(row => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${BORDER_SUBTLE}`, fontSize: 12, fontFamily: FONT }}>
            <span style={{ color: TEXT_MUTED }}>{row.label}</span>
            <span style={{ color: row.highlight ? "#ef4444" : TEXT_PRIMARY, fontWeight: 600 }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Cardio Weekly Summary */}
      <div style={{ ...card, marginTop: 12, marginBottom: 32 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: TEXT_MUTED, padding: "0 0 10px", borderBottom: `1px solid ${BORDER_SUBTLE}`, fontFamily: FONT }}>
          Cardio — This Week
        </div>
        {[
          { label: "Days with cardio", value: String(cardioDone),    highlight: false },
          { label: "Days missed",      value: String(cardioMissed),  highlight: cardioMissed > 0 },
          { label: "Days elapsed",     value: String(daysElapsed),   highlight: false },
          { label: "Credit earned",    value: `${cardioCreditSum.toFixed(1)} / ${daysElapsed}`, highlight: false },
          { label: "Adherence",        value: `${cardioAdherence}%`, highlight: false },
        ].map(row => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${BORDER_SUBTLE}`, fontSize: 12, fontFamily: FONT }}>
            <span style={{ color: TEXT_MUTED }}>{row.label}</span>
            <span style={{ color: row.highlight ? "#ef4444" : TEXT_PRIMARY, fontWeight: 600 }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
