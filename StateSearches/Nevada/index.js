// const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra')

const StealthPlugin = require('puppeteer-extra-plugin-stealth')


async function sleep(time) {
    console.log('sleeping',time);
    await new Promise((res,rej) => {
        setTimeout(res, time);
    });
}

const openNevada = async function(){
    await puppeteer.use(StealthPlugin())
    await sleep((Math.random()) * 1000);
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://www.nvsos.gov/SOSCandidateServices/AnonymousAccess/CEFDSearchUU/Search.aspx#individual_search');
    const data = await page.evaluate(() => document.querySelector('*').outerHTML);

    const $ = cheerio.load(data);
    const view_state = $('#__VIEWSTATE').attr('value')
    const view_state_generator = $('#__VIEWSTATEGENERATOR').attr('value');
    const event_validation = $('#__EVENTVALIDATION').attr('value');

    console.log({view_state, view_state_generator, event_validation})


    await browser.close();
}   

openNevada()


// const findViewStateData = async function(){
//     await sleep((Math.random()) * 1000);
//     const response = await axios.get('https://www.nvsos.gov/SOSCandidateServices/AnonymousAccess/CEFDSearchUU/Search.aspx', {
//         headers: {
//             'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
//             accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
//             'accept-encoding': 'gzip, deflate, br',
//             'sec-ch-ua': '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
//             'sec-ch-ua-platform': '"Windows"'
//           },
//           withCredentials: true
//     })
//     console.log(response.data)

//     const $ = cheerio.load(response.data);
//     const view_state = $('#__VIEWSTATE').attr('value')
//     const view_state_generator = $('#__VIEWSTATEGENERATOR').attr('value');
//     const event_validation = $('#__EVENTVALIDATION').attr('value');

//     console.log({view_state, view_state_generator, event_validation})
// }

// findViewStateData()

// const checkNevada= async function(){
//     const response = await got.get('https://www.nvsos.gov/SOSCandidateServices/AnonymousAccess/CEFDSearchUU/Search.aspx');

//     console.log(response)
// }

// checkNevada()


// ctl00_ToolkitScriptManager1_HiddenField: ;;AjaxControlToolkit, Version=3.5.50731.0, Culture=neutral, PublicKeyToken=28f01b0e84b6d53e:en-US:ec0bb675-3ec6-4135-8b02-a5c5783f45f5:5546a2b:475a4ef5:d2e10b12:effe2a26:37e2e5c9:5a682656:12bbc599
// __EVENTTARGET: 
// __EVENTARGUMENT: 
// __VIEWSTATE: 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
// __VIEWSTATEGENERATOR: 8B65019A
// __EVENTVALIDATION: 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
// inputVisionSearchBox: 
// search_type: #individual_search
// ctl00$MainContent$txtFirstName: 
// ctl00$MainContent$txtLastName: 
// ctl00$MainContent$ddlParty: 
// ctl00$MainContent$txtOfficeName: State Senate
// ctl00$MainContent$ddlJurisdiction: 
// ctl00$MainContent$ddlElectionYear: 
// ctl00$MainContent$txtGroupName: 
// ctl00$MainContent$ddlGroupType: 
// ctl00$MainContent$txtGroupCity: 
// ctl00$MainContent$txtGroupFirstName: 
// ctl00$MainContent$txtGroupLastName: 
// ctl00$MainContent$txtContName: 
// ctl00$MainContent$txtContAddress: 
// ctl00$MainContent$txtContCity: 
// ctl00$MainContent$txtContState: 
// ctl00$MainContent$txtContZip: 
// ctl00$MainContent$txtRecipientName: 
// ctl00$MainContent$txtRadContAmountMin: 
// ctl00_MainContent_txtRadContAmountMin_ClientState: {"enabled":true,"emptyMessage":"","validationText":"","valueAsString":"","minValue":-70368744177664,"maxValue":70368744177664,"lastSetTextBoxValue":""}
// ctl00$MainContent$txtRadContAmountMax: 
// ctl00_MainContent_txtRadContAmountMax_ClientState: {"enabled":true,"emptyMessage":"","validationText":"","valueAsString":"","minValue":-70368744177664,"maxValue":70368744177664,"lastSetTextBoxValue":""}
// ctl00$MainContent$txtRadContDateMin: 
// ctl00$MainContent$txtRadContDateMin$dateInput: 
// ctl00_MainContent_txtRadContDateMin_dateInput_ClientState: {"enabled":true,"emptyMessage":"","validationText":"","valueAsString":"","minDateStr":"1980-01-01-00-00-00","maxDateStr":"2099-12-31-00-00-00","lastSetTextBoxValue":""}
// ctl00_MainContent_txtRadContDateMin_calendar_SD: []
// ctl00_MainContent_txtRadContDateMin_calendar_AD: [[1980,1,1],[2099,12,30],[2023,3,16]]
// ctl00_MainContent_txtRadContDateMin_ClientState: 
// ctl00$MainContent$txtRadContDateMax: 
// ctl00$MainContent$txtRadContDateMax$dateInput: 
// ctl00_MainContent_txtRadContDateMax_dateInput_ClientState: {"enabled":true,"emptyMessage":"","validationText":"","valueAsString":"","minDateStr":"1980-01-01-00-00-00","maxDateStr":"2099-12-31-00-00-00","lastSetTextBoxValue":""}
// ctl00_MainContent_txtRadContDateMax_calendar_SD: []
// ctl00_MainContent_txtRadContDateMax_calendar_AD: [[1980,1,1],[2099,12,30],[2023,3,16]]
// ctl00_MainContent_txtRadContDateMax_ClientState: 
// ctl00$MainContent$txtExpenseName: 
// ctl00$MainContent$txtPayerName: 
// ctl00$MainContent$txtRadExpenseAmountMin: 
// ctl00_MainContent_txtRadExpenseAmountMin_ClientState: {"enabled":true,"emptyMessage":"","validationText":"","valueAsString":"","minValue":-70368744177664,"maxValue":70368744177664,"lastSetTextBoxValue":""}
// ctl00$MainContent$txtRadExpenseAmountMax: 
// ctl00_MainContent_txtRadExpenseAmountMax_ClientState: {"enabled":true,"emptyMessage":"","validationText":"","valueAsString":"","minValue":-70368744177664,"maxValue":70368744177664,"lastSetTextBoxValue":""}
// ctl00$MainContent$txtRadExpenseDateMin: 
// ctl00$MainContent$txtRadExpenseDateMin$dateInput: 
// ctl00_MainContent_txtRadExpenseDateMin_dateInput_ClientState: {"enabled":true,"emptyMessage":"","validationText":"","valueAsString":"","minDateStr":"1980-01-01-00-00-00","maxDateStr":"2099-12-31-00-00-00","lastSetTextBoxValue":""}
// ctl00_MainContent_txtRadExpenseDateMin_calendar_SD: []
// ctl00_MainContent_txtRadExpenseDateMin_calendar_AD: [[1980,1,1],[2099,12,30],[2023,3,16]]
// ctl00_MainContent_txtRadExpenseDateMin_ClientState: 
// ctl00$MainContent$txtRadExpenseDateMax: 
// ctl00$MainContent$txtRadExpenseDateMax$dateInput: 
// ctl00_MainContent_txtRadExpenseDateMax_dateInput_ClientState: {"enabled":true,"emptyMessage":"","validationText":"","valueAsString":"","minDateStr":"1980-01-01-00-00-00","maxDateStr":"2099-12-31-00-00-00","lastSetTextBoxValue":""}
// ctl00_MainContent_txtRadExpenseDateMax_calendar_SD: []
// ctl00_MainContent_txtRadExpenseDateMax_calendar_AD: [[1980,1,1],[2099,12,30],[2023,3,16]]
// ctl00_MainContent_txtRadExpenseDateMax_ClientState: 
// ctl00$MainContent$ddlExpenseTypes: 
// ctl00$MainContent$btnSearchMaster: Search
// hiddenInputToUpdateATBuffer_CommonToolkitScripts: 1