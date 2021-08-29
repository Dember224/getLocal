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

export function ElectionTypeCard() {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography variant="h5" component="h2">
          Election Types
        </Typography>
        <Typography variant="body2" component="p">
        Ultimately the goal is to win general elections, but upstream of that is who can compete in the primaries. For states who report totals by race, different candidates end their campaigns at different points throughout the race. In these states, if a candidate reports having terminated before the general, or is defeated in a primary, we acquire the totals for the latest reported date.
        For candidates who made it to the general election, we use the report detailing the data that is most proximate to the election date. Some states, for example, might have a pre-election summary report.
          <br />
          <br />
          <br />
          Moving forward, Get Local will have a strong preference towards acquiring primary election totals, as campaigns that don't make it to the general are typically the most underfunded, and represent the candidates with the highest need. If our resources expand we will revisit data collection for special elections, run-offs, general elections, etc.
        </Typography>
      </CardContent>
    </Card>
  );
}
