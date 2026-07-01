import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { simulationEngine, useUIStore } from '../../service/state/uiState'


export default function Character({ position, color }){
    const groupRef = useRef();
    const lineRef = useRef();
    const labelRef = useRef();

    const bodyColor = npc.type === 'customer' ? npc.color : npc.bodyColor;
    const headColor = npc.type === 'customer' ? npc.color : npc.headColor;

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.position.set(npc.x, 0, npc.z);
            groupRef.current.rotation.y = npc.rotationY;
        }
        if (labelRef.current) {
            labelRef.current.textContent = npc.label;
            labelRef.current.style.color = npc.labelColor;
        }
        // path trail
        if (simulationEngine.CFG.showPaths) {
            const pts = npc.remainingPath();
            if (pts && pts.length > 1 && lineRef.current) {
                lineRef.current.visible = true;
                lineRef.current.geometry.setFromPoints(pts.map((p) => new THREE.Vector3(p.x, 0.1, p.z)));
            } else if (lineRef.current) {
                lineRef.current.visible = false;
            }
        } else if (lineRef.current) {
            lineRef.current.visible = false;
        }

        // if (groupRef.current && position) {
        //     groupRef.current.position.set(position.x, position.y, position.z);
        // }
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