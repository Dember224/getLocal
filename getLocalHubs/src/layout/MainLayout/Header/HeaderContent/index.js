// material-ui
import { Box, IconButton, Link, useMediaQuery } from '@mui/material';
import { GithubOutlined,TwitterOutlined } from '@ant-design/icons';

// project import
import Search from './Search';
import Profile from './Profile';
import Notification from './Notification';
import MobileSection from './MobileSection';

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
    const matchesXs = useMediaQuery((theme) => theme.breakpoints.down('md'));

    return (
        <>
            {!matchesXs && <Search />}
            {matchesXs && <Box sx={{ width: '100%', ml: 1 }} />}

            <IconButton
                component={Link}
                href="https://github.com/Dember224/getLocal"
                target="_blank"
                disableRipple
                color="secondary"
                title="Get Local github"
                sx={{ color: 'text.primary', bgcolor: 'grey.100' }}
            >
                <GithubOutlined />
            </IconButton>

            <IconButton
                component={Link}
                href="https://twitter.com/CampaignBucks"
                target="_blank"
                disableRipple
                color="secondary"
                title="Get Local Twitter"
                sx={{ color: '#1DA1F2', bgcolor: 'grey.100' }}
            >
                <TwitterOutlined />
            </IconButton>

            {/* <Notification /> */}
            {/* {!matchesXs && <Profile />} */}
            {/* {matchesXs && <MobileSection />} */}
        </>
    );
};

export default HeaderContent;
