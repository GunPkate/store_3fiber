import { Box } from "../building/sharedmesh/Box";
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function ShelfUnit({ o }) {
    return (
        <group>
        <Box w={o.hw * 1.875} h={2.2} d={0.08} color={0x999999} x={o.x} y={1.1} z={o.z} />
        {[0, 1, 2].map((i) => (
            <Box key={i} w={o.hw * 1.875} h={0.06} d={0.45} color={0x8b6914} x={o.x} y={0.35 + i * 0.72} z={o.z + 0.15} />
        ))}
        {[-1, 1].map((s) => (
            <Box key={s} w={0.06} h={2.2} d={0.45} color={0x8b6914} x={o.x + s * (o.hw - 0.03)} y={1.1} z={o.z + 0.15} />
        ))}
        </group>
    );
}

export function Fridge({ o }) {
    return (
        <group>
        <Box w={o.hw * 2} h={3.2} d={o.hd * 2} color={0x444466} x={o.x} y={1.6} z={o.z}/>

        <mesh position={[o.x, 1.6, o.z + o.hd + 0.05]}>
            <boxGeometry args={[o.hw * 2, 3.0, 0.05]} />
            <meshPhongMaterial color={0x88eeff} transparent opacity={0.35} shininess={120} />
        </mesh>
        <pointLight position={[o.x, 2.5, o.z]} color={0x88ddff} intensity={0.7} distance={2} />
        </group>
    );
}

export function DrinkFridge({o,key}){
    console.log("pos",o)
    return (
    <group>

        <mesh position={[o.x, o.y, o.z]}>
            <boxGeometry args={[o.hw,o.hh,o.hd]} />
            <meshLambertMaterial color={o.colorMachine}/>
        </mesh>
        <mesh position={[o.x, o.y, o.z-2]}>
            <boxGeometry args={[o.hw,o.hh,o.hd]} />
            <meshLambertMaterial color={o.colorMachine}/>
        </mesh>
        <mesh 
            position={[o.x, o.y+.9175, o.z-1]}
            rotation={[Math.PI/2,0,0]}
        >    
            <boxGeometry args={[o.hw,o.hh-.15,o.hd]} />
            <meshLambertMaterial color={o.colorMachine}/>
        </mesh>

        <mesh 
            position={[o.x, o.y, o.z-1]}
            rotation={[Math.PI/2,0,0]}
        >    
            <boxGeometry args={[o.hw,o.hh-.15,o.hd]} />
            <meshLambertMaterial color={o.colorRack}/>
        </mesh>
        <mesh 
            position={[o.x, o.y-.9175, o.z-1]}
            rotation={[Math.PI/2,0,0]}
        >    
            <boxGeometry args={[o.hw,o.hh-.15,o.hd]} />
            <meshLambertMaterial color={o.colorRack}/>
        </mesh>

        <mesh
            position={[o.x+.75, o.y, o.z-1]}
            rotation={[0,Math.PI/2,0]}
        >
            <boxGeometry args={[o.hw +.45, o.hh, o.hd]} />
            <meshPhongMaterial color={o.colorGlass} transparent opacity={0.65} shininess={120} />
        </mesh>
        <mesh
            position={[o.x-.75, o.y, o.z-1]}
            rotation={[0,Math.PI/2,0]}
        >
            <boxGeometry args={[o.hw +.45, o.hh, o.hd]} />
            <meshPhongMaterial color={o.colorGlass} transparent opacity={0.65} shininess={120} />
        </mesh>

    </group>
    )
}

export function Atm({ atmObstacle }) {
    return (
        <group>
        <Box w={atmObstacle.hw * 2} h={1.8} d={atmObstacle.hd * 2} color={0x222222} x={atmObstacle.x} y={0.9} z={atmObstacle.z} />
        <mesh position={[atmObstacle.x, 1.2, atmObstacle.z - atmObstacle.hd - 0.02]}>
            <boxGeometry args={[0.5, 0.3, 0.02]} />
            <meshBasicMaterial color={0x2255ff} />
        </mesh>
        </group>
    );
}

export function RegisterScreen({ posObstacle }) {
    const matRef = useRef();
    const t = useRef(0);
    useFrame((_, dt) => {
    t.current += dt;
    if (matRef.current) matRef.current.color.setHSL(0.37, 1, 0.4 + Math.sin(t.current * 2) * 0.1);
    });
    return (
    <group>
        <Box w={posObstacle.hw * 2} h={1.0} d={posObstacle.hd * 2} color={0x5c3d1e} x={posObstacle.x} y={0.5} z={posObstacle.z} />
        <Box w={posObstacle.hw * 2} h={0.06} d={posObstacle.hd * 2} color={0x222222} x={posObstacle.x} y={1.02} z={posObstacle.z} />
        <Box w={0.5} h={0.4} d={0.35} color={0x111111} x={-1.2} y={1.24} z={posObstacle.z} />
        <Box w={0.5} h={0.25} d={0.04} color={0x111111} x={-1.2} y={1.52} z={posObstacle.z - 0.36} />
        <mesh position={[-1.2, 1.52, posObstacle.z - 0.34]}>
        <boxGeometry args={[0.38, 0.22, 0.02]} />
        <meshBasicMaterial ref={matRef} color={0x44ff88} />
        </mesh>
    </group>
    );
}