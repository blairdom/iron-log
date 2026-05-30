import { useApp } from "../store/AppStore";
import { THREAT_COLORS, FONT, screen, card, label } from "../components/theme";
import { threatLabel, threatMessage } from "../engine/behavioral";

interface Props {
  onStartSession: () => void;
  onLogCardio: () => void;
}

export default function Dashboard({ onStartSession, onLogCardio }: Props) {
  const { state, dispatch } = useApp();
  const { behavioral, cardioBehavioral, program, sessions, todayKey, today } = state;
  const { threatState, streak, adherenceRate, recoveryMode } = behavioral;
  const tc = THREAT_COLORS[threatState];
  const cardioTc = THREAT_COLORS[cardioBehavioral.threatState];

  const todayDay = program.find(d => d.key === todayKey);
  const todaySession = sessions.find(s => s.date === today && s.dayKey === todayKey);
  const sessionStatus = todaySession?.status ?? "not_started";

  const exerciseCount = todayDay?.sections.reduce((a, s) => a + s.slots.length, 0) ?? 0;

  const adherencePct = Math.round(adherenceRate * 100);

  function statusBadge() {
    if (sessionStatus === "complete") return { label: "COMPLETE", color: "#22c55e", bg: "rgba(34,197,94,0.1)" };
    if (sessionStatus === "partial") return { label: "PARTIAL", color: "#eab308", bg: "rgba(234,179,8,0.1)" };
    if (sessionStatus === "skipped") return { label: "SKIPPED", color: "#ef4444", bg: "rgba(239,68,68,0.1)" };
    return { label: "NOT STARTED", color: "#eab308", bg: "rgba(234,179,8,0.1)" };
  }

  const badge = statusBadge();

  const cardioStatusColor = cardioBehavioral.todayStatus === "complete" ? "#22c55e"
    : cardioBehavioral.todayStatus === "skipped" ? "#ef4444" : "#555";
  const cardioStatusLabel = cardioBehavioral.todayStatus === "complete" ? "DONE"
    : cardioBehavioral.todayStatus === "skipped" ? "MISSED" : "PENDING";

  return (
    <div style={screen(threatState)}>
      {/* Threat Badge */}
      <div style={{
        display: "inline-block",
        padding: "6px 16px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: tc.accent,
        background: tc.glow,
        border: `1px solid ${tc.border}`,
        fontFamily: FONT,
      }}>
        {threatLabel(threatState)}
      </div>

      {/* Threat Message */}
      <div style={{ fontSize: 13, color: tc.accent, marginTop: 8, fontStyle: "italic", opacity: 0.9, fontFamily: FONT }}>
        {threatMessage(threatState)}
      </div>

      {/* Adherence Rate */}
      <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1, marginTop: 24, color: "#fff", letterSpacing: "-0.03em", fontFamily: FONT }}>
        {adherencePct}%
      </div>
      <div style={label}>Program Adherence Rate</div>

      {/* Today's Session Card */}
      {todayDay && (
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, fontFamily: FONT }}>
                Today — {todayDay.label}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, color: "#fff", fontFamily: FONT }}>
                {todayDay.name}
              </div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 2, fontFamily: FONT }}>
                {exerciseCount} exercises
              </div>
            </div>
            <div style={{ fontSize: 10, color: badge.color, fontWeight: 700, letterSpacing: "0.1em", background: badge.bg, padding: "4px 10px", borderRadius: 3, fontFamily: FONT }}>
              {badge.label}
            </div>
          </div>
        </div>
      )}

      {/* Start Session Button */}
      {todayDay?.scheduled && sessionStatus === "not_started" && (
        <button
          style={{
            width: "100%",
            padding: 16,
            background: tc.glow,
            border: `1px solid ${tc.border}`,
            borderRadius: 6,
            color: tc.accent,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: FONT,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            marginTop: 20,
          }}
          onClick={onStartSession}
        >
          ▶ START SESSION
        </button>
      )}

      {/* ── Cardio Consistency Card ── */}
      <div style={{ ...card, marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, fontFamily: FONT }}>
              Cardio Streak
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginTop: 4, fontFamily: FONT }}>
              {cardioBehavioral.streak} days
            </div>
            <div style={{ fontSize: 11, color: "#444", marginTop: 2, fontFamily: FONT }}>
              {66 - cardioBehavioral.streak > 0
                ? `${66 - cardioBehavioral.streak} days to habit lock`
                : "LOCKED IN — habit formed"}
            </div>
          </div>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: cardioStatusColor,
            background: cardioBehavioral.todayStatus === "complete" ? "rgba(34,197,94,0.1)" : "#111",
            border: `1px solid ${cardioBehavioral.todayStatus === "complete" ? "#1a3a1a" : "#222"}`,
            padding: "4px 10px",
            borderRadius: 3,
            fontFamily: FONT,
          }}>
            {cardioStatusLabel}
          </div>
        </div>

        {cardioBehavioral.todayStatus !== "complete" && (
          <button
            style={{
              width: "100%",
              padding: 12,
              background: cardioTc.glow,
              border: `1px solid ${cardioTc.border}`,
              borderRadius: 6,
              color: cardioTc.accent,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: FONT,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              marginTop: 12,
            }}
            onClick={onLogCardio}
          >
            ▶ LOG CARDIO
          </button>
        )}
      </div>

      {/* Recovery Mode Controls */}
      {recoveryMode.active ? (
        <button
          style={{
            width: "100%",
            padding: 12,
            background: "rgba(59,130,246,0.1)",
            border: "1px solid #102040",
            borderRadius: 6,
            color: "#3b82f6",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: FONT,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            marginTop: 16,
          }}
          onClick={() => dispatch({ type: "EXIT_RECOVERY_MODE" })}
        >
          EXIT RECOVERY MODE
        </button>
      ) : (
        <button
          style={{
            width: "100%",
            padding: 10,
            background: "transparent",
            border: "1px solid #1a1a1a",
            borderRadius: 6,
            color: "#444",
            fontSize: 11,
            fontWeight: 600,
            fontFamily: FONT,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            marginTop: 16,
          }}
          onClick={() => dispatch({ type: "ENTER_RECOVERY_MODE" })}
        >
          ENTER RECOVERY MODE
        </button>
      )}

      {/* Stat Row */}
      <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", fontFamily: FONT }}>{streak}</div>
          <div style={label}>Strength Streak</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", fontFamily: FONT }}>
            {Math.round(cardioBehavioral.adherenceRate * 100)}%
          </div>
          <div style={label}>Cardio 7-Day</div>
        </div>
      </div>
    </div>
  );
}
