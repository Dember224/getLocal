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
});

export const incomeStyle = makeStyles({
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


export const candidateStyle = makeStyles({
  root: {
    width: 900,
    height:250,
    margin:"auto",
    marginTop:'1%',
    background:'#FAFAFA',
    color:'#2B8EE6',
    display:'block'
  },
  pos: {
    marginBottom: 12,
  },
})

export const spendStyle = makeStyles({
  root: {
    width: 320,
    height:320,
    margin:"3%",
    align:'center',
    background:'linear-gradient(120deg, #F7836E 30%, #F9F9F9 90%)',
    color:'white',
    display:'inline-block'
  },
  pos: {
    marginBottom: 12,
  },
})

export const contributeStyle = makeStyles({
  root: {
    width: 320,
    height:320,
    margin:"3%",
    text_align:'center',
    background:'linear-gradient(120deg, #219D6E 30%, #F9F9F9 90%)',
    color:'white',
    display:'inline-block'
  },
  pos: {
    marginBottom: 12,
  },
})
