const request = require('request');
const cheerio = require('cheerio');

const getCandidates = function(callData){
  if(!callData.year){
    console.log("This function requires a year")
     return null;
   };
  if(callData.office !== 'State Senate' && callData.office !== 'State Representative'){
    console.log("The options for office are State Senate or State Representative")
    return null;
  };
  const web_address = callData.office === 'State Senate' ?  `https://ballotpedia.org/Georgia_State_Senate_elections,_${callData.year}#Primary_election` : `https://ballotpedia.org/Georgia_House_of_Representatives_elections,_${callData.year}#Primary_election`;
  request({
    uri:web_address
  }, (e,r,b)=>{
    if(e) return e;
    const $ = cheerio.load(b);
    const td = $('td').text()
    const raw_candidate_array = td.split("Office Democratic RepublicanOther")[1].split("District")
    const candidate_array = raw_candidate_array.map((x,i)=>{
      const unparsed = x.split('\n');
      if(i === 0){
        return null;
      }
      if(i ===1 ){
        return {district:unparsed[0],name:unparsed[3].trim()}
      }
      const return_object = {
        district: unparsed[0],
        name: unparsed[1] ? unparsed[1].trim().replace("(i)", "") : unparsed[1]
      }
      return return_object
    }).filter(x=>{
      if(x !== null && x.name){
        return x;
      }
    })
    console.log(candidate_array);
  })
}

const getCandidateViewstate = function(callData, callback){
  request({
    uri: 'https://media.ethics.ga.gov/search/Campaign/Campaign_ByName.aspx',
    qs:{
      ctl00$ContentPlaceHolder1$Search: 'Search for Candidate',
      ctl00$ContentPlaceHolder1$txtLast: callData.lastName,
      ctl00$ContentPlaceHolder1$txtFirst: callData.firstName,
      ctl00$ContentPlaceHolder1$rbLastName: 'rbLastNameBegins',
      ctl00$ContentPlaceHolder1$rbFirstName: 'rbFirstNameBegins',
      ctl00$ContentPlaceHolder1$txtCommittee:'' ,
      ctl00$ContentPlaceHolder1$rbNCType: 'rbNonCand',

    },
    method: 'POST',
    json:true
  }, (e,r,b)=>{
    if(e) return callback(e);
    const $ = cheerio.load(b);
    const viewstate = $('input').attr('value');
    const eventvalidation = $('#__EVENTVALIDATION').attr('value');
    const generator = $('#__VIEWSTATEGENERATOR').attr('value');
    callback(null,{viewstate,eventvalidation,generator});
  })
}

const getEventTarget = function(callData, callback){
  getCandidateViewstate({firstName:callData.firstName,lastName:callData.lastName}, (e,viewstate)=>{
    if(e) return;
    request({
      uri: 'https://media.ethics.ga.gov/search/Campaign/Campaign_ByName.aspx',
      form:{
        ctl00$ContentPlaceHolder1$Search: 'Search for Candidate',
        ctl00$ContentPlaceHolder1$txtLast: callData.lastName,
        ctl00$ContentPlaceHolder1$txtFirst: callData.firstName,
        ctl00$ContentPlaceHolder1$rbLastName: 'rbLastNameBegins',
        ctl00$ContentPlaceHolder1$rbFirstName: 'rbFirstNameBegins',
        ctl00$ContentPlaceHolder1$txtCommittee:'' ,
        ctl00$ContentPlaceHolder1$rbNCType: 'rbNonCand',
        ctl00$ContentPlaceHolder1$txtNonCommittee:'' ,
        '__VIEWSTATE': viewstate.viewstate,
        '__EVENTVALIDATION':viewstate.eventvalidation,
        '__VIEWSTATEGENERATOR':viewstate.generator
      },
      followAllRedirects: true,
      method: 'POST',
      headers: {
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
        'content-type': 'application/x-www-form-urlencoded',

      }
    }, (e,r,b)=>{
      if(e) return callback(e);
      // const $ = cheerio.load(b);
      //change the query string to a form and this should return a response body
      const $ = cheerio.load(b);
      const event_target = $(".lblentrylink").attr('id')
      const viewstate = $("#__VIEWSTATE").attr('value');
      const eventvalidation = $('#__EVENTVALIDATION').attr('value');
      const generator = $('#__VIEWSTATEGENERATOR').attr('value');
      const event_object = {
        event_target,
        viewstate,
        eventvalidation,
        generator
      }
      return callback(null, event_object)
    })
  })
}

const getCandidateData = function(callData){
  getEventTarget({lastName:callData.lastName, fistName:callData.firstName}, (e, event_object)=>{
    if(e) return e;
    console.log('The event object', event_object)
    request({
      uri: 'https://media.ethics.ga.gov/search/Campaign/Campaign_Namesearchresults.aspx',
      form:{
        '__VIEWSTATE': event_object.viewstate,
        '__EVENTVALIDATION':event_object.eventvalidation,
        '__VIEWSTATEGENERATOR':event_object.generator,
        '__EVENTTARGET':event_object.event_target
      },
      qs:{
        CommitteeName:'',
        LastName:callData.lastName,
        FirstName:callData.firstName,
        Method:0
      },
      transport_method : 'query',
      followAllRedirects: true,
      method: 'POST',
      headers: {
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
        'content-type': 'application/x-www-form-urlencoded',

      }
    }, (e,r,b)=>{
      if(e) return e;
      console.log(b);
    })
  })
}

getCandidateData({lastName:"Jordan", firstName:"Jen"})
// getCandidates({office:'State Senate', year:2020})
