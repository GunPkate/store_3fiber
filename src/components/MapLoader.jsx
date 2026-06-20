import Shelf from "./facilities/Shelf";
import StoreFloor from "./store/StoreFloor";
import WallSection from "./store/WallSection";

const shelfUnit = [[0,0,1] ,[0,0,3], [0,0,5]]
export default function MapLoader(){
    return <>
    <group position={[0, 1, 0]} >
        <StoreFloor/>
    </group>

    <group position={[0, 0, 0]} >
        <WallSection/>
    </group>

    <group position={[0, 0, 0]} >
        <Shelf/>
    </group>
      </>
}