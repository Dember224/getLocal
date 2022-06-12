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

// const PA_VOTER_SERVICES_URI = 'https://www.pavoterservices.pa.gov/ElectionInfo/FooterLinkReport.aspx?ID=1';

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
async function getCommitteeList() {
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

    const localListName = path.join(__dirname, `/tmp/CommitteeList_${new Date().getTime()}.xls`);
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

        return {
            report_id,
            committee_name,
            candidate_full_name,
            raw
        };
    });

    console.log(comms[0]);
    return comms;
}

async function getZip(year) {
    if(!year.toString().match(/\d\d\d\d/)) throw new Error('year must be a 4 digit int');
    if(parseInt(year) < 2022) throw new Error('year prior to 2022 not supported');

    console.log("Checking ",`${DOS_PA_GOV}${FULL_EXPORT_URI}`);
    const result = await axios.get(`${DOS_PA_GOV}${FULL_EXPORT_URI}?p_SortBehavior=0&SortField=LinkFilenameNoMenu&SortDir=Desc`);
    const $ = cheerio.load(result.data);
    const links = {};
    // console.log('parts:', result.data);

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

    const localZipName = path.join(__dirname, `/tmp/${year}_${new Date().getTime()}.zip`);
    
    const zipResp = await axios.get(`${DOS_PA_GOV}${zipLink}`, {
        responseType: 'stream'
    });

    zipResp.data.pipe(fs.createWriteStream(localZipName));
    
    await new Promise((resolve, reject) => {
        zipResp.data.on('error', reject);
        zipResp.data.on('end', resolve);
    });

    console.log('zip downloaded to', localZipName);

    const zipRaw = await new Promise((resolve,reject) => {
        fs.readFile(localZipName, (e,d) => {
            if(e) reject(e);
            resolve(d);
        });
    });
    const zip = new JSZip();
    await zip.loadAsync(zipRaw);

    const filersFile = zip.files[`filer_${year}.txt`];
    // const filersText = await filersFile.async('string');

    // const filersTextStream = new Readable.from(filersText);
    // const filersArr = await streamToArray(filersTextStream.pipe(csv(FILER_HEADERS)));
    const filersArr = await zipToArray(filersFile, FILER_HEADERS);

    return filersArr;
}

async function getCampaignFinance(params) {
    const [zipArr, comms] = await Promise.all([
        await getZip(params),
        await getCommitteeList()
    ]);
    
    const results = zipArr.map(row => {
        if(!row.FILERID) {
            console.log('No FILERID: ', row);
        }
        if(row.FILERTYPE == 2) {
            const committee = comms.find(x=>x.report_id == row.REPORTID);
            if(!committee) {
                // console.log('Failed to find Committee: ' + row.FILERID);
                // console.log(row);
            } else {
                console.log('found committee');
            }
            row.committee = committee;
        }
        return row;
    });

    return results;
}

module.exports = {
    getCommitteeList,
    getZip,
    getCampaignFinance
};

// getZip(2022);
