import { useState } from 'react';
import { simulationEngine, useUIStore } from '../../service/state/uiState';
import './HUD.css'

const SPEEDS = [ 0, 1, 1.5, 2, 2.5, 3, 5];

const TOOLS = [
  { tool: 'none', label: '🎥 View' },
  { tool: 'add-wp', label: '➕ Waypoint' },
  { tool: 'del-wp', label: '❌ Del WP' },
  { tool: 'link-wp', label: '🔗 Link WP' },
];

const SPAWN_TOOLS = [
  { tool: 'spawn-c', label: '👤 Spawn Customer' },
  { tool: 'spawn-e', label: '👷 Spawn Employee' },
  { tool: 'rm-npc', label: '🗑 Remove NPC' },
];

const WP_TYPES = ['generic', 'shelf', 'pos', 'atm', 'exit', 'spawn', 'break', 'stock', 'waiting'];

export default function HUD() {
  const hud = useUIStore((s) => s.hud);
  const currentTool = useUIStore((s) => s.currentTool);
  const setTool = useUIStore((s) => s.setTool);
  const showWP = useUIStore((s) => s.showWP);
  const toggleShowWP = useUIStore((s) => s.toggleShowWP);
  const timeSpeed = useUIStore((s) => s.timeSpeed);
  const setTimeSpeed = useUIStore((s) => s.setTimeSpeed);
  const settingsOpen = useUIStore((s) => s.settingsOpen);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const applySettings = useUIStore((s) => s.applySettings);
  const selectedWP = useUIStore((s) => s.selectedWP);
  const setSelectedWP = useUIStore((s) => s.setSelectedWP);
  const setLinkingWP = useUIStore((s) => s.setLinkingWP);
  const hoveredNpc = useUIStore((s) => s.hoveredNpc);
  const pointerPos = useUIStore((s) => s.pointerPos);
  const fov = useUIStore((s) => s.fov);

  const [cfgLimit, setCfgLimit] = useState(simulationEngine.CFG.customerLimit);
  const [cfgSpawn, setCfgSpawn] = useState(simulationEngine.CFG.spawnInterval);
  const [cfgShowPaths, setCfgShowPaths] = useState(simulationEngine.CFG.showPaths);
  const [cfgFov, setCfgFov] = useState(fov);

  return (
    <>
      {/* Clock bar */}
      <div id="clockbar">
        <span id="clk-day">Day {hud.day}</span>
        <span id="clk">{hud.clock}</span>
        <span id="shift-lbl">{hud.shift}</span>
        <span style={{ color: 'rgba(255,255,255,.2)' }}>|</span>
        {SPEEDS.map((s) => (
          <button key={s} className={`spd${timeSpeed === s ? ' on' : ''}`} onClick={() => setTimeSpeed(s)}>
            {s}×
          </button>
        ))}
      </div>

      {/* HUD top-left */}
      <div className="panel" id="hud-tl">
        <div className="ph">Store Overview</div>
        <div className="er">
          <span>💰 Revenue</span>
          <span className="sc">${hud.revenue.toFixed(2)}</span>
        </div>
        <div className="er">
          <span>👥 In Store</span>
          <span className="rc">{hud.custCount}</span>
        </div>
        <div className="er">
          <span>🏧 At POS</span>
          <span className="tc">{hud.posCount}</span>
        </div>
        <div className="er">
          <span>✅ Served</span>
          <span className="sc">{hud.served}</span>
        </div>
        <div className="er">
          <span>📦 Stock</span>
          <span className="tc">{hud.stockPct}%</span>
        </div>
        <div className="ph" style={{ marginTop: 8 }}>
          Employees
        </div>
        <div>
          {hud.employees.length ? (
            hud.employees.map((e) => (
              <div className="er" key={e.id}>
                <span className="rc">{e.role.substring(0, 8)}</span>
                <span className="tc">{e.task.substring(0, 10)}</span>
                <span className="sc">{e.state}</span>
              </div>
            ))
          ) : (
            <div style={{ color: '#555', fontSize: 10 }}>None</div>
          )}
        </div>
        <div className="ph" style={{ marginTop: 8 }}>
          Events
        </div>
        <div style={{ color: '#997', fontSize: 10, lineHeight: 1.7 }}>
          {hud.events.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
      </div>

      {/* HUD top-right */}
      <div className="panel" id="hud-tr">
        <div className="ph">Live Stats</div>
        <div className="er">
          <span>Limit</span>
          <span className="tc">
            {hud.custCount}/{hud.customerLimit}
          </span>
        </div>
        <div className="er">
          <span>Avg wait</span>
          <span className="rc">{hud.avgWait}s</span>
        </div>
        <div className="er">
          <span>Day</span>
          <span className="sc">{hud.day}</span>
        </div>
        <div className="er">
          <span>Shift</span>
          <span className="tc">{hud.shift}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div id="toolbar">
        {TOOLS.map((t) => (
          <button key={t.tool} className={`tb${currentTool === t.tool ? ' on' : ''}`} onClick={() => setTool(t.tool)}>
            {t.label}
          </button>
        ))}
        <button className="tb" onClick={toggleShowWP}>
          {showWP ? '👁 Hide WP' : '👁 Show WP'}
        </button>
        {SPAWN_TOOLS.map((t) => (
          <button key={t.tool} className={`tb${currentTool === t.tool ? ' on' : ''}`} onClick={() => setTool(t.tool)}>
            {t.label}
          </button>
        ))}
        <button className="tb" onClick={() => setSettingsOpen(true)}>
          ⚙️ Settings
        </button>
      </div>

      {/* WP side panel */}
      {selectedWP && (
        <div className="panel" id="wp-panel" style={{ display: 'block' }}>
          <div className="ph">Waypoint</div>
          <div id="wp-info" style={{ fontSize: 10, color: '#888', marginBottom: 6, whiteSpace: 'pre-line' }}>
            {`Type: ${selectedWP.type}\nEdges: ${selectedWP.edges.length}\nPos: ${selectedWP.x.toFixed(1)},${selectedWP.z.toFixed(1)}`}
          </div>
          <button
            onClick={() => {
              setLinkingWP(selectedWP);
              setTool('link-wp');
            }}
          >
            🔗 Link
          </button>
          <button
            onClick={() => {
              const t = prompt(`Type (${WP_TYPES.join(',')})`, selectedWP.type);
              if (t && WP_TYPES.includes(t)) {
                simulationEngine.setWaypointType(selectedWP.id, t);
                setSelectedWP({ ...selectedWP, type: t });
              }
            }}
          >
            🏷 Set Type
          </button>
          <button
            onClick={() => {
              simulationEngine.removeWaypoint(selectedWP.id);
              setSelectedWP(null);
            }}
          >
            ❌ Delete
          </button>
        </div>
      )}

      {/* Settings modal */}
      {settingsOpen && (
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
      )}

      {/* Tooltip */}
      {hoveredNpc && (
        <div id="tip" style={{ display: 'block', left: pointerPos.x + 14, top: pointerPos.y - 10 }}>
          {hoveredNpc.lines.map((l, i) => (
            <div key={i}>
              {i === 0 ? <b>{l}</b> : l}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

