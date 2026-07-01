import { create } from "zustand";
import { SimulationEngine } from "../engine/simulationEngine";

export const simulationEngine = new SimulationEngine()

export const useUIStore = create( (set) => ({
    timeSpeed: 1,
    setTimeSpeed: (s) => {
        simulationEngine.CFG.timeSpeed = s;
        set({ timeSpeed: s });
    },

    hud: simulationEngine.getSnapshot(),
    refreshHud: () => set({ hud: simulationEngine.getSnapshot() }),
}))