import { useUIStore } from "../../../service/state/uiState";

export function ClockBar(){
    const SPEEDS = [ 0, 1, 2, 3, 5, 8];
    const hud = useUIStore((s) => s.hud);
    const timeSpeed = useUIStore((s) => s.timeSpeed);
    const setTimeSpeed = useUIStore((s) => s.setTimeSpeed);

    return (<>
        <div id="clockbar">
        <span id="clk-day">Day {hud.day}</span>
        <span id="clk">{hud.clock}</span>
        <span id="shift-lbl">{hud.shift}</span>
        <span style={{ color: 'rgba(255,255,255,.2)' }}>|</span>
            {SPEEDS.map((s) => (
            <button key={s} className={`spd${timeSpeed === s ? ' on' : ''}`} onClick={() => setTimeSpeed(s)}>
                {s}×
            </button>
            ))}
      </div>
    </>)
}