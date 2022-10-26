const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

let state = argv.state;
const loadType = argv.loadType;
const year = argv.year == undefined ? new Date().getFullYear() : argv.year ;
const office = argv.office;
const report = argv.report;
const election_type = argv.election_type;
const district = argv.district;

const ElectionResultsLoader = require('./ElectionResults/load');
const elections = require('./ElectionResults/pull');
const getStorage = require('./Storage');
const stateSearches = require('./StateSearches');
const CampaignFinanceLoader = require('./Finances/load');
const CensusDataLoader = require('./censusTools/load');
const census_tools = require('./censusTools/index')


async function loadElectionResults(storage) {

    const upper = await elections.getStateElectionHistoryForLevel({state,level:'upper'});
    const lower = await elections.getStateElectionHistoryForLevel({state,level:'lower'});

    const all = [];
    upper.concat(lower).forEach(x => x.forEach(y => all.push(y)));
    // console.log(JSON.stringify(all,null,2));


    const loader = new ElectionResultsLoader(storage.models);
    await loader.loadElectionResults(all);
}

const callData = {
  state,
  year,
  office,
  election_type,
  report
}

async function loadFinanceResults(storage){
  console.log('Finance results called')
  result = stateSearches[state]['getFinanceData'](callData, async (e,r)=>{
    if(e){
      throw new Error("Error retrieving finance results message: "+ e)
    } else {
      await loader.loadCampaignFinances(r)
    }
  })

  isPromise = result?.then;
  const loader = new CampaignFinanceLoader(storage);

  if(isPromise){
    result.then(async (r)=>{
      await loader.loadCampaignFinances(r);
    })
  }
}

async function loadCensusData(storage){
  try{
    console.log('census loader called');
    const loader = new CensusDataLoader(storage.models);
  
    const census_data = await census_tools(year);
  
    await loader.loadCensusData(census_data);
  }catch(e){
    console.log(e)
  }

}


async function loader() {

    const isLoadTypeElections = await loadType == 'elections';
    const isLoadTypeFinance = await loadType == 'finance';
    const isLoadTypeCensus = await loadType == 'census';
    console.log(await loadType)
    const storage = await getStorage();
    console.log('Promise pending', storage);

    if(isLoadTypeElections) {

        await loadElectionResults(storage);

    } else if(isLoadTypeFinance){

      await loadElectionResults(storage);
      const state_split = state.split(" ");

      if (state_split.length == 2){
        state = `${state_split[0]}_${state_split[1]}`
      }
      await loadFinanceResults(storage.models)
      } else if (isLoadTypeCensus){

        await loadCensusData(storage);

      } else {
          throw new Error("invalid loadType: "+loadType);
      }
} //honestly this entire thing should be in a try catch block. The error handling in this file is kinda bad. 
loader();
