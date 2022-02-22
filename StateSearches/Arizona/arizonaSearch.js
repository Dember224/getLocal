const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const loader = require('../../Loaders/uploadFinances.js');

const getTheMoney = function(callData,callback){
  const startYear = callData.startYear;
  const endYear = callData.endYear;
  request({
    uri:`https://seethemoney.az.gov/Reporting/GetTableData?Page=1&startYear=2020&endYear=2021&PartyID=10&IsLessActive=false&ChartName=1&ShowAllYears=false`,
    json:true,
    headers: {
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
      'content-type': 'application/x-www-form-urlencoded',
    },
    qs:{
      Page: 1,
      startYear: callData.startYear,
      endYear: callData.endYear,
      PartyID: 10,
      IsLessActive: false,
      ChartName: 1,
      ShowAllYears: false
    }
  },(e,r,b)=>{
    if(e) return e;
    const $ = cheerio.load(b)
    // const pages = $('.paginate_button').text();
    const getTheMoney = b.map(x=>{
      const office_array = x.OfficeName ? x.OfficeName.split("-") : [null,null];
      const money_object = {
        name:`${x.EntityFirstName} ${x.EntityLastName}`,
        office:office_array[0],
        district:office_array[1],
        state:"Arizona",
        contributions:x.Income,
        expenditures:x.Expense,
        asOf: new Date(),
        election_year: callData.startYear,
        election_type: 'General'
      }
      console.log(money_object)
      return money_object;
    });
    return callback(null, getTheMoney);
  })
};

const loadArizonaFinances = function(callData){
  getTheMoney({startYear:callData.startYear,endYear:callData.endYear}, (e,money_array)=>{
    if(e) return e;
    async.mapSeries(money_array, (money_object, cb)=>{
      console.log(money_object)
      loader.loadFinanceData(money_object)
      return cb(null, money_object);
    },(e,r)=>{
      if(e) return e;
      loader.loadFinanceData({finished:true})
      return r;
    })
  })
}
loadArizonaFinances({startYear:2020, endYear:2021})

//paginate_button
