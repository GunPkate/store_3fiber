// import { TransformControls } from '@react-three/drei'
// import { useRef } from 'react'

export default function Shelf(props){
const shelfs = []
    let originX = props.originXYZ[0]
    let originY = props.originXYZ[1]
    let originZ = props.originXYZ[2]
    let num = 0
    let shelfThick = 1.5
    let originMainBody = [originX, originY+2, originZ]
    shelfs.push({id: num++, position: originMainBody,  color: '#777', rotation:[-Math.PI/2,0,0], size: [0.045, shelfThick - 0.05, 2]}) 
    
    for(let arm =0; arm <= 1; arm++){
        let originMainArm = [originX+.225, originY+ 2,originZ + (arm>0? -0.75 : 0.75)]
        shelfs.push({id: num++, position: originMainArm,  color: 'orange', rotation:[-Math.PI/2,0,-Math.PI/2], size: [0.05, .5, 2]}) 
    }
    
    for(let row =0; row <= 3; row++){
        let originRow = [originX+.225, originY+ 1.2+ (row/2), originZ+0]
        shelfs.push({id: num++, position: originRow,  color: 'orange', rotation:[-Math.PI/2,0,0], size: [.5, shelfThick, .05]}) 
    }    
  
    // const meshRef = useRef();
    return shelfs.map(square => {
        return (
        <>
            <mesh
                // ref={meshRef}
                position={square.position}
                rotation={square.rotation}
            >
            <boxGeometry args={square.size} />
            <meshStandardMaterial color={square.color} />
            </mesh>

            {/* <TransformControls
                object={meshRef}
                mode="translate"
                translationSnap={0.025}
            /> */}
        </>
        );
    })
}