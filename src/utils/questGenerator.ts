import type { RumorItem, QuestItem } from "../types/quest";
import rumorLibrary from "../data/rumorLibrary.json";
import questLibrary from "../data/questLibrary.json";

export function generateRumor(): RumorItem {
  const selected =
    rumorLibrary[Math.floor(Math.random() * rumorLibrary.length)];

  if (!selected) {
    throw new Error("The rumor library is empty.");
  }

  return {
    ...selected,
    truthfulness: selected.truthfulness as RumorItem["truthfulness"],
    id: `rumor-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    };
}

export function generateQuest(): QuestItem {
  const selected =
    questLibrary[Math.floor(Math.random() * questLibrary.length)];

  if (!selected) {
    throw new Error("The quest library is empty.");
  }

  return {
    ...selected,
    difficulty: selected.difficulty as QuestItem["difficulty"],
    id: `quest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    };
}