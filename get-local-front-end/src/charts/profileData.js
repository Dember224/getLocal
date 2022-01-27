import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {RenderFemCard} from './femCard';
import {RenderMascCard} from './mascCard';
import {RenderProfileHeader} from './profileHeader'


//work around this by using the census methods in the API. I should have never tried it this way in the first place.
//Put it in the API and pass back the data in the response. React is going to complain about improting methods from outside src.
export function RenderProfile(props){
  const [censusData, setCensusData] = useState({});
  const [lookP, setLookP] = useState(props);
  const [femalePopulation, setFemalePopulation] = useState(0);
  const [malePopulation, setMalePopulation] = useState(0);

  useEffect(()=>{
    setLookP(props)
  })
  useEffect(()=>{
    axios.get(`http://localhost:4000/profile/${lookP.choosenState}/${lookP.district}/${lookP.office}`)
      .then((response)=>{
        setCensusData(response)
        setFemalePopulation(response.data.female_population)
        setMalePopulation(response.data.male_population)
      })
  },[lookP.district])

return(
  <div>
  <div>
    <RenderProfileHeader choosenState={lookP.choosenState} office={lookP.office} district={lookP.district} />
    <RenderFemCard female_population={femalePopulation} />
    <RenderMascCard male_population={malePopulation} />
  </div>
    {JSON.stringify(lookP)}
    {JSON.stringify(censusData.data)}
  </div>
)

}
