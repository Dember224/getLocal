const request = require('request');
const tools = require('../../Tools/parsers.js');
const cheerio =  require('cheerio');
const async = require('async');
const dates = require('../../Tools/date_tools.js');
const loader = require('../../Loaders/uploadFinances.js');

const getCandidates = function(callData, callback){
  request({
    uri:'https://dos.elections.myflorida.com/candidates/extractCanList.asp',
    form:{
      elecID: `${dates.getElectionDate(callData.year)}-GEN`, //return general election only
      office: 'LEG', //office list in values at the bottom of page
      status: 'All',
      cantype: 'STA', //state level candidates local
      FormSubmit: 'Download Candidate List'
    },
    method:'POST',
    followAllRedirects: true,
    headers:{
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  }, (e,r,b)=>{
    if(e) return e;
    const candidate_array = tools.txtParser(b).filter(x=>{return x.PartyCode==='DEM'});
    return callback(null, candidate_array);
  })
}

const getCost = function(callData, callback){
  request({
    uri:`https://dos.elections.myflorida.com/cgi-bin/${callData.expend_or_contrib}.exe`,
    method:'POST',
    form:{
      election: `${dates.getElectionDate(callData.year)}-GEN`,
      CanFName: callData.first_name,
      CanLName: callData.last_name,
      CanNameSrch: 1,
      office: 'All',
      cdistrict: '',
      cgroup: '',
      party: 'DEM',
      search_on: 3,
      ComName: '',
      ComNameSrch: 2,
      committee: 'All',
      cfname: '',
      clname: '',
      namesearch: 2,
      ccity: '',
      cstate: '',
      czipcode:'',
      cpurpose: '',
      cdollar_minimum:'',
      cdollar_maximum: '',
      rowlimit: 500,
      csort1: 'DAT',
      csort2: 'CAN',
      cdatefrom: '',
      cdateto: '',
      queryformat: 1,
      Submit: 'Submit',
    },
    headers: {
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
    }
  }, (e,r,b)=>{
    if(e) return e;
    const $ = cheerio.load(b);
    const total_segment = $('pre').text()
    const total = total_segment.split(':')[1].split('\n')[0].trim()
    return callback(null, total);
  })
}

const getMoney = function(callData, callback){
  async.autoInject({
    getExpend:(cb)=>{
      getCost({expend_or_contrib:'expend', first_name: callData.first_name, last_name:callData.last_name, year: callData.year}, (e,expenditures)=>{
        if(e) return cb(e);
        return cb(null, expenditures)
      })
    },
    getContribs:(cb)=>{
      getCost({expend_or_contrib:'contrib', first_name: callData.first_name, last_name: callData.last_name, year:callData.year}, (e,contributions)=>{
        if(e) return cb(e);
        return cb(null, contributions)
      })
    }
  }, (e,r)=>{
    if(e) return e;
    const money_object = {
      expenditures:r.getExpend,
      contributions:r.getContribs
    };
    return callback(null, money_object)
  })
};

const getAllMoney = function(callData, callback){
  let count = 0;
  getCandidates({year:callData.year}, (e,candidate_array)=>{
    if(e) return e;
    async.mapSeries(candidate_array, (candidate_object, cb)=>{
      const return_object = {
        name: `${candidate_object.NameFirst} ${candidate_object.NameLast}`,
        office:candidate_object.OfficeDesc.toLowerCase(),
        district:parseInt(candidate_object.Juris1num),
        state:"Florida",
        asOf: new Date(),
        election_type: callData.election_type,
        election_year:new Date('01/01/'+callData.year).toGMTString(),
        name_year: `${candidate_object.NameFirst}${candidate_object.NameLast}${callData.year}${callData.election_type}`
      }
      getMoney({first_name:candidate_object.NameFirst, last_name:candidate_object.NameLast, year:callData.year}, (e,money_object)=>{
        if(e) return e;
        return_object['expenditures'] = parseFloat(money_object.expenditures.replace(/,/g, ''));
        return_object['contributions'] = parseFloat(money_object.contributions.replace(/,/g, ''));
        console.log("early returns",return_object)
        count +=1;
        return cb(null, return_object);
      })
    }, (e,r)=>{
      if(e) return e;
      console.log(`${count} records loaded`)
      return callback(null, r);
    })
  })
}

const loadData = async function(callData){
  await getAllMoney({year:callData.year, election_type:callData.election_type}, async (e,money_object)=>{
    if(e) return e;
    await loader.loadFinanceArray(money_object);
    return money_object;
  })
}
// loadData({year:2020, election_type:'General'})
module.exports = {
  loadData
}
