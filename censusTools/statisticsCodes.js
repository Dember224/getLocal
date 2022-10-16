const axios = require('axios');
const cheerio = require('cheerio')

const stats_object = {
  total_population:'B01001_001E',
  male_population: 'B01001_002E',
  female_population:'B01001_026E',
  median_age:'B01002_001E',
  median_male_age:'B01002_002E',
  median_female_age:'B01002_003E',
  under_18_population:'B09001_001E',
  // over_65_population: 'K200104_008E',
  white_population:'B02001_002E',
  black_population:'B02001_003E',
  native_american_population:'B02001_004E',
  asian_population:'B02001_005E',
  pacific_islander_population:'B02001_006E',
  number_of_other_races:'B02001_007E',
  number_of_mixed_race_ppl:'B02001_008E',
  latino_population:'B03003_003E',
  citizen_population:'B05001_001E',
  non_citizen_population:'B05001_006E',
  married_population:'B06008_001E',
  never_married_population:'B06008_002E',
  separated_marriage_population:'B06008_005E',
  divorced_population:'B06008_004E',
  median_income:'B06011_001E'
}

//stats codes for a different American community survey below: 
// const stats_object = {
//   total_population:'K200101_001E',
//   male_population: 'K200101_002E',
//   female_population:'K200101_003E',
//   average_age:'K200103_001E',
//   average_male_age:'K200103_002E',
//   average_female_age:'K200103_003E',
//   under_18_population:'K200104_002E',
//   over_65_population: 'K200104_008E',
//   number_of_white_ppl:'K200201_002E',
//   number_of_black_ppl:'K200201_003E',
//   number_of_native_american_ppl:'K200201_004E',
//   number_of_asian_ppl:'K200201_005E',
//   number_of_pacific_island_ppl:'K200201_006E',
//   number_of_other_races:'K200201_007E',
//   number_of_mixed_race_ppl:'K200201_008E',
//   number_of_latino_ppl:'K200301_003E',
//   number_of_citizens:'K200501_002E',
//   number_of_non_citizens:'K200501_003E',
//   married_population:'K201001_003E',
//   never_married_population:'K201001_002E',
//   separated_marriage_population:'K201001_004E',
//   divorced_population:'K201001_006E',
// }


const viewFinderCodes = function(){
  axios.get('https://api.census.gov/data/2019/acs/acsse/variables.html').then((response)=>{
    const $ = cheerio.load(response.data);
    const table = $('tbody').html()
    const row_split = table.split('<tr>')
    const td_finder = row_split.map(x=>{

      td_split = x.split('<td>');
      const finder_code = td_split[1] ? td_split[1].split(/<|>/)[2] : null;
      const description = td_split[2] ? td_split[2].replace('</td>', '') : null;
      const explanation = td_split[3] ? td_split[3].replace('</td>', '') : null;
      const return_object = {
        finder_code,
        description,
        explanation
      }
      console.log(return_object)
      return return_object
    }).filter(x=>{
      return x.finder_code != null;
    })
  })
}

// viewFinderCodes();

module.exports = {
  stats_object
}
