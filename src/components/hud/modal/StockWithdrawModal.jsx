import { useMemo, useState } from "react";
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

    const COLUMNS = [
      { key: "itemName", label: "Product" },
      { key: "qty", label: "Qty" },
      { key: "empName", label: "Name" },
      { key: "date", label: "Date" },
    ];
    const PAGE_SIZE = 8;
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState("date");
    const [sortDir, setSortDir] = useState("desc");
    const [page, setPage] = useState(1);
  
    const filtered = useMemo(() => {
      const list = withdrawItems || [];
      const q = search.trim().toLowerCase();
      if (!q) return list;
      return list.filter(
        (item) =>
          String(item.itemName).toLowerCase().includes(q) ||
          String(item.empName).toLowerCase().includes(q) ||
          String(item.date).toLowerCase().includes(q)
      );
    }, [withdrawItems, search]);
  
    const sorted = useMemo(() => {
      const list = [...filtered];
      list.sort((a, b) => {
        let av = a[sortKey];
        let bv = b[sortKey];
        if (typeof av === "number" && typeof bv === "number") {
          return sortDir === "asc" ? av - bv : bv - av;
        }
        av = String(av ?? "").toLowerCase();
        bv = String(bv ?? "").toLowerCase();
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
      return list;
    }, [filtered, sortKey, sortDir]);
  
    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageItems = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  
    function toggleSort(key) {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
      setPage(1);
    }
  
    function handleSearch(e) {
      setSearch(e.target.value);
      setPage(1);
    }
  
    const sortIcon = (key) => (sortKey !== key ? "↕" : sortDir === "asc" ? "↑" : "↓");


    return(<>
        <div id="storage-modal" className="open">
          <div id="storage-box">
            <h2 className="mb-4 text-sm tracking-wide text-[#88aaff]">⚙️ Stock Withdraw</h2>

            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search product, employee, or date..."
              className="mb-3 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/40 focus:border-[#4466dd] sm:text-sm"
            />

           
            <div className="flex-1 overflow-x-auto overflow-y-auto rounded-md border border-white/10">
              <table className="w-full min-w-[480px] min-h-[450px] border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr>
                    {COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => toggleSort(col.key)}
                        className="sticky top-0 z-10 cursor-pointer select-none whitespace-nowrap bg-white/5 px-2 py-2 font-semibold text-[#88aaff] hover:bg-white/10 sm:px-3"
                      >
                        {col.label} <span className="text-[10px] opacity-70">{sortIcon(col.key)}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length > 0 ? (
                    pageItems.map((item, i) => (
                      <tr key={item.id ?? `${item.itemName}-${item.date}-${i}`} className="hover:bg-white/5">
                        <td className="border-b border-white/5 px-2 py-2 font-medium text-white sm:px-3">
                          {item.itemName}
                        </td>
                        <td className="border-b border-white/5 px-2 py-2 font-mono opacity-90 sm:px-3">
                          {item.qty}
                        </td>
                        <td className="border-b border-white/5 px-2 py-2 font-medium text-white sm:px-3">
                          {item.empName}
                        </td>
                        <td className="whitespace-nowrap border-b border-white/5 px-2 py-2 sm:px-3">
                          {item.date}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center opacity-60">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        
          <div className="mt-3 flex flex-col items-center justify-between gap-2 text-xs opacity-80 sm:flex-row">
            <span>
              {sorted.length === 0
                ? "0 results"
                : `Showing ${(safePage - 1) * PAGE_SIZE + 1}-${Math.min(
                    safePage * PAGE_SIZE,
                    sorted.length
                  )} of ${sorted.length}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="rounded-md border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Prev
              </button>
              <span>
                Page {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="rounded-md border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
  
          <button
            id="storage-close"
            onClick={() => setOpenWithdraw(false)}
            className="mt-4 w-full rounded-lg border border-[#556] bg-[#334] px-2 py-2 text-xs text-white hover:bg-[#445]"
          >
            Close
          </button>
          </div>
        </div>
    </>)
}