// material-ui
import { Button, CardMedia, Link, Stack, Typography } from '@mui/material';

// project import
import MainCard from 'components/MainCard';

// assets
import logo from 'components/Logo/assets/\\/images/logo.jpg';
import AnimateButton from 'components/@extended/AnimateButton';

// ==============================|| DRAWER CONTENT - NAVIGATION CARD ||============================== //

const NavCard = () => (
    <MainCard sx={{ bgcolor: 'grey.50', m: 3 }}>
        <Stack alignItems="center" spacing={2.5}>
            <CardMedia component="img" image={logo} sx={{ width: 112 }} />
            <Stack alignItems="center">
                <Typography variant="h5">Get Local</Typography>
                <Typography variant="h6" color="secondary">
                    Help State Level Democrats
                </Typography>
            </Stack>
            <AnimateButton>
                <Button component={Link} target="_blank" href="http://www.getlocalwins.com/" variant="contained" color="success" size="small">
                    Go
                </Button>
            </AnimateButton>
        </Stack>
    </MainCard>
);

export default NavCard;
