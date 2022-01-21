import React, { useState, useEffect } from 'react';
import axios from 'axios';


//work around this by using the census methods in the API. I should have never tried it this way in the first place.
//Put it in the API and pass back the data in the response. React is going to complain about improting methods from outside src.
export function RenderProfile(props){
  const [censusData, setCensusData] = useState({});
  const [lookP, setLookP] = useState(props)

  useEffect(()=>{
    setLookP(props)
  })
  useEffect(()=>{
    axios.get(`http://localhost:4000/profile/${lookP.choosenState}/${lookP.district}/${lookP.office}`)
      .then((response)=>{
        setCensusData(response)

      })
  },[lookP.district])

return(
  <div>
    {JSON.stringify(lookP)}
    {JSON.stringify(censusData)}
  </div>
)

}
