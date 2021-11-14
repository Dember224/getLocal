import React, { useState, useEffect } from 'react';
const censusData = require('../../censusTools/censusSearch');
const tools = require('../../../Tools/parsers.js');

export function renderProfile(props){
  const [censusData, setCensusData] = useState({});

  useEffect(()=>{
    const current_year = new Date().getFullYear()
    const chamber = tools.chamberParser(props.office);
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
