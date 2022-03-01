import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import TableFooter from '@material-ui/core/TableFooter';
import GetAppIcon from '@material-ui/icons/GetApp';
require('dotenv').config();

const uri = process.env.API_URI
const useStyles = makeStyles((theme) => ({
  table: {
    width:"90%",
    margin:'auto',
    borderRadius:"45%",

  },
  cell:{
    height:"55px !important",


  },
  head: {
    "margin":"auto",
    border:"solid",
    backgroundColor:'#95CCCC',
    color:"white"

  },
  headercell:{
    color:"white"
  },
  footer: {
    margin:"auto",
    display:"flex",
    width:"150%"
  }
}));

export function LoadRawData() {

  let [queryResults, setQueryResults] = useState({data: [{"id":"2109","name":"campbell, mary blackmon","office":"state representative","state":"Georgia","contributions":"2197.34","expenditures":"0","asof":"2021-05-31T21:26:10.300Z","election_year":"2020-01-01T05:00:00.000Z","election_type":"General","district":"97"}]});
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  useEffect(() =>{
    const endpoint = process.env.REACT_APP_ENV == 'development' ? process.env.REACT_APP_DEV_ENDPOINT : process.env.REACT_APP_API_URI;
    axios.get(`${endpoint}/raw`)
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
  }, []);

const handleChangePage = (event, newPage) => {
  setPage(newPage);
};

const handleChangeRowsPerPage = (event) => {
  setRowsPerPage(parseInt(event.target.value, 10));
  setPage(0);
};
function colorChart(num) {
  if(num % 2){
    return '#B5D8FF'
  } else {
    return '#9CA69F'
  }
}

  const classes = useStyles();
  return (
  <React.Fragment >
  {uri}
  <h1>
  Raw Data Sample
  </h1>
    <Table size="small" className={classes.table}>
      <TableHead className={classes.head}>
        <TableRow>
          <TableCell className={classes.headercell}>Name</TableCell>
          <TableCell className={classes.headercell}>State</TableCell>
          <TableCell className={classes.headercell}>Office</TableCell>
          <TableCell className={classes.headercell}>District</TableCell>
          <TableCell className={classes.headercell}>Contributions</TableCell>
          <TableCell className={classes.headercell}>Expenditures</TableCell>
          <TableCell className={classes.headercell}>Election Year</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {queryResults.data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((queryResult, i) => (
          <TableRow key={queryResult.id} bgColor={colorChart(i)} >
            <TableCell className={classes.cell}>{queryResult.name}</TableCell>
            <TableCell className={classes.cell}>{queryResult.state}</TableCell>
            <TableCell className={classes.cell}>{queryResult.office}</TableCell>
            <TableCell className={classes.cell}>{queryResult.district}</TableCell>
            <TableCell className={classes.cell}>{queryResult.contributions}</TableCell>
            <TableCell className={classes.cell}>{queryResult.expenditures}</TableCell>
            <TableCell className={classes.cell}>{queryResult.election_year}</TableCell>

          </TableRow>
        ))}
      </TableBody>
      <TableFooter className={classes.footer}>
          <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          count={queryResults.data.length}
          rowsPerPage={rowsPerPage}
          component="div"
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          />
      </TableFooter>
    </Table>
    Download what we have so far: <GetAppIcon className="downloadIcon" onClick={event =>  window.location.href='https://data.heroku.com/dataclips/lvfocubcptvffcmhumzyfziuguci.csv'}/>
  </React.Fragment>

  )
}
