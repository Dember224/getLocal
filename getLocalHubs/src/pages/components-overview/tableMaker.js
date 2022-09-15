import React, { useState} from 'react';
import { makeStyles } from '@mui/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import TableFooter from '@material-ui/core/TableFooter';



const raceStyle = makeStyles((theme) => ({
  cell:{
    // height:"55px !important",
    background:'#EFEEED',
    fontSize: '0.875rem',
    color:'black',
    border:'solid',
    lineHeight: 1.57


  },
  headercell:{
    color:"black",
    fontSize: '0.875rem',
    border:'solid',
    backgroundColor:'#1D96B2'
  },
  footer: {
    margin:"auto",
    display:"flex",
    width:"150%",
    borderTop:'solid'
  }
}));

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}


export function TableMaker(props) {

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const classes = raceStyle();
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const race = props.race
  const index = props.index



  return (
    <Table size="small" key={index} >
      <TableHead>
        <TableRow>
          <TableCell className={classes.headercell}>Candidate Name</TableCell>
          <TableCell className={classes.headercell}>Party</TableCell>
          <TableCell className={classes.headercell}>State</TableCell>
          <TableCell className={classes.headercell}>Election Type</TableCell>
          <TableCell className={classes.headercell}>Office</TableCell>
          <TableCell className={classes.headercell}>District</TableCell>
          <TableCell className={classes.headercell}>Votes</TableCell>
          <TableCell className={classes.headercell}>Expenditures</TableCell>
          <TableCell className={classes.headercell}>Contributions</TableCell>
          <TableCell className={classes.headercell}>Year</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {
          race.map((candidate, iterate)=>{
           return(
             <TableRow key={iterate}>
              <TableCell className={classes.cell}>{toTitleCase(`${candidate.first_name} ${candidate.last_name}`)}</TableCell>
              <TableCell className={classes.cell}>{toTitleCase(candidate.party)}</TableCell>
              <TableCell className={classes.cell}>{toTitleCase(candidate.state)}</TableCell>
              <TableCell className={classes.cell}>{candidate.election_type}</TableCell>
              <TableCell className={classes.cell}>{candidate.chamber_level == 0 ? 'State House' : 'State Senate'}</TableCell>
              <TableCell className={classes.cell}>{candidate.district}</TableCell>
              <TableCell className={classes.cell}>{candidate.votes}</TableCell>
              <TableCell className={classes.cell}>{`$${candidate.expenditures}`}</TableCell>
              <TableCell className={classes.cell}>{`$${candidate.contributions}`}</TableCell>
              <TableCell className={classes.cell}>{candidate.year}</TableCell>
             </TableRow>
          )
       })
     }
     </TableBody>
     <TableFooter className={classes.footer}>
         <TablePagination
         rowsPerPageOptions={[5, 10, 25]}
         count={race.length}
         rowsPerPage={rowsPerPage}
         component="div"
         page={page}
         onPageChange={handleChangePage}
         onRowsPerPageChange={handleChangeRowsPerPage}
         />
     </TableFooter>
    </Table>
  )

}
