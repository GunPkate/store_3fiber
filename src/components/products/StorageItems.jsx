import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { Box } from '../../config/storeLayout/BoxItemv1'

export default function StorageItems(){
    const size = 1// Size of the box sides
    const half = size/ 2
    const x= -15.3; 
    const y= 1.5; 
    const z= 6.5; 
    // const x= 1.5; 
    // const y= 1.5; 
    // const z= .5; 
    const color = "#ded2ad"
    const status = "opened"
    const fontSize = 1 * 0.2 
    const item = Box[1]
    const boxes = []
    for(let i = 0; i < 10; i++){
        boxes.push({   x: x, "z": (i%2==0? z-i: z-i+.2 ) })
    }
    return (<>
        {/* { true ? <> */}
        {boxes.map(box =>{ return<>
            <mesh 
                position={[box.x,y-1,box.z]}
                rotation={[0,Math.PI/2,0]}
                >
                <boxGeometry args={[1,1,1]}/>
                <meshLambertMaterial color={"#ded2ad"}/>
                <Text
                    position={[.0,  .05, .51]}
                    fontSize={fontSize}
                    color="black"
                    anchorX="center"
                    anchorY="middle"
                    >
                    {"Cookies"}
                </Text>
            </mesh>
        {/* </>:<>*/}
            <group>
                {/* Front */}
                <mesh 
                    position={[x, y, z+half]}
                >
                    <planeGeometry args={[size, size]}/>
                    <meshStandardMaterial color={color} side={THREE.DoubleSide}/>
                    <Text
                        rotation={[0, Math.PI/2, 0]}
                        position={[0+half+.05,0,0-half]}
                        rotations
                        fontSize={fontSize}
                        color="black"
                        anchorX="center"
                        anchorY="middle"
                        >
                        {item.label}
                    </Text>
                </mesh>

                {/* Back */}
                <mesh position={[x, y, z-half]}>
                    <planeGeometry args={[size, size]}/>
                    <meshStandardMaterial color={color} side={THREE.DoubleSide}/>
                </mesh>

                {/* Top */}
                <mesh rotation={[Math.PI/2, 0, 0]} position={[x, y+half, z-half*1.5]}>
                    <planeGeometry args={[size, size/2]}/>
                    <meshStandardMaterial color={color} side={THREE.DoubleSide}/>
                </mesh>

                {/* Top */}
                <mesh rotation={[Math.PI/2, 0, 0]} position={[x, y+half, z+half*1.5]}>
                    <planeGeometry args={[size, size/2]}/>
                    <meshStandardMaterial color={color} side={THREE.DoubleSide}/>
                </mesh>

                {/* Bottom */}
                <mesh rotation={[Math.PI/ 2, 0, 0]} position={[x, y-half, z]}>
                    <planeGeometry args={[size, size]}/>
                    <meshStandardMaterial color={color} side={THREE.DoubleSide}/>
                </mesh>

                {/* Right */}
                <mesh rotation={[0, Math.PI/ 2, 0]} position={[x-half, y, z]}>
                    <planeGeometry args={[size, size]}/>
                    <meshStandardMaterial color={color} side={THREE.DoubleSide}/>
                </mesh>

                {/* Left */}
                <mesh rotation={[0, -Math.PI/ 2, 0]} position={[x+half, y, z]}>
                    <planeGeometry args={[size, size]}/>
                    <meshStandardMaterial color={color} side={THREE.DoubleSide}/>
                </mesh>
            </group>
        {/* </>} */}
        </>})}
    </>
    )
}