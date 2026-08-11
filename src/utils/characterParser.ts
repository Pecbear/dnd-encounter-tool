import type { Player } from "../data/players";

export function parseCharacterExport(data: any): Player {
  return {
    id: `imported-${data.fullName}`,
    name: data.fullName ?? "Unknown Character",
    maxHp: Number(data.currentHealth ?? 1),
    ac: Number(data.baseArmorClass ?? 10) + Number(data.bonusArmorClass ?? 0),
    str: Number(
      data.abilityScores?.find((a: any) => a.name === "Strength")?.score ?? 10
    ),
    dex: Number(
      data.abilityScores?.find((a: any) => a.name === "Dexterity")?.score ?? 10
    ),
    con: Number(
      data.abilityScores?.find((a: any) => a.name === "Constitution")?.score ?? 10
    ),
    int: Number(
      data.abilityScores?.find((a: any) => a.name === "Intelligence")?.score ?? 10
    ),
    wis: Number(
      data.abilityScores?.find((a: any) => a.name === "Wisdom")?.score ?? 10
    ),
    cha: Number(
      data.abilityScores?.find((a: any) => a.name === "Charisma")?.score ?? 10
    ),
  };
}

export async function parseCharacterFile(file: File): Promise<Player> {
  const text = await file.text();
  const data = JSON.parse(text);

  console.log("RAW IMPORT DATA:", data);
  console.log("RAW IMPORT NAME:", data.fullName);

  return parseCharacterExport(data);
}