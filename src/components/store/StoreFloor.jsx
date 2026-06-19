export default function StoreFloor(){
const floors = []
    let num = 0
    for(let i =-4; i <=4; i ++){
        for(let y =-4; y <=4; y ++){
            num++
            floors.push({id: num, position: [i,y,0],  color: num%2==0  ? '#635d5d' : '#eeeeee' }) 
        }
    }
 
    return floors.map(square => {
        return <mesh key={square.id} position={square.position}>
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial color={square.color}  />
        </mesh>
    })
}