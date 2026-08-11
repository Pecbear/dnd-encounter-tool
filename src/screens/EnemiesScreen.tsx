import "../App.css";
import { enemies } from "../data/enemies";
import type { Enemy, EnemyBlockKey, EnemyType } from "../data/enemies";
import { useState } from "react";

type EnemiesScreenProps = {
  onBack: () => void;
};

function EnemiesScreen({ onBack }: EnemiesScreenProps) {
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [selectedTheme, setSelectedTheme] =
    useState<EnemyBlockKey | null>(null);
  const [selectedType, setSelectedType] =
    useState<EnemyType | null>(null);

  const availableTiers = [
    ...new Set(enemies.map((enemy) => enemy.tier)),
  ].sort((a, b) => a - b);

  const availableThemes = [
    ...new Set(enemies.flatMap((enemy) => enemy.themes)),
  ];

  const availableTypes = [
    ...new Set(enemies.map((enemy) => enemy.type)),
  ];

  const filteredEnemies = enemies.filter((enemy) => {
    if (selectedTier !== null && enemy.tier !== selectedTier) {
      return false;
    }

    if (
      selectedTheme !== null &&
      !enemy.themes.includes(selectedTheme)
    ) {
      return false;
    }

    if (
      selectedType !== null &&
      enemy.type !== selectedType
    ) {
      return false;
    }

    return true;
  });

  return (
    <main>
      <h1>Enemies</h1>

      <div className="panel">
        <button className="btn util" onClick={onBack}>
          ← Back
        </button>
      </div>

      <div className="panel">
        <h2>Filters</h2>

        <div className="action-group">
          <div className="group-label">Tier</div>

          <button
            className={`btn ${
              selectedTier === null ? "primary" : "util"
            }`}
            onClick={() => setSelectedTier(null)}
          >
            All Tiers
          </button>

          {availableTiers.map((tier) => (
            <button
              key={tier}
              className={`btn ${
                selectedTier === tier ? "primary" : "util"
              }`}
              onClick={() => setSelectedTier(tier)}
            >
              Tier {tier}
            </button>
          ))}
        </div>

        <div className="action-group">
          <div className="group-label">Type</div>

          <button
            className={`btn ${
              selectedType === null ? "primary" : "util"
            }`}
            onClick={() => setSelectedType(null)}
          >
            All Types
          </button>

          {availableTypes.map((type) => (
            <button
              key={type}
              className={`btn ${
                selectedType === type ? "primary" : "util"
              }`}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="action-group">
          <div className="group-label">Theme</div>

          <button
            className={`btn ${
              selectedTheme === null ? "primary" : "util"
            }`}
            onClick={() => setSelectedTheme(null)}
          >
            All Themes
          </button>

          {availableThemes.map((theme) => (
            <button
              key={theme}
              className={`btn ${
                selectedTheme === theme ? "primary" : "util"
              }`}
              onClick={() => setSelectedTheme(theme)}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      <div className="encounter-grid">
        {filteredEnemies.map((e: Enemy) => (
          <div key={e.name} className="panel">
            <h2>{e.name}</h2>

            <div>TIER: {e.tier}</div>
            <div>TYPE: {e.type}</div>
            <div>HP: {e.maxHp}</div>
            <div>AC: {e.ac}</div>

            <div className="stat-grid">
              <div>STR: {e.str}</div>
              <div>DEX: {e.dex}</div>
              <div>CON: {e.con}</div>
              <div>INT: {e.int}</div>
              <div>WIS: {e.wis}</div>
              <div>CHA: {e.cha}</div>
              <div>THEMES: {e.themes.join(", ")}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default EnemiesScreen;