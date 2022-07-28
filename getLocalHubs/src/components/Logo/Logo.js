// material-ui
import { useTheme } from '@mui/material/styles';
import { ReactComponent as GetLocalLogo } from './assets/images/logo.svg'




const Logo = () => {
    const theme = useTheme();

    return ( <> <GetLocalLogo /> </> );
};

export default Logo;
