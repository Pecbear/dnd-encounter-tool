import { useState } from "react";
import type { RumorItem, QuestItem } from "../types/quest";
import { generateRumor, generateQuest } from "../utils/questGenerator";

type QuestBoardScreenProps = {
  onBack: () => void;
};

function QuestBoardScreen({ onBack }: QuestBoardScreenProps) {
  const [mode, setMode] = useState<"Rumors" | "Quests">("Rumors");
  const [currentRumor, setCurrentRumor] = useState<RumorItem | null>(null);
  const [currentQuest, setCurrentQuest] = useState<QuestItem | null>(null);

  function rollContent() {
    if (mode === "Rumors") {
      setCurrentRumor(generateRumor());
      setCurrentQuest(null);
    } else {
      setCurrentQuest(generateQuest());
      setCurrentRumor(null);
    }
  }

  return (
    <div className="screen">
      <div className="panel">
        <div className="panel-header">
          <h2>Rumor & Quest Board</h2>
          <button className="btn util" onClick={onBack}>
            Back
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <button
            className={`btn ${mode === "Rumors" ? "primary" : "util"}`}
            onClick={() => {
              setMode("Rumors");
              setCurrentQuest(null);
            }}
          >
            Rumors
          </button>

          <button
            className={`btn ${mode === "Quests" ? "primary" : "util"}`}
            onClick={() => {
              setMode("Quests");
              setCurrentRumor(null);
            }}
          >
            Quests
          </button>
        </div>

        <button className="btn primary" onClick={rollContent}>
          Roll {mode === "Rumors" ? "Rumor" : "Quest"}
        </button>

        {currentRumor && (
          <div className="panel" style={{ marginTop: 20 }}>
            <h3>{currentRumor.title}</h3>
            <p>{currentRumor.content}</p>

            <p><strong>Source:</strong> {currentRumor.source}</p>
            <p><strong>Location:</strong> {currentRumor.location}</p>
            <p><strong>Truth:</strong> {currentRumor.truthfulness}</p>
            <p><strong>Category:</strong> {currentRumor.category}</p>
          </div>
        )}

        {currentQuest && (
          <div className="panel" style={{ marginTop: 20 }}>
            <h3>{currentQuest.title}</h3>
            <p>{currentQuest.description}</p>

            <p><strong>Quest Giver:</strong> {currentQuest.questGiver}</p>
            <p><strong>Location:</strong> {currentQuest.location}</p>
            <p><strong>Objective:</strong> {currentQuest.objective}</p>
            <p><strong>Complication:</strong> {currentQuest.complication}</p>
            <p><strong>Reward:</strong> {currentQuest.reward}</p>
            <p><strong>Difficulty:</strong> {currentQuest.difficulty}</p>
            <p><strong>Category:</strong> {currentQuest.category}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestBoardScreen;