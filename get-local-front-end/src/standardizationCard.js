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

export function StandardizationCard() {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography variant="h5" component="h2">
          Standardization
        </Typography>
        <Typography variant="body2" component="p">
        Comparing the needs of candidates accross states poses challenges that require sacrifices.
        We have 50 states running their own elections in disparate ways.
        Some states set their contribution  limits relatively low, while others have no contribution limits at all.
        Even the dissemination of the data is different between states. One may produce reports with contribution totals due by a specific reporting deadline while other interfaces render totals between 2 dates chosen by the user.
        How are we to compare finance of 2 campaings in states with different election laws so that you can determine which most needs your support? Unfortunately there is no perfect solution and trade-offs are necessary.
        The following are the decisions we've made on how to collect contribution and expenditure totals.

        </Typography>
      </CardContent>
    </Card>
  );
}
