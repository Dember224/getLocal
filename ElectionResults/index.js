const axios = require('axios');
const cheerio = require('cheerio');

const STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];
const STATE_MAP = {};
STATES.forEach(x => STATE_MAP[x] = 1);
const BALLOTPEDIA_URI = 'https://ballotpedia.org';

// Currently ignores candidates that did not make the ballot
function getCandidatesInformation(td,$) {
    const candidates = td.find('span.candidate').toArray();
    if(!candidates.length) return [];

    return candidates.map(x => {
        x = $(x);
        // This is fragile :( but it's the only way to really check on a given election
        // who won (from the main screen)
        const checkMark = x.find('img');

        const won = (checkMark.length > 0) && checkMark.attr('alt').trim() == 'Green check mark transparent.png';
        const name = x.find('a').text().trim();
        const incumbent = x.text().trim().slice(-3) == '(i)';

        return {
            won,
            name,
            incumbent
        };
    });
}

let allElectionYears;

// To navigate to this - go to https://ballotpedia.org/State_legislative_elections
// Select the year and then select the state
// Or pick and state and go from there
// The links currently take the form of:
// https://ballotpedia.org/Alabama_State_Senate_elections,_2022
// https://ballotpedia.org/Alabama_House_of_Representatives_elections,_2022
async function getAllLegistlatureElections() {
    if(allElectionYears) return allElectionYears;

    console.log("Getting election links");

    const content = await axios.get(`${BALLOTPEDIA_URI}/State_legislative_elections`);
    let $ = cheerio.load(content.data);

    const allLinks = $('a').toArray().map(x => {
        x = $(x);
        const label = x.text().trim().toLowerCase();
        if(!label || label != x.attr('title')?.trim()?.toLowerCase()) return null;

        if(label.indexOf("list of") == 0) return null;

        const state = STATES.find(s => label.indexOf(s.toLowerCase()) == 0)?.toLowerCase();
        if(!state) {
            console.log("Did not recognize state:",label);
            return null;
        }

        const year = label.slice(-4);
        if(!year.match(/\d\d\d\d/)) throw new Error(year+" does not match YYYY");

        let level;
        if(label.indexOf(state + ' state senate') == 0) level = 'senate';
        else if(label.indexOf(state + ' house') == 0) level = 'house';
        // california has a state assembly
        else if(label.indexOf(state + ' state assembly') == 0) level = 'house';
        // new jersey has a general assembly
        else if(label.indexOf(state + ' general assembly') == 0) level = 'house';
        else throw new Error(`Failed to determine level from '${label}'`);

        return {
            state,
            href: x.attr('href'),
            year,
            level
        };
    }).filter(x=>!!x);

    // return allLinks.map(x => $(x).text());
    return allElectionYears = allLinks;
}

// On a page like https://ballotpedia.org/Pennsylvania_State_Senate_elections,_2020
// You should have two tables - one for General Elections, and one for Primary Elections
// These are then labeled accordingly such as:
//  - Pennsylvania State Senate general election 2020
//  - Pennsylvania State Senate primary 2020
// Both tables have the same structure - Office | Democratic | Republican | Other
async function extractElectionData({state,year,href}) {
    state = state.toLowerCase();
    state = `${state[0].toUpperCase()}${state.slice(1)}`;
    if(href[0] != '/') href = '/' + href;
    const rawContent = await axios.get(`${BALLOTPEDIA_URI}${href}`);
    // console.log('Raw: ',rawContent);
    let $ = cheerio.load(rawContent.data);

    const tables = $('table.candidateListTablePartisan').toArray();
    if(!tables.length) throw new Error('Failed to get candidate list tables');

    const tableMap = {};
    tables.forEach(x => {
        const rows = $(x).find('tr').toArray();
        const label = $(rows[0]).text().trim();

        const districts = rows.filter(x => {
            return $(x).find('td').length == 4;
        });

        if(!districts.length) throw new Error("Failed to get district list");
        const [office,dem,rep,other] = $(districts[0]).find('td').toArray().map(x => $(x).text().trim());
        if(office != 'Office') throw new Error('Expected 1st column of first row to be "Office"');
        if(dem != 'Democratic') throw new Error('Expected 2nd column of first row to be "Democratic"');
        if(rep != 'Republican') throw new Error('Expected 3rd column of first row to be "Republican"');
        if(other != 'Other') throw new Error('Expected 4th column of first row to be "Other"');

        const electionDistricts = districts.slice(1).map(x => {
            const [o,d,r,oth] = $(x).find('td').toArray();

            return {
                district: $(o).text().trim(),
                democrat: getCandidatesInformation($(d), $),
                republican: getCandidatesInformation($(r), $),
                other: getCandidatesInformation($(oth), $),
            };
        });

        tableMap[label] = electionDistricts;
    });

    // const general = tableMap[`${state} State Senate general election ${year}`] || tableMap[`${state} State Senate General Election ${year}`];
    // const primary = tableMap[`${state} State Senate primary ${year}`] || tableMap[`${state} State Senate Primary ${year}`];
    const generalKey = Object.keys(tableMap).find(x => {
        x = x.toLowerCase();
        return x.indexOf(state.toLowerCase()) == 0 && x.indexOf('general') > 0;
    });
    const primaryKey = Object.keys(tableMap).find(x => {
        x = x.toLowerCase();
        return x.indexOf(state.toLowerCase()) == 0 && x.indexOf('primary') > 0;
    });

    const general = tableMap[generalKey];
    const primary = tableMap[primaryKey];

    console.log(Object.keys(tableMap));

    if(!primary) throw new Error('Could not find Primary Table');
    if(!general) throw new Error('Could not find General Elections Table');

    return {general,primary};
}

async function getStateElectionResults({state,year,level}) {
    if(level != 'senate' && level != 'house') throw new Error('level must be house or senate');
    const allStateElectionYears = await getAllLegistlatureElections();
    
    state = state.toLowerCase();

    const info = allStateElectionYears.find(x => x.state == state && x.year == year && x.level == level);
    if(!info) throw new Error("Invalid Election Year");

    return extractElectionData(info);
}

module.exports = {
    getStateElectionResults,
    getAllLegistlatureElections
}

async function getElectionResultsForState({state,year,level}) {
    if(!year) year = '2022';
    year = year.toString();
    const parts = await getStateElectionResults({state,year, level});
    console.log(JSON.stringify(parts,null,2));

    // const all = await getAllStateSenateElectionYears();
    // console.log('all:',JSON.stringify(all,null,2));

}
getElectionResultsForState({state:'Pennsylvania', year:2020, level: 'house'});