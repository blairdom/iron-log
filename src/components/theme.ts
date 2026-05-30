import type { ThreatState } from "../engine/types";

export const FONT = `'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'Consolas', monospace`;

export const THREAT_COLORS: Record<ThreatState, { bg: string; accent: string; glow: string; border: string }> = {
  green:  { bg: "#0a1f0a", accent: "#22c55e", glow: "rgba(34,197,94,0.15)",   border: "#1a3a1a" },
  yellow: { bg: "#1f1a0a", accent: "#eab308", glow: "rgba(234,179,8,0.15)",   border: "#3a3210" },
  orange: { bg: "#1f130a", accent: "#f97316", glow: "rgba(249,115,22,0.15)",  border: "#3a2210" },
  red:    { bg: "#1f0a0a", accent: "#ef4444", glow: "rgba(239,68,68,0.15)",   border: "#3a1010" },
  blue:   { bg: "#0a0f1f", accent: "#3b82f6", glow: "rgba(59,130,246,0.15)", border: "#102040" },
};

export const BASE_BG = "#0c0c0c";
export const CARD_BG = "#141414";
export const BORDER = "#222";
export const BORDER_SUBTLE = "#1a1a1a";

export function screen(threat: ThreatState | null): React.CSSProperties {
  return {
    padding: "20px",
    background: threat
      ? `linear-gradient(180deg, ${THREAT_COLORS[threat].bg} 0%, ${BASE_BG} 60%)`
      : BASE_BG,
    minHeight: "calc(100vh - 90px)",
    fontFamily: FONT,
  };
}

export const card: React.CSSProperties = {
  background: CARD_BG,
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  padding: 16,
  marginTop: 16,
};

export const label: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
  color: "#666",
  marginTop: 6,
};

export const sectionHeader: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
  color: "#555",
  padding: "20px 0 8px",
  borderBottom: `1px solid ${BORDER_SUBTLE}`,
  marginBottom: 8,
};

export const dropdown: React.CSSProperties = {
  background: "#111",
  border: "1px solid #333",
  borderRadius: 4,
  padding: "8px 32px 8px 12px",
  color: "#e0e0e0",
  fontFamily: FONT,
  fontSize: 12,
  width: "100%",
  cursor: "pointer",
  appearance: "none" as any,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23555' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
};

export const addBtn: React.CSSProperties = {
  fontSize: 10,
  color: "#555",
  background: "#111",
  border: "1px dashed #333",
  borderRadius: 4,
  padding: "8px 14px",
  cursor: "pointer",
  fontFamily: FONT,
  letterSpacing: "0.1em",
  fontWeight: 600,
};

// React import for CSSProperties reference
import type React from "react";
