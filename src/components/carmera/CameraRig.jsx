import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DEFAULT_POS = new THREE.Vector3(0, 5, 14.56);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

const PRESETS = {
  1: { pos: new THREE.Vector3(0, 5, 14.56), target: new THREE.Vector3(0, 0, 0) },  // "1st floor" store view
  2: { pos: new THREE.Vector3(0, 15, 14.56), target: new THREE.Vector3(0, 10, 0) },  // "2nd floor" top-down view  5: { pos: new THREE.Vector3(-3.5, 3, -4), target: new THREE.Vector3(-6, 2.5, 4), deg: 90 },  
  3: { pos: new THREE.Vector3(-3.5, 3, -4), target: new THREE.Vector3(-6, 2.5, 4), deg: 90 },  //Drink
  4: { pos: new THREE.Vector3(-11.5, 2, 7), target: new THREE.Vector3(-14, 1.5, -1), deg: -90 },  // Store
  5: { pos: new THREE.Vector3(-7.5, 2.5, -6), target: new THREE.Vector3(-6, -0.5, 2), deg: 270 },  //Shelves
};

const MOVE_SPEED = 12;   // units / sec
const ROT_SPEED = 2;  // rad / sec
const LERP_FACTOR = 4; // Higher value = faster transition (3 to 6 works best)

export default function CameraRig({ controlsRef }) {
  const { camera } = useThree();
  const keys = useRef({});

  // Desired positions for smooth interpolation
  const targetCamPos = useRef(DEFAULT_POS.clone());
  const targetLookAt = useRef(DEFAULT_TARGET.clone());
  const isTransitioning = useRef(false);

  // Helper to trigger target change
  const setTransitionTarget = (pos, target) => {
    targetCamPos.current.copy(pos);
    targetLookAt.current.copy(target);
    isTransitioning.current = true;
  };

  // Continuous movement key listeners
  useEffect(() => {
    const down = (e) => {
      keys.current[e.code] = true;
      // Interrupt preset transition if user manually moves
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE'].includes(e.code)) {
        isTransitioning.current = false;
      }
    };
    const up = (e) => { keys.current[e.code] = false; };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // One-shot key handler
  useEffect(() => {
    const goto = (pos, target) => {
      setTransitionTarget(pos, target);
    };

    const showPos = (pos, target, deg) => {
      const offset = new THREE.Vector3().subVectors(pos, target);
      const angle = THREE.MathUtils.degToRad(deg);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);

      const calculatedTarget = target.clone().add(offset);
      setTransitionTarget(pos, calculatedTarget);
    };

    const onKeyDown = (e) => {
      if (e.code === 'Digit1' || e.code === 'Numpad1') goto(PRESETS[1].pos, PRESETS[1].target);
      if (e.code === 'Digit2' || e.code === 'Numpad2') goto(PRESETS[2].pos, PRESETS[2].target);
      if (e.code === 'Digit3' || e.code === 'Numpad3') showPos(PRESETS[3].pos, PRESETS[3].target, PRESETS[3].deg);
      if (e.code === 'Digit4' || e.code === 'Numpad4') showPos(PRESETS[4].pos, PRESETS[4].target, PRESETS[4].deg);
      if (e.code === 'Digit5' || e.code === 'Numpad5') showPos(PRESETS[5].pos, PRESETS[5].target, PRESETS[5].deg);
      if (e.code === 'KeyC') goto(DEFAULT_POS, DEFAULT_TARGET);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [camera, controlsRef]);

  useFrame((_, delta) => {
    const k = keys.current;
    const controls = controlsRef.current;
    const moving = k.KeyW || k.KeyA || k.KeyS || k.KeyD;
    const rotating = k.KeyQ || k.KeyE;

    // Handle Smooth Transition
    if (isTransitioning.current) {
      const lerpAlpha = 1 - Math.exp(-LERP_FACTOR * delta);

      // Lerp camera position
      camera.position.lerp(targetCamPos.current, lerpAlpha);

      // Lerp OrbitControls target point
      if (controls) {
        controls.target.lerp(targetLookAt.current, lerpAlpha);
        controls.update();
      }

      // Stop transitioning when close enough
      const posDistSq = camera.position.distanceToSquared(targetCamPos.current);
      const targetDistSq = controls ? controls.target.distanceToSquared(targetLookAt.current) : 0;

      if (posDistSq < 0.0001 && targetDistSq < 0.0001) {
        camera.position.copy(targetCamPos.current);
        if (controls) {
          controls.target.copy(targetLookAt.current);
          controls.update();
        }
        isTransitioning.current = false;
      }
      return;
    }

    // Standard WASD / QE Controls (if not transitioning)
    if (!moving && !rotating) return;

    const target = controls ? controls.target : new THREE.Vector3();

    if (rotating) {
      const angle = ((k.KeyQ ? 1 : 0) - (k.KeyE ? 1 : 0)) * ROT_SPEED * delta;
      const offset = camera.position.clone().sub(target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      camera.position.copy(target.clone().add(offset));
    }

    if (moving) {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();

      const move = new THREE.Vector3();
      if (k.KeyW) move.add(forward);
      if (k.KeyS) move.sub(forward);
      if (k.KeyD) move.add(right);
      if (k.KeyA) move.sub(right);

      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(MOVE_SPEED * delta);
        camera.position.add(move);
        target.add(move);
      }
    }

    if (controls) controls.update();
  });

  return null;
}