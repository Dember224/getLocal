import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    width: 230,
    height:200,
    margin:"10px",
    background:'linear-gradient(45deg, #3F51B5 30%, #1E88E5 90%)',
    color:'white',
    display:'inline-block'
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

export function RenderFemCard(props){
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography variant="h5" component="h2">
          Female Population
        </Typography>
        <Typography variant="h2" component="p">
          {props.female_population}
        </Typography>
      </CardContent>
    </Card>
  );
}
