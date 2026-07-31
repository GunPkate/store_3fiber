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
    const withdrawItems = simulationEngine.stockWithdraw;

    const fridgeWithdraws = storeItems.filter( item => item.type == "fridge")
    const shelfWithdraws = storeItems.filter( item => item.type == "shelf")


    console.log("modal shelfItems",shelfItems)
    console.log("modal withdrawItems",withdrawItems)
    return(<>
        <div id="storage-modal" className="open">
          <div id="storage-box">
            <h2>⚙️ Manage storage</h2>

            <table>
              <tr>
                <th>Product</th>
                <th>Storage</th>
                <th>Shelves</th>
                <th>Withdraw</th>
              </tr>
              <tbody>
              {shelfWithdraws && shelfWithdraws.length > 0 ? ( shelfWithdraws.map((storeItem, i) => {
                  const shelfItem = shelfItems?.[i];
                  const withdrawItem = 
                    withdrawItems?.filter(x => x.id == i)
                      .reduce((accumulator, currentItem) => {
                          return accumulator + currentItem.qty;
                        }, 0)
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
                          <td>
                            <span className="item-qty">
                              {withdrawItem ? `${withdrawItem} ` : 0}
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

              {fridgeWithdraws && fridgeWithdraws.length > 0 ? ( fridgeWithdraws.map((storeItem, i) => {
                  const shelfItem = shelfItems?.[i];
                  const withdrawItem = 
                    withdrawItems?.filter(x => x.fridgeId == i)
                      .reduce((accumulator, currentItem) => {
                          return accumulator + currentItem.qty;
                        }, 0)
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
                          <td>
                            <span className="item-qty">
                              {withdrawItem ? `${withdrawItem} ` : 0}
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