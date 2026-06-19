import * as THREE from 'three';

export default function WallSection(){
    const walls = []
    // walls.push({id: 1, position: [4.5,3.25,0], color:'#eeeeee', rotation:[0,Math.PI/2,0]})
    walls.push({id: 2, position: [-4.5,3.25,0], color:'#eeeeee', rotation:[0,Math.PI/2,0]})
    walls.push({id: 3, position: [0,3.25,4.5], color:'#eeeeee', rotation:[0,0,0]})
    walls.push({id: 4, position: [0,3.25,-4.5], color:'#eeeeee', rotation:[0,0,0]})

 
    return walls.map(square => {
        return <mesh key={square.id} position={square.position} rotation={square.rotation}>
            <planeGeometry args={[9, 4.5]} />
            <meshStandardMaterial color={square.color}  side={THREE.DoubleSide}/>
        </mesh>
    })
}