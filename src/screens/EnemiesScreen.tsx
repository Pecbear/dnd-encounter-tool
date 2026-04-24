import "../App.css";
import { enemyBlocks } from "../data/enemies";
import type { Enemy } from "../data/enemies";

const enemies = Object.values(enemyBlocks)
  .flatMap((block) => Object.values(block));

type EnemiesScreenProps = {
  onBack: () => void;
};

function EnemiesScreen({ onBack }: EnemiesScreenProps) {
  return (
    <main className="encounter-root">
      <h1 className="title">Enemies</h1>

      <div className="panel">
        <button className="btn util" onClick={onBack}>
          ← Back
        </button>
      </div>

      <div className="encounter-grid">
        {enemies.map((e: Enemy) => (
          <div key={e.name} className="panel">
            <h2>{e.name}</h2>

            <div>HP: {e.maxHp}</div>
            <div>AC: {e.ac}</div>

            <div className="stat-grid">
              <div>STR: {e.str}</div>
              <div>DEX: {e.dex}</div>
              <div>CON: {e.con}</div>
              <div>INT: {e.int}</div>
              <div>WIS: {e.wis}</div>
              <div>CHA: {e.cha}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default EnemiesScreen;