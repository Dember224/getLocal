const axios = require('axios');
const cheerio = require('cheerio');

const getElectionDate = async function(callData){
    const response = await axios.get('https://secure.kentucky.gov/kref/publicsearch/GetAllElectionDates');
    const election_date = response.data.find(date=>{
        if(date.includes(callData.year) && date.includes('11/')){
            return date;
        }
    })
    return election_date

}

const checkMoney = async function(callData){
    const election_date = await getElectionDate(callData.year)
    const response = await axios.get('https://secure.kentucky.gov/kref/publicsearch/OfficeSearch', {params:{
        ElectionDate: election_date,
        ElectionType: 'GENERAL',
        OfficeSought: callData.office,
        PoliticalParty: '',
        ExemptionStatus: 'All',
        pageSize:200
    }})

    const $ = cheerio.load(response.data);

    const money_array = [];
   $('tbody tr').each(function(i, element){
        const text = $(this).text();
        text_split = text.split(/\n/)
        const money_object = {
            name: text_split[1].trim(),
            office: text_split[2].replace('(Odd)', '').trim(),
            district: text_split[3].replace(/\D/g, ''),
            election_year: new Date('01/01/'+callData.year).toGMTString(),
            election_type:text_split[5].trim(),
            contributions:parseFloat(text_split[6].replace(/[^0-9.-]+/g,"")),
            expenditures: parseFloat(text_split[7].replace(/[^0-9.-]+/g,"")),
            state:'kentucky',
            asOf: new Date(),
            name_year: `${text_split[1].trim()} ${callData.year}`,
            party:'unknown'

        }
        money_array.push(money_object)
    })
    return money_array

    // console.log(tbody)
};


const getFinanceData = async function(callData){
    const sen_money = await checkMoney({year: callData.year, office: 'STATE SENATOR (ODD)'});
    const rep_money = await checkMoney({year: callData.year, office:'STATE REPRESENTATIVE'});
    
    total_money = []
     rep_money.map(money_obj=>{
        total_money.push(money_obj)
    });
    sen_money.map(money_obj=>{
        total_money.push(money_obj)
    })
    return total_money;


}


module.exports = {
    getFinanceData
}