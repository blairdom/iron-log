import type { SessionRecord, AdherenceRecord, CardioSession } from "../engine/types";
import type { DayTemplate } from "../data/program";

const API = "/api/data";

export interface RemoteData {
  sessions: SessionRecord[];
  cardio_sessions: CardioSession[];
  program: DayTemplate[] | null;
  adherence_records: AdherenceRecord[];
}

// Pull all data from the server on startup
export async function fetchRemoteData(): Promise<RemoteData | null> {
  try {
    const res = await fetch(API);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      sessions:          Array.isArray(data.sessions)          ? data.sessions          : [],
      cardio_sessions:   Array.isArray(data.cardio_sessions)   ? data.cardio_sessions   : [],
      program:           data.program ?? null,
      adherence_records: Array.isArray(data.adherence_records) ? data.adherence_records : [],
    };
  } catch {
    return null;
  }
}

// Push a partial update to the server (fire and forget)
export function pushSessions(sessions: SessionRecord[]) {
  fetch(API, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessions }),
  }).catch(() => {/* offline — localStorage still has it */});
}

export function pushCardioSessions(cardioSessions: CardioSession[]) {
  fetch(API, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardio_sessions: cardioSessions }),
  }).catch(() => {});
}

export function pushProgram(program: DayTemplate[]) {
  fetch(API, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program }),
  }).catch(() => {});
}

export function pushAdherence(adherenceRecords: AdherenceRecord[]) {
  fetch(API, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adherence_records: adherenceRecords }),
  }).catch(() => {});
}
