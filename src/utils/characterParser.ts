import type { Player } from "../data/players";

function getAbilityScore(data: any, abilityName: string): number {
  const baseScore = Number(
    data.abilityScores?.find((a: any) => a.name === abilityName)?.score ?? 10
  );

  let total = baseScore;

  total +=
    data.race?.properties
      ?.filter(
        (p: any) =>
          p.effect?.abilityScoreName === abilityName &&
          p.effect?.adjustment === "Add"
      )
      .reduce(
        (sum: number, p: any) =>
          sum + Number(p.effect?.valueSource?.value ?? 0),
        0
      ) ?? 0;

  total +=
    data.background?.properties
      ?.filter(
        (p: any) =>
          p.effect?.abilityScoreName === abilityName &&
          p.effect?.adjustment === "Add"
      )
      .reduce(
        (sum: number, p: any) =>
          sum + Number(p.effect?.valueSource?.value ?? 0),
        0
      ) ?? 0;

  return total;
}

function calculateMaxHp(data: any): number {
  const con = getAbilityScore(data, "Constitution");
  const conModifier = Math.floor((con - 10) / 2);

  const totalLevel =
    data.classes?.reduce(
      (total: number, characterClass: any) =>
        total + Number(characterClass.level ?? 0),
      0
    ) ?? 0;

  const classHp =
    data.classes?.reduce(
      (total: number, characterClass: any) =>
        total +
        (characterClass.maxHealthIncreases ?? []).reduce(
          (classTotal: number, hp: number) =>
            classTotal + Number(hp),
          0
        ),
      0
    ) ?? 0;

  const bonusMaxHealth = Number(data.bonusMaxHealth ?? 0);

  return classHp + conModifier * totalLevel + bonusMaxHealth;
}

function calculateArmorClass(data: any): number {
  const equippedArmor = data.inventory?.find(
    (item: any) => item.isArmor === true && item.isEquiped === true
  );

  let ac = equippedArmor
    ? Number(equippedArmor.armorClass ?? 10)
    : Number(data.baseArmorClass ?? 10);

  const dex = getAbilityScore(data, "Dexterity");
  const dexModifier = Math.floor((dex - 10) / 2);

  if (equippedArmor?.hasMaxDexterityModifier) {
    ac += Math.min(
      dexModifier,
      Number(equippedArmor.maxDexterityModifier ?? 0)
    );
  } else {
    ac += dexModifier;
  }

  ac += Number(data.bonusArmorClass ?? 0);

  const integratedProtection = data.features?.find(
    (feature: any) => feature.name === "Integrated Protection"
  );

  if (integratedProtection) {
    ac +=
      integratedProtection.properties?.reduce(
        (total: number, property: any) =>
          total +
          (property.effect?.adjustment === "Add"
            ? Number(property.effect?.valueSource?.value ?? 0)
            : 0),
        0
      ) ?? 0;
  }

  return ac;
}

export function parseCharacterExport(data: any): Player {
  return {
    id: `imported-${data.fullName}`,
    name: data.fullName ?? "Unknown Character",

    maxHp: calculateMaxHp(data),

    ac: calculateArmorClass(data),

    str: getAbilityScore(data, "Strength"),
    dex: getAbilityScore(data, "Dexterity"),
    con: getAbilityScore(data, "Constitution"),
    int: getAbilityScore(data, "Intelligence"),
    wis: getAbilityScore(data, "Wisdom"),
    cha: getAbilityScore(data, "Charisma"),
  };
}

export async function parseCharacterFile(file: File): Promise<Player> {
  const text = await file.text();
  const data = JSON.parse(text);

  console.log("RAW IMPORT DATA:", data);
  console.log("RAW IMPORT NAME:", data.fullName);

  return parseCharacterExport(data);
}