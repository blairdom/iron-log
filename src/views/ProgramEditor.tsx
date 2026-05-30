import { useState } from "react";
import { useApp } from "../store/AppStore";
import { FONT, screen, sectionHeader, addBtn, dropdown, label } from "../components/theme";
import { EXERCISES } from "../data/exercises";

export default function ProgramEditor() {
  const { state, dispatch } = useApp();
  const { program } = state;
  const scheduledDays = program.filter(d => d.scheduled);
  const [activeDay, setActiveDay] = useState(scheduledDays[0]?.key ?? "mon");

  const day = program.find(d => d.key === activeDay);

  return (
    <div style={screen(null)}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#666", textTransform: "uppercase", fontFamily: FONT }}>
        Program Editor
      </div>

      {/* Day Selector */}
      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
        {scheduledDays.map(d => (
          <button
            key={d.key}
            onClick={() => setActiveDay(d.key)}
            style={{
              padding: "8px 14px",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: FONT,
              letterSpacing: "0.1em",
              background: activeDay === d.key ? "#222" : "#111",
              border: activeDay === d.key ? "1px solid #444" : "1px solid #222",
              borderRadius: 4,
              color: activeDay === d.key ? "#fff" : "#555",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {day && day.sections.map(section => (
        <div key={section.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", ...sectionHeader, marginBottom: 0 }}>
            <span>{section.name}</span>
            <button
              style={{ ...addBtn, padding: "4px 8px", fontSize: 9 }}
              onClick={() => dispatch({ type: "REMOVE_SECTION", dayKey: activeDay, sectionId: section.id })}
            >
              REMOVE
            </button>
          </div>

          {section.slots.map(slot => {
            const compatibleExs = EXERCISES.filter(e =>
              e.bodyPart === slot.bodyPart || e.movementPattern === slot.movementPattern
            );
            return (
              <div key={slot.id} style={{ padding: "10px 0", borderBottom: "1px solid #111" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, fontFamily: FONT }}>
                    {slot.subTarget}
                  </div>
                  <button
                    style={{ ...addBtn, padding: "2px 8px", fontSize: 9, color: "#444" }}
                    onClick={() => dispatch({ type: "REMOVE_SLOT", dayKey: activeDay, sectionId: section.id, slotId: slot.id })}
                  >
                    ×
                  </button>
                </div>
                <select
                  style={dropdown}
                  value={slot.selectedExerciseId}
                  onChange={e => dispatch({
                    type: "UPDATE_SLOT_EXERCISE",
                    dayKey: activeDay,
                    sectionId: section.id,
                    slotId: slot.id,
                    exerciseId: e.target.value,
                  })}
                >
                  {compatibleExs.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
              </div>
            );
          })}

          <button
            style={{ ...addBtn, marginTop: 8, width: "100%", textAlign: "center" }}
            onClick={() => dispatch({ type: "ADD_SLOT", dayKey: activeDay, sectionId: section.id })}
          >
            + ADD SLOT
          </button>
        </div>
      ))}

      <button
        style={{ ...addBtn, marginTop: 20, width: "100%", textAlign: "center", padding: 12 }}
        onClick={() => dispatch({ type: "ADD_SECTION", dayKey: activeDay })}
      >
        + ADD SECTION
      </button>
    </div>
  );
}
