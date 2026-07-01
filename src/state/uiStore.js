import { create } from 'zustand';
import { GameEngine } from '../engine/GameEngine.js';

// One GameEngine instance lives for the lifetime of the app.
export const engine = new GameEngine();

export const useUiStore = create((set) => ({
  // ── tool / selection state ──────────────────────────────
  currentTool: 'none', // none | add-wp | del-wp | link-wp | spawn-c | spawn-e | rm-npc
  setTool: (tool) => {
    if (['add-wp', 'del-wp', 'link-wp'].includes(tool)) {
      engine.CFG.showWP = true;
      set({ showWP: true });
    }
    if (tool === 'link-wp') set({ linkingWP: null });
    set({ currentTool: tool });
  },

  selectedWP: null,
  setSelectedWP: (n) => set({ selectedWP: n }),
  linkingWP: null,
  setLinkingWP: (n) => set({ linkingWP: n }),

  hoveredNpc: null, // { id, type, text } or null
  pointerPos: { x: 0, y: 0 },
  setHoveredNpc: (hoveredNpc, pointerPos) =>
    set(pointerPos ? { hoveredNpc, pointerPos } : { hoveredNpc }),

  // ── waypoint visibility / path visibility ───────────────
  showWP: false,
  toggleShowWP: () => {
    const v = !engine.CFG.showWP;
    engine.CFG.showWP = v;
    set({ showWP: v });
  },
  showPaths: true,

  // ── settings modal ───────────────────────────────────────
  settingsOpen: false,
  setSettingsOpen: (v) => set({ settingsOpen: v }),
  applySettings: ({ customerLimit, spawnInterval, showPaths, fov }) => {
    engine.CFG.customerLimit = customerLimit;
    engine.CFG.spawnInterval = spawnInterval;
    engine.CFG.showPaths = showPaths;
    set({ showPaths });
    if (fov) set({ fov });
    set({ settingsOpen: false });
  },
  fov: 55,

  // ── time speed ───────────────────────────────────────────
  timeSpeed: 1,
  setTimeSpeed: (s) => {
    engine.CFG.timeSpeed = s;
    set({ timeSpeed: s });
  },

  // ── waypoint graph version (bump to force re-render of WP visuals) ──
  wpVersion: 0,
  bumpWpVersion: () => set((s) => ({ wpVersion: s.wpVersion + 1 })),

  // ── npc list version (bump on spawn/remove) ─────────────
  npcVersion: 0,
  bumpNpcVersion: () => set((s) => ({ npcVersion: s.npcVersion + 1 })),

  // ── HUD snapshot, refreshed at ~10Hz from the render loop ──
  hud: engine.getSnapshot(),
  refreshHud: () => set({ hud: engine.getSnapshot() }),
}));

// Wire engine pub/sub -> zustand version bumps once, at module load.
engine.onNpcsChange(() => useUiStore.getState().bumpNpcVersion());
engine.onGraphChange(() => useUiStore.getState().bumpWpVersion());
