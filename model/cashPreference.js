const census = require("citysdk");
const getStateFips = require('../Tools/state_fips').getStateFips
const async = require("async");
const queries = require('../getLocalApi/showData.js');
const parsers = require('../Tools/parsers.js')

class CashPreferenceModel {
  constructor(median_income, expenditures, contributions){
    this.expenditures = expenditures;
    this.contributions = contributions;
  }

  wild_expend(median_income) {
    const diff = this.expenditures - this.contributions;
    if(diff > median_income){
      return true;
    } else {
      return false;
    }
  }

  getStateMedianIncome(state, census_year, callback){ //be sure to give the year the census was run, not the year of the election you want. Method will break if census wasn't conducted that year.
    async.autoInject({
      get_lower_chamber: (cb)=>{
        getStateFips(state, (e,state_fip_code)=>{
          if(e) return cb(e);
          census(
            {
              vintage: census_year, //year needs to be one of the years this census survey acs5 was conducted
              geoHierarchy: {
                state: state_fip_code,
                "state legislative district (lower chamber)": '*',
              },
              sourcePath: ['acs','acs5'],
              values: ['B06011_001E'],
            },
            (err, res) => {

              return cb(null, res)
            } // [{"B00001_001E": 889,"state": "06","county": "049"}, ...
          )
        })
      },
      get_upper_chamber: (cb)=>{
        getStateFips(state, (e,state_fip_code)=>{
          if(e) return e;
          census(
            {
              vintage: census_year,
              geoHierarchy: {
                state: state_fip_code,
                "state legislative district (upper chamber)": '*',
              },
              sourcePath: ['acs','acs5'],
              values: ['B06011_001E'],
            },
            (err, res) => {

              return cb(null, res)
            } // [{"B00001_001E": 889,"state": "06","county": "049"}, ...
          )
        })
      }
    }, (e,r)=>{
      if(e) return e;
      const both_chambers = [];
      r.get_upper_chamber.map(x=>{
        const return_obj = {
          chamber: 'upper',
          district: parseInt(x['state-legislative-district-_upper-chamber_']),
          state,
          median_income:x.B06011_001E
        }
        both_chambers.push(return_obj)
      })

      r.get_lower_chamber.map(x=>{
        const return_obj = {
          chamber: 'lower',
          district: parseInt(x['state-legislative-district-_lower-chamber_']),
          state,
          median_income:x.B06011_001E
        }
        both_chambers.push(return_obj)
      })
      return callback(null, both_chambers)
    })

  }

  getMoneyByState(state, year, callback){
    const query = 'Select name, state, office, contributions, expenditures, district  from campaign_finance where state=$1 and election_year=$2';
    const values = [state, new Date('01/01/'+year).toLocaleString("nl-BE")];

    queries.mysteryQuery(query, values, (e,results)=>{
      if(e) return callback(e);
      const result_array = results.map(x=>{
        let return_object = x;
        x.contributions = parseFloat(x.contributions);
        x.expenditures = parseFloat(x.expenditures);
        x.district = parseInt(x.district)
        x.surplus = x.contributions - x.expenditures;
        x.shortfall = x.expenditures - x.contributions;
        return return_object;
      })
      return callback(null, result_array)
    })
  }

  eliminateWealthy(state, election_year, census_year, callback){
    this.getMoneyByState(state, election_year, (e, finance_array)=>{
      if(e) return callback(e);

      this.getStateMedianIncome(state, census_year, (e,census_array)=>{
        if(e) return callback(e);
        let no_wealthy = finance_array.map((finance_object)=>{
          const chamber = parsers.chamberParser(finance_object.office);
          const census_object = census_array.find((census_object)=>{
            return census_object.chamber == chamber && census_object.district == finance_object.district;
          })
          if(finance_object.shortfall < census_object.median_income){
            const no_wealthy_object = finance_object;
            no_wealthy_object.median_income = census_object.median_income;
            return no_wealthy_object
          }
        })

        no_wealthy = no_wealthy.filter(x=>{
          return x !== undefined;
        })
        console.log(no_wealthy)
      })
    })
  }
}

const model_test = new CashPreferenceModel(0,2000, 4000)
model_test.eliminateWealthy('Texas', 2020, 2019, (e,r)=>{
  if(e) return e;
  console.log(r)
})
