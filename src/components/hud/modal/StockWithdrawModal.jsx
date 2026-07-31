import { OBJECT_3D } from "../../../config/storeLayout/storeLayoutLv1";
import { simulationEngine, useUIStore } from "../../../service/state/uiState";


export function StockWithdrawModal({
    cfgLimit,
    setCfgLimit,
    cfgSpawn,
    setCfgSpawn,
    cfgShowPaths,
    setCfgShowPaths,
    cfgFov,
    setCfgFov,
    applySettings,
    setOpenWithdraw
}){
    const hud = useUIStore((s) => s.hud);
    const withdrawItems = simulationEngine.stockWithdraw;

    return(<>
        <div id="storage-modal" className="open">
          <div id="storage-box">
            <h2>⚙️ Stock Withdraw</h2>

            <table>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Name</th>
                <th>Date</th>
              </tr>
              <tbody>
              {withdrawItems && withdrawItems.length > 0 ? ( withdrawItems.map((item, i) => {
                  return (
                        <tr key={item.id || i}>
                          <td>
                            <span className="item-name">{item.itemName}</span>
                          </td>
                          <td>
                            <span className="item-qty">
                              {item.qty}
                            </span>
                          </td>
                          <td>
                            <span className="item-name">
                             {item.empName}
                            </span>
                          </td>
                          <td>
                            <span className="item-name">
                             {item.date}
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
                  setOpenWithdraw(false)
                }
              }
            >
              Close
            </button>
          </div>
        </div>
    </>)
}