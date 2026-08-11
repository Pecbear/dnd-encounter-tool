import { getAllCharacters, saveCharacter } from "./characterStorage";
import type { Player } from "../data/players";
import type { EncounterRunState } from "./encounterStorage";

export type DndBackup = {
  backupType: "dnd-encounter-tool";
  backupVersion: 1;
  createdAt: number;

  characters: Player[];

  liveEncounter: EncounterRunState | null;
};

export async function createBackup(): Promise<DndBackup> {
  const characters = await getAllCharacters();

  let liveEncounter: EncounterRunState | null = null;

  try {
    const raw = localStorage.getItem("liveEncounter");

    if (raw) {
      liveEncounter = JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to read live encounter for backup:", err);
  }

  return {
    backupType: "dnd-encounter-tool",
    backupVersion: 1,
    createdAt: Date.now(),
    characters,
    liveEncounter,
  };
}

export async function restoreBackup(backup: DndBackup) {
  if (backup.backupType !== "dnd-encounter-tool") {
    throw new Error("Invalid D&D Encounter Tool backup.");
  }

  if (!Array.isArray(backup.characters)) {
    throw new Error("Backup contains invalid character data.");
  }

  for (const character of backup.characters) {
    await saveCharacter(character);
  }

  if (backup.liveEncounter) {
    localStorage.setItem(
      "liveEncounter",
      JSON.stringify(backup.liveEncounter)
    );
  } else {
    localStorage.removeItem("liveEncounter");
  }
}

export function downloadBackup(backup: DndBackup) {
  const json = JSON.stringify(backup, null, 2);

  const blob = new Blob([json], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `dnd-encounter-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}