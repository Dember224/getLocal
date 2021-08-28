import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    width: "60%",
    margin:"auto"
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

export function ShortfallExplained(){

  const classes = useStyles();
const bull = <span className={classes.bullet}>•</span>;

return (
  <Card className={classes.root}>
    <CardContent>
      <Typography className={classes.title} color="textSecondary" gutterBottom>
        Definition
      </Typography>
      <Typography variant="h5" component="h2">
        Shortfall
      </Typography>
      <Typography variant="body2" component="p">
      Shortfall is our way of saying that a candidate out-spent their contributions.
      This isn't necessarily the same thing as campaign debt as there are several ways to generate a shortfall. A person could, for example be independenly wealthy and financing their campaings out of pocket rather than through donors.
      Taken with other information shortfall can be helpful in determining who is struggling to cover their expenses.
      </Typography>
    </CardContent>

  </Card>
);

}
