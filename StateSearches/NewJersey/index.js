const axios = require('axios');
const cheerio = require('cheerio')

//New Jersey has off year elections. 

const getCandidateMoney = async function(callData){
    const response = await axios.post('https://bitselecreportswebapi.azurewebsites.net/api/VWEntityMetric/getlist',
    {
        "ReportId": 27,
        "NONPACOnly": true,
        "PACOnly": false,
        "PACName": null,
        "EntityName": null,
        "LastName": "",
        "FirstName": "",
        "MI": "",
        "Suffix": "",
        "NonIndName": "",
        "OfficeCodes": "",
        "LocationCodes": "",
        "PartyCodes": "",
        "ElectionTypeCodes": "G",
        "ElectionYears": callData.year,
        "PageIndex": 1,
        "PageSize": 4000,
        "Hr48Date": null,
        "RowsCount": 100,
        "TotalRowsCount": 2594,
        "LobbyistName": null,
        "DateReleased": null,
        "ComplaintType": null,
        "IsContributorParameterSet": false,
        "GetRowCountOnly": false,
        "AllDistrictsOfCounty": false,
        "SkipRecords": 0,
        "OccupationCodes": null,
        "ContributorTypeCodes": null,
        "FromDate": null,
        "ToDate": null,
        "FromAmount": null,
        "ToAmount": null,
        "EmployerName": null,
        "SortName": "ElectionYear",
        "SortBy": "Desc"
    })
    return response.data
}

const getFinanceData = async function(callData){
    const money_array = await getCandidateMoney({year:callData.year});
    const return_array = money_array.map(money_object=>{
        return_object = {
            name: money_object.ENTITYNAME,
            election_year: new Date('01/01/'+callData.year).toGMTString(),
            office: money_object.OFFICE,
            party: money_object.PARTY,
            district: money_object.LOCATION.replace(/\D/g, ''),
            contributions: money_object.TOT_CONT_AMT,
            expenditures: money_object.TOT_EXP_AMT,
            election_type: 'general',
            state: 'new jersey',
            asOf: new Date(),
            name_year: `${money_object.ENTITYNAME}${callData.year}`

        }
        return return_object;
    }).filter(money_object=>{
        if(money_object.office.includes('ASSEMBLY') || money_object.office.includes('STATE SENATE')){
            return money_object;
        }
    })
    console.log(return_array)
    return return_array

}

module.exports = {
    getFinanceData
}