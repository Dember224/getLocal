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
  number_of_white_ppl:'B02001_002E',
  number_of_black_ppl:'B02001_003E',
  number_of_native_american_ppl:'B02001_004E',
  number_of_asian_ppl:'B02001_005E',
  number_of_pacific_island_ppl:'B02001_006E',
  number_of_other_races:'B02001_007E',
  number_of_mixed_race_ppl:'B02001_008E',
  number_of_latino_ppl:'B03003_003E',
  number_of_citizens:'B05001_001E',
  number_of_non_citizens:'B05001_006E',
  married_population:'B06008_001E',
  never_married_population:'B06008_002E',
  separated_marriage_population:'B06008_005E',
  divorced_population:'B06008_004E',
  median_income:'B06011_001E'
}


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
