const request = require('request');
const cheerio = require('cheerio');

const getPageNumbers = function(callData){
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
      const office_array = x.OfficeName.split("-")
      const money_object = {
        name:`${x.EntityFirstName} ${x.EntityLastName}`,
        office:office_array[0],
        district:office_array[1],
        state:"Arizona",
        contributions:x.Income,
        expenditures:x.Expense,
        asOf: new Date()
      }
      console.log(money_object)
      return money_object;
    });
  })
};

getPageNumbers({startYear:2020,endYear:2021});

//paginate_button
