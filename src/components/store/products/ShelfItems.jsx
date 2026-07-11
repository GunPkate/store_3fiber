import { useEffect, useMemo, useRef, useState } from "react";
import { simulationEngine, useUIStore } from "../../../service/state/uiState"
export default function ShelfItems({ o, itemOnShelfAmount }){
    useUIStore((s) => s.hud);
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
  
    function pickRandom(arr, missingCount) {
        const copy = [...arr];
        const result = [];
        missingCount = Math.min(missingCount, copy.length);
        for (let i = 0; i < missingCount; i++) {
            const idx = Math.floor(Math.random() * copy.length);
            result.push(copy[idx]);
            copy.splice(idx, 1);
        }
        return result;
    }

    //summary of to remove items
    const [removedIndices, setRemovedIndices] = useState(()=>{
        const missingCount = itemOnShelfAmount[0].maxQty - itemOnShelfAmount[0].qty;
        return pickRandom([...Array(slots.length).keys()], missingCount);
    });

    const prevQty = useRef(itemOnShelfAmount[0].qty);

    useEffect(() => {
        const delta = prevQty.current - itemOnShelfAmount[0].qty;
        prevQty.current = itemOnShelfAmount[0].qty;
        if (delta === 0) return;
        console.log("shelf",removedIndices)
        setRemovedIndices((prev) => {
        if (delta > 0) {
            const available = slots.map((_, i) => i).filter((i) => !prev.includes(i));
            return [...prev, ...pickRandom(available, delta)];
        } else {
            const picked = pickRandom(prev, -delta);
            return prev.filter((i) => !picked.includes(i));
        }
        });
    }, [itemOnShelfAmount[0].qty, slots]);

    return (<>
        {slots.map((slot, i) => {
     
            return (
                <mesh key={i} position={[slot.x, slot.y, slot.z]} visible={!removedIndices.includes(i)}>
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