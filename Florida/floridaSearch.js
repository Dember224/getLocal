const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const loader = require('../Loaders/uploadFinances.js');

const getCandidates = function(callData, callback){
  const office = callData.office === "State Representative" ? "STR" : "STS"
  request({
    uri:'https://dos.elections.myflorida.com/candidates/canlist.asp',
    qs:{
      elecid: `${callData.election_year}${callData.election_date}-GEN`,//have to re-lookup election ID for new elections. Seems to be the date.
      OfficeGroup: "LEG",
      StatusCode: "ALX",
      OfficeCode: office,
      CountyCode: "ALL",
      OrderBy: "NAM",
      FormsButton1: "RUN QUERY"
    },
    method:'POST',
    json:true,
    headers: {
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
      'content-type': 'application/x-www-form-urlencoded',
    }
  }, (e,r,b)=>{
    if(e) return e;
    const $ = cheerio.load(b)
    const table = $("td").text().split('You can narrow your search results for candidates by county.  A search by county will provide a list of candidates running for offices for which all or a portion of the geographical area represented by the office is located in that county.  For information on county or municipal candidates, please contact your local  Supervisor of Elections.')
    if(!table[2]){return callback(null,{first_name:null,last_name:null,office:null})}
    const candidate_array = table[2].split(/[()][A-Z][A-Z][A-Z][()]/);
    const name_array = candidate_array.map((x,i)=>{
      if(i === 0){
        const first_name = x.split("\n")[9].trim().split(/[,\s]/gm)[0];
        const last_name = x.split("\n")[7].trim().split(/[,\s]/gm)[0];
        return {first_name, last_name, office}
      } else if(i === candidate_array.length - 1){
        return {first_name: null, last_name:null, office:null}
      }else  {
        if(x.includes("*Incumbent")){
          const first_name = x.split("\n")[7].trim().split(/[,\s]/gm)[0];
          const last_name = x.split("\n")[5].trim().split(/[,\s]/gm)[0];
          return {first_name, last_name, office}
        } else {
          const first_name = x.split("\n")[5].trim().split(/[,\s]/gm)[0];
          const last_name = x.split("\n")[3].trim().split(/[,\s]/gm)[0];
          return {first_name, last_name, office}
        }
      }
    }).filter(x=>{return x!== undefined})
    return callback(null, name_array)
  })
};

const getCashData = function(callData,callback){
  if(callData.first_name && callData.last_name){

    const office = callData.office === "State Representative" ? "STR" : "STS"
    request({
      uri:`https://dos.elections.myflorida.com/cgi-bin/${callData.spendType}.exe`,
      method:'POST',
      qs:{
        election: `${callData.election_year}${callData.election_date}-GEN`, //have to look up election code
        CanFName: callData.first_name,
        CanLName: callData.last_name,
        CanNameSrch: 2,
        office,
        party: 'DEM',
        search_on: 3,
        ComNameSrch: 2,
        committee: 'All',
        namesearch: 2,
        rowlimit: 500,
        csort1:'DAT',
        csort2:'CAN',
        queryformat: 1,
        Submit: 'Submit'
      },
      headers: {
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
        'content-type': 'application/x-www-form-urlencoded'
      }
    },(e,r,b)=>{
      if(e) return e;
      const $ = cheerio.load(b);
      const money = $('pre').text().split('\n')[3].split('Total:')[1].trim()
      return callback(null, money)
    })
  } else{
    return callback(null,null)
  }
}



const getAccountNumbers = function(callData, callback){
  request({
    uri:'https://dos.elections.myflorida.com/candidates/CanList.asp',
    qs:{
      elecid: `${callData.election_year}${callData.election_date}-GEN`,
      GenSubmit: "View List"
    },
    headers: {
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
      'content-type': 'application/json',
    },
    method:'POST',
    json:true
  }, (e,r,b)=>{
    if(e) return e;
    const $ = cheerio.load(b);
    const first_name = callData.first_name;
    const last_name = callData.last_name;
    if(first_name && last_name){
      const td = $('tr').has(`td:contains(${first_name}):contains(${last_name})`).last().html()
      const get_href = function(html){
        const $ = cheerio.load(html)
        const account_number = $('a').attr('href').split('=')[1]
        return callback(null,account_number)
      }

      get_href(td)
    } else{
      return callback(null, null);
    }
  })
}

const getDistrict = function(callData, callback){
  if(callData.account_number){
    request({
      uri:'https://dos.elections.myflorida.com/candidates/CanDetail.asp',
      qs:{
        account: callData.account_number
      },
      headers: {
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
        'content-type': 'application/x-www-form-urlencoded'
      },
      json:true
    },(e,r,b)=>{
      if(e) return e;
      const $ = cheerio.load(b);
      const party = $('td').text().split('\n')[12].trim()
      const district = $('td').text().split('\n')[5].match(/\d+/)[0]
      return callback(null, {party, district});
    })
  } else{
    return callback(null, null);
  }
}

const getCash = function(callData, callback){
  if(callData.account_number){
    request({
      uri:'https://dos.elections.myflorida.com/cgi-bin/TreSel.exe',
      method: 'POST',
      qs:{
        elecdesc:`${callData.election_year} General Election`,
        account: callData.account_number
      },
      headers: {
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
        'content-type': 'application/x-www-form-urlencoded'
      },
      json:true
    },(e,r,b)=>{
      if(e) return e;
      const $ = cheerio.load(b);
      console.log($('tr').text())
      const rows = $('tr').text().split('Total:')[1].split('\n')
      const contributions = rows[2];
      const expenditures = rows [8]
      return callback(null, {contributions, expenditures});
    })
  } else{
    return callback(null, null)
  }
}

const getMoney = function(callData,callback){
  async.autoInject({
    getRepCandidates:(cb)=>{
      getCandidates({office:"State Representative", election_year:callData.election_year, election_date:callData.election_date}, (e,name_array)=>{
        console.log("The rep name array", name_array)
        if(e) return e;
         return cb(null, name_array);
      })
    },
    getRepAccountNumbers:(getRepCandidates,cb)=>{
      async.map(getRepCandidates,(candidate_object, call)=>{
        console.log(candidate_object)
        const first_name = candidate_object.first_name;
        const last_name = candidate_object.last_name;
        const office = "State Representative";
        if(first_name  && last_name){
          getAccountNumbers({first_name, last_name, office, election_year:callData.election_year, election_date:callData.election_date}, (e, account_number)=>{
            if(e) return e;
            return call(null,{account_number:account_number, first_name, last_name, office});
          })
        } else {
          return call(null,null)
        }
      }, (e,r)=>{
        if(e) return e;
        return cb(null, r)
      })
    },
    getSenateCandidates:(cb)=>{
      getCandidates({office:"State Senator", election_year:callData.election_year, election_date:callData.election_date}, (e,name_array)=>{
        console.log("The senate name array", name_array)
        if(e) return e;
        return cb(null, name_array);
      })
    },
    getSenateAccountNumbers:(getSenateCandidates, cb)=>{
      async.map(getSenateCandidates,(candidate_object, call)=>{
        console.log(candidate_object)
        const first_name = candidate_object.first_name;
        const last_name = candidate_object.last_name;
        const office = "State Senator";
        if(first_name && last_name){
          getAccountNumbers({first_name, last_name, office, election_year:callData.election_year, election_date:callData.election_date}, (e, account_number)=>{
            if(e) return e;
            // console.log({account_number:number_object, first_name, last_name, office})
            return call(null, {account_number:account_number, first_name, last_name, office});
          })
        } else{
          return call(null,null)
        }
      }, (e,r)=>{
        if(e) return e;
        return cb(null, r)
      })
    }
  }, (e,r)=>{
    if(e) return e;

    return callback(null, {getSenateAccountNumbers: r.getSenateAccountNumbers, getRepAccountNumbers: r.getRepAccountNumbers})
    //You;ve got the name and account numbers on r. Do the request using this info. call an autoInject inside of thsi autoInject
  })
}

const getMoneyObject = function(callData, callback){
  getMoney({election_year:callData.election_year, election_date:callData.election_date},(e,r)=>{
    if(e) return e;
    async.autoInject({
      getReps:(call)=>{
        async.mapSeries(r.getRepAccountNumbers, (rep_object, cb)=>{
          if(rep_object){
            const account_number = rep_object.account_number;
            const name = `${rep_object.first_name} ${rep_object.last_name}`;
            const office = rep_object.office;
            const money_object = {};
            getDistrict({account_number, election_year:callData.election_year, election_date:callData.election_date}, (e, district_object)=>{
              if(e) return e;
              money_object["name"] = name;
              money_object["office"] = office;
              money_object["district"] = district_object.district;
              money_object["party"] = district_object.party;
              money_object["state"] = "Florida";
              money_object["election_year"] = callData.election_year;
              money_object["election_type"] = callData.election_type
              money_object["asOf"] = new Date
              money_object["name_year"] = `${name}${year}`
              getCash({account_number, election_year:callData.election_year, election_date:callData.election_date}, (e,cash)=>{
                if(e) return e;
                money_object["contributions"] = cash.contributions;
                money_object["expenditures"] = cash.expenditures;
                console.log(money_object)
                return cb(null, money_object)
              })
            })
          } else{
            return cb(null,null)
          }
        }, (e,r)=>{
          if(e) return e;
          return call(null, r);
        })
      },
      getSenators:(call)=>{
        async.map(r.getSenateAccountNumbers, (senate_object, cb)=>{
          if(senate_object){
            const account_number = senate_object.account_number;
            const name = `${senate_object.first_name} ${senate_object.last_name}`;
            const office = senate_object.office;
            const money_object = {};
            getDistrict({account_number, election_year:callData.election_year, election_date:callData.election_date}, (e, district_object)=>{
              if(e) return e;
              money_object["name"] = name;
              money_object["office"] = office;
              money_object["district"] = district_object.district;
              money_object["party"] = district_object.party;
              money_object["state"] = "Florida";
              money_object["election_year"] = callData.election_year;
              money_object["election_type"] = callData.election_type
              money_object["asOf"] = new Date
              getCash({account_number, election_year:callData.election_year, election_date:callData.election_date}, (e,cash)=>{
                if(e) return e;
                money_object["contributions"] = cash.contributions;
                money_object["expenditures"] = cash.expenditures;
                console.log(money_object)
                return cb(null, money_object)
              })
            })
          } else {
            return cb(null, null)
          }
        }, (e,r)=>{
          if(e) return e;
          return call(null, r);
        })
      }
    }, (e,res)=>{
      if(e) return e;
      const repDems = res.getReps.filter(x=>{
        if(x){
          return x.party === "Democrat"
        }
      }).filter(x=>{
        return x !== undefined;
      });
      const senDems = res.getSenators.filter(x=>{
        if(x){
          return x.party === "Democrat"
        }
      }).filter(x=>{
        return x !== undefined;
      })
      return callback(null,{repDems, senDems}); //have to loop through each of these.
    })
  })
}

loadFloridaRepFinances = function(callData){
  getMoneyObject({election_year: callData.election_year, election_date: callData.election_date, election_type:callData.election_type}, (e, money_arrays)=>{
    if(e) return e;
    loader.loadFinanceArray(money_arrays.repDems)
    return money_arrays.repDems;
  })
}

// getCandidates({office:"State Senator"}, (e,r)=>{
//   if(e) return e;
//   console.log(r)
// })
// getAccountNumbers({first_name:"William", last_name:"Fitzgerald"},(e,r)=>{
//   if (e) return e
//   console.log(r);
// })
// getCash({account_number:74295})

getMoneyObject({election_year: 2020, election_date: 1103, election_type:"General"}, (e, money_arrays)=>{
  if(e) return e;
  return money_arrays.repDems;
})

// loadFloridaRepFinances({election_year:2020, election_date:'1103', election_type:"General"})
// getDistrict({account_number:74154}, (e,r)=>{
//   if(e) return e;
//   console.log(r)
// })
// getCashData({office:"State Representative", first_name:'Keisha', last_name:'Grimsley',spendType: 'expend'}) //spendType is either contrib or expend
