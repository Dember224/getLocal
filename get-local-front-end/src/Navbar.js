import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tab from '@material-ui/core/Tab';
import { TabContext } from '@material-ui/lab';
import TabList from '@material-ui/lab/TabList';
import TabPanel from '@material-ui/lab/TabPanel';
import {Explainer} from './explainer'
import {StandardizationExplanation} from './data-standards'
import {ContactInfo} from './contact'


import {SideBar} from './sidebar'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export function Navbar() {
  const classes = useStyles();
  const [value, setValue] = React.useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <TabContext value={value}>
        <AppBar position="static">
          <TabList onChange={handleChange} aria-label="simple tabs example">
            <Tab label="Data" value="1" />
            <Tab label="About Us" value="2" />
            <Tab label="Data Standards" value="3" />
            <Tab label="Contact us" value = "4" />
          </TabList>
        </AppBar>
        <TabPanel value="1"><SideBar/></TabPanel>
        <TabPanel value="2"><Explainer/></TabPanel>
        <TabPanel value="3"><StandardizationExplanation/></TabPanel>
        <TabPanel value="4"><ContactInfo/></TabPanel>
      </TabContext>
    </div>
  );
}
