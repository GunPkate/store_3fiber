import { SpriteAnimator } from '@react-three/drei'
import characterSheet from '../../assets/isometric-pixel-art-young-asian-woman-9f89.png' // Adjust relative path

export function PlayerCharacter() {
  const { spriteObj: statics } = useSpriteLoader('/statics.png', '/statics.json', ['heart', 'skull', 'sword'], null)
  return (
<SpriteAnimator
  position={[2, 2.8, 0.01]}
  fps={0}
  meshProps={{ frustumCulled: false, scale: 2.5 }}
  autoPlay={true}
  loop={true}
  flipX={false}
  startFrame={0}
  frameName={'sword'}
  spriteDataset={statics}
  asSprite={false}
  alphaTest={0.01}
/>

  )
}