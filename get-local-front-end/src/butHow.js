import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    marginTop:"10px"
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

export function ButHowCard() {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography variant="h5" component="h2">
          But How?
        </Typography>
        <Typography variant="body2" component="p">
          Our approach is to collect campaign finance data from all 50 states, using our custom software, in a way that enables comparative analysis. We are aware of aggregating efforts for the sake of transparency, but none that are designed with the idea of helping people find and support the most in-need liberal campaigns. We standardize data as best we can so that you, the end user, can decide between helping a waiter in San Diego and an engineer in Arizona.
        </Typography>
      </CardContent>
    </Card>
  );
}
