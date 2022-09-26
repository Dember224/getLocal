import getActBluePage from '../../../controllers/findDonationsPage';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';

const DonationButton = ({first_name, last_name})=>{
    const [donationLink, setDonationLink] = useState(null);
    useEffect(()=>{
        if(first_name && last_name){
            async function scopedGetLink(){
                const donation_link = await getActBluePage(first_name, last_name);
                setDonationLink(donation_link);
            }
            scopedGetLink();
        }
        
    }, [first_name, last_name, donationLink])

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
        </>
    )
}

export default DonationButton;