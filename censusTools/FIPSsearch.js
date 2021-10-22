const axios = require('axios');
const cheerio = require('cheerio');
const {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync
} = require('fs');
const fs = require('fs');
const StreamZip = require('node-stream-zip');



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
        directory:'SLDL',
        filename
      }
    })
    .then((response)=>{
      const file = response.data.replace(/^\/+/, '');
      return file;
    })
    .then(async (file)=>{
      const file_uri = `https://${file}`;
      const file_path = `./fipCodes/${callData.state}/${callData.year}${callData.chamber}`;

      await axios.get(file_uri,{
      responseType: 'arraybuffer',
      headers:{
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
        'Accept-Encoding':'gzip, deflate, br'
      },
      config:{
        decompress:false
      }
    })
      .then( async (response)=>{
        if(!existsSync(file_path)){
          await mkdirSync(file_path, { recursive: true });
        }
        const writer = await createWriteStream(file_path + '.zip').write(response.data);
        await writer;

        return callback(null, file_path);

      })
    })
  })
}

const extractStateFiles = function(callData){
  getDistrictFipsByStateFile({state:callData.state, year:callData.year, chamber: callData.chamber},async (e, file_path)=>{
    if(e) throw Error('There was a problem getting the file. Check the API call.');
    const file_array = file_path.split('/');
    console.log(file_array);
    const file_name = file_array[file_array.length - 1]+'.zip';
    if(!existsSync(`${file_path}.zip`)){
      throw Error(`This module is having difficulty finding the zipfile from the following filepath:${file_path}.zip`)
    }

    const zip = new StreamZip.async({file: `${file_path}.zip`});

    getStateFIPSCode(callData.state, async (e, state_code)=>{
      if(e) throw Error('cannot retrieve state code');
      const chamber_initial = chamberCheck(callData.chamber);
      const fip_file_dbf_name = `tl_${callData.year}_${state_code}_sld${chamber_initial}.dbf`;
      await zip.extract(fip_file_dbf_name, `./fipCodes/${callData.state}/${callData.year}${callData.chamber}.dbf`);
      await zip.close();
    })



  })
}

extractStateFiles({state:'Alabama', year:2021, chamber:'lower'});
