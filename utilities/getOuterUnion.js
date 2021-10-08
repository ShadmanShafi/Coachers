const outerUnion = (array1, array2)=>{
    const set = new Set();
    array1.forEach(element => {
        set.add(element);
    });
    const resArray = [];
    array2.forEach(element => {
        if(!set.has(element.name)){
            resArray.push(element);
        }
    })

    return resArray;
}

module.exports = outerUnion;