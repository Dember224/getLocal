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

    console.log(rawFile.headers);
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
        console.log(k, v.slice(0,10));
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
    console.log(resp.request.method);
    console.log(resp.status);
    console.log(resp.headers);

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
    console.log(recordCount);
    console.log(header);
    console.log(info);

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

    console.log(comms[0]);
    return comms;
}

async function downloadZipFile(year) {
    const localZipName = path.join(__dirname, `/tmp/${year}_${DATE}.zip`);
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

        return x;
    });

    return {...agg, byFilerId};
}

async function getFinanceData(params) {
    const [{filer}, comms] = await Promise.all([
        await getAggregatedFilerData(params),
        await getCommitteeList()
    ]);

    console.log(filer[0], comms[0]);
    
    const mergedWithCommittee = filer.map(row => {
        if(!row.FILERID) {
            console.log('No FILERID: ', row);
        }
        if(row.FILERTYPE == 2) {
            const committee = comms.find(x=>x.report_id == row.REPORTID);
            row.committee = committee;
        }
        return row;
    });

    const byCandidateId = {};
    const rawByCandidateId = {};
    mergedWithCommittee.forEach(row => {
        const {
            committee,
            REPORTID,
            BEGINNING,
            MONETARY,
            DISTRICT:district,
            PARTY,
            FILERNAME,
            OFFICE,
            EYEAR:date
        } = row;
        const candidate_id = committee?.candidate_id ?? REPORTID;
        const candidate_name = committee?.candidate_full_name ?? FILERNAME;
        if(!candidate_id) throw new Error('missing candidate_id?');

        (rawByCandidateId[candidate_id] = rawByCandidateId[candidate_id] || []).push(row);

        const {
            first: first_name,
            middle: middle_name,
            last: last_name,
        } = parseFullName(candidate_name);

        const starting_amount = parseFloat(BEGINNING);
        const raised = parseFloat(MONETARY);

        const level = {
            STH: 'house',
            STS: 'senate'
        }[OFFICE] ?? OFFICE;

        const party = {
            DEM: 'democratic',
            REP: 'republican'
        }[PARTY] ?? PARTY;

        const entries = byCandidateId[candidate_id] = byCandidateId[candidate_id] ?? [];
        entries.push({
            candidate_id,
            starting_amount,
            raised,
            district: district == '' ? 0 : parseInt(district || 0),
            party,
            candidate_name,
            level,
            date,
            year: date.slice(0,4),
            first_name,
            middle_name,
            last_name,
            committee_name: committee?.committee_name,
            entry_is_committee: !!committee
        });
    });

    return Object.values(byCandidateId).map(x => {
        const [{candidate_id}]=x;
        const thisYear = x
            .filter(y => y.year == params.year && !y.entry_is_committee && y.district > 0);

        if(!thisYear.length) {
            // console.log('No records found for this year', x.length, params.year);
            return null;
        }

        let {starting_amount, raised} = x[0];
        x.forEach(y => {
            starting_amount += y.starting_amount;
            raised += y.raised;
        });

        const elements = {};
        const setFirstNull = (field) => elements[field] = x.find(z => !!z[field])?.[field] ?? '';

        setFirstNull('candidate_name');
        setFirstNull('date');
        setFirstNull('first_name');
        setFirstNull('middle_name');
        setFirstNull('last_name');
        setFirstNull('committee_name');
        setFirstNull('level');
        setFirstNull('district');
        setFirstNull('party');

        return {
            candidate_id,

            starting_amount,
            raised,
            year: params.year,

            ... elements
        };
    }).filter(x=>x);
}

module.exports = {
    getCommitteeList,
    getZip,
    getAggregatedFilerData,
    getFinanceData
};

// getZip(2022);
