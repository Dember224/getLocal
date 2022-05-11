const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv)).argv
const stateSearches = require('./StateSearches');
const loadFinanceArray = require('./Loaders/uploadFinances').loadFinanceArray;
const state = argv.state;
const command = argv.command;
const year = argv.year == undefined ? new Date().getFullYear() : argv.year ;
const office = argv.office;
const report = argv.report;

//OK eff parsing an array to try and figure this out. Check for modules.

const callData = {
  year,
  election_type:'General',
  office,
  report
}

//if else becasue switch statements are for cowards.
if(command == 'getFinanceData'){
  stateSearches[state][command](callData, (e,r)=>{
    if(e) console.log(e);
    console.log(r);
  })
} else if(command == 'loadData'){
  stateSearches[state]['getFinanceData'](callData, (e,r)=>{
    if(e) return e;
    loadFinanceArray(r);
  })
}
