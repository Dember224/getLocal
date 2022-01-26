import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import {useStyles} from './styles.js';

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
