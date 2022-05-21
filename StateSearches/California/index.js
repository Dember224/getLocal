const request = require('request');
const fs = require('fs');
const unzipper = require('unzipper');
const csv = require('csv-parser');
const async = require('async');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const loader = require('../../Loaders/uploadFinances.js');
const partyParser = require('../../Tools/parsers.js').partyParser;

function getOffice(office_name){
  if(office_name ==='SEN'){
    return 'state senator'
  } else if(office_name === 'ASM'){
    return 'state assemblyman'
  }
}

const elect_nav = {
  general_2020:71,
  primary_2020:70,
  general_2018:63,
  primary_2018:62,
  general_2016:65,
  primary_2016:64
} //have to go to the url in the method below to get these. HTML layout makes it difficult to scrape.

const getCandidates = async function(callData, callback){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const nav_page = elect_nav[`${callData.election_type}_${callData.election_year}`]
  await page.goto(`https://cal-access.sos.ca.gov/Campaign/Candidates/list.aspx?electNav=${nav_page}`);
  let bodyHTML = await page.evaluate(() => document.body.innerHTML);
  const $ = cheerio.load(bodyHTML);
  const names = [];
  const body = $('a').each((i,x)=>{
    const name = $(x).html().replace('<br>','');
    const href = $(x).attr('href');
    const return_object = {
      name,
      href
    }
    names.push(return_object)
  })
  const filtered_names = await names.filter(x=>{

    if(x.href && !x.name.includes("Resources") && !x.name.includes('<') && !x.name.includes('\n') && !x.name.includes('State')&& !x.href.includes('http')){//god this is sloppy. Gotta find a better way later.
      return x;
    }
  })
  return callback(null, filtered_names)
  await browser.close();
}

function getOfficeDistrict(office_string){
  let return_object = {
    district: office_string.match(/\d+/)[0]
  };
  if(office_string.includes('ASSEMBLY')){
    return_object['office'] = 'state assemblyman'
  } else if (office_string.includes('SENATE')) {
    return_object['office'] = 'state senator'
  } else {
    return_object['office'] = null
  }
  return return_object
}

function searchOffice(office){
  if(office){
    if(office.includes('SENATE')){
      return 'SENATE'
    } else if(office.includes('ASSEMBLY')){
      return 'ASSEMBLY'
    } else{
      return null;
    }
  } else {
    return null;
  }
}

const getMoney = async function(callData, callback){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://cal-access.sos.ca.gov${callData.uri}`);
  let bodyHTML = await page.evaluate(() => document.body.innerHTML);
  const $ = cheerio.load(bodyHTML);
  const party = partyParser($('.hdr15').text());
  const year = callData.year;
  const election_type_upper = callData.election_type.toUpperCase()
  const district_element = $(`tr:contains("${year} ${election_type_upper}")`).html() ? $(`tr:contains("${year} ${election_type_upper}")`).html().split('table').map(x=>{
    if(x.includes(`${year} ${election_type_upper}`)){
      return x;
    }
  }).filter(x=>{return x})[0] : null
  const office_district = district_element ? district_element.split(/\n/).find(x=>{return x.includes('DISTRICT')}).split(/<|>/)[2] : null;
  let parse_money = '';
  const pure_office = office_district ? office_district : null;
  $(`tbody:contains("${searchOffice(pure_office)} ${callData.year};")`).each((i,x)=>{ //looking for the string ASSEMBLY 2020; or whatever office and year are sent in the callData
     if($(x).html().includes('CONTRIBUTIONS')){
       parse_money = $(x).html()
     }
  })
if(parse_money.split('\n').filter(x=>{
  return x.includes('TOTAL CONTRIBUTIONS')
})[0]){
  let contributions = parse_money.split('\n').filter(x=>{
    return x.includes('TOTAL CONTRIBUTIONS')
  })[0].split(/<|>/)[12].replace(/\$|,/g, '');

  contributions = parseFloat(contributions);

  let expenditures = parse_money.split('\n').filter(x=>{
    return x.includes('TOTAL EXPENDITURES')
  })[0].split(/<|>/)[12].replace(/\$|,/g, '');

  expenditures = parseFloat(expenditures);

  await browser.close();

  const return_object = {
    office: getOfficeDistrict(office_district).office,
    district: getOfficeDistrict(office_district).district,
    asOf: new Date(),
    election_year: new Date('01/01/'+callData.year).toGMTString(),
    state:'California',
    election_type: callData.election_type,
    contributions,
    expenditures,
    party
  }

  return callback(null, return_object)
} else{
  return callback(null, null)
}


}

// getMoney({uri:'/Campaign/Candidates/Detail.aspx?id=1360423', year: 2020, election_type:'primary'}, (e,r)=>{
//   if(e) return ;
//   console.log(r);
// })
// getCandidates({election_type:'primary', election_year:2020})

const getFinanceData = function(callData, callback){
  getCandidates({election_type:'primary', election_year:2020}, (e, candidate_array)=>{
    if(e) return e;
    let count = 1;
    let random_wait = Math.floor(Math.random()*15000)
    async.mapSeries(candidate_array, (candidate_object, cb)=>{
      setTimeout(() => { console.log("Retrieving record number", count); }, random_wait);
      count +=1;
      getMoney({uri:candidate_object.href, year: callData.year, election_type:callData.election_type}, (e,money_object)=>{
        if(e) return cb(e);
        if(candidate_object && money_object){
          const backwards_name = candidate_object.name.split(',');
          const first_name = backwards_name[1];
          const last_name = backwards_name[0];
          const name = `${first_name} ${last_name}`;

          money_object['name'] = name;
          money_object['name_year'] = `${name}${callData.year}${callData.election_type}`;
          console.log('The money', money_object)
          return cb(null, money_object)
        } else{
          return cb(null, null)
        }
      })
    },(e,r)=>{
      if(e) return e;
      const results = r.filter(x=>{
        if(x){
          return x;
        }
      })
      return callback(null, results)
    })
  })
}



const loadData = async function(callData){
  await getFinanceData({year:callData.year, election_type:callData.election_type}, async (e,money_array)=>{
    if(e) return e;
    await loader.loadFinanceArray(money_array);
    return money_array;
  })
}
// getAllMoney({year:2020, election_type:'primary'}, (e,r)=>{
//   if(e) return e;
//   console.log(r);
// })
// loadData({year:2020,election_type:'primary'})
module.exports={
  getFinanceData
}
