const request = require('request');
const async = require('async');

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
      lstFilerType: 'Committee',
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
        id:x[4],
        name:x[5],
        district:x[7]
      }
      return return_object
    })
    return callback(null, name_array)
  })
}

const combineCandidateAndMoney = function(callData){
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
              election_type: callData.election_type
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
      if(x && x.contributions != 0){
        return x
      }
    })
    console.log(filtered_list) //pass to callback when finished
  })
}

//have to get list of committees then assign a candidate name to that committee. Most NY candidates have their cash bound in committees rather than directly to the candidate.

combineCandidateAndMoney({office:'Member of Assembly', start_date:'01/01/2020', end_date:'12/31/2020', election_type:'primary'})

// getCandidateList({}, (e,r)=>{if(e) return e; console.log(r)})

// requestMoneyData({office:'Member of Assembly', start_date:'01/01/2020', end_date:'12/31/2020'}, (e,r)=>{if(e) return e; console.log(r)}) //Assembly must be 'Member of Assembly'
//need to find a way to get candidate party. 
