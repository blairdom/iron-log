import { useApp } from "../store/AppStore";
import { FONT, THREAT_COLORS, screen, card, label } from "../components/theme";

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

function Stepper({
  value,
  onChange,
  step,
  min,
  label: fieldLabel,
  unit,
}: {
  value: number;
  onChange: (v: number) => void;
  step: number;
  min: number;
  label: string;
  unit: string;
}) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", fontFamily: FONT }}>
        {fieldLabel}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          style={{
            width: 44, height: 44,
            background: "#111",
            border: "1px solid #333",
            borderRadius: 6,
            color: "#888",
            fontSize: 20,
            cursor: "pointer",
            fontFamily: FONT,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => onChange(Math.max(min, parseFloat((value - step).toFixed(1))))}
        >
          −
        </button>
        <div style={{ textAlign: "center", minWidth: 80 }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-0.03em", fontFamily: FONT }}>
            {value}
          </div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 4, fontFamily: FONT }}>{unit}</div>
        </div>
        <button
          style={{
            width: 44, height: 44,
            background: "#111",
            border: "1px solid #333",
            borderRadius: 6,
            color: "#888",
            fontSize: 20,
            cursor: "pointer",
            fontFamily: FONT,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => onChange(parseFloat((value + step).toFixed(1)))}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function CardioView({ onComplete, onBack }: Props) {
  const { state, dispatch } = useApp();
  const { activeCardioSession, cardioBehavioral, today } = state;
  const tc = THREAT_COLORS[cardioBehavioral.threatState];

  if (!activeCardioSession) {
    return (
      <div style={screen(null)}>
        <div style={{ color: "#555", fontFamily: FONT, fontSize: 13 }}>No active cardio session.</div>
        <button
          style={{ marginTop: 16, padding: "8px 14px", fontSize: 10, color: "#555", background: "#111", border: "1px dashed #333", borderRadius: 4, cursor: "pointer", fontFamily: FONT }}
          onClick={onBack}
        >
          ← BACK
        </button>
      </div>
    );
  }

  const todayFormatted = new Date(today + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={screen(null)}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ ...label, marginTop: 0 }}>{todayFormatted}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginTop: 2, fontFamily: FONT }}>CARDIO</div>
        </div>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: cardioBehavioral.todayStatus === "complete" ? "#22c55e" : "#888",
          background: cardioBehavioral.todayStatus === "complete" ? "rgba(34,197,94,0.1)" : "#111",
          border: `1px solid ${cardioBehavioral.todayStatus === "complete" ? "#1a3a1a" : "#222"}`,
          padding: "4px 10px",
          borderRadius: 3,
          fontFamily: FONT,
        }}>
          {cardioBehavioral.todayStatus === "complete" ? "DONE" : "PENDING"}
        </div>
      </div>

      {/* Input Card */}
      <div style={{ ...card, marginTop: 24 }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "space-around", padding: "16px 0" }}>
          <Stepper
            value={activeCardioSession.duration}
            onChange={v => dispatch({ type: "UPDATE_CARDIO_FIELD", field: "duration", value: v })}
            step={5}
            min={5}
            label="Duration"
            unit="minutes"
          />
          <div style={{ width: 1, background: "#1a1a1a", alignSelf: "stretch" }} />
          <Stepper
            value={activeCardioSession.speed}
            onChange={v => dispatch({ type: "UPDATE_CARDIO_FIELD", field: "speed", value: v })}
            step={0.1}
            min={0.5}
            label="Speed"
            unit="mph"
          />
        </div>

        {/* Calorie estimate — soft display only */}
        <div style={{ textAlign: "center", paddingTop: 12, borderTop: "1px solid #1a1a1a", fontSize: 11, color: "#444", fontFamily: FONT }}>
          ~{Math.round(activeCardioSession.duration * 6.5)} kcal estimated
        </div>
      </div>

      {/* Streak info */}
      <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", fontFamily: FONT }}>{cardioBehavioral.streak}</div>
          <div style={{ ...label, marginTop: 4 }}>Day Streak</div>
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", fontFamily: FONT }}>
            {Math.round(cardioBehavioral.adherenceRate * 100)}%
          </div>
          <div style={{ ...label, marginTop: 4 }}>7-Day Rate</div>
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", fontFamily: FONT }}>
            {66 - cardioBehavioral.streak > 0 ? 66 - cardioBehavioral.streak : "✓"}
          </div>
          <div style={{ ...label, marginTop: 4 }}>Days to Lock</div>
        </div>
      </div>

      {/* Complete Button */}
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
          marginTop: 28,
          marginBottom: 40,
        }}
        onClick={() => {
          dispatch({ type: "COMPLETE_CARDIO_SESSION" });
          onComplete();
        }}
      >
        ✓ LOG CARDIO
      </button>
    </div>
  );
}
