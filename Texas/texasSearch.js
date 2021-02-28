const request = require('request');
const cheerio = require('cheerio');

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
      cdParty:'D',
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
        if(x.includes("SENATOR")){
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
      callback(null,senate_object)
    }
  });
};


getTexasElectionID({year:2020,optionSearch:'#idOffice', idElection:44144})
