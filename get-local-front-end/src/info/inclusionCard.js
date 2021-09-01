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

export function InclusionCard() {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography variant="h5" component="h2">
          Inclusion
        </Typography>
        <Typography variant="body2" component="p">
        Which types of money should be included in the totals furnished to the end user?
        If I'm looking at contributions, should this total be inclusive of in-kind contributions?
        Given that a state's UI might report a "total" under a contribution header and not make it clear what this total entails, and another state might explicitly report out in-kind contributions separately, this can get a bit tricky.
        If the totals don't reflect the same thing your comparisons won't be apples to apple.
        <br />
        <br />
        In general we include in-kind contributions in our totals.
        We want our numbers to reflect all types of largesse.
        We are therefore trusting the state's or individual's assessment of the value of an in-kind contribution.
        Not ideal, but too onerous to evaluate for ourselves.
        <br />
        <br />
        Our numbers do not reflect loan totals. Again, we are trying to reflect largesse. A candidate incurring debt is not in keeping with this goal.
        If our project can assuage financial fears that underfinanced parties have about running for office we'd prefer to point potential contributors in their direction.
        </Typography>
      </CardContent>
    </Card>
  );
}
