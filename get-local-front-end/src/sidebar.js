import React, { useState, useEffect }  from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
import TableChartOutlinedIcon from '@material-ui/icons/TableChartOutlined';
import {LoadBuckets} from './buckets';
import {LoadTotals} from './stateTotals';
import {LoadAverages} from './stateAverages';
import {LoadShortfallGrid} from './shortfallgrid';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: 'rgba(0,0,0,0.0001)',
    padding: theme.spacing(3),
    "marginTop":"-90px"
  },
}));

export function SideBar() {
  const classes = useStyles();
  const [chart, setChart] = useState("State Totals");

  function chooseChart(){
    if(chart === 'Shortfall'){
      return <LoadShortfallGrid />
    } else if (chart === 'State Totals') {
      return <LoadTotals />
    } else if (chart ==='Averages') {
      return <LoadAverages />
    } else if (chart === 'Buckets') {
      return <LoadBuckets />
    }
  }

  function handleClick(newState){
    setChart(newState);
  }
  return (
    <div className={classes.root}>
      <CssBaseline />

      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="bottom"
      >
        <div className={classes.toolbar} />
        <Divider />
        <List>
          {['Shortfall', 'State Totals', 'Averages', 'Buckets'].map((text, index) => (
            <ListItem button key={text} onClick={()=>handleClick(text)}>
              <ListItemIcon>{text === 'Shortfall' ? <TableChartOutlinedIcon /> : <AssessmentOutlinedIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {chooseChart()}

      </main>
    </div>
  );
}
