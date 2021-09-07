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

export function ContactInfo(){
  const classes = useStyles()
  return(
    <Card className={classes.root}>
      <CardContent>
        <Typography variant="h5" component="h2">
          Email us:
        </Typography>
        <Typography variant="body2" component="p">
        <a href = "mailto: campaignbucs@gmail.com">campaginbucs@gmail.com</a>
        </Typography>
      </CardContent>
    </Card>
  )
}
