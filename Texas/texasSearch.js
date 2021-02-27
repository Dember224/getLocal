const request = require('request');


const getTexasOfficeID = function(){
  request({
    uri:'https://candidate.texas-election.com/Elections/getQualifiedCandidatesInfo.do',
    method:'POST',
    jar:request.cookie('coo'),
    headers: {
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36"
    }
  }, (e,r,b)=>{
    if(e) return e;
    console.log(b);
  })
}

getTexasOfficeID()
