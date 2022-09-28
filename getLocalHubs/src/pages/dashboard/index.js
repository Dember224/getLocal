import { useState, useEffect } from 'react';

// material-ui
import {
    Avatar,
    AvatarGroup,
    Box,
    Button,
    Grid,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    Stack,
    TextField,
    Typography
} from '@mui/material';

// project import
import OrdersTable from './OrdersTable';
import IncomeAreaChart from './IncomeAreaChart';
import MonthlyBarChart from './MonthlyBarChart';
import ReportAreaChart from './ReportAreaChart';
import SalesColumnChart from './SalesColumnChart';
import MainCard from 'components/MainCard';
import DemVoteShare from './demVoteShare';
import RepVoteShare from './repVoteShare';
import getSuggestions from 'controllers/analyticsHandlers';
import TotalVotes from './totalVotes'
import DonationButton from './ForeignData/DonationButton';

// avatar style
const avatarSX = {
    width: 36,
    height: 36,
    fontSize: '1rem'
};

// action style
const actionSX = {
    mt: 0.75,
    ml: 1,
    top: 'auto',
    right: 'auto',
    alignSelf: 'flex-start',
    transform: 'none'
};

// sales report status
const status = [
    {
        value: 'today',
        label: 'Today'
    },
    {
        value: 'month',
        label: 'This Month'
    },
    {
        value: 'year',
        label: 'This Year'
    }
];

// ==============================|| DASHBOARD - DEFAULT ||============================== //

const DashboardDefault = () => {
    const [value, setValue] = useState('today');
    const [slot, setSlot] = useState('week');
    const [repVotes, setRepVotes] = useState(0);
    const [votePercentage, setVotePercentage] = useState(0);
    const [demVotes, setDemVotes] = useState(0);
    const [demVotePercentage, setDemVotePercentage] = useState(0);
    const [repVotePercentage, setRepVotePercentage] = useState(0);
    const [lastTurnout, setLastTurnout] = useState(0);
    const [stateName, setStateName] = useState('');
    const [chamber, setChamber] = useState('');
    const [district, setDistrict] = useState('');
    const [previousYears, setPreviousYears] = useState([]);
    const [turnouts, setTurnouts] = useState([]);
    const [contributions, setContributions] = useState([0,0]);
    const [expenditures, setExpenditures] = useState([0,0]);
    const [demFirstName, setDemFirstName] = useState('');
    const [demLastName, setDemLastName] = useState('');

    function convertCase(str) {
      const lower = String(str).toLowerCase();
      return lower.replace(/(^| )(\w)/g, function(x) {
        return x.toUpperCase();
      });
    }

    useEffect(()=>{
      getSuggestions().then((res)=>{
        const lastRepVotes = res.lastRepVotes;
        const lastDemVotes = res.lastDemVotes;
        const lastTurnout = res.turnouts.split(",")[0];
        setLastTurnout(lastTurnout);
        setRepVotes(lastRepVotes);
        setDemVotes(lastDemVotes);
        const dem_vote_percentage = (parseFloat(res.lastDemVotes) / parseFloat(lastTurnout))*100;
        setDemVotePercentage(dem_vote_percentage);
        const rep_vote_percentage = (parseFloat(res.lastRepVotes) / parseFloat(lastTurnout))*100;
        setRepVotePercentage(rep_vote_percentage);
        setStateName(convertCase(res.state));
        setChamber(res.chamber);
        setDistrict(res.district);
        const prev_years = res.previous.split(',').length > 1 ? res.previous.split(',') : [res.previous.split(',')[0], res.previous.split(',')[0]]

        setPreviousYears(prev_years.reverse());
        const last_votes = res.turnouts.split(',').length > 1 ? res.turnouts.split(',').reverse() : [res.turnouts, res.turnouts]
        setTurnouts(last_votes);
        setContributions([parseFloat(res.demCon), parseFloat(res.repCon)]);
        setExpenditures([parseFloat(res.demExp), parseFloat(res.repExp)]);
        setDemFirstName(res.demFirstName);
        setDemLastName(res.demLastName);
      })
    },[])


    return (
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
            {/* row 1 */}
            <Grid item xs={12} sx={{ mb: -2.25 }}>
                <DonationButton first_name={demFirstName} last_name={demLastName} stateName={stateName} chamber={chamber} district={district}/>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
                <DemVoteShare lastDemVotes={demVotes} vote_percentage={demVotePercentage} />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
                <RepVoteShare lastRepVotes={repVotes} votePercentage={repVotePercentage}/>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
                <TotalVotes voteTotal={lastTurnout}/>
            </Grid>

            <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} />
            {/* row 2 */}
            <Grid item xs={12} md={12} lg={12}>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                        <Typography variant="h5">Previous Election Turnouts</Typography>
                    </Grid>
                </Grid>
                <MainCard content={false} sx={{ mt: 1.5 }}>
                    <Box sx={{ pt: 1, pr: 2 }}>
                        <IncomeAreaChart slot={slot} previousYears = {previousYears} turnouts = {turnouts} />
                    </Box>
                </MainCard>
            </Grid>


            {/* row 3 */}
            {/* row 4 */}
            <Grid item xs={12} md={12} lg={12}>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                        <Typography variant="h5">Finance Comparison</Typography>
                    </Grid>
                    <Grid item>
                        {/* <TextField
                            id="standard-select-currency"
                            size="small"
                            select
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            sx={{ '& .MuiInputBase-input': { py: 0.5, fontSize: '0.875rem' } }}
                        >
                            {status.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField> */}
                    </Grid>
                </Grid>
                <MainCard sx={{ mt: 1.75 }}>
                    <Stack spacing={1.5} sx={{ mb: -12 }}>
                        <Typography variant="h6" color="secondary">
                            Campaign Finances
                        </Typography>
                    </Stack>
                    <SalesColumnChart contributions={contributions} expenditures={expenditures} />
                </MainCard>
            </Grid>
            <Grid item xs={12} md={5} lg={4}>

                <MainCard sx={{ mt: 2 }}>
                    <Stack spacing={3}>
                        <Grid container justifyContent="space-between" alignItems="center">
                            <Grid item>
                                <Stack>
                                    <Typography variant="h5" noWrap>
                                        Contact Us
                                    </Typography>
                                    <Typography variant="caption" color="secondary" noWrap>
                                        Typical reply within 3-5 business days
                                    </Typography>
                                </Stack>
                            </Grid>

                        </Grid>
                        <Button size="small" variant="contained" sx={{ textTransform: 'capitalize' }} onClick={() => window.location = 'mailto:campaignbucks@gmail.com'}>
                            Need Help?
                        </Button>
                    </Stack>
                </MainCard>
            </Grid>
        </Grid>
    );
};

export default DashboardDefault;
