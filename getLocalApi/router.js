const express = require('express');
const dataRouter = express.Router();
const  queries = require('../Loaders/showData.js');

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

module.exports = {
  dataRouter
};
