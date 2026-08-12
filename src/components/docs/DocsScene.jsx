import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';

// Placeholder — replace the mesh below with your real doc-section content.
export default function DocsScene() {
  const boxRef = useRef();

  useFrame((_, dt) => {
    // if (boxRef.current) boxRef.current.rotation.y += dt * 0.5;
  });

  return (
    <>
      <color attach="background" args={[0x111318]} />
      <PerspectiveCamera makeDefault fov={50} near={0.5} far={100} position={[0, 1.5, 5]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 2]} intensity={0.8} />

      <mesh ref={boxRef} position={[0,2,0]}>
        {/* <boxGeometry args={[1.4, 1.4, 1.4]} /> */}
        <planeGeometry args={[1.4, 1.4, 1.4]}/>
        <meshStandardMaterial color={"#dedede"} />
      </mesh>
    </>
  );
}