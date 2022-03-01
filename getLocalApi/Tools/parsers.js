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


//office parsers

const getOffice = function(office){
  const lower_office = office.toLowerCase();
  if(office_name.match(/senate|senator/)){
    return 'state senator'
  } else if (office_name.match(/assemblyman|assembly|assembly|assemblyman/)) {
    return 'state assemblyman'
  }
}

const chamberParser = function(office){
  const lower_case_office = office.toLowerCase();
  if(lower_case_office.match(/senate|senator/)){
    return 'upper';
  } else if (lower_case_office.match(/assemblyman|representative|delegate/)){
    return 'lower';
  }
}

module.exports = {
  txtParser,
  chamberParser
}
