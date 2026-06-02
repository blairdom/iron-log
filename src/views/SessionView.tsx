import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../store/AppStore";
import { FONT, screen, sectionHeader, addBtn, dropdown, card, label } from "../components/theme";
import { EXERCISES } from "../data/exercises";
import type { SalvageType } from "../engine/types";

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface SetTimerState {
  exIdx: number;
  setIdx: number;
  elapsed: number;
  running: boolean;
}

interface RestTimerState {
  exIdx: number;
  remaining: number;
  total: number;
  done: boolean;
}

export default function SessionView({ onComplete, onBack }: Props) {
  const { state, dispatch } = useApp();
  const { activeSession, program } = state;
  const [expanded, setExpanded] = useState<number | null>(null);

  // ── Timer state ────────────────────────────────────────────────────────────
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [setTimer, setSetTimer] = useState<SetTimerState | null>(null);
  const [restTimer, setRestTimer] = useState<RestTimerState | null>(null);

  // Rest presets per exercise index (initialized from program, adjustable in session)
  const [restPresets, setRestPresets] = useState<Record<number, number>>({});

  // Initialize rest presets from program slots
  useEffect(() => {
    if (!activeSession) return;
    const day = program.find(d => d.key === activeSession.dayKey);
    if (!day) return;
    const presets: Record<number, number> = {};
    let idx = 0;
    for (const sec of day.sections) {
      for (const slot of sec.slots) {
        presets[idx] = slot.restSeconds ?? 90;
        idx++;
      }
    }
    setRestPresets(presets);
  }, [activeSession?.dayKey]);

  // Session timer: tick every second
  useEffect(() => {
    if (!activeSession) return;
    const startedAt = activeSession.startedAt ? new Date(activeSession.startedAt).getTime() : Date.now();
    setSessionElapsed(Math.floor((Date.now() - startedAt) / 1000));

    const id = setInterval(() => {
      setSessionElapsed(Math.floor((Date.now() - startedAt) / 1000));
      setSetTimer(prev => {
        if (!prev || !prev.running) return prev;
        return { ...prev, elapsed: prev.elapsed + 1 };
      });
      setRestTimer(prev => {
        if (!prev || prev.done) return prev;
        const next = prev.remaining - 1;
        return { ...prev, remaining: Math.max(0, next), done: next <= 0 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [activeSession?.id]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function startSetTimer(exIdx: number, setIdx: number) {
    setSetTimer({ exIdx, setIdx, elapsed: 0, running: true });
    setRestTimer(null); // cancel any active rest timer
  }

  function stopSetTimer(exIdx: number) {
    setSetTimer(prev => prev ? { ...prev, running: false } : null);
    // Auto-start rest timer for this exercise
    const preset = restPresets[exIdx] ?? 90;
    setRestTimer({ exIdx, remaining: preset, total: preset, done: false });
  }

  function startRest(exIdx: number) {
    const preset = restPresets[exIdx] ?? 90;
    setRestTimer({ exIdx, remaining: preset, total: preset, done: false });
    setSetTimer(null);
  }

  function cancelRest() {
    setRestTimer(null);
  }

  function adjustRestPreset(exIdx: number, delta: number) {
    setRestPresets(prev => {
      const current = prev[exIdx] ?? 90;
      return { ...prev, [exIdx]: Math.max(10, current + delta) };
    });
    // If this exercise's rest is currently running, adjust remaining proportionally
    setRestTimer(prev => {
      if (!prev || prev.exIdx !== exIdx) return prev;
      const newTotal = Math.max(10, (restPresets[exIdx] ?? 90) + delta);
      return { ...prev, total: newTotal, remaining: Math.min(prev.remaining, newTotal) };
    });
  }

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
  const salvageActive = activeSession.salvageType;
  const { summary } = activeSession;

  // Group exercises into sections
  const sections = day?.sections ?? [];
  let exIdx = 0;
  const grouped: { sectionName: string; exercises: typeof activeSession.exercises; startIdx: number }[] = [];
  for (const sec of sections) {
    const start = exIdx;
    grouped.push({ sectionName: sec.name, exercises: activeSession.exercises.slice(start, start + sec.slots.length), startIdx: start });
    exIdx += sec.slots.length;
  }
  if (grouped.length === 0 && activeSession.exercises.length > 0) {
    grouped.push({ sectionName: "EXERCISES", exercises: activeSession.exercises, startIdx: 0 });
  }

  function handleComplete(idx: number) { dispatch({ type: "COMPLETE_EXERCISE", exerciseIdx: idx }); }
  function handleAddSet(idx: number) { dispatch({ type: "ADD_SET", exerciseIdx: idx }); }
  function handleRemoveSet(exIdx: number, setIdx: number) { dispatch({ type: "REMOVE_SET", exerciseIdx: exIdx, setIdx }); }
  function handleUpdateSet(exIdx: number, setIdx: number, field: "reps" | "weight", val: number) {
    dispatch({ type: "UPDATE_SET", exerciseIdx: exIdx, setIdx, field, value: val });
  }
  function trimLeadingZeros(exIdx: number, setIdx: number, field: "reps" | "weight", val: string) {
    dispatch({ type: "UPDATE_SET", exerciseIdx: exIdx, setIdx, field, value: parseInt(val) || 0 });
  }
  function handleSwap(exIdx: number, newId: string) { dispatch({ type: "SWAP_EXERCISE", exerciseIdx: exIdx, newExerciseId: newId }); }
  function handleSalvage(type: SalvageType) { dispatch({ type: "MARK_SALVAGE", salvageType: type }); }
  function handleCompleteSession() { dispatch({ type: "COMPLETE_SESSION" }); onComplete(); }
  function handleFlubSession() { dispatch({ type: "FLUB_SESSION" }); onComplete(); }

  return (
    <div style={screen(null)}>

      {/* ── Header with session timer ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, fontFamily: FONT }}>{dayLabel}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginTop: 2, fontFamily: FONT }}>{activeSession.dayType}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "#444", fontFamily: FONT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>Session</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: FONT, letterSpacing: "0.05em" }}>{fmt(sessionElapsed)}</div>
        </div>
      </div>

      {/* Salvage buttons */}
      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
        {(["abbreviated", "mobility", "emergency"] as SalvageType[]).map(t => (
          <button key={t as string} style={{
            padding: "8px 10px", fontSize: 10, fontWeight: 600, letterSpacing: "0.05em",
            background: salvageActive === t ? "#1a1a1a" : "#111",
            border: salvageActive === t ? "1px solid #555" : "1px solid #333",
            borderRadius: 4, color: salvageActive === t ? "#e0e0e0" : "#888",
            cursor: "pointer", fontFamily: FONT, textTransform: "uppercase",
          }} onClick={() => handleSalvage(salvageActive === t ? null : t)}>
            {t === "emergency" ? "10-MIN" : t!.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── Exercise sections ── */}
      {grouped.map(({ sectionName, exercises, startIdx }) => (
        <div key={sectionName}>
          <div style={sectionHeader}>{sectionName}</div>

          {exercises.map((ex, relIdx) => {
            const absIdx = startIdx + relIdx;
            const isExpanded = expanded === absIdx;
            const isDone = ex.completed;
            const isSetRunning = setTimer?.exIdx === absIdx && setTimer.running;
            const isRestRunning = restTimer?.exIdx === absIdx && !restTimer.done;
            const isRestDone = restTimer?.exIdx === absIdx && restTimer.done;
            const restPreset = restPresets[absIdx] ?? 90;

            const compatibleExs = EXERCISES.filter(e =>
              e.bodyPart === (EXERCISES.find(x => x.id === ex.exerciseId)?.bodyPart ?? "") ||
              e.movementPattern === (EXERCISES.find(x => x.id === ex.exerciseId)?.movementPattern ?? "")
            );

            // Rest timer color
            const restColor = !restTimer || restTimer.exIdx !== absIdx ? "#555"
              : restTimer.done ? "#ef4444"
              : restTimer.remaining > restTimer.total * 0.4 ? "#22c55e"
              : restTimer.remaining > 15 ? "#eab308"
              : "#ef4444";

            return (
              <div key={absIdx}>
                {/* Exercise row */}
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #111", opacity: isDone ? 0.4 : 1, cursor: "pointer" }}
                  onClick={() => setExpanded(isExpanded ? null : absIdx)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#e0e0e0", fontFamily: FONT }}>{isDone ? "✓ " : ""}{ex.name}</div>
                    <div style={{ fontSize: 10, color: "#555", marginTop: 2, letterSpacing: "0.05em", fontFamily: FONT }}>
                      {EXERCISES.find(e => e.id === ex.exerciseId)?.subTarget ?? ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                    {/* Inline rest/set timer indicator */}
                    {isSetRunning && (
                      <div style={{ fontSize: 11, color: "#eab308", fontFamily: FONT, fontWeight: 700 }}>
                        ▶ {fmt(setTimer!.elapsed)}
                      </div>
                    )}
                    {isRestRunning && (
                      <div style={{ fontSize: 11, color: restColor, fontFamily: FONT, fontWeight: 700 }}>
                        REST {fmt(restTimer!.remaining)}
                      </div>
                    )}
                    {isRestDone && (
                      <div style={{ fontSize: 11, color: "#ef4444", fontFamily: FONT, fontWeight: 700 }}>GO</div>
                    )}
                    <div style={{ fontSize: 11, color: "#888", background: "#1a1a1a", padding: "4px 10px", borderRadius: 3, fontFamily: FONT }}>
                      {ex.sets.length} sets
                    </div>
                    <button
                      style={{ ...addBtn, color: isDone ? "#22c55e" : "#555", borderColor: isDone ? "#22c55e" : "#333", borderStyle: "solid" }}
                      onClick={e => { e.stopPropagation(); handleComplete(absIdx); }}
                    >
                      {isDone ? "DONE" : "SWIPE →"}
                    </button>
                  </div>
                </div>

                {/* Expanded section */}
                {isExpanded && (
                  <div style={{ padding: "8px 0 12px", borderBottom: "1px solid #1a1a1a" }}>

                    {/* Swap */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: "#555", fontFamily: FONT, letterSpacing: "0.1em", marginBottom: 4, textTransform: "uppercase" }}>Swap for today</div>
                      <select style={dropdown} value={ex.exerciseId} onChange={e => handleSwap(absIdx, e.target.value)}>
                        {compatibleExs.map(ce => <option key={ce.id} value={ce.id}>{ce.name}</option>)}
                      </select>
                    </div>

                    {/* Sets */}
                    {ex.sets.map((set, setIdx) => {
                      const isThisSetRunning = setTimer?.exIdx === absIdx && setTimer.setIdx === setIdx && setTimer.running;
                      const thisSetElapsed = setTimer?.exIdx === absIdx && setTimer.setIdx === setIdx ? setTimer.elapsed : null;

                      return (
                        <div key={setIdx} style={{ display: "flex", gap: 10, padding: "6px 0", fontSize: 12, color: "#999", alignItems: "center", fontFamily: FONT }}>
                          <div style={{ width: 18, color: "#444", fontSize: 10, fontWeight: 700 }}>{setIdx + 1}</div>
                          <input type="number" value={set.reps}
                            style={{ background: "#111", border: "1px solid #222", borderRadius: 3, padding: "6px 8px", color: "#e0e0e0", fontFamily: FONT, fontSize: 13, fontWeight: 600, width: 52, textAlign: "center" }}
                            onChange={e => handleUpdateSet(absIdx, setIdx, "reps", parseInt(e.target.value) || 0)}
                            onBlur={e => trimLeadingZeros(absIdx, setIdx, "reps", e.target.value)}
                            onClick={e => e.stopPropagation()} />
                          <div style={{ fontSize: 10, color: "#555", width: 22 }}>reps</div>
                          <input type="number" value={set.weight}
                            style={{ background: "#111", border: "1px solid #222", borderRadius: 3, padding: "6px 8px", color: "#e0e0e0", fontFamily: FONT, fontSize: 13, fontWeight: 600, width: 52, textAlign: "center" }}
                            onChange={e => handleUpdateSet(absIdx, setIdx, "weight", parseInt(e.target.value) || 0)}
                            onBlur={e => trimLeadingZeros(absIdx, setIdx, "weight", e.target.value)}
                            onClick={e => e.stopPropagation()} />
                          <div style={{ fontSize: 10, color: "#555", width: 20 }}>{set.weight ? "lbs" : "bw"}</div>

                          {/* Set timer button */}
                          <button
                            style={{ padding: "4px 8px", fontSize: 10, fontWeight: 700, fontFamily: FONT, letterSpacing: "0.05em", background: isThisSetRunning ? "rgba(234,179,8,0.15)" : "#111", border: isThisSetRunning ? "1px solid #3a3210" : "1px solid #222", borderRadius: 3, color: isThisSetRunning ? "#eab308" : "#444", cursor: "pointer" }}
                            onClick={e => { e.stopPropagation(); isThisSetRunning ? stopSetTimer(absIdx) : startSetTimer(absIdx, setIdx); }}
                          >
                            {isThisSetRunning ? `■ ${fmt(thisSetElapsed ?? 0)}` : "▶ SET"}
                          </button>

                          {ex.sets.length > 1 && (
                            <button style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 14, padding: "0 4px", fontFamily: FONT, lineHeight: 1 }}
                              onClick={e => { e.stopPropagation(); handleRemoveSet(absIdx, setIdx); }}>✕</button>
                          )}
                        </div>
                      );
                    })}

                    <button style={{ ...addBtn, marginTop: 8 }} onClick={e => { e.stopPropagation(); handleAddSet(absIdx); }}>+ ADD SET</button>

                    {/* ── Rest timer ── */}
                    <div style={{ marginTop: 12, padding: "10px 12px", background: "#0f0f0f", border: `1px solid ${isRestRunning || isRestDone ? restColor : "#1a1a1a"}`, borderRadius: 5 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 10, color: "#444", fontFamily: FONT, letterSpacing: "0.1em", textTransform: "uppercase" }}>Rest Timer</div>
                        {(isRestRunning || isRestDone) && (
                          <div style={{ fontSize: 20, fontWeight: 700, color: restColor, fontFamily: FONT }}>
                            {isRestDone ? "GO!" : fmt(restTimer!.remaining)}
                          </div>
                        )}
                      </div>

                      {/* Progress bar */}
                      {isRestRunning && (
                        <div style={{ height: 3, background: "#1a1a1a", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(restTimer!.remaining / restTimer!.total) * 100}%`, background: restColor, borderRadius: 2, transition: "width 1s linear" }} />
                        </div>
                      )}

                      {/* Controls */}
                      <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                        {!isRestRunning && !isRestDone ? (
                          <button style={{ ...addBtn, padding: "6px 12px" }} onClick={() => startRest(absIdx)}>
                            ▶ REST {fmt(restPreset)}
                          </button>
                        ) : (
                          <button style={{ ...addBtn, padding: "6px 12px", color: "#ef4444", borderColor: "#3a1010" }} onClick={cancelRest}>
                            ✕ CANCEL
                          </button>
                        )}

                        {/* Preset adjustment */}
                        <div style={{ display: "flex", gap: 4, alignItems: "center", marginLeft: "auto" }}>
                          <button style={{ ...addBtn, padding: "4px 8px", fontSize: 11 }} onClick={() => adjustRestPreset(absIdx, -15)}>−15s</button>
                          <div style={{ fontSize: 11, color: "#555", fontFamily: FONT, width: 36, textAlign: "center" }}>{fmt(restPreset)}</div>
                          <button style={{ ...addBtn, padding: "4px 8px", fontSize: 11 }} onClick={() => adjustRestPreset(absIdx, 15)}>+15s</button>
                        </div>
                      </div>
                    </div>
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
          <div><span style={{ color: "#fff", fontWeight: 700 }}>{summary.exerciseCount}</span>{" "}<span style={{ color: "#555", fontSize: 11 }}>exercises</span></div>
          <div><span style={{ color: "#fff", fontWeight: 700 }}>{summary.totalSets}</span>{" "}<span style={{ color: "#555", fontSize: 11 }}>sets</span></div>
          <div><span style={{ color: "#fff", fontWeight: 700 }}>{summary.totalVolume.toLocaleString()}</span>{" "}<span style={{ color: "#555", fontSize: 11 }}>lbs vol</span></div>
          <div><span style={{ color: "#fff", fontWeight: 700 }}>{fmt(sessionElapsed)}</span>{" "}<span style={{ color: "#555", fontSize: 11 }}>total</span></div>
        </div>
      </div>

      {/* Complete / Flub */}
      <button style={{ width: "100%", padding: 16, background: "rgba(34,197,94,0.15)", border: "1px solid #1a3a1a", borderRadius: 6, color: "#22c55e", fontSize: 14, fontWeight: 700, fontFamily: FONT, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", marginTop: 20 }}
        onClick={handleCompleteSession}>✓ COMPLETE SESSION</button>
      <button style={{ width: "100%", padding: 12, background: "#111", border: "1px solid #222", borderRadius: 6, color: "#555", fontSize: 12, fontWeight: 600, fontFamily: FONT, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", marginTop: 8, marginBottom: 40 }}
        onClick={handleFlubSession}>FLUB — I PHONED IT IN</button>
    </div>
  );
}
