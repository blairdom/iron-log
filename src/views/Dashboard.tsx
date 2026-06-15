import { useApp } from "../store/AppStore";
import { THREAT_COLORS, FONT, screen, card, label, SURFACE, SURFACE_2, BORDER, BORDER_SUBTLE, TEXT_PRIMARY, TEXT_MUTED, TEXT_DIM, BASE_BG } from "../components/theme";
import { threatLabel, threatMessage } from "../engine/behavioral";

interface Props {
  onStartSession: () => void;
  onLogCardio: (slot: "am" | "pm") => void;
}

export default function Dashboard({ onStartSession, onLogCardio }: Props) {
  const { state, dispatch } = useApp();
  const { behavioral, cardioBehavioral, program, sessions, todayKey, today, goals } = state;
  const { threatState, streak, adherenceRate, recoveryMode } = behavioral;
  const activeGoal = goals.find(g => g.status === "active") ?? null;
  const tc = THREAT_COLORS[threatState];
  const cardioTc = THREAT_COLORS[cardioBehavioral.threatState];

  const todayDay = program.find(d => d.key === todayKey);
  const todaySession = sessions.find(s => s.date === today && s.dayKey === todayKey);
  const sessionStatus = todaySession?.status ?? "not_started";

  const exerciseCount = todayDay?.sections.reduce((a, s) => a + s.slots.length, 0) ?? 0;
  const adherencePct = Math.round(adherenceRate * 100);

  function statusBadge() {
    if (sessionStatus === "complete") return { label: "COMPLETE",    color: "#22c55e", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.25)"  };
    if (sessionStatus === "partial")  return { label: "PARTIAL",     color: "#eab308", bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.25)"  };
    if (sessionStatus === "skipped")  return { label: "SKIPPED",     color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)"  };
    return                                   { label: "NOT STARTED", color: "#eab308", bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.25)"  };
  }

  const badge = statusBadge();

  const cardioStatusColor = cardioBehavioral.todayStatus === "complete" ? "#22c55e"
    : cardioBehavioral.todayStatus === "partial" ? "#eab308" : TEXT_DIM;
  const cardioStatusLabel = cardioBehavioral.todayStatus === "complete" ? "BOTH DONE"
    : cardioBehavioral.todayStatus === "partial" ? "HALF DONE" : "PENDING";

  return (
    <div style={screen(threatState)}>

      {/* Adherence hero */}
      <div style={{ paddingTop: 8 }}>
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1, color: TEXT_PRIMARY, letterSpacing: "-0.03em", fontFamily: FONT }}>
          {adherencePct}<span style={{ fontSize: 32, fontWeight: 600, color: TEXT_MUTED }}>%</span>
        </div>
        <div style={{ ...label, marginTop: 4 }}>Program Adherence Rate</div>
      </div>

      {/* Threat message */}
      <div style={{
        marginTop: 16,
        padding: "10px 14px",
        borderRadius: 8,
        background: tc.bg,
        border: `1px solid ${tc.border}`,
        fontSize: 12,
        color: tc.accent,
        fontStyle: "italic",
        fontFamily: FONT,
      }}>
        {threatMessage(threatState)}
      </div>

      {/* Today's Session Card */}
      {todayDay && (
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, fontFamily: FONT }}>
                Today — {todayDay.label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4, color: TEXT_PRIMARY, fontFamily: FONT }}>
                {todayDay.name}
              </div>
              <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2, fontFamily: FONT }}>
                {exerciseCount} exercises
              </div>
            </div>
            <div style={{
              fontSize: 10, color: badge.color, fontWeight: 700, letterSpacing: "0.1em",
              background: badge.bg, padding: "5px 11px", borderRadius: 6,
              border: `1px solid ${badge.border}`, fontFamily: FONT,
            }}>
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
            padding: "14px 0",
            background: tc.bg,
            border: `1px solid ${tc.border}`,
            borderRadius: 10,
            color: tc.accent,
            fontSize: 12,
            fontWeight: 700,
            fontFamily: FONT,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            cursor: "pointer",
            marginTop: 12,
            boxShadow: `0 0 24px ${tc.glow}`,
            transition: "all 0.15s",
          }}
          onClick={onStartSession}
        >
          ▶ START SESSION
        </button>
      )}

      {/* Cardio Card */}
      <div style={{ ...card, marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, fontFamily: FONT }}>
              Cardio Streak
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: TEXT_PRIMARY, marginTop: 4, fontFamily: FONT }}>
              {cardioBehavioral.streak} <span style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 500 }}>days</span>
            </div>
            <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 2, fontFamily: FONT }}>
              {66 - cardioBehavioral.streak > 0
                ? `${66 - cardioBehavioral.streak} days to habit lock`
                : "LOCKED IN — habit formed"}
            </div>
          </div>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            color: cardioStatusColor,
            background: cardioBehavioral.todayStatus === "complete" ? "rgba(34,197,94,0.08)" : SURFACE_2,
            border: `1px solid ${cardioBehavioral.todayStatus === "complete" ? "rgba(34,197,94,0.25)" : BORDER_SUBTLE}`,
            padding: "5px 11px", borderRadius: 6, fontFamily: FONT,
          }}>
            {cardioStatusLabel}
          </div>
        </div>

        {/* AM / PM slot buttons */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {(["am", "pm"] as const).map(slot => {
            const slotStatus = slot === "am" ? cardioBehavioral.todayAmStatus : cardioBehavioral.todayPmStatus;
            const done = slotStatus === "complete";
            return (
              <button
                key={slot}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: done ? "rgba(34,197,94,0.07)" : SURFACE_2,
                  border: `1px solid ${done ? "rgba(34,197,94,0.25)" : BORDER}`,
                  borderRadius: 8,
                  color: done ? "#22c55e" : cardioTc.accent,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: FONT,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: done ? "default" : "pointer",
                  opacity: done ? 0.8 : 1,
                  transition: "all 0.15s",
                }}
                disabled={done}
                onClick={() => !done && onLogCardio(slot)}
              >
                {done ? `✓ ${slot.toUpperCase()}` : `▶ LOG ${slot.toUpperCase()}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recovery Mode Controls */}
      {recoveryMode.active ? (
        <button
          style={{
            width: "100%",
            padding: 12,
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.25)",
            borderRadius: 8,
            color: "#3b82f6",
            fontSize: 11,
            fontWeight: 700,
            fontFamily: FONT,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
            marginTop: 12,
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
            border: `1px solid ${BORDER_SUBTLE}`,
            borderRadius: 8,
            color: TEXT_DIM,
            fontSize: 10,
            fontWeight: 600,
            fontFamily: FONT,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
            marginTop: 12,
            transition: "all 0.15s",
          }}
          onClick={() => dispatch({ type: "ENTER_RECOVERY_MODE" })}
        >
          ENTER RECOVERY MODE
        </button>
      )}

      {/* Stat Row */}
      <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
        <div style={{ flex: 1, background: SURFACE, border: `1px solid ${BORDER_SUBTLE}`, borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: FONT }}>{streak}</div>
          <div style={{ ...label, marginTop: 2 }}>Strength Streak</div>
        </div>
        <div style={{ flex: 1, background: SURFACE, border: `1px solid ${BORDER_SUBTLE}`, borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: FONT }}>
            {Math.round(cardioBehavioral.adherenceRate * 100)}%
          </div>
          <div style={{ ...label, marginTop: 2 }}>Cardio 7-Day</div>
        </div>
      </div>

      {/* Current Goal */}
      {activeGoal && (
        <div style={{
          marginTop: 12,
          padding: "12px 16px",
          background: SURFACE,
          border: `1px solid ${BORDER_SUBTLE}`,
          borderRadius: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: TEXT_MUTED, fontFamily: FONT }}>Goal: {activeGoal.label}</div>
          </div>
          <div style={{ fontSize: 12, color: TEXT_PRIMARY, fontFamily: FONT, fontWeight: 600, flexShrink: 0 }}>
            {activeGoal.progressValue}/{activeGoal.targetValue}
          </div>
        </div>
      )}
    </div>
  );
}
