require('dotenv').config();
const census = require('citysdk');
const stats_codes = require('./statisticsCodes');
const search_fips = require('./FIPSsearch');


//Remember to display the next line if you place this data on the frontend
//"This product uses the Census Bureau Data API but is not endorsed or certified by the Census Bureau."
const census_key = process.env.CENSUS_API_KEY;

const getCensus = function(callData,callback){
  const stats_object = stats_codes.stats_object
  stats_array = []
  for(stats in stats_object){
    stats_array.push(stats_object[stats])
  }
  census(
    {
      vintage: 2019, // required
      geoHierarchy: {
        // required
        county: {
          lat: callData.latitude,
          lng: callData.longitude,
        },
      },
      sourcePath:["acs","acsse"],
      values: stats_array,
      statsKey:census_key
    },
    (err, res) => {
      delete res[0].county;
      delete res[0].state;

      function getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
      }
      const translated_stats_object ={}
      const entries = Object.entries(res[0])
      entries.map(entry_array=>{
        const stat_name = getKeyByValue(stats_object, entry_array[0])
        const stat_value = entry_array[1]

        translated_stats_object[stat_name] = stat_value;
      })

      return callback(null, translated_stats_object);
    }
  );
}

// searchFipsSingleDistrict({state:'Maryland', year:2021, chamber:'lower', district_number:23}, (e,r)=>{
//   if(e) return e;
//   console.log(r)
// });

//fips object example here:
//{
//   state_fip: '24',
//   district: '23',
//   latitude: 39.014691,
//   longitude: -76.8000334,
//   sub_district_name: 'State Legislative Subdistrict 23A'
// }

const searchCensusStatsByDistrict = function(callData, callback){
  search_fips.searchFipsSingleDistrict({state:callData.state, year:callData.year, chamber:callData.chamber, district_number: callData.district_number}, async (e, fips_data)=>{
    if(e) return e;
    const census_data_array = []
    for await (const fips_object of fips_data){
      getCensus({latitude: fips_object.latitude, longitude: fips_object.longitude}, async (e, census_data)=>{
        if(e) return e;
        census_data["distict"] = fips_object.district;
        census_data["sub_district_name"] = fips_object.sub_district_name;
        census_data["state"] =  callData.state;
        census_data["year"] = callData.year;
        census_data["chamber"] = callData.chamber;
        await census_data_array.push(census_data);
      })
    }


    setTimeout(()=>{
      return callback(null, census_data_array[0])
    }, 2000)

  })
}

// searchCensusStatsByDistrict({state:'Maryland', year:2021, chamber:'lower', district_number:23}, (e,r)=>{
//   if(e) return e;
//   console.log(r);
// });

module.exports = {
  searchCensusStatsByDistrict
}
