import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Grid, Stack, Typography } from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import ComponentSkeleton from './ComponentSkeleton';

// ===============================|| SHADOW BOX ||=============================== //

function ShadowBox({ shadow }) {
    return (
        <MainCard border={false} sx={{ boxShadow: shadow }}>
            <Stack spacing={1} justifyContent="center" alignItems="center">
                <Typography variant="h6">boxShadow</Typography>
                <Typography variant="subtitle1">{shadow}</Typography>
            </Stack>
        </MainCard>
    );
}

ShadowBox.propTypes = {
    shadow: PropTypes.string.isRequired
};

// ===============================|| CUSTOM - SHADOW BOX ||=============================== //

function CustomShadowBox({ shadow, label, color, bgcolor }) {
    return (
        <MainCard border={false} sx={{ bgcolor: bgcolor || 'inherit', boxShadow: shadow }}>
            <Stack spacing={1} justifyContent="center" alignItems="center">
                <Typography variant="subtitle1" color={color}>
                    {label}
                </Typography>
            </Stack>
        </MainCard>
    );
}

CustomShadowBox.propTypes = {
    shadow: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    bgcolor: PropTypes.string.isRequired
};

// ============================|| COMPONENT - SHADOW ||============================ //

const ComponentShadow = () => {
    const theme = useTheme();

    return (
        <ComponentSkeleton>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <MainCard title="State Races" codeHighlight>
                    <p>Hello</p>
                    </MainCard>
                </Grid>
                <Grid item xs={12}>
                    <MainCard title="Custom Shadow" codeHighlight>
                        <Grid container spacing={3}>
                            <Grid item xs={6} sm={4} md={3} lg={2}>
                                <CustomShadowBox shadow={theme.customShadows.z1} label="z1" color="inherit" />
                            </Grid>
                        </Grid>
                    </MainCard>
                </Grid>
            </Grid>
        </ComponentSkeleton>
    );
};

export default ComponentShadow;
