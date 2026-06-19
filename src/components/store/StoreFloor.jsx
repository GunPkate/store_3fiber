export default function StoreFloor(){
const floors = []
    let num = 0
    for(let i =-4; i <=4; i ++){
        for(let y =-4; y <=4; y ++){
            num++
            floors.push({id: num, position: [i,0,y],  color: num%2==0  ? '#635d5d' : '#eeeeee', rotation:[-Math.PI/2,0,0]  }) 
        }
    }
 
    return floors.map(square => {
        return <mesh key={square.id} position={square.position} rotation={square.rotation}>
            <planeGeometry args={[1, 1]} />
              <axesHelper args={[2]} /> 
            <meshStandardMaterial color={square.color} />
        </mesh>
    })
}