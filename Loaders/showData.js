const dbConfig = require('./dbConfig.js');
const { Pool, Client } = require('pg');

const pool = new Pool(dbConfig.config);

const standardQuery = function(query, callback){
  pool.connect()
  .then(client =>{
    return client
    .query(query)
    .then(results =>{
      client.release();
      return callback(null, results.rows)
    })
  })
  .catch(e=>{
    console.log(e);
    pool.end();
  })
}

const sql = {
  shortFall: 'Select name, state, office, contributions, expenditures, expenditures - contributions as shortfall from campaign_finance where expenditures > contributions and expenditures is not null and contributions is not null order by shortfall desc',
  stateTotals: `select state, sum(contributions) as contributions, sum(expenditures) as expenditures from campaign_finance where contributions is not null and expenditures is not null and expenditures != 'NaN' and contributions != 'NaN' group by state`
}


module.exports = {
  standardQuery,
  sql
}
