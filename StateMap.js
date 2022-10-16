const request = require('request');
const cheerio = require('cheerio');

const state_array = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

const checkDistricts = function(){

  state_array.map(x=>{
    request({
      uri:`https://ballotpedia.org/${x}_State_Senate_elections,_2022`,
      method:'GET'
    },(e,r,b)=>{
      if(e) return e;
      let $ = cheerio.load(b);
      const districts = $('table[class*=candidateListTablePartisan]').text();
      const districts_split = districts.split('\t\n')
      const district_line = districts_split.map(y=>{
        if(y.includes("District")){
          const line_item = y.replace('\n\t\t\t\t\t', '')
          return line_item.replace('\t','');
        }
      })
      state_object = {};
      let defined_dline = district_line.filter(y=>{
        return y !== undefined;
      });
      let unique_districts = [...new Set(defined_dline)]
      state_object[x] = unique_districts;
      console.log(state_object);
    })
  })
}




module.exports = {
  state_array
}
