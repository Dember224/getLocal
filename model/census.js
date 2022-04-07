const census = require("citysdk");
const getStateFips = require('../Tools/state_fips').getStateFips


const getStateMedianIncome = function(state){
  getStateFips(state, (e,state_fip_code)=>{
    if(e) return e;
    census(
      {
        vintage: '2017',
        geoHierarchy: {
          state: state_fip_code,
          "state legislative district (lower chamber)": '*',
        },
        sourcePath: ['acs','acs5'],
        values: ['B06011_001E'],
      },
      (err, res) => {

        console.log(res)
      } // [{"B00001_001E": 889,"state": "06","county": "049"}, ...
    )
  })
}



getStateMedianIncome('Maryland')
