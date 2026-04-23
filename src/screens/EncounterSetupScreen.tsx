import { useState } from "react";
import { mockPlayers } from "../data/mockPlayers";
import { mockEnemies } from "../data/mockEnemies";
import type { EncounterPreviewUnit } from "../types/encounter";
import { InputModal } from "../components/InputModal";

type EncounterSetupScreenProps = {
  onBack: () => void;
  onBeginEncounter: (units: EncounterPreviewUnit[]) => void;
};

type SelectedHero = {
  id: string;
  initiative: number;
};

type SelectedEnemy = {
  id: string;
  number: number;
  initiative: number;
};

function EncounterSetupScreen({
  onBack,
  onBeginEncounter,
}: EncounterSetupScreenProps) {
  const [selectedHeroes, setSelectedHeroes] = useState<SelectedHero[]>([]);
  const [selectedEnemies, setSelectedEnemies] = useState<SelectedEnemy[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"hero" | "enemy" | null>(null);
  const [pendingHeroId, setPendingHeroId] = useState<string | null>(null);
  const [pendingEnemyNumber, setPendingEnemyNumber] = useState<number | null>(
    null
  );

  function handleAddHero(heroId: string) {
    if (selectedHeroes.some((h) => h.id === heroId)) return;

    setPendingHeroId(heroId);
    setModalType("hero");
    setModalOpen(true);
  }

  function handleRemoveHero(heroId: string) {
    setSelectedHeroes(selectedHeroes.filter((h) => h.id !== heroId));
  }

  function handleAddEnemy(enemyNumber: number) {
    setModalType("enemy");
    setModalOpen(true);
    setPendingEnemyNumber(enemyNumber);
  }

  function handleRemoveEnemy(enemyId: string) {
    setSelectedEnemies(selectedEnemies.filter((e) => e.id !== enemyId));
  }

  function handleInitiativeConfirm(value: string) {
    const initiative = parseInt(value, 10);

    if (!Number.isFinite(initiative)) {
      alert("Invalid initiative");
      return;
    }

    if (Number.isNaN(initiative)) {
      alert("Initiative must be a number.");
      return;
    }

    if (modalType === "hero" && pendingHeroId) {
      setSelectedHeroes(prev => [
        ...prev,
        { id: pendingHeroId, initiative }
      ]);
    }

    if (
      modalType === "enemy" && 
      typeof pendingEnemyNumber === "number"
    ) {
      setSelectedEnemies(prev => [
        ...prev,
        {
          id: `enemy-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
          number: pendingEnemyNumber,
          initiative,
        },
      ]);
    }

    // cleanup
    setModalOpen(false);
    setModalType(null);
    setPendingHeroId(null);
    setPendingEnemyNumber(null);
  }

  function getEnemyDisplayName(selectedEnemy: SelectedEnemy) {
    const template = mockEnemies.find((e) => e.number === selectedEnemy.number);
    if (!template) return `#${selectedEnemy.number}`;

    const matches = selectedEnemies.filter(
      (e) => e.number === selectedEnemy.number
    );
    if (matches.length === 1) return template.name;

    const index = matches.findIndex((e) => e.id === selectedEnemy.id);
    const letter = String.fromCharCode(65 + index);

    return `${template.name} ${letter}`;
  }

  const sortedSelectedHeroes = [...selectedHeroes].sort((a, b) => {
    if (b.initiative !== a.initiative) return b.initiative - a.initiative;
    const aDex = mockPlayers.find((p) => p.id === a.id)?.dex ?? 0;
    const bDex = mockPlayers.find((p) => p.id === b.id)?.dex ?? 0;
    return bDex - aDex;
  });

  const sortedSelectedEnemies = [...selectedEnemies].sort((a, b) => {
    if (b.initiative !== a.initiative) return b.initiative - a.initiative;
    const aDex = mockEnemies.find((e) => e.number === a.number)?.dex ?? 0;
    const bDex = mockEnemies.find((e) => e.number === b.number)?.dex ?? 0;
    return bDex - aDex;
  });

  const heroPreview: EncounterPreviewUnit[] = selectedHeroes.flatMap((h) => {
    const p = mockPlayers.find((p) => p.id === h.id);
    if (!p) return [];
    return [
      {
        id: h.id,
        name: p.name,
        initiative: h.initiative,
        dex: p.dex,
        side: "hero",
        maxHp: p.maxHp,
        currentHp: p.maxHp,
        ac: p.ac,
        statuses: [],
      },
    ];
  });

  const enemyPreview: EncounterPreviewUnit[] = selectedEnemies.flatMap((e) => {
    if (typeof e.number !== "number") return [];
    const enemy = mockEnemies.find((x) => x.number === e.number);
    if (!enemy) return [];
    return [
      {
        id: e.id,
        name: getEnemyDisplayName(e),
        initiative: e.initiative,
        dex: enemy.dex,
        side: "enemy",
        maxHp: enemy.maxHp,
        currentHp: enemy.maxHp,
        ac: enemy.ac,
        statuses: [],
      },
    ];
  });

  const encounterPreview = [...heroPreview, ...enemyPreview].sort((a, b) => {
    if (b.initiative !== a.initiative) return b.initiative - a.initiative;
    if (b.dex !== a.dex) return b.dex - a.dex;
    if (a.side === "hero" && b.side === "enemy") return -1;
    if (a.side === "enemy" && b.side === "hero") return 1;
    return 0;
  });

  return (
    <main className="encounter-root">
      <h1 className="title">Encounter Setup</h1>

      <div className="encounter-grid">
        {/* LEFT */}
        <div className="panel">
          <h2>Available</h2>

          <div className="action-group">
            <div className="group-label">Heroes</div>
            {mockPlayers.map((p) => (
              <button
                key={p.id}
                className="btn util"
                onClick={() => handleAddHero(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="action-group">
            <div className="group-label">Enemies</div>
            {mockEnemies.map((e) => (
              <button
                key={e.number}
                className="btn util"
                onClick={() => handleAddEnemy(e.number)}
              >
                #{e.number} {e.name}
              </button>
            ))}
          </div>
        </div>

        {/* CENTER */}
        <div className="panel">
          <h2>Selected Units</h2>

          <div className="action-group">
            <div className="group-label">Heroes</div>

            {sortedSelectedHeroes.length === 0 ? (
              <p className="log">No heroes selected.</p>
            ) : (
              sortedSelectedHeroes.map((h) => {
                const p = mockPlayers.find((x) => x.id === h.id);
                if (!p) return null;

                return (
                  <div key={p.id} className="unit-card">
                    <strong>{p.name}</strong>
                    <span>
                      Init {h.initiative} | HP {p.maxHp} | AC {p.ac}
                    </span>
                    <button
                      className="btn danger"
                      onClick={() => handleRemoveHero(p.id)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="action-group">
            <div className="group-label">Enemies</div>

            {sortedSelectedEnemies.length === 0 ? (
              <p className="log">No enemies selected.</p>
            ) : (
              sortedSelectedEnemies.map((e) => {
                const enemy = mockEnemies.find((x) => x.number === e.number);
                if (!enemy) return null;

                return (
                  <div key={e.id} className="unit-card">
                    <strong>{getEnemyDisplayName(e)}</strong>
                    <span>
                      Init {e.initiative} | HP {enemy.maxHp} | AC {enemy.ac}
                    </span>
                    <button
                      className="btn danger"
                      onClick={() => handleRemoveEnemy(e.id)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="panel">
          <h2>Preview</h2>

          {encounterPreview.length === 0 ? (
            <p className="log">No units added.</p>
          ) : (
            <ol className="order-list">
              {encounterPreview.map((u) => (
                <li key={u.id} className="order-item">
                  {u.name} — Init {u.initiative}
                </li>
              ))}
            </ol>
          )}

          <div className="actions-grid">
            <div className="action-group">
              <div className="group-label">Flow</div>

              <button className="btn util" onClick={onBack}>
                Back
              </button>

              <button
                className="btn primary"
                onClick={() => onBeginEncounter(encounterPreview)}
                disabled={encounterPreview.length === 0}
              >
                Begin
              </button>
            </div>
          </div>
        </div>
      </div>

      <InputModal
        isOpen={modalOpen}
        title="Set Initiative"
        placeholder="e.g. 14"
        confirmLabel="Add"
        onConfirm={handleInitiativeConfirm}
        onCancel={() => {
          setModalOpen(false);
          setModalType(null);
          setPendingHeroId(null);
          setPendingEnemyNumber(null);
        }}
      />
    </main>
  );
}

export default EncounterSetupScreen;
