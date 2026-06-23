import Shelf from "./facilities/Shelf";
import StoreModel from "./store/StoreModel";
import WallSection from "./store/WallSection";
import { genStoreLayout } from "./store/genStoreLayout";
import CharacterManager from "./npc/CharacterManager";

const shelfUnits = [[0,0,1] ,[0,0,3], [0,0,-1]]
export default function MapLoader(){
    let layOut = genStoreLayout()

    return <>
    <StoreModel/>

    <group position={[0, 0, 0]} >
        <WallSection/>
    </group>

    <group position={[0, 0, 0]} >
        <CharacterManager/>
    </group>

    <group position={[0, 0, 0]} >
        {shelfUnits.map(unit => {
            return <Shelf originXYZ={unit}/>
        })}
    </group>
      </>
}