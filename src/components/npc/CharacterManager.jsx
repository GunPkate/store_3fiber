import Character from './Character';
import { simulationEngine, useUIStore } from '../../service/state/uiState';
import { useGLTF } from '@react-three/drei';

export default function CharacterManager() {
    const AVATAR_BY_TYPE = {
        customer: '262410318834873893.vrm',
        employee: '8087383217573817818.vrm',
    };
    useGLTF.preload(`/models/${AVATAR_BY_TYPE.customer}`);
    useGLTF.preload(`/models/${AVATAR_BY_TYPE.employee}`);
    useUIStore((s) => s.npcVersion);
    return (
        <>
          <group>
            {simulationEngine.npcs.map((npc) => (
              <Character key={npc.id} npc={npc} avatartype={AVATAR_BY_TYPE}/>
            ))}
          </group>
        </>
    );
}