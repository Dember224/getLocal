const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const stateSearches = require('./StateSearches');
const loadFinanceArray = require('./Loaders/uploadFinances').loadFinanceArray;
const getElectionResults = require('./ElectionResults')

const argv = yargs(hideBin(process.argv)).argv
const state = argv.state;
const command = argv.command;
const year = argv.year == undefined ? new Date().getFullYear() : argv.year ;
const office = argv.office;
const report = argv.report;
const election_type = argv.election_type


const callData = {
  year,
  election_type:'General',
  office,
  report
}

//if else becasue switch statements are for cowards.
if(command == 'getFinanceData'){
  stateSearches[state][command]({year, election_type, office}, (e,r)=>{
    if(e) console.log(e);
    console.log(r);
  })
} else if(command == 'loadData'){
  stateSearches[state]['getFinanceData'](callData, (e,r)=>{
    if(e) return e;
    loadFinanceArray(r);
  })
} else if ( command == 'getStateElectionResults') {
  getElectionResults[command]({state, year, level:office}).then((results)=>{
    console.dir(JSON.stringify(results,null, 2))
  })
} else if (command == 'getAllLegistlatureElections'){
  getElectionResults[command];
} else if (command == 'getStateLegislatureLinks'){
  getElectionResults[command];
} else {
  throw new Error('The index file does not recognize your command.')
}
