const axios = require('axios');
const cheerio = require('cheerio');
const { async } = require('node-stream-zip');
const path = require('path');
const fs = require('fs').promises;
const moment = require('moment');

const STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];
const STATE_MAP = {};
STATES.forEach(x => STATE_MAP[x] = 1);
const BALLOTPEDIA_URI = 'https://ballotpedia.org';

const FILE_CACHE_PATH = path.join(__dirname, '/file-cache');

const qProms = [];
async function queuedFn(fn) {
    let external;
    const prom = new Promise((res,rej) => {
        external = res;
    });
    if(qProms.length) {
        qProms.push(external);
        await prom;
    }

    const result = await fn();
    const next = qProms.shift();
    if(next) next();

    return result;
}

async function sleep(time) {
    console.log('sleeping',time);
    await new Promise((res,rej) => {
        setTimeout(res, time);
    });
}

async function makeGetInternal(uri) {
    uri = uri.replace(BALLOTPEDIA_URI,'');
    const filePath = path.join(FILE_CACHE_PATH,uri);

    try {
        const data = await fs.readFile(filePath)
        console.log('Using Cache File',filePath);
        return data;
    } catch(e) {
        console.error('cache miss', filePath);
    }

    if(uri.indexOf('http') != 0) {
        if(uri[0] != '/') uri = '/'+uri;
        uri = BALLOTPEDIA_URI + uri;
    }

    await sleep((5+Math.random()) * 1000)

    const response = await axios.get(uri);

    await fs.writeFile(filePath, response.data);
    return response.data;
}

async function makeGet(uri) {
    return queuedFn(() => makeGetInternal(uri));
}

function checkLevel(level) {
    level = level.toLowerCase();

    if(level == 'upper') level = 'senate';
    if(level == 'lower') level = 'house';

    if(level != 'senate' && level != 'house') throw new Error('level must be house or senate, was: '+level);
    return level;
}

function checkDistrict(district) {
    if(district == parseInt(district)) return district;
    let m = district.toString().match(/[Dd]istrict\s+(\d+)/);
    if(!m) throw new Error('Invalid district '+district);
    return m[1];
}

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

function getStateAndLevel(label) {
    label = label.toLowerCase().trim();
    if(label.indexOf("list of") == 0) return null;

    // :'(
    if(label.indexOf('washington, d.c') == 0) return null;

    const state = STATES.find(s => label.indexOf(s.toLowerCase()) == 0)?.toLowerCase();
    if(!state) {
        return null;
    }

    // if it's just the name of the state, it's not a level
    if(state == label) return null;
    if(label.indexOf('state legislature') != -1) return null;

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
        level
    }
}

// To navigate to this - go to https://ballotpedia.org/State_legislative_elections
// Select the year and then select the state
// Or pick and state and go from there
// The links currently take the form of:
// https://ballotpedia.org/Alabama_State_Senate_elections,_2022
// https://ballotpedia.org/Alabama_House_of_Representatives_elections,_2022
async function getAllLegistlatureElections() {
    if(allElectionYears) return allElectionYears;

    console.log("Getting election links");

    const content = await makeGet(`${BALLOTPEDIA_URI}/State_legislative_elections`);
    let $ = cheerio.load(content);

    const allLinks = $('a').toArray().map(x => {
        x = $(x);
        const label = x.text().trim().toLowerCase();
        if(!label || label != x.attr('title')?.trim()?.toLowerCase()) return null;

        const sl = getStateAndLevel(label);
        if(!sl) return null;
        const {state,level} = sl;

        const year = label.slice(-4);
        if(!year.match(/\d\d\d\d/)) throw new Error(year+" does not match YYYY");

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
    const rawContent = await makeGet(`${BALLOTPEDIA_URI}${href}`);
    // console.log('Raw: ',rawContent);
    let $ = cheerio.load(rawContent);

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

let legislatureLinks;
// https://ballotpedia.org/States
async function getStateLegislatureLinks() {
    if(legislatureLinks) return legislatureLinks;
    const rawContent = await makeGet(`${BALLOTPEDIA_URI}/States`);
    let $ = cheerio.load(rawContent);
    const links = $('a').toArray().map(a => {
        const label = $(a).text().toLowerCase().trim();
        const sl = getStateAndLevel(label);
        if(!sl) return null;
        return {
            ... sl,
            href: $(a).attr('href')
        };
    }).filter(x=>!!x);
    return legislatureLinks = links;
}

const stateDistrictList = {};
async function getStateDistrictList({state,level}) {
    state = state.toLowerCase();
    level = checkLevel(level);
    const key = `${state}-${level}`;

    if(stateDistrictList[key]) return stateDistrictList[key];

    const all = await getStateLegislatureLinks();
    const match = all.find(x => x.state == state && x.level == level);
    if(!match) throw new Error(`Failed to get value for (${state}, ${level})`);

    console.log('loading for',match.state);

    const {href}=match;
    const resp = await makeGet(`${BALLOTPEDIA_URI}${href}`);
    let $=cheerio.load(resp);

    let [table] = $('table#officeholder-table').toArray();
    if(!table) throw new Error('Failed to get table');
    table = $(table);
    const headers = table.find('thead tr th').toArray().map(x=>$(x).text().trim());

    const invalid = [
        'Office',
        'Name',
        'Party',
        'Date assumed office'
    ].filter((x,i) => {
        if(headers[i] != x) return true;
        return false;
    });
    if(invalid.length) throw new Error('Invalid headers: '+headers.join(', '));

    const districts = table.find('tbody tr').toArray().map(tr => {
        tr=$(tr);
        const [office,name,party,date] = tr.find('td').toArray().map(td => {
            td = $(td);
            return {
                label: td.text().trim(),
                href: td.find('a').attr('href')
            };
        });

        // const district = office.label.match(/[Dd]istrict (\d+)/)?.[1];
        // if(!district) throw new Error('Failed to find district in '+office.label);
        const district = checkDistrict(office.label);

        return {
            office,

            district,
            district_href: office.href,

            incumbent: name.label,
            incumbent_href: name.href,

            state,
            level
        }
    });

    return stateDistrictList[key] = districts;
}

// For example:
// https://ballotpedia.org/Pennsylvania_House_of_Representatives_District_49
// Build the primary/general elections by iterating through the top level elements
// and grouping by the year
async function getStateDistrictElectionHistory({state,level,district}) {
    district = checkDistrict(district);
    state = state.toLowerCase();
    level = checkLevel(level);

    const districtList = await getStateDistrictList({state,level});
    const match = districtList.find(x => x.state == state && x.district == district);
    if(!match) throw new Error(`Invalid state/distrct: ${state}/${district}`);

    const {district_href} = match;
    console.log('match.district_href:', district_href);

    const resp = await makeGet(district_href);
    let $ = cheerio.load(resp);

    const sections = $('div.electionsectionheading');
    if(!sections.length) throw new Error('No div.electionsectionheading');

    const containers = $('div.votebox-scroll-container');
    if(!containers.length) throw new Error('No div.votebox-scroll-container');

    let elements = $('#Elections, div.electionsectionheading, div.votebox-scroll-container, span.mw-headline, p')
        .toArray();

    const electionsIndex = elements.findIndex(x => $(x).attr('id') == 'Elections');
    if(electionsIndex == -1) throw new Error('Failed to find Elections section');
    elements = elements.slice(electionsIndex+1);

    let elections = [];
    let current, section;
    elements.forEach(el => {
        el = $(el);
        const id = el.attr('id');
        if(el.hasClass('mw-headline')) {
            // this is the start of a year election section
            if(id.match(/^\d\d\d\d$/)) {
                console.log('Processing',id);
                current = {
                    year: parseInt(id),
                    special: false
                };
                section = null;
                elections.push(current);
                return;
            }

            if(id == 'Special_election' || id=='Special') {
                console.log('Processing special:',id);
                current = {
                    year: current.year,
                    special: true
                };
                section = null;
                elections.push(current);
                return;
            }

            // if a special election happens the same year as a general,
            // sometimes it will be shown first
            if(id == 'Regular_election' || id=='Regular') {
                console.log('Processing regular:',id);
                current = {
                    year: current.year,
                    special: false
                };
                section = null;
                elections.push(current);
                return;
            }
        }

        // if no current, we haven't started yet
        if(!current) {
            console.log('No Current, skipping');
            return;
        }

        if(el[0].tagName == 'div' && el.hasClass('electionsectionheading')) {
            const title = el.text().trim().toLowerCase();
            console.log('Processing scroll-container',title);

            if(title.includes('general')) section = 'general';
            else if(title.includes('democratic')) section = 'democratic_primary';
            else if(title.includes('republican')) section = 'republican_primary';
            else if(title.includes('green')) section = 'green_primary';
            else if(title.includes('libertarian')) section = 'libertarian_primary';

            else throw new Error(`Failed to match title '${title}'`);
        } else if(el[0].tagName == 'div' && el.hasClass('votebox-scroll-container')) {
            console.log('Processing scroll-container');

            if(current[section]) throw new Error('Found second section with '+section);

            const table = el.find('div.results_table_container table.results_table');
            if(!table.length) throw new Error('Failed to find results table');

            const resultsText = el.find('.results_text').text().trim();
            const [,dateRaw] = resultsText.match(/on\s+(\w+\s+\d+,\s+\d+)\./) || [];

            if(resultsText.indexOf('No candidate advanced from') == 0) return;


            if(!dateRaw) throw new Error("Failed to extract date from "+resultsText);
            const date = moment(dateRaw, "MMMM D, YYYY");
            current[`${section}_date`] = date;

            const headers = table.find('tr.non_result_row td').toArray().map(x => $(x).text().trim().toLowerCase());

            let expected;
            // there are 2 headers when the election has not happened yet
            if(headers.length == 2) expected = ['','candidate'];
            else expected = [
                '',
                'candidate',
                '%',
                'votes'
            ];
            const invalid = expected.filter((x,i) => headers[i] != x);
            if(invalid.length) throw new Error('Unexpected headers: '+headers.join(', '));

            const rows = table.find('tr.results_row').toArray();
            if(!rows.length) {
                console.log(table.text());
                console.log('No rows for',current.year,section);
            }

            const results = rows.map(row => {
                row = $(row);
                const tds = row.find('td').toArray().map($);
                if(tds.length != expected.length + 1) throw new Error('Unexpected elements length - stopping');
                const [,,candidateRaw,pct,votesRaw] = tds;

                // the raw value has commas, so just pull out digits
                const votes = parseInt($(votesRaw).text().replace(/[^\d]/g, ''));
                const candidateLink = candidateRaw.find('a');
                const candidateName = candidateLink.text().trim();
                const candidateHref = candidateLink.attr('href');

                let party;
                if(candidateRaw.text().trim().slice(-3) == '(R)') party='republican';
                else if(candidateRaw.text().trim().slice(-3) == '(D)') party='democratic';

                return {
                    votes,
                    party,
                    candidate_name: candidateName,
                    candidate_href: candidateHref,
                }
            });

            current[section] = results;
            current.has_results = true;
        } else if(section == 'general' && !current.general_date) {
            const resultsText = el.text().trim();
            console.log('trying for date:', resultsText);
            const [,dateRaw] = resultsText.match(/general.+on\s+(\w+\s+\d+,\s+\d+)\./) || [];
            if(dateRaw) {
                const date = moment(dateRaw, "MMMM D, YYYY");
                current[`${section}_date`] = date;
            }
        } else {
            console.log('ignoring element:',el.attr('class'),el.text().trim().slice(0,100));
        }
    });

    // currently only handling the most recent type of results table
    // it looks like the data was previously in a different format (before 2018?)
    elections = elections
        .filter(x => x.has_results)
        .map(x => ({...x, state, level, district, district_href}));

    return elections;
};

async function getStateElectionHistoryForLevel({state,level}) {
    const list = await getStateDistrictList({state,level});
    const all = [];
    for(let i in list) {
        const parts = await getStateDistrictElectionHistory(list[i]);
        all.push(parts);
    }
    return all;
}

module.exports = {
    getStateElectionResults,
    getAllLegistlatureElections,
    getStateLegislatureLinks,
    getStateDistrictElectionHistory,
    getStateElectionHistoryForLevel
}

async function getElectionResultsForState({state,year,level,district}) {
    // if(!year) year = '2022';
    // year = year.toString();
    // const parts = await getStateElectionResults({state,year, level});
    // console.log(JSON.stringify(parts,null,2));

    // const all = await getAllStateSenateElectionYears();
    // console.log('all:',JSON.stringify(all,null,2));

    // console.log(JSON.stringify(await getStateLegislatureLinks()));

    console.log(JSON.stringify(await getStateDistrictElectionHistory({
        state,
        level,
        district
    }), null, 2));

    // console.log(JSON.stringify(await getStateElectionHistoryForLevel({
    //     state,
    //     level,
    //     district
    // }), null, 2));
}
// getElectionResultsForState({state:'Pennsylvania', year:2020, level: 'house', district:'district 10'});
