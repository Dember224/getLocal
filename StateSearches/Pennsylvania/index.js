#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const {Readable} = require('node:stream');
const csv = require('csv-parser');
const xlsx = require('node-xlsx');

const {parseFullName} = require('parse-full-name');
const { pbkdf2 } = require('crypto');
const { filter } = require('jszip');
const exp = require('constants');

// const PA_VOTER_SERVICES_URI = 'https://www.pavoterservices.pa.gov/ElectionInfo/FooterLinkReport.aspx?ID=1';
const DATE = new Date().toISOString().split('T')[0];

const DOS_PA_GOV = 'https://www.dos.pa.gov';
const FULL_EXPORT_URI = '/VotingElections/CandidatesCommittees/CampaignFinance/Resources/Pages/FullCampaignFinanceExport.aspx';

function print(data, max_length) {
    if(!data||!data.length) {
        console.log('No Data');
        return;
    }

    max_length = max_length ?? 15;
    const lengths = {};
    Object.keys(data[0]).forEach(x=>lengths[x]=0);

    const header = {};
    Object.keys(lengths).forEach(x => {
        header[x] = x;
    });
    data = [header, ...data];

    data.forEach(d => Object.keys(lengths)
        .forEach(k => lengths[k] = Math.min(Math.max(
            lengths[k],
            d[k]?.toString().length ?? 0
        ), max_length)
    ));

    data.forEach(d => {
        const cols = Object.keys(lengths).map(l => {
            const length = lengths[l];
            let value = d[l];
            if(typeof value == 'number') value = value.toFixed(2);
            value = value?.toString() ?? '';
            return value.padEnd(length).slice(0,length);
        });

        console.log(cols.join(' | '));
    });
}

const FILER_HEADERS = [
    'FILERID',
    'REPORTID',
    'TIMESTAMP',
    'EYEAR',
    'CYCLE',
    'AMMEND',
    'TERMINATE',
    'FILERTYPE',
    'FILERNAME',
    'OFFICE',
    'DISTRICT',
    'PARTY',
    'ADDRESS1',
    'ADDRESS2',
    'CITY',
    'STATE',
    'ZIPCODE',
    'COUNTY',
    'PHONE',
    'BEGINNING',
    'MONETARY',
    'INKIND'
];

const CONTRIB_HEADERS = [
    'FILERID',
    'REPORTID',
    'TIMESTAMP',
    'EYEAR',
    'CYCLE',
    'SECTION',
    'CONTRIBUTOR',
    'ADDRESS1',
    'ADDRESS2',
    'CITY',
    'STATE',
    'ZIPCODE',
    'OCCUPATION',
    'ENAME',
    'EADDRESS1',
    'EADDRESS2',
    'ECITY',
    'ESTATE',
    'EZIPCODE',
    'CONTDATE1',
    'CONTAMT1',
    'CONTDATE2',
    'CONTAMT2',
    'CONTDATE3',
    'CONTAMT3',
    'CONTDESC'
];

const DEBT_HEADERS = [
    "FILERID",
    "REPORTID",
    "TIMESTAMP",
    "EYEAR",
    "CYCLE",
    "DBTNAME",
    "ADDRESS1",
    "ADDRESS2",
    "CITY",
    "STATE",
    "ZIPCODE",
    "DBTDATE",
    "DBTAMT",
    "DBTDESC"
]

const EXPENSE_HEADERS = [
    "FILERID",
    "REPORTID",
    "TIMESTAMP",
    "EYEAR",
    "CYCLE",
    "EXPNAME",
    "ADDRESS1",
    "ADDRESS2",
    "CITY",
    "STATE",
    "ZIPCODE",
    "EXPDATE",
    "EXPAMT",
    "EXPDESC"
]

async function streamToArray(stream) {
    const arr = [];
    return new Promise((resolve, reject) => {
        stream.on('data', x => arr.push(x));
        stream.on('end', () => resolve(arr));
        stream.on('error', reject);
    });
}

async function zipToArray(zipObject, headers) {
    const filersText = await zipObject.async('string');

    const filersTextStream = new Readable.from(filersText);
    const filersArr = await streamToArray(filersTextStream.pipe(csv(headers)));
    return filersArr;
}

const EXPECTED_COMMITTEE_HEADERS = [
    'Committee Number',
    'Committee Name',
    'Committee Type',
    'Committee Reg Date',
    'Committee Treasurer',
    'Committee Address',
    'Candidate Number',
    'Candidate Name',
    'Candidate Office'
];

const COMMITTEE_LIST_EXPORT_URI = 'https://www.pavoterservices.pa.gov/ElectionInfo/FooterLinkReport.aspx?ID=1';

async function getCommitteeListFileName() {
    const localListName = path.join(__dirname, `/tmp/CommitteeList_${DATE}.xls`);
    try {
        fs.accessSync(localListName)
        console.log('Using Cache File',localListName);
        return localListName;
    } catch(e) {
        console.error('cache miss', localListName);
    }

    const transport = axios.create({withCredentials: true});

    const rawFile = await transport.get(COMMITTEE_LIST_EXPORT_URI);

    // console.log(rawFile.headers);
    const cookie = rawFile.headers['set-cookie'].join(';').split(';')[0];

    let $ = cheerio.load(rawFile.data);

    const formData = {};
    const inputs = $(':input').toArray();
    inputs.forEach(x => {
        formData[$(x).attr('name')] = $(x).val() ?? '';
    });
    formData['ctl00$ContentPlaceHolder1$ddlExport'] = 'Excel';
    formData['ctl00_ContentPlaceHolder1_GridGroupingControl0_FilterDialog_Offset']="205_2543";

    delete formData['ctl00$ContentPlaceHolder1$WaitingPopup0_Cancel'];
    delete formData['ctl00$ContentPlaceHolder1$btnCandList'];

    const params = new URLSearchParams();
    Object.entries(formData).forEach(([k,v]) => {
        if(!k || k == 'undefined') return;
        // console.log(k, v.slice(0,10));
        params.append(k,v);
    });

    let resp;
    try {
        resp = await transport.post(COMMITTEE_LIST_EXPORT_URI, params, {
            responseType: 'stream',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookie
            },
            maxRedirects: 0
        });
    } catch(e) {
        console.log('Error getting data: ',e);
    }
    // console.log(resp.request.method);
    // console.log(resp.status);
    // console.log(resp.headers);

    if(resp.headers['content-type'] != 'Application/x-msexcel') {
        throw new Error('Unexcepted Content-Type: '+resp.headers['content-type']);
    }

    resp.data.pipe(fs.createWriteStream(localListName));
    await new Promise((resolve, reject) => {
        resp.data.on('error', reject);
        resp.data.on('end', resolve);
    });
    return localListName;
}

async function getCommitteeList() {
    const localListName = await getCommitteeListFileName();
    
    const data = xlsx.parse(localListName);
    if(data.length != 1) throw new Error('Expected single sheet, got: '+data.length);

    const [sheet] = data;
    const recordCount = sheet.data[0];
    const header = sheet.data[1];
    const info = sheet.data[2];
    const rows = sheet.data.slice(3);
    // console.log(recordCount);
    // console.log(header);
    // console.log(info);

    if(header.join(',') != EXPECTED_COMMITTEE_HEADERS.join(',')) {
        throw new Error('Received unexpected headers: '+header);
    }
    if(info.join('').indexOf('Committee Info: ')!=0) {
        throw new Error('Expected 3rd line to be info');
    }

    const comms = rows.map(x => {
        const raw = {};
        EXPECTED_COMMITTEE_HEADERS.forEach((k,i) => {
            raw[k] = x[i];
        });

        const report_id = raw['Committee Number'];
        const committee_name = raw['Committee Name'];
        const candidate_full_name = raw['Candidate Name'];
        const candidate_id = raw['Candidate Number'];

        return {
            report_id,
            candidate_id,
            committee_name,
            candidate_full_name,
            raw
        };
    });

    // console.log(comms[0]);
    return comms;
}

async function downloadZipFile(year) {
    const localZipName = path.join(__dirname, 'tmp', `${year}_${DATE}.zip`);
    try {
        fs.accessSync(localZipName)
        console.log('Using Cache File',localZipName);
        return localZipName;
    } catch(e) {
        console.error('cache miss', localZipName);
    }

    console.log("Checking ",`${DOS_PA_GOV}${FULL_EXPORT_URI}`);
    const result = await axios.get(`${DOS_PA_GOV}${FULL_EXPORT_URI}?p_SortBehavior=0&SortField=LinkFilenameNoMenu&SortDir=Desc`);
    const $ = cheerio.load(result.data);
    const links = {};

    $('a').toArray().forEach(x => {
        x = $(x);
        const label = x.text();
        const ref = x.attr('href');
        if(!label || !ref) return;
        links[label]=ref;
    });

    const zipLink = links[year];
    if(!zipLink) throw new Error("Failed to find link for "+year);

    console.log('Pulling from:', zipLink);
    
    const zipResp = await axios.get(`${DOS_PA_GOV}${zipLink}`, {
        responseType: 'stream'
    });

    zipResp.data.pipe(fs.createWriteStream(localZipName));

    await new Promise((resolve, reject) => {
        zipResp.data.on('error', reject);
        zipResp.data.on('end', resolve);
    });
    
    console.log('zip downloaded to', localZipName);

    return localZipName;
}

async function getZipDataSet({ zip,match,headers }) {
    const filerFileName = Object.keys(zip.files).find(x => x.indexOf(match) != -1);
    const filersFile = zip.files[filerFileName];
    return await zipToArray(filersFile, headers);
}

async function getZip(year) {
    if(!year.toString().match(/\d\d\d\d/)) throw new Error('year must be a 4 digit int');
    if(parseInt(year) < 2022) throw new Error('year prior to 2022 not supported');

    const localZipName = await downloadZipFile(year);

    const zipRaw = await new Promise((resolve,reject) => {
        fs.readFile(localZipName, (e,d) => {
            if(e) reject(e);
            resolve(d);
        });
    });
    let zip = new JSZip();
    await zip.loadAsync(zipRaw);

    if(!zip.files[`filer_${year}.txt`]) {
        console.log('no filer file - checking for zip');
        const internalZipName = Object.keys(zip.files).find(x => x.slice(-4) == '.zip');
        if(!internalZipName) throw new Error('Failed to find txt file or internal zip '+Object.keys(zip.files));

        const internalZip = zip.files[internalZipName];
        
        const innerZip = await internalZip.async('binarystring');
        zip = new JSZip();
        await zip.loadAsync(innerZip);

        console.log(Object.keys(zip.files));
    }

    return {
        filer: await getZipDataSet({zip, match: `filer_${year}.txt`, headers: FILER_HEADERS}),
        contrib: await getZipDataSet({zip, match: `contrib_${year}.txt`, headers: CONTRIB_HEADERS}),
        expense: await getZipDataSet({zip, match: `expense_${year}.txt`, headers: EXPENSE_HEADERS}),
        debt: await getZipDataSet({zip, match: `debt_${year}.txt`, headers: DEBT_HEADERS}),
    };
}

async function getAggregatedFilerData(params) {
    const agg = await getZip(params.year);

    const byFilerId = {};

    const getFn = (type) => x => {
        const forId = (byFilerId[x.FILERID] = byFilerId[x.FILERID] || {
            filer_id: x.FILERID,
            filer: [],
            contrib: [],
            expense: [],
            debt: []
        });
        forId[type].push(x);
    }

    agg.filer.map(getFn('filer'));
    agg.contrib.map(getFn('contrib'));
    agg.expense.map(getFn('expense'));
    agg.debt.map(getFn('debt'));

    Object.values(byFilerId).forEach(x => {
        const {filer_id, filer, contrib, expense, debt} = x;

        let calc_contributions = 0;
        contrib.forEach(x => calc_contributions += parseFloat(x.CONTAMT1 || 0) + parseFloat(x.CONTAMT2) + parseFloat(x.CONTAMT3));
        x.calc_contributions = calc_contributions;

        let calc_expense = 0;
        expense.forEach(x => calc_expense += parseFloat(x.EXPAMT || 0));
        x.calc_expense = calc_expense;

        let calc_debt = 0;
        debt.forEach(x => calc_debt += parseFloat(x.DBTAMT || 0));
        x.calc_debt = calc_debt;
    });

    const candidate_filers = agg.filer
        .filter(x => x.FILERTYPE == 1)
        .map(c => {
            const {
                first: first_name,
                middle: middle_name,
                last: last_name,
            } = parseFullName(c.FILERNAME);
            return {...c, first_name, middle_name, last_name}
        });
    const committee_filers = agg.filer
        .filter(x => x.FILERTYPE == 2);

    return {...agg, byFilerId, candidate_filers, committee_filers};
}

async function getCombinedCandidateData(params) {
    const [{candidate_filers, committee_filers, contrib, expense}, comms] = await Promise.all([
        await getAggregatedFilerData(params),
        await getCommitteeList()
    ]);

    const candidatesByCandidateId = {};
    const duplicateCandidateIds = {};
    let totalDupes = 0;
    candidate_filers.forEach(x => {
        if(candidatesByCandidateId[x.REPORTID]) {
            duplicateCandidateIds[x.REPORTID] = 1;
            totalDupes ++;
        }
        (candidatesByCandidateId[x.REPORTID] = candidatesByCandidateId[x.REPORTID] ?? [])
            .push(x);
    });
    console.log(candidate_filers.length,'candidate filers');
    console.log(Object.keys(candidatesByCandidateId).length, 'unique candidates');
    console.log(Object.keys(duplicateCandidateIds).length, 'ids with duplicates across', totalDupes, 'candidates');
    console.log();

    const commsByReportId = {};
    comms.forEach(x => {
        (commsByReportId[x.report_id] = commsByReportId[x.report_id] ?? [])
            .push(x);
    });
    console.log(Object.keys(commsByReportId).length,'unique report ids for comms');

    const committeeFilersByCandidateId = {};
    const noCommDefinitions = {};
    const committeeNoCandidate = [];
    committee_filers.forEach(x => {
        const {FILERID, REPORTID, FILERNAME} = x;
        const definitions = commsByReportId[REPORTID];
        if(!definitions) {
            noCommDefinitions[REPORTID] = 0;
            console.log('No def:',FILERNAME);
            return;
        }

        let candidateIds = {};
        definitions //.filter(x => (x.candidate_id || 0) > 0)
            .filter(x => candidatesByCandidateId[x.candidate_id])
            .forEach(x=>candidateIds[x.candidate_id]=1);
        candidateIds = Object.keys(candidateIds);
        if(candidateIds.length > 1) {
            console.log(FILERID,REPORTID, 'has multiple candidate ids', candidateIds);
            // print(definitions);
            // console.log();
        } else if(candidateIds.length) {
            const id = candidateIds[0];
            (committeeFilersByCandidateId[id] = committeeFilersByCandidateId[id] ?? [])
                .push(x);
        } else {
            // if no candidate ids found, doesn't mean no candidate - just might not be raising money separately
            committeeNoCandidate.push(x);
        }
    });
    console.log(Object.keys(noCommDefinitions).length, 'committee filers without definitions');
    console.log(Object.keys(committeeFilersByCandidateId).length, 'candidates with committees');

    const contributionsByReportId = {};
    contrib.forEach(x => {
        (contributionsByReportId[x.REPORTID] = contributionsByReportId[x.REPORTID] ?? []).push(x);
    });

    const expensesByReportId = {};
    expense.forEach(x => {
        (expensesByReportId[x.REPORTID] = expensesByReportId[x.REPORTID] ?? []).push(x);
    });

    const combined = Object.entries(candidatesByCandidateId).map(([id,filers]) => {
        const committees = committeeFilersByCandidateId[id] ?? [];
        const allFilers = filers.concat(committees).sort((a,b) => {
            if(a.FILERTYPE < b.FILERTYPE) return -1;
            else if(b.FILERTYPE < a.FILERTYPE) return 1;

            else if(a.REPORTID < b.REPORTID) return -1;
            else if(a.REPORTID > b.REPORTID) return 1;

            else if(a.CYCLE < b.CYCLE) return -1;
            else if(a.CYCLE > b.CYCLE) return 1;

            else if(a.EYEAR < b.EYEAR) return -1;
            else return 1;
        });

        const allReportIds = {};
        allFilers.forEach(x => allReportIds[x.REPORTID]=1);
        
        // console.log('------------------- candidate', id);
        // print(allFilers);

        const mostRecentForReportId = {};
        allFilers.forEach(x => mostRecentForReportId[x.REPORTID] = x);
        const mostRecents = Object.values(mostRecentForReportId).sort((a,b) => {
            if(a.FILERTYPE < b.FILERTYPE) return -1;
            else return 1;
        });

        // print(mostRecents);

        // let expenseTotal = 0;
        // let contribTotal = 0;

        let expenses = [];
        let contribs = [];

        Object.keys(allReportIds).forEach(id => {
            // let expenseSum = 0;
            const exp = expensesByReportId[id] ?? [];
            expenses = expenses.concat(exp);
            // exp.forEach(x => expenseSum += parseFloat(x.EXPAMT));
            // console.log(`--- Expenses [${id} - # ${exp.length} - $${expenseSum.toFixed(2)}]:`);
            // print(exp.slice(0,4), 15);

            // let contribSum = 0;
            const con = contributionsByReportId[id] ?? [];
            contribs = contribs.concat(con);
            // con.forEach(x =>contribSum += parseFloat(x.CONTAMT1));
            // console.log(`--- Contribs [${id} - # ${con.length} - $${contribSum.toFixed(2)}]:`);
            // print(con.slice(0,4), 15);

            // expenseTotal += expenseSum;
            // contribTotal += contribSum;
        });
        // console.log('Expense: ', expenseTotal.toFixed(2), 'Contrib: ', contribTotal.toFixed(2), 'Net:', (contribTotal - expenseTotal).toFixed());
        // console.log();

        let currentValue = 0;
        let cycleStart = 0;
        let cycleRaised = 0;
        let cycleSpent = 0;
        const mostRecentSums = {};
        mostRecents.forEach(x => {
            const beginning = parseFloat(x.BEGINNING);
            let expenseSum = 0;
            expenses.filter(z => z.REPORTID == x.REPORTID && z.CYCLE == x.CYCLE)
                .forEach(z => expenseSum += parseFloat(z.EXPAMT));
            let contribSum = 0;
            contribs.filter(z => z.REPORTID == x.REPORTID && z.CYCLE == x.CYCLE)
            .forEach(z => contribSum += parseFloat(z.CONTAMT1));
            const result = beginning - expenseSum + contribSum
            mostRecentSums[x.REPORTID] = {
                beginning,
                expenseSum,
                contribSum,
                result
            };
            currentValue += result;
            cycleStart += beginning;
            cycleRaised += contribSum;
            cycleSpent += expenseSum;
        });

        return {
            candidateId: id,
            allFilers,
            mostRecents,
            contribs,
            expenses,
            mostRecentSums,
            currentValue,
            cycleStart,
            cycleRaised,
            cycleSpent
        };
    });

    return combined;
}

async function getFinanceData(params) {
    const combined = await getCombinedCandidateData(params);

    return combined.map(c => {
        const {candidateId, allFilers, mostRecents, currentValue, cycleRaised, cycleSpent, cycleStart} = c;

        const mostRecentCandidate = mostRecents.find(x => x.REPORTID == candidateId);
        if(!mostRecentCandidate) throw new Error('Missing mostRecentCandidate?');

        let {
            DISTRICT: district,
            OFFICE,
            PARTY,
            FILERNAME: name
        } = mostRecentCandidate;

        // statewide office
        if(district == -1) return null;

        const level = {
            STH: 'house',
            STS: 'senate'
        }[OFFICE] ?? null;

        if(!level) return null;

        const party = {
            DEM: 'democratic',
            REP: 'republican'
        }[PARTY] ?? PARTY;

        return {
            candidateId,
            current_amount: currentValue,

            starting_amount: cycleStart,
            contributions: cycleRaised,
            expenditures: cycleSpent,
            year: params.year,
            election_year: params.year,
            state: "pennsylvania",
            office: level,
            election_type: 'general',
            name,
            district,
            party,

            other_filers: allFilers.filter(x => x.REPORTID != candidateId).map(x=>x.FILERNAME).join(', ')
        };
    }).filter(x => !!x);
}

async function getSampleData() {
    const data = await getAggregatedFilerData({year:2022});
    const m = data.committee_filers.filter(x => x.FILERNAME == 'FRIENDS OF CINDY KIRK');
    console.log(m);

    const comms = await getCommitteeList();
    const comm = comms.find(x => x.report_id == m[0].REPORTID);
    console.log(comm);

    const cand = data.candidate_filers.find(x => x.REPORTID == comm.candidate_id);
    console.log(cand);

    // const agg = await getCombinedCandidateData({year:2022});


    // const data = await getCombinedCandidateData({year:2022});
    // print(data.committeeNoCandidate, 30);
    // return;

    // const data = await getAggregatedFilerData({year:2022});

    // print(data.candidate_filers.slice(0,10));
    // console.log(data.candidate_filers.length, 'total candidate_filers');

    // print(data.committee_filers.slice(0,10));
    // console.log(data.committee_filers.length, 'total committee_filers');

    // let comms = await getCommitteeList();
    // withCandidates = comms.filter(x => x.candidate_id != null);
    // print(comms.slice(0,10), 25);
    // console.log(comms.length, 'total committees');
    // console.log(withCandidates.length, 'with candidates');
}

module.exports = {
    getCommitteeList,
    getZip,
    getAggregatedFilerData,
    getFinanceData,
    getCombinedCandidateData
};

// getSampleData();

// getFinanceData({year: 2022});
