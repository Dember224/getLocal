import React, { useState} from 'react';
import {Table, TableBody, TableCell, TableHead, TableRow, TablePagination, TableFooter} from '@material-ui/core';



const raceStyle = {
  cell: {
    // height:"55px !important",
    background: '#EFEEED',
    // fontSize: '0.875rem',
    color: 'black',
    border: 'solid',
    lineHeight: 1.57
  },
  headercell: {
    color: "black",
    // fontSize: '0.875rem',
    border: 'solid',
    backgroundColor: '#1D96B2'
  },
  footer: {
    margin: "auto",
    display: "flex",
    width: "150%",
    borderTop: 'solid'
  }
};



function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}


export function TableMaker(props) {

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const handleChangePage = ( newPage) => {
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
          <TableCell style={raceStyle.headercell}>Candidate Name</TableCell>
          <TableCell style={raceStyle.headercell}>Party</TableCell>
          <TableCell style={raceStyle.headercell}>State</TableCell>
          <TableCell style={raceStyle.headercell}>Election Type</TableCell>
          <TableCell style={raceStyle.headercell}>Office</TableCell>
          <TableCell style={raceStyle.headercell}>District</TableCell>
          <TableCell style={raceStyle.headercell}>Votes</TableCell>
          <TableCell style={raceStyle.headercell}>Expenditures</TableCell>
          <TableCell style={raceStyle.headercell}>Contributions</TableCell>
          <TableCell style={raceStyle.headercell}>Year</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {
          race.map((candidate, iterate)=>{
           return(
             <TableRow key={iterate}>
              <TableCell style={raceStyle.cell}>{toTitleCase(`${candidate.first_name} ${candidate.last_name}`)}</TableCell>
              <TableCell style={raceStyle.cell}>{toTitleCase(candidate.party)}</TableCell>
              <TableCell style={raceStyle.cell}>{toTitleCase(candidate.state)}</TableCell>
              <TableCell style={raceStyle.cell}>{candidate.election_type}</TableCell>
              <TableCell style={raceStyle.cell}>{candidate.chamber_level == 0 ? 'State House' : 'State Senate'}</TableCell>
              <TableCell style={raceStyle.cell}>{candidate.district}</TableCell>
              <TableCell style={raceStyle.cell}>{candidate.votes}</TableCell>
              <TableCell style={raceStyle.cell}>{`$${candidate.expenditures}`}</TableCell>
              <TableCell style={raceStyle.cell}>{`$${candidate.contributions}`}</TableCell>
              <TableCell style={raceStyle.cell}>{candidate.year}</TableCell>
             </TableRow>
          )
       })
     }
     </TableBody>
     <TableFooter style={raceStyle.footer}>
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
