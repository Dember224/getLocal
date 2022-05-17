const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const loader = require('../../Loaders/uploadFinances.js');


const party_object = {
  'Constitution': 20,
  'Democrat':2,
  'Independent':19,
  'Libertarian':22,
  'Republican':5,
  "The People's Party":23,
  "Write-In": 21
}

const party_list = Object.keys(party_object);
//Republicans are still being rendered here.
//Changing the party on the request call doesn't seem to be doing anything.
//Will have to find a way to filter out the republicans later.
const getSearchSettings = function(callData,callback){
  request({
    uri:'https://fcpa.alabamavotes.gov/PublicSite/SearchPages/PoliticalRaceSearch.aspx?tb=politicalracesearch',
    qs:{
      tb: 'politicalracesearch'
    },
    json:true,
    headers: {
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
      'content-type': 'application/x-www-form-urlencoded',

    }
  },(e,r,b)=>{
    if(e) return e;
    const $ = cheerio.load(b);
    const election = `${callData.year} ELECTION CYCLE`;
    const office = callData.office.toUpperCase() //STATE SENATOR  OR STATE REPRESENTATIVE all caps
    const party = callData.party; //only first letter caps ex. Democrat
    const form_html = $(".md-form").html();
    const election_number = $(`option:contains(\'${election}')`).attr('value');
    const office_number = $(`option:contains(\'${office}')`).attr('value');
    const party_number =  party_object[party]

    const search_object = {
      election:election_number,
      office:office_number,
      party:party_number
    }
    return callback(null, search_object)
  })
}

const getFirstViewState = function(callData, callback){
  request({
    uri:'https://fcpa.alabamavotes.gov/PublicSite/SearchPages/PoliticalRaceSearch.aspx',
    json:true,
    headers: {
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
      'content-type': 'application/x-www-form-urlencoded',

    }
  }, (e,r,b)=>{
    if(e) return e;
    const $ = cheerio.load(b);
    const viewstate = $("#__VIEWSTATE").attr('value');
    const event_validation = $("#__EVENTVALIDATION").attr('value');
    const viewstate_generator = $("#__VIEWSTATEGENERATOR").attr('value')
    const election = `${callData.year} ELECTION CYCLE`;
    const office = callData.office.toUpperCase() //STATE SENATOR  OR STATE REPRESENTATIVE all caps
    const party = callData.party; //only first letter caps ex. Democrat

    const election_number = $(`option:contains(\'${election}')`).attr('value');
    const office_number = $(`option:contains(\'${office}')`).attr('value');
    const party_number =  party_object[party]
    const state_object = {
      viewstate,
      event_validation,
      viewstate_generator,
      election_number,
      office_number,
      party_number,
    }
    return callback(null, state_object)
  })
}

const getOfficeId = function (callData, callback){
  getFirstViewState({year:callData.year, office: callData.office, party: callData.party, district:callData.district}, (e,state_object)=>{
    if(e) return e;
    request({
      uri: 'https://fcpa.alabamavotes.gov/PublicSite/SearchPages/PoliticalRaceSearch.aspx',
      qs:{
        tb:'politicalracesearch'
      },
      form:{
        _ctl0_ToolkitScriptManager1_HiddenField:'',
        '__EVENTTARGET': '_ctl0$Content$ddlOffice',
        '__EVENTARGUMENT': '',
        '__LASTFOCUS': '',
        '__VIEWSTATE': state_object.viewstate,
        '__VIEWSTATEGENERATOR': state_object.viewstate_generator,
        '__SCROLLPOSITIONX': 0,
        '__SCROLLPOSITIONY': 0,
        '__EVENTVALIDATION': state_object.event_validation,
        '_ctl0:Content:ddlElection': 0,
        '_ctl0:Content:ddlOffice': state_object.office_number,
        '_ctl0:Content:ddlParty:ucddlParty': party_object[callData.party],
        '_ctl0:Content:ddlYearToShow': 0
      },
      method:'POST',
      headers: {
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
        'content-type': 'application/x-www-form-urlencoded',

      }
    }, (e,r,b)=>{
      if(e) return callback(e);
      const $ = cheerio.load(b);
      const viewstate = $("#__VIEWSTATE").attr('value');
      const event_validation = $("#__EVENTVALIDATION").attr('value');
      const viewstate_generator = $("#__VIEWSTATEGENERATOR").attr('value')
      const district = callData.office.includes('REPRESENTATIVE') ? `HOUSE DISTRICT ${callData.district}` : `SENATE DISTRICT ${callData.district}`;
      const district_id = $(`option:contains(\'${district}')`).attr('value');
      state_object['district_id'] = district_id;
      state_object['viewstate'] = viewstate
      state_object['event_validation'] = event_validation;
      state_object['viewstate_generator'] = viewstate_generator;
      return callback(null, state_object)
    })
  })
}

// getOfficeId({year: 2018, office:'State Representative', party: 'Democrat', district:68}, (e,r)=>{
//   if(e) return e;
//   console.log(r)
// })

const getCandidateMoney = function(callData, callback){

  getOfficeId({year:callData.year, office:callData.office, party:callData.party, district:callData.district}, (e, search_object)=>{
    if(e) return e;
    const district = callData.district
    request({
      uri:'https://fcpa.alabamavotes.gov/PublicSite/SearchPages/PoliticalRaceSearch.aspx',
      form:{
        "_ctl0:Content:ddlElection":search_object.election_number,
        "_ctl0:Content:ddlOffice":search_object.office_number,
        "_ctl0:Content:ddlParty:ucddlParty":party_object[callData.party],
        "_ctl0:Content:ddlDistrict":search_object.district_id,
        "_ctl0:Content:ddlYearToShow": callData.year,
        "_ctl0:Content:btnSearch": "Search",
        "__VIEWSTATE":search_object.viewstate,
        "__VIEWSTATEGENERATOR":search_object.viewstate_generator,
        "__EVENTVALIDATION":search_object.event_validation,
        "__SCROLLPOSITIONX": 0,
        "__SCROLLPOSITIONY": 188.8000030517578
      },
      method:'POST',
      headers: {
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
        'content-type': 'application/x-www-form-urlencoded',

      },

    }, (e,r,b)=>{
      if(e) return e;
      const $ = cheerio.load(b);
      const table = $('.table').text().split('\t\t\t\t')
      const table_arrays = table.map(x=>{
        return x.split('\n')
      })
      async.map(table_arrays,(array,cb)=>{
        let money_object = {}
        if(array[2]){
          money_object["name"] = array[2].trim();
          money_object["office"] = callData.office;
          money_object["state"] = "Alabama";
          money_object["district"] = callData.district;
          money_object["election_type"] = callData.election_type.trim();
          money_object["election_year"] = new Date('01/01/'+callData.year).toGMTString();
          money_object["name_year"] = `${array[2].trim()}${callData.year}${callData.election_type}`;
          money_object["party"] = callData.party
        }

        if(array[15]){
          money_object["contributions"] = parseFloat(array[15].trim().replace(/[^0-9.-]+/g,"")) + parseFloat(array[23].trim().replace(/[^0-9.-]+/g,""))
        }
        if(array[19]){
          money_object["expenditures"] = parseFloat(array[19].trim().replace(/[^0-9.-]+/g,""))
          money_object["asOf"] = new Date()
        }
        if(money_object.name){
          return cb(null, money_object)
        } else {
          return cb(null, null)
        }
      },(e,r)=>{
        if(e) return e;
        const r_map = r.filter(x=>{
          if(x !== null){
            return x
          }
        })
        return callback(null,r_map);
      })
    })
  })
}

// getCandidateMoney({year: 2018, district: 68, election_type: 'General', office:'STATE REPRESENTATIVE' }, (e,r)=>{
//   if(e) return e;
//   console.log(r)
// })


// getSearchSettings({year:2018, office:"STATE SENATOR", party:"Democrat"})
const checkAllDistricts = function(callData, callback){
  function range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx)
  }
  const district_numbers = callData.office === "STATE SENATOR" ? range(1,43) : range(44,149)
  async.mapSeries(district_numbers, (district,cb)=>{
    getCandidateMoney({year:callData.year, office:callData.office, district:district, election_type: callData.election_type, party:callData.party}, (e,money_object)=>{
      if(e) return e;
      return cb(null, money_object);
    })
  },(e,r)=>{
    if(e) return callback(e);
    const money_array = []
    r.map(x=>{
      x.map(y=>{
        money_array.push(y);
      })
    })
    if(e) return e;
    return callback(null,money_array)
  })
}

const getBothChamberData = function(callData, callback){
  async.autoInject({
    getHouseData:(cb)=>{
      checkAllDistricts({year:callData.year, office:'STATE REPRESENTATIVE', election_type:callData.election_type, party: callData.party}, (e,money_array)=>{
        if(e) return cb(e);
        return cb(null, money_array);
      })
    },
    getSenateData:(cb)=>{
      checkAllDistricts({year:callData.year, office:'STATE SENATOR', election_type: callData.election_type, party:callData.party}, (e,money_array)=>{
        if(e) return cb(e)
        return cb(null, money_array);
      })
    }
  }, (e,r)=>{
    if(e) return e;
    const return_array = []
    r.getHouseData.map(x=>{
      return_array.push(x);
    })
    r.getSenateData.map(x=>{
      return_array.push(x)
    })
    return callback(null, return_array)
  })
}

const getFinanceData = function(callData, callback){
  async.mapSeries(party_list, (party, cb)=>{
    getBothChamberData({year:callData.year, election_type: callData.election_type, party}, (e, sub_finance_array)=>{
      if(e) return cb(e);
      console.log(sub_finance_array, party)
      return cb(null, sub_finance_array);
    })
  }, (e,finance_array)=>{
    if(e) return callback(e);
    const return_array = [];
    finance_array.map(x=>{
      x.map(y=>{
        return_array.push(y)
      })
    })
    return callback(null, return_array);
  })
}

// getAllMoney({year:2018, election_type:'primary'})

const loadData = function(callData){
  getFinanceData({year:callData.year, election_type:callData.election_type}, (e,money_array)=>{
    if(e) return e;
    loader.loadFinanceArray(money_array);
    return money_array;
  })
}

// loadData({year:2018, election_type:'primary'})


module.exports = {
  getFinanceData
}
// const loadSenateData = async function(callData){
//   await checkAllDistricts({year:callData.year, office:callData.office, election_type:callData.election_type}, (e,money_array)=>{
//     if(e) return e;
//     loader.loadFinanceArray(money_array);
//     return money_array;
//   })
// }

// checkAllDistricts({year:2018, office:'STATE REPRESENTATIVE', election_type: 'primary'}, (e,r )=>{
//   if(e) return e;
//   console.log(r);
// })

// loadSenateData({year:2018,office:"STATE REPRESENTATIVE", election_type:"General"})
// 'https://fcpa.alabamavotes.gov/PublicSite/SearchPages/PoliticalRaceSearch.aspx?tb=politicalracesearch'

// _ctl0:Content:ddlElection: 169
// _ctl0:Content:ddlOffice: 19
// _ctl0:Content:ddlDistrict: 46
// _ctl0:Content:ddlParty:ucddlParty: 2
// _ctl0:Content:ddlYearToShow: 0
// _ctl0:Content:btnSearch: Search
