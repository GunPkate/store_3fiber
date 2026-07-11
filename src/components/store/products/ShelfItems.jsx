import { useMemo, useState } from "react";

export default function ShelfItems({ o, itemOnShelfAmount }){
    const { label, color, details, rowSize, rowStack, shelfRow} = o  
    const slots = useMemo(() => {
    
        const arr = [];
        for(let x = 0; x <rowSize; x ++){
            for(let z = 0; z <rowStack; z ++){
                for(let y =0; y < shelfRow; y++){
                    let startX = details.start.x + (x * details.distanceInRow.x);
                    let startY = details.start.y + (y * details.distanceBetweenShelf.y);
                    let startZ = details.start.z + (z * details.distanceInRow.z);
                    arr.push({x: startX, y: startY, z: startZ})
                }
            }
        }
        return arr;
    }, [rowSize, rowStack, shelfRow, details]);
  
    //summary of to remove items
    const [removedIndices, setRemovedIndices] = useState([]);

    return (<>
        {slots.map((slot, i) => {
     
            return (
                <mesh key={i} position={[slot.x, slot.y, slot.z]}>
                    <boxGeometry args={[ details.size.hw, details.size.hh, details.size.hd ]} />
                    <meshStandardMaterial
                        color={color} 
                        metalness={0.6}  
                        roughness={0.2}  
                    />
                </mesh>
            );
        })}
    </>)
}