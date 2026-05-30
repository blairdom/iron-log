import { useState } from "react";
import { useApp } from "../store/AppStore";
import { FONT, screen, sectionHeader, addBtn, dropdown, card, label } from "../components/theme";
import { EXERCISES } from "../data/exercises";
import type { SalvageType } from "../engine/types";

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export default function SessionView({ onComplete, onBack }: Props) {
  const { state, dispatch } = useApp();
  const { activeSession, program } = state;
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!activeSession) {
    return (
      <div style={screen(null)}>
        <div style={{ color: "#555", fontFamily: FONT, fontSize: 13 }}>No active session.</div>
        <button style={{ ...addBtn, marginTop: 16 }} onClick={onBack}>← BACK</button>
      </div>
    );
  }

  const day = program.find(d => d.key === activeSession.dayKey);
  const dayLabel = day?.label ?? activeSession.dayKey.toUpperCase();

  function handleComplete(idx: number) {
    dispatch({ type: "COMPLETE_EXERCISE", exerciseIdx: idx });
  }

  function handleAddSet(idx: number) {
    dispatch({ type: "ADD_SET", exerciseIdx: idx });
  }

  function handleUpdateSet(exIdx: number, setIdx: number, field: "reps" | "weight", val: number) {
    dispatch({ type: "UPDATE_SET", exerciseIdx: exIdx, setIdx, field, value: val });
  }

  function handleSwap(exIdx: number, newId: string) {
    dispatch({ type: "SWAP_EXERCISE", exerciseIdx: exIdx, newExerciseId: newId });
  }

  function handleSalvage(type: SalvageType) {
    dispatch({ type: "MARK_SALVAGE", salvageType: type });
  }

  function handleCompleteSession() {
    dispatch({ type: "COMPLETE_SESSION" });
    onComplete();
  }

  const { summary } = activeSession;

  // Group exercises back into sections for display
  const sections = day?.sections ?? [];
  let exIdx = 0;
  const grouped: { sectionName: string; exercises: typeof activeSession.exercises; startIdx: number }[] = [];
  for (const sec of sections) {
    const start = exIdx;
    const exs = activeSession.exercises.slice(start, start + sec.slots.length);
    grouped.push({ sectionName: sec.name, exercises: exs, startIdx: start });
    exIdx += sec.slots.length;
  }

  // If no sections (shouldn't happen), just show flat
  if (grouped.length === 0 && activeSession.exercises.length > 0) {
    grouped.push({ sectionName: "EXERCISES", exercises: activeSession.exercises, startIdx: 0 });
  }

  const salvageActive = activeSession.salvageType;

  return (
    <div style={screen(null)}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ ...label, marginTop: 0 }}>{dayLabel}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginTop: 2, fontFamily: FONT }}>
            {activeSession.dayType}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {(["abbreviated", "mobility", "emergency"] as SalvageType[]).map(t => (
            <button
              key={t as string}
              style={{
                padding: "8px 10px",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.05em",
                background: salvageActive === t ? "#1a1a1a" : "#111",
                border: salvageActive === t ? "1px solid #555" : "1px solid #333",
                borderRadius: 4,
                color: salvageActive === t ? "#e0e0e0" : "#888",
                cursor: "pointer",
                fontFamily: FONT,
                textTransform: "uppercase",
              }}
              onClick={() => handleSalvage(salvageActive === t ? null : t)}
            >
              {t === "emergency" ? "10-MIN" : t!.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Sections */}
      {grouped.map(({ sectionName, exercises, startIdx }) => (
        <div key={sectionName}>
          <div style={sectionHeader}>{sectionName}</div>
          {exercises.map((ex, relIdx) => {
            const absIdx = startIdx + relIdx;
            const isExpanded = expanded === absIdx;
            const isDone = ex.completed;

            // Compatible exercises for swap
            const compatibleExs = EXERCISES.filter(e =>
              e.bodyPart === (EXERCISES.find(x => x.id === ex.exerciseId)?.bodyPart ?? "") ||
              e.movementPattern === (EXERCISES.find(x => x.id === ex.exerciseId)?.movementPattern ?? "")
            );

            return (
              <div key={absIdx}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid #111",
                    opacity: isDone ? 0.4 : 1,
                    cursor: "pointer",
                  }}
                  onClick={() => setExpanded(isExpanded ? null : absIdx)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#e0e0e0", fontFamily: FONT }}>
                      {isDone ? "✓ " : ""}{ex.name}
                    </div>
                    <div style={{ fontSize: 10, color: "#555", marginTop: 2, letterSpacing: "0.05em", fontFamily: FONT }}>
                      {EXERCISES.find(e => e.id === ex.exerciseId)?.subTarget ?? ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: "#888", background: "#1a1a1a", padding: "4px 10px", borderRadius: 3, fontFamily: FONT }}>
                      {ex.sets.length} sets
                    </div>
                    <button
                      style={{
                        ...addBtn,
                        color: isDone ? "#22c55e" : "#555",
                        borderColor: isDone ? "#22c55e" : "#333",
                        borderStyle: "solid",
                      }}
                      onClick={e => { e.stopPropagation(); handleComplete(absIdx); }}
                    >
                      {isDone ? "DONE" : "SWIPE →"}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: "8px 0 12px", borderBottom: "1px solid #1a1a1a" }}>
                    {/* Swap dropdown */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: "#555", fontFamily: FONT, letterSpacing: "0.1em", marginBottom: 4, textTransform: "uppercase" }}>
                        Swap for today
                      </div>
                      <select
                        style={dropdown}
                        value={ex.exerciseId}
                        onChange={e => handleSwap(absIdx, e.target.value)}
                      >
                        {compatibleExs.map(ce => (
                          <option key={ce.id} value={ce.id}>{ce.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sets */}
                    {ex.sets.map((set, setIdx) => (
                      <div key={setIdx} style={{ display: "flex", gap: 12, padding: "6px 0", fontSize: 12, color: "#999", alignItems: "center", fontFamily: FONT }}>
                        <div style={{ width: 20, color: "#444", fontSize: 10, fontWeight: 700 }}>{setIdx + 1}</div>
                        <input
                          type="number"
                          value={set.reps}
                          style={{ background: "#111", border: "1px solid #222", borderRadius: 3, padding: "6px 10px", color: "#e0e0e0", fontFamily: FONT, fontSize: 13, fontWeight: 600, width: 52, textAlign: "center" }}
                          onChange={e => handleUpdateSet(absIdx, setIdx, "reps", parseInt(e.target.value) || 0)}
                          onClick={e => e.stopPropagation()}
                        />
                        <div style={{ fontSize: 10, color: "#555", width: 24 }}>reps</div>
                        <input
                          type="number"
                          value={set.weight}
                          style={{ background: "#111", border: "1px solid #222", borderRadius: 3, padding: "6px 10px", color: "#e0e0e0", fontFamily: FONT, fontSize: 13, fontWeight: 600, width: 52, textAlign: "center" }}
                          onChange={e => handleUpdateSet(absIdx, setIdx, "weight", parseInt(e.target.value) || 0)}
                          onClick={e => e.stopPropagation()}
                        />
                        <div style={{ fontSize: 10, color: "#555", width: 24 }}>
                          {set.weight ? "lbs" : "bw"}
                        </div>
                      </div>
                    ))}

                    <button
                      style={{ ...addBtn, marginTop: 8 }}
                      onClick={e => { e.stopPropagation(); handleAddSet(absIdx); }}
                    >
                      + ADD SET
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Summary */}
      <div style={{ ...card, marginTop: 24 }}>
        <div style={label}>Session Summary</div>
        <div style={{ display: "flex", gap: 20, marginTop: 8, fontFamily: FONT }}>
          <div>
            <span style={{ color: "#fff", fontWeight: 700 }}>{summary.exerciseCount}</span>
            {" "}<span style={{ color: "#555", fontSize: 11 }}>exercises</span>
          </div>
          <div>
            <span style={{ color: "#fff", fontWeight: 700 }}>{summary.totalSets}</span>
            {" "}<span style={{ color: "#555", fontSize: 11 }}>sets</span>
          </div>
          <div>
            <span style={{ color: "#fff", fontWeight: 700 }}>{summary.totalVolume.toLocaleString()}</span>
            {" "}<span style={{ color: "#555", fontSize: 11 }}>lbs vol</span>
          </div>
        </div>
      </div>

      {/* Complete Session */}
      <button
        style={{
          width: "100%",
          padding: 16,
          background: "rgba(34,197,94,0.15)",
          border: "1px solid #1a3a1a",
          borderRadius: 6,
          color: "#22c55e",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: FONT,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: "pointer",
          marginTop: 20,
          marginBottom: 40,
        }}
        onClick={handleCompleteSession}
      >
        ✓ COMPLETE SESSION
      </button>
    </div>
  );
}
