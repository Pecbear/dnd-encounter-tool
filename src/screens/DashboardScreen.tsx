import { loadEncounter } from "../utils/encounterStorage";
import {
  createBackup,
  downloadBackup,
  restoreBackup
} from "../utils/backupStorage";

type DashboardScreenProps = {
  onStartEncounter: () => void;
  onResumeEncounter: () => void;
  onOpenPlayers: () => void;
  onOpenEnemies: () => void;
};

function DashboardScreen({
  onStartEncounter,
  onResumeEncounter,
  onOpenEnemies,
  onOpenPlayers,
}: DashboardScreenProps) {
  const savedEncounter = loadEncounter();

  const hasActiveEncounter =
    Array.isArray(savedEncounter?.encounterUnits) &&
    savedEncounter.encounterUnits.length > 0;

  async function handleBackup() {
    try {
      const backup = await createBackup();
      downloadBackup(backup);

      alert("Backup created successfully.");
    } catch (error) {
      console.error("Failed to create backup:", error);
      alert("Failed to create backup.");
    }
  }

  async function handleRestore(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      if (backup.backupType !== "dnd-encounter-tool") {
        throw new Error("Invalid backup file.");
      }

      await restoreBackup(backup);

      alert("Backup restored successfully. Reloading the app...");

      window.location.reload();
    } catch (error) {
      console.error("Failed to restore backup:", error);
      alert("Failed to restore backup. Make sure this is a valid backup file.");
    }

    event.target.value = "";
  }

  return (
    <main className="encounter-root">
      <h1 className="title">DM Encounter Tool</h1>

      <div className="encounter-grid">
        {/* LEFT PANEL */}
        <div className="panel">
          <h2>Navigation</h2>

          <div className="action-group">
            <div className="group-label">Core</div>

            <button className="btn primary" onClick={onStartEncounter}>
              Start Encounter
            </button>
          </div>

          <div className="action-group">
            <div className="group-label">Management</div>

            <button
            className="btn util"
            onClick={onOpenPlayers}>
              Players
            </button>

            <button
            className="btn util"
            onClick={onOpenEnemies}>
              Enemies
            </button>

            <button className="btn util">History</button>

            <>
              <button className="btn util" onClick={handleBackup}>
                Backup
              </button>

              <label className="btn util">
                Restore Backup
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleRestore}
                  style={{ display: "none"}}
                  />
              </label>
            </>
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="panel">
          <h2>Overview</h2>

          <p className="log">
            Welcome to the DM Encounter Tool. Manage players, enemies, check
            history, or start/resume encounters.
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="panel">
          <h2>Status</h2>
          {hasActiveEncounter ? (
            <>
              <p className="log">Active Encounter Detected.</p>

              <button className="btn primary" onClick={onResumeEncounter}>
                Resume Encounter
              </button>
            </>
          ) : (
            <p className="log"> No Active Encounter.</p>
          )}
        </div>
      </div>
    </main>
  );
}

export default DashboardScreen;
