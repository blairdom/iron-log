import { useApp } from "../store/AppStore";
import { FONT, screen, card } from "../components/theme";

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7; // Mon=0, Sun=6
}

const STATUS_COLORS = {
  complete: { bg: "rgba(34,197,94,0.2)",  border: "#1a3a1a", color: "#22c55e" },
  partial:  { bg: "rgba(234,179,8,0.15)", border: "#3a3210", color: "#eab308" },
  skipped:  { bg: "rgba(239,68,68,0.15)", border: "#3a1010", color: "#ef4444" },
  none:     { bg: "#111",                 border: "#1a1a1a", color: "#555"    },
  future:   { bg: "#0e0e0e",              border: "#111",    color: "#333"    },
};


export default function CalendarView() {
  const { state } = useApp();
  const { sessions, cardioSessions, today } = state;

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
    const amSession = cardioSessions.find(s => s.date === d && s.slot === "am");
    const pmSession = cardioSessions.find(s => s.date === d && s.slot === "pm");
    // Legacy sessions without slot field default to "am"
    const legacySession = cardioSessions.find(s => s.date === d && !s.slot);
    const amDone = amSession?.status === "complete" || legacySession?.status === "complete";
    const pmDone = pmSession?.status === "complete";
    if (amDone && pmDone) return "complete";
    if (amDone || pmDone) return "partial";
    return "none";
  }

  // Weekly summary for current week (Mon–today)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().split("T")[0];

  const weekSessions = sessions.filter(s => s.date >= weekStartStr && s.date <= today);
  const weekCardio = cardioSessions.filter(s => s.date >= weekStartStr && s.date <= today);

  const strengthScheduled = weekSessions.filter(s =>
    ["mon","tue","wed","thu","fri"].includes(s.dayKey)
  ).length;
  const strengthCompleted = weekSessions.filter(s => s.status === "complete").length;
  const strengthPartial   = weekSessions.filter(s => s.status === "partial").length;
  const strengthSkipped   = weekSessions.filter(s => s.status === "skipped").length;
  const strengthAdherence = strengthScheduled > 0
    ? Math.round(((strengthCompleted * 1.0 + strengthPartial * 0.5) / strengthScheduled) * 100)
    : 0;

  // Count unique dates in window
  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const ds = d.toISOString().split("T")[0];
    if (ds <= today) weekDates.push(ds);
  }
  // Per-day credit: 0, 0.5, or 1.0
  function dayCredit(d: string): number {
    const am = weekCardio.find(s => s.date === d && (s.slot === "am" || !s.slot));
    const pm = weekCardio.find(s => s.date === d && s.slot === "pm");
    const amDone = am?.status === "complete" ? 1 : 0;
    const pmDone = pm?.status === "complete" ? 1 : 0;
    const n = amDone + pmDone;
    return n === 2 ? 1.0 : n === 1 ? 0.5 : 0;
  }
  const cardioCreditSum = weekDates.reduce((sum, d) => sum + dayCredit(d), 0);
  // "days done" = days with any credit; "days missed" = days with no credit (and elapsed)
  const cardioDone    = weekDates.filter(d => dayCredit(d) > 0).length;
  const cardioMissed  = weekDates.filter(d => dayCredit(d) === 0).length;
  const daysElapsed   = weekDates.length;
  const cardioAdherence = daysElapsed > 0
    ? Math.round((cardioCreditSum / (daysElapsed * 1.0)) * 100)
    : 0;

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div style={screen(null)}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#666", textTransform: "uppercase", fontFamily: FONT }}>
          {monthLabel}
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 10, color: "#444", fontFamily: FONT }}>
          <span><span style={{ color: "#22c55e" }}>■</span> Complete</span>
          <span><span style={{ color: "#eab308" }}>■</span> Partial</span>
          <span><span style={{ color: "#ef4444" }}>■</span> Skipped</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 10, color: "#444", fontFamily: FONT }}>
        <span>Top = Strength</span>
        <span>Bottom = Cardio</span>
      </div>

      {/* Calendar Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginTop: 12 }}>
        {headers.map((h, i) => (
          <div key={i} style={{ fontSize: 9, fontWeight: 700, color: "#444", textAlign: "center", padding: "4px 0 8px", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: FONT }}>
            {h}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) {
            return <div key={i} style={{ aspectRatio: "1", background: "#0e0e0e", borderRadius: 4 }} />;
          }
          const isFuture = dateStr(day) > today;
          const sc = STATUS_COLORS[getStrengthStatus(day)];
          const cardioKey = isFuture ? "future" : getCardioStatus(day);
          const cs = STATUS_COLORS[cardioKey === "partial" ? "partial" : cardioKey];

          return (
            <div
              key={i}
              style={{
                aspectRatio: "1",
                display: "flex",
                flexDirection: "column",
                borderRadius: 4,
                overflow: "hidden",
                border: `1px solid ${sc.border}`,
              }}
            >
              {/* Top half — Strength */}
              <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: sc.bg,
                fontSize: 11,
                fontWeight: 600,
                color: sc.color,
                fontFamily: FONT,
                borderBottom: "1px solid #0c0c0c",
              }}>
                {day}
              </div>
              {/* Bottom half — Cardio */}
              <div style={{
                flex: 1,
                background: cs.bg,
              }} />
            </div>
          );
        })}
      </div>

      {/* Strength Weekly Summary */}
      <div style={{ ...card, marginTop: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", padding: "0 0 10px", borderBottom: "1px solid #222", fontFamily: FONT }}>
          Strength — This Week
        </div>
        {[
          { label: "Scheduled",  value: String(strengthScheduled),   highlight: false },
          { label: "Completed",  value: String(strengthCompleted),   highlight: false },
          { label: "Partial",    value: String(strengthPartial),     highlight: false },
          { label: "Skipped",    value: String(strengthSkipped),     highlight: strengthSkipped > 0 },
          { label: "Adherence",  value: `${strengthAdherence}%`,     highlight: false },
        ].map(row => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #111", fontSize: 12, fontFamily: FONT }}>
            <span style={{ color: "#666" }}>{row.label}</span>
            <span style={{ color: row.highlight ? "#ef4444" : "#e0e0e0", fontWeight: 600 }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Cardio Weekly Summary */}
      <div style={{ ...card, marginTop: 12, marginBottom: 32 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", padding: "0 0 10px", borderBottom: "1px solid #222", fontFamily: FONT }}>
          Cardio — This Week
        </div>
        {[
          { label: "Days with cardio", value: String(cardioDone),       highlight: false },
          { label: "Days missed",      value: String(cardioMissed),     highlight: cardioMissed > 0 },
          { label: "Days elapsed",     value: String(daysElapsed),      highlight: false },
          { label: "Credit earned",    value: `${cardioCreditSum.toFixed(1)} / ${daysElapsed}`, highlight: false },
          { label: "Adherence",        value: `${cardioAdherence}%`,    highlight: false },
        ].map(row => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #111", fontSize: 12, fontFamily: FONT }}>
            <span style={{ color: "#666" }}>{row.label}</span>
            <span style={{ color: row.highlight ? "#ef4444" : "#e0e0e0", fontWeight: 600 }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
