import getActBluePage from '../../../controllers/findDonationsPage';
import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import {Grid, Typography} from '@mui/material';
import Button from '@mui/material/Button';

const DonationButton = ({first_name, last_name, stateName, chamber, district})=>{
    const [donationLink, setDonationLink] = useState(null);
    const [candidatePage, setCandidatePage] = useState(null);
    useEffect(()=>{
        if(first_name && last_name){
            async function scopedGetLink(){
                const candidate_links_object = await getActBluePage(first_name, last_name);
                setDonationLink(candidate_links_object["donation_link"]);
                setCandidatePage(candidate_links_object["candidate_profile"])
            }
            scopedGetLink();
        }
        
    }, [first_name, last_name, donationLink, candidatePage])

    return(
        <>
            <Card>
                <CardContent>
                    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
                        <Grid item xs={12} sx={{ mb: -2.25 }}>
                            <Typography variant="h5" textAlign='center'>Consider Giving to {`${first_name} ${last_name}`}</Typography>
                        </Grid>
                        <Grid item xs={12} sx={{ mb: -2.25 }}>
                            <Typography variant="h5" textAlign='center'>{stateName} {chamber} District {district}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
                <div style={{display:'flex', justifyContent:'center'}}>
                    <CardActions >
                    {
                    donationLink
                    ? 
                    <Button 
                        variant="outlined"
                        href={donationLink}
                        style={{'cursor':'pointer'}}
                        rel="noopener noreferrer"
                        target="_blank"
                        
                    >
                        Donate
                    </Button>
                    : 
                    '' 
                    }

        {
                    candidatePage
                    ? 
                    <Button 
                        variant="outlined"
                        href={candidatePage}
                        style={{'cursor':'pointer'}}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        Visit Profile
                    </Button>
                    : 
                    '' 
                    }
                    </CardActions>
                </div>
            </Card>
        </>
    )
}

export default DonationButton;