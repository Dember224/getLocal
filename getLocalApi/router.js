const express = require('express');
const dataRouter = express.Router();
const  queries = require('../Loaders/showData.js');

dataRouter.get('/', (req, res, next)=>{
  queries.standardQuery(queries.sql.shortFall,(e, over_drawn_candidates)=>{
    if(e) res.status(404).send({name:'this didnt work'});
    if(over_drawn_candidates.length){
      res.send(over_drawn_candidates)
    } else {
      res.status(404).send({name:'No candidates fit this query'});
    }
  })
})

module.exports = dataRouter;
