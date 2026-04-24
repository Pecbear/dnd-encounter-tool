export type StoredEncounter = {
  sessionId: string;
  encounterUnits: any[]; // we’ll tighten this later
  currentTurnIndex: number;
  round: number;
  selectedTargetId: string;
  lastAction: string;
};

export type EncounterRunState = {
  encounterRunId: string;
  encounterUnits: any[];
  currentTurnIndex: number;
  round: number;
  selectedTargetId: string;
  lastAction: string;
  updatedAt: number;
};

export function createEncounterRunId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // mobile-safe fallback
  return (
    "enc_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 10)
  );
}

export function saveEncounter(data: EncounterRunState) {
  try {
    localStorage.setItem("liveEncounter", JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save encounter:", err);
  }
}

export function loadEncounter(): EncounterRunState | null {
  try {
    const raw = localStorage.getItem("liveEncounter");
    if (!raw) return null;

    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load encounter:", err);
    return null;
  }
}

export function clearEncounter() {
  try {
    localStorage.removeItem("liveEncounter");
  } catch (err) {
    console.error("Failed to clear encounter:", err);
  }
}
