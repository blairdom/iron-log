import { useApp } from "../store/AppStore";
import { FONT } from "./theme";
import { isScheduledDay, dateSubDays } from "../engine/behavioral";

interface Props {
  onDismiss: () => void;
}

export default function WeeklyReviewCard({ onDismiss }: Props) {
  const { state } = useApp();
  const { sessions, today } = state;

  // Last completed week: Mon–Sun ending on the most recent Sunday
  const todayDate = new Date(today + "T12:00:00");
  const dayOfWeek = todayDate.getDay(); // 0=Sun
  const lastSunday = dateSubDays(today, dayOfWeek === 0 ? 0 : dayOfWeek);
  const lastMonday = dateSubDays(lastSunday, 6);

  const weekSessions = sessions.filter(s =>
    s.date >= lastMonday && s.date <= lastSunday && isScheduledDay(s.dayKey)
  );

  const scheduled = 5;
  const completed = weekSessions.filter(s => s.status === "complete").length;
  const flub = weekSessions.filter(s => s.status === "partial").length;
  const skipped = weekSessions.filter(s => s.status === "skipped").length;
  const adherence = scheduled > 0 ? Math.round(((completed * 1.0 + flub * 0.5) / scheduled) * 100) : 0;

  const threatColors: Record<string, string> = {
    green: "#22c55e", yellow: "#eab308", orange: "#f97316", red: "#ef4444", blue: "#3b82f6",
  };
  const stateLabel = skipped >= 3 ? "Red" : skipped === 2 ? "Orange" : skipped === 1 ? "Yellow" : "Green";
  const stateColor = skipped >= 3 ? threatColors.red : skipped === 2 ? threatColors.orange : skipped === 1 ? threatColors.yellow : threatColors.green;

  const row = (lbl: string, val: string | number, highlight?: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1a1a1a" }}>
      <div style={{ fontSize: 12, color: "#555", fontFamily: FONT, letterSpacing: "0.05em" }}>{lbl}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: highlight ?? "#fff", fontFamily: FONT }}>{val}</div>
    </div>
  );

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 20,
      }}
      onClick={onDismiss}
    >
      <div
        style={{
          background: "#141414", border: "1px solid #222", borderRadius: 8,
          padding: 24, width: "100%", maxWidth: 400,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 11, color: "#555", fontFamily: FONT, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
          Week Summary
        </div>
        <div style={{ fontSize: 10, color: "#333", fontFamily: FONT, marginBottom: 16 }}>
          {lastMonday} — {lastSunday}
        </div>

        <div style={{ borderTop: "1px solid #1a1a1a" }}>
          {row("Scheduled", scheduled)}
          {row("Completed", completed)}
          {row("Flub", flub)}
          {row("Skipped", skipped, skipped > 0 ? threatColors.red : undefined)}
          {row("Adherence", `${adherence}%`)}
          {row("State", stateLabel, stateColor)}
        </div>

        <div
          style={{
            marginTop: 20, padding: "10px 0", textAlign: "center",
            fontSize: 10, color: "#333", fontFamily: FONT, letterSpacing: "0.1em",
            textTransform: "uppercase", cursor: "pointer",
          }}
          onClick={onDismiss}
        >
          TAP TO DISMISS
        </div>
      </div>
    </div>
  );
}
