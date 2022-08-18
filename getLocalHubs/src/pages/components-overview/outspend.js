import React, { useState, useEffect } from 'react';
import {TableMaker} from './tableMaker.js';
import axios from 'axios'


export default function RenderOutspendElections(){


  const [outspentDems, setOutspentDems] = useState([])


  useEffect(()=>{
    axios.get('http://localhost:4000/outspend/Pennsylvania/2022')
    .then((res)=>{
      setOutspentDems(res["data"])
    })
  }, [])



  return (
    <React.Fragment>
    <ul style={{'list-style-type': 'none'}}>
      {outspentDems.map((race, index)=>{
          return(
            <li key={index}>
              <TableMaker race={race.race} index={index}/>
           </li>
          )
      })}
      </ul >
    </React.Fragment>
  )
}
