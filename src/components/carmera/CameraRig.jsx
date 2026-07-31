import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DEFAULT_POS = new THREE.Vector3(0, 5, 14.56);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

const PRESETS = {
  1: { pos: new THREE.Vector3(0, 5, 14.56), target: new THREE.Vector3(0, 0, 0) },  // "1st floor" store view
  2: { pos: new THREE.Vector3(0, 18, 0.01), target: new THREE.Vector3(0, 0, 0) },  // "2nd floor" top-down view
};

const MOVE_SPEED = 12;   // units / sec
const ROT_SPEED = 2;  // rad / sec

export default function CameraRig({ controlsRef }) {
  const { camera } = useThree();
  const keys = useRef({});

  // continuous movement keys
  useEffect(() => {
    const down = (e) => { keys.current[e.code] = true; };
    const up = (e) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // one-shot keys: 1 / 2 / C
  useEffect(() => {
    const goto = (pos, target) => {
      camera.position.copy(pos);
      const controls = controlsRef.current;
      if (controls) {
        controls.target.copy(target);
        controls.update();
      }
    };
    const onKeyDown = (e) => {
      if (e.code === 'Digit1' || e.code === 'Numpad1') goto(PRESETS[1].pos, PRESETS[1].target);
      if (e.code === 'Digit2' || e.code === 'Numpad2') goto(PRESETS[2].pos, PRESETS[2].target);
      if (e.code === 'KeyC') goto(DEFAULT_POS, DEFAULT_TARGET);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [camera, controlsRef]);

  // WASD move / QE rotate, every frame
  useFrame((_, delta) => {
    const k = keys.current;
    const controls = controlsRef.current;
    const moving = k.KeyW || k.KeyA || k.KeyS || k.KeyD;
    const rotating = k.KeyQ || k.KeyE;
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
      forward.y = 0; forward.normalize();
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