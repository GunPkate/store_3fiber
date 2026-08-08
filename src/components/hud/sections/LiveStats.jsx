import { useState } from "react";
import { useUIStore } from "../../../service/state/uiState";

export function LiveStats({
    display,
    statOverview,
    statLive,
    statEmp,
    statEvent,
    setDisplay,
    setStatOverview,
    setStatLive,
    setStatEmp,
    setStatEvent,
    toggleStat,
    toggleAllStat
}){
    const hud = useUIStore((s) => s.hud);
    
    const [selectedView, setSelectedView] = useState("KeyC"); 
    const handleCameraChange = (e) => {
        const keyCode = e.target.value;
        setSelectedView(keyCode);

        // Dispatches keydown event so CameraRig.jsx picks it up automatically
        window.dispatchEvent(new KeyboardEvent('keydown', { code: keyCode }));
    };


    return (<>
        {/* HUD top-left */}
        <div className="panel" id="hud-tl">
        {!statOverview && !statLive && !statEmp && !statEvent && !display?
            <button onClick={()=>{toggleAllStat()}}>View All Stat</button>
        :   <button style={{marginBottom: "4px"}} onClick={()=>{toggleAllStat()}}>Hide All Stat</button>}

        {display ? <>
            <div className="ph">Display</div>

            <div className="er">
                <span> Camera </span>
                <select 
                    value={selectedView} 
                    onChange={handleCameraChange}
                    style={{ backgroundColor: "#1e1e1e"}}
                >
                    <option value="KeyC">Default Cam (C)</option>
                    {/* <option value="Digit1">1st Floor Store (1)</option> */}
                    <option className="er" value="Digit3">Drink (3)</option>
                    <option className="er" value="Digit4">Store (4)</option>
                    <option className="er" value="Digit5">Shelves (5)</option>
                    <option className="er" value="Digit2">2nd Floor Top-Down (2)</option>
                </select>
            </div>
        </> : <></>}

        {statOverview ?<>
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
        </> :<></> }
        
        {statLive ? <>
        <div className="ph" style={{ marginTop: 8 }}>
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
        </>:<></>}
        
        {statEmp? <>
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
        </>:<></>}

        {statEvent? <>
        <div className="ph" style={{ marginTop: 8 }}>
            Events
        </div>
        <div style={{ color: '#997', fontSize: 10, lineHeight: 1.7 }}>
            {hud.events.map((e, i) => (
            <div key={i}>{e}</div>
            ))}
        </div>
        </>:<></>}
        </div>
    </>)
}