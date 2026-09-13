import Character from './Character';
import { simulationEngine, useUIStore } from '../../service/state/uiState';
import { useControls } from "leva";
import AvatarEmployee from '../npc/avatar/AvatarEmployee';

export default function CharacterManager() {
    useUIStore((s) => s.npcVersion);
    const { avatar } = useControls("VRM", {
    avatar: {
      value: "262410318834873893.vrm",
      options: [
        "8087383217573817818.vrm",
        "3859814441197244330.vrm",
      ],
    },
  });
    return (
        <>
          <group>
            {simulationEngine.npcs.map((npc) => (
              <Character key={npc.id} npc={npc} />
            ))}
          </group>
          <group position={[-5,0,0]}>
            <AvatarEmployee avatar={avatar}/>
          </group>
        </>
    );
}