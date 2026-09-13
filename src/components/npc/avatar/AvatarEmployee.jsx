import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';

export default function AvatarEmployee({ avatar, ...props }) {
  const { scene } = useGLTF(
    `/models/${avatar}`,
    undefined,
    undefined,
    (loader) => {
      loader.register((parser) => {
        return new VRMLoaderPlugin(parser);
      });
    }
  );

  const cloned = useMemo(() => cloneSkeleton(scene), [scene]);

  return (
    <group {...props}>
      <primitive
        rotation={[0,Math.PI,0]} 
        object={cloned}
      />
    </group>
  );
}