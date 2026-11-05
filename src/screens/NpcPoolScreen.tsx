import "../App.css";
import { useState, useEffect } from "react";
import type { NpcItem } from "../types/npc";
import { generateNpcWithAI } from "../utils/npcGenerator";
import {
  getAllNpcs,
  saveNpc,
  deleteNpc
} from "../utils/npcStorage";

type NpcPoolScreenProps = {
  onBack: () => void;
};

function NpcPoolScreen({ onBack }: NpcPoolScreenProps) {
  const [savedNpcs, setSavedNpcs] = useState<NpcItem[]>([]);
  const [currentRoll, setCurrentRoll] = useState<NpcItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedRace, setSelectedRace] = useState<string>("Any");
  const [selectedRole, setSelectedRole] = useState<string>("Any");

  // Load saved NPCs from IndexedDB on initial mount
  useEffect(() => {
    getAllNpcs().then(setSavedNpcs).catch(console.error);
  }, []);

  const handleRoll = async () => {
    setIsGenerating(true);
    try {
      const npc = await generateNpcWithAI(selectedRole, selectedRace);
      setCurrentRoll(npc);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToRoster = async () => {
    if (!currentRoll) return;
    await saveNpc(currentRoll);
    setSavedNpcs([currentRoll, ...savedNpcs]);
    setCurrentRoll(null); // Clear preview after saving
  };

  const handleDeleteNpc = async (id: string) => {
    await deleteNpc(id);
    setSavedNpcs(savedNpcs.filter((n) => n.id !== id));
  };

  return (
    <main>
      <h1>NPC Pool</h1>

      <div className="panel">
        <button className="btn util" onClick={onBack}>
          ← Back
        </button>
      </div>

      {/* Generator Control Panel */}
      <div className="panel">
        <h2>Roll NPC with AI</h2>

        <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", marginBottom: "4px" }}>Race:</label>
            <select
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "4px" }}
            >
              <option value="Any">Any Race</option>
              <option value="Human">Human</option>
              <option value="Elf">Elf</option>
              <option value="Dwarf">Dwarf</option>
              <option value="Halfling">Halfling</option>
              <option value="Gnome">Gnome</option>
              <option value="Half-Orc">Half-Orc</option>
              <option value="Tiefling">Tiefling</option>
              <option value="Dragonborn">Dragonborn</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "4px" }}>Role:</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "4px" }}
            >
              <option value="Any">Any Role</option>
              <option value="Commoner">Commoner</option>
              <option value="Guard">Guard</option>
              <option value="Merchant">Merchant</option>
              <option value="Innkeeper">Innkeeper</option>
              <option value="Noble">Noble</option>
              <option value="Cultist">Cultist</option>
              <option value="Scholar">Scholar</option>
              <option value="Outlaw">Outlaw</option>
            </select>
          </div>
        </div>

        <button className="btn primary" onClick={handleRoll} disabled={isGenerating}>
          {isGenerating ? "⚡ Generating NPC..." : "🎲 Roll Random NPC"}
        </button>
      </div>

      {/* Preview / Staged Card */}
      {currentRoll && (
        <div className="panel" style={{ border: "2px solid #ffd700" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>{currentRoll.name} (Preview)</h2>
            <button className="btn primary" onClick={handleSaveToRoster}>
              + Save to Roster
            </button>
          </div>
          <div><strong>Type:</strong> {currentRoll.race} {currentRoll.role} ({currentRoll.attitude})</div>
          <div><strong>Stats:</strong> AC {currentRoll.stats.ac} | HP {currentRoll.stats.hp} ({currentRoll.stats.statTemplate})</div>
          <hr style={{ margin: "10px 0", opacity: 0.3 }} />
          <div><strong>Appearance:</strong> {currentRoll.appearance}</div>
          <div><strong>Personality:</strong> {currentRoll.personality}</div>
          <div><strong>Motivation:</strong> {currentRoll.motivation}</div>
          <div><strong>Secret:</strong> {currentRoll.secret}</div>
        </div>
      )}

      {/* Saved Roster Grid */}
      <h2>Saved Roster ({savedNpcs.length})</h2>
      <div className="encounter-grid">
        {savedNpcs.map((npc) => (
          <div key={npc.id} className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h2>{npc.name}</h2>
              <button className="btn util" onClick={() => handleDeleteNpc(npc.id)}>
                🗑️
              </button>
            </div>
            <div><strong>{npc.race} {npc.role}</strong> ({npc.attitude})</div>
            <div>AC: {npc.stats.ac} | HP: {npc.stats.hp}</div>
            <hr style={{ margin: "10px 0", opacity: 0.3 }} />
            <div><strong>Appearance:</strong> {npc.appearance}</div>
            <div><strong>Vibe:</strong> {npc.personality}</div>
            <div><strong>Goal:</strong> {npc.motivation}</div>
            <div><strong>Secret:</strong> {npc.secret}</div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default NpcPoolScreen;