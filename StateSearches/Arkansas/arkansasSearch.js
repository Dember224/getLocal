const axios = require('axios');
// this saves the module to the variable Axios

function getArkansasFinanceData (callData) {
  axios({
    method: 'post',
    url: 'https://financial-disclosures.sos.arkansas.gov//CFISAR_Service/api///Organization/SearchCandidates',
    data: {
      DistrictId: null,
      ElectionYear: callData.year,
      FinanceType: null,
      Jurisdiction: null,
      JurisdictionType: null,
      OfficeSought: "214,215",
      Party: "DEM",
      Status: "",
      TransactionAmount: null,
      TransactionType: null,
      pageNumber: 1,
      pageSize: 500,
      sortDir: "asc",
      sortedBy: "",
    }
  })
  .then(function (response){
    const arkansas_array = response.data;
    const filtered_arkansas_array = arkansas_array.filter((data)=> {
      return data.Status == "Active";
    });
    const cute_arkansas_array = filtered_arkansas_array.map((moneyObject)=>{
      /*CandidateName: 'Faulkenberry, Gwendolann Ford',
      TotalContributions: '32945.8000',
      TotalExpenditures: '36389.5800',
      OfficeName: 'State Representative',
      District: '82',
      Party: 'DEMOCRAT',*/
      const returnObject = {
        name: moneyObject.CandidateName,
        contributions: parseFloat(moneyObject.TotalContributions),
        expenditures: parseFloat(moneyObject.TotalExpenditures),
        election_year: new Date('01/01/'+callData.year).toGMTString(),
        election_type: callData.election_type,
        state: callData.state,
        district: moneyObject.District,
        office: moneyObject.OfficeName,
        party: moneyObject.Party,
        name_year: moneyObject.CandidateName + callData.year + callData.election_type,
        asOf: new Date(),
      }
      return returnObject;
    })
    console.log(cute_arkansas_array);
  })
};

getArkansasFinanceData(
  {year:2020,
  election_type: 'General',
  state:'Arkansas',
  }
);
