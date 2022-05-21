const [,, loadType, state, year] = process.argv;

async function loadElectionResults(storage) {
    const elections = require('./ElectionResults/pull');
    const upper = await elections.getStateElectionHistoryForLevel({state,level:'upper'});
    const lower = []; // await elections.getStateElectionHistoryForLevel({state,level:'lower'});

    const all = [];
    upper.concat(lower).forEach(x => x.forEach(y => all.push(y)));
    // console.log(JSON.stringify(all,null,2));

    const ElectionResultsLoader = require('./ElectionResults/load');
    const loader = new ElectionResultsLoader(storage.models);
    await loader.loadElectionResults(all);
}

async function loader() {
    const storage = await require('./Storage')();
    console.log(storage);
    if(loadType == 'elections') {
        await loadElectionResults(storage);
    } else {
        throw new Error("invalid loadType: "+loadType);
    }
}
loader();