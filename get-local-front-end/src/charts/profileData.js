import React, { useState, useEffect } from 'react';
const censusData = require('../../censusTools/censusSearch');

const chamberParser = function(office){
  const lower_case_office = office.toLowerCase();
  if(lower_case_office.match(/senate|senator/)){
    return 'upper';
  } else if (lower_case_office.match(/assemblyman|representative|delegate/)){
    return 'lower';
  }
}
//work around this by using the census methods in the API. I should have never tried it this way in the first place.
//Put it in the API and pass back the data in the response. React is going to complain about improting methods from outside src. 
export function RenderProfile(props){
  const [censusData, setCensusData] = useState({});

  useEffect(()=>{
    const current_year = new Date().getFullYear()
    const chamber = chamberParser(props.office);
    tools.searchCensusStatsByDistrict({state:props.state, year:current_year, chamber, district_number:props.district}, (e, census_object)=>{
      if(e) console.log('error getting census object', e);
      setCensusData(census_object)
    })
  })

return(
  <div>
    {JSON.stringify(censusData)}
  </div>
)

}
