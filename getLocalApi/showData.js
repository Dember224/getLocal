const dbConfig = require('./dbConfig.js');
const { Pool, Client } = require('pg');

const pool = new Pool(dbConfig.config);
 //Might consider making this entire module a giant Class.
const standardQuery = function(query, callback){
  console.log(query)
  pool.connect()
  .then(client =>{
    return client
    .query(query)
    .then(results =>{
      client.release();
      return callback(null, results.rows)
    })
    .catch(e=>{
      client.release();
      console.log(e);
    })
  })
}

const sql = {
  shortFall: 'Select name, state, office, contributions, expenditures, expenditures - contributions as shortfall from campaign_finance where expenditures > contributions and expenditures is not null and contributions is not null order by shortfall desc',
  stateTotals: `select state, sum(contributions) as contributions, sum(expenditures) as expenditures from campaign_finance where contributions is not null and expenditures is not null and expenditures != 'NaN' and contributions != 'NaN' group by state`,
  averages: `select state, Round(avg(contributions), 2) as contributions, Round(avg(expenditures), 2) as expenditures from campaign_finance where contributions is not null and expenditures is not null and expenditures != 'NaN' and contributions != 'NaN' group by state`,
  buckets: `select sum(case when expenditures = 0 then 1 else 0 end) as "0 expenditures", sum(case when expenditures >0 and expenditures < 1000 then 1 else 0 end ) as "0 to 1,000$ spent", sum(case when expenditures >1000 and expenditures < 10000 then 1 else 0 end ) as "1,000 to 10,000$ spent",
  sum(case when expenditures >10000 and expenditures < 50000 then 1 else 0 end ) as "10000 to 50,000$ spent", sum(case when expenditures >50000 and expenditures < 100000 then 1 else 0 end ) as "50,000 to 100,000$ spent", sum(case when expenditures >100000 and expenditures < 500000 then 1 else 0 end ) as "100,000 to 500,000$ spent",
  sum(case when expenditures >500000 and expenditures < 1000000 then 1 else 0 end ) as "500,000 to 1,000,000$ spent",sum(case when expenditures >1000000 then 1 else 0 end ) as "1,000,000$ plus spent", sum(case when contributions = 0 then 1 else 0 end) as "0$ contributions",
  sum(case when contributions >0 and contributions < 1000 then 1 else 0 end ) as "0 to 1,000$ contributed", sum(case when contributions >1000 and contributions < 10000 then 1 else 0 end ) as "1,000 to 10,000$ contributed",
  sum(case when contributions >10000 and contributions < 50000 then 1 else 0 end ) as "10000 to 50,000$ contributed", sum(case when contributions >50000 and contributions < 100000 then 1 else 0 end ) as "50,000 to 100,000$ contributed", sum(case when contributions >100000 and contributions < 500000 then 1 else 0 end ) as "100,000 to 500,000$ contributed",
  sum(case when contributions >500000 and contributions < 1000000 then 1 else 0 end ) as "500,000 to 1,000,000$ contributed",sum(case when contributions >1000000 then 1 else 0 end ) as "1,000,000$ plus contributed" from campaign_finance where contributions is not null and expenditures is not null and contributions != 'NaN' and expenditures != 'NaN'`,
  raw:`select * from campaign_finance limit 500`,
  stateList:'select distinct state from campaign_finance order by state'
}

const getDistrictSQL = function(state, callback){
    const text = `Select Distinct District, office from campaign_finance where state = $1 order by district`;
    const values = [state];

  pool
    .connect()
    .then(client => {
      return client
        .query(text, values)
        .then(res => {
          client.release()
          return callback(null, res.rows)
        })
        .catch(e => {
          client.release()
          console.log(e)
        })
    })
}

const getDistrictFips = function(callData, callback){
  const text = 'Select latitude, longitude, district from fips_by_state_chamber_district where state_name = $1 and chamber = $2 and year = $3 and district = $4';
  const values = [callData.state, callData.chamber, callData.year, callData.district_number]
  pool.connect()
  .then(client=>{
    return client
    .query(text, values)
    .then(res => {
      client.release()
      return callback(null, res.rows[0])
    })
    .catch(e=>{
      client.release()
      console.log(e)
    })
  })
}

module.exports = {
  standardQuery,
  sql,
  getDistrictSQL,
  getDistrictFips
}
