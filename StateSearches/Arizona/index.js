const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const loader = require('../../Loaders/uploadFinances.js');
const partyParser = require('../../Tools/parsers.js').partyParser

const getFinanceData = function(callData,callback){
  const startYear = callData.year;
  const endYear = callData.year;
  request({
    uri:`https://seethemoney.az.gov/Reporting/GetTableData?Page=1&startYear=${callData.startYear}&endYear=${callData.endYear}&IsLessActive=false&ChartName=1&ShowAllYears=false`,
    json:true,
    headers: {
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
      'content-type': 'application/x-www-form-urlencoded',
    },
    qs:{
      Page: 1,
      startYear: callData.startYear,
      endYear: callData.endYear,
      IsLessActive: false,
      ChartName: 1,
      ShowAllYears: false,
      ShowOfficeHolder: false
    }
  },(e,r,b)=>{
    if(e) return e;
    const $ = cheerio.load(b)
    // const pages = $('.paginate_button').text();
    const getTheMoney = b.map(x=>{
      const office_array = x.OfficeName ? x.OfficeName.split("-") : [null,null];
      const money_object = {
        name:`${x.EntityFirstName} ${x.EntityLastName}`,
        office:office_array[0] ? office_array[0].trim() : office_array[0],
        district:office_array[1] ? office_array[1].match(/(\d+)/)[0] : office_array[1],
        state:"Arizona",
        contributions:x.Income,
        expenditures:x.Expense,
        asOf: new Date(),
        election_year: new Date('01/01/'+callData.startYear).toGMTString(),
        election_type: 'General',
        name_year:`${x.EntityFirstName} ${x.EntityLastName}${callData.startYear}`,
        party: x.PartyName ? partyParser(x.PartyName) : x.PartyName
      }

      return money_object;
    });
    return callback(null, getTheMoney.filter(x=>{
      return x.office != null;
    }));
  })
};

const loadData = function(callData){
  getFinanceData({year: callData.year}, (e,money_array)=>{
    if(e) return e;
    loader.loadFinanceArray(money_array)
  })
}

module.exports = {
  getFinanceData
}


//paginate_button
