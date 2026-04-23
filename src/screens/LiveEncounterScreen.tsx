import { useEffect, useState } from "react";
import type { EncounterPreviewUnit } from "../types/encounter";
import "../App.css";
import { InputModal } from "../components/InputModal";
import { saveEncounter } from '../utils/encounterStorage'


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
  const [selectedStatus, setSelectedStatus] = useState("");
  const [lastAction, setLastAction] = useState("No actions yet.");
  const [showOverrideSelect, setShowOverrideSelect] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<
    "hit" | "heal" | "sethp" | null
  >(null);

  useEffect(() => {
    saveEncounter({
      encounterUnits,
      currentTurnIndex,
      round,
      selectedTargetId,
      selectedStatus,
      lastAction,
    })
}, [
  encounterUnits,
  currentTurnIndex,
  round,
  selectedTargetId,
  selectedStatus,
  lastAction,
])

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

  function applyHpChange(amount: number, mode: "damage" | "heal") {
    const targetId = selectedTargetId;

    setEncounterUnits((prev) =>
      prev.map((unit) => {
        if (unit.id !== targetId) return unit;

        const newHp =
          mode === "damage"
            ? Math.max(0, unit.currentHp - amount)
            : Math.min(unit.maxHp, unit.currentHp + amount);

        return { ...unit, currentHp: newHp };
      })
    );
  }

  function handleModalConfirm(value: string) {
    const num = Number(value);

    if (Number.isNaN(num) || num < 0) {
      alert("Must be a non-negative number.");
      return;
    }

    const target = encounterUnits.find((u) => u.id === selectedTargetId);
    const actor = currentUnit;

    if (!target && modalAction !== "sethp") return;

    switch (modalAction) {
      case "hit":
        applyHpChange(num, "damage");
        if (actor && target) {
          setLastAction(`${actor.name} hit ${target.name} for ${num}.`);
        }
        break;

      case "heal":
        applyHpChange(num, "heal");
        if (actor && target) {
          setLastAction(`${actor.name} healed ${target.name} for ${num}.`);
        }
        break;

      case "sethp":
        if (!currentUnit) return;

        setEncounterUnits((prev) =>
          prev.map((u) => {
            if (u.id !== currentUnit.id) return u;
            return { ...u, currentHp: Math.min(u.maxHp, Math.max(0, num)) };
          })
        );

        setLastAction(`${currentUnit.name} HP set to ${num}.`);
        break;
    }

    setModalOpen(false);
    setModalAction(null);
  }

  function openNumberModal(action: typeof modalAction) {
    setModalAction(action);
    setModalOpen(true);
  }

  function handleHit() {
    if (!requireTarget()) return;
    openNumberModal("hit");
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
    openNumberModal("heal");
  }

  function handleSetHp() {
    setModalAction("sethp");
    setModalOpen(true);
  }

  function handleAddStatus() {
    const id = getTargetOrSelfId();
    if (!id || !selectedStatus) return;

    setEncounterUnits((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        if (u.statuses.includes(selectedStatus)) return u;
        return { ...u, statuses: [...u.statuses, selectedStatus] };
      })
    );

    setLastAction(`${currentUnit.name} applied ${selectedStatus}.`);
  }

  function handleRemoveStatus() {
    const id = getTargetOrSelfId();
    if (!id || !selectedStatus) return;

    setEncounterUnits((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        return {
          ...u,
          statuses: u.statuses.filter((s) => s !== selectedStatus),
        };
      })
    );

    setLastAction(`${currentUnit.name} removed ${selectedStatus}.`);
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
              <div className="unit-card">
                <strong>{currentUnit.name}</strong>

                <span>
                  HP {currentUnit.currentHp}/{currentUnit.maxHp}
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

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">Status</option>
                    {AVAILABLE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <button className="btn util" onClick={handleAddStatus}>
                    Add Status
                  </button>

                  <button className="btn util" onClick={handleRemoveStatus}>
                    Remove Status
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
            <div className="unit-card">
              <strong>{selectedTarget.name}</strong>

              <span>
                HP {selectedTarget.currentHp}/{selectedTarget.maxHp}
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
            </div>
          )}
        </div>
      </div>

      <InputModal
        isOpen={modalOpen}
        title={
          modalAction === "sethp"
            ? "Set HP"
            : modalAction === "heal"
            ? "Enter Healing"
            : modalAction === "hit"
            ? "Enter Hit Damage"
            : "Enter Damage"
        }
        placeholder="e.g. 10"
        confirmLabel="Apply"
        onConfirm={handleModalConfirm}
        onCancel={() => {
          setModalOpen(false);
          setModalAction(null);
        }}
      />

      {exitConfirmOpen && (
        <div className="override-panel">
          <div className="override-box">
            <div className="group-label">End Encounter?</div>

            <p style={{ marginBottom: 12 }}>
              This will return you to setup and discard live flow state.
            </p>

            <button
              className="btn danger"
              onClick={() => onBackToSetup()}
            >
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
    </main>
  );
}

export default LiveEncounterScreen;
