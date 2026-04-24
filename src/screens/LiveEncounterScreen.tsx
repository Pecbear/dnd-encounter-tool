import { useEffect, useState } from "react";
import type { EncounterPreviewUnit } from "../types/encounter";
import "../App.css";
import {DamageHealRibbonPicker} from "../components/DamageHealRibbonPicker";
import { saveEncounter } from "../utils/encounterStorage";
import { StatusRadial } from "../components/StatusRadial";
import { UnitStatBlock } from "../components/UnitStatBlock";

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

function LiveEncounterScreen({
  units,
  onBackToSetup,
}: LiveEncounterScreenProps) {
  const [encounterUnits, setEncounterUnits] = useState(units);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [statusWheelOpen, setStatusWheelOpen] = useState(false);
  const [lastAction, setLastAction] = useState("No actions yet.");
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);
  const [showOverrideSelect, setShowOverrideSelect] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [ribbonOpen, setRibbonOpen] = useState(false);
  const [ribbonMode, setRibbonMode] = useState<"hit" | "heal" | "setHP" | null>(
    null
  );

  useEffect(() => {
    saveEncounter({
      encounterUnits,
      currentTurnIndex,
      round,
      selectedTargetId,
      lastAction,
    });
  }, [encounterUnits, currentTurnIndex, round, selectedTargetId, lastAction]);

  const currentUnit = encounterUnits[currentTurnIndex];

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

  function handleMiss() {
    if (!requireTarget()) return;
    const target = encounterUnits.find((u) => u.id === selectedTargetId);

    if (currentUnit && target) {
      setLastAction(`${currentUnit.name} missed ${target.name}.`);
    }
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
            ? u.statuses.filter((s) => s !== status)
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
                      {unit.statuses.map((s) => (
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
                  HP {currentUnit.currentHp}/{currentUnit.maxHp} | AC {currentUnit.ac}
                </span>

                {getUnitStateLabel(currentUnit) && (
                  <span className="unit-state">
                    {getUnitStateLabel(currentUnit)}
                  </span>
                )}

                {currentUnit.statuses.length > 0 && (
                  <div className="status-container">
                    {currentUnit.statuses.map((s) => (
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
                  <button className="btn attack" onClick={handleMiss}>
                    Miss
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
                    Set HP (Active Unit)
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
                HP {selectedTarget.currentHp}/{selectedTarget.maxHp} | AC {selectedTarget.ac}
              </span>
            
              {getUnitStateLabel(selectedTarget) && (
                <span className="unit-state">
                  {getUnitStateLabel(selectedTarget)}
                </span>
              )}

              {selectedTarget.statuses.length > 0 && (
                <div className="status-container">
                  {selectedTarget.statuses.map((s) => (
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

            <button className="btn danger" onClick={() => onBackToSetup()}>
              Yes, Exit
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
    </main>
  );
}

export default LiveEncounterScreen;
