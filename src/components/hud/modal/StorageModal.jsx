import { OBJECT_3D } from "../../../config/storeLayout/storeLayoutLv1";

export function StorageModal({
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
    const shelfObs = OBJECT_3D.filter((o) => o.objType.startsWith('Shelf'));
    
    return(<>
        <div id="storage-modal" className="open">
          <div id="storage-box">
            <h2>⚙️ Manage storage</h2>

            {shelfObs ? shelfObs.map( (shelfOb,i) => {
              return <>
                <div key={i} className="sf">
                  <label>
                    { shelfOb.objType }
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
              id="storage-close"
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