import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import TableFooter from '@material-ui/core/TableFooter';
import { sizing, display, borders } from '@material-ui/system';
import Title from './Title';

function preventDefault(event) {
  event.preventDefault();
}

const useStyles = makeStyles((theme) => ({
  table: {
    width:"60%",
    "margin-left":"15%",
    borderRadius:"45%"
  },
  head: {
    "margin-left":"-12%"

  },
  footer: {
    "margin-left":"15%",
    display:"flex"
  }
}));

export function LoadShortfallGrid() {
  let [queryResults, setQueryResults] = useState({data: [{"name":"Tess Judge","state":"North Carolina","office":"state senator","contributions":"344370.09","expenditures":"2224761.92","shortfall":"1880391.83"}]});
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

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
    <p className={classes.head}>Short Fall</p>
    <Table size="small" className={classes.table}>
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
        {queryResults.data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((queryResult, i) => (
          <TableRow key={queryResult.id} bgColor={colorChart(i)}>
            <TableCell >{queryResult.name}</TableCell>
            <TableCell>{queryResult.state}</TableCell>
            <TableCell>{queryResult.office}</TableCell>
            <TableCell>{queryResult.contributions}</TableCell>
            <TableCell>{queryResult.expenditures}</TableCell>
            <TableCell>{queryResult.shortfall}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
  </React.Fragment>

  )
}
