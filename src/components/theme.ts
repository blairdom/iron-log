import type { ThreatState } from "../engine/types";
import type React from "react";

export const FONT = `'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'Consolas', monospace`;

// ── Threat palette (kept from original, boosted contrast) ────────────────────
export const THREAT_COLORS: Record<ThreatState, { bg: string; accent: string; glow: string; border: string }> = {
  green:  { bg: "rgba(34,197,94,0.08)",   accent: "#22c55e", glow: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.25)"  },
  yellow: { bg: "rgba(234,179,8,0.08)",   accent: "#eab308", glow: "rgba(234,179,8,0.12)",  border: "rgba(234,179,8,0.25)"  },
  orange: { bg: "rgba(249,115,22,0.08)",  accent: "#f97316", glow: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.25)" },
  red:    { bg: "rgba(239,68,68,0.08)",   accent: "#ef4444", glow: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.25)"  },
  blue:   { bg: "rgba(59,130,246,0.08)",  accent: "#3b82f6", glow: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)" },
};

// ── Base tokens ───────────────────────────────────────────────────────────────
export const BASE_BG      = "#0D1117";
export const SURFACE      = "#161B22";
export const SURFACE_2    = "#1C2128";
export const BORDER       = "#30363D";
export const BORDER_SUBTLE= "#21262D";
export const TEXT_PRIMARY = "#F0F6FC";
export const TEXT_MUTED   = "#8B949E";
export const TEXT_DIM     = "#484F58";

// Legacy aliases so existing imports don't break
export const CARD_BG = SURFACE;

// ── Shared style helpers ──────────────────────────────────────────────────────
export function screen(threat: ThreatState | null): React.CSSProperties {
  return {
    padding: "28px 24px",
    background: BASE_BG,
    minHeight: "calc(100vh - 57px)",
    fontFamily: FONT,
    position: "relative",
  };
}

export const card: React.CSSProperties = {
  background: SURFACE,
  border: `1px solid ${BORDER}`,
  borderRadius: 12,
  padding: 20,
  marginTop: 16,
};

export const label: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
  color: TEXT_MUTED,
  marginTop: 6,
};

export const sectionHeader: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
  color: TEXT_DIM,
  padding: "20px 0 8px",
  borderBottom: `1px solid ${BORDER_SUBTLE}`,
  marginBottom: 8,
};

export const dropdown: React.CSSProperties = {
  background: SURFACE_2,
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  padding: "8px 32px 8px 12px",
  color: TEXT_PRIMARY,
  fontFamily: FONT,
  fontSize: 12,
  width: "100%",
  cursor: "pointer",
  appearance: "none" as any,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%238B949E' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
};

export const addBtn: React.CSSProperties = {
  fontSize: 10,
  color: TEXT_MUTED,
  background: SURFACE,
  border: `1px dashed ${BORDER}`,
  borderRadius: 8,
  padding: "10px 14px",
  cursor: "pointer",
  fontFamily: FONT,
  letterSpacing: "0.1em",
  fontWeight: 600,
  width: "100%",
  transition: "border-color 0.15s, color 0.15s",
};
