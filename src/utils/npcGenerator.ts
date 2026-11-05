
import type { NpcItem } from "../types/npc";

import npcLibrary from "../data/npcLibrary.json";

// Random NPC generator using the local library
export async function generateNpcWithAI(
  roleFilter = "Any",
  raceFilter = "Any"
): Promise<NpcItem> {

  const availableNpcs = npcLibrary.filter((npc) => {
    const matchesRole =
      roleFilter === "Any" || npc.role === roleFilter;

    const matchesRace =
      raceFilter === "Any" || npc.race === raceFilter;

    return matchesRole && matchesRace;
  });

  if (availableNpcs.length === 0) {
    throw new Error("No NPCs match the selected filters.");
  }

  const selectedNpc =
    availableNpcs[Math.floor(Math.random() * availableNpcs.length)];

  return {
    ...selectedNpc,
    id: `npc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now()
  };
}
