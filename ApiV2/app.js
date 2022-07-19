const express = require('express');
const app = express()
const port = process.env.PORT || 4000;
// const dataRouter = require('./router.js');
const cors = require('cors')
const analytics = require('../Analysis/retrieveData.js');

app.use(cors());
// app.use('/', dataRouter.dataRouter);


app.get('/', (req,res,next)=>{
  res.send()
})

app.get('/closestStateRaces/:state/:year', (req,res)=>{
  analytics.closest_races_by_state(req.params.state, req.params.year, 10).then((r)=>{
    res.send(r)
  })
})
// app.get('/profile', (req, res,next)=>{
//   res.send()
// })
app.listen(port, () =>{
  console.log(`API is live, port: ${port}`);
})
