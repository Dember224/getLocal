require('dotenv').config();
const census = require('citysdk');
const stats_codes = require('./statisticsCodes');
const search_fips = require('./FIPSsearch');
const getDistrictFips = require('../showData').getDistrictFips;




//Remember to display the next line if you place this data on the frontend
//"This product uses the Census Bureau Data API but is not endorsed or certified by the Census Bureau."
const census_key = process.env.CENSUS_API_KEY;

const getCensus = function(callData,callback){
  const stats_object = stats_codes.stats_object
  stats_array = []
  for(stats in stats_object){
    stats_array.push(stats_object[stats])
  }

  if(callData.chamber == 'lower'){
     //I know handling the chamber with an if statement is really sloppy
      // but injecting it into the key of geohierarchy breaks something on the sdk side that I can't fix.
    census(
      {
        vintage: 2019, // required
        geoHierarchy: {
          // required
          "state legislative district (lower chamber)": {
            lat: callData.latitude,
            lng: callData.longitude
          },

        },
        sourcePath:["acs","acs5"],
        values: stats_array,
        statsKey:census_key
      },
      (err, res) => {
        if(err) console.log(err)
        if(res[0]){
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
        } else {

          return callback(null, null)
        }



      }
    );
  } else if(callData.chamber == 'upper') {
    census(
      {
        vintage: 2019, // required
        geoHierarchy: {
          // required
          "state legislative district (upper chamber)": {
            lat: callData.latitude,
            lng: callData.longitude
          },

        },
        sourcePath:["acs","acs5"],
        values: stats_array,
        statsKey:census_key
      },
      (err, res) => {
        if(err) console.log(err)
        if(res[0]){
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
        } else {

          return callback(null, null)
        }



      }
    );
  }

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
  getDistrictFips({state:callData.state, year:callData.year, chamber:callData.chamber, district_number: callData.district_number}, (e, fips_data)=>{
    if(e) return e;
    if(callData.chamber != "upper" && callData.chamber != "lower"){
      console.log("Please check to make sure the legislative chamber you've entered is correct. ")
    }

    getCensus({latitude: fips_data.latitude, longitude:fips_data.longitude, district_number:fips_data.district,chamber:callData.chamber}, (e, census_data)=>{
      if(e) return e;

      census_data["distict"] = fips_data.district;
      census_data["state"] =  callData.state;
      census_data["year"] = callData.year;
      census_data["chamber"] = callData.chamber;

      return callback(null, census_data)
    })
    // for (const fips_object of fips_data){
    //   getCensus({latitude: fips_object.latitude, longitude: fips_object.longitude, district_number:callData.district}, (e, census_data)=>{
    //     if(e) return e;
    //     census_data["distict"] = fips_object.district;
    //     census_data["sub_district_name"] = fips_object.sub_district_name;
    //     census_data["state"] =  callData.state;
    //     census_data["year"] = callData.year;
    //     census_data["chamber"] = callData.chamber;
    //     census_data_array.push(census_data);
    //   })
    // }
    //
    // setTimeout(()=>{
    //   return callback(null, census_data_array[0])
    // }, 4000)

  })
}


module.exports = {
  searchCensusStatsByDistrict
}
