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

app.get('/suggestion/:state', async (req, res)=>{
  const state = req.params.state
  const race_suggestion = await dataProcessors.select_random_by_close_votes(5, state);
  return res.send(race_suggestion);
})

app.get('/random_state_suggestion', async (req, res)=>{
  const race_suggestion = await dataProcessors.select_random_close_votes_by_random_state(5);
  return res.send(race_suggestion);
})

app.get('/donations/:first_name/:last_name', async(req, res)=>{
  const first_name = req.params.first_name;
  const last_name = req.params.last_name;
  const candidate_links_object = await findDonationsPage(first_name, last_name);
  return res.send(candidate_links_object);
})

// app.get('/profile', (req, res,next)=>{
//   res.send()
// })

app.use((err, req, res, next) =>{
  return res.send(err.stack)
})
app.listen(port, () =>{
  console.log(`API is live, port: ${port}`);
})
