const axios = require('axios');


const getFinanceData = async function(callData){
    const results = await axios.post('https://financial-disclosures.sos.arkansas.gov//CFISAR_Service/api///Organization/SearchCandidates',
    {
        "ElectionYear": callData.year,
        "Party": null,
        "OfficeSought": "215,214",
        "JurisdictionType": null,
        "Jurisdiction": null,
        "FinanceType": null,
        "TransactionType": null,
        "TransactionAmount": null,
        "Status": "",
        "DistrictId": null,
        "pageNumber": 1,
        "pageSize": 1500,
        "sortDir": "asc",
        "sortedBy": ""
    });


    const finance_array = results.data.map(data_object=>{
        return {
            name: data_object.CandidateName,
            office: data_object.OfficeName,
            party: data_object.Party,
            district: parseInt(data_object.District), 
            contributions: parseFloat(data_object.TotalContributions),
            expenditures: parseFloat(data_object.TotalExpenditures),
            election_year: new Date('01/01/'+callData.year).toGMTString(),
            election_type: 'general',
            state:'arkansas',
            asOf: new Date(),
            name_year: `${data_object.CandidateName}${callData.year}`

        }
    })
    console.log('array length', finance_array.length)

    return finance_array;

}

// async function check_stuff(){
//    const data = await getFinanceData({year:2022})
//    console.log(data.filter(x=>x.contributions != 0))
// }

// check_stuff()
module.exports = {
    getFinanceData
}