

const theSuperDeDuper = function(array_of_objects){
    let counter = {};

    array_of_objects.forEach(function(obj) {
        var key = JSON.stringify(obj)
        counter[key] = (counter[key] || 0) + 1
    })

    console.log(counter);

    const unique_strings = Object.keys(counter);

    const de_duped = unique_strings.map(string=>{
        const as_object = JSON.parse(string);
        return as_object;
    });

    return de_duped;
}

module.exports = theSuperDeDuper;