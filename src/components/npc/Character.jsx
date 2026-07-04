import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { simulationEngine, useUIStore } from '../../service/state/uiState'
import { Html } from '@react-three/drei';

export default function Character({ npc }){
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
    <group>
        <group
            ref={groupRef}
        >
            <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 0.7, 10]} />
            <meshLambertMaterial color={bodyColor} />
            </mesh>
            <mesh position={[0, 0.95, 0]} castShadow>
            <sphereGeometry args={[0.2, 10, 8]} />
            <meshLambertMaterial color={headColor} />
            </mesh>
            {[-0.07, 0.07].map((ox) => (
                <mesh key={ox} position={[ox, 0.98, 0.17]}>
                <sphereGeometry args={[0.04, 6, 4]} />
                <meshBasicMaterial color={0x111111} />
            </mesh>
            ))}
            <Html position={[0, 1.5, 0]} center distanceFactor={9} occlude={false} style={{ pointerEvents: 'none' }}>
            <div
                ref={labelRef}
                style={{
                    background: 'rgba(0,0,0,.55)',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontFamily: 'sans-serif',
                    fontWeight: 'bold',
                    fontSize: 13,
                    whiteSpace: 'nowrap',
                    color: npc.labelColor,
                }}
                >
                {npc.label}
            </div>
            </Html>
        </group>
        <line ref={lineRef} visible={false}>
            <bufferGeometry />
            <lineBasicMaterial color={npc.type === 'customer' ? 0xffcc44 : 0x44ccff} transparent opacity={0.5} />
        </line>
    </group>
  );
}