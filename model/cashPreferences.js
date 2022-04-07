const censusSearch = require("../censusTools/censusSearch")

class CashPreferenceModel {
  constructor(expenditures, contributions) {
    this.expenditures=expenditures;
    this.contributions=contributions;
  }
  printMoneyData(){
    console.log(this.expenditures, this.contributions);
  }
}

const myMoney = new CashPreferenceModel(500, 10000)
myMoney.printMoneyData();

// get money for district & state, make class function that will return the objects of the median income for that district

censusSearch.searchCensusStatsByDistrict({
  state:"connecticut",
  year:2018,
  chamber:"lower",
  district_number: 3,
}, function(error, census_data_new_array){
  if(error) console.log(error);
  console.log(census_data_new_array);
})
