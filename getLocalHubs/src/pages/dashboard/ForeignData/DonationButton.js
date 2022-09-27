import getActBluePage from '../../../controllers/findDonationsPage';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';

const DonationButton = ({first_name, last_name})=>{
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
            {
             donationLink
             ? 
            <Button 
                variant="contained"
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
                variant="contained"
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
        </>
    )
}

export default DonationButton;