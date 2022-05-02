#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const {Readable} = require('node:stream');
const csv = require('csv-parser');

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

async function getZip(year) {
    if(!year.toString().match(/\d\d\d\d/)) throw new Error('year must be a 4 digit int');
    if(parseInt(year) < 2022) throw new Error('year prior to 2022 not supported');

    const result = await axios.get(`${DOS_PA_GOV}${FULL_EXPORT_URI}`);
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

    const localZipName = path.join(__dirname, `${year}_${new Date().getTime()}.zip`);
    
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

    console.log(filersArr);
}

module.exports = {
    getZip
};

getZip(2022);
