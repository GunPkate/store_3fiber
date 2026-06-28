import { useMemo } from 'react';
import { BufferGeometry, Vector3} from 'three';
import { WP_COLOR } from '../../service/engine/waypointgraph/WpGraph';
import { simulationEngine, useUIStore } from '../../service/state/uiState';

export default function WayPoint(){
    
    return (<group>
        <EdgeLine key={1} points={a.edgeLines} />
        <mesh key={1} position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.12, 8, 6]}/>
            <meshBasicMaterial color={ '#000'} />
            <mesh visible={false}>
                <sphereGeometry args={[0.4, 6, 4]} />
            </mesh>
        </mesh>
    </group>)
}