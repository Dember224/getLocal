import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {RenderFemCard} from './femCard';
import {RenderMascCard} from './mascCard';
import {RenderProfileHeader} from './profileHeader';
import {RenderRaceGraph} from './racePopulation';
import {RenderCitizenship} from './citizens';
import {RenderIncomeCard} from './incomeCard';


//work around this by using the census methods in the API. I should have never tried it this way in the first place.
//Put it in the API and pass back the data in the response. React is going to complain about improting methods from outside src.
export function RenderProfile(props){
  const [censusData, setCensusData] = useState({});
  const [lookP, setLookP] = useState(props);
  const [femalePopulation, setFemalePopulation] = useState(0);
  const [malePopulation, setMalePopulation] = useState(0);
  const [black, setBlack] = useState(0);
  const [asian, setAsian] = useState(0);
  const [mixed, setMixed] = useState(0);
  const [white, setWhite] = useState(0);
  const [native, setNative] = useState(0);
  const [latino, setLatino] = useState(0);
  const [pacific, setPacific] = useState(0);
  const [other, setOther] = useState(0);
  const [citizens, setCitizens]= useState(0);
  const [noncitizens, setNonCitizens] = useState(0);
  const [income, setIncome] = useState(0)

  useEffect(()=>{
    setLookP(props)
  })
  useEffect(()=>{
    axios.get(`http://localhost:4000/profile/${lookP.choosenState}/${lookP.district}/${lookP.office}`)
      .then((response)=>{
        setCensusData(response)
        setFemalePopulation(response.data.female_population);
        setMalePopulation(response.data.male_population);
        setBlack(response.data.number_of_black_ppl);
        setAsian(response.data.number_of_asian_ppl);
        setMixed(response.data.number_of_mixed_race_ppl);
        setWhite(response.data.number_of_white_ppl);
        setNative(response.data.number_of_native_american_ppl);
        setLatino(response.data.number_of_latino_ppl);
        setPacific(response.data.number_of_pacific_island_ppl);
        setOther(response.data.number_of_other_races);
        setCitizens(response.data.number_of_citizens);
        setNonCitizens(response.data.number_of_non_citizens);
        setIncome(response.data.median_income)
      })
  },[lookP.district])

return(
  <div>
  <div>
    <RenderProfileHeader choosenState={lookP.choosenState} office={lookP.office} district={lookP.district} />
    <RenderFemCard female_population={femalePopulation} />
    <RenderMascCard male_population={malePopulation} />
    <RenderRaceGraph black={black} asian={asian} mixed={mixed} white={white} native={native} latino={latino} pacific={pacific} other={other}/>
    <RenderCitizenship citizens={citizens} noncitizens={noncitizens} />
    <RenderIncomeCard median_income={income} />

  </div>

  </div>
)

}
