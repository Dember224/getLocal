const dbConfig = require('./dbConfig.js');
const { Pool, Client } = require('pg');

const pool = new Pool(dbConfig.config);

const queryOverDrawn = function(callback){
  const query = 'Select name, state, office, contributions, expenditures, expenditures - contributions as shortfall from campaign_finance where expenditures > contributions and expenditures is not null and contributions is not null order by shortfall desc';
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
    client.release();
    console.log(e);
  })
}


module.exports = {
  queryOverDrawn
}
