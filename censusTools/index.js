require('dotenv').config();
const census =require('citysdk');
const stats_codes = require('./statisticsCodes');
const getStateFips = require('../Tools/state_fips').getStateFips;
const state_array = require('../StateMap').state_array;

const census_key = process.env.CENSUS_API_KEY;

function statsTranslator(stats_array, stats_object,chamber, state, acs_source_path, vintage){
  function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }
  const translated_stats_object = {chamber, state}
  const entries = Object.entries(stats_array);
  entries.map(entry_array=>{
    
    const stat_name = getKeyByValue(stats_object, entry_array[0])
    const stat_value = entry_array[1]
    if(stat_name == undefined) {
      translated_stats_object['district'] = parseInt(stat_value)
    } else {
      translated_stats_object[stat_name] = stat_value;
    }
    
})
  translated_stats_object['acs_source_path'] = acs_source_path;
  translated_stats_object['acs_vintage'] = vintage;
  return translated_stats_object;

};

function MultipleStatsTransaltor(stat_set, stats_object, chamber,state, acs_source_path, vintage){
  const return_array = stat_set.map(current_stat=>{
    return statsTranslator(current_stat, stats_object, chamber,state, acs_source_path, vintage)
  }); 
  return return_array
}

const getStateDistrictData = async function(state, chamber, vintage, acs_source_path){

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
        sourcePath: acs_source_path,
        values: stats_array,
        statsKey:census_key
      }, async (e,r)=>{
        if(e) throw new Error('Unable to retrieve census data');
        const data = MultipleStatsTransaltor(r, stats_object,chamber, state, acs_source_path, vintage)
        resolve(data)


        
      })
    } else if(chamber == 'lower'){
      census({
        vintage: vintage,
        geoHierarchy: {
          state: state_fip_code,
          "state legislative district (lower chamber)": '*'
        },
        sourcePath: acs_source_path,
        values: stats_array,
        statsKey:census_key
      }, (e,r)=>{
        if(e) throw new Error('Unable to retrieve census data');
        const data = MultipleStatsTransaltor(r, stats_object, chamber,state, acs_source_path, vintage)
        resolve(data)

        
      })
    }
  })




}

const getBothChambers = async function(state, vintage, acs_source_path){
  try{
    const upper = await getStateDistrictData(state, 'upper', vintage, acs_source_path);
    const lower = await getStateDistrictData(state, 'lower', vintage, acs_source_path);
    
    const all_districts = []
    upper.map(x=>all_districts.push(x));
    lower.map(x=>all_districts.push(x));
    return all_districts
  } catch(e){
    throw new Error(`Issue getting both chambers for state ${state} with error: ${e}`);
  }


}

const getAllStates = async function(vintage){
  try{
    const all_data = [];
    for(let i = 0; i < state_array.length -1; i++){
      const states_data = await getBothChambers(state_array[i], vintage, ['acs','acs5']);
      states_data.map(x=>{
        all_data.push(x);
      });
    }
    return all_data
  } catch(e){
    throw `census load failed ${e}`
  }

}


// getAllStates( 2017).then((r)=>{
//   console.log(r);
// })

module.exports = getAllStates