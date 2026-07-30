export function SettingModal({
    cfgLimit,
    setCfgLimit,
    cfgSpawn,
    setCfgSpawn,
    cfgShowPaths,
    setCfgShowPaths,
    cfgFov,
    setCfgFov,
    applySettings
}){
    return(<>
        <div id="settings-modal" className="open">
          <div id="settings-box">
            <h2>⚙️ Settings</h2>
            <div className="sf">
              <label>Customer Limit</label>
              <input
                type="number"
                min={1}
                max={200}
                value={cfgLimit}
                onChange={(e) => setCfgLimit(parseInt(e.target.value) || 50)}
              />
            </div>
            <div className="sf">
              <label>Spawn Interval (game-sec)</label>
              <input
                type="number"
                min={5}
                max={120}
                value={cfgSpawn}
                onChange={(e) => setCfgSpawn(parseInt(e.target.value) || 15)}
              />
            </div>
            <div className="sf">
              <label>Show NPC Paths</label>
              <input type="checkbox" checked={cfgShowPaths} onChange={(e) => setCfgShowPaths(e.target.checked)} />
            </div>
            <div className="sf">
              <label>Camera FOV</label>
              <input
                type="range"
                min={30}
                max={90}
                value={cfgFov}
                onChange={(e) => setCfgFov(parseInt(e.target.value))}
              />
            </div>
            <button
              id="settings-close"
              onClick={() =>
                applySettings({
                  customerLimit: cfgLimit,
                  spawnInterval: cfgSpawn,
                  showPaths: cfgShowPaths,
                  fov: cfgFov,
                })
              }
            >
              Close
            </button>
          </div>
        </div>
    </>)
}