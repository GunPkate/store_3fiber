import StoreFloor from "./store/StoreFloor";
import WallSection from "./store/WallSection";

export default function MapLoader(){
    return <>
    <group position={[0, 1, 0]} >
        <StoreFloor/>
    </group>

    <group position={[0, 0, 0]} >
        <WallSection/>
    </group>
      </>
}