import * as THREE from 'three';

export default function WallSection(){
    const walls = []
    walls.push({id: 1, position: [-2,1,-4.5], color:'#eeeeee', rotation:[0,0,0]})
    walls.push({id: 2, position: [-2,1,4.5], color:'#eeeeee', rotation:[0,0,0]})
    walls.push({id: 3, position: [-2,-3.5,0], color:'#eeeeee', rotation:[Math.PI/2,0,0]})
    walls.push({id: 4, position: [-2,5.5,0], color:'#eeeeee', rotation:[Math.PI/2,0,0]})
 
    return walls.map(square => {
        return <mesh key={square.id} position={square.position} rotation={square.rotation}>
            <planeGeometry args={[4.5, 9]} />
            <meshStandardMaterial color={square.color}  side={THREE.DoubleSide}/>
        </mesh>
    })
}