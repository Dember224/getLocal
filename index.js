const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const stateSearches = require('./StateSearches');
const loadFinanceArray = require('./Loaders/uploadFinances').loadFinanceArray;
const censusTools = require('./censusTools');
const storage = require('./Storage');
const electionResults = require('./ElectionResults/pull')

const argv = yargs(hideBin(process.argv)).argv
const state = argv.state;
const command = argv.command;
const year = argv.year == undefined ? new Date().getFullYear() : argv.year ;
const office = argv.office;
const report = argv.report;
const election_type = argv.election_type;
const district = argv.district;

const callData = {
  year,
  election_type,
  office,
  report
}
//Need to add getStateElectionResults and the ELectionResults loader into this file to call from index.
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
} else if (command =='getDistrictCensusData'){
  censusTools[command]({office, district, state}, (e, r)=>{
    if(e) console.log(e);
    console.log(r)
  })
} else if (command == 'getStateElectionResults'){
  electionResults[command]({state, year, level:office}).then((r)=>{
    console.log(r)
  }).catch((e)=>{
    throw new Error(`Failed to retrieve election results due to: ${e}`)
  })
} else if (command =='GetStorage'){
  storage()
} else {
  throw new Error('The index file does not recognize your command.')
}
