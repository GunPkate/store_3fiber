export default function ShelfItems({ o }){
    return <>
    <mesh position={[o.x, o.y, o.z]}>
        <boxGeometry args={[ o.hw, o.hh, o.hd ]} />
        <meshStandardMaterial
        color= {o.color} // Red color base 
        metalness={0.6}  // Shiny metallic look
        roughness={0.2}  // Reflective surface
        />
    </mesh>
    </>
}