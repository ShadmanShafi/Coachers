const outerUnion = (array1, array2)=>{
    const set = new Set();
    array1.forEach(element => {
        set.add(element.name);
    });
    const resArray = [];
    array2.forEach(element => {
        if(!set.has(element.name)){
            resArray.push(element);
        }
    })

    return resArray;
}

const innerUnion = (array1, array2)=>{
    const set = new Set();
    array1.forEach(element => {
        set.add(element.name);
    });
    const resArray = [];
    array2.forEach(element => {
        if(set.has(element.name)){
            resArray.push(element);
        }
    })

    return resArray;
}

module.exports = {outerUnion, innerUnion};