const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const csv = require('csv-parser')
const fs = require('fs')
const got = require('got')

// const getPreviewPage = function(callData){
//   request({
//     uri:'https://cfreports.elections.virginia.gov/Home/SearchCommittees',
//     form:{
//       CommitteeType:"Candidate Campaign Committee",
//       page:1
//     },
//     method:'POST',
//     json:true
//   }, (e,r,b)=>{
//     if(e) return e;
//     console.log(b)
//   })
// };
//
// function isNumeric(str) {
//   if (typeof str != "string") return false // we only process strings!
//   return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
//          !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
// }
//
// const getCandidates = function(callData, callback){
//   request({
//     uri:`https://ballotpedia.org/${callData.office},_${callData.year}`
//   }, (e,r,b)=>{
//     if(e) return e;
//     const $ = cheerio.load(b);
//     const table = $('.wikitable').text().trim().split('District');
//
//     const row_split_table = table.map(x=>{
//       const row_split = x.split('\n');
//       const return_object = {
//         District: row_split[0]
//       }
//       row_split.map(y=>{
//         const big_num = y.match(/^\s*/)[0].length
//         if(big_num === 20){
//           return_object["name"] = y.replace('(i)', '').trim();
//           const return_array = {
//             name: y,
//             District: x[1]
//           }
//           return return_array
//         }
//       })
//       return return_object
//     }).filter(x=>{
//       if(x.name && !x.District.includes('Beyond the Headlines:') && !x.name.includes('canceled')){
//         return x
//       }
//     })
//     return callback(null, row_split_table);
//   })
// };
//
//
// // getCandidates({year:2019, office:'Virginia_State_Senate_elections'}); //office is either Virginia_House_of_Delegates_elections or Virginia_State_Senate_elections
//
//
// const searchCandidate = function(callData, callback){
//   request({
//     uri: 'https://cfreports.elections.virginia.gov/',
//     qs:{
//       CommitteeName:callData.name,
//       CommitteeType: 'Candidate Campaign Committee',
//       page:1
//     },
//     json: true,
//     followAllRedirects: true
//   }, (e,r,b)=>{
//     if(e) return callback(e);
//     const $ = cheerio.load(b);
//     const link = $('[title="Click to view reports"]').map(function(x){
//       return $( this ).attr('href')
//     })
//     return callback(null, link);
//   })
// }
//
// const getCandidateId = function(callData, callback){
//   searchCandidate({name: callData.name}, (e,links)=>{
//     if(e) return e;
//     async.map(links, (link, cb)=>{
//       request({
//         uri:'https://cfreports.elections.virginia.gov' + link
//       }, (e,r,b)=>{
//         if(e) return callback(e);
//         const $ = cheerio.load(b);
//         const report = $('tbody').html().split('class="report"')
//         const report_map = report.map(x=>{
//           if(x.includes('10/25/2019')){
//             return x.split('\n');
//           }
//         }).filter(x=>{
//           return x != undefined
//         })
//         if(report_map[0]){
//           const candidate_id = report_map[0][21].split("\"")[1].split("/")[3];
//           return callback(null, candidate_id);
//         } else {
//           return cb(null)
//         }
//       })
//     })
//   })
// }
//
//
// const getMoney = function(callData, callback){
//   getCandidateId({name:callData.name}, (e,candidate_id)=>{
//     if(e) return e;
//     if(candidate_id){
//       request({
//         uri:`https://cfreports.elections.virginia.gov/Report/ScheduleH/${candidate_id}`
//       }, (e,r,b)=>{
//         if(e) return callback(e);
//         const $ = cheerio.load(b);
//         const expenditures = parseFloat($('tr:contains("Total Disbursements this Election Cycle")').html().split(">")[7].split("<")[0].replace("$", "").replace(",",""))
//         const contributions = parseFloat($('tr:contains("otal Receipts this Election Cycle ")').html().split("<")[5].split("$")[1].replace(",",""))
//         const money_object = {
//           expenditures,
//           contributions,
//           name: callData.name
//         }
//         return callback(null, money_object);
//       })
//     } else {
//       console.log("We can't seem to find the candidate", callData.name)
//       return callback(null, null)
//     }
//
//   })
// }
//
// function office(office){
//   if(office === 'Virginia_State_Senate_elections'){
//     return 'state senate'
//   } else if (office === 'Virginia_House_of_Delegates_elections') {
//     return 'house of delegates'
//   }
// };
//
// const getAllMoney = function(callData, callback){
//   async.autoInject({
//     getDelegates:(cb)=>{
//       getCandidates({year:callData.year, office:'Virginia_House_of_Delegates_elections'}, (e,cand_object)=>{
//         if(e) return cb(e);
//         async.map(cand_object, (candidate_object, call)=>{
//           const money_obj = {
//             election_year: callData.year,
//             name: candidate_object.name,
//             district: candidate_object.District.trim(),
//             party: "Democrat",
//             state: "Virginia",
//             office: office('Virginia_House_of_Delegates_elections'),
//             election_type:callData.election_type,
//             asOf: new Date
//           };
//           getMoney({name:candidate_object.name}, (e,money_object)=>{
//             if(e) return call(e);
//             money_obj["contributions"] = money_object ? money_object.contributions : null;
//             money_obj["expenditures"] = money_object ? money_object.expenditures : null;
//             console.log(money_obj)
//             return call(null, money_obj);
//           })
//         }, (e,res)=>{
//           if(e) return cb(e);
//           return cb(null, res);
//         })
//       })
//     },
//     getSenators:(cb)=>{
//       getCandidates({year:callData.year, office:'Virginia_State_Senate_elections'}, (e,cand_object)=>{
//         if(e) return cb(e);
//         async.map(cand_object, (candidate_object, call)=>{
//           const money_obj = {
//             election_year: callData.year,
//             name: candidate_object.name,
//             district: candidate_object.District.trim(),
//             party: "Democrat",
//             state: "Virginia",
//             office: office('Virginia_State_Senate_elections'),
//             election_type:callData.election_type,
//             asOf: new Date
//           };
//           getMoney({name:candidate_object.name}, (e,money_object)=>{
//             if(e) return call(e);
//             money_obj["contributions"] =  money_object ? money_object.contributions : null;
//             money_obj["expenditures"] = money_object ? money_object.expenditures : null;
//             console.log(money_obj)
//             return call(null, money_obj);
//           })
//         }, (e,res)=>{
//           if(e) return cb(e);
//           return cb(null, res);
//         })
//       })
//     }
//   }, (e,r)=>{
//     if(e) return e;
//     return callback(null, r);
//   })
// }
//
// getAllMoney({year:2019, election_type: 'General'}, (e,r)=>{    console.log("The main thing",r);
// });
// getMoney({name:'Jeff Bourne'});

function getId(office_name){
  if(office_name == 'State Senate'){
    return 9
  } else if (office_name == 'House of Delegates') {
    return 8
  }
};
const getCandidateNames = function(callData){
  const office_id = getId(callData.office)
  request({
    uri:`https://historical.elections.virginia.gov/elections/search/`,
    qs:{
      year_from:callData.year,
      year_to:callData.year,
      office_id:office_id,
      stage:callData.electionType,
      show_details:1
    },
    jar: true
  }, (e,r,b)=>{
    if(e) return e;
    const $ = cheerio.load(b);
    let name_array = []
    $('.name').map(function(x){
      const name = $( this ).text()
      const party = $('tr:contains(' + name + ')').has('.party').text().split("\n")[29];
      if(name !== 'Home'){
        const dupe = name_array.find(y=>{
          return y.name === name
        })
        if(!dupe){
          name_array.push( {name, party: party.trim() === "Democratic" ? "Democrat" : party.trim()} )
        }
      }
      // console.log(party)
    })
    name_array = [...new Set(name_array)];
    const filtered_array = name_array.filter(x=>{
      return x.party === "Democrat"
    })
    console.log(filtered_array);
  })
};


function sortOffice(office_name){
  if(office_name.includes("Senate") || office_name .includes("Senator")){
    return "state senator";
  } else if (office_name.includes("Delegate") || office_name.includes("House")) {
    return "state delegate";
  } else{
    return "N/A"
  }
}
const readReportCsv = function(callData, callback){
  const results = []
  got.stream(`https://apps.elections.virginia.gov/SBE_CSV/CF/${callData.year}_11/Report.csv`)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    const report_array = results.map(x=>{
      const report_object = {
        name: x.CandidateName,
        report_id:x.ReportId,
        district:x.District,
        party:x.Party === "Democratic" ? "Democrat" : x.party,
        office:sortOffice(x.OfficeSought),
        asOf: new Date(),
        election_year: callData.year,
        state: "Virginia",
        election_type:callData.election_type
      }
      return report_object
    })
    return callback(null, report_array.filter(x=>{return x.name && x.party === "Democrat" && x.office !== "N/A"}));
  });
}

const readScheduleHCsv = function(callData, callback){
  const results = []
  got.stream(`https://apps.elections.virginia.gov/SBE_CSV/CF/${callData.year}_11/ScheduleH.csv`)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const report_array = results.map(x=>{
        const report_object = {
          contributions: x.TotalReceiptsThisElectionCycle,
          expenditures:x.TotalDisbursements,
          report_id:x.ReportId
        }
        return report_object
      })
      return callback(null, report_array)
    });
}

const getMoney = function(callData, callback){
  readReportCsv({year:callData.year, election_type:callData.election_type}, (e, candidate_data)=>{
    if(e) return e;
    readScheduleHCsv({year:callData.year, election_type: callData.election_type}, (e, money_object)=>{
      if(e) return e;
      async.mapSeries(candidate_data, (can_d, cb)=>{
        const this_money = money_object.find(x=>{
          if(x.report_id === can_d.report_id){
            return x;
          }
        })
        result_object = {
          expenditures: this_money ? parseFloat(this_money.expenditures) : null,
          contributions: this_money ? parseFloat(this_money.contributions) : null,
          state: "Virginia",
          district:can_d.district.replace(/\D/g, ""),
          name: can_d.name,
          office: can_d.office,
          asOf: new Date(),
          election_year: callData.year,
          election_type: callData.election_type,
          party: can_d.party,
          name_year:can_d.name + callData.year + callData.election_type
        }
        return cb(null, result_object)
      },(e,r)=>{
        if(e) return callback(e);
        const result = r.filter(x=>{
          return x.contributions !== null
        });
        callback(null, result)
      })
    })
  })
}

const loadData = function(callData){
  getMoney({year:callData.year, election_type:callData.election_type}, (e,money_object)=>{
    if(e) return e;
    loader.loadFinanceArray(money_object);
    return money_object;
  });
}

loadData({year:2019, election_type:"General"})


// getCandidateNames({election_type:'General', office:'House of Delegates', year: 2019}); //The offices are State Senate and House of Delegates case sensitive
