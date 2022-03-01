import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import {RenderDistrictSelectors} from './districtSelector';



function ProgressBar(){
  return (
    <React.Fragment>
     <Box sx={{ display: 'flex'}} justifyContent={'center'}>
       <CircularProgress  size={'30%'}  />
     </Box>
    </React.Fragment>
  )
}


export function RenderStateButtons(){
  const [stateList, setStateList] = useState([]);
  const [progress, setProgress] = useState(<ProgressBar/>);
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [selectedState, setSelectedState] = React.useState(null);

  const options = stateList;
  const handleClick = () => {
   console.info(`You clicked ${options[selectedIndex]}`);
   setSelectedState(options[selectedIndex]);
  };

 const handleMenuItemClick = (event, index) => {
   setSelectedIndex(index);
   setOpen(false);
   setSelectedState(options[index]);
 };

 const handleToggle = () => {
   setOpen((prevOpen) => !prevOpen);

 };

 const handleClose = (event) => {
   if (anchorRef.current && anchorRef.current.contains(event.target)) {
     return;
   }

   setOpen(false);
 };

  useEffect(()=>{
    const endpoint = process.env.REACT_APP_ENV == 'development' ? process.env.REACT_APP_DEV_ENDPOINT : process.env.REACT_APP_API_URI;
    axios.get(`${endpoint}/stateList`)
    .then((res)=>{
      const mapped_states = res.data.map((x)=>{
        return x.state
      })
      setStateList(mapped_states);
      console.log(res)
    }).catch(function(e){
      console.log('Trouble getting the stateList',e)
    })
    setProgress(<div></div>)

  }, [])


  return(
    <div>
      <div>
          {progress}

        <React.Fragment>
         <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
           <Button onClick={handleClick}>{options[selectedIndex]}</Button>
           <Button
             size="small"
             aria-controls={open ? 'split-button-menu' : undefined}
             aria-expanded={open ? 'true' : undefined}
             aria-label="select merge strategy"
             aria-haspopup="menu"
             onClick={handleToggle}
           >
             <ArrowDropDownIcon />
           </Button>
         </ButtonGroup>
         <Popper
           open={open}
           anchorEl={anchorRef.current}
           role={undefined}
           transition
           disablePortal
         >
           {({ TransitionProps, placement }) => (
             <Grow
               {...TransitionProps}
               style={{
                 transformOrigin:
                   placement === 'bottom' ? 'center top' : 'center bottom',
               }}
             >
               <Paper>
                 <ClickAwayListener onClickAway={handleClose}>
                   <MenuList id="split-button-menu">
                     {options.map((option, index) => (
                       <MenuItem
                         key={option}
                         selected={index === selectedIndex}
                         onClick={(event) => handleMenuItemClick(event, index)}
                       >
                         {option}
                       </MenuItem>
                     ))}
                   </MenuList>
                 </ClickAwayListener>
               </Paper>
             </Grow>
           )}
         </Popper>

       </React.Fragment>
      </div>
      <RenderDistrictSelectors selectedState={selectedState} />
    </div>
  ) //plan is to form a grid of buttons once a state is selected. The Buttons will consist of all the unique districts within that state.
  //From there we can search for candidates and get a unique profile for the candidate's district using the census data.

}
