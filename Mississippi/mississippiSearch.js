const crawler = require('crawler-request');
const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const loader = require('../Loaders/uploadFinances.js');

function getOffice(text){
  if(text.includes('Representative')){
    return 'state representative'
  } else if( text.includes('Senate')){
    return 'state senator'
  }
}

const checkPDF = function(callData,callback){
  crawler(`https://www.sos.ms.gov/Content/documents/Elections/candidate%20qualifying/${callData.year}%20Candidate%20Qualifying%20List.pdf`).then(function(response){
    const response_array = response.text.split('\n')
    const senate_rep_array = response_array.map(x=>{
      if(x.includes('Senate') || x.includes('Representative')){
        if(x.includes('Democrat') && x.includes('State')){
          const data_obj = x.split('State');
          const name = data_obj[0].match(/[A-Z][a-z]+/g).join().replace(","," ").replace(","," ");
          const return_obj = {
            name,
            office: getOffice(data_obj[1]),
            district: data_obj[1].replace(/\D/g, "")
          }
          return return_obj;
        }
      }
    }).filter(x=>{
      if(x !== undefined){
        return x
      }
    })
    return callback(null, senate_rep_array)
  })
} //Requites a year be entered

// checkPDF({year:2019})
const getEntityId = function(callData,callback){
  request({
    uri: 'https://cfportal.sos.ms.gov/online/Services/MS/CampaignFinanceServices.asmx/CandidateNameSearch',
    form:{
      EntityName:callData.name,
      SearchBy:"Contains",
      SearchType:"CandidateCandidate"
    },
    jar:request.cookie('coo'),
    headers: {
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
      'content-type': 'application/json',
    },
    method:'POST',
    json:true

  },(e,r,b)=>{
    if(e) return callback(e);
    const $ =  cheerio.load(b)
    const to_parse = cheerio.text($("string"))
    const split_parse = to_parse.split(',')[0].split("\"")
    const entity_id = split_parse[5];
    // console.log('the entity id',entity_id)
    return callback(null, entity_id); //entity ID is logging to the console when I run this method solo. It is not passing to the callback. Running async doesn't help. Fuuuucccccckkkkkkk.
  })
} //Requires a name be entered

const getFilingId=function(callData, callback){
  async.autoInject({
    get_entity_id:(cb)=>{ //entity ID failuer above causes this method to return bubkiss. Cannot run finance reports until I get the workflow and filing ID from here. fuuuuukkkk
      getEntityId({name:callData.name},(e,entity_id)=>{
        if(e) return cb(e);
        return cb(null, entity_id)
      })
    },
    filingOptions:(get_entity_id,cb)=>{
      request({
        uri:'https://cfportal.sos.ms.gov/online/portal/cf/page/cf-search/~/ViewXSLTFileByName.aspx',
        qs:{
          providerName:'CF_CandidateDetails',
          EntityId:get_entity_id
        },
        jar:request.cookie('coo'),
        headers: {
          'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
          'content-type': 'application/x-www-form-urlencoded',
          'host': 'cfportal.sos.ms.gov',
          'accept':' application/json'
        }
      },(e,r,b)=>{
        if(e) return cb(e);
        const $ = cheerio.load(b);

        if($('tr').has('td[role=gridcell]:contains(' + callData.year  + ')').html()){
          const pre_election = $('tr').has('td[role=gridcell]:contains(' + callData.year  + ')').html().split(/\r?\n/)[4].split(/ data-val="|" onclick=/)[1]
          return cb(null, pre_election)
      } else if($('.k-button')["1"]){
        const data_val = $('.k-button')["1"]["attribs"]["data-val"].split('\n')
        const data_array = [0];
        data_val.map(x=>{
          if(data_array.includes(x[0])){
            data_array.push(x)
          }
        })
        if(data_val === data_array){
          console.log(data_array[0][0])
        }
        return cb(null, data_val[0])
      }

      else {
        return callback(null,null)
      }
      })
    }
  }, (e,r)=>{
    if (e) return e;
    return callback(null,r.filingOptions);
  })
}

// getFilingId({name:'kabir Karriem', year:2019}, (e,r)=>{
//   if(e) return e;
//   console.log("button", r);
// })

const getCampaignFinancePdf = function(callData, callback){
  getFilingId({name: callData.name}, (e,filingId)=>{
    if(e) return callback(e);
    crawler(`https://cfportal.sos.ms.gov/online/portal/cf/page/cf-search/~/ExecuteWorkflow.aspx?WorkflowId=g729911d7-f399-46d6-a1ca-f15c1294f82d&FilingId=${filingId}`).then(function(response){
      const text = response.text;
      if(text){
        const report_array = text.split('\n');
        if(report_array[26]){
          const contributions_array = report_array[26].split('$');
          const contributions = contributions_array[5];
          const expenditures_array = report_array[29].split('$')
          const expenditures = expenditures_array[5];
          return callback(null,{contributions,expenditures})
        } else{
          return callback(null,null)
        }
      } else{
        return callback(null,null)
      }
    })
  })
}

const getCandidateMoney = function(callData,callback){
  async.autoInject({
    getNames:(cb)=>{
      checkPDF({year:callData.year},(e,candidate_array)=>{
        if(e) return cb(e);
        return cb(null, candidate_array)
      })
    },
    parseNames:(getNames, cb)=>{
      async.mapSeries(getNames,(candidate_object, call)=>{
        const name = candidate_object.name;
        const office = candidate_object.office;
        const district = candidate_object.district;
        const year = callData.year

        return call(null, {name, office, district, year})
      }, (e,name_array)=>{
        if(e) return cb(e);
        return cb(null,name_array)
      })
    },
    makeReportCall:(parseNames, cb)=>{
      async.mapSeries(parseNames,(name_object,call)=>{
        // name = name office district year
        getCampaignFinancePdf({name:name_object.name},(e,money_object)=>{
          if(e) return call(e);
          if(money_object){
            const report_object = {
              name: name_object.name,
              office: name_object.office,
              district:name_object.district,
              state:"Mississippi",
              contributions:money_object.contributions ? parseFloat(money_object.contributions.replace(/,/g, '')) : null,
              expenditures:money_object.expenditures ? parseFloat(money_object.expenditures.replace(/,/g, '')) : null,
              asOf: new Date(),
              election_type:callData.election_type,
              election_year: new Date('01/01/'+callData.year).toGMTString(),
              name_year: `${name_object.name}${callData.year}${callData.election_type}`
            }
            console.log("The report", report_object)
            return call(null, report_object)
          } else{
            const report_object = {
              name: name_object.name,
              office: name_object.office,
              district:name_object.district,
              state:"Mississippi",
              contributions:null,
              expenditures:null,
              asOf: new Date(),
              election_type: callData.election_type,
              election_year: new Date('01/01/'+callData.year).toGMTString(),
              name_year: `${name_object.name}${callData.year}${callData.election_type}`
            }
            console.log("The report", report_object)
            return call(null, report_object);
          }
        })
      },(e,r)=>{
        if(e) return cb(e);
        return cb(null, r);
      })
    }
  },(e,r)=>{
    if(e) return callback(e);
    return callback(null, r.makeReportCall)
  })
}

//
// const loadMississippiFinances = function(callData){
//   getCandidateMoney({year:callData.year, election_type:callData.election_type}, (e,money_array)=>{
//     if(e) return e;
//     async.mapSeries(money_array,(money_object, cb)=>{
//       console.log(money_object);
//       loader.loadFinanceData(money_object);
//       return cb(null, money_object)
//     }, (e,r)=>{
//       if(e) return e;
//       return r;
//       loader.loadFinanceData({finished:true})
//     })
//   })
// }
//
getCandidateMoney({year:2019, election_type:"General"}, (e,money)=>{
  if(e) return e;
   console.log("the cahones on this guy", money)
   return money;
 })
//
//  const loadData = async function(callData){
//
//  }
// getCampaignFinancePdf({name:'Lee Jackson'},(e,r)=>{
//   if (e) return e;
//   console.log(r)
// })
