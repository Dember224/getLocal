const crawler = require('crawler-request');
const request = require('request');
const cheerio = require('cheerio');
const async = require('async');

const checkPDF = function(callData,callback){
  crawler(`https://www.sos.ms.gov/Elections-Voting/Documents/QualifyingForms/${callData.year}%20Candidate%20Qualifying%20List.pdf`).then(function(response){
    const response_array = response.text.split('\n')
    const just_the_democrats = response_array.map(x=>{
      if(x.includes('Democratic')){
        if(x.includes('Representative') || x.includes('Senate')){
          return x.split("State");
        }
      }
    }).filter(function(x) {
      return x !== undefined;
    });

    const candidate_object = just_the_democrats.map(x=>{
      const district = x[1].replace(/\D/g, "")
      const candidate_details = {
        name: x[0],
        office:x[1].includes('Senate')?'Senate':'Representative',
        district,
        year:callData.year
      }
      return candidate_details;
    })

    return callback(null,candidate_object)
  })
} //Requites a year be entered

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
        if($('.k-button')["1"]){
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

          return cb(null, data_val)
      } else {
        return callback(null,null)
      }
      })
    }
  }, (e,r)=>{
    if (e) return e;
    return callback(null,r.filingOptions[0]);
  })
}

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
        if(e)return e;
        return cb(null, candidate_array)
      })
    },
    parseNames:(getNames, cb)=>{
      async.map(getNames,(candidate_object, call)=>{
        const split_name = candidate_object.name.split(/(?=[A-Z])/)
        const last_name = split_name.includes('Jr.') || split_name.includes('Sr.') ? split_name[split_name.length - 2] : split_name[split_name.length - 1];
        const first_name = split_name[0];
        const name = `${first_name} ${last_name}`;
        const office = candidate_object.office;
        const district = candidate_object.district;
        const year = candidate_object.year

        return call(null, {name, office, district, year})
      }, (e,name_array)=>{
        if(e) return e;
        return cb(null,name_array)
      })
    },
    makeReportCall:(parseNames, cb)=>{
      async.map(parseNames,(name_object,call)=>{
        // name = name office district year
        getCampaignFinancePdf({name:name_object.name},(e,money_object)=>{
          if(e) return e;
          if(money_object){
            const report_object = {
              name: name_object.name,
              office: name_object.office,
              district:name_object.district,
              year: name_object.year,
              contributions:money_object.contributions,
              expenditures:money_object.expenditures,
              asOf: new Date()
            }
            return call(null,report_object)
          } else{
            const report_object = {
              name: name_object.name,
              office: name_object.office,
              district:name_object.district,
              year: name_object.year,
              contributions:null,
              expenditures:null,
              asOf: new Date()
            }
            return call(null,report_object)
          }
        })
      },(e,r)=>{
        if(e) return e;
        return cb(null, r);
      })
    }
  },function(e,r){
    if(e) return e;
    return callback(null, r)
  })
}

getCandidateMoney({year:2019},(e,r)=>{
  if(e) return e;
  console.log(r);
})
// getCampaignFinancePdf({name:'Lee Jackson'},(e,r)=>{
//   if (e) return e;
//   console.log(r)
// })
