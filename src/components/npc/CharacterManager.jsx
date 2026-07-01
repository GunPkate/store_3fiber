import { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 }  from 'three';
import Character from './Character';
import { simulationEngine, useUIStore } from '../../service/state/uiState'

// Configuration constants
const START_END_POS = [5, 0, 0];
const SPEED = 2.5; // Units per second

export default function CharacterManager() {
    // useUIStore((s) => s.npcVersion);
    return (
        <>
            {simulationEngine.npcs.map((npc) => (
                <Character key={npc.id} position={npc.position} color={npc.color} />
            ))}
        </>
    );
}