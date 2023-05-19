const axios = require('axios').default;
const tmp = require('tmp');
const readXlsxFile = require('read-excel-file/node');
const fs = require('fs');
const xlsx = require('node-xlsx');

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


const csvParser = function(text){
  const row_array = text.split('\r\n');
  const headers = row_array[0].split(',').map(x=>{
    return x.replace(/['"]+/g, '')
  });
  const text_array = row_array.map(x=>{
    const text_object = {};
    const rows = x.split(',')
    rows.map((y,i)=>{
      if(i !== 0){
        text_object[headers[i]] = y.replace(/['"]+/g, '')
      }
    })
    return text_object
  })
  return text_array;
}


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

const partyParser = function(party){
  const lower_party = party.toLowerCase();
  if(lower_party.match(/dem/) ){
    return 'democrat';
  } else if(lower_party.match(/rep/) ){
    return 'republican';
  } else if (lower_party.match(/lib/)){
    return 'libertarian';
  } else if (lower_party.match(/gre/)){
    return 'green';
  } else {
    return lower_party
  }
}

const parseExcelFileEndpoint = function(url, callback){
  tmp.file({postfix:'.xlsx'},(e,path, fd)=>{
    axios({
      url,
      method:'GET',
      responseType:'arraybuffer'
    })
    .then((res)=>{
        const worksheet = xlsx.parse(res.data)
        const worker_data = worksheet[0].data
        const column_headers = worker_data[0];
        const return_array = worker_data.map((x,i)=>{
          if(i >0){
            const return_object = {}
            column_headers.map((y,it)=>{
              return_object[y] = x[it];
            })
            return return_object
          }
        }) //This process for objectifying the data will totally break on a larger Excel file, but should be fine for a few thousand records.
        //Don't use on things like a full xlx database download.
        return callback(null, return_array)
    })
    .catch((e)=>{
      if(e) return callback(e);
    })
  })
}

module.exports = {
  txtParser,
  chamberParser,
  partyParser,
  parseExcelFileEndpoint,
  csvParser
}
