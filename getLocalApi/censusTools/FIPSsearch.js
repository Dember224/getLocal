const axios = require('axios');
const cheerio = require('cheerio');
const stateMap = require('../../StateMap').state_array;
const async = require('async');

const {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync
} = require('fs');
const fs = require('fs');
const StreamZip = require('node-stream-zip');
const DBF = require('stream-dbf');
const toArray = require('stream-to-array');
const path = require('path');


const getStateFIPSCode = function(state, callback){
  state = state.toUpperCase();
  axios.get('https://www.mcc.co.mercer.pa.us/dps/state_fips_code_listing.htm')
  .then((response)=>{

    const $ = cheerio.load(response.data);
    const tr = $(`tr:contains('${state}')`).text();
    tr_array = tr.split('\n');
    const tr_trimmed_array = tr_array.map(x=>{
      return x.trim();
    })
    const state_index = tr_trimmed_array.indexOf(state);
    const fips_index = state_index - 1;
    const fips_code = tr_trimmed_array[fips_index];

    return callback(null, fips_code);
  })
}

//state lower chamber = sldl
//state uper chamber = sldu

function chamberCheck(chamber){
  const case_correct_chamber = chamber.toLowerCase();
  if(case_correct_chamber === 'upper'){
    return 'u';
  } else if(case_correct_chamber === 'lower'){
    return 'l';
  } else {
    throw Error('The chamber options are upper and lower');
  }
}

const getDistrictFipsByStateFile = function(callData, callback){
  const chamber = chamberCheck(callData.chamber);
  getStateFIPSCode(callData.state, (e,state_fips_code)=>{
    if(e) throw e;
    const filename = `tl_${callData.year}_${state_fips_code}_sld${chamber}.zip`;

    axios.get('https://www.census.gov/cgi-bin/geo/shapefiles/getFile.php',{
      params: {
        year:callData.year,
        directory:`SLD${chamber.toUpperCase()}`,
        filename
      }
    })
    .then((response)=>{
      const file = response.data.replace(/^\/+/, '');
      return file;
    })
    .then( (file)=>{
      const file_uri = `https://${file}`;
      const file_path = `./fipCodes/${callData.state}/${callData.year}${callData.chamber}`;

    axios.get(file_uri,{
      responseType: 'arraybuffer',
      headers:{
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
        'Content-Encoding':'gzip, deflate, br'
      },
      config:{
        decompress:false
      }
    })
      .then( async (response)=>{
        try{
          if(!existsSync(file_path)){
            mkdirSync(file_path, { recursive: true });
          }

          if(response.data){
            const writer = await createWriteStream(path.resolve(__dirname,file_path + '.zip')).write(response.data);


            return await callback(null, file_path);
          } else{
            return await file_path;
          }

        } catch(e){
          console.log(e);
        }
      }).then((response)=>{
        return callback(null, file_path)
      })
    })
  })
}

const extractStateFiles = function(callData, callback){
    getDistrictFipsByStateFile({state:callData.state, year:callData.year, chamber: callData.chamber}, async (e, file_path)=>{
      try {
        if(e) throw new Error('There was a problem getting the file. Check the API call.');
        const file_array = file_path.split('/');
        const file_name = file_array[file_array.length - 1]+'.zip';
        const exists = await existsSync(path.resolve(__dirname,`${file_path}.zip`))
        if(!exists){
          throw new Error(`This module is having difficulty finding the zipfile from the following filepath:${file_path}.zip`)
        }

        const zip = new StreamZip.async({file: path.resolve(__dirname,`${file_path}.zip`)});

        getStateFIPSCode(callData.state, async (e, state_code)=>{
          if(e) throw Error('cannot retrieve state code');
          const chamber_initial = chamberCheck(callData.chamber);
          const fip_file_dbf_name = `tl_${callData.year}_${state_code}_sld${chamber_initial}.dbf`;
          await zip.extract(fip_file_dbf_name, `./fipCodes/${callData.state}/${callData.year}${callData.chamber}.dbf`);
          await zip.close();

          return callback(null, `./fipCodes/${callData.state}/${callData.year}${callData.chamber}.dbf`)
        })

    } catch(e){
      console.log('That didnt work', e);
    }
    })

}

const viewFipCodesByDistrict = function(callData, callback){
  let count = 0;
  try{
    extractStateFiles({state:callData.state, year:callData.year, chamber:callData.chamber}, (e,file_path)=>{
      if(e) throw new Error(`unable to extract files ${e}`);
      const parser =  new DBF(file_path, {lowercase:true});
      const stream = parser.stream;

      const record_stream = stream.on('data', (record)=>{

        return record;

      })
      toArray(record_stream, (e,record_array)=>{
        if(e) return callback(e);
        return callback(null, record_array)
      })

    })
  } catch(e){
    if(count <= 3){
      console.log(`ReadFile failed due to ${e}. Awaiting to retry....`);
      setTimeout(function(){ viewFipCodesByDistrict({state:callData.state, year:callData.year, chamber:callData.chamber}); }, 10000);
      count++;
    } else {
      console.log('Retry limit hit. FIPs codes unreachable')
      return e;
    }
  }
}

const searchFipsSingleDistrict = function(callData, callback){
  viewFipCodesByDistrict({state:callData.state, year:callData.year, chamber:callData.chamber}, (e,district_array)=>{
    if(e) return e;
    const searched_object = district_array.filter(district_object =>{
      return district_object.sldlst.replace(/^0+/, '').replace(/\D/g,'') == callData.district_number
    })

    const refined_array = searched_object.map(raw_object=>{
      const refined_object = {
        state_fip:raw_object.statefp,
        district:raw_object.sldlst.replace(/^0+/, '').replace(/\D/g,''),
        latitude: parseFloat(raw_object.intptlat),
        longitude: parseFloat(raw_object.intptlon),
        sub_district_name:raw_object.namelsad
      }
      return refined_object;
    })
    return callback(null, refined_array)
  })
}

// searchFipsSingleDistrict({state:'Maryland', year:2021, chamber:'lower', district_number:23}, (e,r)=>{
//   if(e) return e;
//   console.log(r)
// });

//Running this on a loop through each state is a nightmare. I get all of the files from several runs but there has to be a much better solution here.
//Unhandled promise errors will get thrown all over the place but the purpose of getting the dbf files loaded is served.
//For some reason new york doesn't cooperate though. Had to pull NY out manually.
const searchAllStates = function(callData){
  async.map(stateMap, (state, cb)=>{
    const chamber_map = ['upper', 'lower'];

    async.mapSeries(chamber_map, (chamber, call)=>{
      extractStateFiles({state, year:callData.year, chamber }, (e, fip_object)=>{
        if(e) throw new Error(`Fip Object not responding ${e}`);
        return call(null, fip_object);
      })
    }, (e, r)=>{
      if(e) throw new Error(`Issue calling on this chamber: ${e}`);
      console.log(r);
      return cb(null, r);
    })

  }, (e,r)=>{
    if(e) throw new Error(`Issue getting the list of census objects: ${e}`)
    console.log('the method has finished', r);
  })
}




module.exports = {
  viewFipCodesByDistrict,
  searchFipsSingleDistrict
}
