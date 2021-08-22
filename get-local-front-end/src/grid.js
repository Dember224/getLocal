import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Title from './Title';

function preventDefault(event) {
  event.preventDefault();
}

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export function LoadGrid() {
  let [queryResults, setQueryResults] = useState({data: [{"name":"Tess Judge","state":"North Carolina","office":"state senator","contributions":"344370.09","expenditures":"2224761.92","shortfall":"1880391.83"}]});

  useEffect(() =>{
    axios.get('http://localhost:4000/shortfall')
      .then((res)=>{
        console.log(res)
        setQueryResults(res);
      })
      .catch(function(error){
        console.log(error)
      })

    return function cleanup(){
      console.log('results displayed')
    }
  }, [])
  const classes = useStyles();
  return (
  <React.Fragment>
    <Title>Short Fall</Title>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>State</TableCell>
          <TableCell>Office</TableCell>
          <TableCell>Contributions</TableCell>
          <TableCell>Expenditures</TableCell>
          <TableCell>Short-fall</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {queryResults.data.map((queryResult) => (
          <TableRow key={queryResult.id}>
            <TableCell>{queryResult.name}</TableCell>
            <TableCell>{queryResult.state}</TableCell>
            <TableCell>{queryResult.office}</TableCell>
            <TableCell>{queryResult.contributions}</TableCell>
            <TableCell>{queryResult.expenditures}</TableCell>
            <TableCell>{queryResult.shortfall}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    <div className={classes.seeMore}>
      <Link color="primary" href="#" onClick={preventDefault}>
        See more orders
      </Link>
    </div>
  </React.Fragment>

  )
}
