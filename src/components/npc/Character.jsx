export default function Character(){
    return <>
        <mesh position={[4,1.7,0]}>
        <cylinderGeometry  args={[.3, .15, 1.3, 32]} />
            <meshStandardMaterial color="royalblue" />
        </mesh>

        <mesh position={[4,2.5,0]}>
            <sphereGeometry args={[.25, 32, 32]} /> {/* [radius, widthSegments, heightSegments] */}
            <meshStandardMaterial color="#ffeb90" />
        </mesh>
    </>
}