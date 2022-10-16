require('dotenv').config();
const census =require('citysdk');
const stats_codes = require('./statisticsCodes');
const getStateFips = require('../Tools/state_fips').getStateFips;
const state_array = require('../StateMap').state_array;

const census_key = process.env.CENSUS_API_KEY;

function statsTranslator(stats_array, stats_object,chamber, state){
  function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }
  const translated_stats_object = {chamber, state}
  const entries = Object.entries(stats_array);
  entries.map(entry_array=>{
    
    const stat_name = getKeyByValue(stats_object, entry_array[0])
    const stat_value = entry_array[1]
    if(stat_name == undefined) {
      translated_stats_object['district'] = stat_value
    } else {
      translated_stats_object[stat_name] = stat_value;
    }
    
})
  return translated_stats_object;

};

function MultipleStatsTransaltor(stat_set, stats_object, chamber,state){
  const return_array = stat_set.map(current_stat=>{
    return statsTranslator(current_stat, stats_object, chamber,state)
  }); 
  return return_array
}

const getStateDistrictData = async function(state, chamber, vintage, callback){

  chamber = chamber.toLowerCase();
  const stats_object = stats_codes.stats_object;
  stats_array = [];

  for(stats in stats_object){
    stats_array.push(stats_object[stats])
  }

  const state_fip_code = await getStateFips(state);
  return new Promise((resolve,reject)=>{
    if(chamber == 'upper'){
      census({
        vintage: vintage,
        geoHierarchy: {
          state: state_fip_code,
          "state legislative district (upper chamber)": '*'
        },
        sourcePath: ['acs','acs5'],
        values: stats_array,
        statsKey:census_key
      }, async (e,r)=>{
        if(e) throw new Error('Unable to retrieve census data');
        const data = MultipleStatsTransaltor(r, stats_object,chamber, state)
        resolve(data)


        
      })
    } else if(chamber == 'lower'){
      census({
        vintage: vintage,
        geoHierarchy: {
          state: state_fip_code,
          "state legislative district (lower chamber)": '*'
        },
        sourcePath: ['acs','acs5'],
        values: stats_array,
        statsKey:census_key
      }, (e,r)=>{
        if(e) throw new Error('Unable to retrieve census data');
        const data = MultipleStatsTransaltor(r, stats_object, chamber,state)
        resolve(data)

        
      })
    }
  })




}

const getBothChambers = async function(state, vintage){
    const upper = await getStateDistrictData(state, 'upper', vintage);
    const lower = await getStateDistrictData(state, 'lower', vintage);
    
    const all_districts = []
    upper.map(x=>all_districts.push(x));
    lower.map(x=>all_districts.push(x));
    return all_districts

}

const getAllStates = async function(vintage){
  const all_data = [];
  for(let i = 0; i < state_array.length -1; i++){
    const states_data = await getBothChambers(state_array[i], vintage);
    all_data.push(states_data)
  }
  console.log(all_data)
}


getAllStates( 2017)