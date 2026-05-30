import { useApp } from "../store/AppStore";
import { FONT, screen, card } from "../components/theme";
import type { SessionRecord } from "../engine/types";

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  // Returns 0=Sun, shift to Mon-based: Mon=0
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7; // Mon=0, Sun=6
}

export default function CalendarView() {
  const { state } = useApp();
  const { sessions, adherenceRecords, today } = state;

  const now = new Date(today);
  const year = now.getFullYear();
  const month = now.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const headers = ["M", "T", "W", "T", "F", "S", "S"];
  const monthLabel = now.toLocaleString("default", { month: "long", year: "numeric" }).toUpperCase();

  function getStatusForDay(day: number): string | null {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const session = sessions.find(s => s.date === dateStr);
    if (!session) return null;
    return session.status;
  }

  function calDayStyle(status: string | null): React.CSSProperties {
    const colors: Record<string, { bg: string; border: string; color: string }> = {
      complete: { bg: "rgba(34,197,94,0.2)", border: "#1a3a1a", color: "#22c55e" },
      partial: { bg: "rgba(234,179,8,0.15)", border: "#3a3210", color: "#eab308" },
      skipped: { bg: "rgba(239,68,68,0.15)", border: "#3a1010", color: "#ef4444" },
      not_started: { bg: "#111", border: "#1a1a1a", color: "#444" },
    };
    const c = colors[status ?? ""] ?? { bg: "#111", border: "#1a1a1a", color: "#555" };
    return {
      aspectRatio: "1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 4,
      color: c.color,
      fontSize: 12,
      fontWeight: 600,
      fontFamily: FONT,
    };
  }

  // Weekly summary for the current week
  const weekSessions = sessions.filter(s => {
    const d = new Date(s.date);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
    weekStart.setHours(0, 0, 0, 0);
    return d >= weekStart && d <= now;
  });

  const scheduled = adherenceRecords.filter(r => {
    const d = new Date(r.date);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);
    return d >= weekStart && d <= now && r.scheduled;
  }).length;

  const completed = weekSessions.filter(s => s.status === "complete").length;
  const partial = weekSessions.filter(s => s.status === "partial").length;
  const skipped = weekSessions.filter(s => s.status === "skipped").length;
  const adherence = scheduled > 0 ? Math.round(((completed * 1.0 + partial * 0.5) / scheduled) * 100) : 0;

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div style={screen(null)}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#666", textTransform: "uppercase", fontFamily: FONT }}>
          {monthLabel}
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 10, color: "#444", fontFamily: FONT }}>
          <span style={{ color: "#22c55e" }}>■ Complete</span>
          <span style={{ color: "#eab308" }}>■ Partial</span>
          <span style={{ color: "#ef4444" }}>■ Skipped</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginTop: 16 }}>
        {headers.map((h, i) => (
          <div key={i} style={{ fontSize: 9, fontWeight: 700, color: "#444", textAlign: "center", padding: "4px 0 8px", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: FONT }}>
            {h}
          </div>
        ))}
        {cells.map((day, i) => (
          <div key={i} style={calDayStyle(day ? getStatusForDay(day) : null)}>
            {day ?? ""}
          </div>
        ))}
      </div>

      {/* Weekly Summary */}
      <div style={{ ...card, marginTop: 20 }}>
        <div style={{ background: "#141414", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", padding: "12px 0 8px", borderBottom: "1px solid #222", fontFamily: FONT }}>
          This Week
        </div>
        {[
          { label: "Scheduled", value: String(scheduled), highlight: false },
          { label: "Completed", value: String(completed), highlight: false },
          { label: "Partial", value: String(partial), highlight: false },
          { label: "Skipped", value: String(skipped), highlight: skipped > 0 },
          { label: "Adherence", value: `${adherence}%`, highlight: false },
        ].map(row => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #111", fontSize: 12, fontFamily: FONT }}>
            <span style={{ color: "#666" }}>{row.label}</span>
            <span style={{ color: row.highlight ? "#ef4444" : "#e0e0e0", fontWeight: 600 }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import type React from "react";
