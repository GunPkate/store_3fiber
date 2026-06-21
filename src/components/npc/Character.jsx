export default function Character(){
    return <>
      <mesh position={[2,1.7,0]}>
        {/* args: [radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded] */}
        <cylinderGeometry  args={[.3, .15, 1.3, 32]} />
        <meshStandardMaterial color="royalblue" />
      </mesh>

    </>
}