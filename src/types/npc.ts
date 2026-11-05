export type NpcRole =
  | "Commoner"
  | "Guard"
  | "Merchant"
  | "Innkeeper"
  | "Noble"
  | "Cultist"
  | "Scholar"
  | "Outlaw";

export type NpcRace =
  | "Human"
  | "Elf"
  | "Dwarf"
  | "Halfling"
  | "Gnome"
  | "Half-Orc"
  | "Tiefling"
  | "Dragonborn";

export type NpcAttitude = "Friendly" | "Neutral" | "Suspicious" | "Hostile";

export type NpcItem = {
  id: string;
  name: string;
  race: NpcRace | string;
  role: NpcRole | string;
  attitude: NpcAttitude | string;
  appearance: string;
  personality: string;
  motivation: string;
  secret: string;
  stats: {
    ac: number;
    hp: number;
    statTemplate: string;
  };
  createdAt: number;
};