import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { experimentalStyled as styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import {RenderProfile} from '../charts/profileData';


const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export function RenderDistrictSelectors(props){
  const [districtArray, setDistrictArray] = useState([])
  const [selectedDistrict, setSelectedDistrict] = useState({})
  const [display, setDisplay] = useState('block');

  useEffect(()=>{
    if(props.selectedState){
      axios.get(`http://localhost:4000/selectedState/${props.selectedState}`)
        .then((res)=>{
          setDistrictArray(res.data)
        })
    }

  }, [selectedDistrict])

  useEffect(()=>{
    setDisplay('block')
    setSelectedDistrict([])
  }, [props.selectedState])


  let ordered_district_array = districtArray.sort((el_1, el_2)=>{
    if(el_1.office < el_2.office){
      return -1;
    } else {
      return 1;
    }
  },[display])
let by_district_object = {};
ordered_district_array.map((district_object)=>{
  if(by_district_object[district_object.office]){
    by_district_object[district_object.office].push(district_object)
  } else {
    by_district_object[district_object.office] = [district_object]
  }
})

const district_entries = Object.entries(by_district_object)

const processed_entries = district_entries.map((entry)=>{

  const processor = entry[1].map((x)=>{
    const processed_object = {
      office: x.office,
      district: x.district ? parseInt(x.district.replace(/\D/g,'')) : null
    };
    if(processed_object.district){
      return processed_object;
    }

  })
  const orderer = processor.sort((first_el, second_el)=>{return first_el.district - second_el.district});
  return [entry[0], orderer]


}).filter((x)=>{
  return x[1][0] != null;
})

const toggleDisplay = () =>{
  if(display ==='block'){
    setDisplay('none')
  } else {
    setDisplay('block')
  }
}

const handleClick = (e, candidate_data) =>{
  setSelectedDistrict(candidate_data)
  toggleDisplay()
}



  return (
    <React.Fragment>
    <div style={{display:display}}>
      {processed_entries.map((entry)=>{
        return(
          <div>
          <h1>{entry[0].toUpperCase()}</h1>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
              {entry[1].map((x, index) => (
                <Grid item xs={2} sm={4} md={4} key={index}>
                  <Item onClick={(e)=>{handleClick(e, {office:x.office,district:x.district, state:props.selectedState})}} style={{cursor:'pointer'}}>District {x ? x.district : null}</Item>
                </Grid>
              ))}
            </Grid>
          </Box>
          </div>
        )
      })}
    </div>

    <RenderProfile choosenState={selectedDistrict.state} office={selectedDistrict.office} district={selectedDistrict.district}/>
    </React.Fragment >
  )

}
