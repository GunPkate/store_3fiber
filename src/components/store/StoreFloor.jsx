export default function StoreFloor(props){
const floors = props.layOut
    return floors.map(square => {
        return <mesh key={square.id} position={square.position} rotation={square.rotation}>
            <planeGeometry args={[1, 1]} />
              <axesHelper args={[2]} /> 
            <meshStandardMaterial color={square.color} />
        </mesh>
    })
}