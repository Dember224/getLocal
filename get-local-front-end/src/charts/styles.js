import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles({
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

export const headerStyle = makeStyles({
  root: {
    width: 900,
    height:150,
    margin:"auto",
    background:'linear-gradient(45deg, #97C5EC 30%, #1E88E5 90%)',
    color:'white',
    display:'block'
  },
  pos: {
    marginBottom: 12,
  },
})
