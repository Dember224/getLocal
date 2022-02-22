import React, {useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import {spendStyle} from './styles.js';
import {contributeStyle} from './styles.js';
import {candidateStyle} from './styles.js';
const axios = require('axios');

export function RenderCandidateFunds(props){
  const [finance, setFinance] = useState([{name:'Candidate', office:'Office', contributions:0, expenditures:0, election_year:new Date().getDate()}]);
  const state = props.state;
  const district = props.district
  useEffect(()=>{
    if(state && district){
      axios.get(`http://localhost:4000/district_candidates/${state}/${district}`)
      .then((response)=>{
        setFinance(response.data);
      })
    }
  },[district])

  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',

    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });

  //I should throw the formatter into tools instead of copy pasting it all over the repo.

const spend_class = spendStyle();
const contribute_class = contributeStyle();
const candidate_class = candidateStyle();

const displayCard = finance.map((x, i)=>{
  return (
    <div key={i}>
      <Card className={candidate_class.root}>
        <CardContent>
          <Typography variant="h2" component="p">
            {x.name}
          </Typography>
          <Typography variant="h2" component="p">
            for {x.office}
          </Typography>
          <Typography variant="h2" component="p">
            {new Date(x.election_year).getFullYear()}
          </Typography>
        </CardContent>
      </Card>
      <Card className = {contribute_class.root} >
        <CardContent>
        <Typography variant="h3" component="p">
          Contributions
        </Typography>
        <Typography variant="h3" component="p">
          {formatter.format(x.contributions)}
        </Typography>
        </CardContent>
      </Card>
      <Card className = {spend_class.root} >
      <CardContent >
      <Typography variant="h3" component="p">
        Expenditures
      </Typography>
      <Typography variant="h3" component="p">
        {formatter.format(x.expenditures)}
      </Typography>
      </CardContent>
    </Card>
    </div>
  )
})

  return (
    <div>
    <Card>
      <Typography variant="h2">
        Candidates:
      </Typography>
    </Card>
      {displayCard}
    </div>
  );
}
