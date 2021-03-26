const request = require('request');
const cheerio = require('cheerio');

const getCandidates = function(callData, callback){
  const office = callData.office === "State Representative" ? "STR" : "STS"
  request({
    uri:'https://dos.elections.myflorida.com/candidates/canlist.asp',
    qs:{
      elecid: '20201103-GEN',//have to re-lookup election ID for new elections. Seems to be the date.
      OfficeGroup: "LEG",
      StatusCode: "ALX",
      OfficeCode: office,
      CountyCode: "ALL",
      OrderBy: "NAM",
      FormsButton1: "RUN QUERY"
    },
    method:'POST',
    json:true,
    headers: {
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
      'content-type': 'application/x-www-form-urlencoded',
    }
  }, (e,r,b)=>{
    if(e) return e;
    const $ = cheerio.load(b)
    const table = $("td").text().split('You can narrow your search results for candidates by county.  A search by county will provide a list of candidates running for offices for which all or a portion of the geographical area represented by the office is located in that county.  For information on county or municipal candidates, please contact your local  Supervisor of Elections.')
    const candidate_array = table[2].split(',')
    const name_array = candidate_array.map(x=>{
      const first_name = x.split("\n")[2].trim()
      const last_name = x.split("\n")[6] ? x.split("\n")[6].trim() : x.split("\n")[6]
      const party = x.split("\n")[3].trim()
      if( last_name){
        if(!last_name.includes("Elected") && !last_name.includes("Defeated") && party ==="(DEM)"){
          return {first_name, last_name, party}
        }
      }
    }).filter(x=>{return x!== undefined})
    return callback(null, name_array)
  })
}

getCandidates({office:"State Representative"})
