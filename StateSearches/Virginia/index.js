// const request = require('request');
// const cheerio = require('cheerio');
// const async = require('async');
// const csv = require('csv-parser');
// const fs = require('fs');
// const got = require('got');


// function getId(office_name){
//   if(office_name == 'State Senate'){
//     return 9
//   } else if (office_name == 'House of Delegates') {
//     return 8
//   }
// };
// const getCandidateNames = function(callData){
//   const office_id = getId(callData.office)
//   request({
//     uri:`https://historical.elections.virginia.gov/elections/search/`,
//     headers: {
//       'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
//     },
//     qs:{
//       year_from:callData.year,
//       year_to:callData.year,
//       office_id:office_id,
//       stage:callData.electionType,
//       show_details:1
//     },
//     jar: true
//   }, (e,r,b)=>{
//     if(e) return e;
//     const $ = cheerio.load(b);
//     let name_array = []
//     $('.name').map(function(x){
//       const name = $( this ).text()
//       const party = $('tr:contains(' + name + ')').has('.party').text().split("\n")[29];
//       if(name !== 'Home'){
//         const dupe = name_array.find(y=>{
//           return y.name === name
//         })
//         if(!dupe){
//           name_array.push( {name, party: party.trim() === "Democratic" ? "Democrat" : party.trim()} )
//         }
//       }
//       // console.log(party)
//     })
//     name_array = [...new Set(name_array)];
//     const filtered_array = name_array.filter(x=>{
//       return x.party === "Democrat"
//     })
//     console.log(filtered_array);
//   })
// };


// function sortOffice(office_name){
//   if(office_name.includes("Senate") || office_name.includes("Senator")){
//     return "state senator";
//   } else if (office_name.includes("Delegate") || office_name.includes("House")) {
//     return "state delegate";
//   } else{
//     return "N/A"
//   }
// }
// const readReportCsv = function(callData, callback){
//   const results = [];
//   const month = callData.month<10? `0${callData.month}` : callData.month;
//   const endpoint = `https://apps.elections.virginia.gov/SBE_CSV/CF/${callData.year}_${month}/Report.csv`;
//   got.stream(endpoint)
//   .pipe(csv())
//   .on('data', (data) =>{
//     try{
//       results.push(data)
//     } catch(e) {
//       return callback(e);
//     }
//   })
//   .on('end', () => {
//     try {
//       const report_array = results.map(x=>{
//       const report_object = {
//         name: x.CandidateName.replace(/(Mr|MR|Ms|Miss|Mrs|Dr|Sir|Senator|Hon.|Rev.|Delegate)(\.?)\s/,""),
//         report_id:x.ReportId,
//         district:x.District,
//         party:x.Party === "Democratic" ? "Democrat" : x.party,
//         office:sortOffice(x.OfficeSought),
//         asOf: new Date(),
//         election_year: callData.year,
//         state: "Virginia",
//         election_type:callData.election_type
//       }
//       return report_object
//     })
//     return callback(null, report_array.filter(x=>{
//       if( x.name && x.party === "Democrat" && x.office !== "N/A"){
//         return x
//       }
//     }));
//   } catch(e) {
//     return callback(e);
//   }
//   });
// }

// const readScheduleHCsv = function(callData, callback){
//   const results = [];
//   const month = callData.month<10? `0${callData.month}` : callData.month;
//   got.stream(`https://apps.elections.virginia.gov/SBE_CSV/CF/${callData.year}_${month}/ScheduleH.csv`)
//     .pipe(csv())
//     .on('data', (data) =>{
//       try {
//         results.push(data)
//       } catch(error) {
//         return callback(error)
//       }
//     })
//     .on('end', () => {
//       try{
//         const report_array = results.map(x=>{
//           const report_object = {
//             contributions: x.TotalReceiptsThisElectionCycle,
//             expenditures:x.TotalDisbursements,
//             report_id:x.ReportId
//           }
//           return report_object
//         })
//         return callback(null, report_array)
//       } catch(error) {
//         return callback(error)
//       }

//     });
// }

// const getMoney = function(callData, callback){
//   readReportCsv({year:callData.year, election_type:callData.election_type, month:callData.month}, (e, candidate_data)=>{
//     if(e) return e;
//     readScheduleHCsv({year:callData.year, election_type: callData.election_type, month:callData.month}, (e, money_object)=>{
//       if(e) return e;
//       let counter = 0;
//       async.map(candidate_data,(can_d, cb)=>{
//         const this_money = money_object.find(x=>{
//           if(x.report_id == can_d.report_id){
//             counter = counter + 1;
//             return x;
//           }
//         })
//         result_object = {
//           expenditures: this_money ? parseFloat(this_money.expenditures) : null,
//           contributions: this_money ? parseFloat(this_money.contributions) : null,
//           state: "Virginia",
//           district:can_d.district.replace(/\D/g, ""),
//           name: can_d.name.replace(/(Mr|MR|Ms|Miss|Mrs|Dr|Sir|Senator|Hon.|Rev.|Delegate)(\.?)\s/,""),
//           office: can_d.office,
//           asOf: new Date(),
//           election_year: new Date('01/01/'+callData.year).toGMTString(),
//           election_type: callData.election_type,
//           party: can_d.party,
//           name_year:can_d.name + callData.year + callData.election_type
//         }
//         return cb(null, result_object)
//       },(e,r)=>{
//         if(e) return callback(e);
//         const result = r.filter(x=>{
//           return x.contributions !== null
//         });
//         console.log(counter, " records were retrieved")
//         callback(null, result)
//       })
//     })
//   })
// }

// const getCommiteeRecords = function(callData){
//   const results = [];
//   const month = callData.month<10? `0${callData.month}` : callData.month;
//   got.stream(`https://apps.elections.virginia.gov/SBE_CSV/CF/${callData.year}_${month}/Report.csv`)
//   .pipe(csv())
//   .on('data', (data) => {
//     try {
//       results.push(data)
//     } catch(e) {
//       return callback(e);
//     }
//   })
//   .on('end', () => {
//     try {
//       const committee_records = results.filter(x=>{
//       return x.CandidateName === '';
//     })
//     console.log(committee_records)
//   } catch(e) {
//     console.log(e)
//   }
//   })
// }

// const getFinanceData = async function(callData, callback){
//   async.map([1,2,3,4,5,6,7,8,9,10,11,12], (month,cb)=>{
//     getMoney({year: callData.year, election_type:callData.election_type, month}, (e, money_object)=>{
//       if(e) return e;
//       const result_array = [];
//       money_object.map(x=>{
//         if(result_array.find(y=>{return x.name===y.name})){
//           const current_object = result_array.find(y=>{return x.name === y.name});
//           if(current_object.contributions > x.contributions){
//             const index = result_array.indexOf(current_object)
//             result_array.splice(index, 1)
//             result_array.push(current_object);
//           }
//         } else{
//           result_array.push(x);
//         }
//       })
//       return cb(null, result_array)
//     });
//   }, (e,result_array)=>{
//     if(e) return e;
//     const true_results = [];
//     result_array.map(x=>{
//       x.map(y=>{
//         true_results.push(y)
//       })
//     })
//     console.log({number_of_records: result_array.length})
//     return callback(null, true_results)
//   })
// }

// getFinanceData({year:2022}, (e,r)=>{
//   if(e) console.log(e);
//   console.log(r)
// })
// // getCommiteeRecords({year:2019})
// // checkAllMonths({year:2019, election_type:'General'})

// // const loadData = function(callData){
// //   getFinanceData({year:callData.year, election_type:callData.election_type}, (e,money_object)=>{
// //     if(e) return e;
// //     loader.loadFinanceArray(money_object);
// //     console.log(money_object)
// //     return money_object;
// //   });
// // }
// // loadData({year:2019, election_type:"General"})
// // getCandidateNames({election_type:'General', office:'House of Delegates', year: 2019}); //The offices are State Senate and House of Delegates case sensitive
// module.exports = {
//   getFinanceData
// }
const month_array = ['01', '02', '03', '04','05','06','07','08','09', '10','11','12'];
const axios = require('axios');
const parsers = require('../../Tools/parsers');

async function sleep(time) {
  console.log('sleeping',time);
  await new Promise((res,rej) => {
      setTimeout(res, time);
  });
}

function sortOffice(office_name){
  if(office_name.includes("Senate") || office_name.includes("Senator")){
    return "state senator";
  } else if (office_name.includes("Delegate") || office_name.includes("House")) {
    return "state delegate";
  } else{
    return "N/A"
  }
}

const getFinanceCSVPage = async function(callData){
  const response = await axios.get(`https://apps.elections.virginia.gov/SBE_CSV/CF/${callData.year}_${callData.month}/Report.csv
  `)
  const results_array = await parsers.csvParser(response.data);

  const report_array = results_array.map(x=>{
    const office = x.OfficeSought ? x.OfficeSought : '' 
    const report_object = {
      name: x.CandidateName ? x.CandidateName.replace(/(Mr|MR|Ms|Miss|Mrs|Dr|Sir|Senator|Hon.|Rev.|Delegate)(\.?)\s/,"") : null,
      report_num:x.ReportUID,
      district:x.District,
      party:x.Party === "Democratic" ? "Democrat" : x.Party,
      office:sortOffice(office),
      asOf: new Date(),
      election_year: callData.year,
      state: "Virginia",
      election_type:callData.election_type
    }
      return report_object
    })

  return report_array
}

const readScheduleHcsv = async function(callData){
  const response = await axios.get(`https://apps.elections.virginia.gov/SBE_CSV/CF/${callData.year}_${callData.month}/ScheduleH.csv`);

  const results = parsers.csvParser(response.data)

  const report_array = results.map(x=>{
    const report_object = {
      contributions: x.TotalReceiptsThisElectionCycle,
      expenditures:x.TotalDisbursements,
      report_id:x.ReportId,
      report_num: x.ReportUID
    }
    return report_object
  });

  return report_array
  
}

const getMoney = async function(callData){
  for await (month of month_array){
    await sleep((Math.random()) * 1000);
    const schedule_h = await readScheduleHcsv({year:callData.year, month, election_type:callData.election_type})
    const report = await readScheduleHcsv({year:callData.year, month, election_type:callData.election_type})

    console.log(schedule_h, report)
  }
}



getMoney({year:2022, election_type:'general'})