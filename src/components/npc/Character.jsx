import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function Character({ position, color }){
    const groupRef = useRef();
    
    useFrame(() => {
        if (groupRef.current && position) {
            groupRef.current.position.set(position.x, position.y, position.z);
        }
    });

    return (
        <group ref={groupRef}>
            {/* Body */}
            <mesh position={[0, 1.7, 0]}>
                <cylinderGeometry args={[.3, .15, 1.3, 32]} />
                <meshStandardMaterial color={color || "royalblue"} />
            </mesh>

            {/* Head */}
            <mesh position={[0, 2.5, 0]}>
                <sphereGeometry args={[.25, 32, 32]} />
                <meshStandardMaterial color="#ffeb90" />
            </mesh>
        </group>
    );
}