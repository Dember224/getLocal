// material-ui
import { Typography } from '@mui/material';

// project import
import MainCard from 'components/MainCard';

// ==============================|| SAMPLE PAGE ||============================== //

const SamplePage = () => (
    <MainCard title="Our Mission">
        <Typography variant="body2">
            Get Local is a platform to identify races where Democratic dollars will go the farthest. We use data to find state level, upper and lower chamber, districts where your cash can exact the most leverage towards winning a Democrat the seat. 
            Our determinations are guided by data but ultimately which races to support depends on your subjective assessment. Feel free to use us as a guide. If you're looking for places to give, we're here to help.

        </Typography>
    </MainCard>
);

export default SamplePage;
