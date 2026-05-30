import { useState } from "react";
import { AppProvider, useApp } from "./store/AppStore";
import Dashboard from "./views/Dashboard";
import SessionView from "./views/SessionView";
import ProgramEditor from "./views/ProgramEditor";
import CalendarView from "./views/CalendarView";
import { FONT, THREAT_COLORS } from "./components/theme";
import type { ThreatState } from "./engine/types";

type View = "dashboard" | "session" | "program" | "calendar";

function AppShell() {
  const { state } = useApp();
  const [view, setView] = useState<View>("dashboard");
  const { behavioral } = state;
  const threatState = behavioral.threatState;

  function handleStartSession() {
    const { program, todayKey } = state;
    const day = program.find(d => d.key === todayKey);
    if (!day?.scheduled) return;
    // Dispatch start then navigate
    setView("session");
  }

  function handleSessionComplete() {
    setView("dashboard");
  }

  const tc = THREAT_COLORS[threatState];

  return (
    <div style={{
      fontFamily: FONT,
      maxWidth: 540,
      margin: "0 auto",
      minHeight: "100vh",
      background: "#0c0c0c",
      color: "#e0e0e0",
      fontSize: 13,
      letterSpacing: "0.02em",
      position: "relative",
    }}>
      {/* Top Bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 20px 8px",
        borderBottom: "1px solid #1a1a1a",
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: FONT }}>
          <span style={{ color: "#fff" }}>IRON</span>
          <span style={{ color: "#555" }}> LOG</span>
        </div>
        {/* Threat state dots — prototype only */}
        <div style={{ display: "flex", gap: 6 }}>
          {(Object.keys(THREAT_COLORS) as ThreatState[]).map(c => (
            <div
              key={c}
              title={c}
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: THREAT_COLORS[c].accent,
                border: threatState === c ? "2px solid #fff" : "1px solid #333",
                opacity: threatState === c ? 1 : 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", background: "#111", borderBottom: "1px solid #1a1a1a", overflowX: "auto" }}>
        {([
          { key: "dashboard", label: "Dashboard" },
          { key: "session", label: "Session" },
          { key: "program", label: "Program" },
          { key: "calendar", label: "Calendar" },
        ] as { key: View; label: string }[]).map(tab => (
          <button
            key={tab.key}
            style={{
              padding: "12px 14px",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: view === tab.key ? "#e0e0e0" : "#555",
              background: view === tab.key ? "#1a1a1a" : "transparent",
              border: "none",
              borderBottom: view === tab.key ? "2px solid #e0e0e0" : "2px solid transparent",
              cursor: "pointer",
              fontFamily: FONT,
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
            onClick={() => setView(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Views */}
      {view === "dashboard" && (
        <Dashboard onStartSession={() => {
          const { dispatch, state: s } = useAppFromShell();
          dispatch({ type: "START_SESSION", dayKey: s.todayKey });
          setView("session");
        }} />
      )}
      {view === "session" && (
        <SessionView
          onComplete={handleSessionComplete}
          onBack={() => setView("dashboard")}
        />
      )}
      {view === "program" && <ProgramEditor />}
      {view === "calendar" && <CalendarView />}
    </div>
  );
}

// Workaround to pass dispatch from within component tree
function useAppFromShell() {
  return useApp();
}

// Fix: Dashboard's onStartSession needs dispatch — pass it through
function AppShellFixed() {
  const { state, dispatch } = useApp();
  const [view, setView] = useState<View>("dashboard");
  const { behavioral } = state;
  const threatState = behavioral.threatState;

  function handleStartSession() {
    dispatch({ type: "START_SESSION", dayKey: state.todayKey });
    setView("session");
  }

  const tc = THREAT_COLORS[threatState];

  return (
    <div style={{
      fontFamily: FONT,
      maxWidth: 540,
      margin: "0 auto",
      minHeight: "100vh",
      background: "#0c0c0c",
      color: "#e0e0e0",
      fontSize: 13,
      letterSpacing: "0.02em",
    }}>
      {/* Top Bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 20px 8px",
        borderBottom: "1px solid #1a1a1a",
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: FONT }}>
          <span style={{ color: "#fff" }}>IRON</span>
          <span style={{ color: "#555" }}> LOG</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(Object.keys(THREAT_COLORS) as ThreatState[]).map(c => (
            <div
              key={c}
              title={c}
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: THREAT_COLORS[c].accent,
                border: threatState === c ? "2px solid #fff" : "1px solid #333",
                opacity: threatState === c ? 1 : 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", background: "#111", borderBottom: "1px solid #1a1a1a", overflowX: "auto" as const }}>
        {([
          { key: "dashboard" as View, label: "Dashboard" },
          { key: "session" as View, label: "Session" },
          { key: "program" as View, label: "Program" },
          { key: "calendar" as View, label: "Calendar" },
        ]).map(tab => (
          <button
            key={tab.key}
            style={{
              padding: "12px 14px",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: view === tab.key ? "#e0e0e0" : "#555",
              background: view === tab.key ? "#1a1a1a" : "transparent",
              border: "none",
              borderBottom: view === tab.key ? "2px solid #e0e0e0" : "2px solid transparent",
              cursor: "pointer",
              fontFamily: FONT,
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
            onClick={() => setView(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {view === "dashboard" && <Dashboard onStartSession={handleStartSession} />}
      {view === "session" && <SessionView onComplete={() => setView("dashboard")} onBack={() => setView("dashboard")} />}
      {view === "program" && <ProgramEditor />}
      {view === "calendar" && <CalendarView />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShellFixed />
    </AppProvider>
  );
}
