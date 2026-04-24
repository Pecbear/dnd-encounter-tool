import { useState } from "react";
import DashboardScreen from "./screens/DashboardScreen";
import EncounterSetupScreen from "./screens/EncounterSetupScreen";
import LiveEncounterScreen from "./screens/LiveEncounterScreen";
import type { EncounterPreviewUnit } from "./types/encounter";
import PlayersScreen from "./screens/PlayersScreen";
import EnemiesScreen from "./screens/EnemiesScreen";

function App() {
  const [currentScreen, setCurrentScreen] = useState<
    "dashboard" | "encounter-setup" | "live-encounter" | "players" | "enemies"
  >("dashboard");

  const [activeEncounterUnits, setActiveEncounterUnits] = useState<
    EncounterPreviewUnit[]
  >([]);

  if (currentScreen === "live-encounter") {
    return (
      <LiveEncounterScreen
        units={activeEncounterUnits}
        onBackToSetup={() => setCurrentScreen("encounter-setup")}
      />
    );
  }

  if (currentScreen === "players") {
    return <PlayersScreen onBack={() => setCurrentScreen("dashboard")} />;
  }

  if (currentScreen === "enemies") {
    return <EnemiesScreen onBack={() => setCurrentScreen("dashboard")} />;
  }

  if (currentScreen === "encounter-setup") {
    return (
      <EncounterSetupScreen
        onBack={() => setCurrentScreen("dashboard")}
        onBeginEncounter={(units) => {
          setActiveEncounterUnits(units);
          setCurrentScreen("live-encounter");
        }}
      />
    );
  }

  return (
    <DashboardScreen
      onStartEncounter={() => setCurrentScreen("encounter-setup")}
      onResumeEncounter={() => setCurrentScreen("live-encounter")}
      onOpenPlayers={() => setCurrentScreen("players")}
      onOpenEnemies={() => setCurrentScreen("enemies")}
    />
  );
}

export default App;
