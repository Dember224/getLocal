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

export function ElectionDatesCard() {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography variant="h5" component="h2">
          Election Dates
        </Typography>
        <Typography variant="body2" component="p">
        When reporting systems generate totals based on a date range inputed by their users we must decide which dates we'd like to use. Campaigns can declare on different dates, depending on state laws. So which start date to use for a standardized download becomes a sticky wicket.
        We could acquire the declaration date of each campaign but that could be anywhere from simple to onerous, varying by state.
        <br/>
        <br />
        The end date poses similar issues.
        One might think it obvious to use election day as a hard stop, but what of campaigns that are terminated prior to that?
        What of the financial activity that a campaign continues to undergo subsequent to its termination, victory, or defeat?
        This information is pertinent because it speaks to whether or not a middle class or poor candidate is taking on large amounts of campaign debt and/or successfully repaying it.
        <br />
        <br />
        There is no perfect solution here, so for now, Get Local acquires data from the first day of an election year, to the last.
        The hope is that the 11 months leading up to a General election will be inclusive of most primary and general election activity, while also reflecting post-campaign activity.

        </Typography>
      </CardContent>
    </Card>
  );
}
