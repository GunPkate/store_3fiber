import { OBJECT_3D } from "../../../config/storeLayout/storeLayoutLv1";

export function ManageShelvesModal({
    cfgLimit,
    setCfgLimit,
    cfgSpawn,
    setCfgSpawn,
    cfgShowPaths,
    setCfgShowPaths,
    cfgFov,
    setCfgFov,
    applySettings,
    setOpenManageShelves
}){
    const shelfObs = OBJECT_3D.filter((o) => o.label.startsWith('Shelf'));
    
    return(<>
        <div id="manage-shelves-modal" className="open">
          <div id="manage-shelves-box">
            <h2>⚙️ Manage Shelves</h2>

            {shelfObs ? shelfObs.map( (shelfOb,i) => {
              return <>
                <div key={i} className="sf">
                  <label>
                    { shelfOb.label }
                  </label> 
                  {/* <input
                    type="number"
                    min={1}
                    max={200}
                    value={cfgLimit}
                    onChange={(e) => setCfgLimit(parseInt(e.target.value) || 50)}
                    /> */}
                </div>
              </>
            })
            :<></>}
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
              id="manage-shelves-close"
              onClick={() =>
                {
                  applySettings({
                    customerLimit: cfgLimit,
                    spawnInterval: cfgSpawn,
                    showPaths: cfgShowPaths,
                    fov: cfgFov,
                  })
                  setOpenManageShelves(false)
                }
              }
            >
              Close
            </button>
          </div>
        </div>
    </>)
}