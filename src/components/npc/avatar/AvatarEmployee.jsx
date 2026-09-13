import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import { useGLTF } from '@react-three/drei';

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

  return (
    <group {...props}>
      <primitive object={scene} />
    </group>
  );
}