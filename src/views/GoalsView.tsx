import { useApp } from "../store/AppStore";
import { FONT, screen, card, label } from "../components/theme";
import type { GoalRecord } from "../engine/types";

export default function GoalsView() {
  const { state } = useApp();
  const { goals } = state;

  const achieved = goals.filter(g => g.status === "achieved").reverse();
  const active = goals.find(g => g.status === "active");
  const nextLocked = goals.find(g => g.status === "locked");

  function progressBar(g: GoalRecord) {
    const pct = g.targetValue > 0 ? Math.min(1, g.progressValue / g.targetValue) : 0;
    return (
      <div style={{ marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontSize: 10, color: "#555", fontFamily: FONT, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Progress
          </div>
          <div style={{ fontSize: 11, color: "#e0e0e0", fontFamily: FONT, fontWeight: 600 }}>
            {g.progressValue} / {g.targetValue}
          </div>
        </div>
        <div style={{ height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct * 100}%`, background: "#22c55e", borderRadius: 2, transition: "width 0.3s" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={screen(null)}>
      <div style={{ fontSize: 11, color: "#555", fontFamily: FONT, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20 }}>
        Goals
      </div>

      {/* Active goal */}
      {active && (
        <div style={{ ...card, border: "1px solid #1a3a1a", background: "rgba(34,197,94,0.05)", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 10, color: "#22c55e", fontFamily: FONT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                Active — Tier {active.tier}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: FONT }}>
                {active.label}
              </div>
            </div>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "#22c55e",
              marginTop: 4, boxShadow: "0 0 6px rgba(34,197,94,0.6)", flexShrink: 0,
            }} />
          </div>
          {progressBar(active)}
        </div>
      )}

      {/* Next locked goal (dimmed preview) */}
      {nextLocked && (
        <div style={{ ...card, opacity: 0.4, marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: "#555", fontFamily: FONT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            Next — Tier {nextLocked.tier}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#666", fontFamily: FONT }}>
            {nextLocked.label}
          </div>
        </div>
      )}

      {/* Achieved milestones */}
      {achieved.length > 0 && (
        <div>
          <div style={label}>Achieved</div>
          {achieved.map(g => (
            <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #111" }}>
              <div>
                <div style={{ fontSize: 12, color: "#e0e0e0", fontFamily: FONT, fontWeight: 600 }}>
                  {g.label}
                </div>
                {g.achievedDate && (
                  <div style={{ fontSize: 10, color: "#444", fontFamily: FONT, marginTop: 2 }}>
                    {g.achievedDate}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 11, color: "#22c55e", fontFamily: FONT }}>✓</div>
            </div>
          ))}
        </div>
      )}

      {achieved.length === 0 && !active && (
        <div style={{ color: "#444", fontSize: 13, fontFamily: FONT }}>
          All milestones achieved.
        </div>
      )}
    </div>
  );
}
