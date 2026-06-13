import { useState } from "react";
import { useApp } from "../store/AppStore";
import { FONT, screen, sectionHeader, addBtn, dropdown, label, SURFACE, SURFACE_2, BORDER, BORDER_SUBTLE, TEXT_PRIMARY, TEXT_MUTED, TEXT_DIM } from "../components/theme";
import { EXERCISES } from "../data/exercises";
import type { SlotSet } from "../data/program";

export default function ProgramEditor() {
  const { state, dispatch } = useApp();
  const { program } = state;
  const scheduledDays = program.filter(d => d.scheduled);
  const [activeDay, setActiveDay] = useState(scheduledDays[0]?.key ?? "mon");
  const [editingSlot, setEditingSlot] = useState<string | null>(null);

  const day = program.find(d => d.key === activeDay);

  function toggleSlot(slotId: string) {
    setEditingSlot(prev => prev === slotId ? null : slotId);
  }

  function updateDefaultSet(
    sectionId: string, slotId: string,
    currentSets: SlotSet[], setIdx: number,
    field: "reps" | "weight", value: number
  ) {
    const updated = currentSets.map((s, i) => i === setIdx ? { ...s, [field]: value } : s);
    dispatch({ type: "UPDATE_SLOT_DEFAULTS", dayKey: activeDay, sectionId, slotId, defaultSets: updated });
  }

  function addDefaultSet(sectionId: string, slotId: string, currentSets: SlotSet[]) {
    const last = currentSets[currentSets.length - 1] ?? { reps: 10, weight: 0, unit: "lbs" as const };
    dispatch({
      type: "UPDATE_SLOT_DEFAULTS", dayKey: activeDay, sectionId, slotId,
      defaultSets: [...currentSets, { ...last }],
    });
  }

  function removeDefaultSet(sectionId: string, slotId: string, currentSets: SlotSet[], setIdx: number) {
    dispatch({
      type: "UPDATE_SLOT_DEFAULTS", dayKey: activeDay, sectionId, slotId,
      defaultSets: currentSets.filter((_, i) => i !== setIdx),
    });
  }

  function setsLabel(sets: SlotSet[]): string {
    if (!sets || sets.length === 0) return "—";
    const reps = sets[0].reps;
    const allSameReps = sets.every(s => s.reps === reps);
    const weight = sets[0].weight;
    const allSameWeight = sets.every(s => s.weight === weight);
    const unit = sets[0].unit;
    const weightStr = unit === "bw" ? "bw" : (allSameWeight && weight > 0 ? `${weight} lbs` : "");
    const repsStr = allSameReps ? `${sets.length} × ${reps}` : sets.map(s => s.reps).join("/");
    return weightStr ? `${repsStr} @ ${weightStr}` : repsStr;
  }

  return (
    <div style={screen(null)}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: TEXT_MUTED, textTransform: "uppercase", fontFamily: FONT }}>
        Program
      </div>

      {/* Day Selector */}
      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
        {scheduledDays.map(d => (
          <button
            key={d.key}
            onClick={() => { setActiveDay(d.key); setEditingSlot(null); }}
            style={{
              padding: "8px 14px",
              fontSize: 11, fontWeight: 700, fontFamily: FONT, letterSpacing: "0.1em",
              background: activeDay === d.key ? SURFACE_2 : SURFACE,
              border: activeDay === d.key ? `1px solid ${BORDER}` : `1px solid ${BORDER_SUBTLE}`,
              borderRadius: 8,
              color: activeDay === d.key ? TEXT_PRIMARY : TEXT_DIM,
              cursor: "pointer", textTransform: "uppercase",
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {day && (
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: FONT, marginBottom: 16, marginTop: 12 }}>
            {day.name}
          </div>

          {day.sections.map(section => (
            <div key={section.id}>
              {/* Section header */}
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
                const ex = EXERCISES.find(e => e.id === slot.selectedExerciseId);
                const isEditing = editingSlot === slot.id;
                const slotSets: SlotSet[] = slot.defaultSets ?? [{ reps: 10, weight: 0, unit: "lbs" }];
                // Program editor shows all exercises, grouped by body part
                const compatibleExs = [...EXERCISES].sort((a, b) =>
                  a.bodyPart.localeCompare(b.bodyPart) || a.name.localeCompare(b.name)
                );

                return (
                  <div key={slot.id} style={{ borderBottom: "1px solid #111" }}>
                    {/* Collapsed row */}
                    <div
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", cursor: "pointer" }}
                      onClick={() => toggleSlot(slot.id)}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY, fontFamily: FONT }}>
                          {ex?.name ?? "Unknown"}
                        </div>
                        <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 2, fontFamily: FONT }}>
                          {setsLabel(slotSets)}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        <div style={{ fontSize: 11, color: TEXT_DIM, fontFamily: FONT }}>{isEditing ? "▲" : "▼"}</div>
                        <button
                          style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 16, padding: "4px 6px", fontFamily: FONT, lineHeight: 1 }}
                          title="Remove exercise"
                          onClick={e => {
                            e.stopPropagation();
                            dispatch({ type: "REMOVE_SLOT", dayKey: activeDay, sectionId: section.id, slotId: slot.id });
                          }}
                        >✕</button>
                      </div>
                    </div>

                    {/* Expanded editor */}
                    {isEditing && (
                      <div style={{ paddingBottom: 12 }}>
                        {/* Exercise swap */}
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ ...label, marginBottom: 4 }}>Exercise</div>
                          <select
                            style={dropdown}
                            value={slot.selectedExerciseId}
                            onChange={e => {
                              const picked = EXERCISES.find(x => x.id === e.target.value);
                              dispatch({ type: "UPDATE_SLOT_EXERCISE", dayKey: activeDay, sectionId: section.id, slotId: slot.id, exerciseId: e.target.value });
                              if (picked) {
                                const updated = state.program.map(d => d.key !== activeDay ? d : ({
                                  ...d, sections: d.sections.map(s => s.id !== section.id ? s : ({
                                    ...s, slots: s.slots.map(sl => sl.id !== slot.id ? sl : ({
                                      ...sl, bodyPart: picked.bodyPart, movementPattern: picked.movementPattern,
                                    })),
                                  })),
                                }));
                                dispatch({ type: "UPDATE_PROGRAM", program: updated });
                              }
                            }}
                          >
                            {compatibleExs.map(ce => (
                              <option key={ce.id} value={ce.id}>{ce.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Rest time */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ ...label, marginBottom: 6 }}>Rest Between Sets</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="number"
                              value={slot.restSeconds ?? 90}
                              style={{ background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 8px", color: TEXT_PRIMARY, fontFamily: FONT, fontSize: 13, fontWeight: 600, width: 64, textAlign: "center" }}
                              onChange={e => {
                                const val = parseInt(e.target.value) || 60;
                                const program = state.program.map(d => d.key !== activeDay ? d : {
                                  ...d,
                                  sections: d.sections.map(s => s.id !== section.id ? s : {
                                    ...s,
                                    slots: s.slots.map(sl => sl.id !== slot.id ? sl : { ...sl, restSeconds: val }),
                                  }),
                                });
                                dispatch({ type: "UPDATE_PROGRAM", program });
                              }}
                            />
                            <div style={{ fontSize: 11, color: TEXT_DIM, fontFamily: FONT }}>seconds</div>
                            <div style={{ fontSize: 11, color: TEXT_DIM, fontFamily: FONT }}>
                              ({Math.floor((slot.restSeconds ?? 90) / 60)}:{String((slot.restSeconds ?? 90) % 60).padStart(2, "0")} min)
                            </div>
                          </div>
                        </div>

                        {/* Default sets */}
                        <div style={{ ...label, marginBottom: 6 }}>Target Sets</div>
                        {slotSets.map((set, setIdx) => (
                          <div key={setIdx} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                            <div style={{ width: 18, fontSize: 10, color: "#444", fontWeight: 700, fontFamily: FONT }}>{setIdx + 1}</div>
                            <input
                              type="number"
                              value={set.reps}
                              style={{ background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 8px", color: TEXT_PRIMARY, fontFamily: FONT, fontSize: 13, fontWeight: 600, width: 52, textAlign: "center" }}
                              onChange={e => updateDefaultSet(section.id, slot.id, slotSets, setIdx, "reps", parseInt(e.target.value) || 0)}
                            />
                            <div style={{ fontSize: 10, color: TEXT_DIM, fontFamily: FONT }}>reps</div>
                            <input
                              type="number"
                              value={set.weight}
                              style={{ background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 8px", color: TEXT_PRIMARY, fontFamily: FONT, fontSize: 13, fontWeight: 600, width: 52, textAlign: "center" }}
                              onChange={e => updateDefaultSet(section.id, slot.id, slotSets, setIdx, "weight", parseInt(e.target.value) || 0)}
                            />
                            <div style={{ fontSize: 10, color: TEXT_DIM, fontFamily: FONT }}>
                              {set.unit === "bw" ? "bw" : "lbs"}
                            </div>
                            {slotSets.length > 1 && (
                              <button
                                style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 14, padding: "0 4px", fontFamily: FONT }}
                                onClick={() => removeDefaultSet(section.id, slot.id, slotSets, setIdx)}
                              >✕</button>
                            )}
                          </div>
                        ))}
                        <button style={{ ...addBtn, marginTop: 4 }} onClick={() => addDefaultSet(section.id, slot.id, slotSets)}>
                          + ADD SET
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                style={{ ...addBtn, marginTop: 8, width: "100%", textAlign: "center" }}
                onClick={() => dispatch({ type: "ADD_SLOT", dayKey: activeDay, sectionId: section.id })}
              >
                + ADD EXERCISE
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
      )}
    </div>
  );
}
