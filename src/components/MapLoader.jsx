import Shelf from "./facilities/Shelf";
import StoreFloor from "./store/StoreFloor";
import WallSection from "./store/WallSection";

const shelfUnits = [[0,0,1] ,[0,0,3], [0,0,-1]]
export default function MapLoader(){
    return <>
    <group position={[0, 1, 0]} >
        <StoreFloor/>
    </group>

    <group position={[0, 0, 0]} >
        <WallSection/>
    </group>

    <group position={[0, 0, 0]} >
        {shelfUnits.map(unit => {
            return <Shelf originXYZ={unit}/>
        })}
    </group>
      </>
}