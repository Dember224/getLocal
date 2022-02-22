const express = require('express');
const dataRouter = express.Router();
const  queries = require('./showData.js');
const census = require('./censusTools/censusSearch');
const tools = require('../Tools/parsers');

dataRouter.get('/', (req,res, next)=>{
  res.send("Base route for setup. None of the front end makes calls to this route.")
})

dataRouter.get('/shortfall', (req, res, next)=>{
  queries.standardQuery(queries.sql.shortFall,(e, over_drawn_candidates)=>{
    if(e) res.status(404).send({name:'this didnt work'});
    if(over_drawn_candidates.length){
      res.send(over_drawn_candidates)
    } else {
      res.status(404).send({name:'No candidates fit this query'});
    }
  })
})

dataRouter.get('/totals', (req, res, next)=>{
  queries.standardQuery(queries.sql.stateTotals, (e, state_finance_totals)=>{
    if(e) res.status(404).send({state:'this didnt work'});
    if(state_finance_totals.length){
      res.send(state_finance_totals)
    } else {
      res.status(404).send({state:'State data isnt returning. Check showData, or the pg database.'})
    }
  })
})

dataRouter.get('/averages', (req, res, next)=>{
  queries.standardQuery(queries.sql.averages, (e, state_finance_averages)=>{
    if(e) res.status(404).send({state:'this didnt work'});
    if(state_finance_averages.length){
      res.send(state_finance_averages)
    } else {
      res.status(404).send({state: 'State data isnt returning. Check showData, or the pg database.'})
    }
  })
})

dataRouter.get('/buckets', (req,res,next)=>{
  queries.standardQuery(queries.sql.buckets, (e, buckets)=>{
    if(e) res.status(404).send({state:'that didnt work'});
    if(buckets.length){
      res.send(buckets)
    } else {
      res.status(404).send({state:'State data isnt returning. Check showData, or the pg database.'})
    }
  })
})

dataRouter.get('/raw', (req,res,next)=>{
  queries.standardQuery(queries.sql.raw, (e, raw_data)=>{
    if(e) res.status(404).send({state:'that didnt work'});
    if(raw_data.length){
      res.send(raw_data)
    } else {
      res.status(404).send({state:'State data isnt returning. Check showData, or the pg database.'})
    }
  })
})

dataRouter.get('/stateList', (req,res,next)=>{
  queries.standardQuery(queries.sql.stateList, (e, state_list)=>{
    if(e) res.status(404).send({message:'Unable to acquire current list of states from our database', error:e});
    if(state_list.length){
      res.send(state_list)
    } else {
      res.status(404).send({message:'The state list is returning empty. This could be an issue with the database.'})
    }
  })
})

dataRouter.get('/selectedState/:stateName', (req,res,next)=>{
  queries.getDistrictSQL(req.params.stateName, (e, district_list)=>{
    if(e) res.status(404).send({message:'Unable to acquire list of districts for the selected state.', error:e});
    if(district_list.length){
      res.send(district_list)
    } else {
      res.status(404).send({message:'The district list seems to be returning empty for the selected state', error:e})
    }
  })

})

dataRouter.get('/profile/:stateName/:district/:office', (req, res, next)=>{
  const stateName = req.params.stateName;
  const district = req.params.district;
  const office = req.params.office;
  const current_year = new Date().getFullYear() - 1
  const chamber = tools.chamberParser(office);
  census.searchCensusStatsByDistrict({state: stateName, year:current_year,chamber, district_number:district }, async (e, census_object)=>{
    if(e) res.status(404).send({message:'Check census tools module. Not returning census object', error:e});
    await res.send(census_object);
  })
})

dataRouter.get('/district_candidates/:state/:district', (req, res)=>{
  const state = req.params.state;
  const district = req.params.district;

  queries.selectCandidatesByDistrict({state, district}, (e,district_object)=>{
    if(e) res.status(404).send({message:'The query is not returning. The showData module likely has answers', error:e});
    res.send(district_object)
  })
})

module.exports = {
  dataRouter
};
