const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const fs = require('fs');
const pdf = require('pdf-parse');
const crawler = require('crawler-request');
const loader = require('../../Loaders/uploadFinances.js');
const partyParser = require('../../Tools/parsers.js').partyParser;


const getTexasElectionID = function(callData, callback){
  request({
    uri:'https://candidate.texas-election.com/Elections/getQualifiedCandidatesInfo.do',
    method:'POST',
    jar:request.cookie('coo'),
    headers: {
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
      'content-type': 'application/x-www-form-urlencoded',

    },
    qs:{
      nbElecYear: callData.year || 2020,
      cdParty:'',
      cdOfficeType: 'S',
      cdFlow: '0',
      idTown:0,
      idElection:callData.idElection,
    }
  }, (e,r,b)=>{
    if(e) return callback(e);
    let $ = cheerio.load(b);
    const election_html = $(callData.optionSearch);
    if(!callData.idElection){
      election_html.find('option').each((i,op)=>{
        if($(op).text().includes('GENERAL')){
          callback(null, $(op).attr('value'))
        };
      });
    } else {
      const senate_object = {};
      const all_districts = election_html.text().split("\n")
      const all_senate_districts = all_districts.map(x=>{
        if(x.includes(callData.office)){
          return x.trim();
        }
      }).filter((element)=>{
        return element !== undefined
      })
      election_html.find('option').each((i,op)=>{
        all_senate_districts.map((x)=>{
          if($(op).text().includes(x)){
            senate_object[x] = $(op).attr('value')
          }
        })
      })
      return callback(null,senate_object)
    }
  });
};

const getTexasCandidateNames = function(callData, callback){
  async.autoInject({
    get_election_id: (cb)=>{
      getTexasElectionID({year:2020,optionSearch:'#idElection', office:callData.office}, (e,election_id)=>{
        if(e) return cb(e);
        return cb(null, election_id)
      })
    },
    get_offices: (get_election_id,cb)=>{
      getTexasElectionID({year:2020,optionSearch:'#idOffice', idElection:get_election_id, office:callData.office}, (e,senate_offices)=>{
        if(e) return cb(e);
        return cb(null, {election_id:get_election_id, senate_offices})
      })
    }
  }, (e,r)=>{
    if(e) return e;
    const candidate_array = []
    async.eachOf(r.get_offices.senate_offices, function(office_id,office_name,cb){
      request({
        uri:'https://candidate.texas-election.com/Elections/getQualifiedCandidatesInfo.do',
        method:'POST',
        jar:request.cookie('coo'),
        headers: {
          'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
          'content-type': 'application/x-www-form-urlencoded',
        },
        qs:{
          nbElecYear: callData.year,
          cdParty:'',
          cdOfficeType: 'S',
          cdFlow: 'S',
          idTown:0,
          idElection:r.get_election_id,
          idOffice:office_id,
          results:'R'
        }
      }, (e,r,b)=>{
        if(e) return cb(e);
        let $ = cheerio.load(b);
        const text_array = $('p strong').text().split(/PARTY: |STATUS/);
        const party = text_array[1];
        const candidate_name = $('p strong').first().text();
        district_array = office_name.split(',');
        const office = office_name.split("DISTRICT")[0];
        const district = office_name.replace(/\D/g, "");
        candidate_object = {
          name: candidate_name,
          office:office,
          district:district,
          state: 'Texas',
          party
        }
        candidate_array.push(candidate_object)
        cb();
      })
    },(e,r)=>{
      if(e) return callback(e);
      return callback(null,candidate_array)
    } )
  })
}


const getCandidateMoney = function(callData, callback){
  async.autoInject({
    candidates:(cb)=>{
      getTexasCandidateNames({year:2020, office: callData.office},(e,candidate)=>{
        if(e) return e;
        return cb(null, candidate)
      })
    },
    pdf:(cb)=>{
      crawler('https://www.ethics.state.tx.us/data/search/cf/2021/CandE012021.pdf').then(function(response){
        const report_array = response.text.split("Report Due:1/15/21Report Number:");
        const num_of_reports = response.text.split("Report Due:1/15/21Report Number:").length - 1;
        console.log(`There are ${num_of_reports} candidates and pacs in this file`);
        return cb(null, report_array)
      })
    }
  },(e,r)=>{
    if(e) return e;
    const money_array = []
    r.candidates.forEach(candidate=>{
      if(candidate.name.length){
        const name_split = candidate.name.split(" ");
        const first_name = name_split[0]
        const last_name = name_split[name_split.length - 1]
        r.pdf.forEach(report=>{
          if(report.toUpperCase().includes(first_name) && report.toUpperCase().includes(`${last_name},`)){
            const report_array = report.split('\n');
            const report_object = {
              name: candidate.name,
              office:candidate.office,
              district:candidate.district,
              state:candidate.state,
              contributions: parseFloat(report_array[8]),
              expenditures: parseFloat(report_array[11]),
              asOf: new Date(),
              election_year:callData.election_year,
              election_type:callData.election_type,
              party:partyParser(candidate.party),
              name_year: `${candidate.name} ${callData.election_year}`
            }
            money_array.push(report_object)
          }
        })
      }
    })
      return callback(null, money_array)
  })
}

getCandidateMoney({election_year:2020, election_type:'GENERAL', office: "SENATOR"}, (e,r)=>{
  if(e) return e;
  console.log(r)
  return r
})



const loadSenateData = function(callData){
  getCandidateMoney({election_year:callData.election_year, election_type:callData.election_type, office:"SENATOR"}, (e,r)=>{ //office name must be capitalized
    if(e) return e;
    loader.loadFinanceArray(r)
  });
}

const loadRepData = function(callData){
  getCandidateMoney({election_year:callData.election_year, election_type:callData.election_type, office:"REPRESENTATIVE"}, (e,r)=>{ //office name must be capitalized
    if(e) return e;
    loader.loadFinanceArray(r)
    return r;
  });
}

const getAllData = function(callData, callback){
  async.autoInject({
    get_senate_data:(cb)=>{
      getCandidateMoney({election_year:callData.election_year, election_type:callData.election_type, office:"SENATOR"}, (e,r)=>{
        if(e) return cb(e);
        return cb(null, r);
      })
    },
    get_rep_data:(cb)=>{
      getCandidateMoney({election_year:callData.election_year, election_type:callData.election_type, office:"REPRESENTATIVE"}, (e,r)=>{
        if(e) return cb(e);
        return cb(null, r);
      })
    }
  }, (e,r)=>{
    if(e) return callback(e);
    const return_array = []
    r.get_senate_data.map(x=>{
      return_array.push(x);
    })
    r.get_re_data.map(x=>{
      return_array.push(x);
    })

    return callback(null, return_array)
  })
}

const loadData = function(callData){
  getAllData({election_year:callData.election_year, election_type:callData.election_type}, (e, r)=>{
    if(e) return e;
    loader.loadFinanceArray(r);
  })
}

// loadData({election_year:2020, election_type:"General"})
// loadSenateData({election_year:2020,election_type:"General"})

module.exports = {
  loadData
}
