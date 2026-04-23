type DashboardScreenProps = {
  onStartEncounter: () => void;
};

function DashboardScreen({ onStartEncounter }: DashboardScreenProps) {
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

            <button className="btn util">Players</button>
            <button className="btn util">Enemies</button>
            <button className="btn util">History</button>
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="panel">
          <h2>Overview</h2>

          <p className="log">
            Welcome to the DM dashboard. Start an encounter or manage the
            data.
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="panel">
          <h2>Status</h2>

          <p className="log">No active encounter.</p>
        </div>
      </div>
    </main>
  );
}

export default DashboardScreen;
