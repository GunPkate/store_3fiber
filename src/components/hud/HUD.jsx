import { useState } from 'react';
import { simulationEngine, useUIStore } from '../../service/state/uiState';
import './HUD.css'
import { row_menu, glass_bg, glass_text, toolbar_wrap, toolbar_row, icon_btn, icon_btn_active, center_btn } from '../../config/uimenu/uimenu';
import { ClockBar } from './sections/ClockBar';
import { LiveStats } from './sections/LiveStats';
import { SettingModal } from './modal/SettingModal';
import { ManageShelvesModal } from './modal/ManageShelvesModal';
import { StorageModal } from './modal/StorageModal';
import { StockWithdrawModal } from './modal/StockWithdrawModal';

const TOOLS = [
  // { tool: 'none', label: '🎥 View' },
  // { tool: 'add-wp', label: '➕ Waypoint' },
  // { tool: 'del-wp', label: '❌ Del WP' },
  // { tool: 'link-wp', label: '🔗 Link WP' },

  { tool: 'overview', icon:'🎥', label: 'Overview' },
  { tool: 'live', icon:'📈', label: 'Live' },
  { tool: 'emp', icon:'👥', label: 'Employees' },
  { tool: 'event', icon:'📰', label: 'Events' },
  // { tool: 'add-wp', icon:'➕', label: 'Order' },
  // { tool: 'del-wp', icon:'📦', label: 'Stock' },
  // { tool: 'link-wp', icon:'👥', label: 'Staffs' },
];

// const SPAWN_TOOLS = [
//   { tool: 'spawn-c', icon: '👤', label: 'Spawn Customer' },
//   { tool: 'spawn-e', icon: '👷', label: 'Spawn Employee' },
//   { tool: 'rm-npc', icon: '🗑', label: 'Remove NPC' },
// ];

// Row 2 — anything that opens a modal.
const MODAL_TOOLS = [
  { key: 'settings', icon: '⚙️', label: 'Settings' },
  { key: 'storage', icon: '📦', label: 'Storage' },
  { key: 'withdraw', icon: '📤', label: 'Withdraw' },
  { key: 'manage-shelves', icon: '🗂', label: 'Manage Shelves' },
];

const WP_TYPES = ['generic', 'shelf', 'pos', 'atm', 'exit', 'spawn', 'break', 'stock', 'waiting'];

export default function HUD() {
  const currentTool = useUIStore((s) => s.currentTool);
  const setTool = useUIStore((s) => s.setTool);
  const showWP = useUIStore((s) => s.showWP);
  const toggleShowWP = useUIStore((s) => s.toggleShowWP);

  const settingsOpen = useUIStore((s) => s.settingsOpen);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const applySettings = useUIStore((s) => s.applySettings);
  const selectedWP = useUIStore((s) => s.selectedWP);
  const setSelectedWP = useUIStore((s) => s.setSelectedWP);
  const setLinkingWP = useUIStore((s) => s.setLinkingWP);
  const hoveredNpc = useUIStore((s) => s.hoveredNpc);
  const pointerPos = useUIStore((s) => s.pointerPos);
  const fov = useUIStore((s) => s.fov);

  const [statOverview, setStatOverview] = useState(false);
  const [statLive, setStatLive] = useState(false);
  const [statEmp, setStatEmp] = useState(false);
  const [statEvent, setStatEvent] = useState(false);
  const [cfgLimit, setCfgLimit] = useState(simulationEngine.CFG.customerLimit);
  const [cfgSpawn, setCfgSpawn] = useState(simulationEngine.CFG.spawnInterval);
  const [cfgShowPaths, setCfgShowPaths] = useState(simulationEngine.CFG.showPaths);
  const [cfgFov, setCfgFov] = useState(fov);

  const [openManageShelves,setOpenManageShelves] = useState(false)
  const [openStorage,setOpenStorage] = useState(false)
  const [openWithdraw,setOpenWithdraw] = useState(false)

  function toggleStat(getBtn){
    if(getBtn == 'overview'){
      setStatOverview(!statOverview)
    }else if(getBtn == 'live'){
      setStatLive(!statLive)
    }else if(getBtn == 'emp'){
      setStatEmp(!statEmp)
    }else if(getBtn == 'event'){
      setStatEvent(!statEvent)
    }
  }

  function toggleAllStat(){
    if(!statOverview && !statLive && !statEmp && !statEvent){
      setStatOverview(true)
      setStatLive(true)
      setStatEmp(true)
      setStatEvent(true)
    }else{
      setStatOverview(false)
      setStatLive(false)
      setStatEmp(false)
      setStatEvent(false)
    }
  }

  return (
    <>
      <ClockBar/>
      <LiveStats 
        statOverview = {statOverview}
        statLive = {statLive}
        statEmp = {statEmp}
        statEvent = {statEvent}
        setStatOverview = {setStatOverview}
        setStatLive = {setStatLive}
        setStatEmp = {setStatEmp}
        setStatEvent = {setStatEvent}
        toggleStat = {toggleStat}
        toggleAllStat = {toggleAllStat}
      />

      {/* Toolbar: row 1 = toggles, row 2 = modals */}
      <div id="toolbar" className={toolbar_wrap+glass_bg}>
        {/* Row 1 — toggle UI (stat panels, waypoint overlay, spawn/remove tools) */}
        <div className={toolbar_row}>
          {TOOLS.map((t) => {
            const statKey = { overview: statOverview, live: statLive, emp: statEmp, event: statEvent }[t.tool];
            return (<div className={center_btn}>
              <button
                key={t.tool}
                title={t.label}
                aria-label={t.label}
                className={`${icon_btn}${statKey ? ` ${icon_btn_active}` : ''}`}
                onClick={() => toggleStat(t.tool)}
                >
                {t.icon}
              </button>
              <label className='d-flex flex justify-center'>
                {t.label}
              </label>
            </div>);
          })}
          {/* <button
            title={showWP ? 'Hide Waypoints' : 'Show Waypoints'}
            aria-label={showWP ? 'Hide Waypoints' : 'Show Waypoints'}
            className={`${icon_btn}${showWP ? ` ${icon_btn_active}` : ''}`}
            onClick={toggleShowWP}
          >
            👁
          </button> */}
          {/* {SPAWN_TOOLS.map((t) => (
            <button
              key={t.tool}
              title={t.label}
              aria-label={t.label}
              className={`${icon_btn}${currentTool === t.tool ? ` ${icon_btn_active}` : ''}`}
              onClick={() => setTool(t.tool)}
            >
              {t.icon}
            </button>
          ))} */}
        </div>

        {/* Row 2 — modal launchers */}
        <div className={toolbar_row}>
          {/* <div className='d-flex'>
            <button
              title="Settings"
              aria-label="Settings"
              className={`${icon_btn}${settingsOpen ? ` ${icon_btn_active}` : ''}`}
              onClick={() => setSettingsOpen(true)}
              >
              ⚙️
            </button>
 
          </div> */}

          <div className={center_btn}>
            <button
              title="Storage"
              aria-label="Storage"
              className={`${icon_btn}${openStorage ? ` ${icon_btn_active}` : ''}`}
              onClick={() => setOpenStorage(!openStorage)}
              >
              📦
            </button>
            <label>Storage</label>
          </div>

          <div className={center_btn}>
            <button
              title="Withdraw"
              aria-label="Withdraw"
              className={`${icon_btn}${openWithdraw ? ` ${icon_btn_active}` : ''}`}
              onClick={() => setOpenWithdraw(!openWithdraw)}
              >
              📤
            </button>
            <label>Withdraw</label>
          </div>

          {/* <div className='d-flex'>
            <button
              title="Manage Shelves"
              aria-label="Manage Shelves"
              className={`${icon_btn}${openManageShelves ? ` ${icon_btn_active}` : ''}`}
              onClick={() => setOpenManageShelves(!openManageShelves)}
              >
              🗂
            </button>
          </div> */}
        </div>
      </div>

      {/* WP side panel */}
      {selectedWP && (
        <div className="panel" id="wp-panel" style={{ display: 'block' }}>
          <div className="ph">Waypoint</div>
          <div id="wp-info" style={{ fontSize: 10, color: '#888', marginBottom: 6, whiteSpace: 'pre-line' }}>
            {`Type: ${selectedWP.type}\nEdges: ${selectedWP.edges.length}\nPos: ${selectedWP.x.toFixed(2)},${selectedWP.z.toFixed(2)}`}
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
        <SettingModal
          cfgLimit ={cfgLimit}
          setCfgLimit ={setCfgLimit}
          cfgSpawn ={cfgSpawn}
          setCfgSpawn ={setCfgSpawn}
          cfgShowPaths ={cfgShowPaths}
          setCfgShowPaths ={setCfgShowPaths}
          cfgFov ={cfgFov}
          setCfgFov ={setCfgFov}
          applySettings ={applySettings}
        />
      )}

      {openManageShelves  ?
        <ManageShelvesModal
          cfgLimit ={cfgLimit}
          setCfgLimit ={setCfgLimit}
          cfgSpawn ={cfgSpawn}
          setCfgSpawn ={setCfgSpawn}
          cfgShowPaths ={cfgShowPaths}
          setCfgShowPaths ={setCfgShowPaths}
          cfgFov ={cfgFov}
          setCfgFov ={setCfgFov}
          applySettings ={applySettings}
          setOpenManageShelves ={setOpenManageShelves}
        />:<></>
      }

      {openWithdraw  ?
        <StockWithdrawModal
          cfgLimit ={cfgLimit}
          setCfgLimit ={setCfgLimit}
          cfgSpawn ={cfgSpawn}
          setCfgSpawn ={setCfgSpawn}
          cfgShowPaths ={cfgShowPaths}
          setCfgShowPaths ={setCfgShowPaths}
          cfgFov ={cfgFov}
          setCfgFov ={setCfgFov}
          applySettings ={applySettings}
          setOpenWithdraw ={setOpenWithdraw}
        />:<></>
      }

      {openStorage  ?
        <StorageModal
          cfgLimit ={cfgLimit}
          setCfgLimit ={setCfgLimit}
          cfgSpawn ={cfgSpawn}
          setCfgSpawn ={setCfgSpawn}
          cfgShowPaths ={cfgShowPaths}
          setCfgShowPaths ={setCfgShowPaths}
          cfgFov ={cfgFov}
          setCfgFov ={setCfgFov}
          applySettings ={applySettings}
          setOpenStorage ={setOpenStorage}
        />:<></>
      }

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