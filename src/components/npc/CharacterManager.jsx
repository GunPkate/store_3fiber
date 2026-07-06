import Character from './Character';
import { simulationEngine, useUIStore } from '../../service/state/uiState';
export default function CharacterManager() {
    useUIStore((s) => s.npcVersion);
    return (
        <>
    <group>
      {simulationEngine.npcs.map((npc) => (
        <Character key={npc.id} npc={npc} />
      ))}
    </group>
        </>
    );
}