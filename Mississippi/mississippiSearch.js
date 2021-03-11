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

    callback(null,candidate_object)
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
    method:'POST'

  },(e,r,b)=>{
    if(e) return callback(e);
    const $ =  cheerio.load(b)
    const to_parse = cheerio.text($("string"))
    const split_parse = to_parse.split(',')[0].split("\"")
    const entity_id = split_parse[5];
    console.log('the entity id',entity_id)
    callback(null, entity_id); //entity ID is logging to the console when I run this method solo. It is not passing to the callback. Running async doesn't help. Fuuuucccccckkkkkkk.
  })
} //Requires a name be entered

const searchAllCandidates = function(callData){
  checkPDF({year:2019},(e,candidate_array)=>{
    if(e) return e;
    async.map(candidate_array,function(candidate_object, cb){
      const split_name = candidate_object.name.split(/(?=[A-Z])/)
      const last_name = split_name.includes('Jr.') || split_name.includes('Sr.') ? split_name[split_name.length - 2] : split_name[split_name.length - 1];
      const first_name = split_name[0];


    })
  })

}

const getFilingOptions=function(callData){
  async.autoInject({
    get_entity_id:(cb)=>{ //entity ID failuer above causes this method to return bubkiss. Cannot run finance reports until I get the workflow and filing ID from here. fuuuuukkkk
      getEntityId(callData.name,(e,entity_id)=>{
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
        if(e) return e;
        console.log("The entity is", get_entity_id)
        console.log(r)
      })
    }
  })
}

getFilingOptions({name: 'Earth Robinson'})
