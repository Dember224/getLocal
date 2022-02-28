import React, { useState }  from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import TableChartOutlinedIcon from '@material-ui/icons/TableChartOutlined';
import {LoadBuckets} from './charts/buckets';
import {LoadTotals} from './charts/stateTotals';
import {LoadAverages} from './charts/stateAverages';
import {LoadShortfallGrid} from './charts/shortfallgrid';
import {LoadRawData} from './charts/rawData';
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
import DescriptionIcon from '@material-ui/icons/Description';
import {Explainer} from './info/explainer';
import {StandardizationExplanation} from './info/data-standards';
import {ContactInfo} from './info/contact';
import {RenderStateButtons} from './interactiveSelectors/stateSelectors';


const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  logo:{
    height:'5%',
    width:'5%'
  },
}));

export function SideBar() {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const [chart, setChart] = useState("View Profiles");

  function chooseChart(){
    if(chart === 'Shortfall'){
      return <LoadShortfallGrid />
    } else if (chart === 'State Totals') {
      return <LoadTotals />
    } else if (chart ==='Averages') {
      return <LoadAverages />
    } else if (chart === 'Buckets') {
      return <LoadBuckets />
    } else if(chart === 'Raw Data'){
      return <LoadRawData />
    } else if(chart === 'About Us'){
      return <Explainer />
    } else if (chart === 'Standardization Explanation'){
      return <StandardizationExplanation />
    } else if (chart === 'Contact Us'){
      return <ContactInfo />
    } else if(chart === 'View Profiles'){
      return <RenderStateButtons />
    }
  }


  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  function handleClick(newState){
    setChart(newState);
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Get Local
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
        <List>
          {[ 'View Profiles','Shortfall', 'State Totals', 'Averages', 'Buckets', 'Raw Data'].map((text, index) => (
            <ListItem button key={text} onClick={()=>handleClick(text)}>
                <ListItemIcon>{text === 'Shortfall' ||text === 'Raw Data' ? <TableChartOutlinedIcon /> : <AssessmentOutlinedIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {['About Us', 'Standardization Explanation', 'Contact Us'].map((text, index) => (
            <ListItem button key={text} onClick={()=>handleClick(text)}>
              <ListItemIcon>{<DescriptionIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
        {chooseChart()}
      </main>
    </div>
  );
}
