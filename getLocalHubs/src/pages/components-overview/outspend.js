import React, { useState, useEffect } from 'react';
import {TableMaker} from './tableMaker.js';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();


export default function RenderOutspendElections(){

  const base_url = process.env.REACT_APP_API_URL;
  const [outspentDems, setOutspentDems] = useState([])


  useEffect(()=>{
    axios.get(`${base_url}outspend/Pennsylvania/2022`)
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
