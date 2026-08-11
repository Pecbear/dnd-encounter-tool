import "../App.css";
import { useState, useEffect } from "react";
import type { Player } from "../data/players";
import { parseCharacterFile } from "../utils/characterParser";
import {
  getAllCharacters,
  saveCharacter,
  deleteCharacter,
} from "../utils/characterStorage";

type PlayersScreenProps = {
  onBack: () => void;
};

function PlayersScreen({ onBack }: PlayersScreenProps) {
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [maxHp, setMaxHp] = useState("1");
  const [ac, setAc] = useState("10");
  const [str, setStr] = useState("10");
  const [dex, setDex] = useState("10");
  const [con, setCon] = useState("10");
  const [int, setInt] = useState("10");
  const [wis, setWis] = useState("10");
  const [cha, setCha] = useState("10");

  useEffect(() => {
  async function loadPlayers() {
    const storedPlayers = await getAllCharacters();
    setAvailablePlayers(storedPlayers);
    }

    loadPlayers();
  }, []);

  async function handleImportCharacter(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const character = await parseCharacterFile(file);
      
      await saveCharacter(character);

      const storedPlayers = await getAllCharacters();
      setAvailablePlayers(storedPlayers);

      console.table(character);

      alert(`Parsed character: ${character.name}`);
    } catch (error) {
      console.error("Failed to parse character file:", error);
      alert(`Failed to read character file: ${error}`);
    }

    event.target.value = "";
  }

  async function handleCreateCharacter() {
    if (!name.trim()) {
      alert("Character name is required.");
      return;
    }

    const character: Player = {
      id: `player-${Date.now()}`,
      name: name.trim(),
      maxHp: Number(maxHp),
      ac: Number(ac),
      str: Number(str),
      dex: Number(dex),
      con: Number(con),
      int: Number(int),
      wis: Number(wis),
      cha: Number(cha),
    };

    await saveCharacter(character);

    const storedPlayers = await getAllCharacters();
    setAvailablePlayers(storedPlayers);

    setName("");
    setMaxHp("1");
    setAc("10");
    setStr("10");
    setDex("10");
    setCon("10");
    setInt("10");
    setWis("10");
    setCha("10");

    setShowCreateForm(false);
  }

  async function handleDeleteCharacter(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this character?"
    );

    if (!confirmed) return;

    await deleteCharacter(id);

    setAvailablePlayers((prev) =>
      prev.filter((player) => player.id !== id)
    );
  }

  function handleEditCharacter(player: Player) {
    setEditingPlayerId(player.id);

    setName(player.name);
    setMaxHp(String(player.maxHp));
    setAc(String(player.ac));
    setStr(String(player.str));
    setDex(String(player.dex));
    setCon(String(player.con));
    setInt(String(player.int));
    setWis(String(player.wis));
    setCha(String(player.cha));

    setShowCreateForm(true);
  }

  async function handleUpdateCharacter() {
  if (!editingPlayerId) return;

  if (!name.trim()) {
    alert("Character name is required.");
    return;
  }

  const character: Player = {
    id: editingPlayerId,
    name: name.trim(),
    maxHp: Number(maxHp),
    ac: Number(ac),
    str: Number(str),
    dex: Number(dex),
    con: Number(con),
    int: Number(int),
    wis: Number(wis),
    cha: Number(cha),
  };

  await saveCharacter(character);

  const storedPlayers = await getAllCharacters();
  setAvailablePlayers(storedPlayers);

  setEditingPlayerId(null);
  setName("");
  setMaxHp("1");
  setAc("10");
  setStr("10");
  setDex("10");
  setCon("10");
  setInt("10");
  setWis("10");
  setCha("10");

  setShowCreateForm(false);
}

  return (
    <main className="encounter-root">
      <h1 className="title">Players</h1>

      <div className="panel">
        <button className="btn util" onClick={onBack}>
          ← Back
        </button>

        <button
          className="btn primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "Cancel" : "Create Character"}
        </button>

        <label className="btn primary">
          Import Character
          <input
            type="file"
            accept=".hhc,application/json"
            onChange={handleImportCharacter}
            style={{ display: "none" }}
          />
        </label>

      </div>

      {showCreateForm && (
        <div className="panel">
          <h2>{editingPlayerId ? "Edit Character" : "Create Character"}</h2>

          <div className="action-group">
            <label>
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label>
              Max HP
              <input
                type="number"
                value={maxHp}
                onChange={(e) => setMaxHp(e.target.value)}
              />
            </label>

            <label>
              AC
              <input
                type="number"
                value={ac}
                onChange={(e) => setAc(e.target.value)}
              />
            </label>

            <label>
              STR
              <input
                type="number"
                value={str}
                onChange={(e) => setStr(e.target.value)}
              />
            </label>

            <label>
              DEX
              <input
                type="number"
                value={dex}
                onChange={(e) => setDex(e.target.value)}
              />
            </label>

            <label>
              CON
              <input
                type="number"
                value={con}
                onChange={(e) => setCon(e.target.value)}
              />
            </label>

            <label>
              INT
              <input
                type="number"
                value={int}
                onChange={(e) => setInt(e.target.value)}
              />
            </label>

            <label>
              WIS
              <input
                type="number"
                value={wis}
                onChange={(e) => setWis(e.target.value)}
              />
            </label>

            <label>
              CHA
              <input
                type="number"
                value={cha}
                onChange={(e) => setCha(e.target.value)}
              />
            </label>

            <button
              className="btn primary"
              onClick={editingPlayerId ? handleUpdateCharacter : handleCreateCharacter}
            >
              {editingPlayerId ? "Save Changes" : "Save Character"}
            </button>
          </div>
        </div>
      )}

      <div className="encounter-grid">
        {availablePlayers.map((p) => (
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

            <button
              className="btn util"
              onClick={() => handleEditCharacter(p)}
            >
              Edit
            </button>

            <button
              className="btn danger"
              onClick={() => handleDeleteCharacter(p.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default PlayersScreen;