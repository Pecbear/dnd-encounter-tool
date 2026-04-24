import "../App.css";
import { players } from "../data/players";

type PlayersScreenProps = {
  onBack: () => void;
};

function PlayersScreen({ onBack }: PlayersScreenProps) {
  return (
    <main className="encounter-root">
      <h1 className="title">Players</h1>

      <div className="panel">
        <button className="btn util" onClick={onBack}>
          ← Back
        </button>
      </div>

      <div className="encounter-grid">
        {players.map((p) => (
          <div key={p.id} className="panel">
            <h2>{p.name}</h2>

            <div>HP: {p.maxHp}</div>
            <div>AC: {p.ac}</div>

            <div className="stat-grid">
              <div>STR: {p.str}</div>
              <div>DEX: {p.dex}</div>
              <div>CON: {p.con}</div>
              <div>INT: {p.int}</div>
              <div>WIS: {p.wis}</div>
              <div>CHA: {p.cha}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default PlayersScreen;