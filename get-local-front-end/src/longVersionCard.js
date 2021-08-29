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

export function LongVersionCard() {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography variant="h5" component="h2">
          The Long Version
        </Typography>
        <Typography variant="body2" component="p">
        Running for office in the United States can be prohibitvely expensive. Many state level campaigns spend tens, hundreds of thousands, or millions of dollars.
        Imagine being a teacher, janitor, or nurse with aspirations to represent your community, only to be dissuaded by the price tag.
        Our system, as presently constituted, paves paths to power for independently wealthy, or well connected individuals, while discouraging all others with the potential for immizeration and insolvency.
        Get Local is an effort to, in some small way, assuage poor to middle class financial anxieties about running for office.
        </Typography>
      </CardContent>
    </Card>
  );
}
