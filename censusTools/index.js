require('dotenv').config();
const census =require('citysdk');
const stats_codes = require('./statisticsCodes');
const chamberParser = require('../Tools/parsers').chamberParser;
const axios = require('axios');
const cheerio = require('cheerio');
const async = require('async');
const stateMap = require('../stateMap').state_array;

const census_key = process.env.CENSUS_API_KEY;


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

const padZero = function(number){
  const string_number = String(number);
  return string_number.padStart(3,"0")
}

const getDistrictCensusData = function(callData, callback){
  const chamber = chamberParser(callData.office);
  const chamber_string = `state legislative district (${chamber} chamber)`;
  const district = callData.district == '*' ? callData.district : padZero(callData.district);
  const stats_object = stats_codes.stats_object;
  stats_array = [];

  for(stats in stats_object){
    stats_array.push(stats_object[stats])
  }

  getStateFIPSCode(callData.state, (e, state_fip_code)=>{
    if(e) return callback(e);
    const geoHierarchy = {
      state: state_fip_code,
    }
    geoHierarchy[chamber_string] = district;

    census({
      vintage:callData.vintage ? callData.vintage : 2019,
      geoHierarchy: geoHierarchy,
      sourcePath:['acs','acs5'],
      values:stats_array,
      statsKey: census_key

    }, (e, census_data)=>{
      if(e) return callback(e);

      function getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
      };
      const translate_stats_array = census_data.map(census_object =>{
        const translated_stats_object ={};
        const entries = Object.entries(census_object);
        entries.map(entry_array=>{
          const stat_name = getKeyByValue(stats_object, entry_array[0])
          const stat_value = entry_array[1]

          translated_stats_object[stat_name] = stat_value;
        })
        translated_stats_object.district = translated_stats_object.undefined;
        translated_stats_object.state = callData.state;
        return translated_stats_object

      })

      return callback(null, translate_stats_array)
    })
  })
}

const getAllStatesCensusData = function(callData, callback){
  async.mapSeries(stateMap,(state, cb)=>{
    getDistrictCensusData({office: callData.office, district: callData.district, state}, (e, census_array)=>{
      if(e) return cb(e);
      setTimeout(()=>{
        return cb(null, census_array);
      }, 30000)
    })
  }, (e, state_census_array)=>{
    if(e) return callback(e);
    const all_states_array = [];
    state_census_array.map(single_state_array=>{
      single_state_array.map(state_object=>{
        all_states_array.push(state_object)
      })
    })
    return callback(null, all_states_array)
  })

}
getAllStatesCensusData({office:'representative', district:'*'}, (e,r)=>{
  if(e) return e;
  console.log(r)
})
// getDistrictCensusData({office:'representative', district:'*', state:'Maine'}, (e,r)=>{
//   if(e) console.log(e);
//   console.log(r);
// })


module.exports = {
  getDistrictCensusData
}
