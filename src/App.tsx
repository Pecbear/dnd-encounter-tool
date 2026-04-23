import { useState } from "react";
import DashboardScreen from "./screens/DashboardScreen";
import EncounterSetupScreen from "./screens/EncounterSetupScreen";
import LiveEncounterScreen from "./screens/LiveEncounterScreen";
import type { EncounterPreviewUnit } from "./types/encounter";

function App() {
  const [currentScreen, setCurrentScreen] = useState<
    "dashboard" | "encounter-setup" | "live-encounter"
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
    />
  );
}

export default App;
