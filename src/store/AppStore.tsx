import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { SessionRecord, AdherenceRecord, RecoveryModeRecord, PlannedAbsence, GoalRecord, BehavioralState, SetRecord, SalvageType, CardioSession, CardioBehavioralState } from "../engine/types";
import type { DayTemplate } from "../data/program";
import {
  loadSessions, saveSessions,
  loadAdherence, saveAdherence,
  loadRecoveryMode, saveRecoveryMode,
  loadProgram, saveProgram,
  loadCardioSessions, saveCardioSessions,
  loadGoals, saveGoals,
} from "./storage";
import {
  computeBehavioralState, toDateString, getTodayKey, adherenceValue, isScheduledDay,
  computeCardioBehavioralState, computeGoals,
} from "../engine/behavioral";
import { getExerciseById } from "../data/exercises";
import {
  fetchRemoteData, pushSessions, pushCardioSessions, pushProgram, pushAdherence,
} from "./sync";

interface AppState {
  sessions: SessionRecord[];
  adherenceRecords: AdherenceRecord[];
  recoveryMode: RecoveryModeRecord;
  absences: PlannedAbsence[];
  goals: GoalRecord[];
  program: DayTemplate[];
  activeSession: SessionRecord | null;
  behavioral: BehavioralState;
  cardioSessions: CardioSession[];
  cardioBehavioral: CardioBehavioralState;
  activeCardioSession: CardioSession | null;
  today: string;
  todayKey: string;
}

type Action =
  | { type: "START_SESSION"; dayKey: string }
  | { type: "COMPLETE_EXERCISE"; exerciseIdx: number }
  | { type: "MARK_SALVAGE"; salvageType: SalvageType }
  | { type: "ADD_SET"; exerciseIdx: number }
  | { type: "UPDATE_SET"; exerciseIdx: number; setIdx: number; field: keyof SetRecord; value: number | string }
  | { type: "REMOVE_SET"; exerciseIdx: number; setIdx: number }
  | { type: "SWAP_EXERCISE"; exerciseIdx: number; newExerciseId: string }
  | { type: "COMPLETE_SESSION" }
  | { type: "FLUB_SESSION" }
  | { type: "SKIP_SESSION"; dayKey: string }
  | { type: "ENTER_RECOVERY_MODE" }
  | { type: "EXIT_RECOVERY_MODE" }
  | { type: "UPDATE_PROGRAM"; program: DayTemplate[] }
  | { type: "UPDATE_SLOT_EXERCISE"; dayKey: string; sectionId: string; slotId: string; exerciseId: string }
  | { type: "ADD_SLOT"; dayKey: string; sectionId: string }
  | { type: "REMOVE_SLOT"; dayKey: string; sectionId: string; slotId: string }
  | { type: "ADD_SECTION"; dayKey: string }
  | { type: "REMOVE_SECTION"; dayKey: string; sectionId: string }
  | { type: "HYDRATE"; sessions: SessionRecord[]; cardioSessions: CardioSession[]; program: DayTemplate[]; adherenceRecords: AdherenceRecord[] }
  | { type: "START_CARDIO_SESSION" }
  | { type: "UPDATE_CARDIO_FIELD"; field: "duration" | "speed"; value: number }
  | { type: "COMPLETE_CARDIO_SESSION" }

const now = new Date();

function buildActiveSession(dayKey: string, program: DayTemplate[], sessions: SessionRecord[]): SessionRecord {
  const day = program.find(d => d.key === dayKey)!;
  const today = toDateString();

  const exercises: import("../engine/types").ExerciseRecord[] = [];
  for (const section of day.sections) {
    for (const slot of section.slots) {
      const ex = getExerciseById(slot.selectedExerciseId);
      if (!ex) continue;

      // Find last session with this exercise for autofill
      const lastSession = [...sessions]
        .filter(s => s.dayKey === dayKey)
        .sort((a, b) => b.date.localeCompare(a.date))
        .find(s => s.exercises.some(e => e.exerciseId === slot.selectedExerciseId));

      const lastExercise = lastSession?.exercises.find(e => e.exerciseId === slot.selectedExerciseId);
      const defaultSets: SetRecord[] = lastExercise?.sets.length
        ? lastExercise.sets.map(s => ({ ...s }))
        : [{ reps: 10, weight: 0, unit: "lbs" }];

      exercises.push({
        exerciseId: slot.selectedExerciseId,
        name: ex.name,
        isSessionSwap: false,
        swappedFromId: null,
        sets: defaultSets,
        completed: false,
      });
    }
  }

  return {
    id: `session-${today}-${dayKey}`,
    date: today,
    dayKey,
    dayType: day.name,
    status: "not_started",
    salvageType: null,
    exercises,
    summary: { exerciseCount: 0, totalSets: 0, totalVolume: 0 },
    startedAt: new Date().toISOString(),
    completedAt: null,
  };
}

function computeSummary(exercises: import("../engine/types").ExerciseRecord[]) {
  const completed = exercises.filter(e => e.completed);
  const totalSets = completed.reduce((a, e) => a + e.sets.length, 0);
  const totalVolume = completed.reduce((a, e) =>
    a + e.sets.reduce((b, s) => b + (s.unit !== "bw" ? s.reps * s.weight : 0), 0), 0);
  return { exerciseCount: completed.length, totalSets, totalVolume };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE": {
      const { sessions, cardioSessions, program, adherenceRecords } = action;
      // Persist to localStorage so offline works after hydration
      saveSessions(sessions);
      saveCardioSessions(cardioSessions);
      saveProgram(program);
      saveAdherence(adherenceRecords);
      const recoveryMode = state.recoveryMode;
      const behavioral = computeBehavioralState(sessions, adherenceRecords, recoveryMode, state.goals, state.today);
      const goals = computeGoals(state.goals, sessions, adherenceRecords, behavioral.streak, state.today);
      const cardioBehavioral = computeCardioBehavioralState(cardioSessions, state.today);
      return { ...state, sessions, cardioSessions, adherenceRecords, program, behavioral, goals, cardioBehavioral };
    }

    case "START_SESSION": {
      const active = buildActiveSession(action.dayKey, state.program, state.sessions);
      return { ...state, activeSession: { ...active, status: "not_started" } };
    }

    case "COMPLETE_EXERCISE": {
      if (!state.activeSession) return state;
      const exercises = state.activeSession.exercises.map((e, i) =>
        i === action.exerciseIdx ? { ...e, completed: true } : e
      );
      return {
        ...state,
        activeSession: {
          ...state.activeSession,
          exercises,
          summary: computeSummary(exercises),
        }
      };
    }

    case "MARK_SALVAGE": {
      if (!state.activeSession) return state;
      return {
        ...state,
        activeSession: { ...state.activeSession, salvageType: action.salvageType }
      };
    }

    case "ADD_SET": {
      if (!state.activeSession) return state;
      const exercises = state.activeSession.exercises.map((e, i) => {
        if (i !== action.exerciseIdx) return e;
        const last = e.sets[e.sets.length - 1] || { reps: 10, weight: 0, unit: "lbs" as const };
        return { ...e, sets: [...e.sets, { ...last }] };
      });
      return { ...state, activeSession: { ...state.activeSession, exercises } };
    }

    case "UPDATE_SET": {
      if (!state.activeSession) return state;
      const exercises = state.activeSession.exercises.map((e, i) => {
        if (i !== action.exerciseIdx) return e;
        const sets = e.sets.map((s, j) =>
          j === action.setIdx ? { ...s, [action.field]: action.value } : s
        );
        return { ...e, sets };
      });
      return { ...state, activeSession: { ...state.activeSession, exercises } };
    }

    case "REMOVE_SET": {
      if (!state.activeSession) return state;
      const exercises = state.activeSession.exercises.map((e, i) => {
        if (i !== action.exerciseIdx) return e;
        return { ...e, sets: e.sets.filter((_, j) => j !== action.setIdx) };
      });
      return { ...state, activeSession: { ...state.activeSession, exercises } };
    }

    case "SWAP_EXERCISE": {
      if (!state.activeSession) return state;
      const ex = getExerciseById(action.newExerciseId);
      if (!ex) return state;
      const exercises = state.activeSession.exercises.map((e, i) => {
        if (i !== action.exerciseIdx) return e;
        return {
          ...e,
          exerciseId: action.newExerciseId,
          name: ex.name,
          isSessionSwap: true,
          swappedFromId: e.exerciseId,
        };
      });
      return { ...state, activeSession: { ...state.activeSession, exercises } };
    }

    case "COMPLETE_SESSION": {
      if (!state.activeSession) return state;
      const session = state.activeSession;

      const finalSession: SessionRecord = {
        ...session,
        status: "complete",
        completedAt: new Date().toISOString(),
        summary: computeSummary(session.exercises),
      };

      const sessions = [
        ...state.sessions.filter(s => !(s.date === finalSession.date && s.dayKey === finalSession.dayKey)),
        finalSession,
      ];

      const adherenceRec: AdherenceRecord = {
        date: finalSession.date,
        scheduled: isScheduledDay(finalSession.dayKey),
        completed: true,
        partial: false,
        adherenceValue: 1.0,
        threatState: state.behavioral.threatState,
        recoveryMode: state.recoveryMode.active,
        plannedAbsence: false,
      };

      const adherenceRecords = [
        ...state.adherenceRecords.filter(r => !(r.date === adherenceRec.date && r.scheduled)),
        adherenceRec,
      ];

      // Update recovery mode consecutive count
      let recoveryMode = { ...state.recoveryMode };
      if (recoveryMode.active) {
        recoveryMode.consecutiveCompletedDuringRecovery += 1;
        if (recoveryMode.consecutiveCompletedDuringRecovery >= 3) {
          recoveryMode = {
            ...recoveryMode,
            active: false,
            exitDate: toDateString(),
            exitType: "auto",
          };
        }
      }

      const behavioral = computeBehavioralState(sessions, adherenceRecords, recoveryMode, state.goals, state.today);
      const goals = computeGoals(state.goals, sessions, adherenceRecords, behavioral.streak, state.today);

      saveSessions(sessions);
      saveAdherence(adherenceRecords);
      saveRecoveryMode(recoveryMode);
      saveGoals(goals);
      pushSessions(sessions);
      pushAdherence(adherenceRecords);

      return { ...state, sessions, adherenceRecords, recoveryMode, behavioral, goals, activeSession: null };
    }

    case "FLUB_SESSION": {
      if (!state.activeSession) return state;
      const session = state.activeSession;

      const finalSession: SessionRecord = {
        ...session,
        status: "partial",
        completedAt: new Date().toISOString(),
        summary: computeSummary(session.exercises),
      };

      const sessions = [
        ...state.sessions.filter(s => !(s.date === finalSession.date && s.dayKey === finalSession.dayKey)),
        finalSession,
      ];

      const adherenceRec: AdherenceRecord = {
        date: finalSession.date,
        scheduled: isScheduledDay(finalSession.dayKey),
        completed: true,
        partial: true,
        adherenceValue: 0.5,
        threatState: state.behavioral.threatState,
        recoveryMode: state.recoveryMode.active,
        plannedAbsence: false,
      };

      const adherenceRecords = [
        ...state.adherenceRecords.filter(r => !(r.date === adherenceRec.date && r.scheduled)),
        adherenceRec,
      ];

      let recoveryMode = { ...state.recoveryMode };
      if (recoveryMode.active) {
        recoveryMode.consecutiveCompletedDuringRecovery += 1;
        if (recoveryMode.consecutiveCompletedDuringRecovery >= 3) {
          recoveryMode = { ...recoveryMode, active: false, exitDate: toDateString(), exitType: "auto" };
        }
      }

      const behavioral = computeBehavioralState(sessions, adherenceRecords, recoveryMode, state.goals, state.today);
      const goals = computeGoals(state.goals, sessions, adherenceRecords, behavioral.streak, state.today);

      saveSessions(sessions);
      saveAdherence(adherenceRecords);
      saveRecoveryMode(recoveryMode);
      saveGoals(goals);
      pushSessions(sessions);
      pushAdherence(adherenceRecords);

      return { ...state, sessions, adherenceRecords, recoveryMode, behavioral, goals, activeSession: null };
    }

    case "SKIP_SESSION": {
      const today = toDateString();
      const day = state.program.find(d => d.key === action.dayKey);
      if (!day) return state;

      const session: SessionRecord = {
        id: `session-${today}-${action.dayKey}`,
        date: today,
        dayKey: action.dayKey,
        dayType: day.name,
        status: "skipped",
        salvageType: null,
        exercises: [],
        summary: { exerciseCount: 0, totalSets: 0, totalVolume: 0 },
        startedAt: null,
        completedAt: null,
      };

      const sessions = [
        ...state.sessions.filter(s => !(s.date === today && s.dayKey === action.dayKey)),
        session,
      ];

      const adherenceRec: AdherenceRecord = {
        date: today,
        scheduled: isScheduledDay(action.dayKey),
        completed: false,
        partial: false,
        adherenceValue: 0,
        threatState: state.behavioral.threatState,
        recoveryMode: state.recoveryMode.active,
        plannedAbsence: false,
      };

      const adherenceRecords = [
        ...state.adherenceRecords.filter(r => r.date !== today),
        adherenceRec,
      ];

      const behavioral = computeBehavioralState(sessions, adherenceRecords, state.recoveryMode, state.goals, state.today);
      saveSessions(sessions);
      saveAdherence(adherenceRecords);
      pushSessions(sessions);
      pushAdherence(adherenceRecords);

      return { ...state, sessions, adherenceRecords, behavioral };
    }

    case "ENTER_RECOVERY_MODE": {
      const recoveryMode: RecoveryModeRecord = {
        active: true,
        enteredDate: toDateString(),
        entryType: "manual",
        plannedEndDate: null,
        exitDate: null,
        exitType: null,
        consecutiveCompletedDuringRecovery: 0,
        daysInRecovery: 0,
      };
      const behavioral = computeBehavioralState(state.sessions, state.adherenceRecords, recoveryMode, state.goals, state.today);
      saveRecoveryMode(recoveryMode);
      return { ...state, recoveryMode, behavioral };
    }

    case "EXIT_RECOVERY_MODE": {
      const recoveryMode: RecoveryModeRecord = {
        ...state.recoveryMode,
        active: false,
        exitDate: toDateString(),
        exitType: "manual",
      };
      const behavioral = computeBehavioralState(state.sessions, state.adherenceRecords, recoveryMode, state.goals, state.today);
      saveRecoveryMode(recoveryMode);
      return { ...state, recoveryMode, behavioral };
    }

    case "UPDATE_PROGRAM": {
      saveProgram(action.program);
      return { ...state, program: action.program };
    }

    case "UPDATE_SLOT_EXERCISE": {
      const program = state.program.map(day => {
        if (day.key !== action.dayKey) return day;
        return {
          ...day,
          sections: day.sections.map(sec => {
            if (sec.id !== action.sectionId) return sec;
            return {
              ...sec,
              slots: sec.slots.map(slot => {
                if (slot.id !== action.slotId) return slot;
                return { ...slot, selectedExerciseId: action.exerciseId };
              }),
            };
          }),
        };
      });
      saveProgram(program);
      pushProgram(program);
      return { ...state, program };
    }

    case "ADD_SLOT": {
      const program = state.program.map(day => {
        if (day.key !== action.dayKey) return day;
        return {
          ...day,
          sections: day.sections.map(sec => {
            if (sec.id !== action.sectionId) return sec;
            const newSlot = {
              id: `${sec.id}-slot-${Date.now()}`,
              bodyPart: "Chest",
              subTarget: "New Slot",
              movementPattern: "Horizontal Push",
              selectedExerciseId: "ex-001",
            };
            return { ...sec, slots: [...sec.slots, newSlot] };
          }),
        };
      });
      saveProgram(program);
      pushProgram(program);
      return { ...state, program };
    }

    case "REMOVE_SLOT": {
      const program = state.program.map(day => {
        if (day.key !== action.dayKey) return day;
        return {
          ...day,
          sections: day.sections.map(sec => {
            if (sec.id !== action.sectionId) return sec;
            return { ...sec, slots: sec.slots.filter(s => s.id !== action.slotId) };
          }),
        };
      });
      saveProgram(program);
      pushProgram(program);
      return { ...state, program };
    }

    case "ADD_SECTION": {
      const program = state.program.map(day => {
        if (day.key !== action.dayKey) return day;
        const newSection = {
          id: `${day.key}-sec-${Date.now()}`,
          name: "New Section",
          slots: [],
        };
        return { ...day, sections: [...day.sections, newSection] };
      });
      saveProgram(program);
      pushProgram(program);
      return { ...state, program };
    }

    case "REMOVE_SECTION": {
      const program = state.program.map(day => {
        if (day.key !== action.dayKey) return day;
        return { ...day, sections: day.sections.filter(s => s.id !== action.sectionId) };
      });
      saveProgram(program);
      pushProgram(program);
      return { ...state, program };
    }

    case "START_CARDIO_SESSION": {
      const today = toDateString();
      const existing = state.cardioSessions.find(s => s.date === today);
      const activeCardioSession: CardioSession = existing ?? {
        id: `cardio-${today}`,
        date: today,
        duration: 20,
        speed: 3.5,
        status: "not_started",
        completedAt: null,
      };
      return { ...state, activeCardioSession };
    }

    case "UPDATE_CARDIO_FIELD": {
      if (!state.activeCardioSession) return state;
      return {
        ...state,
        activeCardioSession: { ...state.activeCardioSession, [action.field]: action.value },
      };
    }

    case "COMPLETE_CARDIO_SESSION": {
      if (!state.activeCardioSession) return state;
      const completed: CardioSession = {
        ...state.activeCardioSession,
        status: "complete",
        completedAt: new Date().toISOString(),
      };
      const cardioSessions = [
        ...state.cardioSessions.filter(s => s.date !== completed.date),
        completed,
      ];
      saveCardioSessions(cardioSessions);
      pushCardioSessions(cardioSessions);
      const cardioBehavioral = computeCardioBehavioralState(cardioSessions, state.today);
      return { ...state, cardioSessions, cardioBehavioral, activeCardioSession: null };
    }

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const today = toDateString();
  const todayKey = getTodayKey();

  const sessions = loadSessions();
  const adherenceRecords = loadAdherence();
  const recoveryMode = loadRecoveryMode();
  const program = loadProgram();
  const goalsInit = loadGoals();
  const behavioral = computeBehavioralState(sessions, adherenceRecords, recoveryMode, goalsInit, today);
  const goals = computeGoals(goalsInit, sessions, adherenceRecords, behavioral.streak, today);
  const cardioSessions = loadCardioSessions();
  const cardioBehavioral = computeCardioBehavioralState(cardioSessions, today);

  const [state, dispatch] = useReducer(reducer, {
    sessions,
    adherenceRecords,
    recoveryMode,
    absences: [],
    goals,
    program,
    activeSession: null,
    behavioral,
    cardioSessions,
    cardioBehavioral,
    activeCardioSession: null,
    today,
    todayKey,
  });

  // On mount: fetch from server and hydrate state (overrides localStorage)
  useEffect(() => {
    fetchRemoteData().then(remote => {
      if (!remote) return; // offline or no server — localStorage already loaded
      dispatch({
        type: "HYDRATE",
        sessions: remote.sessions.length > 0 ? remote.sessions : sessions,
        cardioSessions: remote.cardio_sessions.length > 0 ? remote.cardio_sessions : cardioSessions,
        program: remote.program ?? program,
        adherenceRecords: remote.adherence_records.length > 0 ? remote.adherence_records : adherenceRecords,
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp outside AppProvider");
  return ctx;
}
