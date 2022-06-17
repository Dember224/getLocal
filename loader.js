const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

const state = argv.state;
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
const CampaignFinanceLoader = require('./Finances/load')


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
  election_type
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
async function loader() {
    const isLoadTypeElections = await loadType == 'elections';
    const isLoadTypeFinance = await loadType == 'finance';
    const storage = await getStorage()
    console.log('Promise pending', storage);
    if(isLoadTypeElections) {
        await loadElectionResults(storage.models);
    } else if(isLoadTypeFinance){
      // await loadElectionResults(storage);
      await loadFinanceResults(storage.models)
      } else {
          throw new Error("invalid loadType: "+loadType);
      }
}
loader();
