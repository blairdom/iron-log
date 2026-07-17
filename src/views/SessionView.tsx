import { useState, useEffect, useRef } from "react";
import { useApp } from "../store/AppStore";
import { FONT, screen, sectionHeader, addBtn, dropdown, card, label, SURFACE, SURFACE_2, BORDER, BORDER_SUBTLE, TEXT_PRIMARY, TEXT_MUTED, TEXT_DIM, BASE_BG } from "../components/theme";
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

// ── Audio ─────────────────────────────────────────────────────────────────────

let _audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return _audioCtx;
}

// Call on any user interaction to unlock audio on mobile
function unlockAudio() {
  try { getAudioCtx().resume(); } catch { /* ignore */ }
}

function playBell() {
  try {
    const ctx = getAudioCtx();
    ctx.resume().then(() => {
      [880, 660].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.22;
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
        osc.start(t);
        osc.stop(t + 1.4);
      });
    });
  } catch { /* audio blocked */ }
}

// ── Module-level timer cache — survives SessionView unmount/remount ───────────

interface RestCache {
  endsAt: number;   // Date.now() + remaining ms when timer was started
  total: number;    // total seconds
  exIdx: number;
}
interface SetCache {
  startedAt: number; // Date.now() when set timer started
  exIdx: number;
  setIdx: number;
}
let _restCache: RestCache | null = null;
let _setCache: SetCache | null = null;

function restRemaining(cache: RestCache): number {
  return Math.max(0, Math.round((cache.endsAt - Date.now()) / 1000));
}
function setElapsed(cache: SetCache): number {
  return Math.floor((Date.now() - cache.startedAt) / 1000);
}

// ── Timer state interfaces ────────────────────────────────────────────────────

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
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [addExFilter, setAddExFilter] = useState("");
  const [startedExercises, setStartedExercises] = useState<Set<number>>(new Set());

  // ── Timer state ────────────────────────────────────────────────────────────
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [setTimer, setSetTimer] = useState<SetTimerState | null>(() => {
    if (!_setCache) return null;
    return { exIdx: _setCache.exIdx, setIdx: _setCache.setIdx, elapsed: setElapsed(_setCache), running: true };
  });
  const [restTimer, setRestTimer] = useState<RestTimerState | null>(() => {
    if (!_restCache) return null;
    const rem = restRemaining(_restCache);
    if (rem <= 0) return { exIdx: _restCache.exIdx, remaining: 0, total: _restCache.total, done: true };
    return { exIdx: _restCache.exIdx, remaining: rem, total: _restCache.total, done: false };
  });

  // Rest presets per exercise index
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

  // Session timer + set/rest tick
  useEffect(() => {
    if (!activeSession) return;
    const startedAt = activeSession.startedAt ? new Date(activeSession.startedAt).getTime() : Date.now();
    setSessionElapsed(Math.floor((Date.now() - startedAt) / 1000));

    const id = setInterval(() => {
      setSessionElapsed(Math.floor((Date.now() - startedAt) / 1000));
      setSetTimer(prev => {
        if (!prev || !prev.running) return prev;
        const elapsed = _setCache ? setElapsed(_setCache) : prev.elapsed + 1;
        return { ...prev, elapsed };
      });
      setRestTimer(prev => {
        if (!prev || prev.done) return prev;
        const remaining = _restCache ? restRemaining(_restCache) : prev.remaining - 1;
        if (remaining <= 0 && prev.remaining > 0) playBell();
        return { ...prev, remaining: Math.max(0, remaining), done: remaining <= 0 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [activeSession?.id]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function startSetTimer(exIdx: number, setIdx: number) {
    unlockAudio();
    const cache: SetCache = { startedAt: Date.now(), exIdx, setIdx };
    _setCache = cache;
    setSetTimer({ exIdx, setIdx, elapsed: 0, running: true });
    setStartedExercises(prev => new Set(prev).add(exIdx));
  }

  function stopSetTimer(exIdx: number, totalSets: number) {
    _setCache = null;
    setSetTimer(prev => prev ? { ...prev, running: false } : null);
    // Auto-start rest
    const preset = restPresets[exIdx] ?? 90;
    const cache: RestCache = { endsAt: Date.now() + preset * 1000, total: preset, exIdx };
    _restCache = cache;
    setRestTimer({ exIdx, remaining: preset, total: preset, done: false });
    // Auto-complete exercise if this was the last set
    const currentSetIdx = setTimer?.setIdx ?? 0;
    if (currentSetIdx === totalSets - 1) {
      dispatch({ type: "COMPLETE_EXERCISE", exerciseIdx: exIdx });
    }
  }

  function startRest(exIdx: number) {
    unlockAudio();
    const preset = restPresets[exIdx] ?? 90;
    const cache: RestCache = { endsAt: Date.now() + preset * 1000, total: preset, exIdx };
    _restCache = cache;
    setRestTimer({ exIdx, remaining: preset, total: preset, done: false });
    _setCache = null;
    setSetTimer(null);
  }

  function cancelRest() {
    _restCache = null;
    setRestTimer(null);
  }

  function adjustRestPreset(exIdx: number, delta: number) {
    setRestPresets(prev => {
      const current = prev[exIdx] ?? 90;
      const next = Math.max(10, current + delta);
      return { ...prev, [exIdx]: next };
    });
  }

  function handleAddExercise(exerciseId: string) {
    unlockAudio();
    dispatch({ type: "ADD_EXERCISE_TO_SESSION", exerciseId });
    setShowAddExercise(false);
    setAddExFilter("");
    // Add default rest preset for new exercise (appended at end)
    setRestPresets(prev => {
      const nextIdx = activeSession ? activeSession.exercises.length : 0;
      return { ...prev, [nextIdx]: 90 };
    });
  }

  function handleRemoveExercise(idx: number) {
    // Clear timers if they reference this exercise
    if (setTimer?.exIdx === idx) { _setCache = null; setSetTimer(null); }
    if (restTimer?.exIdx === idx) { _restCache = null; setRestTimer(null); }
    // Shift timer indices if they reference exercises after the removed one
    if (setTimer && setTimer.exIdx > idx) setSetTimer(t => t ? { ...t, exIdx: t.exIdx - 1 } : null);
    if (restTimer && restTimer.exIdx > idx) setRestTimer(t => t ? { ...t, exIdx: t.exIdx - 1 } : null);
    // Shift restPresets
    setRestPresets(prev => {
      const next: Record<number, number> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = parseInt(k);
        if (ki < idx) next[ki] = v;
        else if (ki > idx) next[ki - 1] = v;
      });
      return next;
    });
    dispatch({ type: "REMOVE_EXERCISE_FROM_SESSION", exerciseIdx: idx });
    if (expanded === idx) setExpanded(null);
    else if (expanded !== null && expanded > idx) setExpanded(expanded - 1);
  }

  if (!activeSession) {
    return (
      <div style={screen(null)}>
        <div style={{ color: TEXT_DIM, fontFamily: FONT, fontSize: 13 }}>No active session.</div>
        <button style={{ ...addBtn, marginTop: 16 }} onClick={onBack}>← BACK</button>
      </div>
    );
  }

  const day = program.find(d => d.key === activeSession.dayKey);
  const dayLabel = day?.label ?? activeSession.dayKey.toUpperCase();
  const salvageActive = activeSession.salvageType;
  const { summary } = activeSession;

  // Flat exercise list — sections are just visual labels now
  const exercises = activeSession.exercises;

  // Group for section labels only (don't slice by section slot count since we allow free add/remove)
  const sections = day?.sections ?? [];
  let programExCount = 0;
  const sectionBoundaries: { name: string; startIdx: number }[] = [];
  for (const sec of sections) {
    sectionBoundaries.push({ name: sec.name, startIdx: programExCount });
    programExCount += sec.slots.length;
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

  // Global rest timer (visible regardless of which exercise is expanded)
  const globalRestActive = restTimer && !restTimer.done;
  const globalRestDone = restTimer?.done;
  const globalRestColor = !restTimer ? TEXT_DIM
    : restTimer.done ? "#ef4444"
    : restTimer.remaining > restTimer.total * 0.4 ? "#22c55e"
    : restTimer.remaining > 15 ? "#eab308"
    : "#ef4444";

  // Filtered exercise list for add picker
  const filteredExercises = EXERCISES.filter(e =>
    addExFilter.trim() === "" ||
    e.name.toLowerCase().includes(addExFilter.toLowerCase()) ||
    (e.bodyPart ?? "").toLowerCase().includes(addExFilter.toLowerCase())
  ).slice(0, 40);

  return (
    <div style={screen(null)} onClick={unlockAudio}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, fontFamily: FONT }}>{dayLabel}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: TEXT_PRIMARY, marginTop: 2, fontFamily: FONT }}>{activeSession.dayType}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: TEXT_DIM, fontFamily: FONT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>Session</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: FONT, letterSpacing: "0.05em" }}>{fmt(sessionElapsed)}</div>
        </div>
      </div>

      {/* ── Global rest timer banner ── */}
      {(globalRestActive || globalRestDone) && (
        <div style={{
          marginTop: 10,
          padding: "10px 14px",
          background: globalRestDone ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.06)",
          border: `1px solid ${globalRestColor}44`,
          borderRadius: 8,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: TEXT_DIM, fontFamily: FONT }}>
            {globalRestDone ? "Rest done —" : "Rest"}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: globalRestColor, fontFamily: FONT, letterSpacing: "-0.02em", lineHeight: 1 }}>
            {globalRestDone ? "GO!" : fmt(restTimer!.remaining)}
          </div>
          {globalRestActive && (
            <div style={{ height: 4, width: 80, background: BORDER_SUBTLE, borderRadius: 2, overflow: "hidden", alignSelf: "center" }}>
              <div style={{ height: "100%", width: `${(restTimer!.remaining / restTimer!.total) * 100}%`, background: globalRestColor, borderRadius: 2, transition: "width 1s linear" }} />
            </div>
          )}
          <button onClick={cancelRest} style={{ background: "none", border: "none", color: TEXT_DIM, cursor: "pointer", fontSize: 16, fontFamily: FONT, padding: "0 4px" }}>✕</button>
        </div>
      )}

      {/* Salvage buttons */}
      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
        {(["abbreviated", "mobility", "emergency"] as SalvageType[]).map(t => (
          <button key={t as string} style={{
            padding: "8px 10px", fontSize: 10, fontWeight: 600, letterSpacing: "0.05em",
            background: salvageActive === t ? SURFACE_2 : SURFACE,
            border: salvageActive === t ? `1px solid ${BORDER}` : `1px solid ${BORDER_SUBTLE}`,
            borderRadius: 6, color: salvageActive === t ? TEXT_PRIMARY : TEXT_MUTED,
            cursor: "pointer", fontFamily: FONT, textTransform: "uppercase",
          }} onClick={() => handleSalvage(salvageActive === t ? null : t)}>
            {t === "emergency" ? "10-MIN" : t!.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── Exercise list ── */}
      {exercises.map((ex, absIdx) => {
        // Find section label for this index
        const sectionLabel = sectionBoundaries.findLast
          ? sectionBoundaries.findLast(b => b.startIdx === absIdx)
          : sectionBoundaries.slice().reverse().find(b => b.startIdx === absIdx);
        const isFirstAdded = absIdx >= programExCount && absIdx === programExCount;

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

        const restColor = !restTimer || restTimer.exIdx !== absIdx ? "#555"
          : restTimer.done ? "#ef4444"
          : restTimer.remaining > restTimer.total * 0.4 ? "#22c55e"
          : restTimer.remaining > 15 ? "#eab308"
          : "#ef4444";

        return (
          <div key={absIdx}>
            {/* Section label */}
            {sectionLabel && <div style={sectionHeader}>{sectionLabel.name}</div>}
            {isFirstAdded && <div style={sectionHeader}>Added This Session</div>}

            {/* Exercise row */}
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${BORDER_SUBTLE}`, opacity: isDone ? 0.4 : 1, cursor: "pointer" }}
              onClick={() => setExpanded(isExpanded ? null : absIdx)}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: TEXT_PRIMARY, fontFamily: FONT }}>{isDone ? "✓ " : ""}{ex.name}</div>
                <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 2, letterSpacing: "0.05em", fontFamily: FONT }}>
                  {EXERCISES.find(e => e.id === ex.exerciseId)?.subTarget ?? ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
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
                <div style={{ fontSize: 11, color: TEXT_MUTED, background: SURFACE_2, padding: "4px 10px", borderRadius: 6, fontFamily: FONT }}>
                  {ex.sets.length} sets
                </div>
                <button
                  style={{
                    ...addBtn,
                    color: isDone ? "#22c55e" : startedExercises.has(absIdx) ? "#eab308" : "#555",
                    borderColor: isDone ? "#22c55e" : startedExercises.has(absIdx) ? "#3a3210" : "#333",
                    borderStyle: "solid",
                  }}
                  onClick={e => { e.stopPropagation(); handleComplete(absIdx); }}
                >
                  {isDone ? "COMPLETE" : startedExercises.has(absIdx) ? "IN PROGRESS" : "START"}
                </button>
                {/* Remove exercise */}
                <button
                  style={{ background: "none", border: "none", color: TEXT_DIM, cursor: "pointer", fontSize: 16, padding: "0 4px", fontFamily: FONT, lineHeight: 1 }}
                  onClick={e => { e.stopPropagation(); handleRemoveExercise(absIdx); }}
                  title="Remove exercise"
                >✕</button>
              </div>
            </div>

            {/* Expanded section */}
            {isExpanded && (
              <div style={{ padding: "8px 0 12px", borderBottom: `1px solid ${BORDER_SUBTLE}` }}>

                {/* Swap */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: TEXT_DIM, fontFamily: FONT, letterSpacing: "0.1em", marginBottom: 4, textTransform: "uppercase" }}>Swap for today</div>
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
                      <div style={{ width: 18, color: TEXT_DIM, fontSize: 10, fontWeight: 700 }}>{setIdx + 1}</div>
                      <input type="number" value={set.reps}
                        style={{ background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 8px", color: TEXT_PRIMARY, fontFamily: FONT, fontSize: 13, fontWeight: 600, width: 52, textAlign: "center" }}
                        onChange={e => handleUpdateSet(absIdx, setIdx, "reps", parseInt(e.target.value) || 0)}
                        onBlur={e => trimLeadingZeros(absIdx, setIdx, "reps", e.target.value)}
                        onClick={e => e.stopPropagation()} />
                      <div style={{ fontSize: 10, color: "#555", width: 22 }}>reps</div>
                      <input type="number" value={set.weight}
                        style={{ background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 8px", color: TEXT_PRIMARY, fontFamily: FONT, fontSize: 13, fontWeight: 600, width: 52, textAlign: "center" }}
                        onChange={e => handleUpdateSet(absIdx, setIdx, "weight", parseInt(e.target.value) || 0)}
                        onBlur={e => trimLeadingZeros(absIdx, setIdx, "weight", e.target.value)}
                        onClick={e => e.stopPropagation()} />
                      <div style={{ fontSize: 10, color: "#555", width: 20 }}>{set.weight ? "lbs" : "bw"}</div>

                      <button
                        style={{ padding: "4px 12px", fontSize: 10, fontWeight: 700, fontFamily: FONT, letterSpacing: "0.08em", background: isThisSetRunning ? "rgba(234,179,8,0.15)" : "#111", border: isThisSetRunning ? "1px solid #3a3210" : "1px solid #222", borderRadius: 3, color: isThisSetRunning ? "#eab308" : "#444", cursor: "pointer" }}
                        onClick={e => { e.stopPropagation(); isThisSetRunning ? stopSetTimer(absIdx, ex.sets.length) : startSetTimer(absIdx, setIdx); }}
                      >
                        {isThisSetRunning ? "DONE" : "START"}
                      </button>

                      {ex.sets.length > 1 && (
                        <button style={{ background: "none", border: "none", color: TEXT_DIM, cursor: "pointer", fontSize: 14, padding: "0 4px", fontFamily: FONT, lineHeight: 1 }}
                          onClick={e => { e.stopPropagation(); handleRemoveSet(absIdx, setIdx); }}>✕</button>
                      )}
                    </div>
                  );
                })}

                <button style={{ ...addBtn, marginTop: 8 }} onClick={e => { e.stopPropagation(); handleAddSet(absIdx); }}>+ ADD SET</button>

                {/* ── Per-exercise rest timer (collapsed when global banner is visible) ── */}
                {!globalRestActive && !globalRestDone && (
                  <div style={{ marginTop: 12, padding: "10px 12px", background: SURFACE, border: `1px solid ${BORDER_SUBTLE}`, borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 10, color: TEXT_DIM, fontFamily: FONT, letterSpacing: "0.1em", textTransform: "uppercase" }}>Rest Timer</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                      <button style={{ ...addBtn, padding: "6px 12px" }} onClick={() => startRest(absIdx)}>
                        ▶ REST {fmt(restPreset)}
                      </button>
                      <div style={{ display: "flex", gap: 4, alignItems: "center", marginLeft: "auto" }}>
                        <button style={{ ...addBtn, padding: "4px 8px", fontSize: 11 }} onClick={() => adjustRestPreset(absIdx, -15)}>−15s</button>
                        <div style={{ fontSize: 11, color: TEXT_DIM, fontFamily: FONT, width: 36, textAlign: "center" }}>{fmt(restPreset)}</div>
                        <button style={{ ...addBtn, padding: "4px 8px", fontSize: 11 }} onClick={() => adjustRestPreset(absIdx, 15)}>+15s</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ── Add Exercise ── */}
      <div style={{ marginTop: 16 }}>
        {!showAddExercise ? (
          <button
            style={{ ...addBtn, width: "100%" }}
            onClick={() => { setShowAddExercise(true); unlockAudio(); }}
          >
            + ADD EXERCISE
          </button>
        ) : (
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: TEXT_DIM, fontFamily: FONT }}>Add Exercise</div>
              <button onClick={() => { setShowAddExercise(false); setAddExFilter(""); }} style={{ background: "none", border: "none", color: TEXT_DIM, cursor: "pointer", fontSize: 16, fontFamily: FONT }}>✕</button>
            </div>
            <input
              type="text"
              placeholder="Search by name or muscle..."
              value={addExFilter}
              onChange={e => setAddExFilter(e.target.value)}
              autoFocus
              style={{ width: "100%", background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 10px", color: TEXT_PRIMARY, fontFamily: FONT, fontSize: 12, boxSizing: "border-box", marginBottom: 8 }}
            />
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {filteredExercises.map(e => (
                <button
                  key={e.id}
                  onClick={() => handleAddExercise(e.id)}
                  style={{ width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: `1px solid ${BORDER_SUBTLE}`, padding: "9px 4px", color: TEXT_PRIMARY, fontFamily: FONT, fontSize: 12, cursor: "pointer" }}
                >
                  <span style={{ fontWeight: 600 }}>{e.name}</span>
                  <span style={{ color: TEXT_DIM, fontSize: 10, marginLeft: 8 }}>{e.bodyPart}</span>
                </button>
              ))}
              {filteredExercises.length === 0 && (
                <div style={{ fontSize: 12, color: TEXT_DIM, fontFamily: FONT, padding: "8px 4px" }}>No matches</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div style={{ ...card, marginTop: 24 }}>
        <div style={label}>Session Summary</div>
        <div style={{ display: "flex", gap: 20, marginTop: 8, fontFamily: FONT }}>
          <div><span style={{ color: TEXT_PRIMARY, fontWeight: 700 }}>{summary.exerciseCount}</span>{" "}<span style={{ color: TEXT_DIM, fontSize: 11 }}>exercises</span></div>
          <div><span style={{ color: TEXT_PRIMARY, fontWeight: 700 }}>{summary.totalSets}</span>{" "}<span style={{ color: TEXT_DIM, fontSize: 11 }}>sets</span></div>
          <div><span style={{ color: TEXT_PRIMARY, fontWeight: 700 }}>{summary.totalVolume.toLocaleString()}</span>{" "}<span style={{ color: TEXT_DIM, fontSize: 11 }}>lbs vol</span></div>
          <div><span style={{ color: TEXT_PRIMARY, fontWeight: 700 }}>{fmt(sessionElapsed)}</span>{" "}<span style={{ color: TEXT_DIM, fontSize: 11 }}>total</span></div>
        </div>
      </div>

      {/* Complete / Flub */}
      <button style={{ width: "100%", padding: 16, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, color: "#22c55e", fontSize: 13, fontWeight: 700, fontFamily: FONT, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", marginTop: 20 }}
        onClick={handleCompleteSession}>✓ COMPLETE SESSION</button>
      <button style={{ width: "100%", padding: 12, background: "transparent", border: `1px solid ${BORDER_SUBTLE}`, borderRadius: 8, color: TEXT_DIM, fontSize: 11, fontWeight: 600, fontFamily: FONT, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", marginTop: 8, marginBottom: 40 }}
        onClick={handleFlubSession}>FLUB — I PHONED IT IN</button>
    </div>
  );
}
