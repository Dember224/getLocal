const request = require('request');
const async = require('async');
const axios = require('axios');


function getOfficeNumber(office_name){
  if(office_name.includes('Senate')){
    return 11
  } else if (office_name.includes('Assembly')) {
    return 12
  }
}

function getOffice(office_name){
  if(office_name.match(/Senate|Senator/)){
    return 'state senator'
  } else if (office_name.match(/assemblyman|assembly|Assembly|assemblyman/)) {
    return 'state assemblyman'
  }
}

const requestMoneyData = function(callData, callback){
  const year = callData.start_date.split('/')[2];
  request({
    uri:'https://publicreporting.elections.ny.gov/AggregatedContributionsExpenditure/BindAggregatedData',
    form:{
      lstUCOfficeType: 1,
      lstStatus: '',
      lstUCCounty: '- Select -',
      lstUCMuncipality: '',
      lstUCOffice: getOfficeNumber(callData.office),
      lstUCDistrict: 'All',
      txtCurrentDate: '',
      txtDateFrom: callData.start_date,
      txtDateTo: callData.end_date,
      ddlSelectDate: 'Date Range',
      selectedOfficeType: 'State', //if we ever do local elections change this line
      selectedStatus: 'All',
      selectedCounty: '- Select -',
      selectedMunicipality:'- Select -',
      selectedOffice: callData.office,
      selectedDistrict: 'All'
    },
    jar: true,
    method: 'POST',
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      accept:'application/json, text/javascript, */*; q=0.01',
      'accept-language': 'en-US,en;q=0.9'
    },
    json:true,
    followRedirect:false
  }, (e,r,b)=>{
    if(e) return e;
    const money_object = b.aaData.map(x=>{
      const contributions = parseFloat(x[7].replace(/\$|,/g, ''));
      const expenditures = parseFloat(x[8].replace(/\$|,/g, ''));
      const office = getOffice(callData.office);
      const state = 'New York'
      const committee_id_split = x[1].split(' - ID')
      const committee_name = committee_id_split[0].trim();
      const id = committee_id_split[1].trim()
      const return_object = {
        contributions,
        expenditures,
        office,
        state,
        committee_name,
        id,
        election_year: new Date(callData.start_date).toGMTString(),
        asOf: new Date(),
        year,
      }
      return return_object;
    })

    return callback(null, money_object)
  })
}

const getCandidateList = function(callData, callback){
  request({
    uri:'https://publicreporting.elections.ny.gov/ActiveDeactiveFiler/GetSearchListOfFilersData',
    method:'POST',
    jar: true,
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      accept:'application/json, text/javascript, */*; q=0.01',
      'accept-language': 'en-US,en;q=0.9'
    },
    form:{ //making the call get all of the candidates. We'll sort through them later. There's only a few thousand.
      lstOfficeType: '1',
      lstCounty: '',
      lstMunicipality:'',
      lstStatus: 'All',
      lstFilerType: 'Candidate',
      lstOffice: '- Select -',
      lstDistrict: '- Select -',
      lstDateType: 'All',
      ddlCommitteeType: '- Select -',
      txtDateFrom: '',
      txtDateTo: ''
    },
    json:true

  }, (e,r,b)=>{
    if(e) return e;
    const name_array = b.aaData.map(x=>{
      const return_object = {
        id:x[5],
        name:x[6],
        district:x[8],
      }
      return return_object
    })

    return callback(null, name_array)
  })
}

const combineCandidateAndMoney = function(callData, callback){
  async.autoInject({
    getMoney:(cb)=>{
      requestMoneyData({office:callData.office, start_date: callData.start_date, end_date: callData.end_date}, (e,r)=>{
        if(e) return e;
        return cb(null, r);
      })
    },
    getCandidates:(getMoney, cb)=>{
      getCandidateList({}, (e,candidate_array)=>{
        if(e) return e;
        const money = getMoney.map(x=>{
          const this_candidate = candidate_array.find(y=>{
            if(y.id===x.id){
              return y;
            }
          })
          const election_type = callData.election_type
          if(this_candidate){ 
            const return_object = {
              name: this_candidate.name,
              district: this_candidate.district,
              contributions: x.contributions,
              expenditures: x.expenditures,
              office: x.office,
              state: x.state,
              election_year: x.election_year,
              asOf:x.asOf,
              year: x.year,
              name_year: this_candidate.name + x.year + election_type,
              election_type: callData.election_type,
              id: this_candidate.id
            }
            return return_object
          } else{
            return null;
          }

        })
        return cb(null, money)
      })
    }
  }, (e,r)=>{
    if(e) return e;
    const filtered_list = r.getCandidates.filter(x=>{
      if(x && x.contributions != 0 && x.name != ''){
        return x
      }
    })
    return callback(null, filtered_list) //pass to callback when finished
  })
}

//have to get list of committees then assign a candidate name to that committee. Most NY candidates have their cash bound in committees rather than directly to the candidate.

// combineCandidateAndMoney({office:'State Senate', start_date:'01/01/2022', end_date:'12/31/2022', election_type:'general'})

// getCandidateList({}, (e,r)=>{if(e) return e; console.log(r)})

// requestMoneyData({office:'Member of Assembly', start_date:'01/01/2020', end_date:'12/31/2020'}, (e,r)=>{if(e) return e; console.log(r)}) //Assembly must be 'Member of Assembly'
//need to find a way to get candidate party. 

const getFinancesAllLevels = function(callData, callback){
  const start_date = `01/01/${callData.year}`;
  const end_date = `12/31/${callData.year}`;
  combineCandidateAndMoney({office:'State Senate', start_date, end_date, election_type:callData.election_type}, (e, senate_money)=>{
    if(e) return e; 
    combineCandidateAndMoney({office:'Member of Assembly', start_date, end_date, election_type:callData.election_type}, (e, assembly_money)=>{
      if(e) return e;
      const finance_object = [];
      senate_money.map(x=>{
        finance_object.push(x);
      })
      assembly_money.map(x=>{
        finance_object.push(x)
      })
      // finance_object.map(x=>console.log(x))
      return callback(null, finance_object)

    })
  })
}

async function searchNames(filer_id){
  const results = await axios.post('https://publicreporting.elections.ny.gov/ActiveDeactiveFiler/GetSearchListOfFilersCandidateData', {
    strFilerID: filer_id
  });

  candidate_name_array = results.data.aaData[0] ?  results.data.aaData[0]: null;

  return candidate_name_array;
  
}

const getFinanceData = function(callData, callback){
  getFinancesAllLevels(callData, async (e, finance_array)=>{
    if(e) return e; 
    return_array = [];
    for(let index in finance_array){
      const finance_object = finance_array[index];
      const candidate_name_array = await searchNames(finance_object.id)
      if(candidate_name_array){
        finance_object.name = candidate_name_array[3];
        finance_object.district = candidate_name_array[6];
      }
      
      return_array.push(finance_object)
    }

    return callback(null, return_array);
  })
}

// getFinanceData({year:2022, election_type:'general'}, (e,r)=>{
//   if(e) return e;
//   console.log('return array called', r)
// });

module.exports = {
  getFinanceData
}