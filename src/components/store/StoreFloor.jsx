export default function StoreFloor(){
// const floors = []
//     let num = 0
//     for(let i =-4; i <=4; i ++){
//         for(let y =-4; y <=4; y ++){
//             floors.push({id: num+1, position: [i,y,0],  color: i %2==0 || y%2==0 ? '#ffffff' : '#eeeeee' }) 
//         }
//     }
 
const floors = [
    { id: 1, position: [-2, 0, 0], color: 'hotpink' },
    { id: 2, position: [0, 0, 0], color: 'royalblue' },
    { id: 3, position: [2, 0, 0], color: 'orange' }
  ];

    return floors.map(square => {
        return <mesh key={square.id} position={square.position}>
            <planeGeometry args={[1.5, 1.5]} />
            <meshStandardMaterial color={square.color}  />
        </mesh>
    })
}