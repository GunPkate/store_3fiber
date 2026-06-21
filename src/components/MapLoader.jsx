import Shelf from "./facilities/Shelf";
import StoreFloor from "./store/StoreFloor";
import WallSection from "./store/WallSection";
import Character from "./npc/Character";
import { genStoreLayout } from "./store/genStoreLayout";

const shelfUnits = [[0,0,1] ,[0,0,3], [0,0,-1]]
export default function MapLoader(){
    let layOut = genStoreLayout()

    return <>
    <group position={[0, 1, 0]} >
        <StoreFloor layOut ={layOut}/>
    </group>

    <group position={[0, 0, 0]} >
        <WallSection/>
    </group>

    <group position={[0, 0, 0]} >
        <Character/>
    </group>

    <group position={[0, 0, 0]} >
        {shelfUnits.map(unit => {
            return <Shelf originXYZ={unit}/>
        })}
    </group>
      </>
}