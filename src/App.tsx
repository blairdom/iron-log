import { useState } from "react";
import { AppProvider, useApp } from "./store/AppStore";
import Dashboard from "./views/Dashboard";
import SessionView from "./views/SessionView";
import CardioView from "./views/CardioView";
import ProgramEditor from "./views/ProgramEditor";
import CalendarView from "./views/CalendarView";
import { FONT, THREAT_COLORS } from "./components/theme";
import type { ThreatState } from "./engine/types";

type View = "dashboard" | "session" | "cardio" | "program" | "calendar";

function AppShell() {
  const { state, dispatch } = useApp();
  const [view, setView] = useState<View>("dashboard");
  const { behavioral } = state;
  const threatState = behavioral.threatState;

  function handleStartSession() {
    dispatch({ type: "START_SESSION", dayKey: state.todayKey });
    setView("session");
  }

  function handleLogCardio() {
    dispatch({ type: "START_CARDIO_SESSION" });
    setView("cardio");
  }

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
                width: 14, height: 14,
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
          { key: "cardio" as View, label: "Cardio" },
          { key: "program" as View, label: "Program" },
          { key: "calendar" as View, label: "Calendar" },
        ]).map(tab => (
          <button
            key={tab.key}
            style={{
              padding: "12px 12px",
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
        <Dashboard
          onStartSession={handleStartSession}
          onLogCardio={handleLogCardio}
        />
      )}
      {view === "session" && (
        <SessionView
          onComplete={() => setView("dashboard")}
          onBack={() => setView("dashboard")}
        />
      )}
      {view === "cardio" && (
        <CardioView
          onComplete={() => setView("dashboard")}
          onBack={() => setView("dashboard")}
        />
      )}
      {view === "program" && <ProgramEditor />}
      {view === "calendar" && <CalendarView />}
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
