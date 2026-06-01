import { useState, useEffect } from "react";
import { AppProvider, useApp } from "./store/AppStore";
import Dashboard from "./views/Dashboard";
import SessionView from "./views/SessionView";
import CardioView from "./views/CardioView";
import ProgramEditor from "./views/ProgramEditor";
import CalendarView from "./views/CalendarView";
import GoalsView from "./views/GoalsView";
import WeeklyReviewCard from "./components/WeeklyReviewCard";
import { FONT, THREAT_COLORS } from "./components/theme";
import { useLayout } from "./components/useLayout";
import type { ThreatState } from "./engine/types";

type View = "dashboard" | "session" | "cardio" | "program" | "calendar" | "goals";

const NAV_TABS: { key: View; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "session",   label: "Session"   },
  { key: "cardio",    label: "Cardio"    },
  { key: "program",   label: "Program"   },
  { key: "calendar",  label: "Calendar"  },
  { key: "goals",     label: "Goals"     },
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

  // Show weekly review card on Monday if not yet dismissed this week
  useEffect(() => {
    const today = new Date();
    if (today.getDay() !== 1) return; // only Monday
    const key = `${REVIEW_KEY}_${today.toISOString().split("T")[0]}`;
    if (!localStorage.getItem(key)) {
      setShowReview(true);
    }
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

  function handleLogCardio() {
    dispatch({ type: "START_CARDIO_SESSION" });
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

  // ── MOBILE layout ────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ fontFamily: FONT, maxWidth: 540, margin: "0 auto", minHeight: "100vh", background: "#0c0c0c", color: "#e0e0e0", fontSize: 13 }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 8px", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: FONT }}>
            <span style={{ color: "#fff" }}>IRON</span><span style={{ color: "#555" }}> LOG</span>
          </div>
          <ThreatDots threatState={threatState} />
        </div>
        {/* Horizontal nav */}
        <nav style={{ display: "flex", background: "#111", borderBottom: "1px solid #1a1a1a", overflowX: "auto" as const }}>
          {NAV_TABS.map(tab => (
            <button key={tab.key} onClick={() => setView(tab.key)} style={{
              padding: "12px 12px",
              fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
              color: view === tab.key ? "#e0e0e0" : "#555",
              background: view === tab.key ? "#1a1a1a" : "transparent",
              border: "none",
              borderBottom: view === tab.key ? "2px solid #e0e0e0" : "2px solid transparent",
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

  // ── DESKTOP layout ───────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0c0c0c", color: "#e0e0e0", fontFamily: FONT }}>

      {/* Sidebar */}
      <aside style={{
        width: 220,
        minWidth: 220,
        borderRight: "1px solid #1a1a1a",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        position: "sticky",
        top: 0,
        height: "100vh",
        background: "#0c0c0c",
      }}>
        {/* Logo */}
        <div style={{ padding: "0 24px 32px", fontSize: 18, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          <span style={{ color: "#fff" }}>IRON</span><span style={{ color: "#555" }}> LOG</span>
        </div>

        {/* Threat indicator */}
        <div style={{
          margin: "0 16px 24px",
          padding: "10px 14px",
          borderRadius: 6,
          background: tc.glow,
          border: `1px solid ${tc.border}`,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: tc.accent,
        }}>
          {threatState === "green"  ? "ON TRACK"           :
           threatState === "yellow" ? "MOMENTUM SLIPPING"  :
           threatState === "orange" ? "CONSISTENCY AT RISK":
           threatState === "red"    ? "CRITICAL DRIFT"     : "RECOVERY MODE"}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "0 12px" }}>
          {NAV_TABS.map(tab => (
            <button key={tab.key} onClick={() => setView(tab.key)} style={{
              padding: "10px 14px",
              fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
              color: view === tab.key ? "#e0e0e0" : "#555",
              background: view === tab.key ? "#1a1a1a" : "transparent",
              border: "none",
              borderLeft: view === tab.key ? `2px solid ${tc.accent}` : "2px solid transparent",
              borderRadius: 4,
              cursor: "pointer", fontFamily: FONT, textAlign: "left", transition: "all 0.15s",
            }}>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Threat dots at bottom */}
        <div style={{ padding: "16px 24px 0", display: "flex", gap: 6 }}>
          <ThreatDots threatState={threatState} />
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{
          borderBottom: "1px solid #1a1a1a",
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "#0c0c0c",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#555" }}>
            {NAV_TABS.find(t => t.key === view)?.label}
          </div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: "#444", fontFamily: FONT }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {/* Content — constrained width, centered */}
        <div style={{ maxWidth: 720, width: "100%", margin: "0 auto", padding: "0 32px", flex: 1 }}>
          {activeView}
        </div>
      </main>
    </div>
  );
}

function ThreatDots({ threatState }: { threatState: ThreatState }) {
  return (
    <>
      {(Object.keys(THREAT_COLORS) as ThreatState[]).map(c => (
        <div key={c} title={c} style={{
          width: 14, height: 14, borderRadius: 3,
          background: THREAT_COLORS[c].accent,
          border: threatState === c ? "2px solid #fff" : "1px solid #333",
          opacity: threatState === c ? 1 : 0.3,
        }} />
      ))}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
