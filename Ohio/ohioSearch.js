const cheerio = require('cheerio');
const async = require('async');
const csv = require('csv-parser');
const fs = require('fs');
const loader = require('../Loaders/uploadFinances.js');
const cloudflareScraper = require('cloudflare-scraper');

const getCandidateCoverPage = async function(callData, callback){
  const results = [];

  const response = await cloudflareScraper.get("https://www6.ohiosos.gov/ords/f?p=CFDISCLOSURE:72:::NO::P72_GETID:123")
    const split_response = response.split(/,,,,,,\r|\r/)
    const mapped_split = split_response.map(x=>{
      const separator = x.split(",");
      return separator;
    }).filter(x=>{
      if(x[5] === String(callData.year) && x[6]===`PRE-${callData.election_type.toUpperCase()}`){
        return x;
      }
    })
    const duh_munny = mapped_split.map(x=>{
      const money_object = {
        name:`${x[2]} ${x[3]}`,
        contributions: x[9],
        expenditures: x[12],
        election_year: new Date('01/01/'+callData.year).toGMTString(),
        election_type: callData.election_type,
        asOf: new Date(),
        state:"Ohio"
      }
      return money_object;
    })

    return callback(null,duh_munny)

}

const getCsvUrl = async function(callData, callback){
  const response = await cloudflareScraper.get('https://www6.ohiosos.gov/ords/f?p=CFDISCLOSURE:73:14001774977303:CAN:NO:RP:P73_TYPE:CAN:')
  const $ = cheerio.load(response);
  const href = $(`tr:contains("Candidate Contributions - ${callData.year}")`).html().split(/href=|>Download/)[2].replace(/"/g,"");
  return callback(null, href)
}
//https://www6.ohiosos.gov/ords/

const getOfficeDistrictCsv = function(callData, callback){
  getCsvUrl({year:callData.year}, async (e,r)=>{
    const results = [];
    if(e) return e;
    const http = `https://www6.ohiosos.gov/ords/${r}`
    console.log("the URL ", http)
    const response = await cloudflareScraper.get(http);
    const response_array = response.split(/\r/);
    const csv = response_array.map(x=>{
      const result_arr =  x.split(",");
      const return_obj = {
        name: `${result_arr[23]} ${result_arr[24]}`,
        year: result_arr[3],
        office:result_arr[25],
        district: result_arr[26],
        party: result_arr[27]
      }
      return return_obj
    }).filter(x=>{
      if(x.party !== 'party' && x !== undefined){
        if( x.office==='HOUSE' || x.office ==='SENATE'){
          return x;
        }
      }

    })
      return callback(null, csv)
  })
}

const getMoney = function(callData, callback){
  getCandidateCoverPage({year:callData.year, election_type:callData.election_type}, (e, money_object)=>{
    if(e) return e;
    getOfficeDistrictCsv({year:callData.year}, (e,district_object)=>{
      if(e) return e;
      const the_cash = money_object.map(x=>{
        const munny = x;
        const district_info = district_object.find(y=>{
          return y.name === munny.name;
        })
        if(district_info !== undefined){
          munny['district'] = district_info.district;
          munny['office'] = district_info.office  === 'SENATE'? 'state senator' : 'state representative';
          munny['party'] = district_info.party;
          munny['name_year'] =  munny.name + callData.year + munny.election_type
          return munny;
        }
      }).filter(x=>{
        if(x!== undefined){
          return x.party === 'DEMOCRAT'
        }
      })
      return callback(null, the_cash)
    })
  })
}

const loadData = async function(callData){
  await getMoney({year:callData.year, election_type: callData.election_type}, async (e, money)=>{
    if(e) return e;
    await loader.loadFinanceArray(money);
    return money;
  })
}

loadData({year:2020, election_type:'General'})
// getCandidateCoverPage({year: 2020, election_type: "General"})
