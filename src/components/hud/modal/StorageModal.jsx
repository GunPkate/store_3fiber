import { OBJECT_3D } from "../../../config/storeLayout/storeLayoutLv1";
import { simulationEngine, useUIStore } from "../../../service/state/uiState";


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
    setOpenStorage
}){
    const hud = useUIStore((s) => s.hud);
    const storeItems = simulationEngine.storageItems;
    const shelfItems = simulationEngine.items;
    console.log("storeItems",storeItems)
    return(<>
        <div id="storage-modal" className="open">
          <div id="storage-box">
            <h2>⚙️ Manage storage</h2>

            <table>
              <tr>
                <th>Product</th>
                <th>Storage</th>
                <th>Shelves</th>
              </tr>
              <tbody>
              {storeItems && storeItems.length > 0 ? ( storeItems.map((storeItem, i) => {
                  const shelfItem = shelfItems?.[i];
                  return (
                        <tr key={storeItem.id || i}>
                          <td>
                            <span className="item-name">{storeItem.name}</span>
                          </td>
                          <td>
                            <span className="item-qty">
                              {storeItem.qty} / {storeItem.maxQty}
                            </span>
                          </td>
                          <td>
                            <span className="item-qty">
                              {shelfItem ? `${shelfItem.qty} / ${shelfItem.maxQty}` : "N/A"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center", opacity: 0.6 }}>
                        No items found
                      </td>
                    </tr>
                  )
              }
              </tbody>
            </table>
            <button
              id="storage-close"
              onClick={() =>
                {
                  setOpenStorage(false)
                }
              }
            >
              Close
            </button>
          </div>
        </div>
    </>)
}