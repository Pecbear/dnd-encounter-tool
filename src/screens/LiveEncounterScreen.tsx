import { useEffect, useState } from "react";
import type { Player } from "../data/players";
import { getAllCharacters } from "../utils/characterStorage";
import { enemies, type EnemyBlockKey } from "../data/enemies";
import type { EncounterPreviewUnit } from "../types/encounter";
import "../App.css";
import { DamageHealRibbonPicker } from "../components/DamageHealRibbonPicker";
import {
  saveEncounter,
  loadEncounter,
  clearEncounter,
  createEncounterRunId,
} from "../utils/encounterStorage";
import { StatusRadial } from "../components/StatusRadial";
import { UnitStatBlock } from "../components/UnitStatBlock";
import { InitiativePicker } from "../components/InitiativePicker";

type LiveEncounterScreenProps = {
  units: EncounterPreviewUnit[];
  onBackToSetup: () => void;
};

const AVAILABLE_STATUSES = [
  "Blinded",
  "Charmed",
  "Deafened",
  "Exhaustion",
  "Frightened",
  "Grappled",
  "Incapacitated",
  "Invisible",
  "Paralyzed",
  "Petrified",
  "Poisoned",
  "Prone",
  "Restrained",
  "Stunned",
  "Unconscious",
];

function StatusPill({ status }: { status: string }) {
  return <span className="status-pill">{status}</span>;
}

function getUnitStateLabel(unit: EncounterPreviewUnit) {
  if (unit.currentHp > 0) return "";
  return unit.side === "hero" ? "Downed" : "Defeated";
}

function createSessionId(units: any[]) {
  return JSON.stringify(units.map((u) => u.id)).slice(0, 50);
}

function LiveEncounterScreen({
  units,
  onBackToSetup,
}: LiveEncounterScreenProps) {
  const rawSaved = loadEncounter();
  const incomingSessionId = createSessionId(units);

  const incomingRunId = useState(() => createEncounterRunId())[0];

  const saved = rawSaved && rawSaved.encounterRunId ? rawSaved : null;

  const [encounterUnits, setEncounterUnits] = useState(
    saved?.encounterUnits ?? units
  );

  const [currentTurnIndex, setCurrentTurnIndex] = useState(
    saved?.currentTurnIndex ?? 0
  );

  const [round, setRound] = useState(saved?.round ?? 1);

  const [selectedTargetId, setSelectedTargetId] = useState(
    saved?.selectedTargetId ?? ""
  );

  const [lastAction, setLastAction] = useState(
    saved?.lastAction ?? "No actions yet."
  );

  const [statusWheelOpen, setStatusWheelOpen] = useState(false);
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);
  const [showOverrideSelect, setShowOverrideSelect] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [ribbonOpen, setRibbonOpen] = useState(false);

  const [ribbonMode, setRibbonMode] = useState<"hit" | "heal" | "setHP" | null>(
    null
  );

  const [addUnitOpen, setAddUnitOpen] = useState(false);
  const [addUnitType, setAddUnitType] = useState<"hero" | "enemy" | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);

  const [selectedAddPlayerId, setSelectedAddPlayerId] = useState<string | null>(
    null
  );

  const [selectedEnemyTheme, setSelectedEnemyTheme] =
    useState<EnemyBlockKey | null>(null);

  const [selectedEnemyTier, setSelectedEnemyTier] =
    useState<number | null>(null);

  const [pendingEnemyForInitiative, setPendingEnemyForInitiative] =
    useState<string | null>(null);

  useEffect(() => {
  async function loadPlayers() {
    const storedPlayers = await getAllCharacters();
    setAvailablePlayers(storedPlayers);
    }

    loadPlayers();
  }, []);

  useEffect(() => {
    if (!encounterUnits?.length) return;

    console.log("SAVING", {
      sessionId: incomingSessionId,
      encounterUnits,
    });

    saveEncounter({
      encounterRunId: saved?.encounterRunId ?? incomingRunId,
      encounterUnits,
      currentTurnIndex,
      round,
      selectedTargetId,
      lastAction,
      updatedAt: Date.now(),
    });
  }, [encounterUnits, currentTurnIndex, round, selectedTargetId, lastAction]);

  const currentUnit =
    encounterUnits.length > 0 ? encounterUnits[currentTurnIndex] : undefined;

  useEffect(() => {
    setSelectedTargetId("");
  }, [currentTurnIndex]);

  function handleNextTurn() {
    if (encounterUnits.length === 0) return;

    const nextIndex = (currentTurnIndex + 1) % encounterUnits.length;
    const nextUnit = encounterUnits[nextIndex];

    // If we wrapped back to index 0 → new round
    if (nextIndex === 0) {
      setRound((r) => r + 1);
    }

    setCurrentTurnIndex(nextIndex);

    // Optional: log dead units still "passing turn"
    if (nextUnit.currentHp <= 0) {
      setLastAction(`${nextUnit.name} is down (turn skipped).`);
    }
  }

  function requireTarget() {
    if (!selectedTargetId) {
      alert("Select a target first.");
      return false;
    }
    return true;
  }

  function getTargetOrSelfId() {
    return selectedTargetId || currentUnit?.id;
  }

  function handleRibbonConfirm(value: number) {
    const actor = currentUnit;
    if (!actor || !ribbonMode) return;

    // SET HP (no target, affects current unit)
    if (ribbonMode === "setHP") {
      setEncounterUnits((prev) =>
        prev.map((u) => {
          if (u.id !== actor.id) return u;

          return {
            ...u,
            currentHp: Math.min(u.maxHp, Math.max(0, value)),
          };
        })
      );

      setLastAction(`${actor.name} HP set to ${value}.`);
    }

    // HIT / HEAL (require target)
    else {
      const targetId = selectedTargetId;
      const target = encounterUnits.find((u) => u.id === targetId);

      if (!target) return;

      setEncounterUnits((prev) =>
        prev.map((u) => {
          if (u.id !== targetId) return u;

          const newHp =
            ribbonMode === "hit"
              ? Math.max(0, u.currentHp - value)
              : Math.min(u.maxHp, u.currentHp + value);

          return { ...u, currentHp: newHp };
        })
      );

      setLastAction(
        ribbonMode === "hit"
          ? `${actor.name} hit ${target.name} for ${value}.`
          : `${actor.name} healed ${target.name} for ${value}.`
      );
    }

    setRibbonOpen(false);
    setRibbonMode(null);
  }

  function handleHit() {
    if (!requireTarget()) return;
    setRibbonMode("hit");
    setRibbonOpen(true);
  }

  function handleHeal() {
    if (!requireTarget()) return;
    setRibbonMode("heal");
    setRibbonOpen(true);
  }

  function handleSetHp() {
    setRibbonMode("setHP");
    setRibbonOpen(true);
  }

  function handleSelectAddPlayer(playerId: string) {
    setSelectedAddPlayerId(playerId);
    setAddUnitOpen(false);
    setAddUnitType(null);
  }

  function handleAddPlayerConfirmed(initiative: number) {
    if (!selectedAddPlayerId) return;

    const player = availablePlayers.find(
      (p) => p.id === selectedAddPlayerId
    );

    if (!player) return;

    const newUnit: EncounterPreviewUnit = {
      id: player.id,
      name: player.name,
      initiative,
      str: player.str,
      dex: player.dex,
      con: player.con,
      int: player.int,
      wis: player.wis,
      cha: player.cha,
      side: "hero",
      maxHp: player.maxHp,
      currentHp: player.maxHp,
      ac: player.ac,
      statuses: [],
    };

    setEncounterUnits((prev) => {
      const activeUnitId = prev[currentTurnIndex]?.id;

      const updated = [...prev, newUnit];

      updated.sort((a, b) => {
        if (b.initiative !== a.initiative) {
          return b.initiative - a.initiative;
        }

        if (b.dex !== a.dex) {
          return b.dex - a.dex;
        }

        if (a.side === "hero" && b.side === "enemy") return -1;
        if (a.side === "enemy" && b.side === "hero") return 1;

        return 0;
      });

      const newActiveIndex = updated.findIndex(
        (u) => u.id === activeUnitId
      );

      if (newActiveIndex !== -1) {
        setCurrentTurnIndex(newActiveIndex);
      }

      return updated;
    });

    setLastAction(`${player.name} joined the encounter.`);

    setSelectedAddPlayerId(null);
  }

  function handleAddEnemyConfirmed(initiative: number, enemyName: string) {
    if (!selectedEnemyTheme || selectedEnemyTier === null) return;

    const enemy = enemies.find(
      (e) =>
        e.name === enemyName &&
        e.tier === selectedEnemyTier &&
        e.themes.includes(selectedEnemyTheme)
    );

    if (!enemy) return;

    const newUnit: EncounterPreviewUnit = {
      id: `enemy-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      name: enemy.name,
      initiative,
      str: enemy.str,
      dex: enemy.dex,
      con: enemy.con,
      int: enemy.int,
      wis: enemy.wis,
      cha: enemy.cha,
      side: "enemy",
      maxHp: enemy.maxHp,
      currentHp: enemy.maxHp,
      ac: enemy.ac,
      statuses: [],
    };

    setEncounterUnits((prev) => {
      const activeUnitId = prev[currentTurnIndex]?.id;

      const updated = [...prev, newUnit];

      updated.sort((a, b) => {
        if (b.initiative !== a.initiative) {
          return b.initiative - a.initiative;
        }

        if (b.dex !== a.dex) {
          return b.dex - a.dex;
        }

        if (a.side === "hero" && b.side === "enemy") return -1;
        if (a.side === "enemy" && b.side === "hero") return 1;

        return 0;
      });

      const newActiveIndex = updated.findIndex(
        (u) => u.id === activeUnitId
      );

      if (newActiveIndex !== -1) {
        setCurrentTurnIndex(newActiveIndex);
      }

      return updated;
    });

    setLastAction(`${enemy.name} joined the encounter.`);

    setSelectedEnemyTheme(null);
    setSelectedEnemyTier(null);
  }

  function handleToggleStatus(status: string) {
    const id = getTargetOrSelfId();
    if (!id) return;

    setEncounterUnits((prev) => {
      const target = prev.find((u) => u.id === id);
      const exists = target?.statuses.includes(status);

      const updated = prev.map((u) => {
        if (u.id !== id) return u;

        return {
          ...u,
          statuses: exists
            ? u.statuses.filter((s: string) => s !== status)
            : [...u.statuses, status],
        };
      });

      setLastAction(
        `${currentUnit.name} ${exists ? "removed" : "applied"} ${status}.`
      );

      return updated;
    });
  }

  function toggleExpandedUnit(unitId: string) {
    setExpandedUnitId((prev) => (prev === unitId ? null : unitId));
  }

  function handleSkipTurn() {
    if (currentUnit) {
      setLastAction(`${currentUnit.name} skipped their turn.`);
    }
    handleNextTurn();
  }

  function handleExit(type: "save" | "discard") {
    if (type === "discard") {
      clearEncounter();
      onBackToSetup();
      return;
    }

    if (type === "save") {
      saveEncounter({
        encounterRunId: saved?.encounterRunId ?? incomingRunId,
        encounterUnits,
        currentTurnIndex,
        round,
        selectedTargetId,
        lastAction,
        updatedAt: Date.now(),
      });

      onBackToSetup();
    }
  }

  function handleSetActiveUnit(unitId: string) {
    const index = encounterUnits.findIndex((u) => u.id === unitId);
    if (index === -1) return;

    setCurrentTurnIndex(index);
    setShowOverrideSelect(false);

    setLastAction(`DM override: ${encounterUnits[index].name} is now active.`);
  }

  const availableTargets = encounterUnits.filter(
    (u) => u.id !== currentUnit?.id
  );
  const selectedTarget = availableTargets.find(
    (u) => u.id === selectedTargetId
  );

  return (
    <main className="encounter-root">
      <h1 className="title">Live Encounter</h1>

      <div className="encounter-grid">
        {/* LEFT */}
        <div className="panel">
          <h2>Order</h2>

          <ol className="order-list">
            {encounterUnits.map((unit, i) => {
              const stateLabel = getUnitStateLabel(unit);

              return (
                <li
                  key={unit.id}
                  className={`order-item 
                    ${i === currentTurnIndex ? "active" : ""} 
                    ${unit.currentHp === 0 ? "dead" : ""}`}
                >
                  <div className="order-name">{unit.name}</div>

                  <div className="order-hp">
                    HP {unit.currentHp}/{unit.maxHp}
                  </div>

                  {stateLabel && (
                    <div className="order-state">{stateLabel}</div>
                  )}

                  {unit.statuses.length > 0 && (
                    <div className="status-container">
                      {unit.statuses.map((s: string) => (
                        <StatusPill key={s} status={s} />
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* CENTER */}
        <div className="panel">
          <h2>Current</h2>

          {currentUnit && (
            <>
              <div
                className="unit-card"
                onClick={() => toggleExpandedUnit(currentUnit.id)}
                style={{ cursor: "pointer" }}
              >
                <strong>{currentUnit.name}</strong>

                <span>
                  HP {currentUnit.currentHp}/{currentUnit.maxHp} | AC{" "}
                  {currentUnit.ac}
                </span>

                {getUnitStateLabel(currentUnit) && (
                  <span className="unit-state">
                    {getUnitStateLabel(currentUnit)}
                  </span>
                )}

                {currentUnit.statuses.length > 0 && (
                  <div className="status-container">
                    {currentUnit.statuses.map((s: string) => (
                      <StatusPill key={s} status={s} />
                    ))}
                  </div>
                )}

                {expandedUnitId === currentUnit.id && (
                  <UnitStatBlock
                    str={currentUnit.str}
                    dex={currentUnit.dex}
                    con={currentUnit.con}
                    int={currentUnit.int}
                    wis={currentUnit.wis}
                    cha={currentUnit.cha}
                  />
                )}
              </div>

              <div className="meta">Round {round}</div>
              <div className="log">{lastAction}</div>

              <div className="actions-grid">
                {/* COMBAT */}
                <div className="action-group combat">
                  <div className="group-label">Combat</div>

                  <button className="btn attack" onClick={handleHit}>
                    Hit
                  </button>

                  <button className="btn heal" onClick={handleHeal}>
                    Heal
                  </button>
                </div>

                {/* STATE */}
                <div className="action-group state">
                  <div className="group-label">State</div>

                  <button
                    className="btn util"
                    onClick={() => setStatusWheelOpen(true)}
                  >
                    Open Status Wheel
                  </button>
                </div>

                {/* DM OVERRIDE */}
                <div className="action-group dm">
                  <div className="group-label">DM Override</div>

                  <button className="btn util" onClick={handleSetHp}>
                    Set HP
                  </button>

                  <button
                    className="btn util"
                    onClick={() => {
                      setAddUnitType("hero");
                      setAddUnitOpen(true);
                    }}
                  >
                    Add Player
                  </button>

                  <button
                    className="btn util"
                    onClick={() => {
                      setAddUnitType("enemy");
                      setAddUnitOpen(true);
                    }}
                  >
                    Add Enemy
                  </button>

                  <button
                    className="btn util"
                    onClick={() => setShowOverrideSelect(true)}
                  >
                    Active Unit
                  </button>
                </div>

                {/* OVERLAY SELECTOR */}
                {showOverrideSelect && (
                  <div className="override-panel">
                    <div className="override-box">
                      <div className="group-label">Select Active Unit</div>

                      {encounterUnits.map((unit) => (
                        <button
                          key={unit.id}
                          className="override-option"
                          onClick={() => {
                            handleSetActiveUnit(unit.id);
                            setShowOverrideSelect(false);
                          }}
                        >
                          {unit.name}
                        </button>
                      ))}

                      <button
                        className="btn util"
                        style={{ marginTop: 8 }}
                        onClick={() => setShowOverrideSelect(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* FLOW */}
                <div className="action-group flow">
                  <div className="group-label">Flow</div>

                  <button className="btn util" onClick={handleSkipTurn}>
                    Skip
                  </button>
                  <button className="btn primary" onClick={handleNextTurn}>
                    Next
                  </button>

                  <button
                    className="btn danger"
                    onClick={() => setExitConfirmOpen(true)}
                  >
                    Exit
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT */}
        <div className="panel">
          <h2>Target</h2>

          <select
            value={selectedTargetId}
            onChange={(e) => setSelectedTargetId(e.target.value)}
          >
            <option value="">Select target</option>

            {availableTargets.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {selectedTarget && (
            <div
              className="unit-card"
              onClick={() => toggleExpandedUnit(selectedTarget.id)}
              style={{ cursor: "pointer" }}
            >
              <strong>{selectedTarget.name}</strong>

              <span>
                HP {selectedTarget.currentHp}/{selectedTarget.maxHp} | AC{" "}
                {selectedTarget.ac}
              </span>

              {getUnitStateLabel(selectedTarget) && (
                <span className="unit-state">
                  {getUnitStateLabel(selectedTarget)}
                </span>
              )}

              {selectedTarget.statuses.length > 0 && (
                <div className="status-container">
                  {selectedTarget.statuses.map((s: string) => (
                    <StatusPill key={s} status={s} />
                  ))}
                </div>
              )}

              {expandedUnitId === selectedTarget.id && (
                <UnitStatBlock
                  str={selectedTarget.str}
                  dex={selectedTarget.dex}
                  con={selectedTarget.con}
                  int={selectedTarget.int}
                  wis={selectedTarget.wis}
                  cha={selectedTarget.cha}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {ribbonOpen && ribbonMode && (
        <DamageHealRibbonPicker
          mode={ribbonMode}
          targetName={
            ribbonMode === "setHP"
              ? currentUnit?.name
              : encounterUnits.find((u) => u.id === selectedTargetId)?.name
          }
          onConfirm={handleRibbonConfirm}
          onCancel={() => {
            setRibbonOpen(false);
            setRibbonMode(null);
          }}
        />
      )}

      {exitConfirmOpen && (
        <div className="override-panel">
          <div className="override-box">
            <div className="group-label">End Encounter?</div>

            <p style={{ marginBottom: 12 }}>
              This will return you to setup and discard live flow state.
            </p>

            <button
              className="btn danger"
              onClick={() => handleExit("discard")}
            >
              Exit Without Saving
            </button>

            <button className="btn primary" onClick={() => handleExit("save")}>
              Save & Exit
            </button>

            <button
              className="btn util"
              onClick={() => setExitConfirmOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {statusWheelOpen && (
        <StatusRadial
          applied={
            encounterUnits.find((u) => u.id === getTargetOrSelfId())
              ?.statuses ?? []
          }
          statuses={AVAILABLE_STATUSES}
          onToggle={handleToggleStatus}
          onClose={() => setStatusWheelOpen(false)}
        />
      )}

      {selectedAddPlayerId && (
        <InitiativePicker
          onSelect={(value) => {
            handleAddPlayerConfirmed(Number(value));
          }}
          onCancel={() => {
            setSelectedAddPlayerId(null);
          }}
        />
      )}

      {pendingEnemyForInitiative && (
        <InitiativePicker
          onSelect={(value) => {
            handleAddEnemyConfirmed(
              Number(value),
              pendingEnemyForInitiative
            );

            setPendingEnemyForInitiative(null);
          }}
          onCancel={() => {
            setPendingEnemyForInitiative(null);
          }}
        />
      )}

      {addUnitOpen && addUnitType === "hero" && (
        <div className="override-panel">
          <div className="override-box">
            <div className="group-label">Add Player</div>

            {availablePlayers.map((player) => (
              <button
                key={player.id}
                className="override-option"
                onClick={() => {
                  handleSelectAddPlayer(player.id);
                }}
              >
                {player.name}
              </button>
            ))}

            <button
              className="btn util"
              style={{ marginTop: 8 }}
              onClick={() => {
                setAddUnitOpen(false);
                setAddUnitType(null);
                setSelectedAddPlayerId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {addUnitOpen && addUnitType === "enemy" && (
        <div className="override-panel">
          <div className="override-box">
            <div className="group-label">Add Enemy</div>

            {!selectedEnemyTheme && (
              <>
                <div className="group-label">Theme</div>

                {[...new Set(enemies.flatMap((e) => e.themes))].map((theme) => (
                  <button
                    key={theme}
                    className="override-option"
                    onClick={() => setSelectedEnemyTheme(theme)}
                  >
                    {theme}
                  </button>
                ))}
              </>
            )}

            {selectedEnemyTheme && selectedEnemyTier === null && (
              <>
                <div className="group-label">
                  {selectedEnemyTheme} Tiers
                </div>

                {[
                  ...new Set(
                    enemies
                      .filter((e) => e.themes.includes(selectedEnemyTheme))
                      .map((e) => e.tier)
                  ),
                ]
                  .sort((a, b) => a - b)
                  .map((tier) => (
                    <button
                      key={tier}
                      className="override-option"
                      onClick={() => setSelectedEnemyTier(tier)}
                    >
                      Tier {tier}
                    </button>
                  ))}
              </>
            )}

            {selectedEnemyTheme && selectedEnemyTier !== null && (
              <>
                <div className="group-label">
                  Available Enemies
                </div>

                {enemies
                  .filter(
                    (e) =>
                      e.tier === selectedEnemyTier &&
                      e.themes.includes(selectedEnemyTheme)
                  )
                  .map((enemy) => (
                    <button
                      key={enemy.name}
                      className="override-option"
                      onClick={() => {
                        setAddUnitOpen(false);
                        setAddUnitType(null);

                        setPendingEnemyForInitiative(enemy.name);
                      }}
                    >
                      {enemy.name}
                    </button>
                  ))}
              </>
            )}

            <button
              className="btn util"
              style={{ marginTop: 8 }}
              onClick={() => {
                setAddUnitOpen(false);
                setAddUnitType(null);
                setSelectedEnemyTheme(null);
                setSelectedEnemyTier(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </main>
  );
}

export default LiveEncounterScreen;
