import { useState, useEffect } from "react";
import { AppProvider, useApp } from "./store/AppStore";
import Dashboard from "./views/Dashboard";
import SessionView from "./views/SessionView";
import CardioView from "./views/CardioView";
import ProgramEditor from "./views/ProgramEditor";
import CalendarView from "./views/CalendarView";
import GoalsView from "./views/GoalsView";
import WeeklyReviewCard from "./components/WeeklyReviewCard";
import { FONT, THREAT_COLORS, BASE_BG, SURFACE, SURFACE_2, BORDER, BORDER_SUBTLE, TEXT_PRIMARY, TEXT_MUTED, TEXT_DIM } from "./components/theme";
import { useLayout } from "./components/useLayout";
import type { ThreatState } from "./engine/types";

type View = "dashboard" | "session" | "cardio" | "program" | "calendar" | "goals";
type CardioSlot = "am" | "pm";

const NAV_TABS: { key: View; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "⬡" },
  { key: "session",   label: "Session",   icon: "◈" },
  { key: "cardio",    label: "Cardio",    icon: "◎" },
  { key: "program",   label: "Program",   icon: "▤" },
  { key: "calendar",  label: "Calendar",  icon: "▦" },
  { key: "goals",     label: "Goals",     icon: "◇" },
];

const REVIEW_KEY = "ironlog_weekly_review_seen";

function AppShell() {
  const { state, dispatch } = useApp();
  const [view, setView] = useState<View>("dashboard");
  const [showReview, setShowReview] = useState(false);
  const { isMobile } = useLayout();
  const { behavioral } = state;
  const threatState = behavioral.threatState;
  const tc = THREAT_COLORS[threatState];

  useEffect(() => {
    const today = new Date();
    if (today.getDay() !== 1) return;
    const key = `${REVIEW_KEY}_${today.toISOString().split("T")[0]}`;
    if (!localStorage.getItem(key)) setShowReview(true);
  }, []);

  function dismissReview() {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`${REVIEW_KEY}_${today}`, "1");
    setShowReview(false);
  }

  function handleStartSession() {
    dispatch({ type: "START_SESSION", dayKey: state.todayKey });
    setView("session");
  }

  function handleLogCardio(slot: CardioSlot) {
    dispatch({ type: "START_CARDIO_SESSION", slot });
    setView("cardio");
  }

  function handleCardioTab() {
    const { cardioBehavioral } = state;
    const slot: CardioSlot = cardioBehavioral.todayAmStatus !== "complete" ? "am" : "pm";
    dispatch({ type: "START_CARDIO_SESSION", slot });
    setView("cardio");
  }

  const activeView = (
    <>
      {view === "dashboard" && <Dashboard onStartSession={handleStartSession} onLogCardio={handleLogCardio} />}
      {view === "session"   && <SessionView onComplete={() => setView("dashboard")} onBack={() => setView("dashboard")} />}
      {view === "cardio"    && <CardioView  onComplete={() => setView("dashboard")} onBack={() => setView("dashboard")} />}
      {view === "program"   && <ProgramEditor />}
      {view === "calendar"  && <CalendarView />}
      {view === "goals"     && <GoalsView />}
      {showReview && <WeeklyReviewCard onDismiss={dismissReview} />}
    </>
  );

  // ── MOBILE ───────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ fontFamily: FONT, maxWidth: 540, margin: "0 auto", minHeight: "100vh", background: BASE_BG, color: TEXT_PRIMARY, fontSize: 13 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 12px", borderBottom: `1px solid ${BORDER_SUBTLE}`, background: SURFACE }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: FONT }}>
            <span style={{ color: TEXT_PRIMARY }}>IRON</span>
            <span style={{ color: TEXT_DIM }}> LOG</span>
          </div>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: tc.accent,
            background: tc.bg,
            border: `1px solid ${tc.border}`,
            boxShadow: `0 0 12px ${tc.glow}`,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: tc.accent, display: "inline-block", boxShadow: `0 0 6px ${tc.accent}` }} />
            {threatState === "green" ? "ON TRACK" : threatState === "yellow" ? "SLIPPING" : threatState === "orange" ? "AT RISK" : threatState === "red" ? "CRITICAL" : "RECOVERY"}
          </div>
        </div>
        <nav style={{ display: "flex", background: SURFACE, borderBottom: `1px solid ${BORDER_SUBTLE}`, overflowX: "auto" as const }}>
          {NAV_TABS.map(tab => (
            <button key={tab.key}
              onClick={() => tab.key === "cardio" ? handleCardioTab() : setView(tab.key)}
              style={{
                padding: "11px 12px",
                fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                color: view === tab.key ? TEXT_PRIMARY : TEXT_DIM,
                background: "transparent",
                border: "none",
                borderBottom: view === tab.key ? `2px solid ${tc.accent}` : "2px solid transparent",
                cursor: "pointer", fontFamily: FONT, whiteSpace: "nowrap", transition: "all 0.15s",
              }}>
              {tab.label}
            </button>
          ))}
        </nav>
        {activeView}
      </div>
    );
  }

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: BASE_BG, color: TEXT_PRIMARY, fontFamily: FONT }}>

      {/* Sidebar */}
      <aside style={{
        width: 220,
        minWidth: 220,
        borderRight: `1px solid ${BORDER_SUBTLE}`,
        display: "flex",
        flexDirection: "column",
        padding: "0",
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        background: SURFACE,
        zIndex: 20,
      }}>
        {/* Logo */}
        <div style={{ padding: "22px 24px 20px", borderBottom: `1px solid ${BORDER_SUBTLE}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Icon mark */}
            <div style={{
              width: 30, height: 30,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${tc.accent} 0%, rgba(59,130,246,0.6) 100%)`,
              boxShadow: `0 0 16px ${tc.glow}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: "-0.05em",
            }}>I</div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              <span style={{ color: TEXT_PRIMARY }}>IRON</span>
              <span style={{ color: TEXT_DIM }}> LOG</span>
            </div>
          </div>
        </div>

        {/* Threat pill */}
        <div style={{ padding: "14px 16px" }}>
          <div style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: tc.bg,
            border: `1px solid ${tc.border}`,
            boxShadow: `0 0 20px ${tc.glow}`,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: tc.accent, boxShadow: `0 0 8px ${tc.accent}`, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: tc.accent }}>
                {threatState === "green"  ? "ON TRACK"
                : threatState === "yellow" ? "MOMENTUM SLIPPING"
                : threatState === "orange" ? "CONSISTENCY AT RISK"
                : threatState === "red"    ? "CRITICAL DRIFT"
                : "RECOVERY MODE"}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "4px 10px" }}>
          {NAV_TABS.map(tab => {
            const active = view === tab.key;
            return (
              <button key={tab.key}
                onClick={() => tab.key === "cardio" ? handleCardioTab() : setView(tab.key)}
                style={{
                  padding: "10px 14px",
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                  color: active ? TEXT_PRIMARY : TEXT_MUTED,
                  background: active ? SURFACE_2 : "transparent",
                  border: "none",
                  borderLeft: active ? `2px solid ${tc.accent}` : "2px solid transparent",
                  borderRadius: 8,
                  cursor: "pointer", fontFamily: FONT, textAlign: "left",
                  transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                <span style={{ color: active ? tc.accent : TEXT_DIM, fontSize: 13 }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Threat dots */}
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${BORDER_SUBTLE}`, display: "flex", gap: 6, alignItems: "center" }}>
          {(Object.keys(THREAT_COLORS) as ThreatState[]).map(c => (
            <div key={c} title={c} style={{
              width: 10, height: 10, borderRadius: 3,
              background: THREAT_COLORS[c].accent,
              border: threatState === c ? `2px solid ${TEXT_PRIMARY}` : `1px solid ${BORDER}`,
              opacity: threatState === c ? 1 : 0.25,
              boxShadow: threatState === c ? `0 0 8px ${THREAT_COLORS[c].accent}` : "none",
              transition: "all 0.2s",
            }} />
          ))}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, marginLeft: 220, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{
          borderBottom: `1px solid ${BORDER_SUBTLE}`,
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: SURFACE,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: TEXT_DIM }}>
            {NAV_TABS.find(t => t.key === view)?.label}
          </div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: TEXT_DIM, fontFamily: FONT }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 760, width: "100%", margin: "0 auto", padding: "0 32px", flex: 1 }}>
          {activeView}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
