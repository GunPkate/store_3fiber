import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import { useGLTF } from '@react-three/drei';
import { useEffect } from "react";

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

  useEffect(() => {
    scene.traverse((object) => {
      if (object.isMesh) {
        console.log("MESH:", object.name);
        console.log("MATERIAL:", object.material?.name);
        console.log("TYPE:", object.material?.type);

        if (object.material?.uniforms) {
          console.log(
            "UNIFORMS:",
            Object.keys(object.material.uniforms)
          );
        }
      }
    });
  }, [scene]);
  
  return (
    <group {...props}>
      <primitive object={scene} />
    </group>
  );
}