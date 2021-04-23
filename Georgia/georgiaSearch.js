const request = require('request');
const cheerio = require('cheerio');

const getCandidates = function(callData){
  if(!callData.year){
    console.log("This function requires a year")
     return null;
   };
  if(callData.office !== 'State Senate' && callData.office !== 'State Representative'){
    console.log("The options for office are State Senate or State Representative")
    return null;
  };
  const web_address = callData.office === 'State Senate' ?  `https://ballotpedia.org/Georgia_State_Senate_elections,_${callData.year}#Primary_election` : `https://ballotpedia.org/Georgia_House_of_Representatives_elections,_${callData.year}#Primary_election`;
  request({
    uri:web_address
  }, (e,r,b)=>{
    if(e) return e;
    const $ = cheerio.load(b);
    const td = $('td').text()
    const raw_candidate_array = td.split("Office Democratic RepublicanOther")[1].split("District")
    const candidate_array = raw_candidate_array.map((x,i)=>{
      const unparsed = x.split('\n');
      if(i === 0){
        return null;
      }
      if(i ===1 ){
        return {district:unparsed[0],name:unparsed[3].trim()}
      }
      const return_object = {
        district: unparsed[0],
        name: unparsed[1] ? unparsed[1].trim().replace("(i)", "") : unparsed[1]
      }
      return return_object
    })
    console.log(candidate_array);
  })
}

getCandidates({office:'State Senate', year:2020})
