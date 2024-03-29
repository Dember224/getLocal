const express = require('express');
const app = express()
const port = process.env.PORT || 4000;
// const dataRouter = require('./router.js');
const cors = require('cors')
const analytics = require('./Analysis/retrieveData.js');
const dataProcessors = require('./dataProcessors');
const findDonationsPage = require('./ForeignData/findDonationPage');
const moment = require('moment');

const DataAccess = require('./dataAccessLayer.js');
const e = require('express');

app.use(cors());
// app.use('/', dataRouter.dataRouter);


app.get('/', (req,res,next)=>{
  res.send('ping')
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

app.get('/suggestion/:state', async (req, res, next)=>{
  try{
    const state = req.params.state
    const race_suggestion = await dataProcessors.select_random_by_close_votes(5, state);
    return res.send(race_suggestion);
  } catch(e) {
    return next(e);
  }
  
})

app.get('/random_state_suggestion', async (req, res, next)=>{
  try{
    const race_suggestion = await dataProcessors.select_random_close_votes_by_random_state(5);
    return res.send(race_suggestion);
  } catch(e){
    return next(e);
  }
  
})

app.get('/donations/:first_name/:last_name', async(req, res, next)=>{
  try {
    const first_name = req.params.first_name;
    const last_name = req.params.last_name;
    const candidate_links_object = await findDonationsPage(first_name, last_name);
    return res.send(candidate_links_object);
  } catch(e){
    return next(e);
  }
  
})

app.get('/stateCsvDownload/:state/:year',  async(req, res, next)=>{
  try{
    const data = new DataAccess(); //instantiating this a lot in this module. Not sure if better to call only once?
    const year = req.params.year;
    const state = req.params.state;
    const data_available = await data.checkForStateData(state, year);

    if(data_available){
      const csv = await data.fullStateDataCsv(state, year);
      return res.attachment(`stateData${moment().format('YYYY-MM-DD HH:m:s')}.csv`).send(csv);
    } else {
      res.status(400);
      return res.send("The given state or year are not available. Please check the /getAvailableStates endpoint for a list of available states and years.");
    }
    

  } catch(e){
    return next(e);
  }
  
})

app.get('/stateJsonDownload/:state/:year', async(req, res, next)=>{
  try{
    const data = new DataAccess();
    const year = req.params.year;
    const state = req.params.state;

    const data_available = await data.checkForStateData(state, year);

    if(data_available){
      const json = await data.fullStateData(state, year);
      return res.json(json);
    } else {
      res.status(400);
      return res.send("The given state or year are not available. Please check the /getAvailableStates endpoint for a list of available states and years.")
    }
    
  } catch (e){
    return next(e);
  }

})

app.get('/getAvailableStates', async(req, res, next)=>{
  try{
    const data = new DataAccess();
    const states = await data.checkAvailableStates();
    return res.json(states)

  } catch(e){
    next(e);
  }
})

app.get('/listCandidateWebsites', async(req, res, next)=>{
  try{
    const data = new DataAccess();
    const website_array = await data.getAllCandidateWebPages();
    return res.json(website_array);
  } catch(e){
    next(e);
  }
})

app.get('/getCandidateWebpageCSV', async(req, res, next)=>{
  try{
    const data = new DataAccess();
    const website_csv = await data.getAllCandidateWebPagesCSV();
    return res.attachment(`allWebsites${moment().format('YYYY-MM-DD HH:m:s')}.csv`).send(website_csv);
  } catch(e){
    next(e);
  }
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
