export function genStoreLayout(){
    let layOut = []
    let num = 0
    for(let i =-4; i <=4; i ++){
        for(let y =-4; y <=4; y ++){
            num++
            layOut.push({id: num, position: [i,0,y],  color: num%2==0  ? '#635d5d' : '#eeeeee', rotation:[-Math.PI/2,0,0]  }) 
        }
    }
    
    return layOut
}