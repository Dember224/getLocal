const dbConfig = require('./dbConfig.js');
const { Pool, Client } = require('pg');

const pool = new Pool(dbConfig.config);

const queryOverDrawn = function(){
  const query = 'Select name, state, office, contributions, expenditures, expenditures - contributions as shortfall from campaign_finance where expenditures > contributions and expenditures is not null and contributions is not null order by shortfall desc';
  pool.connect()
  .then(client =>{
    return client
    .query(query)
    .then(results =>{
      client.release()
      console.log(results.rows)
    })
  })
  .catch(e=>{
    console.log(e);
    client.release();
  })
}

queryOverDrawn()
