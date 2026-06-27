import StoreModel from "./store/StoreModel";
import CharacterManager from "./npc/CharacterManager";
import { PlayerCharacter } from "./npc/PlayerCharacter";

const shelfUnits = [[0,0,1] ,[0,0,3], [0,0,-1]]
export default function MapLoader(){

    return <>
    {/* <StoreModel/> */}
    <PlayerCharacter/>
    <group position={[0, 0, 0]} >
        <CharacterManager/>
    </group>

      </>
}