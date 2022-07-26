const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const fs = require('fs');
const pdf = require('pdf-parse');
const crawler = require('crawler-request');
const partyParser = require('../../Tools/parsers.js').partyParser;
const tmp = require('tmp');
const parseExcelFileEndpoint = require('../../Tools/parsers.js').parseExcelFileEndpoint;


const getTexasElectionID = function(callData, callback){
  request({
    uri:'https://candidate.texas-election.com/Elections/getQualifiedCandidatesInfo.do',
    method:'POST',
    jar:request.cookie('coo'),
    headers: {
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
      'content-type': 'application/x-www-form-urlencoded',

    },
    qs:{
      nbElecYear: callData.year || 2020,
      cdParty:'',
      cdOfficeType: 'S',
      cdFlow: '0',
      idTown:0,
      idElection:callData.idElection,
    }
  }, (e,r,b)=>{
    if(e) return callback(e);
    let $ = cheerio.load(b);
    const election_html = $(callData.optionSearch);
    if(!callData.idElection){
      election_html.find('option').each((i,op)=>{
        if($(op).text().includes('GENERAL')){
          callback(null, $(op).attr('value'))
        };
      });
    } else {
      const senate_object = {};
      const all_districts = election_html.text().split("\n")
      const all_senate_districts = all_districts.map(x=>{
        if(x.includes(callData.office)){
          return x.trim();
        }
      }).filter((element)=>{
        return element !== undefined
      })
      election_html.find('option').each((i,op)=>{
        all_senate_districts.map((x)=>{
          if($(op).text().includes(x)){
            senate_object[x] = $(op).attr('value')
          }
        })
      })
      return callback(null,senate_object)
    }
  });
};

const getTexasCandidateNames = function(callData, callback){
  async.autoInject({
    get_election_id: (cb)=>{
      getTexasElectionID({year:callData.year,optionSearch:'#idElection', office:callData.office}, (e,election_id)=>{
        if(e) return cb(e);
        return cb(null, election_id)
      })
    },
    get_offices: (get_election_id,cb)=>{
      getTexasElectionID({year:callData.year,optionSearch:'#idOffice', idElection:get_election_id, office:callData.office}, (e,senate_offices)=>{
        if(e) return cb(e);
        return cb(null, {election_id:get_election_id, senate_offices})
      })
    }
  }, (e,r)=>{
    if(e) return e;
    const candidate_array = []
    async.eachOfSeries(r.get_offices.senate_offices, function(office_id,office_name,cb){
      request({
        uri:'https://candidate.texas-election.com/Elections/getQualifiedCandidatesInfo.do',
        method:'POST',
        jar:request.cookie('coo'),
        headers: {
          'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
          'content-type': 'application/x-www-form-urlencoded',
        },
        qs:{
          nbElecYear: callData.year,
          cdParty:'',
          cdOfficeType: 'S',
          cdFlow: 'S',
          idTown:0,
          idElection:r.get_election_id,
          idOffice:office_id,
          results:'R'
        }
      }, (e,r,b)=>{
        if(e) return cb(e);
        let $ = cheerio.load(b);
        const text_array = $('p strong').text().split(/PARTY: |STATUS/);
        const party = text_array[1];
        const candidate_name = $('p strong').first().text();
        const district_array = office_name.split(',');
        const office = office_name.split("DISTRICT")[0];
        const district = office_name.replace(/\D/g, "");
        candidate_object = {
          name: candidate_name,
          office:office,
          district:district,
          state: 'Texas',
          party
        }
        candidate_array.push(candidate_object)
        return cb(null, candidate_object)

      })
    },(e,r)=>{
      if(e) return callback(e);
      return callback(null,candidate_array)
    } )
  }, (e,r)=>{
    if(e) return callback(e);
    return r;
  })
}

//Texas is a bit of a pain in the ass. The data we need is filed in reports several times throughout the cycle.
//Those dates are either semi-anual or vary depending on proximity to the election.
//check here for the pdf to set the crawler to: https://www.ethics.state.tx.us/search/cf/cANDelists2021-2016.php#2020
const getCandidateMoney = function(callData, callback){
  async.autoInject({
    candidates:(cb)=>{
      getTexasCandidateNames({year:callData.year, office: callData.office},(e,candidate)=>{
        if(e) return cb(e);
        return cb(null, candidate)
      })
    },
    pdf:(cb)=>{
      crawler(`https://www.ethics.state.tx.us/data/search/cf/2020/CandE08102620.pdf`).then(function(response){//The pdf changes by proximity to the election.
        const year_abbr = JSON.stringify(callData.year).slice(3,-1);
        console.log(year_abbr)
        const report_array = response.text.split(`Report Due:10/26/${year_abbr}Report Number:`);//remeber to split by the appropriate dates
        const num_of_reports = response.text.split(`Report Due:10/26/${year_abbr}Report Number:`).length - 1;
        console.log(`There are ${num_of_reports} candidates and pacs in this file`);
        const re_mapped = [];
        report_array.map((x,i)=>{
          if(i > 0){
            const previous_split = report_array[i - 1].split('\n');
            const filer_id = previous_split[previous_split.length - 2];
            const new_string = x.concat(filer_id)
            re_mapped.push(new_string);
          }
          return x
        })
        return cb(null, re_mapped)
      })
    }
  },(e,r)=>{
    if(e) return callback(e);
    const money_array = []
    r.candidates.forEach(candidate=>{
      if(candidate.name.length){
        const name_split = candidate.name.split(" ");
        const first_name = name_split[0]
        const last_name = name_split[name_split.length - 1]
        r.pdf.forEach(report=>{
          if(report.toUpperCase().includes(first_name) && report.toUpperCase().includes(`${last_name},`)){
            const report_array = report.split('\n');
            const report_object = {
              name: candidate.name,
              office:candidate.office,
              district:candidate.district,
              state:candidate.state,
              contributions: parseFloat(report_array[8]),
              expenditures: parseFloat(report_array[11]),
              asOf: new Date(),
              party:partyParser(candidate.party),
              name_year: `${candidate.name} ${callData.year}`,
              election_year:new Date('01/01/'+callData.year).toGMTString(),
              election_type: callData.election_type,
              filer_id:report_array[report_array.length - 1]
            }
            console.log(report_object)
            money_array.push(report_object)
            return;
          }
        })
      }
    })
      return callback(null, money_array)
  })
}

//The below method was inteded to get candidate money but tries to pull from the PAC CSV instead.
//That could be useful if we transition to getting PAC data at any point.

// const getPACMoney = function(callData, callback){
//   const url = `https://www.ethics.state.tx.us/data/search/cf/${callData.year}/${callData.year}_PACs_By_Total_Contribs.xlsx`;
//   parseExcelFileEndpoint(url, (e,worksheet_array)=>{
//     if(e) return callback(e);
//     getFilerIds({year:callData.year, office:callData.office}, (e, filer_array)=>{
//       if(e) return callback(e);
//       console.log(worksheet_array)
//       const money_array = filer_array.map(filer_object=>{
//         const money_object = worksheet_array.find(x=>{
//           if(x){
//             return x['Filer ID'] === filer_object.filer_id;
//           }
//         });
//         if(money_object){
//           const return_object = {
//             name: filer_object.name,
//             office: filer_object.office.toLowerCase(),
//             district:filer_object.district,
//             state:'Texas',
//             asOf: filer_object.asOf,
//             party: filer_object.party,
//             name_year:filer_object.name_year,
//             contributions:parseFloat(money_object['Contributions Received']),
//             expenditures:parseFloat(money_object['Political Expenditures']),
//             election_year: callData.year
//           }
//           return return_object;
//         } else {
//           return null;
//         }
//
//
//       })
//       return callback(null,money_array)
//     })
//   })
//
// }

// getCandidateMoney({year:2020, office:'REPRESENTATIVE'}, (e,r)=>{
//   if(e) console.log(e);
//   console.log(r);
//   return r;
// })
// const loadSenateData = function(callData){
//   getCandidateMoney({year:callData.year, election_type:callData.election_type, office:"SENATOR"}, (e,r)=>{ //office name must be capitalized
//     if(e) return e;
//     loader.loadFinanceArray(r)
//   });
// }

// const loadRepData = function(callData){
//   getCandidateMoney({year:callData.year, election_type:callData.election_type, office:"REPRESENTATIVE"}, (e,r)=>{ //office name must be capitalized
//     if(e) return e;
//     loader.loadFinanceArray(r)
//     return r;
//   });
// }

const getFinanceData = function(callData, callback){
  async.auto({
    get_senate_data:(cb)=>{
      getCandidateMoney({year:callData.year, election_type:callData.election_type, office:"SENATOR"}, (e,r)=>{
        if(e) return cb(e);
        return cb(null, r);
      })
    },
    get_rep_data:(cb)=>{
      getCandidateMoney({year:callData.year, election_type:callData.election_type, office:"REPRESENTATIVE"}, (e,r)=>{
        if(e) return cb(e);
        return cb(null, r);
      })
    }
  },1, (e,r)=>{
    if(e) return callback(e);
    const return_array = []
    r.get_senate_data.map(x=>{
      return_array.push(x);
      return x;
    })
    r.get_rep_data.map(x=>{
      return_array.push(x);
      return x;
    })

    return callback(null, return_array)
  })
}

// const getAllData = function(callData, callback){
//   async.series([
//     (cb)=>{
//       getCandidateMoney({election_year:callData.election_year, election_type:callData.election_type, office:"SENATOR"}, (e,r)=>{
//         if(e) return cb(e);
//         return cb(null, r);
//       })
//     },
//     (cb)=>{
//       getCandidateMoney({election_year:callData.election_year, election_type:callData.election_type, office:"REPRESENTATIVE"}, (e,r)=>{
//         if(e) return cb(e);
//         return cb(null, r);
//       })
//     }
//   ], (e,r)=>{
//     if(e) return callback(e);
//     return callback(null, r);
//   })
// }


//Not sure why getAllData freezes. Feels like something off in the async logic.
// const loadData = function(callData){
//   getFinanceData({year:callData.year, election_type:callData.election_type}, (e, r)=>{
//     if(e) return e;
//     loader.loadFinanceArray(r);
//   })
// }

// loadData({election_year:2020, election_type:"General"})
// loadSenateData({election_year:2020,election_type:"General"})

module.exports = {
  getFinanceData
}
