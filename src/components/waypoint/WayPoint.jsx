export default function WayPoint(){
    const waypoints = []
    let num = 0
    for(let x=-4; x <=4; x++ ){
        for(let z=-4-1; z <=4; z++){
            num++
            waypoints.push({id: num, position: [x+.5,0,z+.5],  color: num%2==0  ? '#635d5d' : '#eeeeee', rotation:[-Math.PI/2,0,0]  }) 
       
        }
    }

    return <>
        {waypoints.map( square=> {
        return <mesh position={square.position}>
            <sphereGeometry args={[.10, 32, 32]} /> {/* [radius, widthSegments, heightSegments] */}
            <meshStandardMaterial color="hotpink" />
        </mesh>
        }
        )}
    </>
}