const express = require('express');
const app = express()
const port = process.env.PORT || 4000;
// const dataRouter = require('./router.js');
const cors = require('cors')
const analytics = require('./Analysis/retrieveData.js');
const dataProcessors = require('./dataProcessors');
const findDonationsPage = require('./ForeignData/findDonationPage');

app.use(cors());
// app.use('/', dataRouter.dataRouter);


app.get('/', (req,res,next)=>{
  res.send()
})

app.get('/closestStateRaces/:state/:year', (req,res)=>{
  analytics.closest_races_by_state(req.params.state, req.params.year, 10).then((r)=>{
    res.send(r);
  })
})

app.get('/outspend/:state/:year', (req,res)=>{
  analytics.get_races_by_outspend(req.params.state, req.params.year, 'percentage').then((r)=>{
    res.send(r);
  })
})

app.get('/suggestion', async (req, res)=>{
  const race_suggestion = await dataProcessors.select_random_by_close_votes(5);
  res.send(race_suggestion);
})

app.get('/donations/:first_name/:last_name', async(req, res)=>{
  const first_name = req.params.first_name;
  const last_name = req.params.last_name;
  const donation_link = await findDonationsPage(first_name, last_name);
  res.send(donation_link);
})
// app.get('/profile', (req, res,next)=>{
//   res.send()
// })
app.listen(port, () =>{
  console.log(`API is live, port: ${port}`);
})
