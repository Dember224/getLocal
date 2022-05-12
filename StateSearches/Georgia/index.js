const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const loader = require('../../Loaders/uploadFinances.js');

const getCandidates = function(callData, callback){
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
        name: unparsed[1] ? unparsed[1].trim().replace("(i)", "") : unparsed[1],
        first_name: unparsed[1] ? unparsed[1].trim().replace("(i)", "").split(" ")[0] : unparsed[1],
        last_name: unparsed[1] ? unparsed[1].trim().replace("(i)", "").split(" ")[1] : unparsed[1]
      }
      return return_object
    }).filter(x=>{
      if(x !== null && x.name){
        return x;
      }
    })
    return callback(null, candidate_array);
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
    return callback(null,{viewstate,eventvalidation,generator});
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
      jar: true,
      followAllRedirects: true,
      method: 'POST',
      headers: {
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
        'content-type': 'application/x-www-form-urlencoded',

      }
    }, (e,r,b)=>{
      if(e) return callback(e);
      // const $ = cheerio.load(b);
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

const getCandidateId = function(callData, callback){
  getEventTarget({lastName:callData.lastName, fistName:callData.firstName}, (e, event_object)=>{
    if(e) return e;
    request({
      uri: 'https://media.ethics.ga.gov/search/Campaign/Campaign_Namesearchresults.aspx',
      form:{
        '__VIEWSTATE': event_object.viewstate,
        '__EVENTVALIDATION':event_object.eventvalidation,
        '__VIEWSTATEGENERATOR':event_object.generator,
        '__EVENTTARGET':'ctl00$ContentPlaceHolder1$Search_List$ctl02$lnkViewID',
        '__EVENTARGUMENT':''
      },
      qs:{
        CommitteeName:'',
        LastName:callData.lastName,
        FirstName:callData.firstName,
        Method:0
      },
      jar: true,
      transport_method : 'query',
      followAllRedirects: true,
      method: 'POST',
      json:true,
      headers: {
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
        'content-type': 'application/x-www-form-urlencoded',


      }
    }, (e,r,b)=>{
      if(e) return e;
      // ctl00_ContentPlaceHolder1_Search_List_ctl02_lnkViewID this is the key
      const $ = cheerio.load(b);
      const filer_id = $('.lblentry').html();
      const name_id = $('form[name=aspnetForm]').attr('action') ? $('form[name=aspnetForm]').attr('action').split("=")[1] : "";
      const whole_name = $('#ctl00_ContentPlaceHolder1_NameInfo1_lblName').text()
      return callback(null,{filer_id, name_id, whole_name});
    })
  })
}

const getCandidatePage = function(callData,callback){
  getCandidateId({lastName:callData.lastName, firstName:callData.firstName}, (e,candidate_ids)=>{
    if(e) return e;
    request({
      uri:'https://media.ethics.ga.gov/search/Campaign/Campaign_Name.aspx',
      qs:{
        NameID:candidate_ids.name_id,
        FilerID:candidate_ids.filer_id,
        Type:"candidate"
      },
      headers: {
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
        'content-type': 'application/x-www-form-urlencoded',

      },
      followAllRedirects: true
    }, (e,r,b)=>{
      if(e) return e;
      const $ = cheerio.load(b);
      const viewstate = $('#__VIEWSTATE').attr('value');
      const generator = $('#__VIEWSTATEGENERATOR').attr('value');
      const validation = $('#__EVENTVALIDATION').attr('value');
      const the_office = $("#ctl00_ContentPlaceHolder1_Name_Reports1_TabContainer1_TabPanel2_lblOfficeSought").text()
      const page_object = {
        viewstate,
        generator,
        validation,
        name_id: candidate_ids.name_id,
        filer_id: candidate_ids.filer_id,
        whole_name: candidate_ids.whole_name,
        the_office
      }
      return callback(null, page_object);
    })
  })
}

const getDisclosureReportCDRID = function(callData, callback){
  getCandidatePage({lastName:callData.lastName,firstName:callData.firstName}, (e,page_object)=>{
    if(e) return e;
    request({
      uri:"https://media.ethics.ga.gov/search/campaign/campaign_name.aspx",
      qs:{
        NameID:page_object.name_id
      },
      form:{
        ctl00$ContentPlaceHolder1$RadScriptManager1: 'ctl00$ContentPlaceHolder1$UpdatePanel1|ctl00$ContentPlaceHolder1$Name_Reports1$TabContainer1$TabPanel1$dgReports$ctl02$View',
        ctl00_ContentPlaceHolder1_RadScriptManager1_TSM: ';;System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35:en-US:16997a38-7253-4f67-80d9-0cbcc01b3057:ea597d4b:b25378d2;Telerik.Web.UI, Version=2011.2.915.35, Culture=neutral, PublicKeyToken=121fae78165ba3d4:en-US:168ec6eb-791b-4159-8a0f-6c601196f873:16e4e7cd:f7645509:24ee1bba:f46195d3:19620875:874f8ea2:490a9d4e:bd8f85e4;AjaxControlToolkit, Version=3.0.20820.16598, Culture=neutral, PublicKeyToken=28f01b0e84b6d53e:en-US:707835dd-fa4b-41d1-89e7-6df5d518ffb5:b14bb7d5:13f47f54:369ef9d0:1d056c78:dc2d6e36:5acd2e8e:f8a45328',
        '__EVENTTARGET': 'ctl00$ContentPlaceHolder1$Name_Reports1$TabContainer1$TabPanel1$dgReports$ctl02$View',
        '__VIEWSTATE':page_object.viewstate,
        '__VIEWSTATEGENERATOR': page_object.generator,
        '__EVENTVALIDATION': page_object.validation,
        '__VIEWSTATEENCRYPTED':'',
        'ctl00_ContentPlaceHolder1_RadWin_ClientState':'',
        '__ASYNCPOST': 'true',
        '__EVENTARGUMENT': ''
      },
      method:'POST',
      followAllRedirects: true,
      headers: {
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
        'content-type': 'application/x-www-form-urlencoded',

      },
      jar: true,
      transport_method : 'query'
    }, (e,r,b)=>{
      if(e) return e;
      const cdrid =  b.split("CDRID=")[1] ? b.split("CDRID=")[1].replace("|","") : "";
      const cdrid_object = {
        cdrid,
        name_id: page_object.name_id,
        filer_id: page_object.filer_id,
        whole_name: page_object.whole_name,
        office: page_object.the_office
      }
      return callback(null, cdrid_object);
    })
  })
}

const getMoney = function(callData, callback){
  getDisclosureReportCDRID({lastName: callData.lastName, firstName: callData.firstName}, (e,cdrid_object)=>{
    if(e) return e;
    request({
      uri:'https://media.ethics.ga.gov/Search/Campaign/CCDR_Report_Summary.aspx',
      qs:{
        NameID:cdrid_object.name_id,
        FilerID:cdrid_object.filer_id,
        'CDRID':cdrid_object.cdrid,
        Name:cdrid_object.whole_name,
        Year:callData.year, //use election year
        Report: callData.report
      },
      headers: {
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
        'content-type': 'application/x-www-form-urlencoded',

      }
    }, (e,r,b)=>{
      if(e) return e;
      const $ = cheerio.load(b);
      const ccdr_text = $(".CCDRText").text()
      const contributions = ccdr_text.split("$")[14];
      const expenditures = ccdr_text.split("$")[16];
      const whole_office = cdrid_object.office
      const office = whole_office.split(",")[0];
      const district = whole_office.split(",")[1] ? whole_office.split(",")[1].split(" ")[2] : ",";
      const money_object = {
        name: cdrid_object.whole_name,
        office,
        district,
        state: "Georgia",
        contributions: contributions ? contributions.trim().replace(/[^0-9.-]+/g,"") : null,
        expenditures: expenditures ? expenditures.trim().replace(/[^0-9.-]+/g,"") : null,
        asOf: new Date(),
        election_type: callData.report.includes("Special") ? "Special" : "General",
        election_year: new Date('01/01/'+callData.year).toGMTString(),
        name_year:`${cdrid_object.whole_name}${callData.year}`
      }
      return callback(null, money_object)
    })
  })
}

const getFinanceData = function(callData, callback){
  getCandidates({office:callData.office, year:callData.year}, (e,candidate_array)=>{
    if(e) return e;
    async.mapSeries(candidate_array, (candidate_object, cb)=>{
      getMoney({lastName: candidate_object.last_name, firstName: candidate_object.first_name, report: callData.report, year: callData.year}, (e, money_object)=>{
        if(e) return e;
        console.log(money_object)
        return cb(null, money_object)
      })
    }, (e,r)=>{
      if(e) return callback(e);
      const money = r.filter(x=>{
        if(x.name){
          return x
        }
      })
      return callback(null, money);
    })
  })
};

const loadData = async function(callData){
  await getFinanceData({report: callData.report, year: callData.year, office: callData.office}, (e, money_array)=>{
    if(e) return e;
    loader.loadFinanceArray(money_array);
    return money_array;
  })
}

// get_all_money({report:'December 31st - Election Year', year:2020, office: "State Senate"}, (e, money_array)=>{
//   if(e) return e;
//   console.log(money_array)
// })
//remember to load senate and representatives election years and special elections
// loadData({report:'December 31st - Election Year', year:2020, office: "State Representative"})
//you have to use the weird date, and name of the year format commented on the line immediately preceeding this one. You can get the refrence from Georgia's UI.
module.exports={
  getFinanceData
}
