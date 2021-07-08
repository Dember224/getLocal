const txtParser = function(text){
  const row_array = text.split(/\r?\n/);
  const headers = row_array[0].split(/\t/)
  const text_array = row_array.map(x=>{
    const text_object = {};
    const rows = x.split(/\t/)
    rows.map((y,i)=>{
      if(i !== 0){
        text_object[headers[i]] = y
      }
    })
    return text_object
  })
  return text_array;
} //parses a tab delimited txt file

module.exports = {
  txtParser
}
