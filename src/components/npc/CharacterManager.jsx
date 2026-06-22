import { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 }  from 'three';
import Character from './Character';

// Configuration constants
const START_END_POS = [5, 0, 0];
const SPEED = 2.5; // Units per second

export default function CharacterManager() {
    const [characters, setCharacters] = useState([]);
    // We use a ref to read the latest characters inside useFrame without triggering re-renders
    const charactersRef = useRef([]);

    useEffect(() => {
        charactersRef.current = characters;
    }, [characters]);

    // 1. Helper function to generate a random path within the floor bounds [-4 to 4]
    const generateRandomPath = () => {
        const path = [];
        const numWaypoints = Math.floor(Math.random() * 3) + 2; // 2 to 4 random stops

        for (let i = 0; i < numWaypoints; i++) {
            const randomX = Math.random() * 8 - 4; // Range: -4 to 4
            const randomZ = Math.random() * 8 - 4; // Range: -4 to 4
            path.push(new Vector3(randomX, 0, randomZ));
        }
        // Final destination is always the end point
        path.push(new Vector3(...START_END_POS));
        return path;
    };

    // 2. Spawn initial 3 characters
    useEffect(() => {
        const initialCharacters = Array.from({ length: 3 }, (_, index) => ({
            id: index,
            position: new Vector3(...START_END_POS),
            path: generateRandomPath(),
            currentPathIndex: 0,
            color: index === 0 ? 'royalblue' : index === 1 ? 'crimson' : 'forestgreen'
        }));
        setCharacters(initialCharacters);
    }, []);

    // 3. Animation loop to handle movement and removal
    useFrame((state, delta) => {
        let stateNeedsUpdate = false;
        
        const updatedCharacters = charactersRef.current.map(char => {
            if (!char) return null;

            const target = char.path[char.currentPathIndex];
            // Move current position towards the target waypoint
            char.position.lerp(target, (SPEED * delta) / char.position.distanceTo(target));

            // Check if character reached the current waypoint
            if (char.position.distanceTo(target) < 0.1) {
                if (char.currentPathIndex < char.path.length - 1) {
                    // Move to next random waypoint
                    char.currentPathIndex++;
                } else {
                    // Reached the ultimate [5,0,0] end point -> Mark for removal
                    stateNeedsUpdate = true;
                    return null; 
                }
            }
            return char;
        }).filter(Boolean); // Filter out the null (removed) characters

        if (stateNeedsUpdate) {
            setCharacters(updatedCharacters);
        }
    });

    return (
        <>
            {characters.map((char) => (
                <Character key={char.id} position={char.position} color={char.color} />
            ))}
        </>
    );
}