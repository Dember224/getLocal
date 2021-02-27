const request = require('request');


const getTexasOfficeID = function(){
  request({
    uri:'https://candidate.texas-election.com/Elections/getQualifiedCandidatesInfo.do',
    method:'POST',
    jar:request.cookie('coo')
  }, (e,r,b)=>{
    if(e) return e;
    console.log(b);
  })
}

getTexasOfficeID()
