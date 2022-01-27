//97C5EC

import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import {headerStyle} from './styles.js';


function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

export function RenderProfileHeader(props){
  const classes = headerStyle();
  const office = props.office ? props.office : "";
  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography variant="h4" component="h2">
          {toTitleCase(office)}
        </Typography>
        <Typography variant="h2" component="p">
          District {props.district}
        </Typography>
      </CardContent>
    </Card>
  );
}
