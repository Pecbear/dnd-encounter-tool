import { useEffect, useState } from "react";
import { getAllCharacters } from "../utils/characterStorage";
import { enemies, type EnemyBlockKey } from "../data/enemies";
import type { EncounterPreviewUnit } from "../types/encounter";
import { InitiativePicker } from "../components/InitiativePicker";
import { loadEncounter, clearEncounter } from "../utils/encounterStorage";
import type { Player } from "../data/players";

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
  enemyName: string;
  theme: EnemyBlockKey;
  initiative: number;
};

function EncounterSetupScreen({
  onBack,
  onBeginEncounter,
}: EncounterSetupScreenProps) {
  const [selectedHeroes, setSelectedHeroes] = useState<SelectedHero[]>([]);
  const [selectedEnemies, setSelectedEnemies] = useState<SelectedEnemy[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);

  useEffect(() => {
  async function loadPlayers() {
    const storedPlayers = await getAllCharacters();
    setAvailablePlayers(storedPlayers);
    }

    loadPlayers();
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"hero" | "enemy" | null>(null);
  const [pendingHeroId, setPendingHeroId] = useState<string | null>(null);

  const savedEncounter = loadEncounter();
  const hasSavedEncounter = !!savedEncounter;

  const [selectedBlock, setSelectedBlock] =
    useState<EnemyBlockKey | null>(null);

  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  const [pendingEnemyName, setPendingEnemyName] =
    useState<string | null>(null);

  function handleResumeEncounter() {
    if (!savedEncounter) return;

    onBeginEncounter(savedEncounter.encounterUnits);
  }

  function handleAddHero(heroId: string) {
    if (selectedHeroes.some((h) => h.id === heroId)) return;

    setPendingHeroId(heroId);
    setModalType("hero");
    setModalOpen(true);
  }

  function handleRemoveHero(heroId: string) {
    setSelectedHeroes(selectedHeroes.filter((h) => h.id !== heroId));
  }

  function handleSelectBlock(block: EnemyBlockKey) {
    setSelectedBlock(block);
    setSelectedTier(null);
  }

  function handleSelectTier(tier: number) {
    setSelectedTier(tier);
  }

  function handleSelectEnemy(enemyName: string) {
    if (!selectedBlock || selectedTier === null) return;

    setPendingEnemyName(enemyName);
    setModalType("enemy");
    setModalOpen(true);
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
      setSelectedHeroes((prev) => [
        ...prev,
        {
          id: pendingHeroId,
          initiative,
        },
      ]);
    }

    if (
      modalType === "enemy" &&
      selectedBlock &&
      selectedTier !== null &&
      pendingEnemyName
    ) {
      setSelectedEnemies((prev) => [
        ...prev,
        {
          id: `enemy-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
          enemyName: pendingEnemyName,
          theme: selectedBlock,
          initiative,
        },
      ]);
    }

    // cleanup
    setModalOpen(false);
    setModalType(null);
    setPendingHeroId(null);
    setPendingEnemyName(null);
  }

  function getEnemyDisplayName(selectedEnemy: SelectedEnemy) {
    const matches = selectedEnemies.filter(
      (e) =>
        e.enemyName === selectedEnemy.enemyName &&
        e.theme === selectedEnemy.theme
    );

    const enemy = enemies.find(
      (e) =>
        e.name === selectedEnemy.enemyName &&
        e.themes.includes(selectedEnemy.theme)
    );

    if (!enemy) return selectedEnemy.enemyName;

    if (matches.length === 1) return enemy.name;

    const index = matches.findIndex((e) => e.id === selectedEnemy.id);
    const letter = String.fromCharCode(65 + index);

    return `${enemy.name} ${letter}`;
  }

  const sortedSelectedHeroes = [...selectedHeroes].sort((a, b) => {
    if (b.initiative !== a.initiative) {
      return b.initiative - a.initiative;
    }

    const aDex = availablePlayers.find((p) => p.id === a.id)?.dex ?? 0;
    const bDex = availablePlayers.find((p) => p.id === b.id)?.dex ?? 0;

    return bDex - aDex;
  });

  const sortedSelectedEnemies = [...selectedEnemies].sort((a, b) => {
    if (b.initiative !== a.initiative) {
      return b.initiative - a.initiative;
    }

    const aEnemy = enemies.find(
      (enemy) =>
        enemy.name === a.enemyName &&
        enemy.themes.includes(a.theme)
    );

    const bEnemy = enemies.find(
      (enemy) =>
        enemy.name === b.enemyName &&
        enemy.themes.includes(b.theme)
    );

    return (bEnemy?.dex ?? 0) - (aEnemy?.dex ?? 0);
  });

  const heroPreview: EncounterPreviewUnit[] = selectedHeroes.flatMap((h) => {
    const p = availablePlayers.find((p) => p.id === h.id);

    if (!p) return [];

    return [
      {
        id: h.id,
        name: p.name,
        initiative: h.initiative,
        str: p.str,
        dex: p.dex,
        con: p.con,
        int: p.int,
        wis: p.wis,
        cha: p.cha,
        side: "hero",
        maxHp: p.maxHp,
        currentHp: p.maxHp,
        ac: p.ac,
        statuses: [],
      },
    ];
  });

  const enemyPreview: EncounterPreviewUnit[] = selectedEnemies.flatMap((e) => {
    const enemy = enemies.find(
      (enemy) =>
        enemy.name === e.enemyName &&
        enemy.themes.includes(e.theme)
    );

    if (!enemy) return [];

    return [
      {
        id: e.id,
        name: getEnemyDisplayName(e),
        initiative: e.initiative,
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
      },
    ];
  });

  const encounterPreview = [...heroPreview, ...enemyPreview].sort((a, b) => {
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

  const availableEnemies =
    selectedBlock && selectedTier !== null
      ? enemies.filter(
          (enemy) =>
            enemy.tier === selectedTier &&
            enemy.themes.includes(selectedBlock)
        )
      : [];

  const availableTiers = selectedBlock
    ? [
        ...new Set(
          enemies
            .filter((enemy) => enemy.themes.includes(selectedBlock))
            .map((enemy) => enemy.tier)
        ),
      ].sort((a, b) => a - b)
    : [];

  const availableThemes = [
    ...new Set(enemies.flatMap((enemy) => enemy.themes)),
  ];

  return (
    <main>
      <h1>Encounter Setup</h1>

      <div className="encounter-grid">
        {/* LEFT */}
        <div className="panel">
          <h2>Available</h2>

          <div className="action-group">
            <div className="group-label">Heroes</div>

            {availablePlayers.map((p) => (
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
            <div className="group-label">Enemy Themes</div>

            {availableThemes.map((theme) => (
              <button
                key={theme}
                className="btn util"
                onClick={() => handleSelectBlock(theme)}
              >
                {theme}
              </button>
            ))}
          </div>

          {selectedBlock && (
            <div className="action-group">
              <div className="group-label">
                {selectedBlock} Tiers
              </div>

              {availableTiers.map((tier) => (
                <button
                  key={tier}
                  className="btn util"
                  onClick={() => handleSelectTier(tier)}
                >
                  Tier {tier}
                </button>
              ))}
            </div>
          )}

          {selectedBlock && selectedTier !== null && (
            <div className="action-group">
              <div className="group-label">
                Available Enemies
              </div>

              {availableEnemies.length === 0 ? (
                <p className="log">No enemies available.</p>
              ) : (
                availableEnemies.map((enemy) => (
                  <button
                    key={enemy.name}
                    className="btn util"
                    onClick={() => handleSelectEnemy(enemy.name)}
                  >
                    {enemy.name}
                  </button>
                ))
              )}
            </div>
          )}
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
                const p = availablePlayers.find((x) => x.id === h.id);

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
                const enemy = enemies.find(
                  (enemy) =>
                    enemy.name === e.enemyName &&
                    enemy.themes.includes(e.theme)
                );

                if (!enemy) return null;

                return (
                  <div key={e.id} className="unit-card">
                    <strong>{getEnemyDisplayName(e)}</strong>

                    <span>
                      Init {e.initiative} | HP {enemy.maxHp} | AC{" "}
                      {enemy.ac}
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

              {hasSavedEncounter && (
                <button
                  className="btn util"
                  onClick={handleResumeEncounter}
                >
                  Resume Encounter
                </button>
              )}

              <button
                className="btn primary"
                onClick={() => {
                  clearEncounter();
                  onBeginEncounter(encounterPreview);
                }}
                disabled={encounterPreview.length === 0}
              >
                Begin
              </button>

              <button className="btn util" onClick={onBack}>
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <InitiativePicker
          onSelect={(value) => {
            handleInitiativeConfirm(String(value));
          }}
          onCancel={() => {
            setModalOpen(false);
            setModalType(null);
            setPendingHeroId(null);
            setPendingEnemyName(null);
          }}
        />
      )}
    </main>
  );
}

export default EncounterSetupScreen;