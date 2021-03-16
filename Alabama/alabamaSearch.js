const request = require('request');
const cheerio = require('cheerio')

const getSearchSettings = function(){
  request({
    uri:'https://fcpa.alabamavotes.gov/PublicSite/SearchPages/PoliticalRaceSearch.aspx?tb=politicalracesearch',
    qs:{
      tb: 'politicalracesearch'
    },
    json:true,
    headers: {
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
      'content-type': 'application/x-www-form-urlencoded',

    }
  },(e,r,b)=>{
    if(e) return e;
    const $ = cheerio.load(b);
    const elements = $('.md-form').text()
    console.log(elements);
  })
}



getSearchSettings()


// 'https://fcpa.alabamavotes.gov/PublicSite/SearchPages/PoliticalRaceSearch.aspx?tb=politicalracesearch'

// _ctl0:Content:ddlElection: 169
// _ctl0:Content:ddlOffice: 19
// _ctl0:Content:ddlDistrict: 46
// _ctl0:Content:ddlParty:ucddlParty: 2
// _ctl0:Content:ddlYearToShow: 0
// _ctl0:Content:btnSearch: Search
