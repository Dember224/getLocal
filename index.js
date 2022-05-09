const stateSearches = require('./StateSearches');
const loadFinanceArray = require('./Loaders/uploadFinances').loadFinanceArray;
const state = process.argv[3];
const command = process.argv[2];
const year = process.argv[4] == undefined ? new Date().getFullYear() : process.argv[4] ;
const office = process.argv[5];
const report = process.argv[6]

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
