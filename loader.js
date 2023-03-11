const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

let state = argv.state ? argv.state.toLowerCase() : undefined;
const loadType = argv.loadType;
const year = argv.year == undefined ? new Date().getFullYear() : argv.year ;
const office = argv.office;
const report = argv.report;
const election_type = argv.election_type;
const district = argv.district;
const loadGoLiveStates = argv.loadGoLiveStates;

const ElectionResultsLoader = require('./ElectionResults/load');
const elections = require('./ElectionResults/pull');
const getStorage = require('./Storage');
const stateSearches = require('./StateSearches');
const CampaignFinanceLoader = require('./Finances/load');
const CensusDataLoader = require('./censusTools/load');
const census_tools = require('./censusTools/index');
const go_live_states = require('./miscellaneousVariables');




async function loadElectionResults(storage, final) {
  try{
    const upper = await elections.getStateElectionHistoryForLevel({state,level:'upper'});
    const lower = await elections.getStateElectionHistoryForLevel({state,level:'lower'});

    const all = [];
    
    upper.concat(lower).forEach(x => x.forEach(y => all.push(y)));
    // console.log(JSON.stringify(all,null,2));


    const loader = new ElectionResultsLoader(storage.models);

    await loader.loadElectionResults(all, final);
    return;
  } catch(e){
    console.log('load Election Results Error starting in the main load file:', e)
  }


}

const callData = {
  state,
  year,
  office,
  election_type,
  report
}

async function loadFinanceResults(storage, final){
  try{
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
        await loader.loadCampaignFinances(r, final);
      })
    }
  } catch(e){
    console.log('Error beginning in load Finance Results in the main loader:', e)
  }

}

async function loadCensusData(storage){
  try{
    console.log('census loader called');
    const loadup = new CensusDataLoader(storage.models);
  
    const census_data = await census_tools(year);
  
    await loadup.loadCensusData(census_data);
  }catch(e){
    console.log(e)
  }

}


async function loader() {
  try {
    const isLoadTypeElections = await loadType == 'elections';
    const isLoadTypeFinance = await loadType == 'finance';
    const isLoadTypeCensus = await loadType == 'census';
    console.log(await loadType)
    const storage = await getStorage();
    console.log('Promise pending', storage);

    if(isLoadTypeElections) {

        await loadElectionResults(storage);
        return;

    } else if(isLoadTypeFinance){

      await loadElectionResults(storage);
      const state_split = state.split(" ");

      if (state_split.length == 2){
        state = `${state_split[0]}_${state_split[1]}`
      }
      await loadFinanceResults(storage.models);
      
      return;
      } else if (isLoadTypeCensus){

        await loadCensusData(storage);
        return;

      } else {
          throw new Error("invalid loadType: "+loadType);
      }
  } catch(e){
    throw new Error(e)
  }





} 


async function loadData(){
  const storage = await getStorage();
  
  if(!loadGoLiveStates){
    try{
      await loader();
      return;
    }catch(e){
      console.log('Single load fail in the main loader file', e)
    }
    
  } else {

    try{
      for await (live_state of go_live_states){
        state = live_state.state;
        callData.state = state;
        callData.election_type =  live_state.election_type;
        const years =  live_state.years;
        const index = go_live_states.findIndex(object =>{
          return object.state === live_state;
        });
        const go_live_length = go_live_states.length;

        const final_state = index === go_live_length;
        setTimeout(async ()=>{
          for (live_year of years){
            callData.year = live_year;
              await loader();
    
              continue;
    
            
          }
        }, 30000)
        continue;
    }
  } catch(e){
      console.log(`failed to load data for ${callData.state}. Failled with response: ${e}`);
    }

  }
  return;
}

loadData()
