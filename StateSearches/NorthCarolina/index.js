const request = require('request');
const got = require('got');
const csv = require('csv-parser');
const cheerio = require('cheerio');
const async = require('async');
const loader = require('../../Loaders/uploadFinances.js');

function getOffice(contest_name){
  if(contest_name.includes('NC STATE SENATE')){
    return 'state senator';
  } else if (contest_name.includes('NC HOUSE OF REPRESENTATIVES')){
    return 'state representative';
  } else {
    return 'party not found'
  }
}

const getCandidateList = function(callData, callback){
  const results = [];
  got.stream(`https://s3.amazonaws.com/dl.ncsbe.gov/Elections/${callData.year}/Candidate%20Filing/Candidate_Listing_${callData.year}.csv`)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      let filtered_results = results.filter(x=>{
        if(x.party_candidate ==='DEM'){
          if(x.contest_name.includes('NC HOUSE OF REPRESENTATIVES') || x.contest_name.includes('NC STATE SENATE')){
            return x;
          }
        }
      })
      filtered_results = filtered_results.map(x=>{
        const return_object = {
          name:x.name_on_ballot,
          district:parseFloat(x.contest_name.replace(/\D/g, "")),
          office:getOffice(x.contest_name),
          election_year: new Date('01/01/'+callData.year).toGMTString(),
          election_type: callData.election_type,
          state:'North Carolina',
          asOf: new Date()
        };
        return return_object;
      })
      return callback(null, filtered_results);
    })
};

const searchCandidate = function(callData, callback){
  request({
    uri:'https://cf.ncsbe.gov/CFOrgLkup/CommitteeGeneralResult/',
    qs:{
      name: callData.name,
      useOrgName: 'True',
      useCandName: 'True',
      useInHouseName: 'True',
      useAcronym: 'False'
    }
  }, (e,r,b)=>{
    if(e) return e;
    const $ = cheerio.load(b);
    let var_obj = $('script').get().map(x=>{
      return $(x).html();
    })[13].split('\n')[8].split("=")[1]
    var_obj = JSON.parse(var_obj)[0]
    if(var_obj){
      const result_obj =  {
        sid:var_obj['SBoEID'],
        ogid:var_obj['OrgGroupID'],
        name: callData.name
      }
      return callback(null, result_obj)
    } else {
      return callback(null, null)
    }
  })
}

function findQuarter(obj){
if(obj.find(x=>{return x.ReportType === 'Fourth Quarter'}) !== undefined){
  return obj.find(x=>{return x.ReportType === 'Fourth Quarter'});
} else {
  if(obj.find(x=>{return x.ReportType === 'Third Quarter'}) !== undefined){
    return obj.find(x=>{return x.ReportType === 'Third Quarter'});
  } else {
    if(obj.find(x=>{return x.ReportType === 'Second Quarter'}) !== undefined){
      return obj.find(x=>{return x.ReportType === 'Second Quarter'})
    } else {
      if(obj.find(x=>{return x.ReportType === 'First Quarter'})){
        obj.find(x=>{return x.ReportType === 'First Quarter'})
      } else {
        return null;
      }
    }
  }
}
}

const getReportIds = function(callData, callback){
  searchCandidate({name: callData.name}, (e,org_obj)=>{
    if(e) return e;
    if(org_obj){
      request({
        uri:'https://cf.ncsbe.gov/CFOrgLkup/DocumentGeneralResult/',
        qs:{
          "SID":org_obj.sid,
          "OGID":org_obj.ogid
        }
      },(e,r,b)=>{
        if(e) return e;
        const $ = cheerio.load(b);
        let var_obj = $('script').get().map(x=>{
          return $(x).html()
        })[14].split('\n')[8].split('var data = ')[1]
        var_obj = JSON.parse(var_obj).filter(x=>{
          if(x.ReportYear == callData.year && x.DocumentType == 'Disclosure Report'){
            return x;
          }
        })
        return callback(null, findQuarter(var_obj));
      })
    } else {
      return callback(null,null)
    }
  })
}

const getMoney = function(callData, callback){
  request({
    uri:'https://cf.ncsbe.gov/CFOrgLkup/ReportDetail/',
    qs:{
      "RID":callData.rid,
      "TP":"SUM"
    },
    json: true
  }, (e,r,b)=>{
    if(e) return e;
    const $ = cheerio.load(b);
    let var_obj = $('script').get().map(x=>{
      return $(x).html();
    })[12]
  if(var_obj){
    var_obj = var_obj.split(/SetupGrid()|, "#gridSummary"/)[8].replace("(","")
    var_obj = JSON.parse(var_obj)
    if(var_obj){
      const contributions = var_obj.find(x=>{return x.Section === 'Contributions from Individuals'}).Cycle + var_obj.find(x=>{return x.Section === 'Contributions from Not-For-Profit Organizations'}).Cycle;
      const expenditures = var_obj.find(x=>{return x.Section ==='Total Expenditures'}).Cycle
      return callback(null, {contributions, expenditures})
    }else {
      return callback(null,{contribution:null, expenditures:null})
    }
  } else {
    return callback(null,{contribution:null, expenditures:null})
  }
  })
}

const getFinanceData = function(callData, callback){
  getCandidateList({year:callData.year, election_type:callData.election_type}, (e, candidate_list)=>{
    if(e) return e;
    async.mapSeries(candidate_list, (candidate_object,cb)=>{
      const id_obj = candidate_object;
      getReportIds({name:candidate_object.name, year: callData.year}, (e, report_id_obj)=>{
        if(e) return cb(e);
        if(report_id_obj !== null && report_id_obj !== undefined){
          candidate_object['report_id'] = report_id_obj.DataLink
            getMoney({rid:report_id_obj.DataLink}, (e, money_object)=>{
              if(e) return cb(e);
              id_obj['contributions'] = money_object.contributions;
              id_obj['expenditures'] = money_object.expenditures;
              id_obj['name_year'] = id_obj.name + callData.year + callData.election_type
              console.log(id_obj)
              return cb(null, id_obj);
            })
        } else{
          return cb(null, null);
        }
      })
    }, (e,r)=>{
      if(e) return e;
      const filtered_results = r.filter(x=>{
        return x !== null
      });
      let final_results = [];
      filtered_results.map(x=>{
        const in_final = final_results.find(y=>{return y.name_year === x.name_year});
        if(in_final){
          const index = final_results.indexOf(in_final);
          if(x.contributions > in_final.contributions){
            final_results.push(x);
            final_results.splice(index, 1);
          }
        } else {
          final_results.push(x)
        }
      })
      return callback(null,final_results);
    })
  })
}

const loadData = async function(callData){
  await getFinanceData({year:callData.year, election_type:callData.election_type}, async (e,money_array)=>{
    if(e) return e;
    await loader.loadFinanceArray(money_array);
    console.log(`loading ${money_array.length}  records....`)
    return money_array;
  })
}

// loadData({year:2020, election_type:'General'});


module.exports = {
  getFinanceData
}
